import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Building2, ShieldCheck, Activity,
  Users, Menu, X, Cloud, Lock, RefreshCw,
  ChevronRight, Heart, BrainCircuit
} from 'lucide-react';

/* ─── Reusable fade-up hook ─────────────────────── */
function useFadeUp() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('lp-fadeup');
          obs.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── Design tokens ─────────────────────────────── */
const lp = {
  navy:      '#0B1F4B',
  navyDeep:  '#07142F',
  pink:      '#D6336C',
  pinkSoft:  '#FDE8F1',
  pinkLight: '#F9A8C9',
  offWhite:  '#F8F9FC',
  slate:     '#475569',
  border:    '#E5E7EF',
};

/* ─── Data ─────────────────────────────────────── */
const STEPS = [
  { n: '01', title: 'Submit Registration',   desc: "Use our portal to submit your hospital's credentials and create your initial admin account.", icon: Building2  },
  { n: '02', title: 'Platform Verification', desc: 'Our central JanmaLink team verifies your institution to ensure trust and compliance.',       icon: ShieldCheck },
  { n: '03', title: 'Workspace Activation',  desc: 'Once approved, your hospital workspace unlocks. You can now invite your clinical staff.',    icon: Users       },
  { n: '04', title: 'Go Live',               desc: 'Your staff log in with their specific roles and begin managing the entire maternity workflow.',icon: Activity   },
];

