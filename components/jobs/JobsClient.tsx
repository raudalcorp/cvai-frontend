'use client'

import { useState } from 'react'
import Link from 'next/link'

interface CvOption { id: string; title: string; language: string }
interface JobItem {
  id: string; title: string; company: string; location: string
  description: string; url: string; salary?: string; postedAt?: string
  remote: boolean; source: string
  affinityScore?: number; affinityReason?: string
}
interface SearchResult {
  jobs: JobItem[]; total: number; source: string; hasAffinity: boolean
}

const SOURCE_LABEL: Record<string, string> = {
  adzuna:   'Adzuna', jsearch: 'JSearch', remotive: 'Remotive',
}
const SOURCE_COLOR: Record<string, string> = {
  adzuna: '#3b82f6', jsearch: '#6366f1', remotive: '#22c55e',
}

function affinityColor(score: number): string {
  if (score >= 75) return '#22c55e'
  if (score >= 50) return '#f59e0b'
  return '#94a3b8'
}

export default function JobsClient({ cvs }: { cvs: CvOption[] }) {
  const [query,    setQuery]    = useState('')
  const [location, setLocation] = useState('')
  const [country,  setCountry]  = useState('hn')
  const [selectedCvId, setSelectedCvId] = useState(cvs[0]?.id ?? '')
  const [useAffinity, setUseAffinity]   = useState(cvs.length > 0)

  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState<SearchResult | null>(null)
  const [error,    setError]    = useState<string | null>(null)
  const [page,     setPage]     = useState(1)

  async function handleSearch(p = 1) {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    if (p === 1) setResult(null)

    try {
      const res = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query, location, country, page: p,
          cvId: useAffinity && selectedCvId ? selectedCvId : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error en la búsqueda.')
      setResult(data)
      setPage(p)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-root">
      <nav className="dash-nav">
        <div className="dash-nav-logo">CV<span>.</span>AI</div>
        <Link href="/dashboard" className="dl-back-link">← Dashboard</Link>
      </nav>

      <main className="jobs-main">
        <div className="jobs-header">
          <div className="dl-header-label">Búsqueda inteligente</div>
          <h1 className="dl-title">Ofertas de empleo</h1>
          <p className="dl-sub">
            Busca en Adzuna, JSearch y Remotive simultáneamente.
            Activa la afinidad para que la IA clasifique las ofertas según tu CV.
          </p>
        </div>

        {/* ── SEARCH FORM ────────────── */}
        <div className="jobs-search-box">
          <div className="jobs-search-row">
            <div className="jobs-field jobs-field--grow">
              <span className="field-label">Búsqueda</span>
              <input
                type="text"
                className="field-input"
                placeholder="Software Engineer, AI Developer…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(1)}
              />
            </div>
            <div className="jobs-field">
              <span className="field-label">Ciudad / País</span>
              <input
                type="text"
                className="field-input"
                placeholder="Tegucigalpa, Remote…"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="jobs-field">
              <span className="field-label">País (código)</span>
              <select className="field-input" value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value="hn">Honduras (hn)</option>
                <option value="us">USA (us)</option>
                <option value="mx">México (mx)</option>
                <option value="gb">Reino Unido (gb)</option>
                <option value="ca">Canadá (ca)</option>
              </select>
            </div>
          </div>

          {/* Affinity toggle */}
          {cvs.length > 0 && (
            <div className="jobs-affinity-row">
              <label className="jobs-toggle-label">
                <button
                  type="button"
                  onClick={() => setUseAffinity((v) => !v)}
                  className={`jobs-toggle ${useAffinity ? 'jobs-toggle--on' : ''}`}
                  aria-pressed={useAffinity}
                >
                  <span className="jobs-toggle-thumb" />
                </button>
                <span>Activar puntuación de afinidad con IA</span>
              </label>

              {useAffinity && (
                <select
                  className="field-input jobs-cv-select"
                  value={selectedCvId}
                  onChange={(e) => setSelectedCvId(e.target.value)}
                >
                  {cvs.map((cv) => (
                    <option key={cv.id} value={cv.id}>
                      {cv.title} ({cv.language.toUpperCase()})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <button
            className="btn-primary"
            onClick={() => handleSearch(1)}
            disabled={loading || !query.trim()}
            style={{ marginTop: 4 }}
          >
            {loading ? (
              <><span className="upload-spinner" /> Buscando…</>
            ) : (
              <><SearchIcon /> Buscar empleos</>
            )}
          </button>
        </div>

        {error && <div className="dl-error" style={{ marginBottom: 16 }}>{error}</div>}

        {/* ── RESULTS ────────────────── */}
        {result && (
          <div className="jobs-results">
            <div className="jobs-results-header">
              <p className="jobs-results-meta">
                {result.total > 0 ? `${result.total.toLocaleString()} resultados` : 'Sin resultados'}
                {' · '}Fuente: <strong>{result.source}</strong>
                {result.hasAffinity && ' · ✨ Con afinidad de IA'}
              </p>
            </div>

            {result.jobs.length === 0 && (
              <div className="empty-state" style={{ border: '1px solid var(--color-border)' }}>
                <div className="empty-state-icon">🔍</div>
                <h3 className="empty-state-title">Sin resultados</h3>
                <p className="empty-state-sub">Intenta con términos más generales o cambia el país.</p>
              </div>
            )}

            <div className="jobs-list">
              {result.jobs.map((job) => (
                <JobCard key={job.id} job={job} hasAffinity={result.hasAffinity} />
              ))}
            </div>

            {result.jobs.length >= 10 && (
              <div className="jobs-pagination">
                {page > 1 && (
                  <button className="btn-ghost btn-sm" onClick={() => handleSearch(page - 1)}>
                    ← Anterior
                  </button>
                )}
                <span className="jobs-page-info">Página {page}</span>
                <button className="btn-ghost btn-sm" onClick={() => handleSearch(page + 1)}>
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// ─── Job Card ──────────────────────────────────────
function JobCard({ job, hasAffinity }: { job: JobItem; hasAffinity: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const postedDate = job.postedAt
    ? new Date(job.postedAt).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' })
    : null

  return (
    <div className="job-card">
      <div className="job-card-top">
        <div className="job-card-info">
          <div className="job-card-title-row">
            <h3 className="job-card-title">{job.title}</h3>
            {job.remote && <span className="job-badge job-badge--remote">Remoto</span>}
          </div>
          <p className="job-card-company">{job.company}</p>
          <p className="job-card-meta">
            {job.location}
            {job.salary   && <> · <span style={{ color: '#22c55e' }}>{job.salary}</span></>}
            {postedDate    && <> · {postedDate}</>}
            {' · '}
            <span style={{ color: SOURCE_COLOR[job.source] ?? '#64748b', fontWeight: 600 }}>
              {SOURCE_LABEL[job.source] ?? job.source}
            </span>
          </p>
        </div>

        {hasAffinity && job.affinityScore !== undefined && (
          <div className="job-affinity-badge" style={{ borderColor: affinityColor(job.affinityScore) }}>
            <span className="job-affinity-score" style={{ color: affinityColor(job.affinityScore) }}>
              {job.affinityScore}
            </span>
            <span className="job-affinity-label">afinidad</span>
          </div>
        )}
      </div>

      {hasAffinity && job.affinityReason && (
        <p className="job-affinity-reason">✨ {job.affinityReason}</p>
      )}

      {expanded && (
        <p className="job-description">
          {job.description.slice(0, 600)}{job.description.length > 600 ? '…' : ''}
        </p>
      )}

      <div className="job-card-actions">
        <button
          className="btn-ghost btn-sm"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Ocultar descripción' : 'Ver descripción'}
        </button>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="cv-action-btn cv-action-btn--primary btn-sm"
          style={{ textDecoration: 'none' }}
        >
          Aplicar →
        </a>
      </div>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
