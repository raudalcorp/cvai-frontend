'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

interface Props {
  children: React.ReactNode
  user: {
    fullName: string
    jobTitle?: string
    photoUrl?: string | null
    email: string
  }
}

export default function AppShell({ children, user }: Props) {
  const pathname   = usePathname()
  const router     = useRouter()
  const supabase   = createClient()
  const [menuOpen, setMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const firstName = user.fullName?.split(' ')[0] || user.email.split('@')[0]

  const NAV_ITEMS: NavItem[] = [
    { href: '/dashboard', label: 'Inicio',          icon: <HomeIcon /> },
    { href: '/cv-form',   label: 'Nuevo CV',         icon: <PlusIcon /> },
    { href: '/jobs',      label: 'Buscar empleos',   icon: <SearchIcon /> },
  ]

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="shell-root">

      {/* ── SIDEBAR (desktop) ──────────────────── */}
      <aside className="shell-sidebar">
        <div className="shell-logo">CV<span>.</span>AI</div>

        <nav className="shell-nav">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shell-nav-item ${active ? 'shell-nav-item--active' : ''}`}
              >
                <span className="shell-nav-icon">{item.icon}</span>
                <span className="shell-nav-label">{item.label}</span>
                {active && <span className="shell-nav-dot" />}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="shell-user">
          <div className="shell-user-avatar">
            {user.photoUrl
              ? <img src={user.photoUrl} alt={firstName} />
              : <span>{firstName[0]?.toUpperCase()}</span>}
          </div>
          <div className="shell-user-info">
            <p className="shell-user-name">{firstName}</p>
            <p className="shell-user-role">{user.jobTitle || 'Mi perfil'}</p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="shell-signout"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <SignOutIcon />
          </button>
        </div>
      </aside>

      {/* ── TOP BAR (mobile) ───────────────────── */}
      <header className="shell-topbar">
        <div className="shell-logo">CV<span>.</span>AI</div>
        <button
          className="shell-menu-btn"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="shell-mobile-menu" onClick={() => setMenuOpen(false)}>
          <div className="shell-mobile-nav" onClick={(e) => e.stopPropagation()}>
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shell-nav-item ${active ? 'shell-nav-item--active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="shell-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
            <button
              onClick={handleSignOut}
              className="shell-nav-item"
              style={{ color: '#fca5a5', marginTop: 8, width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <span className="shell-nav-icon"><SignOutIcon /></span>
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ───────────────────────── */}
      <main className="shell-content">
        {children}
      </main>

    </div>
  )
}

// ── Icons ──────────────────────────────────────────
function HomeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 12L12 3l9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function PlusIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
}
function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/><path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
}
function SignOutIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function MenuIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
}
function CloseIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
}
