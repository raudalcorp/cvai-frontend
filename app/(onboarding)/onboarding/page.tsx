'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useRef, useState } from 'react'

type UploadMode = 'pdf' | 'docx'

export default function OnboardingPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [userName, setUserName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const pdfRef  = useRef<HTMLInputElement>(null)
  const docxRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) {
        // Use first name only
        setUserName(user.user_metadata.full_name.split(' ')[0])
      }
    })
  }, [supabase])

  // ── Send CV file to Railway for parsing ───────
  async function handleFileUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    mode: UploadMode
  ) {
    const file = e.target.files?.[0]
    if (!file) return

    const maxMB = 5
    if (file.size > maxMB * 1024 * 1024) {
      setUploadError(`El archivo supera el tamaño máximo de ${maxMB} MB.`)
      return
    }

    setUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', mode)

      // Route Handler as BFF — calls Railway internally
      const res = await fetch('/api/cv/parse', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Error al procesar el archivo.')

      const parsed = await res.json()

      // Store parsed data in sessionStorage so cv-form can pre-fill
      sessionStorage.setItem('cv_parsed', JSON.stringify(parsed))
      router.push('/cv-form')
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error inesperado.')
    } finally {
      setUploading(false)
    }
  }

  function handleScratch() {
    sessionStorage.removeItem('cv_parsed')
    router.push('/cv-form')
  }

  return (
    <div className="auth-centered">
      <div className="auth-card" style={{ maxWidth: '560px' }}>
        <h2 className="auth-title">
          {userName ? `¡Bienvenido, ${userName}! 👋` : '¡Bienvenido! 👋'}
        </h2>
        <p className="auth-sub">¿Cómo quieres comenzar tu CV?</p>

        {uploadError && (
          <p className="auth-error mb-4">{uploadError}</p>
        )}

        {uploading && (
          <div className="upload-processing">
            <span className="upload-spinner" />
            Analizando tu CV con IA…
          </div>
        )}

        {!uploading && (
          <div className="flex flex-col gap-3 mb-4">
            {/* PDF */}
            <button
              className="upload-option upload-option--pdf"
              onClick={() => pdfRef.current?.click()}
            >
              <span className="upload-option__icon upload-option__icon--pdf">
                <PdfIcon />
              </span>
              <span className="upload-option__text">
                <strong>Subir CV en PDF</strong>
                <span>Extraeremos y completaremos tu formulario automáticamente</span>
              </span>
              <span className="upload-option__arrow">›</span>
            </button>
            <input
              ref={pdfRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => handleFileUpload(e, 'pdf')}
            />

            {/* DOCX */}
            <button
              className="upload-option upload-option--docx"
              onClick={() => docxRef.current?.click()}
            >
              <span className="upload-option__icon upload-option__icon--docx">
                <DocxIcon />
              </span>
              <span className="upload-option__text">
                <strong>Subir CV en Word (.docx)</strong>
                <span>Soporte completo para documentos de Microsoft Word</span>
              </span>
              <span className="upload-option__arrow">›</span>
            </button>
            <input
              ref={docxRef}
              type="file"
              accept=".docx"
              className="hidden"
              onChange={(e) => handleFileUpload(e, 'docx')}
            />

            {/* From scratch */}
            <button
              className="upload-option upload-option--scratch"
              onClick={handleScratch}
            >
              <span className="upload-option__icon upload-option__icon--scratch">
                <PlusCircleIcon />
              </span>
              <span className="upload-option__text">
                <strong>Crear desde cero</strong>
                <span>Completa el formulario sección por sección con ayuda de IA</span>
              </span>
              <span className="upload-option__arrow">›</span>
            </button>
          </div>
        )}

        <p className="text-xs text-center" style={{ color: 'var(--color-muted)' }}>
          Formatos aceptados: PDF y DOCX &nbsp;·&nbsp; Tamaño máx. 5 MB
        </p>
      </div>
    </div>
  )
}

// ── Icons ────────────────────────────────────────
function PdfIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="2" width="16" height="20" rx="2" fill="#ef4444" fillOpacity=".15" stroke="#ef4444" strokeWidth="1.5"/>
      <path d="M14 2v4h4" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8 12h8M8 16h5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
      <text x="6.5" y="9.5" fontSize="4" fill="#ef4444" fontWeight="800" fontFamily="sans-serif">PDF</text>
    </svg>
  )
}

function DocxIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="2" width="16" height="20" rx="2" fill="#3b82f6" fillOpacity=".15" stroke="#3b82f6" strokeWidth="1.5"/>
      <path d="M14 2v4h4" stroke="#3b82f6" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8 12h8M8 16h5" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
      <text x="5" y="9.5" fontSize="3.6" fill="#3b82f6" fontWeight="800" fontFamily="sans-serif">DOCX</text>
    </svg>
  )
}

function PlusCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#22c55e" strokeWidth="1.5" strokeOpacity=".5"/>
      <path d="M12 7v10M7 12h10" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
