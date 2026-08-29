import { useEffect, useRef, useState } from "react"
import LogoLoop from "./LogoLoop"
import {
  SiReact,
  SiVite,
  SiTailwindcss,
  SiJavascript,
  SiNodedotjs,
  SiExpress,
  SiPostgresql,
  SiMongodb,
  SiVercel,
  SiRender,
  SiCloudinary,
  SiGit,
  SiThreedotjs,
  SiGreensock,
  SiHtml5,
  SiCss,
} from "react-icons/si"
import {
  WhatsAppIcon,
  CheckIcon,
  ShieldCheckIcon,
  ClockIcon,
  MailIcon,
  ChartIcon,
  ClipboardIcon,
  ScaleIcon,
  BoxIcon,
  SparklesIcon,
  BoltIcon,
  ArrowRightIcon,
  TrendingUpIcon,
} from "./Icons"

// ============================================================================
//  LANDING — "El Buen Corte" · Software de gestión inteligente para carnicerías
//  Edita este bloque para personalizar nombre, contacto, etc.
// ============================================================================
const PRODUCTO = {
  name: "El Buen Corte",
  claim: "Software de gestión inteligente para carnicerías",
  owner: "Brayan Cardozo",
  whatsapp: "573222067870", // formato internacional, sin +
  whatsappDisplay: "+57 322 206 7870",
  email: "cardozobrayan334@gmail.com",
  city: "Colombia",
}

// Tecnologías con las que está construido el software (carrusel del footer).
const techLogos = [
  { node: <SiReact />, title: "React", href: "https://react.dev" },
  { node: <SiVite />, title: "Vite", href: "https://vite.dev" },
  { node: <SiTailwindcss />, title: "Tailwind CSS", href: "https://tailwindcss.com" },
  { node: <SiJavascript />, title: "JavaScript", href: "https://developer.mozilla.org/docs/Web/JavaScript" },
  { node: <SiNodedotjs />, title: "Node.js", href: "https://nodejs.org" },
  { node: <SiExpress />, title: "Express", href: "https://expressjs.com" },
  { node: <SiPostgresql />, title: "PostgreSQL", href: "https://www.postgresql.org" },
  { node: <SiMongodb />, title: "MongoDB", href: "https://www.mongodb.com" },
  { node: <SiVercel />, title: "Vercel", href: "https://vercel.com" },
  { node: <SiRender />, title: "Render", href: "https://render.com" },
  { node: <SiCloudinary />, title: "Cloudinary", href: "https://cloudinary.com" },
  { node: <SiGit />, title: "Git", href: "https://git-scm.com" },
  { node: <SiThreedotjs />, title: "Three.js", href: "https://threejs.org" },
  { node: <SiGreensock />, title: "GSAP", href: "https://gsap.com" },
  { node: <SiHtml5 />, title: "HTML5", href: "https://developer.mozilla.org/docs/Web/HTML" },
  { node: <SiCss />, title: "CSS3", href: "https://developer.mozilla.org/docs/Web/CSS" },
]

const wa = (msg) =>
  `https://wa.me/${PRODUCTO.whatsapp}?text=${encodeURIComponent(msg)}`

const DEMO_MSG = `Hola, vi la web de ${PRODUCTO.name} y quiero una demo del software para mi carnicería.`

// ----- Funciones del software -----
const FUNCIONES = [
  {
    icon: ChartIcon,
    title: "Reportes diarios y contabilidad",
    text: "Cierre de caja automático. Ingresos, egresos y la utilidad real del día en un solo clic, sin cuadernos ni Excel.",
    accent: "from-[#dc2626] to-[#7f1d1d]",
  },
  {
    icon: ClipboardIcon,
    title: "Gestión de pedidos",
    text: "Registra, organiza y haz seguimiento a cada pedido. Nunca más se te pierde una venta ni un domicilio.",
    accent: "from-[#ea580c] to-[#9a3412]",
  },
  {
    icon: BoxIcon,
    title: "Control de inventario",
    text: "Stock de carne, mermas y faltantes en tiempo real. Sabes exactamente qué tienes y qué te falta.",
    accent: "from-[#dc2626] to-[#b45309]",
  },
  {
    icon: SparklesIcon,
    title: "Cálculo inteligente de la res",
    text: "Ingresas el peso del animal y al instante sabes cuántos kilos son aprovechables y cuánto es merma.",
    accent: "from-[#f59e0b] to-[#dc2626]",
    featured: true,
    href: "#calculadora",
  },
]

