'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { CvFormData, Experience, Education, Certification, Language, LanguageLevel } from '@/types/cv'
import { EMPTY_CV_FORM, MONTHS, YEARS } from '@/types/cv'
import { nanoid } from 'nanoid'

// ─── Types ────────────────────────────────────────
interface ProfileDefaults {
  fullName: string
  jobTitle: string
  photoUrl: string | null
  contactEmail: string
}

interface Props {
  userId: string
  userEmail: string
  profileDefaults: ProfileDefaults
  initialData: CvFormData | null    // null = create mode
  cvDocumentId: string | null       // null = create mode
  cvTitle: string
  isEditMode: boolean
}

// ─── Helpers ──────────────────────────────────────
const LANGUAGE_LEVELS: { value: LanguageLevel; label: string }[] = [
  { value: 'principiante', label: 'Principiante' },
  { value: 'intermedio',   label: 'Intermedio' },
  { value: 'profesional',  label: 'Profesional' },
  { value: 'nativo',       label: 'Nativo / Fluido' },
]

const STEPS = [
  { id: 1, label: 'Foto' },
  { id: 2, label: 'Contacto' },
  { id: 3, label: 'Experiencia' },
  { id: 4, label: 'Educación' },
  { id: 5, label: 'Certificaciones' },
  { id: 6, label: 'Idiomas' },
]

function newExp(): Experience {
  return { id: nanoid(), position: '', company: '', period: { startYear: '', startMonth: '', endYear: '', endMonth: '' }, city: '', country: '', modality: '', tasks: '', skills: [] }
}
function newEdu(): Education {
  return { id: nanoid(), institution: '', degree: '', startYear: '', startMonth: '', endYear: '', endMonth: '' }
}
function newCert(): Certification {
  return { id: nanoid(), title: '', issuedBy: '', obtainedYear: '', obtainedMonth: '', expiresYear: '', expiresMonth: '' }
}
function newLang(): Language {
  return { id: nanoid(), name: '', level: '' }
}

// Generates a unique CV title — "CV - Gerald Hurtado 02" if base already taken
function buildTitle(baseName: string): string {
  return baseName ? `CV - ${baseName}` : 'Mi CV'
}

