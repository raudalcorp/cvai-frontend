// app/dashboard/page.tsx
// Server Component — fetches user + profile server-side (no loading flash)

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Middleware (proxy.ts) should catch this, but defensive check
  if (!user) redirect('/login')

  // Fetch profile — if none exists yet, send to onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  // Fetch all CVs for this user (ordered newest first)
  const { data: cvs } = await supabase
    .from('cv_documents')
    .select('id, title, language, status, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return (
    <DashboardClient
      user={{
        id: user.id,
        email: user.email ?? '',
        fullName: profile.full_name ?? '',
        jobTitle: profile.job_title ?? '',
        photoUrl: profile.photo_url ?? null,
      }}
      cvs={cvs ?? []}
    />
  )
}
