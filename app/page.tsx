import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Bot, Globe, Search, ArrowRight, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "CV.AI — Tu CV potenciado con inteligencia artificial",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen w-full bg-cvai-bg">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <StatsSection />
      <CTABanner />
      <Footer />
    </main>
  );
}

/* ─────────────────────────────────────────
   NAVBAR
───────────────────────────────────────── */
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 w-full border-b border-cvai-border bg-cvai-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cvai-indigo font-syne text-xs font-bold text-white">
            CV
          </div>
          <span className="font-syne text-[17px] font-bold text-cvai-text1">
            .AI
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm text-cvai-text2 transition-colors hover:text-cvai-text1"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-cvai-indigo px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cvai-indigo-light"
          >
            Comenzar gratis
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ─────────────────────────────────────────
   HERO
───────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative z-10 flex min-h-[90vh] w-full flex-col items-center justify-center px-6 pb-0 pt-32 text-center">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center">

        {/* Badge */}
        <div className="mb-9 inline-flex animate-fade-in-up items-center gap-4 text-sm">
          <Link
            href="/architecture"
            className="inline-flex items-center gap-1.5 rounded-full border border-cvai-indigo/30 bg-cvai-indigo-dim px-3 py-1.5 text-cvai-indigo-light no-underline transition-colors hover:bg-cvai-indigo/20"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cvai-indigo-light" />
            Architecture diagram
          </Link>
          <Link
            href="https://github.com/raudalcorp"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-full border border-cvai-indigo/30 bg-cvai-indigo-dim px-3 py-1.5 text-cvai-indigo-light no-underline transition-colors hover:bg-cvai-indigo/20"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cvai-indigo-light" />
            GitHub
          </Link>
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up animate-delay-100 mb-6 font-syne text-[clamp(46px,7vw,82px)] font-extrabold leading-[1.1] tracking-[-2px] text-cvai-text1">
          Tu CV, al nivel
          <br />
          <span className="text-cvai-indigo-light">que mereces</span>
        </h1>

        {/* Subtext */}
        <p className="animate-fade-in-up animate-delay-200 mb-11 max-w-[560px] text-[clamp(16px,2vw,20px)] leading-relaxed text-cvai-text2">
          Sube o crea tu CV desde cero, la IA lo optimiza en el idioma que
          prefieras, descarga y aplica.
        </p>

        {/* CTAs */}
        <div className="animate-fade-in-up animate-delay-300 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="flex items-center gap-2 rounded-xl bg-cvai-indigo px-8 py-4 font-syne text-lg font-medium text-white transition-colors hover:bg-cvai-indigo-light"
          >
            Comenzar gratis
            <ArrowRight size={18} />
          </Link>
          <Link
            href="#como-funciona"
            className="flex items-center gap-2 rounded-xl border border-cvai-border2 px-8 py-4 text-lg text-cvai-text2 transition-colors hover:border-white/20 hover:text-cvai-text1"
          >
            Ver cómo funciona
            <ChevronRight size={18} />
          </Link>
        </div>

        {/* Terminal mockup */}
        <TerminalMockup />
      </div>
    </section>
  );
}

