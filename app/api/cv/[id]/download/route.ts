import { createClient } from '@/utils/supabase/server'
import { NextResponse }  from 'next/server'

const RAILWAY_URL = process.env.RAILWAY_API_URL

interface Params { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // RLS: solo el dueño puede acceder
  const { data: cv } = await supabase
    .from('cv_documents')
    .select('content, language, title')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!cv) return NextResponse.json({ error: 'CV no encontrado.' }, { status: 404 })

  const from = cv.language as 'es' | 'en'
  const to   = from === 'es' ? 'en' : 'es'

  try {
    // 1. Llamar a Railway para traducir
    const railwayRes = await fetch(`${RAILWAY_URL}/cv/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': process.env.INTERNAL_API_KEY ?? '',
        'x-user-id': user.id,
      },
      body: JSON.stringify({ cvData: cv.content, from, to }),
    })

    if (!railwayRes.ok) {
      const text = await railwayRes.text()
      console.error('[translate BFF] Railway error:', text)
      return NextResponse.json({ error: 'Error en la traducción.' }, { status: 500 })
    }

    const translatedData = await railwayRes.json()

    // 2. Guardar el CV traducido como nuevo documento
    const { data: newCv, error: insertError } = await supabase
      .from('cv_documents')
      .insert({
        user_id:  user.id,
        title:    `${cv.title} (${to.toUpperCase()})`,
        language: to,
        status:   'translated',
        content:  translatedData,
      })
      .select('id')
      .single()

    if (insertError) throw insertError

    return NextResponse.json({ newCvId: newCv.id, language: to })
  } catch (err) {
    console.error('[translate BFF] Error:', err)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
