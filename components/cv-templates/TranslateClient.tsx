'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Props {
  cvId: string
  cvTitle: string
  currentLanguage: 'es' | 'en'
}

const LANG_LABEL: Record<'es' | 'en', string> = { es: 'Español 🇪🇸', en: 'English 🇺🇸' }

export default function TranslateClient({ cvId, cvTitle, currentLanguage }: Props) {
  const router = useRouter()
  const targetLanguage: 'es' | 'en' = currentLanguage === 'es' ? 'en' : 'es'

  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [newCvId, setNewCvId] = useState<string | null>(null)

  async function handleTranslate() {
    setStatus('loading')
    setErrorMsg(null)

    try {
      const res = await fetch(`/api/cv/${cvId}/translate`, { method: 'POST' })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error ?? 'Error al traducir.')

      setNewCvId(data.newCvId)
      setStatus('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error inesperado.')
      setStatus('error')
    }
  }

  return (
    <div className="dashboard-root">
      <nav className="dash-nav">
        <div className="dash-nav-logo">CV<span>.</span>AI</div>
        <Link href="/dashboard" className="dl-back-link">← Volver al dashboard</Link>
      </nav>

      <main className="dl-main" style={{ maxWidth: 640 }}>

        {/* ── HEADER ─── */}
        <div className="dl-header">
          <div className="dl-header-label">Traducción de CV</div>
          <h1 className="dl-title">{cvTitle}</h1>
          <p className="dl-sub">
            Crea una versión de tu CV traducida al{' '}
            <strong>{LANG_LABEL[targetLanguage]}</strong>.
            Se guardará como un nuevo documento — tu CV original no se modifica.
          </p>
        </div>

        {/* ── LANGUAGE CARD ─── */}
        <div className="translate-card">
          <div className="translate-lang-row">
            <div className="translate-lang-box">
              <span className="translate-lang-label">Original</span>
              <span className="translate-lang-value">{LANG_LABEL[currentLanguage]}</span>
            </div>
            <div className="translate-arrow">→</div>
            <div className="translate-lang-box translate-lang-box--target">
              <span className="translate-lang-label">Traducción</span>
              <span className="translate-lang-value">{LANG_LABEL[targetLanguage]}</span>
            </div>
          </div>

          {/* What gets translated */}
          <div className="translate-scope">
            <p className="translate-scope-title">¿Qué se traduce?</p>
            <div className="translate-scope-grid">
              {[
                { icon: '✅', label: 'Resumen profesional' },
                { icon: '✅', label: 'Puestos de trabajo' },
                { icon: '✅', label: 'Tareas desempeñadas' },
                { icon: '✅', label: 'Títulos de educación' },
                { icon: '✅', label: 'Certificaciones' },
                { icon: '✅', label: 'Nivel de idiomas' },
                { icon: '⛔', label: 'Nombres de empresas' },
                { icon: '⛔', label: 'Nombres de personas' },
                { icon: '⛔', label: 'URLs y contacto' },
                { icon: '⛔', label: 'Skills técnicos' },
              ].map(({ icon, label }) => (
                <div key={label} className="translate-scope-item">
                  <span>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── STATUS ─── */}
        {status === 'error' && (
          <div className="dl-error" style={{ marginBottom: 16 }}>{errorMsg}</div>
        )}

        {status === 'done' && newCvId && (
          <div className="translate-success">
            <span>🎉</span>
            <div>
              <p className="translate-success-title">¡Traducción completada!</p>
              <p className="translate-success-sub">
                Tu CV en {LANG_LABEL[targetLanguage]} fue guardado en tu dashboard.
              </p>
            </div>
            <div className="flex gap-2 mt-3" style={{ flexDirection: 'column' }}>
              <Link
                href={`/cv/${newCvId}/download`}
                className="btn-primary"
                style={{ padding: '10px 20px', width: 'auto' }}
              >
                Descargar CV traducido →
              </Link>
              <Link
                href="/dashboard"
                className="btn-ghost btn-sm"
              >
                Volver al dashboard
              </Link>
            </div>
          </div>
        )}

        {status !== 'done' && (
          <button
            onClick={handleTranslate}
            disabled={status === 'loading'}
            className="btn-primary"
            style={{ marginTop: 8 }}
          >
            {status === 'loading' ? (
              <>
                <span className="upload-spinner" />
                Traduciendo con IA… puede tomar 15–30 segundos
              </>
            ) : (
              `Traducir al ${LANG_LABEL[targetLanguage]} →`
            )}
          </button>
        )}

      </main>
    </div>
  )
}
