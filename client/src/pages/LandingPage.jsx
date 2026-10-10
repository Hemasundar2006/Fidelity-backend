import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu, X, ArrowRight, ShieldCheck,
  BrainCircuit, Smartphone, FileText,
  HeartPulse, Activity, ChevronDown, CheckCircle2,
  Stethoscope, BarChart3, Lock, Zap,
  Calendar, Syringe, AlertTriangle
} from 'lucide-react';
import { API_BASE } from '../config';



const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/dashboard/stats`);
        const data = await res.json();
        if (data.success && data.data) {
          setStats(data.data);
        }
      } catch (err) {
        console.warn('Landing page stats error:', err);
      }
    };
    loadStats();
  }, []);


  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-pink-100 selection:text-pink-900">
      
      {/* ─── HEADER ─── */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center shrink-0 hover:opacity-90 transition-opacity">
            <img src="/logo.png" alt="JanmaLink Logo" className="h-10 md:h-12 w-auto" />
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Platform</a>
            <a href="#ai" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">AI Engine</a>
            <a href="#patients" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Patients</a>
            <a href="#security" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Security</a>
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link to="/portal" className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">
              Patient Portal
            </Link>
            <Link to="/login" className="px-5 py-2.5 text-sm font-bold text-slate-700 hover:text-slate-900 transition-all">
              Staff Login
            </Link>
            <Link to="/hospital-register" className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 transition-all">
              Partner With Us
            </Link>
          </div>

          <button className="lg:hidden p-2 text-slate-600" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* ─── MOBILE MENU ─── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-right-8 duration-300">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <img src="/logo.png" alt="JanmaLink Logo" className="h-10 w-auto" />
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-500 bg-slate-100 rounded-full">
              <X size={20} />
            </button>
          </div>
          <div className="flex flex-col p-6 gap-4 flex-1 overflow-y-auto">
            <Link to="/portal" className="w-full py-4 text-lg font-bold text-left border-b border-slate-100">Patient Portal</Link>
            <Link to="/login" className="w-full py-4 text-lg font-bold text-left border-b border-slate-100">Staff Login</Link>
            <Link to="/hospital-register" className="w-full py-4 text-lg font-bold text-left text-blue-600">Partner With Us</Link>
          </div>
        </div>
      )}



      {/* ─── SECTION 1: HERO ─── */}
      <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-blue-50 to-pink-50 rounded-full blur-3xl -z-10 opacity-70" />
        
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50/80 border border-blue-100 text-sm font-bold text-blue-700 mb-8 shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Platform v2.0 Now Available
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-[80px] font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8 max-w-5xl mx-auto">
            The intelligent OS for <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-500">
              modern maternity care.
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto mb-12 leading-relaxed">
            Unify your hospital's maternal workflows. From OPD queuing and fetal monitoring to AI-driven risk predictions and patient mobile access.
          </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link to="/hospital-register" className="h-14 px-8 rounded-xl bg-slate-900 text-white font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5 transition-all w-full sm:w-auto">
                Register Your Hospital <ArrowRight size={18} />
              </Link>
              <Link to="/portal" className="h-14 px-8 rounded-xl bg-white text-slate-700 border-2 border-slate-200 font-bold text-base flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm w-full sm:w-auto">
                <Smartphone size={20} className="text-slate-400" /> Patient Portal
              </Link>
            </div>
        </div>
      </section>

      {/* ─── SECTION 2: REAL LIVE PLATFORM METRICS ─── */}
      <section className="py-12 border-y border-slate-100 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live Clinical Network Statistics
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10">
            <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Activity size={24} />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                  {stats?.totalPatients !== undefined ? stats.totalPatients : '4'}
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1.5">
                  Mothers Registered
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                <HeartPulse size={24} />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                  {stats ? (stats.activePregnancies + stats.deliveriesCount) : '4'}
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1.5">
                  Pregnancies & Care Plans
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Calendar size={24} />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                  {stats?.totalAppointments !== undefined ? stats.totalAppointments : '4'}
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1.5">
                  Clinical Consultations
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Stethoscope size={24} />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                  {stats?.partnerHospitalsCount !== undefined ? stats.partnerHospitalsCount : '2'}
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1.5">
                  Partner Hospitals
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: CORE PLATFORM ─── */}
      <section id="features" className="py-24 md:py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-blue-600 font-bold tracking-widest uppercase text-sm mb-4">Complete Suite</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">Everything you need to run a modern maternity ward.</h3>
            <p className="text-lg text-slate-500 font-medium">Say goodbye to scattered paper records. JanmaLink provides dedicated interfaces for every role in your hospital.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Doctor Dashboard', desc: 'Comprehensive patient history, clinical notes, and AI risk analysis at a glance.', icon: Stethoscope, color: 'text-blue-600', bg: 'bg-blue-50' },
              { title: 'Fetal Monitoring', desc: 'Log and track fetal heart rates, kicks, and anomaly scan results continuously.', icon: HeartPulse, color: 'text-rose-500', bg: 'bg-rose-50' },
              { title: 'Smart Labs & Pharmacy', desc: 'Integrated queues for pathology and medication dispensing with instant alerts.', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { title: 'Receptionist Queue', desc: 'Seamlessly manage OPD tokens, initial vitals, and patient routing.', icon: Menu, color: 'text-purple-600', bg: 'bg-purple-50' },
              { title: 'Hospital Admin', desc: 'Bird\'s eye view of hospital analytics, staff management, and role access.', icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
              { title: 'Patient Identity', desc: 'Secure mother-and-baby linking ensuring zero mix-ups during care.', icon: ShieldCheck, color: 'text-cyan-600', bg: 'bg-cyan-50' }
            ].map((f, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-2xl ${f.bg} flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300`}>
                  <f.icon size={28} className={f.color} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h4>
                <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: AI CAPABILITIES ─── */}
      <section id="ai" className="py-24 md:py-32 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-xs font-bold text-blue-300 mb-6 uppercase tracking-widest">
              <BrainCircuit size={14} /> AI Integration
            </div>
            <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
              Predict complications <span className="text-blue-400">before they happen.</span>
            </h3>
            <p className="text-slate-400 text-lg md:text-xl font-medium mb-8 leading-relaxed">
              Our proprietary Maternal Health Predictor analyzes key vitals (BP, Sugar, Age, FHR) in real-time to flag high-risk pregnancies, allowing doctors to intervene early.
            </p>
            <ul className="space-y-4 mb-10">
              {['Instantly processes 15+ clinical parameters', 'Trained on vast datasets of maternal health records', 'Provides clear Low, Mid, or High risk stratification'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300 font-medium text-lg">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Mockup UI of AI Predictor */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-pink-600/20 rounded-3xl transform rotate-3" />
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 relative z-10 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <Activity className="text-blue-400" size={24} />
                  <span className="font-bold text-xl">Risk Analysis Model</span>
                </div>
                <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase rounded-lg border border-emerald-500/30">
                  Model Active
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-slate-700 rounded-full w-3/4" />
                <div className="h-4 bg-slate-700 rounded-full w-1/2" />
                <div className="h-4 bg-slate-700 rounded-full w-5/6" />
                <div className="py-6 flex justify-center">
                  <div className="w-32 h-32 rounded-full border-8 border-red-500/30 border-t-red-500 flex items-center justify-center animate-spin-slow">
                    <div className="text-3xl font-black text-white animate-none">89%</div>
                  </div>
                </div>
                <div className="text-center text-red-400 font-bold text-lg bg-red-500/10 py-3 rounded-xl border border-red-500/20">
                  High Risk Detected: Severe Hypertension
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: PATIENT EMPOWERMENT ─── */}
      <section id="patients" className="py-24 md:py-32 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative z-10 max-w-md mx-auto">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Smartphone size={32} className="text-blue-600" />
                </div>
              </div>
              <h4 className="text-center font-bold text-xl text-slate-900 mb-6">Patient Portal Mobile View</h4>
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                  <Calendar className="text-slate-400" />
                  <div><div className="text-xs font-bold text-slate-500 uppercase">Next Visit</div><div className="font-bold text-slate-900">Dr. Sarah - Oct 12</div></div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                  <Syringe className="text-slate-400" />
                  <div><div className="text-xs font-bold text-slate-500 uppercase">Vaccination</div><div className="font-bold text-slate-900">TT-1 Complete</div></div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                  <FileText className="text-slate-400" />
                  <div><div className="text-xs font-bold text-slate-500 uppercase">Latest Lab</div><div className="font-bold text-emerald-600">Blood Test - Normal</div></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-slate-900 leading-tight">
              Keep patients connected to their care.
            </h3>
            <p className="text-slate-500 text-lg md:text-xl font-medium mb-8 leading-relaxed">
              No more carrying physical files. Patients can simply log in with their registered mobile number to view their complete history, upcoming appointments, and lab results securely.
            </p>
            <Link to="/portal" className="inline-flex px-8 py-4 bg-slate-900 text-white rounded-xl font-bold items-center gap-3 hover:bg-slate-800 transition-colors shadow-lg">
              Go to Patient Portal <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: ENTERPRISE SECURITY ─── */}
      <section id="security" className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Enterprise-Grade Data Protection</h2>
          <p className="text-lg text-slate-500 font-medium mb-10 leading-relaxed">
            Maternal health records are highly sensitive. JanmaLink employs robust JWT authentication, role-based strict access control, and encrypted data transmission to ensure complete HIPAA-level compliance.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm font-bold text-slate-700">Role-Based Access Control</span>
            <span className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm font-bold text-slate-700">Encrypted JWT Sessions</span>
            <span className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm font-bold text-slate-700">Immutable Audit Logs</span>
          </div>
        </div>
      </section>

      {/* ─── SECTION 7: CTA ─── */}
      <section className="py-24 bg-blue-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500 rounded-full blur-[80px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Ready to digitize your hospital?</h2>
          <p className="text-xl text-blue-100 font-medium mb-10">Join 50+ leading hospitals delivering safer, smarter maternity care with JanmaLink.</p>
          <Link to="/hospital-register" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-blue-600 text-lg font-bold rounded-2xl shadow-xl hover:scale-105 transition-transform">
            Start Your Partnership <Zap size={20} />
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-slate-950 pt-20 pb-10 text-slate-400">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center mb-6">
                <img src="/logo.png" alt="JanmaLink Logo" className="h-10 w-auto brightness-0 invert" />
              </Link>
              <p className="max-w-md text-slate-500 leading-relaxed font-medium">
                The intelligent operating system for modern maternity care. Connecting hospitals, doctors, and patients seamlessly.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-sm">Platform</h4>
              <ul className="space-y-3 font-medium">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#ai" className="hover:text-white transition-colors">AI Engine</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Staff Login</Link></li>
                <li><Link to="/portal" className="hover:text-white transition-colors">Patient Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-sm">Company</h4>
              <ul className="space-y-3 font-medium">
                <li><Link to="/hospital-register" className="hover:text-white transition-colors">Partner With Us</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm font-medium">© {new Date().getFullYear()} JanmaLink. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-slate-800 transition-colors"><Activity size={18} /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
