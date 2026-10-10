import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Building2, ShieldCheck, Activity,
  Users, Menu, X, Cloud, Lock, RefreshCw,
  ChevronRight, Heart, BrainCircuit, Sparkles, ChevronDown
} from 'lucide-react';

/* ─── Reusable Observer Hook ─────────────────────── */
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('animate-in');
          obs.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

const STEPS = [
  { n: '01', title: 'Submit Registration',   desc: "Use our portal to submit your hospital's credentials and create your initial admin account.", icon: Building2  },
  { n: '02', title: 'Platform Verification', desc: 'Our central JanmaLink team verifies your institution to ensure trust and compliance.',       icon: ShieldCheck },
  { n: '03', title: 'Workspace Activation',  desc: 'Once approved, your hospital workspace unlocks. You can now invite your clinical staff.',    icon: Users       },
  { n: '04', title: 'Go Live',               desc: 'Your staff log in with their specific roles and begin managing the entire maternity workflow.',icon: Activity   },
];

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const heroRef = useScrollReveal();
  const processRef = useScrollReveal();
  const ctaRef = useScrollReveal();

  return (
    <div className="min-h-screen bg-ink-50 font-body text-ink-900 overflow-x-hidden selection:bg-pink-500 selection:text-white">
      {/* ─── CSS OVERRIDES FOR ANIMATIONS ─── */}
      <style>{`
        .animate-in {
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-in-delay-1 {
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards;
        }
        .animate-in-delay-2 {
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .float { animation: float 6s ease-in-out infinite; }
        .float-delayed { animation: float 6s ease-in-out 3s infinite; }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 0;
          pointer-events: none;
        }
      `}</style>

      {/* ─── FLOATING HEADER ─── */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'pt-2 px-2 md:pt-4 md:px-4' : 'pt-6 px-6 md:pt-8 md:px-8'}`}>
        <div 
          className={`mx-auto max-w-6xl flex items-center justify-between transition-all duration-500 ${
            scrolled 
              ? 'bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-full px-4 py-2.5' 
              : 'bg-transparent px-2 py-2'
          }`}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group relative z-10">
            <div className="w-9 h-9 rounded-xl bg-brand135 flex items-center justify-center shrink-0 shadow-lg shadow-pink-500/20 group-hover:shadow-pink-500/40 transition-shadow duration-300">
              <Heart size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-heading font-extrabold tracking-tight text-ink-900 group-hover:text-blue-600 transition-colors duration-300">
              Janma<span className="text-pink-600">Link</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 relative z-10">
            <a href="#process" className="text-sm font-semibold text-ink-600 hover:text-ink-900 transition-colors">How it Works</a>
            <a href="#features" className="text-sm font-semibold text-ink-600 hover:text-ink-900 transition-colors">Features</a>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3 relative z-10">
            <Link to="/login" className="text-sm font-bold text-ink-700 hover:text-blue-600 px-5 py-2.5 rounded-full transition-colors">
              Staff Login
            </Link>
            <Link to="/hospital-register" className="text-sm font-bold text-white px-6 py-2.5 rounded-full bg-ink-900 hover:bg-ink-800 shadow-xl shadow-ink-900/10 hover:shadow-ink-900/20 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2">
              Partner With Us <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden relative z-10 p-2 text-ink-900" onClick={() => setDrawerOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* ─── MOBILE MENU ─── */}
      <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-md" onClick={() => setDrawerOpen(false)} />
        <div className={`absolute right-0 top-0 bottom-0 w-[300px] bg-white p-6 flex flex-col shadow-2xl transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex justify-between items-center mb-10">
            <span className="text-lg font-heading font-extrabold text-ink-900">
              Janma<span className="text-pink-600">Link</span>
            </span>
            <button onClick={() => setDrawerOpen(false)} className="p-2 text-ink-400 bg-ink-50 rounded-full hover:bg-ink-100 hover:text-ink-900 transition-colors">
              <X size={20} />
            </button>
          </div>
          <nav className="flex flex-col gap-2">
            <a href="#process" onClick={() => setDrawerOpen(false)} className="px-4 py-3 text-lg font-semibold text-ink-700 hover:bg-ink-50 rounded-xl transition-colors">How it Works</a>
            <a href="#features" onClick={() => setDrawerOpen(false)} className="px-4 py-3 text-lg font-semibold text-ink-700 hover:bg-ink-50 rounded-xl transition-colors">Features</a>
          </nav>
          <div className="mt-auto flex flex-col gap-3">
            <Link to="/login" onClick={() => setDrawerOpen(false)} className="px-4 py-3.5 text-center text-sm font-bold text-ink-900 bg-ink-50 rounded-xl hover:bg-ink-100 transition-colors">
              Staff Login
            </Link>
            <Link to="/hospital-register" onClick={() => setDrawerOpen(false)} className="px-4 py-3.5 text-center text-sm font-bold text-white bg-brand135 rounded-xl shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2">
              Partner With Us <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <main>
        {/* ─── HERO SECTION ─── */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          {/* Abstract Background Orbs */}
          <div className="glow-orb w-[600px] h-[600px] bg-pink-500/10 top-0 left-[-200px]" />
          <div className="glow-orb w-[500px] h-[500px] bg-blue-600/10 bottom-[-100px] right-[-100px]" />
          
          <div className="max-w-[1200px] mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              
              {/* Hero Copy */}
              <div ref={heroRef} className="flex-1 opacity-0 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-8 border border-white bg-white/60 backdrop-blur-md shadow-sm shadow-ink-900/5 text-ink-700">
                  <Sparkles size={14} className="text-pink-500" />
                  Next-Gen B2B Maternity Platform
                </div>

                <h1 className="text-5xl sm:text-6xl md:text-7xl font-heading font-extrabold tracking-tight leading-[1.05] mb-8 text-ink-900">
                  Elevate your<br />
                  <span className="text-transparent bg-clip-text bg-brand135">maternity care.</span>
                </h1>

                <p className="text-lg md:text-xl leading-relaxed mb-10 max-w-[55ch] mx-auto lg:mx-0 text-ink-600 font-medium">
                  JanmaLink unifies your entire maternity workflow—from OPD queue management to inpatient delivery, labs, and AI-assisted diagnostics—in one seamless digital workspace.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
                  <Link
                    to="/hospital-register"
                    className="flex items-center justify-center gap-2 h-14 px-8 rounded-full text-base font-bold text-white bg-brand135 shadow-xl shadow-pink-500/25 hover:shadow-pink-500/40 transition-all hover:-translate-y-1 active:translate-y-0 w-full sm:w-auto group"
                  >
                    Register Your Hospital
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <a
                    href="#process"
                    className="flex items-center justify-center gap-2 h-14 px-8 rounded-full text-base font-bold text-ink-900 bg-white border border-ink-200 hover:border-ink-300 shadow-sm transition-all hover:bg-ink-50 w-full sm:w-auto"
                  >
                    See How it Works
                  </a>
                </div>

                <div className="flex items-center justify-center lg:justify-start flex-wrap gap-6 text-sm font-semibold text-ink-500">
                  <div className="flex items-center gap-2"><Cloud size={16} className="text-blue-500" /> Secure Cloud</div>
                  <div className="flex items-center gap-2"><Lock size={16} className="text-blue-500" /> Role-Based Access</div>
                  <div className="flex items-center gap-2"><BrainCircuit size={16} className="text-pink-500" /> AI Insights</div>
                </div>
              </div>

              {/* Hero UI Mockup */}
              <div className="flex-1 w-full max-w-xl relative hidden lg:block perspective-[1000px]">
                {/* Main Dashboard Card */}
                <div className="relative bg-white/70 backdrop-blur-2xl border border-white shadow-2xl rounded-3xl p-6 float rotate-[-2deg] z-20">
                  <div className="flex justify-between items-center mb-6">
                    <div className="font-heading font-bold text-ink-900 flex items-center gap-2">
                      <Activity className="text-pink-500" size={18} /> Ward Activity
                    </div>
                    <div className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">Live</div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: 'Priya Sharma', room: 'Ward A-102', status: 'In Labor', bg: 'bg-red-50 text-red-700 border-red-100' },
                      { name: 'Ananya Roy', room: 'Ward B-205', status: 'Postpartum', bg: 'bg-blue-50 text-blue-700 border-blue-100' },
                      { name: 'Meena Kapoor', room: 'OPD Queue', status: 'Waiting', bg: 'bg-ink-50 text-ink-700 border-ink-200' },
                    ].map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-2xl border border-ink-100 bg-white shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${p.bg.split(' ')[0]} ${p.bg.split(' ')[1]}`}>
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-ink-900 text-sm">{p.name}</div>
                            <div className="text-xs text-ink-500 font-medium">{p.room}</div>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${p.bg}`}>
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Fetus Card (Floating Behind) */}
                <div className="absolute top-[-30px] right-[-40px] bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-2xl p-5 w-64 float-delayed rotate-[4deg] z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <BrainCircuit size={16} className="text-blue-600" />
                    <span className="font-heading font-bold text-ink-900 text-sm">AI Fetus Analysis</span>
                  </div>
                  <div className="h-24 bg-ink-900 rounded-xl mb-3 overflow-hidden relative">
                    {/* Mock Ultrasound scanline */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                    <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] opacity-50 blur-[1px]"></div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[10px] text-ink-500 font-semibold uppercase">Prediction</div>
                      <div className="text-sm font-bold text-green-600">Healthy / Normal</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── ONBOARDING PROCESS ─── */}
        <section id="process" className="py-24 md:py-32 bg-white relative">
          <div className="max-w-[1200px] mx-auto px-6 relative z-10">
            <div className="text-center mb-20">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-pink-600 mb-4 block">Deployment</span>
              <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-ink-900 mb-6">
                Go live in four simple steps.
              </h2>
              <p className="text-lg text-ink-600 max-w-2xl mx-auto font-medium">
                Transitioning to JanmaLink is designed to be seamless. We set up your digital infrastructure so you can focus on patient care.
              </p>
            </div>

            <div ref={processRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 opacity-0">
              {STEPS.map(({ n, title, desc, icon: Icon }, idx) => (
                <div key={n} className="group relative bg-ink-50 rounded-3xl p-8 hover:bg-white hover:shadow-pop border border-transparent hover:border-ink-200 transition-all duration-300 hover:-translate-y-2">
                  <div className="absolute top-6 right-6 text-6xl font-heading font-black text-ink-200/50 group-hover:text-pink-100 transition-colors pointer-events-none">
                    {n}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-8 border border-ink-100 group-hover:bg-brand135 transition-colors duration-300">
                    <Icon size={24} className="text-ink-700 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-ink-900 mb-3">{title}</h3>
                  <p className="text-ink-600 font-medium leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="py-24 md:py-32 px-6">
          <div ref={ctaRef} className="max-w-[1000px] mx-auto bg-ink-900 rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl opacity-0">
            {/* Background effects */}
            <div className="absolute inset-0 bg-brand135 opacity-10 mix-blend-overlay" />
            <div className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] bg-pink-500/30 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] bg-blue-600/30 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-heading font-extrabold text-white mb-6 tracking-tight">
                Ready to modernize<br/>your maternity ward?
              </h2>
              <p className="text-lg md:text-xl text-ink-200 mb-10 max-w-2xl mx-auto font-medium">
                Join leading healthcare institutions delivering superior care and operational excellence with JanmaLink.
              </p>
              <Link
                to="/hospital-register"
                className="inline-flex items-center gap-3 h-16 px-10 rounded-full text-lg font-bold text-ink-900 bg-white hover:bg-ink-50 shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all hover:scale-105 active:scale-95"
              >
                Start Registration Now <ArrowRight size={20} className="text-pink-600" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="bg-white border-t border-ink-200 pt-16 pb-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand135 flex items-center justify-center">
                <Heart size={16} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-heading font-extrabold text-ink-900">
                Janma<span className="text-pink-600">Link</span>
              </span>
            </div>
            
            <nav className="flex items-center gap-8">
              <a href="#process" className="text-sm font-semibold text-ink-600 hover:text-ink-900 transition-colors">How it Works</a>
              <Link to="/login" className="text-sm font-semibold text-ink-600 hover:text-ink-900 transition-colors">Staff Login</Link>
              <Link to="/hospital-register" className="text-sm font-semibold text-pink-600 hover:text-pink-700 transition-colors">Partner With Us</Link>
            </nav>
          </div>
          
          <div className="text-center text-sm font-medium text-ink-400">
            © {new Date().getFullYear()} JanmaLink Maternity SaaS Platform. Crafted for clinical excellence.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
