import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Storyboard AI – Landing Page (Server Component)                   */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-0 text-surface-900">
      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 z-50 w-full border-b border-surface-200 bg-surface-0/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-brand-700">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="shrink-0">
              <rect x="2" y="2" width="24" height="24" rx="6" className="fill-brand-600" />
              <rect x="6" y="7" width="7" height="5" rx="1" className="fill-surface-0" />
              <rect x="15" y="7" width="7" height="5" rx="1" className="fill-surface-0" opacity="0.7" />
              <rect x="6" y="15" width="7" height="5" rx="1" className="fill-surface-0" opacity="0.7" />
              <rect x="15" y="15" width="7" height="5" rx="1" className="fill-surface-0" opacity="0.5" />
            </svg>
            Storyboard AI
          </Link>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-surface-700 transition hover:bg-surface-100 hover:text-surface-900"
            >
              Log&nbsp;In
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 active:bg-brand-800"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden pt-16">
        {/* Background decoration */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 right-1/4 h-[600px] w-[600px] rounded-full bg-brand-100 opacity-40 blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 h-[500px] w-[500px] rounded-full bg-brand-50 opacity-50 blur-3xl" />
        </div>

        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col items-center justify-center px-6 py-24 text-center">
          <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-brand-700 uppercase">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1l1.76 3.57L13 5.27l-3 2.93.71 4.13L7 10.27 3.29 12.33 4 8.2 1 5.27l4.24-.7L7 1z" className="fill-brand-500" />
            </svg>
            AI-Powered Storyboarding
          </span>

          <h1 className="mx-auto max-w-4xl text-5xl leading-[1.1] font-extrabold tracking-tight text-surface-900 sm:text-6xl lg:text-7xl">
            Turn Ideas into{" "}
            <span className="bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent">
              Visual Stories
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-surface-600 sm:text-xl">
            Sketch a scene, describe your shot, and let AI generate consistent,
            cinematic storyboard frames in seconds. From rough concept to polished
            sequence -- effortlessly.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 hover:shadow-brand-700/30 active:bg-brand-800"
            >
              Get Started Free
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M6.75 4.5L11.25 9L6.75 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 rounded-xl border border-surface-300 bg-surface-0 px-7 py-3.5 text-base font-semibold text-surface-700 shadow-sm transition hover:border-surface-400 hover:bg-surface-50"
            >
              Log In
            </Link>
          </div>

          {/* Hero mockup -- faux browser window with storyboard frames */}
          <div className="relative mx-auto mt-20 w-full max-w-5xl">
            <div className="rounded-2xl border border-surface-200 bg-surface-0 shadow-2xl shadow-surface-900/5">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 border-b border-surface-200 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-surface-300" />
                <span className="h-3 w-3 rounded-full bg-surface-300" />
                <span className="h-3 w-3 rounded-full bg-surface-300" />
                <span className="mx-auto h-6 w-64 rounded-md bg-surface-100" />
              </div>

              {/* Storyboard frames grid */}
              <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
                {[
                  { label: "Scene 1", accent: "bg-brand-100", icon: "M4 4h8v8H4z" },
                  { label: "Scene 2", accent: "bg-brand-50", icon: "M6 2l6 10H0z" },
                  { label: "Scene 3", accent: "bg-brand-100", icon: "M8 2a6 6 0 100 12A6 6 0 008 2z" },
                  { label: "Scene 4", accent: "bg-brand-50", icon: "M2 6h12v6H2z" },
                ].map((frame) => (
                  <div key={frame.label} className="group relative">
                    <div
                      className={`${frame.accent} flex aspect-[16/10] items-center justify-center rounded-xl border border-surface-200 transition group-hover:border-brand-300 group-hover:shadow-md`}
                    >
                      <svg width="40" height="40" viewBox="0 0 16 16" className="text-brand-400 opacity-60">
                        <path d={frame.icon} fill="currentColor" />
                      </svg>
                    </div>
                    <p className="mt-2 text-center text-xs font-medium text-surface-500">{frame.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -right-3 -bottom-3 rounded-xl border border-surface-200 bg-surface-0 px-4 py-2.5 shadow-lg sm:-right-6 sm:-bottom-6">
              <p className="text-xs font-semibold text-brand-600">4 frames generated</p>
              <p className="text-[11px] text-surface-500">in 12 seconds</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Workflow / How It Works ─────────────────────────────── */}
      <section className="border-t border-surface-200 bg-surface-50 py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold tracking-wide text-brand-600 uppercase">How It Works</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
              Four simple steps to your storyboard
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-surface-600">
              Go from a rough sketch or reference image to a polished, multi-frame
              storyboard sequence -- no artistic skills required.
            </p>
          </div>

          <div className="relative mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Connector line (desktop only) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-12 right-0 left-0 hidden h-0.5 bg-gradient-to-r from-surface-200 via-brand-200 to-surface-200 lg:block"
            />

            {(
              [
                {
                  step: "01",
                  title: "Draw or Upload",
                  description:
                    "Sketch directly on our canvas or upload a reference image. Rough is perfectly fine.",
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.376 3.622a2.121 2.121 0 113 3L7.5 18.5 3 20l1.5-4.5L16.376 3.622z" />
                    </svg>
                  ),
                },
                {
                  step: "02",
                  title: "Describe the Shot",
                  description:
                    "Add cinematic instructions -- camera angle, lighting, mood. Guide the AI like a director.",
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                  ),
                },
                {
                  step: "03",
                  title: "Generate Storyboard",
                  description:
                    "AI creates consistent, stylized frames that match your characters and setting.",
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                  ),
                },
                {
                  step: "04",
                  title: "Refine Sequence",
                  description:
                    "Reorder, regenerate, or tweak individual frames until every shot is perfect.",
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20V10" />
                      <path d="M18 20V4" />
                      <path d="M6 20v-4" />
                    </svg>
                  ),
                },
              ] as const
            ).map((item) => (
              <div key={item.step} className="relative flex flex-col items-center text-center">
                {/* Step circle */}
                <div className="relative z-10 flex h-24 w-24 flex-col items-center justify-center rounded-2xl border border-surface-200 bg-surface-0 shadow-sm transition hover:border-brand-300 hover:shadow-md">
                  <div className="text-brand-600">{item.icon}</div>
                </div>
                <span className="mt-1 text-[11px] font-bold tracking-widest text-brand-500 uppercase">
                  Step {item.step}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-surface-900">{item.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-surface-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section className="py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold tracking-wide text-brand-600 uppercase">Features</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
              Everything you need to storyboard
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-surface-600">
              Professional-grade tools wrapped in an intuitive interface so you can
              focus on telling your story.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                {
                  title: "AI-Powered Generation",
                  description:
                    "State-of-the-art image models turn your sketches and prompts into polished storyboard frames.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  ),
                },
                {
                  title: "Character Consistency",
                  description:
                    "Maintain the same characters, costumes, and art style across every frame of your sequence.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 00-3-3.87" />
                      <path d="M16 3.13a4 4 0 010 7.75" />
                    </svg>
                  ),
                },
                {
                  title: "Multi-Scene Support",
                  description:
                    "Organize dozens of scenes into acts and sequences. Drag and drop to reorder your narrative.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <path d="M8 21h8" />
                      <path d="M12 17v4" />
                    </svg>
                  ),
                },
                {
                  title: "Export to PDF",
                  description:
                    "Download your storyboard as a production-ready PDF with frame numbers, notes, and annotations.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <polyline points="9 15 12 18 15 15" />
                    </svg>
                  ),
                },
              ] as const
            ).map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-surface-200 bg-surface-0 p-6 transition hover:border-brand-300 hover:shadow-lg hover:shadow-brand-600/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-100">
                  {feature.icon}
                </div>
                <h3 className="mt-5 text-base font-semibold text-surface-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-surface-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sample Storyboard Mockup ───────────────────────────── */}
      <section className="border-t border-surface-200 bg-surface-50 py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold tracking-wide text-brand-600 uppercase">See It in Action</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
              A sample storyboard sequence
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-surface-600">
              Each frame is AI-generated from a simple sketch and a text
              description. The result is a cohesive, cinematic sequence.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                {
                  frame: 1,
                  shot: "Wide Shot",
                  note: "Establishing -- city skyline at dusk, warm amber tones.",
                  bg: "from-brand-100 to-brand-50",
                  shapes: (
                    <>
                      <rect x="0" y="50" width="120" height="30" rx="2" className="fill-brand-300 opacity-40" />
                      <rect x="15" y="25" width="12" height="55" rx="1" className="fill-brand-400 opacity-30" />
                      <rect x="35" y="35" width="10" height="45" rx="1" className="fill-brand-400 opacity-25" />
                      <rect x="55" y="20" width="14" height="60" rx="1" className="fill-brand-400 opacity-35" />
                      <rect x="80" y="30" width="11" height="50" rx="1" className="fill-brand-400 opacity-25" />
                      <circle cx="100" cy="18" r="10" className="fill-brand-300 opacity-50" />
                    </>
                  ),
                },
                {
                  frame: 2,
                  shot: "Medium Shot",
                  note: "Character enters frame left, trench coat, determined look.",
                  bg: "from-brand-50 to-surface-100",
                  shapes: (
                    <>
                      <circle cx="45" cy="28" r="10" className="fill-brand-400 opacity-40" />
                      <rect x="38" y="38" width="14" height="30" rx="3" className="fill-brand-300 opacity-35" />
                      <rect x="35" y="68" width="8" height="14" rx="1" className="fill-brand-400 opacity-25" />
                      <rect x="47" y="68" width="8" height="14" rx="1" className="fill-brand-400 opacity-25" />
                      <rect x="70" y="40" width="40" height="40" rx="4" className="fill-surface-300 opacity-30" />
                    </>
                  ),
                },
                {
                  frame: 3,
                  shot: "Close-Up",
                  note: "Character\u2019s hand reaches for a glowing artifact.",
                  bg: "from-brand-100 to-brand-200",
                  shapes: (
                    <>
                      <rect x="20" y="35" width="50" height="12" rx="4" className="fill-brand-300 opacity-30" />
                      <rect x="15" y="47" width="12" height="20" rx="2" className="fill-brand-400 opacity-25" />
                      <rect x="27" y="47" width="12" height="22" rx="2" className="fill-brand-400 opacity-25" />
                      <rect x="39" y="47" width="12" height="20" rx="2" className="fill-brand-400 opacity-25" />
                      <circle cx="85" cy="45" r="16" className="fill-brand-500 opacity-25" />
                      <circle cx="85" cy="45" r="8" className="fill-brand-400 opacity-40" />
                    </>
                  ),
                },
                {
                  frame: 4,
                  shot: "Over-the-Shoulder",
                  note: "Reveal of the ancient map spread across the table.",
                  bg: "from-surface-100 to-brand-50",
                  shapes: (
                    <>
                      <ellipse cx="35" cy="25" rx="18" ry="20" className="fill-brand-300 opacity-25" />
                      <rect x="30" y="50" width="70" height="30" rx="3" className="fill-brand-200 opacity-40" />
                      <line x1="40" y1="55" x2="90" y2="55" className="stroke-brand-400 opacity-30" strokeWidth="1.5" />
                      <line x1="40" y1="62" x2="80" y2="62" className="stroke-brand-400 opacity-25" strokeWidth="1.5" />
                      <line x1="40" y1="69" x2="70" y2="69" className="stroke-brand-400 opacity-20" strokeWidth="1.5" />
                    </>
                  ),
                },
                {
                  frame: 5,
                  shot: "Low Angle",
                  note: "Character stands, silhouetted against a bright doorway.",
                  bg: "from-brand-50 to-brand-100",
                  shapes: (
                    <>
                      <rect x="35" y="10" width="50" height="70" rx="4" className="fill-brand-200 opacity-50" />
                      <rect x="50" y="30" width="16" height="50" rx="3" className="fill-brand-400 opacity-35" />
                      <circle cx="58" cy="24" r="7" className="fill-brand-400 opacity-35" />
                      <rect x="43" y="75" width="10" height="5" rx="1" className="fill-brand-300 opacity-25" />
                      <rect x="65" y="75" width="10" height="5" rx="1" className="fill-brand-300 opacity-25" />
                    </>
                  ),
                },
                {
                  frame: 6,
                  shot: "Extreme Wide",
                  note: "Final frame -- character walks into the unknown horizon.",
                  bg: "from-brand-100 to-brand-50",
                  shapes: (
                    <>
                      <rect x="0" y="55" width="120" height="25" rx="0" className="fill-brand-200 opacity-30" />
                      <line x1="0" y1="55" x2="120" y2="55" className="stroke-brand-300 opacity-40" strokeWidth="1" />
                      <rect x="54" y="40" width="6" height="20" rx="2" className="fill-brand-400 opacity-35" />
                      <circle cx="57" cy="36" r="4" className="fill-brand-400 opacity-35" />
                      <circle cx="95" cy="28" r="14" className="fill-brand-300 opacity-20" />
                    </>
                  ),
                },
              ] as const
            ).map((item) => (
              <div key={item.frame} className="group">
                <div
                  className={`relative overflow-hidden rounded-xl border border-surface-200 bg-gradient-to-br ${item.bg} transition hover:border-brand-300 hover:shadow-lg`}
                >
                  {/* Frame number badge */}
                  <span className="absolute top-3 left-3 z-10 rounded-md bg-surface-900/70 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
                    {String(item.frame).padStart(2, "0")}
                  </span>
                  {/* Shot type badge */}
                  <span className="absolute top-3 right-3 z-10 rounded-md bg-brand-600/80 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                    {item.shot}
                  </span>

                  {/* Placeholder illustration */}
                  <div className="flex aspect-video items-center justify-center">
                    <svg viewBox="0 0 120 80" className="h-full w-full p-4 opacity-80">
                      {item.shapes}
                    </svg>
                  </div>
                </div>
                <p className="mt-2.5 px-1 text-sm leading-snug text-surface-600">
                  {item.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────── */}
      <section className="py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 px-8 py-16 shadow-2xl shadow-brand-900/20 sm:px-16">
            {/* Background glow */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-brand-500 opacity-20 blur-3xl" />
              <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-brand-400 opacity-15 blur-3xl" />
            </div>

            <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to bring your story to life?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lg text-brand-200">
              Join creators, filmmakers, and designers who use Storyboard AI to
              visualize their ideas faster than ever.
            </p>
            <div className="relative mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-surface-0 px-7 py-3.5 text-base font-semibold text-brand-700 shadow-lg transition hover:bg-surface-50"
              >
                Create Your First Storyboard
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M6.75 4.5L11.25 9L6.75 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-7 py-3.5 text-base font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-surface-200 bg-surface-50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 text-sm font-bold tracking-tight text-surface-700">
              <svg width="22" height="22" viewBox="0 0 28 28" fill="none" className="shrink-0">
                <rect x="2" y="2" width="24" height="24" rx="6" className="fill-brand-600" />
                <rect x="6" y="7" width="7" height="5" rx="1" className="fill-surface-0" />
                <rect x="15" y="7" width="7" height="5" rx="1" className="fill-surface-0" opacity="0.7" />
                <rect x="6" y="15" width="7" height="5" rx="1" className="fill-surface-0" opacity="0.7" />
                <rect x="15" y="15" width="7" height="5" rx="1" className="fill-surface-0" opacity="0.5" />
              </svg>
              Storyboard AI
            </Link>

            <p className="text-sm text-surface-500">
              &copy; {new Date().getFullYear()} Storyboard AI. All rights reserved.
            </p>

            <div className="flex gap-6">
              <Link href="/auth/login" className="text-sm text-surface-500 transition hover:text-surface-700">
                Log In
              </Link>
              <Link href="/auth/signup" className="text-sm text-surface-500 transition hover:text-surface-700">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
