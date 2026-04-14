// app/jobs/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import JobsClient from '@/components/jobs/JobsClient'

export default async function JobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Load user's completed CVs for the affinity selector
  const { data: cvs } = await supabase
    .from('cv_documents')
    .select('id, title, language')
    .eq('user_id', user.id)
    .in('status', ['complete', 'translated'])
    .order('updated_at', { ascending: false })

  return <JobsClient cvs={cvs ?? []} />
}