const BENEFICIOS = [
  { icon: TrendingUpIcon, title: "Más utilidad", text: "Controlas mermas y precios reales por corte: dejas de perder plata sin darte cuenta." },
  { icon: BoltIcon, title: "Menos tiempo perdido", text: "Lo que antes hacías con cuaderno y calculadora, el sistema lo resuelve en segundos." },
  { icon: ShieldCheckIcon, title: "Cero errores de cuentas", text: "La caja siempre cuadra. Decisiones con datos, no con cálculos a ojo." },
  { icon: SparklesIcon, title: "Inteligencia del negocio", text: "Reportes que te dicen qué se vende, quién compra y dónde estás perdiendo." },
]

const PASOS = [
  { n: "1", title: "Agenda tu demo", text: "Escríbenos y te mostramos el software funcionando con datos de tu carnicería." },
  { n: "2", title: "Lo configuramos contigo", text: "Cargamos tus cortes, precios y empleados. Tú solo lo usas." },
  { n: "3", title: "Empieza a controlar todo", text: "Vendes, registras y al final del día tienes tus reportes listos." },
]

const PLANES = [
  {
    name: "Básico",
    desc: "Para empezar a ordenar el negocio.",
    precio: "$59.000",
    periodo: "/mes",
    features: ["Reportes diarios y caja", "Gestión de pedidos", "Control de inventario", "1 usuario"],
  },
  {
    name: "Pro",
    desc: "El control completo de tu carnicería.",
    precio: "$99.000",
    periodo: "/mes",
    featured: true,
    features: [
      "Todo lo del plan Básico",
      "Cálculo inteligente de la res",
      "Hasta 5 usuarios",
    ],
  },
  {
    name: "A la medida",
    desc: "Para varias sucursales o necesidades especiales.",
    precio: "Cotización",
    periodo: "",
    features: ["Todo lo del plan Pro", "Multi-sucursal", "Soporte prioritario", "Usuarios ilimitados"],
  },
]

const STATS = [
  { value: "100%", label: "Tu caja cuadrada cada día" },
  { value: "5 min", label: "Para el cierre del día" },
  { value: "0", label: "Cuadernos y Excel sueltos" },
  { value: "24/7", label: "Tus reportes a la mano" },
]

// ----- Helpers -----

