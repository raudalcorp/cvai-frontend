// app/cv/[id]/translate/page.tsx
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import TranslateClient from '@/components/cv-templates/TranslateClient'

interface Props { params: Promise<{ id: string }> }

export default async function TranslatePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cv, error } = await supabase
    .from('cv_documents')
    .select('id, title, language')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !cv) notFound()

  return <TranslateClient cvId={cv.id} cvTitle={cv.title} currentLanguage={cv.language as 'es' | 'en'} />
}