function TerminalMockup() {
  return (
    <div className="mt-16 w-full max-w-2xl overflow-hidden rounded-2xl border border-cvai-border bg-cvai-bg2">
      {/* Bar */}
      <div className="flex items-center gap-2 border-b border-cvai-border bg-cvai-bg3 px-4 py-3">
        <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
        <span className="ml-2 font-mono text-xs text-cvai-text3">
          cv.ai — procesando Gerald_Hurtado_CV.pdf
        </span>
      </div>

      {/* Body */}
      <div className="space-y-1 px-6 py-5 font-mono text-[13px] leading-loose">
        <p>
          <span className="text-cvai-text3">$ </span>
          <span className="text-blue-400">cvai</span>{" "}
          <span className="text-cvai-text1">upload</span>{" "}
          <span className="text-amber-400">Gerald_Hurtado_CV.pdf</span>
        </p>
        <p>
          <span className="text-green-400">✓ </span>
          <span className="text-cvai-text3">Archivo recibido — extrayendo texto...</span>
        </p>
        <p>
          <span className="text-green-400">✓ </span>
          <span className="text-cvai-text3">Validando estructura y formato del CV...</span>
        </p>
        <p>
          <span className="text-cvai-indigo-light">→ </span>
          <span className="text-cvai-text3">Azure OpenAI procesando </span>
          <span className="text-cvai-text1">3 secciones con mejoras</span>
        </p>
        <p>
          <span className="text-green-400">✓ </span>
          <span className="text-cvai-text3">Traducción ES → EN completada </span>
          <span className="text-cvai-text3">(0.8s · $0.002)</span>
        </p>
        <p>
          <span className="text-green-400">✓ </span>
          <span className="text-cvai-text3">Afinidad con 12 ofertas activas encontrada</span>
        </p>
        <p>
          <span className="text-green-400">✓ </span>
          <span className="text-cvai-text3">CV listo en </span>
          <span className="text-amber-400">PDF</span>
          <span className="text-cvai-text3"> y </span>
          <span className="text-amber-400">DOCX</span>
          <span className="animate-blink ml-0.5 inline-block h-3.5 w-2 rounded-sm bg-cvai-indigo/70 align-middle" />
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   FEATURES
───────────────────────────────────────── */
const features = [
  {
    icon: <FileText size={22} />,
    iconClass: "bg-cvai-indigo-dim text-cvai-indigo-light",
    title: "Subir PDF o DOCX",
    description:
      "Extracción automática de texto con pdf-parse y mammoth.js. Soporta cualquier formato de CV.",
    tag: "Railway API",
    tagClass: "bg-cvai-indigo-dim text-cvai-indigo-light",
  },
  {
    icon: <Bot size={22} />,
    iconClass: "bg-teal-900/40 text-teal-300",
    title: "Validación con IA",
    description:
      "Azure OpenAI revisa estructura, contexto y datos. Claude Haiku corrige formato y consistencia.",
    tag: "Azure OpenAI · Claude",
    tagClass: "bg-teal-900/40 text-teal-300",
  },
  {
    icon: <Globe size={22} />,
    iconClass: "bg-amber-900/30 text-amber-300",
    title: "Traducción ES ↔ EN",
    description:
      "Traducción bidireccional de alta calidad. Versiones guardadas en Supabase para acceso rápido.",
    tag: "Azure OpenAI · Supabase",
    tagClass: "bg-amber-900/30 text-amber-300",
  },
  {
    icon: <Search size={22} />,
    iconClass: "bg-emerald-900/30 text-emerald-300",
    title: "Búsqueda de Ofertas",
    description:
      "Ofertas validadas por IA. Verifica vigencia, enlace activo y afinidad real con tu perfil.",
    tag: "Adzuna API · AI Match",
    tagClass: "bg-emerald-900/30 text-emerald-300",
  },
];

function FeaturesSection() {
  return (
    <section className="relative z-10 w-full pt-10 pb-20">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-cvai-indigo-light">
          Funcionalidades
        </p>
        <h2 className="mb-3 font-syne text-[clamp(28px,3.5vw,40px)] font-bold text-cvai-text1">
          Todo lo que tu CV necesita
        </h2>
        <p className="max-w-[500px] text-[17px] text-cvai-text2">
          Un flujo completo desde subir el archivo hasta encontrar la oferta correcta.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-cvai-border bg-cvai-bg2 p-7 transition-colors hover:border-cvai-border2"
            >
              <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ${f.iconClass}`}>
                {f.icon}
              </div>
              <h3 className="mb-2.5 font-syne text-base font-semibold text-cvai-text1">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-cvai-text2">
                {f.description}
              </p>
              <span className={`mt-4 inline-block rounded-full px-2.5 py-1 text-[11px] font-medium ${f.tagClass}`}>
                {f.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────── */
const steps = [
  {
    num: "01",
    title: "Sube tu CV",
    description:
      "Arrastra tu archivo PDF o DOCX, o completa el formulario de CV desde cero. El sistema extrae y estructura tu información automáticamente.",
  },
  {
    num: "02",
    title: "La IA lo optimiza",
    description:
      "Azure OpenAI valida el contenido, corrige errores de contexto y genera una versión traducida. Todo documentado con costo por operación.",
  },
  {
    num: "03",
    title: "Descarga y aplica",
    description:
      "Descarga en PDF o DOCX con la plantilla elegida. Revisa las ofertas de empleo con mayor afinidad a tu perfil validado por IA.",
  },
];

function HowItWorks() {
  return (
    <section id="como-funciona" className="relative z-10 w-full py-20">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-cvai-indigo-light">
          Proceso
        </p>
        <h2 className="mb-12 font-syne text-[clamp(28px,3.5vw,40px)] font-bold text-cvai-text1">
          Tres pasos, resultado profesional
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.num} className="flex flex-col gap-4">
              <span className="font-syne text-5xl font-extrabold leading-none text-cvai-indigo/20">
                {s.num}
              </span>
              <h4 className="font-syne text-lg font-semibold text-cvai-text1">
                {s.title}
              </h4>
              <p className="text-sm leading-relaxed text-cvai-text2">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   STATS
───────────────────────────────────────── */
const stats = [
  { num: "< 2 min",  label: "Para procesar y optimizar un CV completo" },
  { num: "ES ↔ EN", label: "Traducción bidireccional con calidad enterprise" },
  { num: "$0",       label: "Costo para empezar en Fase 1" },
];

function StatsSection() {
  return (
    <div className="relative z-10 w-full py-4">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-6 rounded-2xl border border-cvai-border bg-cvai-bg2 p-10 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.num} className="text-center">
              <div className="mb-2 font-syne text-[40px] font-extrabold leading-none text-cvai-text1">
                {s.num}
              </div>
              <div className="text-[13px] text-cvai-text2">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   CTA BANNER
───────────────────────────────────────── */
const techStack = [
  "Next.js 16", "C# .NET 10", "Azure OpenAI",
  "Claude Haiku", "Supabase + pgvector", "Azure Key Vault", "Railway",
];

function CTABanner() {
  return (
    <div className="relative z-10 w-full py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-2xl border border-cvai-indigo/20 bg-cvai-indigo-dim px-6 py-14 text-center">
          <h2 className="mb-4 font-syne text-[clamp(24px,3vw,36px)] font-bold text-cvai-text1">
            ¿Listo para conseguir ese trabajo?
          </h2>
          <p className="mb-8 text-base text-cvai-text2">
            Tu próximo CV ya tiene inteligencia artificial adentro.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-cvai-indigo px-10 py-4 font-syne text-lg font-medium text-white transition-colors hover:bg-cvai-indigo-light"
          >
            Crear mi CV con IA
            <ArrowRight size={20} />
          </Link>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {techStack.map((t) => (
              <span
                key={t}
                className="rounded-full border border-cvai-border bg-white/5 px-3 py-1 text-xs text-cvai-text3"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   FOOTER
───────────────────────────────────────── */
function Footer() {
  return (
    <footer className="relative z-10 w-full border-t border-cvai-border py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <p className="text-[13px] text-cvai-text3">
          © 2026 CV.AI · Construido con IA en Honduras
        </p>
        <div className="flex items-center gap-5">
          {["Privacidad", "Términos"].map((l) => (
            <Link
              key={l}
              href="#"
              className="text-[13px] text-cvai-text3 no-underline transition-colors hover:text-cvai-text2"
            >
              {l}
            </Link>
          ))}
          <Link
            href="https://github.com"
            target="_blank"
            className="text-cvai-text3 transition-colors hover:text-cvai-text2"
            aria-label="GitHub"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </Link>
        </div>
      </div>
    </footer>
  );
}
