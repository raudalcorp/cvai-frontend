// app/(protected)/layout.tsx
// Server Component — fetches user once for the entire protected area,
// passes it to AppShell so the sidebar always has current data.

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AppShell from '@/components/layout/AppShell'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, job_title, photo_url')
    .eq('id', user.id)
    .single()

  return (
    <AppShell
      user={{
        fullName: profile?.full_name ?? '',
        jobTitle: profile?.job_title ?? '',
        photoUrl: profile?.photo_url ?? null,
        email:    user.email ?? '',
      }}
    >
      {children}
    </AppShell>
  )
}