/* ─── Landing Page ──────────────────────────────── */
const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setDrawerOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const navLinks = [
    { href: '#process', label: 'How it Works' },
  ];

  const heroRef = useFadeUp();
  const ctaRef  = useFadeUp();

  return (
    <div
      className="lp-root min-h-screen bg-white overflow-x-hidden"
      style={{ fontFamily: 'var(--lp-font-body)', color: lp.navy }}
    >
      {/* ══════ HEADER — floating pill ══════ */}
      <header className="fixed top-0 inset-x-0 z-50 flex justify-center pt-4 px-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-[900px] flex items-center justify-between gap-4 px-4 transition-all duration-300"
          style={{
            height: 54,
            borderRadius: 999,
            backgroundColor: 'rgba(255,255,255,0.94)',
            backdropFilter: 'blur(18px)',
            border: `1.5px solid ${scrolled ? lp.border : 'rgba(229,231,239,0.7)'}`,
            boxShadow: scrolled
              ? '0 8px 32px rgba(11,31,75,.11), 0 1px 4px rgba(11,31,75,.06)'
              : '0 2px 16px rgba(11,31,75,.07)',
          }}
        >

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 pl-1" aria-label="JanmaLink home" style={{ textDecoration: 'none' }}>
            <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: lp.pinkSoft }}>
              <Heart size={15} style={{ color: lp.pink }} strokeWidth={2.5} />
            </div>
            <span className="text-[17px] font-extrabold tracking-tight select-none" style={{ fontFamily: 'var(--lp-font-head)' }}>
              <span style={{ color: lp.navy }}>Janma</span>
              <span style={{ color: lp.pink }}>Link</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Main navigation">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-[13px] font-semibold transition-colors relative group"
                style={{ color: lp.slate, textDecoration: 'none', fontFamily: 'var(--lp-font-head)' }}
                onMouseEnter={e => { e.currentTarget.style.color = lp.navy; }}
                onMouseLeave={e => { e.currentTarget.style.color = lp.slate; }}
              >
                {label}
                <span
                  className="absolute -bottom-0.5 left-0 w-0 group-hover:w-full h-[2px] rounded-full transition-all duration-200"
                  style={{ backgroundColor: lp.pink }}
                />
              </a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2 shrink-0 pr-1">
            <Link
              to="/login"
              className="text-[13px] font-bold px-4 py-1.5 rounded-full border transition-all"
              style={{ color: lp.navy, borderColor: lp.border, textDecoration: 'none', fontFamily: 'var(--lp-font-head)', backgroundColor: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = lp.navy; e.currentTarget.style.backgroundColor = lp.offWhite; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = lp.border; e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              Staff Login
            </Link>
            <Link
              to="/hospital-register"
              className="text-[13px] font-bold text-white px-4 py-1.5 rounded-full transition-all active:scale-95 flex items-center gap-1.5"
              style={{ backgroundColor: lp.pink, textDecoration: 'none', fontFamily: 'var(--lp-font-head)', boxShadow: '0 2px 10px rgba(214,51,108,.4)' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#b5275a'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = lp.pink; }}
            >
              Partner With Us <ArrowRight size={13} />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-full mr-1"
            style={{ color: lp.navy }}
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div
            className="relative ml-auto w-[300px] h-full flex flex-col p-6 shadow-2xl"
            style={{ backgroundColor: '#fff', fontFamily: 'var(--lp-font-head)' }}
          >
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-bold" style={{ color: lp.navy }}>
                <span>Janma</span><span style={{ color: lp.pink }}>Link</span>
              </span>
              <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-lg" style={{ color: lp.slate }} aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setDrawerOpen(false)}
                  className="text-base font-semibold px-4 py-3 rounded-xl"
                  style={{ color: lp.navy, textDecoration: 'none' }}
                >
                  {label}
                </a>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-3 pt-6 border-t" style={{ borderColor: lp.border }}>
              <Link
                to="/login"
                onClick={() => setDrawerOpen(false)}
                className="text-center text-sm font-semibold py-3 rounded-xl border"
                style={{ color: lp.navy, borderColor: lp.border, textDecoration: 'none' }}
              >
                Staff Login
              </Link>
              <Link
                to="/hospital-register"
                onClick={() => setDrawerOpen(false)}
                className="text-center text-sm font-semibold py-3 rounded-xl text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: lp.pink, textDecoration: 'none', boxShadow: '0 2px 12px rgba(214,51,108,.35)' }}
              >
                Partner With Us <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      <main>
        {/* ══════ HERO ══════ */}
        <section
          className="relative pt-[96px] pb-20 md:pt-[120px] md:pb-28 overflow-hidden"
          style={{ backgroundColor: lp.offWhite }}
        >
          <div
            className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-30"
            style={{ background: `radial-gradient(circle, ${lp.pinkSoft} 0%, transparent 70%)` }}
          />
          <div
            className="pointer-events-none absolute top-1/2 -left-60 w-[400px] h-[400px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #DBEAFE 0%, transparent 70%)' }}
          />

          <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

              {/* Left: Copy */}
              <div ref={heroRef} className="flex-1 max-w-xl" style={{ opacity: 0 }}>
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6 border"
                  style={{ backgroundColor: lp.pinkSoft, color: lp.pink, borderColor: lp.pinkLight, fontFamily: 'var(--lp-font-head)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: lp.pink }} />
                  B2B Maternity SaaS Platform
                </div>

                <h1
                  className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.07] mb-6"
                  style={{ fontFamily: 'var(--lp-font-head)', color: lp.navy }}
                >
                  Digitize your<br />
                  maternity ward.{' '}
                  <span style={{ color: lp.pink }}>End-to-end.</span>
                </h1>

                <p className="text-base md:text-lg leading-relaxed mb-8 max-w-[55ch]" style={{ color: lp.slate }}>
                  JanmaLink is a comprehensive SaaS solution provided exclusively to healthcare institutions. We equip hospitals with unified modules for OPD, inpatient delivery, lab, and pharmacy—replacing fragmented legacy systems.
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-10">
                  <Link
                    to="/hospital-register"
                    className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl text-sm font-bold text-white transition-all active:scale-95 group"
                    style={{ backgroundColor: lp.pink, textDecoration: 'none', boxShadow: '0 4px 16px rgba(214,51,108,.4)', fontFamily: 'var(--lp-font-head)' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#b5275a'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = lp.pink; }}
                  >
                    Register Your Hospital
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <a
                    href="#process"
                    className="inline-flex items-center gap-1.5 h-12 px-5 rounded-xl text-sm font-semibold border transition-colors"
                    style={{ color: lp.navy, borderColor: lp.border, textDecoration: 'none', fontFamily: 'var(--lp-font-head)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = lp.navy; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = lp.border; }}
                  >
                    How it Works <ChevronRight size={15} />
                  </a>
                </div>

                {/* Trust row */}
                <div className="flex flex-wrap gap-5">
                  {[
                    { icon: Cloud,      label: 'Secure cloud portal' },
                    { icon: Lock,       label: 'Role-based access' },
                    { icon: RefreshCw,  label: 'Continuous updates' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: lp.pinkSoft }}>
                        <Icon size={14} style={{ color: lp.pink }} strokeWidth={2} />
                      </div>
                      <span className="text-xs font-semibold" style={{ color: lp.slate }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: CSS Product Mockup */}
              <div className="flex-1 w-full max-w-md lg:max-w-none relative hidden sm:block">
                <div
                  className="relative rounded-3xl p-6 shadow-xl"
                  style={{ backgroundColor: lp.pinkSoft, minHeight: 340 }}
                >
                  {/* OPD Queue card */}
                  <div
                    className="rounded-2xl p-4 shadow-md mb-4"
                    style={{ backgroundColor: '#fff', border: `1px solid ${lp.border}` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wide" style={{ color: lp.navy, fontFamily: 'var(--lp-font-head)' }}>
                        OPD Queue — Morning
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#DCFCE7', color: '#15803D' }}>
                        Live
                      </span>
                    </div>
                    {[
                      { name: 'Priya S.',   token: 'T-04', status: 'In Consultation', risk: null },
                      { name: 'Ananya R.',  token: 'T-05', status: 'Waiting',          risk: 'High Risk' },
                      { name: 'Meena K.',  token: 'T-06', status: 'Waiting',          risk: null },
                    ].map(p => (
                      <div key={p.token} className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: lp.border }}>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: lp.navy }}>
                            {p.name[0]}
                          </span>
                          <div>
                            <p className="text-xs font-semibold" style={{ color: lp.navy }}>{p.name}</p>
                            <p className="text-[10px]" style={{ color: lp.slate }}>{p.token}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {p.risk && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
                              {p.risk}
                            </span>
                          )}
                          <span className="text-[10px]" style={{ color: lp.slate }}>{p.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Vitals mini-chart */}
                  <div className="rounded-2xl p-4 shadow-md" style={{ backgroundColor: '#fff', border: `1px solid ${lp.border}` }}>
                    <span className="text-[11px] font-bold uppercase tracking-wide block mb-2" style={{ color: lp.navy, fontFamily: 'var(--lp-font-head)' }}>
                      BP Trend · Priya S.
                    </span>
                    <div className="flex items-end gap-1 h-10">
                      {[55, 65, 60, 78, 72, 80, 76].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm"
                          style={{
                            height: `${h}%`,
                            backgroundColor: i === 3 || i === 5 ? lp.pink : lp.pinkLight,
                            opacity: 0.85,
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] mt-1.5" style={{ color: lp.slate }}>Last 7 readings · 140/90 peak</p>
                  </div>
                </div>

                {/* AI badge */}
                <div
                  className="absolute -top-3 -right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg text-xs font-bold text-white"
                  style={{ backgroundColor: lp.navy, fontFamily: 'var(--lp-font-head)' }}
                >
                  <BrainCircuit size={13} /> AI-Assisted
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════ ONBOARDING PROCESS ══════ */}
        <section id="process" className="py-24 md:py-28 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: lp.pink, fontFamily: 'var(--lp-font-head)' }}>
                Onboarding Process
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4" style={{ fontFamily: 'var(--lp-font-head)', color: lp.navy }}>
                Go live in four steps.
              </h2>
              <p className="text-base leading-relaxed max-w-xl mx-auto" style={{ color: lp.slate }}>
                Transitioning to JanmaLink is designed to be seamless. Here is how your hospital partners with us.
              </p>
            </div>

            {/* Desktop horizontal timeline */}
            <div className="hidden md:flex items-start gap-0 relative">
              <div
                className="absolute top-[22px] h-[2px]"
                style={{
                  left: 'calc(12.5%)',
                  right: 'calc(12.5%)',
                  background: `linear-gradient(90deg, ${lp.pink} 0%, ${lp.pinkLight} 100%)`,
                }}
              />
              {STEPS.map(({ n, title, desc, icon: Icon }, idx) => (
                <div key={n} className="flex-1 flex flex-col items-center text-center px-4">
                  <div
                    className="relative w-11 h-11 rounded-full flex items-center justify-center text-sm font-extrabold text-white mb-5 shrink-0 z-10"
                    style={{ backgroundColor: lp.navy, boxShadow: `0 0 0 4px white, 0 0 0 6px ${lp.pinkLight}`, fontFamily: 'var(--lp-font-head)' }}
                  >
                    {n}
                  </div>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: lp.pinkSoft }}>
                    <Icon size={18} style={{ color: lp.pink }} strokeWidth={1.8} />
                  </div>
                  <h3 className="text-sm font-bold mb-2" style={{ fontFamily: 'var(--lp-font-head)', color: lp.navy }}>{title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: lp.slate }}>{desc}</p>
                </div>
              ))}
            </div>

            {/* Mobile vertical timeline */}
            <div className="md:hidden flex flex-col gap-0 relative">
              <div
                className="absolute top-5 bottom-5 left-[22px] w-[2px]"
                style={{ background: `linear-gradient(180deg, ${lp.pink} 0%, ${lp.pinkLight} 100%)` }}
              />
              {STEPS.map(({ n, title, desc, icon: Icon }) => (
                <div key={n} className="relative pl-14 pb-10 last:pb-0">
                  <div
                    className="absolute left-0 top-0 w-11 h-11 rounded-full flex items-center justify-center text-sm font-extrabold text-white z-10"
                    style={{ backgroundColor: lp.navy, boxShadow: `0 0 0 3px white, 0 0 0 5px ${lp.pinkLight}`, fontFamily: 'var(--lp-font-head)' }}
                  >
                    {n}
                  </div>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: lp.pinkSoft }}>
                    <Icon size={18} style={{ color: lp.pink }} strokeWidth={1.8} />
                  </div>
                  <h3 className="text-sm font-bold mb-1" style={{ fontFamily: 'var(--lp-font-head)', color: lp.navy }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: lp.slate }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════ FINAL CTA BAND ══════ */}
        <section
          ref={ctaRef}
          className="py-24 md:py-28 relative overflow-hidden"
          style={{ backgroundColor: lp.navy, opacity: 0 }}
        >
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(214,51,108,.18) 0%, transparent 70%)' }}
          />
          <div className="max-w-[1200px] mx-auto px-6 text-center relative z-10">
            <h2
              className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-5"
              style={{ fontFamily: 'var(--lp-font-head)' }}
            >
              Modernize your maternity ward today.
            </h2>
            <p className="text-base leading-relaxed mb-9 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Partner with JanmaLink and bring clinical excellence, digital efficiency, and unified operations to your institution.
            </p>
            <Link
              to="/hospital-register"
              className="inline-flex items-center gap-2 h-[52px] px-8 rounded-xl text-sm font-bold transition-all active:scale-95"
              style={{
                backgroundColor: lp.pink,
                color: '#fff',
                textDecoration: 'none',
                boxShadow: '0 4px 24px rgba(214,51,108,.5)',
                fontFamily: 'var(--lp-font-head)',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#b5275a'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = lp.pink; }}
            >
              Start Your Registration <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      {/* ══════ FOOTER ══════ */}
      <footer className="pt-12 pb-8" style={{ backgroundColor: lp.navyDeep }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(249,168,201,0.15)' }}>
                  <Heart size={14} style={{ color: lp.pinkLight }} strokeWidth={2.5} />
                </div>
                <span className="text-lg font-bold" style={{ fontFamily: 'var(--lp-font-head)', color: '#fff' }}>
                  Janma<span style={{ color: lp.pinkLight }}>Link</span>
                </span>
              </div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>B2B Maternity SaaS Platform</p>
            </div>

            <nav className="flex flex-wrap gap-x-8 gap-y-2" aria-label="Footer navigation">
              {[
                { href: '#process',            label: 'How it Works',    isLink: false },
                { href: '/login',              label: 'Staff Login',     isLink: true  },
                { href: '/hospital-register',  label: 'Partner With Us', isLink: true  },
              ].map(({ href, label, isLink }) =>
                isLink ? (
                  <Link
                    key={label}
                    to={href}
                    className="text-xs font-medium transition-colors"
                    style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontFamily: 'var(--lp-font-head)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = lp.pinkLight; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                  >
                    {label}
                  </Link>
                ) : (
                  <a
                    key={label}
                    href={href}
                    className="text-xs font-medium transition-colors"
                    style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontFamily: 'var(--lp-font-head)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = lp.pinkLight; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                  >
                    {label}
                  </a>
                )
              )}
            </nav>
          </div>

          <p className="text-center text-xs pt-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
            © {new Date().getFullYear()} JanmaLink Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
