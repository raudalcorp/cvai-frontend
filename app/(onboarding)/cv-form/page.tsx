export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import CvFormClient from '@/components/cv-form/CvFormClient'
import type { CvFormData } from '@/types/cv'
import { EMPTY_CV_FORM } from '@/types/cv'

interface Props {
  searchParams: Promise<{ id?: string }>
}

export default async function CvFormPage({ searchParams }: Props) {
  const { id } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch profile for email/name defaults
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, job_title, photo_url, contact')
    .eq('id', user.id)
    .single()

  // EDIT mode: load existing cv_document
  let initialData: CvFormData | null = null
  let cvDocumentId: string | null = null
  let cvTitle: string = ''

  if (id) {
    const { data: cv, error } = await supabase
      .from('cv_documents')
      .select('id, title, content')
      .eq('id', id)
      .eq('user_id', user.id)   // RLS — owner only
      .single()

    if (error || !cv) redirect('/dashboard')

    initialData    = cv.content as CvFormData
    cvDocumentId   = cv.id
    cvTitle        = cv.title
  }

  // Profile defaults used when creating from scratch
  const profileDefaults = {
    fullName: profile?.full_name ?? '',
    jobTitle: profile?.job_title ?? '',
    photoUrl: profile?.photo_url ?? null,
    contactEmail: (profile?.contact as { email?: string })?.email ?? user.email ?? '',
  }

  return (
    <CvFormClient
      userId={user.id}
      userEmail={user.email ?? ''}
      profileDefaults={profileDefaults}
      initialData={initialData}
      cvDocumentId={cvDocumentId}
      cvTitle={cvTitle}
      isEditMode={!!id}
    />
  )
}