// ─── Main Component ───────────────────────────────
export default function CvFormClient({
  userId, userEmail, profileDefaults,
  initialData, cvDocumentId, cvTitle, isEditMode,
}: Props) {
  const router   = useRouter()
  const supabase = createClient()

  const [step, setStep]     = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  // CV title (editable)
  const [title, setTitle] = useState(
    cvTitle || buildTitle(profileDefaults.fullName)
  )

  // Photo upload state
  const [photoFile, setPhotoFile]     = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoUploading, setPhotoUploading] = useState(false)

  // Form data
  const [form, setForm] = useState<CvFormData>(() => {
    if (initialData) return initialData

    // Create mode: start with profile defaults + empty arrays
    return {
      ...EMPTY_CV_FORM,
      fullName: profileDefaults.fullName,
      jobTitle: profileDefaults.jobTitle,
      photoUrl: profileDefaults.photoUrl,
      contact: {
        ...EMPTY_CV_FORM.contact,
        email: profileDefaults.contactEmail,
      },
      experience:     [newExp()],
      education:      [newEdu()],
      certifications: [],
      languages:      [newLang()],
    }
  })

  // Tags input state per experience block
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({})

  // Pre-fill from sessionStorage (CV parsed from upload)
  useEffect(() => {
    if (isEditMode) return  // edit mode uses initialData, skip sessionStorage

    const raw = sessionStorage.getItem('cv_parsed')
    if (!raw) return
    try {
      const parsed: Partial<CvFormData> & { emailFromCv?: string } = JSON.parse(raw)
      setForm((prev) => ({
        ...prev,
        ...parsed,
        contact: {
          ...prev.contact,
          ...(parsed.contact ?? {}),
          // Keep account email if CV email is blank
          email: parsed.emailFromCv || parsed.contact?.email || prev.contact.email,
        },
        experience:     parsed.experience?.length     ? parsed.experience     : [newExp()],
        education:      parsed.education?.length      ? parsed.education      : [newEdu()],
        certifications: parsed.certifications?.length ? parsed.certifications : [],
        languages:      parsed.languages?.length      ? parsed.languages      : [newLang()],
      }))
      if (parsed.fullName) setTitle(buildTitle(parsed.fullName))
    } catch { /* malformed — ignore */ }
  }, [isEditMode])

  // ── Photo handlers ─────────────────────────────
  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setError('La foto no puede superar 2 MB.'); return }
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function uploadPhoto(): Promise<string | null> {
    if (!photoFile) return form.photoUrl

    setPhotoUploading(true)
    const ext  = photoFile.name.split('.').pop() ?? 'jpg'
    const path = `${userId}/avatar.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('avatars')
      .upload(path, photoFile, { upsert: true, contentType: photoFile.type })

    setPhotoUploading(false)

    if (uploadErr) {
      console.error('[photo upload]', uploadErr)
      return form.photoUrl  // fallback to existing
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return data.publicUrl
  }

  // ── Patch helpers ──────────────────────────────
  const patch = useCallback((p: Partial<CvFormData>) => setForm((f) => ({ ...f, ...p })), [])
  const patchContact = useCallback((p: Partial<CvFormData['contact']>) =>
    setForm((f) => ({ ...f, contact: { ...f.contact, ...p } })), [])

  // ── Experience ─────────────────────────────────
  const updateExp  = (id: string, p: Partial<Experience>) =>
    setForm((f) => ({ ...f, experience: f.experience.map((e) => e.id === id ? { ...e, ...p } : e) }))
  const removeExp  = (id: string) =>
    setForm((f) => ({ ...f, experience: f.experience.filter((e) => e.id !== id) }))
  const addSkill   = (expId: string, skill: string) => {
    if (!skill.trim()) return
    setForm((f) => ({ ...f, experience: f.experience.map((e) => e.id === expId ? { ...e, skills: [...e.skills, skill.trim()] } : e) }))
    setTagInputs((t) => ({ ...t, [expId]: '' }))
  }
  const removeSkill = (expId: string, skill: string) =>
    setForm((f) => ({ ...f, experience: f.experience.map((e) => e.id === expId ? { ...e, skills: e.skills.filter((s) => s !== skill) } : e) }))

  // ── Education ──────────────────────────────────
  const updateEdu = (id: string, p: Partial<Education>) =>
    setForm((f) => ({ ...f, education: f.education.map((e) => e.id === id ? { ...e, ...p } : e) }))
  const removeEdu = (id: string) =>
    setForm((f) => ({ ...f, education: f.education.filter((e) => e.id !== id) }))

  // ── Certifications ─────────────────────────────
  const updateCert = (id: string, p: Partial<Certification>) =>
    setForm((f) => ({ ...f, certifications: f.certifications.map((c) => c.id === id ? { ...c, ...p } : c) }))
  const removeCert = (id: string) =>
    setForm((f) => ({ ...f, certifications: f.certifications.filter((c) => c.id !== id) }))

  // ── Languages ──────────────────────────────────
  const updateLang = (id: string, p: Partial<Language>) =>
    setForm((f) => ({ ...f, languages: f.languages.map((l) => l.id === id ? { ...l, ...p } : l) }))
  const removeLang = (id: string) =>
    setForm((f) => ({ ...f, languages: f.languages.filter((l) => l.id !== id) }))

  // ── Title dedup helper ─────────────────────────
  async function resolveTitle(base: string): Promise<string> {
    // Check if a CV with this title already exists for this user
    const { data } = await supabase
      .from('cv_documents')
      .select('title')
      .eq('user_id', userId)
      .ilike('title', `${base}%`)

    if (!data?.length) return base

    // Find highest suffix
    const existing = data.map((d) => d.title)
    if (!existing.includes(base)) return base

    let i = 2
    while (existing.includes(`${base} ${String(i).padStart(2, '0')}`)) i++
    return `${base} ${String(i).padStart(2, '0')}`
  }

  // ── Final submit ───────────────────────────────
  async function handleSubmit() {
    setSaving(true)
    setError(null)

    try {
      // 1. Upload photo if selected
      const finalPhotoUrl = await uploadPhoto()
      const finalForm = { ...form, photoUrl: finalPhotoUrl }

      // 2. Update profile
      await supabase.from('profiles').upsert({
        id:             userId,
        full_name:      finalForm.fullName,
        job_title:      finalForm.jobTitle,
        summary:        finalForm.summary,
        photo_url:      finalPhotoUrl,
        contact:        finalForm.contact,
        experience:     finalForm.experience,
        education:      finalForm.education,
        certifications: finalForm.certifications,
        languages:      finalForm.languages,
        updated_at:     new Date().toISOString(),
      })

      if (isEditMode && cvDocumentId) {
        // 3a. EDIT mode: update existing cv_document
        const { error: upErr } = await supabase
          .from('cv_documents')
          .update({
            title:      title,
            content:    finalForm,
            status:     'complete',
            updated_at: new Date().toISOString(),
          })
          .eq('id', cvDocumentId)
          .eq('user_id', userId)

        if (upErr) throw upErr
      } else {
        // 3b. CREATE mode: insert new cv_document with dedup title
        const finalTitle = await resolveTitle(title || buildTitle(finalForm.fullName))

        const { error: insErr } = await supabase
          .from('cv_documents')
          .insert({
            user_id:  userId,
            title:    finalTitle,
            language: 'es',
            status:   'complete',
            content:  finalForm,
          })

        if (insErr) throw insErr
        sessionStorage.removeItem('cv_parsed')
      }

      router.push('/dashboard')
    } catch (err) {
      console.error('[cv-form submit]', err)
      setError('Error al guardar el CV. Intenta de nuevo.')
      setSaving(false)
    }
  }

  // ── Progress ───────────────────────────────────
  const progress = Math.round(((step - 1) / STEPS.length) * 100)

  return (
    <div className="form-page">

      {/* ── Progress bar ──────────────────── */}
      <div className="form-progress-wrap">
        <div className="form-progress-track">
          <div className="form-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="form-progress-label">
          {isEditMode ? 'Editando CV' : 'Nuevo CV'} · Sección {step} de {STEPS.length}
        </p>
      </div>

      {/* ── Step nav ──────────────────────── */}
      <div className="form-step-nav">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={`form-step-nav-item ${s.id === step ? 'active' : ''} ${s.id < step ? 'done' : ''}`}
          >
            <div className="form-step-nav-dot">{s.id < step ? '✓' : s.id}</div>
            <span className="form-step-nav-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="form-centered">
        <div className="form-card">

          {/* ── CV Title field (always visible) ── */}
          <div className="cv-title-field">
            <span className="field-label">Título del CV</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. CV - Software Engineer 2025"
              className="field-input"
            />
            <p className="field-hint">ℹ️&nbsp; Este nombre aparece en tu dashboard para identificar el CV.</p>
          </div>

          {error && <p className="form-error">{error}</p>}

          {/* ══ STEP 1: PHOTO ══ */}
          {step === 1 && (
            <>
              <SectionHeader number={1} title="Foto de perfil" sub="Una foto profesional aumenta la visibilidad de tu CV" optional />

              <div
                className="photo-drop-zone"
                onClick={() => document.getElementById('photo-input')?.click()}
              >
                {photoPreview || form.photoUrl ? (
                  <img
                    src={photoPreview ?? form.photoUrl ?? ''}
                    alt="Preview"
                    className="photo-preview-img"
                  />
                ) : (
                  <div className="photo-avatar">👤</div>
                )}
                <div>
                  <p className="photo-drop-title">
                    {photoPreview || form.photoUrl ? 'Haz clic para cambiar la foto' : 'Arrastra aquí o haz clic para subir'}
                  </p>
                  <p className="photo-drop-sub">JPG, PNG o WebP · Máx. 2 MB · Recomendado: 400×400 px</p>
                </div>
              </div>
              <input
                id="photo-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoSelect}
              />
              {photoUploading && (
                <div className="autofill" style={{ marginTop: 8 }}>
                  <span className="upload-spinner" />
                  Subiendo foto…
                </div>
              )}
              <div className="tip-box">
                💡 <strong>Consejo:</strong> Fondo neutro, buena iluminación, expresión profesional. Evita selfies o fotos de grupo.
              </div>
              <FormNav
                onBack={() => router.push('/dashboard')}
                backLabel="← Cancelar"
                onNext={() => setStep(2)}
                nextLabel="Continuar → Contacto"
                skipLabel="Omitir foto"
                onSkip={() => setStep(2)}
              />
            </>
          )}

          {/* ══ STEP 2: CONTACT ══ */}
          {step === 2 && (
            <>
              <SectionHeader number={2} title="Datos de contacto" sub="Aparecerán en la cabecera de tu CV" />
              <div className="g2">
                <Field label="Teléfono">
                  <input type="tel" value={form.contact.phone} onChange={(e) => patchContact({ phone: e.target.value })} placeholder="+504 9999-9999" className="field-input" />
                </Field>
                <Field label="Correo electrónico">
                  <input type="email" value={form.contact.email} onChange={(e) => patchContact({ email: e.target.value })} placeholder="tú@ejemplo.com" className="field-input" />
                </Field>
              </div>

              {/* SPLIT: city and country separate */}
              <div className="g2">
                <Field label="Ciudad de residencia">
                  <input type="text" value={form.contact.city?.split(',')[0]?.trim() ?? ''} onChange={(e) => {
                    const country = form.contact.city?.split(',')[1]?.trim() ?? ''
                    patchContact({ city: country ? `${e.target.value}, ${country}` : e.target.value })
                  }} placeholder="Tegucigalpa" className="field-input" />
                </Field>
                <Field label="País">
                  <input type="text" value={form.contact.city?.split(',')[1]?.trim() ?? ''} onChange={(e) => {
                    const city = form.contact.city?.split(',')[0]?.trim() ?? ''
                    patchContact({ city: `${city}, ${e.target.value}` })
                  }} placeholder="Honduras" className="field-input" />
                </Field>
              </div>

              <Field label="LinkedIn">
                <input type="url" value={form.contact.linkedin} onChange={(e) => patchContact({ linkedin: e.target.value })} placeholder="linkedin.com/in/tu-perfil" className="field-input" />
                <p className="field-hint">ℹ️&nbsp; Pega la URL completa de tu perfil de LinkedIn</p>
              </Field>
              <Field label="Portafolio / Sitio web" optional>
                <input type="url" value={form.contact.portfolio} onChange={(e) => patchContact({ portfolio: e.target.value })} placeholder="https://tuportafolio.com" className="field-input" />
              </Field>
              <FormNav onBack={() => setStep(1)} onNext={() => setStep(3)} nextLabel="Continuar → Experiencia" />
            </>
          )}

          {/* ══ STEP 3: EXPERIENCE ══ */}
          {step === 3 && (
            <>
              <SectionHeader number={3} title="Experiencia laboral" sub="Agrega todas las posiciones relevantes" />
              {form.experience.map((exp, idx) => (
                <RepeatBlock key={exp.id} title={`Puesto #${idx + 1}`} onRemove={form.experience.length > 1 ? () => removeExp(exp.id) : undefined}>
                  <div className="g2">
                    <Field label="Puesto / Cargo">
                      <input type="text" value={exp.position} onChange={(e) => updateExp(exp.id, { position: e.target.value })} placeholder="Software Engineer" className="field-input" />
                    </Field>
                    <Field label="Empresa">
                      <input type="text" value={exp.company} onChange={(e) => updateExp(exp.id, { company: e.target.value })} placeholder="Empresa S.A." className="field-input" />
                    </Field>
                  </div>
                  <Field label="Período">
                    <div className="date-range-row">
                      <MonthYearPicker year={exp.period.startYear} month={exp.period.startMonth} onYear={(v) => updateExp(exp.id, { period: { ...exp.period, startYear: v } })} onMonth={(v) => updateExp(exp.id, { period: { ...exp.period, startMonth: v } })} />
                      <span className="date-range-sep">→</span>
                      <MonthYearPicker year={exp.period.endYear} month={exp.period.endMonth} onYear={(v) => updateExp(exp.id, { period: { ...exp.period, endYear: v } })} onMonth={(v) => updateExp(exp.id, { period: { ...exp.period, endMonth: v } })} presentOption />
                    </div>
                  </Field>
                  <Field label="Ubicación">
                    <div className="g3">
                      <input type="text" value={exp.city} onChange={(e) => updateExp(exp.id, { city: e.target.value })} placeholder="Ciudad" className="field-input" />
                      <input type="text" value={exp.country} onChange={(e) => updateExp(exp.id, { country: e.target.value })} placeholder="País" className="field-input" />
                      <select value={exp.modality} onChange={(e) => updateExp(exp.id, { modality: e.target.value as Experience['modality'] })} className="field-input">
                        <option value="">Modalidad</option>
                        <option value="presencial">Presencial</option>
                        <option value="hibrido">Híbrido</option>
                        <option value="remoto">Remoto</option>
                      </select>
                    </div>
                  </Field>
                  <Field label="Tareas desempeñadas">
                    <textarea value={exp.tasks} onChange={(e) => updateExp(exp.id, { tasks: e.target.value })} placeholder={'• Responsabilidades principales\n• Logros cuantificables\n• Tecnologías utilizadas'} className="field-input" rows={4} />
                  </Field>
                  <Field label="Habilidades / Skills">
                    <div className="tags-input-wrap">
                      {exp.skills.map((sk) => (
                        <span key={sk} className="tag-chip">
                          {sk}<button type="button" onClick={() => removeSkill(exp.id, sk)}>×</button>
                        </span>
                      ))}
                      <input
                        className="tag-bare-input"
                        placeholder="Escribe y presiona Enter…"
                        value={tagInputs[exp.id] ?? ''}
                        onChange={(e) => setTagInputs((t) => ({ ...t, [exp.id]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(exp.id, tagInputs[exp.id] ?? '') } }}
                      />
                    </div>
                    <p className="field-hint">ℹ️&nbsp; Escribe un skill y presiona Enter</p>
                  </Field>
                </RepeatBlock>
              ))}
              <button className="add-block-btn" onClick={() => setForm((f) => ({ ...f, experience: [...f.experience, newExp()] }))}>＋ Agregar otra experiencia</button>
              <FormNav onBack={() => setStep(2)} onNext={() => setStep(4)} nextLabel="Continuar → Educación" />
            </>
          )}

          {/* ══ STEP 4: EDUCATION ══ */}
          {step === 4 && (
            <>
              <SectionHeader number={4} title="Educación" sub="Estudios universitarios y formación académica" />
              {form.education.map((edu, idx) => (
                <RepeatBlock key={edu.id} title={`Estudio #${idx + 1}`} onRemove={form.education.length > 1 ? () => removeEdu(edu.id) : undefined}>
                  <Field label="Universidad / Institución">
                    <input type="text" value={edu.institution} onChange={(e) => updateEdu(edu.id, { institution: e.target.value })} placeholder="Universidad Nacional..." className="field-input" />
                  </Field>
                  <Field label="Título obtenido">
                    <input type="text" value={edu.degree} onChange={(e) => updateEdu(edu.id, { degree: e.target.value })} placeholder="Ingeniería en Sistemas..." className="field-input" />
                  </Field>
                  <Field label="Período">
                    <div className="g2">
                      <div>
                        <p className="field-label-sm">Inicio</p>
                        <MonthYearPicker year={edu.startYear} month={edu.startMonth} onYear={(v) => updateEdu(edu.id, { startYear: v })} onMonth={(v) => updateEdu(edu.id, { startMonth: v })} />
                      </div>
                      <div>
                        <p className="field-label-sm">Finalización</p>
                        <MonthYearPicker year={edu.endYear} month={edu.endMonth} onYear={(v) => updateEdu(edu.id, { endYear: v })} onMonth={(v) => updateEdu(edu.id, { endMonth: v })} presentOption />
                      </div>
                    </div>
                  </Field>
                </RepeatBlock>
              ))}
              <button className="add-block-btn" onClick={() => setForm((f) => ({ ...f, education: [...f.education, newEdu()] }))}>＋ Agregar otro estudio</button>
              <FormNav onBack={() => setStep(3)} onNext={() => setStep(5)} nextLabel="Continuar → Certificaciones" />
            </>
          )}

          {/* ══ STEP 5: CERTIFICATIONS ══ */}
          {step === 5 && (
            <>
              <SectionHeader number={5} title="Certificaciones y licencias" sub="Cursos, certificaciones profesionales y acreditaciones" />
              {form.certifications.length === 0 && (
                <p className="empty-section-msg">Aún no has agregado certificaciones.</p>
              )}
              {form.certifications.map((cert, idx) => (
                <RepeatBlock key={cert.id} title={`Certificación #${idx + 1}`} onRemove={() => removeCert(cert.id)}>
                  <Field label="Título">
                    <input type="text" value={cert.title} onChange={(e) => updateCert(cert.id, { title: e.target.value })} placeholder="Ej. Microsoft Certified..." className="field-input" />
                  </Field>
                  <Field label="Avalado por" optional>
                    <input type="text" value={cert.issuedBy} onChange={(e) => updateCert(cert.id, { issuedBy: e.target.value })} placeholder="Ej. Microsoft, Google, AWS…" className="field-input" />
                  </Field>
                  <Field label="Fechas">
                    <div className="g2">
                      <div>
                        <p className="field-label-sm">Obtención</p>
                        <MonthYearPicker year={cert.obtainedYear} month={cert.obtainedMonth} onYear={(v) => updateCert(cert.id, { obtainedYear: v })} onMonth={(v) => updateCert(cert.id, { obtainedMonth: v })} />
                      </div>
                      <div>
                        <p className="field-label-sm">Expiración <span className="badge-optional">Opcional</span></p>
                        <MonthYearPicker year={cert.expiresYear} month={cert.expiresMonth} onYear={(v) => updateCert(cert.id, { expiresYear: v })} onMonth={(v) => updateCert(cert.id, { expiresMonth: v })} presentOption presentLabel="Sin expiración" />
                      </div>
                    </div>
                  </Field>
                </RepeatBlock>
              ))}
              <button className="add-block-btn" onClick={() => setForm((f) => ({ ...f, certifications: [...f.certifications, newCert()] }))}>＋ Agregar certificación</button>
              <FormNav onBack={() => setStep(4)} onNext={() => setStep(6)} nextLabel="Continuar → Idiomas" />
            </>
          )}

          {/* ══ STEP 6: LANGUAGES ══ */}
          {step === 6 && (
            <>
              <SectionHeader number={6} title="Idiomas" sub="Agrega los idiomas que dominas" />
              {form.languages.map((lang, idx) => (
                <RepeatBlock key={lang.id} title={`Idioma #${idx + 1}`} onRemove={form.languages.length > 1 ? () => removeLang(lang.id) : undefined}>
                  <Field label="Lengua">
                    <input type="text" value={lang.name} onChange={(e) => updateLang(lang.id, { name: e.target.value })} placeholder="Ej. Español, Inglés…" className="field-input" />
                  </Field>
                  <Field label="Nivel de dominio">
                    <div className="level-pills">
                      {LANGUAGE_LEVELS.map(({ value, label }) => (
                        <button key={value} type="button" onClick={() => updateLang(lang.id, { level: value })}
                          className={`level-pill ${lang.level === value ? 'level-pill--selected' : ''}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </Field>
                </RepeatBlock>
              ))}
              <button className="add-block-btn" onClick={() => setForm((f) => ({ ...f, languages: [...f.languages, newLang()] }))}>＋ Agregar otro idioma</button>
              <FormNav
                onBack={() => setStep(5)}
                onNext={handleSubmit}
                nextLabel={saving ? 'Guardando…' : isEditMode ? '✓ Guardar cambios' : '✓ Crear CV'}
                disabled={saving}
              />
            </>
          )}

        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────

function SectionHeader({ number, title, sub, optional }: { number: number; title: string; sub: string; optional?: boolean }) {
  return (
    <div className="section-header">
      <div className="section-badge">{number}</div>
      <div>
        <h2 className="section-title">{title}{optional && <span className="badge-optional ml-2">Opcional</span>}</h2>
        {sub && <p className="section-sub">{sub}</p>}
      </div>
    </div>
  )
}

function Field({ label, children, optional }: { label: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <div className="field-group mb-4">
      <span className="field-label">{label}{optional && <span className="badge-optional ml-2">Opcional</span>}</span>
      {children}
    </div>
  )
}

function RepeatBlock({ title, onRemove, children }: { title: string; onRemove?: () => void; children: React.ReactNode }) {
  return (
    <div className="repeat-block">
      <div className="repeat-block-header">
        <span className="repeat-block-title">{title}</span>
        {onRemove && <button type="button" onClick={onRemove} className="repeat-block-remove" aria-label="Eliminar">✕</button>}
      </div>
      {children}
    </div>
  )
}

function MonthYearPicker({ year, month, onYear, onMonth, presentOption, presentLabel = 'Presente' }: {
  year: string; month: string; onYear: (v: string) => void; onMonth: (v: string) => void
  presentOption?: boolean; presentLabel?: string
}) {
  return (
    <div className="flex gap-2">
      <select value={year} onChange={(e) => onYear(e.target.value)} className="field-input">
        {presentOption && <option value="">{presentLabel}</option>}
        {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
      <select value={month} onChange={(e) => onMonth(e.target.value)} className="field-input" disabled={presentOption && !year}>
        {presentOption && !year
          ? <option value="">{presentLabel}</option>
          : MONTHS.map((m) => <option key={m} value={m}>{m}</option>)
        }
      </select>
    </div>
  )
}

function FormNav({ onBack, backLabel = '← Volver', onNext, nextLabel = 'Continuar', skipLabel, onSkip, disabled }: {
  onBack?: () => void; backLabel?: string
  onNext?: () => void; nextLabel?: string
  skipLabel?: string; onSkip?: () => void
  disabled?: boolean
}) {
  return (
    <div className="form-nav">
      <div className="flex gap-2">
        {onBack && <button type="button" onClick={onBack} className="btn-ghost btn-sm">{backLabel}</button>}
        {skipLabel && onSkip && <button type="button" onClick={onSkip} className="btn-ghost btn-sm">{skipLabel}</button>}
      </div>
      {onNext && (
        <button type="button" onClick={onNext} disabled={disabled} className="btn-primary btn-sm">
          {nextLabel}
        </button>
      )}
    </div>
  )
}
