'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

// ─── Types ────────────────────────────────────────
interface DashboardUser {
  id: string
  email: string
  fullName: string
  jobTitle: string
  photoUrl: string | null
}

interface CvDocument {
  id: string
  title: string
  language: 'es' | 'en'
  status: 'draft' | 'complete' | 'translated'
  created_at: string
  updated_at: string
}

interface Props {
  user: DashboardUser
  cvs: CvDocument[]
}

// ─── ROI constants ────────────────────────────────
const MANUAL_HOURS = 4       // average hours to create a CV manually
const HOURLY_RATE_USD = 25   // average market hourly rate
const PLATFORM_HOURS = 0.4   // average time using CV.AI

// ─────────────────────────────────────────────────
export default function DashboardClient({ user, cvs }: Props) {
  const router  = useRouter()
  const supabase = createClient()
  const [signingOut, setSigningOut] = useState(false)

  const savedHours = cvs.length * (MANUAL_HOURS - PLATFORM_HOURS)
  const savedUSD   = Math.round(savedHours * HOURLY_RATE_USD)

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  const firstName = user.fullName.split(' ')[0]

  return (
    <div className="dashboard-root">

      {/* ── TOP NAV ──────────────────────────── */}
      <nav className="dash-nav">
        <div className="dash-nav-logo">CV<span>.</span>AI</div>
        <div className="dash-nav-right">
          <div className="dash-user-chip">
            <div className="dash-avatar">
              {user.photoUrl
                ? <img src={user.photoUrl} alt={user.fullName} />
                : <span>{firstName[0]?.toUpperCase()}</span>}
            </div>
            <span className="dash-user-name">{firstName}</span>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="dash-signout-btn"
          >
            {signingOut ? '…' : 'Cerrar sesión'}
          </button>
        </div>
      </nav>

      <main className="dash-main">

        {/* ── HEADER ───────────────────────────── */}
        <div className="dash-header">
          <div>
            <h1 className="dash-greeting">
              Hola, <span>{firstName}</span> 👋
            </h1>
            <p className="dash-role">{user.jobTitle || 'Completa tu perfil para ver tu cargo'}</p>
          </div>
          <Link href="/cv-form" className="btn-primary dash-new-btn">
            <PlusIcon />
            Nuevo CV
          </Link>
        </div>

        {/* ── STATS ROW ────────────────────────── */}
        <div className="dash-stats-row">
          <StatCard
            icon={<DocumentIcon />}
            label="CVs creados"
            value={String(cvs.length)}
            accent="blue"
          />
          <StatCard
            icon={<ClockIcon />}
            label="Horas ahorradas"
            value={savedHours > 0 ? savedHours.toFixed(1) + 'h' : '—'}
            accent="green"
          />
          <StatCard
            icon={<DollarIcon />}
            label="Ahorro estimado"
            value={savedUSD > 0 ? `$${savedUSD}` : '—'}
            accent="amber"
            sub="basado en tarifa/hora de mercado"
          />
          <StatCard
            icon={<GlobeIcon />}
            label="Traducciones"
            value={String(cvs.filter((c) => c.language === 'en').length)}
            accent="purple"
          />
        </div>

        {/* ── CV LIST ──────────────────────────── */}
        <section className="dash-section">
          <div className="dash-section-header">
            <h2 className="dash-section-title">Mis CVs</h2>
            {cvs.length > 0 && (
              <Link href="/cv-form" className="dash-section-link">
                + Crear nuevo
              </Link>
            )}
          </div>

          {cvs.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="cv-grid">
              {cvs.map((cv) => (
                <CvCard key={cv.id} cv={cv} />
              ))}
            </div>
          )}
        </section>

        {/* ── ROI EXPLANATION ──────────────────── */}
        {cvs.length > 0 && (
          <section className="roi-box">
            <div className="roi-box-icon">💡</div>
            <div>
              <p className="roi-box-title">¿Cómo calculamos tu ahorro?</p>
              <p className="roi-box-sub">
                Un profesional tarda en promedio <strong>{MANUAL_HOURS} horas</strong> en crear un CV desde cero.
                Con CV.AI lo haces en <strong>~{PLATFORM_HOURS * 60} minutos</strong>.
                Eso equivale a <strong>${HOURLY_RATE_USD} USD/hora</strong> de tu tiempo recuperado.
              </p>
            </div>
          </section>
        )}

      </main>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────

function StatCard({ icon, label, value, accent, sub }: {
  icon: React.ReactNode
  label: string
  value: string
  accent: 'blue' | 'green' | 'amber' | 'purple'
  sub?: string
}) {
  return (
    <div className={`stat-card stat-card--${accent}`}>
      <div className={`stat-card-icon stat-card-icon--${accent}`}>{icon}</div>
      <div>
        <p className="stat-card-value">{value}</p>
        <p className="stat-card-label">{label}</p>
        {sub && <p className="stat-card-sub">{sub}</p>}
      </div>
    </div>
  )
}

function CvCard({ cv }: { cv: CvDocument }) {
  const updatedAt = new Date(cv.updated_at).toLocaleDateString('es-HN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  const statusLabel: Record<CvDocument['status'], string> = {
    draft:      'Borrador',
    complete:   'Completo',
    translated: 'Traducido',
  }

  const statusColor: Record<CvDocument['status'], string> = {
    draft:      'status--draft',
    complete:   'status--complete',
    translated: 'status--translated',
  }

  return (
    <div className="cv-card">
      <div className="cv-card-header">
        <div className="cv-card-icon">
          <DocumentIcon />
        </div>
        <span className={`cv-status ${statusColor[cv.status]}`}>
          {statusLabel[cv.status]}
        </span>
      </div>
      <h3 className="cv-card-title">{cv.title || 'CV sin título'}</h3>
      <p className="cv-card-meta">
        {cv.language === 'en' ? '🇺🇸 English' : '🇪🇸 Español'} · Editado {updatedAt}
      </p>
      <div className="cv-card-actions">
        <Link href={`/cv-form?id=${cv.id}`} className="cv-action-btn cv-action-btn--secondary">
          Editar
        </Link>
        <Link href={`/cv/${cv.id}/download`} className="cv-action-btn cv-action-btn--primary">
          Descargar
        </Link>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">📄</div>
      <h3 className="empty-state-title">Aún no tienes CVs</h3>
      <p className="empty-state-sub">
        Crea tu primer CV en minutos — sube uno existente o créalo desde cero.
      </p>
      <Link href="/onboarding" className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>
        Crear mi primer CV →
      </Link>
    </div>
  )
}

// ─── Icons (inline SVG — no lucide brands) ────────
function PlusIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
}
function DocumentIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M14 2v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
}
function ClockIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
}
function DollarIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
}
function GlobeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/><path d="M12 3c-2.5 3-4 5.5-4 9s1.5 6 4 9M12 3c2.5 3 4 5.5 4 9s-1.5 6-4 9M3 12h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
}