// Imagen con fallback a degradado (mientras no haya foto/render real).
function Img({ src, alt, className = "", fallback = "from-[#3a1414] to-[#160d0b]", label }) {
  const [err, setErr] = useState(false)
  if (!src || err) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br ${fallback} ${className}`}>
        {label && (
          <span className="px-4 text-center text-lg font-bold uppercase tracking-wider text-white/80">
            {label}
          </span>
        )}
      </div>
    )
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setErr(true)} className={className} />
}

// Aparición suave al hacer scroll (IntersectionObserver, sin dependencias).
function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.12 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  )
}

const Eyebrow = ({ children }) => (
  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f59e0b] sm:text-sm sm:tracking-[0.3em]">
    <span className="h-px w-6 shrink-0 bg-[#f59e0b] sm:w-8" />
    <span className="min-w-0">{children}</span>
  </span>
)

const Boton = ({ href, children, variant = "primary", className = "", ...rest }) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-bold transition-transform hover:scale-105"
  const styles = {
    primary:
      "bg-gradient-to-r from-[#dc2626] to-[#b91c1c] text-white shadow-[0_10px_40px_-10px_rgba(220,38,38,0.7)]",
    ghost: "border border-[#f59e0b]/50 text-[#f3e9dc] hover:bg-[#f59e0b]/10",
  }
  return (
    <a href={href} className={`${base} ${styles[variant]} ${className}`} {...rest}>
      {children}
    </a>
  )
}

// Fondo decorativo de cuadrícula sutil (look "software/tech").
const GridGlow = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 opacity-[0.06]"
    style={{
      backgroundImage:
        "linear-gradient(#f59e0b 1px, transparent 1px), linear-gradient(90deg, #f59e0b 1px, transparent 1px)",
      backgroundSize: "44px 44px",
      maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
    }}
  />
)

// ----- Secciones -----

function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#3d2420]/60 bg-[#160d0b]/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-6">
        <a href="#inicio" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#dc2626] to-[#7f1d1d] text-lg">
            🥩
          </span>
          <span className="text-xl font-extrabold tracking-tight text-[#f3e9dc]">
            {PRODUCTO.name}
          </span>
        </a>
        <nav className="hidden items-center gap-7 text-sm font-medium text-[#c9b8a8] md:flex">
          <a href="#funciones" className="transition-colors hover:text-[#f59e0b]">Funciones</a>
          <a href="#calculadora" className="transition-colors hover:text-[#f59e0b]">Cálculo IA</a>
          <a href="#planes" className="transition-colors hover:text-[#f59e0b]">Planes</a>
          <a href="#contacto" className="transition-colors hover:text-[#f59e0b]">Contacto</a>
        </nav>
        <Boton
          href={wa(DEMO_MSG)}
          target="_blank"
          rel="noreferrer"
          className="px-5 py-2.5 text-sm"
        >
          <WhatsAppIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Solicitar demo</span>
          <span className="sm:hidden">Demo</span>
        </Boton>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section id="inicio" className="relative flex min-h-dvh items-center overflow-hidden">
      <div className="absolute inset-0">
        <Img
          src="/img/fondo.png"
          alt="Software de gestión para carnicerías"
          className="h-full w-full object-cover"
          fallback="from-[#2a0e0c] via-[#3a1412] to-[#160d0b]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#160d0b] via-[#160d0b]/85 to-[#160d0b]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#160d0b] via-transparent to-[#160d0b]/40" />
      </div>
      <GridGlow />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-28 pb-16">
        <div className="max-w-2xl">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#f59e0b]">
              <SparklesIcon className="h-4 w-4" /> Gestión con inteligencia artificial
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-5 text-4xl font-black leading-[1.1] tracking-tight text-[#f3e9dc] sm:text-6xl sm:leading-[1.05]">
              Lleva tu carnicería como
              <span className="block bg-gradient-to-r from-[#f59e0b] to-[#dc2626] bg-clip-text pb-1.5 text-transparent">
                un negocio inteligente
              </span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-6 max-w-lg text-lg text-[#cbb8a7] sm:text-xl">
              {PRODUCTO.name} reúne contabilidad, pedidos e inventario en un solo
              lugar — y calcula cuánta carne aprovechas de cada res. Menos pérdidas,
              más control, más utilidad.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Boton href={wa(DEMO_MSG)} target="_blank" rel="noreferrer" className="px-8 py-4 text-lg">
                <WhatsAppIcon className="h-5 w-5" />
                Solicitar demo gratis
              </Boton>
              <Boton href="#funciones" variant="ghost" className="px-8 py-4 text-lg">
                Ver qué hace
                <ArrowRightIcon className="h-5 w-5" />
              </Boton>
            </div>
          </Reveal>
          <Reveal delay={400}>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-2 text-sm font-semibold text-[#cbb8a7]">
              <span className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-[#f59e0b]" /> Sin instalar nada</span>
              <span className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-[#f59e0b]" /> Fácil de usar</span>
              <span className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-[#f59e0b]" /> Pensado para carnicerías</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function StatStrip() {
  return (
    <div className="border-y border-[#3d2420]/60 bg-[#1e1210]">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-8 sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-3xl font-black text-[#f59e0b] sm:text-4xl">{s.value}</p>
            <p className="mt-1 text-xs font-medium text-[#cbb8a7] sm:text-sm">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Funciones() {
  return (
    <section id="funciones" className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <Reveal className="text-center">
        <Eyebrow>Todo en un solo lugar</Eyebrow>
        <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-black tracking-tight text-[#f3e9dc] sm:text-5xl">
          Una herramienta para manejar toda la carnicería
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[#cbb8a7]">
          Olvídate del cuaderno, la calculadora y los Excel sueltos. {PRODUCTO.name}{" "}
          lo hace todo por ti.
        </p>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FUNCIONES.map((f, i) => {
          const Icon = f.icon
          const Card = (
            <div
              className={`group flex h-full flex-col rounded-2xl border bg-[#241513] p-6 transition-all duration-300 hover:-translate-y-1 ${
                f.featured
                  ? "border-[#f59e0b]/70 shadow-[0_20px_50px_-20px_rgba(245,158,11,0.5)]"
                  : "border-[#3d2420] hover:border-[#dc2626]/60"
              }`}
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.accent} text-white`}
              >
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 flex items-center gap-2 text-lg font-extrabold text-[#f3e9dc]">
                {f.title}
                {f.featured && (
                  <span className="rounded-full bg-[#f59e0b] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#160d0b]">
                    IA
                  </span>
                )}
              </h3>
              <p className="mt-2 flex-1 text-sm text-[#cbb8a7]">{f.text}</p>
              {f.href && (
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#f59e0b]">
                  Probar la calculadora
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </div>
          )
          return (
            <Reveal key={f.title} delay={i * 70}>
              {f.href ? (
                <a href={f.href} className="block h-full">
                  {Card}
                </a>
              ) : (
                Card
              )}
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

// ---- Calculadora interactiva de aprovechamiento de la res ----
// Porcentajes de referencia (editables). Sobre el peso en pie:
//   rendimiento en canal ≈ 55%. Del canal: carne / hueso / grasa / merma.
const REND = {
  canal: 0.55,
  carne: 0.7,
  hueso: 0.15,
  grasa: 0.11,
  merma: 0.04,
}

const fmtKg = (n) =>
  n.toLocaleString("es-CO", { maximumFractionDigits: 1, minimumFractionDigits: 0 })

function CalculadoraRes() {
  const [peso, setPeso] = useState(450)
  const canal = peso * REND.canal
  const carne = canal * REND.carne
  const hueso = canal * REND.hueso
  const grasa = canal * REND.grasa
  const merma = canal * REND.merma
  const aprovechable = carne + hueso + grasa
  const pctAprov = peso ? Math.round((aprovechable / peso) * 100) : 0

  const segmentos = [
    { label: "Carne comercial", kg: carne, color: "bg-[#dc2626]", text: "text-[#dc2626]" },
    { label: "Hueso", kg: hueso, color: "bg-[#f59e0b]", text: "text-[#f59e0b]" },
    { label: "Grasa / sebo", kg: grasa, color: "bg-[#eab308]", text: "text-[#eab308]" },
    { label: "Merma", kg: merma, color: "bg-[#6b7280]", text: "text-[#9ca3af]" },
  ]

  return (
    <section id="calculadora" className="relative overflow-hidden border-y border-[#3d2420]/60 bg-[#1e1210]">
      <GridGlow />
      <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Texto */}
          <Reveal>
            <Eyebrow>Función estrella · IA</Eyebrow>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-[#f3e9dc] sm:text-5xl">
              ¿Cuánta carne aprovechas de cada res?
            </h2>
            <p className="mt-4 max-w-md text-[#cbb8a7]">
              Ingresa el peso del animal y el sistema te dice al instante cuántos
              kilos son aprovechables y cuánto es merma. Así sabes el costo real
              por kilo y dejas de regalar utilidad.
            </p>
            <ul className="mt-6 space-y-2.5">
              {[
                "Calcula rendimiento en canal y deshuese",
                "Separa carne, hueso, grasa y merma",
                "Te muestra el % aprovechable en segundos",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-sm text-[#e7d8c8]">
                  <CheckIcon className="h-4 w-4 shrink-0 text-[#f59e0b]" />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-[#a18b7a]">
              * Demo con valores de referencia. En el software se ajustan a tu tipo
              de ganado y forma de despiece.
            </p>
          </Reveal>

          {/* Calculadora */}
          <Reveal delay={120}>
            <div className="rounded-3xl border border-[#3d2420] bg-[#160d0b]/80 p-6 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.8)] backdrop-blur sm:p-8">
              <div className="flex items-center gap-2 text-[#f59e0b]">
                <ScaleIcon className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-wider">Calculadora de la res</span>
              </div>

              {/* Input peso */}
              <label className="mt-6 block text-sm font-semibold text-[#cbb8a7]">
                Peso del animal en pie
              </label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  value={peso}
                  onChange={(e) => setPeso(Math.max(0, Number(e.target.value) || 0))}
                  className="w-32 rounded-xl border border-[#3d2420] bg-[#241513] px-4 py-2.5 text-2xl font-black text-[#f3e9dc] outline-none focus:border-[#f59e0b]"
                />
                <span className="text-lg font-bold text-[#cbb8a7]">kg</span>
              </div>
              <input
                type="range"
                min={200}
                max={700}
                step={5}
                value={Math.min(700, Math.max(200, peso))}
                onChange={(e) => setPeso(Number(e.target.value))}
                className="mt-4 w-full accent-[#dc2626]"
              />

              {/* Resultado principal */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#dc2626]/40 bg-gradient-to-br from-[#dc2626]/15 to-transparent p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#f59e0b]">Aprovechable</p>
                  <p className="mt-1 text-2xl font-black text-[#f3e9dc] sm:text-3xl">{fmtKg(aprovechable)}<span className="text-sm font-bold text-[#cbb8a7] sm:text-base"> kg</span></p>
                  <p className="text-xs text-[#cbb8a7]">{pctAprov}% del peso en pie</p>
                </div>
                <div className="rounded-2xl border border-[#3d2420] bg-[#241513] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">Merma</p>
                  <p className="mt-1 text-2xl font-black text-[#f3e9dc] sm:text-3xl">{fmtKg(merma)}<span className="text-sm font-bold text-[#cbb8a7] sm:text-base"> kg</span></p>
                  <p className="text-xs text-[#cbb8a7]">no aprovechable</p>
                </div>
              </div>

              {/* Barra de desglose */}
              <div className="mt-6">
                <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-[#241513]">
                  {segmentos.map((s) => (
                    <div
                      key={s.label}
                      className={`${s.color} h-full transition-all duration-500`}
                      style={{ width: `${canal ? (s.kg / canal) * 100 : 0}%` }}
                    />
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                  {segmentos.map((s) => (
                    <div key={s.label}>
                      <span className={`flex items-center gap-1.5 font-semibold ${s.text}`}>
                        <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                        {s.label}
                      </span>
                      <span className="ml-4 text-[#cbb8a7]">{fmtKg(s.kg)} kg</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function Beneficios() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <Reveal className="text-center">
        <Eyebrow>Por qué elegirnos</Eyebrow>
        <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-black tracking-tight text-[#f3e9dc] sm:text-5xl">
          Deja de trabajar a ciegas
        </h2>
      </Reveal>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFICIOS.map((b, i) => {
          const Icon = b.icon
          return (
            <Reveal key={b.title} delay={i * 80}>
              <div className="h-full rounded-2xl border border-[#3d2420] bg-[#241513] p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#dc2626] to-[#7f1d1d] text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-extrabold text-[#f3e9dc]">{b.title}</h3>
                <p className="mt-1 text-sm text-[#cbb8a7]">{b.text}</p>
              </div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

function Pasos() {
  return (
    <section className="border-y border-[#3d2420]/60 bg-[#1e1210]">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <Reveal className="text-center">
          <Eyebrow>Empezar es fácil</Eyebrow>
          <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-black tracking-tight text-[#f3e9dc] sm:text-5xl">
            En 3 pasos, tu carnicería bajo control
          </h2>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PASOS.map((p, i) => (
            <Reveal key={p.n} delay={i * 100}>
              <div className="relative h-full rounded-2xl border border-[#3d2420] bg-[#241513] p-7">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#f59e0b] to-[#dc2626] text-2xl font-black text-[#160d0b]">
                  {p.n}
                </span>
                <h3 className="mt-4 text-xl font-extrabold text-[#f3e9dc]">{p.title}</h3>
                <p className="mt-1 text-[#cbb8a7]">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Planes() {
  return (
    <section id="planes" className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <Reveal className="text-center">
        <Eyebrow>Planes</Eyebrow>
        <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-black tracking-tight text-[#f3e9dc] sm:text-5xl">
          Un precio que se paga solo
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[#cbb8a7]">
          Elige el plan que va con tu negocio. Cancela cuando quieras.
        </p>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {PLANES.map((plan, i) => (
          <Reveal key={plan.name} delay={i * 90}>
            <div
              className={`flex h-full flex-col rounded-2xl border bg-[#241513] p-7 transition-all duration-300 hover:-translate-y-1 ${
                plan.featured
                  ? "border-[#f59e0b]/70 shadow-[0_20px_50px_-20px_rgba(245,158,11,0.5)]"
                  : "border-[#3d2420] hover:border-[#dc2626]/60"
              }`}
            >
              {plan.featured && (
                <span className="mb-3 inline-flex w-fit rounded-full bg-[#f59e0b] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#160d0b]">
                  Más popular
                </span>
              )}
              <h3 className="text-2xl font-extrabold text-[#f3e9dc]">{plan.name}</h3>
              <p className="mt-1 text-sm text-[#cbb8a7]">{plan.desc}</p>
              <div className="mt-5 flex items-end gap-1">
                <span className="text-4xl font-black text-[#f3e9dc]">{plan.precio}</span>
                <span className="pb-1 text-sm font-semibold text-[#cbb8a7]">{plan.periodo}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#e7d8c8]">
                    <CheckIcon className="h-4 w-4 shrink-0 text-[#dc2626]" />
                    {f}
                  </li>
                ))}
              </ul>
              <Boton
                href={wa(`Hola, me interesa el plan *${plan.name}* de ${PRODUCTO.name}.`)}
                target="_blank"
                rel="noreferrer"
                variant={plan.featured ? "primary" : "ghost"}
                className="mt-6 w-full px-5 py-3"
              >
                {plan.precio === "Cotización" ? "Pedir cotización" : "Solicitar demo"}
              </Boton>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-[#a18b7a]">
        Precios de referencia, editables. Ajusta los valores en{" "}
        <span className="font-mono text-[#cbb8a7]">PLANES</span> dentro de App.jsx.
      </p>
    </section>
  )
}

function CTAFinal() {
  return (
    <section id="contacto" className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Img
          src="/img/fondo.png"
          alt="Carnicería moderna"
          className="h-full w-full object-cover"
          fallback="from-[#3a1412] to-[#160d0b]"
        />
        <div className="absolute inset-0 bg-[#160d0b]/88" />
      </div>
      <GridGlow />
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-24 text-center sm:py-32">
        <Reveal>
          <h2 className="text-4xl font-black tracking-tight text-[#f3e9dc] sm:text-6xl">
            Lleva tu carnicería al{" "}
            <span className="bg-gradient-to-r from-[#f59e0b] to-[#dc2626] bg-clip-text text-transparent">
              siguiente nivel
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-[#cbb8a7]">
            Agenda una demo gratis y te mostramos, en vivo, cómo {PRODUCTO.name}{" "}
            puede ordenar y hacer crecer tu negocio.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
            <Boton href={wa(DEMO_MSG)} target="_blank" rel="noreferrer" className="w-full px-8 py-4 text-base sm:w-auto sm:text-lg">
              <WhatsAppIcon className="h-5 w-5" />
              Solicitar demo por WhatsApp
            </Boton>
            <Boton href={`mailto:${PRODUCTO.email}`} variant="ghost" className="w-full px-8 py-4 text-base sm:w-auto sm:text-lg">
              <MailIcon className="h-5 w-5" />
              Escríbenos
            </Boton>
          </div>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 text-sm text-[#cbb8a7] sm:flex-row sm:gap-8">
            <span className="flex items-center gap-2"><MailIcon className="h-4 w-4 text-[#f59e0b]" /> {PRODUCTO.email}</span>
            <span className="flex items-center gap-2"><ClockIcon className="h-4 w-4 text-[#f59e0b]" /> Respuesta en minutos</span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// Carrusel "Tecnologías que usamos" — reciclado del proyecto NeXo (LogoLoop),
// con colores adaptados al fondo cálido de El Buen Corte.
function TechLoop() {
  return (
    <section className="border-t border-[#3d2420]/60 bg-[#160d0b] py-14">
      <p className="mb-9 text-center text-sm font-semibold uppercase tracking-[0.3em] text-[#a18b7a]">
        Tecnologías que usamos
      </p>
      <div className="relative overflow-hidden text-[#c9b8a8]">
        <LogoLoop
          logos={techLogos}
          speed={55}
          direction="left"
          logoHeight={42}
          gap={60}
          pauseOnHover
          scaleOnHover
          fadeOut
          fadeOutColor="#160d0b"
          ariaLabel="Tecnologías con las que está construido El Buen Corte"
        />
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-[#3d2420]/60 bg-[#160d0b]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Marca */}
          <div className="lg:col-span-1">
            <a href="#inicio" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#dc2626] to-[#7f1d1d] text-lg">
                🥩
              </span>
              <span className="text-xl font-extrabold tracking-tight text-[#f3e9dc]">
                {PRODUCTO.name}
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#a18b7a]">
              {PRODUCTO.claim}. Menos pérdidas, más control, más utilidad.
            </p>
          </div>

          {/* Navegación */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#f3e9dc]">
              Navegación
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                ["Funciones", "#funciones"],
                ["Cálculo IA", "#calculadora"],
                ["Planes", "#planes"],
                ["Contacto", "#contacto"],
              ].map(([label, href]) => (
                <li key={href}>
                  <a href={href} className="text-[#a18b7a] transition-colors hover:text-[#f59e0b]">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#f3e9dc]">
              Contacto
            </h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href={wa(DEMO_MSG)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 text-[#a18b7a] transition-colors hover:text-[#f59e0b]"
                >
                  <WhatsAppIcon className="h-5 w-5 text-[#f59e0b]" />
                  {PRODUCTO.whatsappDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${PRODUCTO.email}`}
                  className="flex items-center gap-2.5 text-[#a18b7a] transition-colors hover:text-[#f59e0b]"
                >
                  <MailIcon className="h-5 w-5 text-[#f59e0b]" />
                  <span className="truncate">{PRODUCTO.email}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Responsable */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#f3e9dc]">
              Desarrollado por
            </h4>
            <p className="mt-4 text-sm font-semibold text-[#e7d8c8]">
              Ne<span className="text-blue-500 font-bold">X</span>o <span className="text-xs font-normal text-[#a18b7a]">by: Brayan Cardozo</span>
            </p>
            <p className="mt-1 text-sm text-[#a18b7a]">
              ¿Quieres un software para tu negocio? Escríbeme.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#3d2420]/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm text-[#a18b7a] sm:flex-row">
          <p>© 2026 {PRODUCTO.name}. Todos los derechos reservados.</p>
          <p>
            Hecho por{" "}
            <a
              href="https://ne-xo-page.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[#f59e0b] hover:underline"
            >
              NeXo
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <div className="min-h-dvh bg-[#160d0b] text-[#f3e9dc]">
      <Nav />
      <Hero />
      <StatStrip />
      <Funciones />
      <CalculadoraRes />
      <Beneficios />
      <Pasos />
      <Planes />
      <CTAFinal />
      <TechLoop />
      <Footer />
    </div>
  )
}
