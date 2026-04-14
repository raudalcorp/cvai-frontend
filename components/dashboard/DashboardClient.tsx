'use client'

// components/dashboard/DashboardClient.tsx
// UPDATED VERSION — nav removed (handled by AppShell).
// Added quick-action cards and "Buscar empleos" CTA.

import { useState } from 'react'
import Link from 'next/link'

interface DashboardUser {
  id: string; email: string; fullName: string
  jobTitle: string; photoUrl: string | null
}
interface CvDocument {
  id: string; title: string; language: 'es' | 'en'
  status: 'draft' | 'complete' | 'translated'
  created_at: string; updated_at: string
}
interface Props { user: DashboardUser; cvs: CvDocument[] }

const MANUAL_HOURS   = 4
const HOURLY_RATE    = 25
const PLATFORM_HOURS = 0.4

export default function DashboardClient({ user, cvs }: Props) {
  const firstName  = user.fullName.split(' ')[0]
  const savedHours = cvs.length * (MANUAL_HOURS - PLATFORM_HOURS)
  const savedUSD   = Math.round(savedHours * HOURLY_RATE)

  // Most recent complete CV for jobs shortcut
  const completeCv = cvs.find((c) => c.status !== 'draft')

  return (
    <div className="dash-page">

      {/* ── HEADER ──────────────────────────── */}
      <div className="dash-header">
        <div>
          <h1 className="dash-greeting">Hola, <span>{firstName}</span> 👋</h1>
          <p className="dash-role">{user.jobTitle || 'Completa tu perfil'}</p>
        </div>
        <Link href="/cv-form" className="btn-primary dash-new-btn">
          <PlusIcon /> Nuevo CV
        </Link>
      </div>

      {/* ── STATS ───────────────────────────── */}
      <div className="dash-stats-row">
        <StatCard icon={<DocIcon />}    label="CVs creados"      value={String(cvs.length)}                             accent="blue" />
        <StatCard icon={<ClockIcon />}  label="Horas ahorradas"  value={savedHours > 0 ? savedHours.toFixed(1) + 'h' : '—'} accent="green" />
        <StatCard icon={<DollarIcon />} label="Ahorro estimado"  value={savedUSD > 0 ? `$${savedUSD}` : '—'}           accent="amber" sub="tarifa/hora de mercado" />
        <StatCard icon={<GlobeIcon />}  label="Traducciones"     value={String(cvs.filter((c) => c.language === 'en').length)} accent="purple" />
      </div>

      {/* ── QUICK ACTIONS ───────────────────── */}
      <section className="dash-section">
        <h2 className="dash-section-title">Acciones rápidas</h2>
        <div className="quick-actions-grid">
          <QuickAction
            href="/cv-form"
            icon={<PlusCircleIcon />}
            title="Crear nuevo CV"
            desc="Sube un CV existente o créalo desde cero"
            color="blue"
          />
          <QuickAction
            href={completeCv ? `/jobs?cvId=${completeCv.id}` : '/jobs'}
            icon={<BriefcaseIcon />}
            title="Buscar empleos"
            desc="Adzuna · JSearch · Remotive con afinidad IA"
            color="green"
          />
          {cvs.length > 0 && (
            <QuickAction
              href={`/cv/${cvs[0].id}/translate`}
              icon={<GlobeIcon />}
              title="Traducir CV"
              desc={`Traducir "${cvs[0].title}" al ${cvs[0].language === 'es' ? 'inglés' : 'español'}`}
              color="purple"
            />
          )}
        </div>
      </section>

      {/* ── CV LIST ─────────────────────────── */}
      <section className="dash-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">Mis CVs</h2>
          {cvs.length > 0 && (
            <Link href="/cv-form" className="dash-section-link">+ Crear nuevo</Link>
          )}
        </div>
        {cvs.length === 0 ? <EmptyState /> : (
          <div className="cv-grid">
            {cvs.map((cv) => <CvCard key={cv.id} cv={cv} />)}
          </div>
        )}
      </section>

      {/* ── ROI NOTE ────────────────────────── */}
      {cvs.length > 0 && (
        <div className="roi-box">
          <div className="roi-box-icon">💡</div>
          <div>
            <p className="roi-box-title">¿Cómo calculamos tu ahorro?</p>
            <p className="roi-box-sub">
              Crear un CV manualmente toma ~<strong>{MANUAL_HOURS} horas</strong>.
              Con CV.AI lo haces en ~<strong>{PLATFORM_HOURS * 60} minutos</strong>,
              equivalente a <strong>${HOURLY_RATE} USD/hora</strong> de tu tiempo recuperado.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────
function QuickAction({ href, icon, title, desc, color }: {
  href: string; icon: React.ReactNode; title: string; desc: string
  color: 'blue' | 'green' | 'purple'
}) {
  return (
    <Link href={href} className={`quick-action quick-action--${color}`}>
      <div className={`quick-action-icon quick-action-icon--${color}`}>{icon}</div>
      <div>
        <p className="quick-action-title">{title}</p>
        <p className="quick-action-desc">{desc}</p>
      </div>
      <span className="quick-action-arrow">›</span>
    </Link>
  )
}

function StatCard({ icon, label, value, accent, sub }: {
  icon: React.ReactNode; label: string; value: string
  accent: 'blue' | 'green' | 'amber' | 'purple'; sub?: string
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
  const STATUS_LABEL = { draft: 'Borrador', complete: 'Completo', translated: 'Traducido' }
  const STATUS_CLASS = { draft: 'status--draft', complete: 'status--complete', translated: 'status--translated' }

  return (
    <div className="cv-card">
      <div className="cv-card-header">
        <div className="cv-card-icon"><DocIcon /></div>
        <span className={`cv-status ${STATUS_CLASS[cv.status]}`}>{STATUS_LABEL[cv.status]}</span>
      </div>
      <h3 className="cv-card-title">{cv.title || 'CV sin título'}</h3>
      <p className="cv-card-meta">{cv.language === 'en' ? '🇺🇸 English' : '🇪🇸 Español'} · {updatedAt}</p>
      <div className="cv-card-actions">
        <Link href={`/cv-form?id=${cv.id}`}        className="cv-action-btn cv-action-btn--secondary">Editar</Link>
        <Link href={`/cv/${cv.id}/download`}        className="cv-action-btn cv-action-btn--primary">Descargar</Link>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">📄</div>
      <h3 className="empty-state-title">Aún no tienes CVs</h3>
      <p className="empty-state-sub">Crea tu primer CV en minutos.</p>
      <Link href="/onboarding" className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>
        Crear mi primer CV →
      </Link>
    </div>
  )
}

// ── Icons ──────────────────────────────────────────
function PlusIcon()       { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg> }
function DocIcon()        { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M14 2v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg> }
function ClockIcon()      { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function DollarIcon()     { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function GlobeIcon()      { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/><path d="M12 3c-2.5 3-4 5.5-4 9s1.5 6 4 9M12 3c2.5 3 4 5.5 4 9s-1.5 6-4 9M3 12h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function PlusCircleIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" strokeOpacity=".6"/><path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function BriefcaseIcon()  { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M12 12v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> }
