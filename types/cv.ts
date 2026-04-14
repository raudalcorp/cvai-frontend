// ─────────────────────────────────────────────
// CV Form — Domain types
// Used by the multi-step onboarding form and
// the Railway backend for CV generation.
// ─────────────────────────────────────────────

export type Modality = 'presencial' | 'hibrido' | 'remoto'

export type LanguageLevel =
  | 'principiante'
  | 'intermedio'
  | 'profesional'
  | 'nativo'

export interface DateRange {
  startYear: string
  startMonth: string
  endYear: string   // empty string = "Presente"
  endMonth: string  // empty string = "Presente"
}

export interface Experience {
  id: string
  position: string
  company: string
  period: DateRange
  city: string
  country: string
  modality: Modality | ''
  tasks: string
  skills: string[]
}

export interface Education {
  id: string
  institution: string
  degree: string
  startYear: string
  startMonth: string
  endYear: string
  endMonth: string
}

export interface Certification {
  id: string
  title: string
  issuedBy: string
  obtainedYear: string
  obtainedMonth: string
  expiresYear: string  // empty = no expiration
  expiresMonth: string
}

export interface Language {
  id: string
  name: string
  level: LanguageLevel | ''
}

export interface ContactInfo {
  phone: string
  email: string
  city: string
  linkedin: string
  portfolio: string
}

export interface CvFormData {
  // Pre-filled from CV upload or empty
  fullName: string
  jobTitle: string
  summary: string
  photoUrl: string | null
  contact: ContactInfo
  experience: Experience[]
  education: Education[]
  certifications: Certification[]
  languages: Language[]
}

export const EMPTY_CV_FORM: CvFormData = {
  fullName: '',
  jobTitle: '',
  summary: '',
  photoUrl: null,
  contact: {
    phone: '',
    email: '',
    city: '',
    linkedin: '',
    portfolio: '',
  },
  experience: [],
  education: [],
  certifications: [],
  languages: [],
}

export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export const YEARS = Array.from({ length: 30 }, (_, i) =>
  String(new Date().getFullYear() - i)
)
