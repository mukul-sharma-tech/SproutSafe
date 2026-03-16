import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Menu,
  X,
  Moon,
  Sun,
  ArrowRight,
  ShieldCheck,
  Zap,
  Eye,
  Bell,
  Grid2X2,
  Users,
  Waveform,
  CheckCircle2,
  Lock,
  Quote,
  ChevronDown,
} from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut", delay },
  }),
};

const sectionViewport = { once: true, amount: 0.2 };

export default function LandingPage() {
  const [isDark, setIsDark] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("signup");

  useEffect(() => {
    // Keep body background in sync with theme
    if (typeof document !== "undefined") {
      document.body.classList.toggle("dark", isDark);
    }
  }, [isDark]);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const openAuth = (tab: "login" | "signup") => {
    setAuthTab(tab);
    setAuthOpen(true);
  };

  const marqueeKeyframes = `
    @keyframes landing-marquee {
      0% { transform: translateX(0%); }
      100% { transform: translateX(-50%); }
    }
  `;

  return (
    <div className={isDark ? "dark" : ""}>
      <style dangerouslySetInnerHTML={{ __html: marqueeKeyframes }} />
      <div className="min-h-screen bg-[#FAFAFF] text-[#0D0D1A] dark:bg-[#0A0A0F] dark:text-[#F4F4F8]">
        {/* Background grid & glow */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#2A2A3A_1px,transparent_1px),linear-gradient(to_bottom,#2A2A3A_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#7C3AED33] blur-[120px]" />
          <div className="absolute -bottom-32 -left-10 h-64 w-64 rounded-full bg-violet-600/40 blur-[80px]" />
          <div className="absolute -top-10 right-0 h-72 w-72 rounded-full bg-indigo-500/40 blur-[80px]" />
        </div>

        {/* NAVBAR */}
        <header className="sticky top-0 z-50">
          <motion.nav
            className="border-b bg-white/80 dark:bg-[#0A0A0F]/80 backdrop-blur-xl border-[#E2E2EE] dark:border-[#2A2A3A]"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
              {/* Logo */}
              <button
                className="flex items-center gap-2"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-violet-600/15 border border-violet-500/40">
                  <Shield className="h-5 w-5 text-violet-400" />
                </div>
                <span className="bg-gradient-to-r from-violet-500 via-violet-400 to-indigo-300 bg-clip-text text-lg font-semibold tracking-tight text-transparent">
                  CyberNest
                </span>
              </button>

              {/* Center links */}
              <div className="hidden items-center gap-8 text-sm font-medium text-[#4A4A6A] dark:text-[#9090A8] md:flex">
                {[
                  { id: "features", label: "Features" },
                  { id: "how-it-works", label: "How it Works" },
                  { id: "pricing", label: "Pricing" },
                  { id: "reviews", label: "Reviews" },
                  { id: "faq", label: "FAQ" },
                ].map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToId(link.id)}
                    className="relative flex items-center gap-1 transition-colors hover:text-violet-400"
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 rounded-full bg-gradient-to-r from-violet-500 to-indigo-400 transition-all duration-300 group-hover:w-full" />
                  </button>
                ))}
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-2 md:gap-3">
                <button
                  aria-label="Toggle dark mode"
                  onClick={() => setIsDark((prev) => !prev)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E2EE] bg-white/60 text-[#4A4A6A] shadow-sm transition-colors hover:bg-[#F0F0F8] dark:border-[#2A2A3A] dark:bg-[#13131A] dark:text-[#F4F4F8] dark:hover:bg-[#1C1C27]"
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <div className="hidden items-center gap-2 md:flex">
                  <button
                    onClick={() => openAuth("login")}
                    className="h-9 rounded-full border border-violet-500/70 px-4 text-sm font-semibold text-violet-500 transition-colors hover:bg-violet-500/10"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => openAuth("signup")}
                    className="inline-flex h-9 items-center justify-center rounded-full bg-violet-600 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-600/40 transition-colors hover:bg-violet-500"
                  >
                    Get Started
                  </button>
                </div>

                {/* Mobile menu button */}
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E2EE] bg-white/70 text-[#0D0D1A] transition-colors hover:bg-[#F0F0F8] dark:border-[#2A2A3A] dark:bg-[#13131A] dark:text-[#F4F4F8] md:hidden"
                  onClick={() => setMobileOpen((prev) => !prev)}
                >
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Mobile drawer */}
            <AnimatePresence>
              {mobileOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-[#E2E2EE] bg-white/95 px-4 pb-4 pt-2 text-sm text-[#4A4A6A] shadow-sm dark:border-[#2A2A3A] dark:bg-[#13131A]/95 dark:text-[#C8C8E0] md:hidden"
                >
                  <div className="flex flex-col gap-2">
                    {[
                      { id: "features", label: "Features" },
                      { id: "how-it-works", label: "How it Works" },
                      { id: "pricing", label: "Pricing" },
                      { id: "reviews", label: "Reviews" },
                      { id: "faq", label: "FAQ" },
                    ].map((link) => (
                      <button
                        key={link.id}
                        onClick={() => {
                          scrollToId(link.id);
                          setMobileOpen(false);
                        }}
                        className="flex items-center justify-between rounded-xl px-2 py-2 text-left hover:bg-[#F0F0F8] dark:hover:bg-[#1C1C27]"
                      >
                        <span>{link.label}</span>
                        <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
                      </button>
                    ))}
                    <div className="mt-2 flex flex-col gap-2">
                      <button
                        onClick={() => {
                          openAuth("login");
                          setMobileOpen(false);
                        }}
                        className="h-10 rounded-full border border-violet-500/70 px-4 text-sm font-semibold text-violet-500 transition-colors hover:bg-violet-500/10"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => {
                          openAuth("signup");
                          setMobileOpen(false);
                        }}
                        className="inline-flex h-10 items-center justify-center rounded-full bg-violet-600 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-600/40 transition-colors hover:bg-violet-500"
                      >
                        Get Started
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.nav>
        </header>

        <main className="mx-auto max-w-6xl px-4 pb-20 pt-12 md:px-6 lg:px-8 lg:pt-16">
          {/* HERO */}
          <section className="relative min-h-[80vh] pt-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={sectionViewport}
              variants={fadeUp}
              custom={0}
              className="mx-auto flex max-w-3xl flex-col items-center text-center"
            >
              <motion.div
                variants={fadeUp}
                custom={0}
                className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-300"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>New Gen Child Safety Platform</span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={0.1}
                className="mt-6 text-balance text-[clamp(40px,6vw,72px)] font-extrabold leading-tight tracking-[-0.03em]"
              >
                Protect Your Child.
                <br />
                <span className="bg-gradient-to-r from-violet-400 via-violet-300 to-indigo-300 bg-clip-text text-transparent">
                  Peace of Mind,
                </span>
                <br />
                Always On.
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={0.2}
                className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#4A4A6A] dark:text-[#9090A8]"
              >
                CyberNest blocks harmful content before it reaches your child. One tap setup.
                Real-time protection. Works silently in the background.
              </motion.p>

              <motion.div
                variants={fadeUp}
                custom={0.3}
                className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
              >
                <button
                  onClick={() => openAuth("signup")}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-violet-600 px-8 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(124,58,237,0.55)] transition-colors hover:bg-violet-500"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
                <button
                  onClick={() => scrollToId("how-it-works")}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-[#2A2A3A] bg-transparent px-8 text-sm font-semibold text-[#F4F4F8] transition-colors hover:bg-[#1C1C27] dark:border-[#2A2A3A] dark:text-[#F4F4F8] md:text-[15px]"
                >
                  See How It Works
                </button>
              </motion.div>

              <motion.div
                variants={fadeUp}
                custom={0.4}
                className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[13px] text-[#5A5A72]"
              >
                <span>🔒 No credit card required</span>
                <span className="hidden text-[#5A5A72] sm:inline">·</span>
                <span>✅ 2-minute setup</span>
                <span className="hidden text-[#5A5A72] sm:inline">·</span>
                <span>👨‍👧 10,000+ families protected</span>
              </motion.div>
            </motion.div>

            {/* Hero video card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 40 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={sectionViewport}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.35 }}
              className="mx-auto mt-14 max-w-4xl"
            >
              <div className="relative rounded-[32px] bg-gradient-to-tr from-violet-600 via-indigo-500 to-violet-400 p-[1.5px] shadow-[0_40px_120px_rgba(124,58,237,0.6)]">
                <div className="relative overflow-hidden rounded-[30px] bg-[#050509]">
                  {/* Fake browser chrome */}
                  <div className="flex items-center justify-between gap-3 border-b border-white/5 bg-gradient-to-r from-white/5 via-white/0 to-white/5 px-4 py-2 text-xs text-[#9090A8]">
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="flex flex-1 items-center justify-center">
                      <div className="flex w-full max-w-md items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-[11px]">
                        <ShieldCheck className="h-3.5 w-3.5 text-violet-300" />
                        <span className="truncate text-[#E4E4FF]">CyberNest · Live Protection Demo</span>
                      </div>
                    </div>
                    <div className="h-2.5 w-8 rounded-full bg-white/10" />
                  </div>

                  {/* Video frame */}
                  <div className="relative aspect-video w-full bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.3),transparent_55%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.9),#020617)]">
                    <video
                      className="h-full w-full object-cover"
                      src="/videos/CyberNest-hero.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      controls
                    />

                    {/* Gradient overlay + highlight border */}
                    <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/5" />

                    {/* Play badge overlay */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
                      <div className="inline-flex items-center gap-2 rounded-full bg-black/50 px-4 py-1.5 text-[11px] font-medium text-[#E4E4FF] backdrop-blur-md">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500">
                          ►
                        </span>
                        <span>See CyberNest blocking a risky site in real time</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* SOCIAL PROOF MARQUEE */}
          <section className="mt-16 rounded-2xl border border-[#E2E2EE] bg-[#F0F0F8] px-4 py-4 text-xs text-[#9090B0] dark:border-[#2A2A3A] dark:bg-[#13131A] dark:text-[#5A5A72]">
            <div className="mx-auto flex max-w-5xl items-center gap-6">
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#9090B0] dark:text-[#5A5A72]">
                Trusted By
              </span>
              <div className="relative flex-1 overflow-hidden">
                <div
                  className="flex min-w-max gap-10 whitespace-nowrap"
                  style={{ animation: "landing-marquee 30s linear infinite" }}
                >
                  {[
                    "TechCrunch",
                    "ProductHunt",
                    "Forbes",
                    "The Hindu",
                    "NDTV",
                    "EdTech India",
                    "SafeNet",
                    "CyberKids",
                  ]
                    .concat([
                      "TechCrunch",
                      "ProductHunt",
                      "Forbes",
                      "The Hindu",
                      "NDTV",
                      "EdTech India",
                      "SafeNet",
                      "CyberKids",
                    ])
                    .map((name, i) => (
                      <span key={i} className="font-mono text-[11px] tracking-[0.18em] text-[#9090B0] dark:text-[#5A5A72]">
                        {name}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </section>

          {/* BENEFITS */}
          <motion.section
            id="benefits"
            className="mt-20 space-y-8"
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
          >
            <motion.div variants={fadeUp} custom={0}>
              <div className="inline-flex rounded-full border border-[#2A2A3A] bg-[#13131A] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9090A8] dark:border-[#2A2A3A] dark:bg-[#13131A]">
                Benefits
              </div>
              <h2 className="mt-4 text-[clamp(28px,4vw,40px)] font-bold leading-tight tracking-[-0.02em]">
                Why Parents Choose CyberNest
              </h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#4A4A6A] dark:text-[#9090A8]">
                Everything you need to keep your child safe online — without the complexity.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={0.1}
              className="grid gap-5 md:grid-cols-3"
            >
              {[
                {
                  icon: ShieldCheck,
                  title: "Real-Time Protection",
                  body: "Harmful content is identified and blocked instantly — before it ever loads on your child's screen.",
                },
                {
                  icon: Zap,
                  title: "Zero Tech Skills Needed",
                  body: "One-tap setup with QR code activation. If you can use WhatsApp, you can use CyberNest.",
                },
                {
                  icon: Eye,
                  title: "Always On, Invisible",
                  body: "Runs silently in the background. Your child won't notice it. You'll always know it's working.",
                },
              ].map((card, i) => (
                <div
                  key={card.title}
                  className="group flex flex-col rounded-2xl border border-[#E2E2EE] bg-[#FFFFFF] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-violet-500/60 hover:shadow-xl hover:shadow-violet-500/10 dark:border-[#2A2A3A] dark:bg-[#13131A]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#4A4A6A] dark:text-[#9090A8]">
                    {card.body}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.section>

          {/* FEATURES BENTO GRID */}
          <motion.section
            id="features"
            className="mt-20 space-y-8"
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
          >
            <motion.div variants={fadeUp} custom={0}>
              <div className="inline-flex rounded-full border border-[#2A2A3A] bg-[#13131A] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9090A8] dark:border-[#2A2A3A] dark:bg-[#13131A]">
                Features
              </div>
              <h2 className="mt-4 text-[clamp(28px,4vw,40px)] font-bold leading-tight tracking-[-0.02em]">
                All Features in One Place
              </h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#4A4A6A] dark:text-[#9090A8]">
                Built for parents. Powered by AI.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={0.1}
              className="grid gap-5 md:grid-cols-3"
            >
              {/* Card A - Smart Content Filtering */}
              <div className="md:col-span-2 space-y-4 rounded-2xl border border-[#2A2A3A] bg-[#13131A] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5A5A72]">
                      Smart Content Filtering
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-[#F4F4F8]">
                      Blocks 15+ categories in real time
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-[#9090A8]">
                  Blocks 15+ categories of harmful content using AI classification.
                </p>
                <div className="mt-3 space-y-2">
                  {["Violence", "Adult Content", "Gambling", "Scams"].map((item, idx) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={sectionViewport}
                      transition={{ delay: 0.15 + idx * 0.06, duration: 0.4 }}
                      className="flex items-center justify-between rounded-xl bg-[#0A0A0F] px-3 py-2 text-sm"
                    >
                      <span className="text-[#C8C8E0]">{item}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-400">
                        <span>❌</span>
                        Blocked
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Card B - Real-Time Alerts */}
              <div className="space-y-3 rounded-2xl border border-[#E2E2EE] bg-[#FFFFFF] p-5 dark:border-[#2A2A3A] dark:bg-[#13131A]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                  <Bell className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold">Instant Parent Alerts</h3>
                <p className="text-sm text-[#4A4A6A] dark:text-[#9090A8]">
                  Get notified the moment something is blocked.
                </p>
                <div className="mt-3 space-y-2 rounded-xl bg-[#F0F0F8] p-3 text-xs text-[#4A4A6A] dark:bg-[#1C1C27] dark:text-[#C8C8E0]">
                  <p className="font-medium">New alert · Aarav&apos;s Laptop</p>
                  <p className="text-[11px]">
                    &ldquo;Gambling site blocked while searching for free games.&rdquo;
                  </p>
                </div>
              </div>

              {/* Card C - QR Setup */}
              <div className="space-y-3 rounded-2xl border border-[#E2E2EE] bg-[#FFFFFF] p-5 dark:border-[#2A2A3A] dark:bg-[#13131A]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                  <Grid2X2 className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold">QR Code Activation</h3>
                <p className="text-sm text-[#4A4A6A] dark:text-[#9090A8]">
                  No tokens, no copy-paste. Just scan and protect.
                </p>
                <div className="mt-3 grid h-24 w-24 place-items-center rounded-xl border border-dashed border-[#2A2A3A] text-[10px] text-[#9090A8]">
                  ▢ ▢ ▢
                  <br />
                  QR Mock
                </div>
              </div>

              {/* Card D - Dashboard */}
              <div className="md:col-span-2 space-y-4 rounded-2xl border border-[#2A2A3A] bg-[#13131A] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5A5A72]">
                      Live Dashboard
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-[#F4F4F8]">
                      See everything in one place
                    </h3>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-[1.2fr,1fr]">
                  <div className="space-y-3 rounded-xl bg-[#0A0A0F] p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/20 text-xs font-semibold text-violet-200">
                          AK
                        </div>
                        <div>
                          <p className="text-[11px] text-[#5A5A72]">Child</p>
                          <p className="text-sm font-semibold text-[#F4F4F8]">Aarav Kumar</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                        ● Online
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px] text-[#C8C8E0]">
                      <div>
                        <p className="text-[#5A5A72]">Today</p>
                        <p className="font-semibold">1h 42m</p>
                      </div>
                      <div>
                        <p className="text-[#5A5A72]">Blocked</p>
                        <p className="font-semibold">7</p>
                      </div>
                      <div>
                        <p className="text-[#5A5A72]">High risk</p>
                        <p className="font-semibold text-emerald-400">0</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 rounded-xl bg-[#1C1C27] p-3 text-xs text-[#C8C8E0]">
                    <p className="font-semibold">Highlights</p>
                    <ul className="mt-1 space-y-1 text-[11px] text-[#9090A8]">
                      <li>• New device added from Chrome</li>
                      <li>• 3 gambling sites blocked in last hour</li>
                      <li>• Daily report scheduled for 9 PM</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Card E - Multi-Child */}
              <div className="space-y-3 rounded-2xl border border-[#E2E2EE] bg-[#FFFFFF] p-5 dark:border-[#2A2A3A] dark:bg-[#13131A]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold">Multiple Children</h3>
                <p className="text-sm text-[#4A4A6A] dark:text-[#9090A8]">
                  Add and manage multiple child profiles from one account.
                </p>
                <div className="mt-3 flex items-center -space-x-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0F0F8] text-xs font-semibold text-[#4A4A6A] dark:bg-[#1C1C27] dark:text-[#C8C8E0]">
                    AK
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0F0F8] text-xs font-semibold text-[#4A4A6A] dark:bg-[#1C1C27] dark:text-[#C8C8E0]">
                    SK
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/15 text-xs font-semibold text-violet-400">
                    +1
                  </div>
                </div>
              </div>

              {/* Card F - Voice Assistant */}
              <div className="md:col-span-2 space-y-3 rounded-2xl border border-[#2A2A3A] bg-[#13131A] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5A5A72]">
                      AI Voice Assistant
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-[#F4F4F8]">
                      Ask CyberNest anything
                    </h3>
                    <p className="mt-1 text-sm text-[#9090A8]">
                      In English or Hindi. Powered by Ollama (llama3).
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-end gap-1">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <motion.span
                          key={i}
                          className="w-1 rounded-full bg-gradient-to-t from-violet-600 via-violet-400 to-indigo-400"
                          initial={{ height: 6 + (i % 3) * 4 }}
                          animate={{ height: [10, 28, 14, 22, 10][i % 5] }}
                          transition={{
                            repeat: Infinity,
                            repeatType: "mirror",
                            duration: 1.6,
                            delay: i * 0.04,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 space-y-2 rounded-xl bg-[#0A0A0F] p-3 text-xs text-[#C8C8E0]">
                    <p className="font-medium">Example questions</p>
                    <p className="text-[11px] text-[#9090A8]">
                      “Is this website safe for my 10-year-old?” <br />
                      “Limit YouTube to 30 minutes per day.” <br />
                      “Block all gambling content in Hindi.”
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.section>

          {/* HOW IT WORKS */}
          <motion.section
            id="how-it-works"
            className="mt-20 space-y-10"
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
          >
            <motion.div variants={fadeUp} custom={0}>
              <div className="inline-flex rounded-full border border-[#2A2A3A] bg-[#13131A] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9090A8] dark:border-[#2A2A3A] dark:bg-[#13131A]">
                Process
              </div>
              <h2 className="mt-4 text-[clamp(28px,4vw,40px)] font-bold leading-tight tracking-[-0.02em]">
                Simple &amp; Smart Setup
              </h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#4A4A6A] dark:text-[#9090A8]">
                From zero to protected in under 2 minutes.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={0.1}
              className="relative grid gap-6 md:grid-cols-3"
            >
              {/* Connector line (desktop) */}
              <div className="pointer-events-none absolute inset-x-8 top-9 hidden border-t border-dashed border-[#2A2A3A] md:block" />

              {[
                {
                  number: "01",
                  title: "Create Your Account",
                  emoji: "📱",
                  body: "Sign up with Google or email in one click. No forms, no friction.",
                  visual: "auth",
                },
                {
                  number: "02",
                  title: "Add Your Child",
                  emoji: "👶",
                  body: "Enter your child's name. Token is generated and copied automatically.",
                  visual: "child",
                },
                {
                  number: "03",
                  title: "Scan & Activate",
                  emoji: "📷",
                  body: "Install the browser extension and scan the QR code. Protection starts instantly.",
                  visual: "qr",
                },
              ].map((step, i) => (
                <div key={step.number} className="relative flex flex-col gap-4 rounded-2xl border border-[#2A2A3A] bg-[#13131A] p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10 text-xs font-semibold text-violet-300">
                      {step.number}
                    </span>
                    <span className="text-lg">{step.emoji}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#F4F4F8]">{step.title}</h3>
                    <p className="mt-2 text-sm text-[#9090A8]">{step.body}</p>
                  </div>
                  {/* Visuals */}
                  {step.visual === "auth" && (
                    <div className="mt-2 rounded-xl bg-[#0A0A0F] p-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-[#C8C8E0]">
                          <ShieldCheck className="h-4 w-4 text-violet-400" />
                          Quick sign in
                        </span>
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                          1-click
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-center rounded-full bg-[#13131A] px-3 py-2 text-[11px] text-[#C8C8E0]">
                        Continue with Google
                      </div>
                    </div>
                  )}
                  {step.visual === "child" && (
                    <div className="mt-2 rounded-xl bg-[#0A0A0F] p-3 text-xs text-[#C8C8E0]">
                      <p className="text-[11px] text-[#5A5A72]">Add child</p>
                      <div className="mt-2 flex items-center justify-between rounded-lg bg-[#13131A] px-3 py-2">
                        <span className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-violet-400" />
                          Aarav
                        </span>
                        <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
                          Token copied
                        </span>
                      </div>
                    </div>
                  )}
                  {step.visual === "qr" && (
                    <div className="mt-2 flex items-center justify-between rounded-xl bg-[#0A0A0F] p-3 text-xs text-[#C8C8E0]">
                      <div className="grid h-16 w-16 place-items-center rounded-lg border border-dashed border-[#2A2A3A] text-[9px] text-[#9090A8]">
                        ▢ ▢ ▢
                        <br />
                        QR
                      </div>
                      <div className="flex-1 pl-3 text-[11px] text-[#9090A8]">
                        Scan once from your child&apos;s browser and you&apos;re done.
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          </motion.section>

          {/* PRICING */}
          <motion.section
            id="pricing"
            className="mt-20 space-y-8"
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
          >
            <motion.div variants={fadeUp} custom={0}>
              <div className="inline-flex rounded-full border border-[#2A2A3A] bg-[#13131A] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9090A8] dark:border-[#2A2A3A] dark:bg-[#13131A]">
                Pricing
              </div>
              <h2 className="mt-4 text-[clamp(28px,4vw,40px)] font-bold leading-tight tracking-[-0.02em]">
                Simple Pricing for Busy Parents
              </h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#4A4A6A] dark:text-[#9090A8]">
                Start free. Upgrade only when you love it.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={0.1}
              className="grid gap-5 md:grid-cols-[1.4fr,1fr]"
            >
              <div className="relative rounded-2xl border border-violet-500/70 bg-gradient-to-br from-[#1C1C27] via-[#13131A] to-[#0A0A0F] p-6 text-sm text-[#F4F4F8] shadow-[0_24px_80px_rgba(124,58,237,0.65)]">
                <div className="mb-4 inline-flex rounded-full bg-violet-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-100">
                  Most Popular
                </div>
                <h3 className="text-lg font-semibold">Family Plan</h3>
                <p className="mt-1 text-[13px] text-violet-100/80">
                  For parents who want serious protection without the complexity.
                </p>
                <div className="mt-5 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-tight">₹299</span>
                  <span className="text-xs text-violet-100/80">per month · billed yearly</span>
                </div>
                <p className="mt-2 text-[12px] text-violet-100/70">
                  Covers up to 5 child profiles and unlimited devices.
                </p>
                <ul className="mt-4 space-y-2 text-[13px]">
                  {[
                    "Smart content filtering with 15+ categories",
                    "Real-time alerts on Telegram & dashboard",
                    "Live activity view with 30-day history",
                    "AI voice assistant (English & Hindi)",
                    "Priority support over WhatsApp",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-[2px] h-4 w-4 text-emerald-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => openAuth("signup")}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-violet-700 shadow-lg shadow-black/20 transition-colors hover:bg-violet-50"
                  >
                    Start Free Trial
                  </button>
                  <span className="text-[11px] text-violet-100/70">
                    No credit card required · Cancel anytime
                  </span>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-[#2A2A3A] bg-[#13131A] p-5 text-sm text-[#C8C8E0]">
                <h3 className="text-base font-semibold">Free forever</h3>
                <p className="text-[13px] text-[#9090A8]">
                  Perfect for trying CyberNest on a single child device.
                </p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight">₹0</span>
                  <span className="text-xs text-[#9090A8]">per month</span>
                </div>
                <ul className="mt-3 space-y-2 text-[13px]">
                  {[
                    "1 child profile · 1 device",
                    "Core content filtering",
                    "Basic activity view",
                    "Email support",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-[2px] h-4 w-4 text-emerald-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.section>

          {/* REVIEWS */}
          <motion.section
            id="reviews"
            className="mt-20 space-y-8"
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
          >
            <motion.div variants={fadeUp} custom={0}>
              <div className="inline-flex rounded-full border border-[#2A2A3A] bg-[#13131A] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9090A8] dark:border-[#2A2A3A] dark:bg-[#13131A]">
                Reviews
              </div>
              <h2 className="mt-4 text-[clamp(28px,4vw,40px)] font-bold leading-tight tracking-[-0.02em]">
                Parents Love CyberNest
              </h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#4A4A6A] dark:text-[#9090A8]">
                Built with real Indian families — tested across thousands of devices.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={0.1}
              className="grid gap-5 md:grid-cols-3"
            >
              {[
                {
                  name: "Priya Sharma",
                  role: "Mother of 2 · Bengaluru",
                  text: "I set this up during a tea break. Since then, I get a ping only when something truly risky happens.",
                },
                {
                  name: "Rahul Mehta",
                  role: "Single dad · Mumbai",
                  text: "The Hindi voice assistant is a game changer for my parents. They can ask questions in their own words.",
                },
                {
                  name: "Anita & Rohan",
                  role: "Parents · Delhi NCR",
                  text: "We tried three other tools. CyberNest is the first one that our kids never tried to uninstall.",
                },
              ].map((review) => (
                <div
                  key={review.name}
                  className="flex flex-col justify-between rounded-2xl border border-[#2A2A3A] bg-[#13131A] p-5"
                >
                  <Quote className="h-5 w-5 text-violet-500" />
                  <p className="mt-3 text-sm leading-relaxed text-[#C8C8E0]">{review.text}</p>
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-[#F4F4F8]">{review.name}</p>
                    <p className="text-[11px] text-[#9090A8]">{review.role}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.section>

          {/* FAQ */}
          <motion.section
            id="faq"
            className="mt-20 space-y-8"
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
          >
            <motion.div variants={fadeUp} custom={0}>
              <div className="inline-flex rounded-full border border-[#2A2A3A] bg-[#13131A] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9090A8] dark:border-[#2A2A3A] dark:bg-[#13131A]">
                FAQ
              </div>
              <h2 className="mt-4 text-[clamp(28px,4vw,40px)] font-bold leading-tight tracking-[-0.02em]">
                Questions, Answered
              </h2>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={0.1}
              className="space-y-3"
            >
              {[
                {
                  q: "Will my child know CyberNest is installed?",
                  a: "CyberNest runs quietly in the background. You control the dashboard, your child just experiences a safer internet.",
                },
                {
                  q: "Which browsers and devices do you support?",
                  a: "We currently support Chrome and Chromium-based browsers on Windows, macOS, and Linux. Mobile support is coming soon.",
                },
                {
                  q: "Can I pause protection temporarily?",
                  a: "Yes. You can temporarily relax filters or pause protection from the dashboard — with a full audit of when it was turned off.",
                },
                {
                  q: "How is my family's data stored?",
                  a: "All data is encrypted in transit and at rest. We never sell data to advertisers and only store what is necessary to keep your child safe.",
                },
              ].map((item) => (
                <details
                  key={item.q}
                  className="group rounded-2xl border border-[#2A2A3A] bg-[#13131A] px-4 py-3 text-sm"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                    <span className="text-sm font-medium text-[#F4F4F8]">{item.q}</span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1C1C27] text-xs text-[#9090A8] group-open:rotate-180 transition-transform">
                      ˅
                    </span>
                  </summary>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#9090A8]">{item.a}</p>
                </details>
              ))}
            </motion.div>
          </motion.section>

          {/* FINAL CTA */}
          <motion.section
            className="mt-20"
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-[#2A2A3A] bg-gradient-to-br from-[#1C1C27] via-[#13131A] to-[#0A0A0F] px-6 py-8 text-center md:flex-row md:text-left"
            >
              <div>
                <h2 className="text-[clamp(24px,3vw,32px)] font-bold tracking-[-0.02em] text-[#F4F4F8]">
                  Ready to make the internet safer for your child?
                </h2>
                <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#C8C8E0]">
                  Start your free trial today. No credit card, no contracts — just peace of mind.
                </p>
              </div>
              <div className="flex flex-col items-center gap-3 md:flex-row">
                <button
                  onClick={() => openAuth("signup")}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-violet-600 px-6 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(124,58,237,0.6)] transition-colors hover:bg-violet-500"
                >
                  Get Started in 2 Minutes
                </button>
                <button
                  onClick={() => openAuth("login")}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-violet-400/70 bg-transparent px-6 text-sm font-semibold text-violet-100 transition-colors hover:bg-violet-500/10"
                >
                  Sign In
                </button>
              </div>
            </motion.div>
          </motion.section>
        </main>

        {/* Auth Modal */}
        <AuthModal
          open={authOpen}
          initialMode="auth"
          initialTab={authTab}
          onClose={() => setAuthOpen(false)}
        />
      </div>
    </div>
  );
}


