// app/api/cv/parse/route.ts
// BFF Route Handler — receives the CV file from the browser,
// forwards it to the Railway Node.js service for parsing,
// and returns the structured CvFormData JSON.

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// Railway service URL stored in env (never exposed to browser)
const RAILWAY_URL = process.env.RAILWAY_API_URL

export async function POST(request: Request) {
  // 1. Verify the user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Forward the multipart form to Railway
  const formData = await request.formData()

  try {
    const railwayRes = await fetch(`${RAILWAY_URL}/cv/parse`, {
      method: 'POST',
      headers: {
        // Internal service auth — Railway service validates this header
        'x-internal-key': process.env.INTERNAL_API_KEY ?? '',
        'x-user-id': user.id,
      },
      body: formData,
    })

    if (!railwayRes.ok) {
      const text = await railwayRes.text()
      console.error('[cv/parse] Railway error:', text)
      return NextResponse.json(
        { error: 'Error al procesar el archivo en el servidor.' },
        { status: 500 }
      )
    }

    const parsed = await railwayRes.json()
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('[cv/parse] Network error:', err)
    return NextResponse.json(
      { error: 'No se pudo conectar con el servidor de procesamiento.' },
      { status: 503 }
    )
  }
}
