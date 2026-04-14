// app/api/jobs/search/route.ts
// BFF — validates auth, enriches with user's CV data, proxies to Railway.

import { createClient } from '@/utils/supabase/server'
import { NextResponse }  from 'next/server'

const RAILWAY_URL = process.env.RAILWAY_API_URL

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as {
    query: string
    location?: string
    country?: string
    page?: number
    cvId?: string    // optional — if provided, fetch CV for affinity scoring
  }

  // If a cvId is provided, load the CV content for affinity scoring
  let cvData = null
  if (body.cvId) {
    const { data: cv } = await supabase
      .from('cv_documents')
      .select('content')
      .eq('id', body.cvId)
      .eq('user_id', user.id)
      .single()
    cvData = cv?.content ?? null
  }

  try {
    const res = await fetch(`${RAILWAY_URL}/jobs/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': process.env.INTERNAL_API_KEY ?? '',
        'x-user-id': user.id,
      },
      body: JSON.stringify({ ...body, cvData }),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('[BFF /jobs/search] Railway error:', text)
      return NextResponse.json({ error: 'Error en la búsqueda.' }, { status: 500 })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[BFF /jobs/search] Network error:', err)
    return NextResponse.json({ error: 'No se pudo conectar con el servidor.' }, { status: 503 })
  }
}
