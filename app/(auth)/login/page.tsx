'use client'

// app/(auth)/login/page.tsx
// IMPORTANTE: force-dynamic evita que Next.js intente prerender esta página
// en build time, lo que causaría el error de Supabase en Vercel/Railway.
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function LoginPage() {
  const supabase = createClient()
  const router   = useRouter()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      setError('Correo o contraseña incorrectos.')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()
      router.push(profile ? '/dashboard' : '/onboarding')
    }
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <div className="auth-centered">
      <div className="auth-card">
        <h1 className="auth-title">Inicia sesión</h1>
        <p className="auth-sub">Bienvenido de vuelta a CV.AI</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="field-group">
            <label className="field-label" htmlFor="email">Correo electrónico</label>
            <input id="email" type="email" required placeholder="tú@ejemplo.com"
              value={email} onChange={(e) => setEmail(e.target.value)} className="field-input" />
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="password">Contraseña</label>
            <input id="password" type="password" required placeholder="Tu contraseña"
              value={password} onChange={(e) => setPassword(e.target.value)} className="field-input" />
            <div className="flex justify-end mt-1">
              <Link href="/forgot-password" className="auth-link" style={{ fontSize: '0.75rem' }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary mt-1">
            {loading ? 'Iniciando sesión…' : 'Iniciar sesión →'}
          </button>
        </form>

        <div className="auth-divider"><span>o continúa con</span></div>

        <button onClick={handleGoogle} className="btn-google">
          <GoogleIcon />
          Continuar con Google
        </button>

        <p className="auth-footer-text">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="auth-link">Crear cuenta</Link>
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}
