// app/auth/callback/route.ts
// Supabase calls this URL after Google OAuth completes.
// It exchanges the code for a session and redirects the user.

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // 'next' allows deep-linking after login (e.g. /dashboard/settings)
  const next = searchParams.get('next') ?? '/onboarding'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if the user already has a profile (not first login)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        // First login → onboarding; returning user → dashboard
        const redirectTo = profile ? '/dashboard' : '/onboarding'
        return NextResponse.redirect(`${origin}${redirectTo}`)
      }
    }
  }

  // Something went wrong — redirect with error
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
}
