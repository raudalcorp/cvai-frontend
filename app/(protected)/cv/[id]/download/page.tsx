import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DownloadClient from '@/components/cv-templates/DownloadClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function DownloadPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch CV — RLS guarantees only the owner can access it
  const { data: cv, error } = await supabase
    .from('cv_documents')
    .select('id, title, language, content, status')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !cv) notFound()

  return <DownloadClient cv={cv} />
}
