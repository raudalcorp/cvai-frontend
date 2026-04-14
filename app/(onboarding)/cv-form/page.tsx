'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { CvFormData, Experience, Education, Certification, Language, LanguageLevel } from '@/types/cv'
import { EMPTY_CV_FORM, MONTHS, YEARS } from '@/types/cv'
import { nanoid } from 'nanoid'

// ─── Steps ───────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Foto de perfil', sub: 'Opcional' },
  { id: 2, label: 'Contacto',       sub: '' },
  { id: 3, label: 'Experiencia',    sub: '' },
  { id: 4, label: 'Educación',      sub: '' },
  { id: 5, label: 'Certificaciones',sub: '' },
  { id: 6, label: 'Idiomas',        sub: '' },
]

const LANGUAGE_LEVELS: { value: LanguageLevel; label: string }[] = [
  { value: 'principiante', label: 'Principiante' },
  { value: 'intermedio',   label: 'Intermedio' },
  { value: 'profesional',  label: 'Profesional' },
  { value: 'nativo',       label: 'Nativo / Fluido' },
]

// ─── Helpers ─────────────────────────────────────
function newExperience(): Experience {
  return { id: nanoid(), position: '', company: '', period: { startYear: '', startMonth: '', endYear: '', endMonth: '' }, city: '', country: '', modality: '', tasks: '', skills: [] }
}
function newEducation(): Education {
  return { id: nanoid(), institution: '', degree: '', startYear: '', startMonth: '', endYear: '', endMonth: '' }
}
function newCertification(): Certification {
  return { id: nanoid(), title: '', issuedBy: '', obtainedYear: '', obtainedMonth: '', expiresYear: '', expiresMonth: '' }
}
function newLanguage(): Language {
  return { id: nanoid(), name: '', level: '' }
}

