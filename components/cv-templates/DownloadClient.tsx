'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CV_TEMPLATES, type CvTemplate } from './registry'
import type { CvFormData } from '@/types/cv'

interface CvDoc {
  id: string
  title: string
  language: 'es' | 'en'
  content: CvFormData
}

interface Props {
  cv: CvDoc
}

export default function DownloadClient({ cv }: Props) {
  const [selected, setSelected]   = useState<string>('classic')
  const [downloading, setDownloading] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  async function handleDownload() {
    setDownloading(true)
    setError(null)

    try {
      const res = await fetch(`/api/cv/${cv.id}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: selected }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Error al generar el PDF.')
      }

      // Trigger browser download
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `${cv.title.replace(/\s+/g, '_')}_CV.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado.')
    } finally {
      setDownloading(false)
    }
  }

  const selectedTemplate = CV_TEMPLATES.find((t) => t.id === selected)!

  return (
    <div className="dl-root">

      {/* ── NAV ──────────────────────────────── */}
      <nav className="dash-nav">
        <div className="dash-nav-logo">CV<span>.</span>AI</div>
        <Link href="/dashboard" className="dl-back-link">← Volver al dashboard</Link>
      </nav>

      <main className="dl-main">

        {/* ── HEADER ───────────────────────────── */}
        <div className="dl-header">
          <div className="dl-header-label">Selecciona una plantilla</div>
          <h1 className="dl-title">{cv.title}</h1>
          <p className="dl-sub">
            Elige el diseño que mejor represente tu perfil profesional.
            Puedes descargar el mismo CV con distintas plantillas.
          </p>
        </div>

        <div className="dl-layout">

          {/* ── TEMPLATE GRID ────────────────── */}
          <div className="dl-templates">
            {CV_TEMPLATES.map((tpl) => (
              <TemplateCard
                key={tpl.id}
                template={tpl}
                selected={selected === tpl.id}
                onSelect={() => setSelected(tpl.id)}
                cv={cv.content}
              />
            ))}
          </div>

          {/* ── SIDEBAR: actions ─────────────── */}
          <aside className="dl-sidebar">
            <div className="dl-sidebar-card">
              <div className="dl-sidebar-section">
                <p className="dl-sidebar-label">Plantilla seleccionada</p>
                <p className="dl-sidebar-value" style={{ color: selectedTemplate.accent }}>
                  {selectedTemplate.name}
                </p>
              </div>

              <div className="dl-sidebar-section">
                <p className="dl-sidebar-label">Idioma del CV</p>
                <p className="dl-sidebar-value">
                  {cv.language === 'en' ? '🇺🇸 English' : '🇪🇸 Español'}
                </p>
              </div>

              <div className="dl-sidebar-tags">
                {selectedTemplate.tags.map((tag) => (
                  <span key={tag} className="dl-tag">{tag}</span>
                ))}
              </div>

              {error && <p className="dl-error">{error}</p>}

              <button
                onClick={handleDownload}
                disabled={downloading}
                className="btn-primary dl-download-btn"
              >
                {downloading ? (
                  <>
                    <span className="upload-spinner" />
                    Generando PDF…
                  </>
                ) : (
                  <>
                    <DownloadIcon />
                    Descargar CV
                  </>
                )}
              </button>

              <Link
                href={`/cv/${cv.id}/translate`}
                className="dl-translate-link"
              >
                <GlobeIcon />
                Traducir este CV al {cv.language === 'es' ? 'inglés' : 'español'}
              </Link>
            </div>
          </aside>

        </div>
      </main>
    </div>
  )
}

// ─── Template Card ─────────────────────────────────
function TemplateCard({
  template, selected, onSelect, cv,
}: {
  template: CvTemplate
  selected: boolean
  onSelect: () => void
  cv: CvFormData
}) {
  return (
    <button
      onClick={onSelect}
      className={`tpl-card ${selected ? 'tpl-card--selected' : ''}`}
      style={selected ? { borderColor: template.accent, boxShadow: `0 0 0 2px ${template.accent}33` } : {}}
    >
      {/* Mini CV preview */}
      <div className={`tpl-preview tpl-preview--${template.layout}`}>
        {template.layout === 'split' && (
          <div className="tpl-sidebar-strip" style={{ background: template.accent }} />
        )}
        <div className="tpl-preview-content">
          {/* Name bar */}
          <div className="tpl-preview-name" style={{ background: template.layout === 'single' ? template.accent : '#e2e8f0' }} />
          {/* Sub */}
          <div className="tpl-preview-sub" />
          {/* Section blocks */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="tpl-preview-section">
              <div className="tpl-preview-heading" style={{ background: `${template.accent}55` }} />
              <div className="tpl-preview-line" />
              <div className="tpl-preview-line tpl-preview-line--short" />
            </div>
          ))}
        </div>
      </div>

      {/* Label */}
      <div className="tpl-card-footer">
        <div className="tpl-card-info">
          <p className="tpl-card-name">{template.name}</p>
          <p className="tpl-card-desc">{template.description}</p>
        </div>
        {selected && (
          <span className="tpl-check" style={{ background: template.accent }}>✓</span>
        )}
      </div>
    </button>
  )
}

// ─── Icons ─────────────────────────────────────────
function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 3v13M7 11l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 3c-2.5 3-4 5.5-4 9s1.5 6 4 9M12 3c2.5 3 4 5.5 4 9s-1.5 6-4 9M3 12h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
