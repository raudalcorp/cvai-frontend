// app/(protected)/layout.tsx
//
// Este es un layout ANIDADO — no reemplaza app/layout.tsx.
// Next.js los apila: app/layout.tsx → (protected)/layout.tsx → page.tsx
//
// Solo agrega AppShell (sidebar + nav) a las rutas protegidas.
// NO contiene <html> ni <body>.

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
