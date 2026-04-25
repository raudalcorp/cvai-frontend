export const dynamic = 'force-dynamic'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

const RAILWAY_URL = process.env.RAILWAY_API_URL

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { templateId } = await request.json()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: cv } = await supabase
    .from('cv_documents')
    .select('content, title')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!cv) return NextResponse.json({ error: 'CV no encontrado' }, { status: 404 })

  try {
    const railwayRes = await fetch(`${RAILWAY_URL}/cv/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': process.env.INTERNAL_API_KEY ?? '',
      },
      body: JSON.stringify({ cvData: cv.content, templateId }),
    })

    if (!railwayRes.ok) {
      const text = await railwayRes.text()
      console.error('[download] Railway error:', text.slice(0, 300))
      return NextResponse.json({ error: 'Error al generar el PDF.' }, { status: 500 })
    }

    const contentType = railwayRes.headers.get('content-type') ?? ''
    if (!contentType.includes('application/pdf')) {
      const body = await railwayRes.text()
      console.error('[download] Railway devolvió:', contentType, body.slice(0, 200))
      return NextResponse.json({ error: `Railway no devolvió PDF. Content-Type: ${contentType}` }, { status: 500 })
    }

    const pdfBuffer = await railwayRes.arrayBuffer()
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${cv.title.replace(/\s+/g, '_')}_CV.pdf"`,
      },
    })
  } catch (err) {
    console.error('[download] Network error:', err)
    return NextResponse.json({ error: 'No se pudo conectar con Railway.' }, { status: 503 })
  }
}