# CV.AI — Frontend

**Plataforma web de inteligencia artificial para optimización de CVs y búsqueda de empleo.**

Live: [cvai-frontend.vercel.app](https://cvai-frontend.vercel.app) &nbsp;·&nbsp; Backend: [cvai-api](https://github.com/raudalcorp/cvai-api)

---

## ¿Qué hace?

CV.AI procesa CVs en PDF o DOCX con IA, valida y optimiza el contenido, genera versiones en español e inglés, y compara tu perfil contra ofertas reales de empleo usando un score de afinidad.

```
Sube PDF/DOCX → IA extrae y estructura → Formulario pre-llenado
      ↓
Edita secciones → Elige plantilla → Descarga PDF profesional
      ↓
Traduce al inglés → Busca empleos → Score de afinidad por oferta
```

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, Server Components) |
| Estilos | Tailwind CSS v4 (CSS-first, sin tailwind.config.ts) |
| Auth | Supabase Auth — Google OAuth + email/password |
| Base de datos | Supabase PostgreSQL con RLS |
| Protección de rutas | `proxy.ts` (reemplaza middleware.ts en Next.js 16) |
| Deploy | Vercel |
| Backend | [cvai-api](https://github.com/raudalcorp/cvai-api) en Railway |
| Lenguaje | TypeScript 5 / React 19 |

### Arquitectura BFF (Backend for Frontend)
Next.js actúa únicamente como capa de presentación y proxy. Toda la lógica de negocio, parseo de archivos y llamadas a IA viven en `cvai-api` (Express + Node.js en Railway). Las Route Handlers de Next.js (`app/api/`) reenvían las peticiones al backend con autenticación interna.

```
Browser → Next.js (Vercel)
              ↓ Route Handler (BFF)
         Railway API → AI Provider → Supabase
```

---

## Estructura

```
app/
├── (auth)/          # login, register — rutas públicas
├── (protected)/     # layout con AppShell (sidebar + nav)
│   ├── dashboard/   # inicio con stats ROI y lista de CVs
│   ├── cv-form/     # formulario multi-step (crear y editar)
│   ├── cv/[id]/
│   │   ├── download/   # selector de plantilla + descarga PDF
│   │   └── translate/  # traducción ES↔EN con IA
│   └── jobs/        # búsqueda de empleos con afinidad IA
├── api/
│   ├── cv/parse/    # BFF → Railway: parseo de PDF/DOCX
│   ├── cv/[id]/download/   # BFF → Railway: generación PDF
│   ├── cv/[id]/translate/  # BFF → Railway: traducción
│   └── jobs/search/        # BFF → Railway: búsqueda empleos
├── auth/callback/   # handler OAuth Supabase
└── onboarding/      # primera visita: elegir PDF/DOCX/scratch
components/
├── layout/AppShell.tsx      # sidebar + nav persistente
├── dashboard/               # cards, stats, modales
└── cv-templates/            # selector de plantillas, traducción
utils/supabase/
├── client.ts    # cliente browser (use client)
└── server.ts    # cliente server (Server Components / Route Handlers)
types/cv.ts      # tipos del dominio CvFormData
proxy.ts         # protección de rutas (rutas protegidas → /login)
```

---

## Providers de IA (multi-proveedor con fallback)

El sistema detecta automáticamente el provider disponible en Railway:

```
Groq → Gemini → Anthropic (Claude) → OpenAI → Azure OpenAI
```

Diseñado para migrar a **Azure OpenAI Service** en Fase 2 sin cambios de código.

---

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
RAILWAY_API_URL=
INTERNAL_API_KEY=
NEXT_PUBLIC_APP_URL=
```

---

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completar variables
npm run dev
```

Requiere `cvai-api` corriendo localmente en el puerto configurado en `RAILWAY_API_URL`.

---

## Roadmap

| Fase | Estado |
|---|---|
| Fase 1 — MVP (auth, upload CV, download PDF, traducción, búsqueda empleos) | ✅ En producción |
| Fase 2 — Azure Container Apps, pgvector RAG, Microsoft Entra ID, n8n automation | 🔜 Planificado |

---

## Autor

**Gerald Hurtado** — [LinkedIn](https://linkedin.com/in/gerald-hurtado) · [GitHub](https://github.com/raudalcorp)