// ─── Main component ───────────────────────────────
export default function CvFormPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [step, setStep]             = useState(1)
  const [form, setForm]             = useState<CvFormData>(EMPTY_CV_FORM)
  const [emailConflict, setEmailConflict] = useState<{ cvEmail: string; accountEmail: string } | null>(null)
  const [saving, setSaving]         = useState(false)
  const [tagInputs, setTagInputs]   = useState<Record<string, string>>({})

  // ── Pre-fill from parsed CV ────────────────────
  useEffect(() => {
    const raw = sessionStorage.getItem('cv_parsed')
    if (!raw) return

    try {
      const parsed: Partial<CvFormData> & { emailFromCv?: string } = JSON.parse(raw)

      supabase.auth.getUser().then(({ data: { user } }) => {
        const accountEmail = user?.email ?? ''
        const cvEmail      = parsed.emailFromCv ?? ''

        if (cvEmail && cvEmail !== accountEmail) {
          setEmailConflict({ cvEmail, accountEmail })
          // Default to CV email
          parsed.contact = { ...parsed.contact!, email: cvEmail }
        }

        setForm((prev) => ({
          ...prev,
          ...parsed,
          experience:     parsed.experience?.length     ? parsed.experience     : [newExperience()],
          education:      parsed.education?.length      ? parsed.education      : [newEducation()],
          certifications: parsed.certifications?.length ? parsed.certifications : [],
          languages:      parsed.languages?.length      ? parsed.languages      : [newLanguage()],
        }))
      })
    } catch {
      // malformed — start blank
      setForm({ ...EMPTY_CV_FORM, experience: [newExperience()], education: [newEducation()], languages: [newLanguage()] })
    }
  }, [supabase])

  // ── Patch helpers ──────────────────────────────
  const patch = useCallback((partial: Partial<CvFormData>) =>
    setForm((f) => ({ ...f, ...partial })), [])

  const patchContact = useCallback((partial: Partial<CvFormData['contact']>) =>
    setForm((f) => ({ ...f, contact: { ...f.contact, ...partial } })), [])

  // ── Experience ─────────────────────────────────
  function updateExp(id: string, partial: Partial<Experience>) {
    setForm((f) => ({ ...f, experience: f.experience.map((e) => e.id === id ? { ...e, ...partial } : e) }))
  }
  function removeExp(id: string) {
    setForm((f) => ({ ...f, experience: f.experience.filter((e) => e.id !== id) }))
  }
  function addSkillToExp(expId: string, skill: string) {
    if (!skill.trim()) return
    setForm((f) => ({
      ...f,
      experience: f.experience.map((e) =>
        e.id === expId ? { ...e, skills: [...e.skills, skill.trim()] } : e
      ),
    }))
    setTagInputs((t) => ({ ...t, [expId]: '' }))
  }
  function removeSkillFromExp(expId: string, skill: string) {
    setForm((f) => ({
      ...f,
      experience: f.experience.map((e) =>
        e.id === expId ? { ...e, skills: e.skills.filter((s) => s !== skill) } : e
      ),
    }))
  }

  // ── Education ──────────────────────────────────
  function updateEdu(id: string, partial: Partial<Education>) {
    setForm((f) => ({ ...f, education: f.education.map((e) => e.id === id ? { ...e, ...partial } : e) }))
  }
  function removeEdu(id: string) {
    setForm((f) => ({ ...f, education: f.education.filter((e) => e.id !== id) }))
  }

  // ── Certifications ─────────────────────────────
  function updateCert(id: string, partial: Partial<Certification>) {
    setForm((f) => ({ ...f, certifications: f.certifications.map((c) => c.id === id ? { ...c, ...partial } : c) }))
  }
  function removeCert(id: string) {
    setForm((f) => ({ ...f, certifications: f.certifications.filter((c) => c.id !== id) }))
  }

  // ── Languages ──────────────────────────────────
  function updateLang(id: string, partial: Partial<Language>) {
    setForm((f) => ({ ...f, languages: f.languages.map((l) => l.id === id ? { ...l, ...partial } : l) }))
  }
  function removeLang(id: string) {
    setForm((f) => ({ ...f, languages: f.languages.filter((l) => l.id !== id) }))
  }

  // ── Final submit ───────────────────────────────
  async function handleSubmit() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // Upsert profile in Supabase
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name:   form.fullName,
      job_title:   form.jobTitle,
      summary:     form.summary,
      photo_url:   form.photoUrl,
      contact:     form.contact,
      experience:  form.experience,
      education:   form.education,
      certifications: form.certifications,
      languages:   form.languages,
      updated_at:  new Date().toISOString(),
    })

    setSaving(false)
    if (!error) {
      sessionStorage.removeItem('cv_parsed')
      router.push('/dashboard')
    }
  }

  // ── Progress ───────────────────────────────────
  const progress = Math.round(((step - 1) / STEPS.length) * 100)

  return (
    <div className="form-page">
      {/* Progress bar */}
      <div className="form-progress-wrap">
        <div className="form-progress-track">
          <div className="form-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="form-progress-label">Sección {step} de {STEPS.length}</p>
      </div>

      {/* Step nav */}
      <div className="form-step-nav">
        {STEPS.map((s) => (
          <div key={s.id} className={`form-step-nav-item ${s.id === step ? 'active' : ''} ${s.id < step ? 'done' : ''}`}>
            <div className="form-step-nav-dot">{s.id < step ? '✓' : s.id}</div>
            <span className="form-step-nav-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="form-centered">
        <div className="form-card">

          {/* ══ STEP 1: PHOTO ══ */}
          {step === 1 && (
            <>
              <SectionHeader number={1} title="Foto de perfil" sub="Una foto profesional aumenta la visibilidad de tu CV" optional />
              <div className="photo-drop-zone">
                <div className="photo-avatar">👤</div>
                <div>
                  <p className="photo-drop-title">Arrastra aquí o haz clic para subir</p>
                  <p className="photo-drop-sub">JPG, PNG o WebP · Máx. 2 MB · Recomendado: 400×400 px</p>
                </div>
              </div>
              <div className="tip-box">
                💡 <strong>Consejo:</strong> Fondo neutro, buena iluminación, expresión profesional. Evita selfies o fotos de grupo.
              </div>
              <FormNav
                onBack={() => router.push('/onboarding')}
                backLabel="← Volver"
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

              {/* Email conflict banner */}
              {emailConflict && (
                <div className="conflict-banner">
                  <p>⚠️ El email en tu CV es diferente al de tu cuenta. ¿Cuál deseas usar?</p>
                  <div className="flex flex-col gap-2 mt-2">
                    {[
                      { email: emailConflict.cvEmail,      tag: 'Del CV',       tagClass: 'tag-new' },
                      { email: emailConflict.accountEmail, tag: 'De tu cuenta', tagClass: 'tag-old' },
                    ].map(({ email, tag, tagClass }) => (
                      <button
                        key={email}
                        onClick={() => patchContact({ email })}
                        className={`email-choice ${form.contact.email === email ? 'email-choice--selected' : ''}`}
                      >
                        <span>{email}</span>
                        <span className={`email-tag ${tagClass}`}>{tag}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid-2">
                <Field label="Teléfono">
                  <input type="tel" value={form.contact.phone} onChange={(e) => patchContact({ phone: e.target.value })} placeholder="+504 9999-9999" className="field-input" />
                </Field>
                <Field label="Correo electrónico">
                  <input type="email" value={form.contact.email} onChange={(e) => patchContact({ email: e.target.value })} placeholder="tú@ejemplo.com" className="field-input" />
                </Field>
              </div>

              <Field label="Ciudad de residencia">
                <input type="text" value={form.contact.city} onChange={(e) => patchContact({ city: e.target.value })} placeholder="Tegucigalpa, Honduras" className="field-input" />
              </Field>

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
                <RepeatBlock
                  key={exp.id}
                  title={`Puesto #${idx + 1}`}
                  onRemove={form.experience.length > 1 ? () => removeExp(exp.id) : undefined}
                >
                  <div className="grid-2">
                    <Field label="Puesto / Cargo">
                      <input type="text" value={exp.position} onChange={(e) => updateExp(exp.id, { position: e.target.value })} placeholder="Ej. Software Engineer" className="field-input" />
                    </Field>
                    <Field label="Empresa">
                      <input type="text" value={exp.company} onChange={(e) => updateExp(exp.id, { company: e.target.value })} placeholder="Nombre de la empresa" className="field-input" />
                    </Field>
                  </div>

                  <Field label="Período">
                    <div className="date-range-row">
                      <div className="date-range-col">
                        <MonthYearPicker
                          year={exp.period.startYear} month={exp.period.startMonth}
                          onYear={(v) => updateExp(exp.id, { period: { ...exp.period, startYear: v } })}
                          onMonth={(v) => updateExp(exp.id, { period: { ...exp.period, startMonth: v } })}
                        />
                      </div>
                      <span className="date-range-sep">→</span>
                      <div className="date-range-col">
                        <MonthYearPicker
                          year={exp.period.endYear} month={exp.period.endMonth}
                          onYear={(v) => updateExp(exp.id, { period: { ...exp.period, endYear: v } })}
                          onMonth={(v) => updateExp(exp.id, { period: { ...exp.period, endMonth: v } })}
                          presentOption
                        />
                      </div>
                    </div>
                  </Field>

                  <Field label="Ubicación">
                    <div className="grid-3">
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
                    <textarea value={exp.tasks} onChange={(e) => updateExp(exp.id, { tasks: e.target.value })} placeholder={'• Responsabilidades principales\n• Logros cuantificables (aumenté X en Y%)\n• Tecnologías utilizadas'} className="field-input" rows={4} />
                  </Field>

                  <Field label="Habilidades / Skills">
                    <div className="tags-input-wrap">
                      {exp.skills.map((skill) => (
                        <span key={skill} className="tag-chip">
                          {skill}
                          <button type="button" onClick={() => removeSkillFromExp(exp.id, skill)}>×</button>
                        </span>
                      ))}
                      <input
                        className="tag-bare-input"
                        placeholder="Escribe y presiona Enter…"
                        value={tagInputs[exp.id] ?? ''}
                        onChange={(e) => setTagInputs((t) => ({ ...t, [exp.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addSkillToExp(exp.id, tagInputs[exp.id] ?? '')
                          }
                        }}
                      />
                    </div>
                    <p className="field-hint">ℹ️&nbsp; Escribe un skill y presiona Enter para agregar</p>
                  </Field>
                </RepeatBlock>
              ))}

              <button className="add-block-btn" onClick={() => setForm((f) => ({ ...f, experience: [...f.experience, newExperience()] }))}>
                ＋ Agregar otra experiencia
              </button>

              <FormNav onBack={() => setStep(2)} onNext={() => setStep(4)} nextLabel="Continuar → Educación" />
            </>
          )}

          {/* ══ STEP 4: EDUCATION ══ */}
          {step === 4 && (
            <>
              <SectionHeader number={4} title="Educación" sub="Estudios universitarios y formación académica" />

              {form.education.map((edu, idx) => (
                <RepeatBlock
                  key={edu.id}
                  title={`Estudio #${idx + 1}`}
                  onRemove={form.education.length > 1 ? () => removeEdu(edu.id) : undefined}
                >
                  <Field label="Universidad / Institución">
                    <input type="text" value={edu.institution} onChange={(e) => updateEdu(edu.id, { institution: e.target.value })} placeholder="Universidad Nacional..." className="field-input" />
                  </Field>
                  <Field label="Título obtenido">
                    <input type="text" value={edu.degree} onChange={(e) => updateEdu(edu.id, { degree: e.target.value })} placeholder="Ingeniería en Sistemas..." className="field-input" />
                  </Field>
                  <Field label="Período">
                    <div className="grid-2">
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

              <button className="add-block-btn" onClick={() => setForm((f) => ({ ...f, education: [...f.education, newEducation()] }))}>
                ＋ Agregar otro estudio
              </button>

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
                    <div className="grid-2">
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

              <button className="add-block-btn" onClick={() => setForm((f) => ({ ...f, certifications: [...f.certifications, newCertification()] }))}>
                ＋ Agregar certificación
              </button>

              <FormNav onBack={() => setStep(4)} onNext={() => setStep(6)} nextLabel="Continuar → Idiomas" />
            </>
          )}

          {/* ══ STEP 6: LANGUAGES ══ */}
          {step === 6 && (
            <>
              <SectionHeader number={6} title="Idiomas" sub="Agrega los idiomas que dominas" />

              {form.languages.map((lang, idx) => (
                <RepeatBlock
                  key={lang.id}
                  title={`Idioma #${idx + 1}`}
                  onRemove={form.languages.length > 1 ? () => removeLang(lang.id) : undefined}
                >
                  <Field label="Lengua">
                    <input type="text" value={lang.name} onChange={(e) => updateLang(lang.id, { name: e.target.value })} placeholder="Ej. Español, Inglés…" className="field-input" />
                  </Field>
                  <Field label="Nivel de dominio">
                    <div className="level-pills">
                      {LANGUAGE_LEVELS.map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => updateLang(lang.id, { level: value })}
                          className={`level-pill ${lang.level === value ? 'level-pill--selected' : ''}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </Field>
                </RepeatBlock>
              ))}

              <button className="add-block-btn" onClick={() => setForm((f) => ({ ...f, languages: [...f.languages, newLanguage()] }))}>
                ＋ Agregar otro idioma
              </button>

              <FormNav
                onBack={() => setStep(5)}
                onNext={handleSubmit}
                nextLabel={saving ? 'Guardando…' : '✓ Finalizar formulario'}
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
        <h2 className="section-title">
          {title}
          {optional && <span className="badge-optional ml-2">Opcional</span>}
        </h2>
        {sub && <p className="section-sub">{sub}</p>}
      </div>
    </div>
  )
}

function Field({ label, children, optional }: { label: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <div className="field-group mb-4">
      <span className="field-label">
        {label}
        {optional && <span className="badge-optional ml-2">Opcional</span>}
      </span>
      {children}
    </div>
  )
}

function RepeatBlock({ title, onRemove, children }: { title: string; onRemove?: () => void; children: React.ReactNode }) {
  return (
    <div className="repeat-block">
      <div className="repeat-block-header">
        <span className="repeat-block-title">{title}</span>
        {onRemove && (
          <button type="button" onClick={onRemove} className="repeat-block-remove" aria-label="Eliminar">✕</button>
        )}
      </div>
      {children}
    </div>
  )
}

function MonthYearPicker({ year, month, onYear, onMonth, presentOption, presentLabel = 'Presente' }: {
  year: string; month: string; onYear: (v: string) => void; onMonth: (v: string) => void;
  presentOption?: boolean; presentLabel?: string;
}) {
  return (
    <div className="flex gap-2">
      <select value={year} onChange={(e) => onYear(e.target.value)} className="field-input">
        {presentOption && <option value="">{presentLabel}</option>}
        {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
      <select value={month} onChange={(e) => onMonth(e.target.value)} className="field-input" disabled={presentOption && !year}>
        {presentOption && year === '' ? (
          <option value="">{presentLabel}</option>
        ) : (
          MONTHS.map((m) => <option key={m} value={m}>{m}</option>)
        )}
      </select>
    </div>
  )
}

function FormNav({ onBack, backLabel = '← Volver', onNext, nextLabel = 'Continuar', skipLabel, onSkip, disabled }: {
  onBack?: () => void; backLabel?: string;
  onNext?: () => void; nextLabel?: string;
  skipLabel?: string; onSkip?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="form-nav">
      <div className="flex gap-2">
        {onBack && (
          <button type="button" onClick={onBack} className="btn-ghost btn-sm">{backLabel}</button>
        )}
        {skipLabel && onSkip && (
          <button type="button" onClick={onSkip} className="btn-ghost btn-sm">{skipLabel}</button>
        )}
      </div>
      {onNext && (
        <button type="button" onClick={onNext} disabled={disabled} className="btn-primary btn-sm">
          {nextLabel}
        </button>
      )}
    </div>
  )
}
