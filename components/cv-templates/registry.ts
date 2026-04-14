// Template registry — add new templates here as they are built.
// templateId must match what Railway's PDF generator expects.

export interface CvTemplate {
  id: string
  name: string
  description: string
  accent: string          // hex color for preview badge
  layout: 'single' | 'split'
  tags: string[]
}

export const CV_TEMPLATES: CvTemplate[] = [
  {
    id: 'classic',
    name: 'Clásico',
    description: 'Diseño limpio de una columna. Ideal para roles corporativos y empresas tradicionales.',
    accent: '#3b82f6',
    layout: 'single',
    tags: ['Corporativo', 'ATS-friendly', 'Una columna'],
  },
  {
    id: 'modern',
    name: 'Moderno',
    description: 'Barra lateral de color con datos de contacto. Destaca en industrias creativas y tech.',
    accent: '#6366f1',
    layout: 'split',
    tags: ['Tech', 'Creativo', 'Dos columnas'],
  },
  {
    id: 'minimal',
    name: 'Minimalista',
    description: 'Tipografía limpia, sin colores distractores. Perfecto para roles ejecutivos y académicos.',
    accent: '#64748b',
    layout: 'single',
    tags: ['Ejecutivo', 'Académico', 'Sin color'],
  },
]
