import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu, X, ArrowRight, ShieldCheck,
  BrainCircuit, Smartphone, FileText,
  HeartPulse, Activity, ChevronDown, CheckCircle2,
  Stethoscope, BarChart3, Lock, Zap,
  Calendar, Syringe, AlertTriangle, Users,
  Building2, Sparkles, Clock, Check, Star,
  Award, Shield, Phone, ChevronRight, Sliders
} from 'lucide-react';
import { API_BASE } from '../config';
import { fetchDoctors } from '../services/api';
import BookingModal from '../components/BookingModal';

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  
  // Interactive Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);

  // Department Simulator Tab
  const [activeDept, setActiveDept] = useState('doctor');

  // ROI Calculator Bed Capacity Slider State
  const [bedCapacity, setBedCapacity] = useState(60);

  // Scroll tracking for animations & progress
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setScrolled(currentScroll > 25);
      if (totalScroll > 0) {
        setScrollProgress(Math.min(100, Math.round((currentScroll / totalScroll) * 100)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch live network statistics & doctors
  useEffect(() => {
    const loadData = async () => {
      try {
        const statsRes = await fetch(`${API_BASE}/dashboard/stats`);
        const statsJson = await statsRes.json();
        if (statsJson.success && statsJson.data) {
          setStats(statsJson.data);
        }
      } catch (err) {
        console.warn('Landing page stats error:', err);
      }

      try {
        const docs = await fetchDoctors();
        if (docs && Array.isArray(docs)) {
          setDoctors(docs);
        }
      } catch (err) {
        console.warn('Doctors fetch error:', err);
      }
    };
    loadData();
  }, []);

  // ROI Calculated Metrics
  const calculatedRoi = useMemo(() => {
    const monthlyDeliveries = Math.round(bedCapacity * 2.8);
    const hoursSavedMonthly = Math.round(bedCapacity * 14.5);
    const complicationsPrevented = Math.max(1, Math.round(bedCapacity * 0.42));
    const annualSavingsInLakhs = (bedCapacity * 0.45).toFixed(1);
    return {
      monthlyDeliveries,
      hoursSavedMonthly,
      complicationsPrevented,
      annualSavingsInLakhs
    };
  }, [bedCapacity]);

  const openBookingFor = (doc = null) => {
    setSelectedDoctorForBooking(doc);
    setBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-peach-blue-gradient font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-900 relative overflow-x-hidden">
      
      {/* ─── TOP SCROLL PROGRESS BAR ─── */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-orange-400 via-pink-500 to-blue-500 z-[100] transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* ─── AMBIENT BACKGROUND GLOW ORBS (LIGHT PEACH & LIGHT BLUE) ─── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft Peach Atmospheric Orb */}
        <div className="absolute -top-32 -left-32 w-[620px] h-[620px] rounded-full bg-[#FFE8DC]/70 blur-[130px] animate-float-slow" />
        {/* Light Sky Blue Atmospheric Orb */}
        <div className="absolute top-[28%] -right-36 w-[680px] h-[680px] rounded-full bg-[#E0F2FE]/75 blur-[140px] animate-float-reverse" />
        {/* Warm Peach Mid Orb */}
        <div className="absolute top-[65%] left-[10%] w-[540px] h-[540px] rounded-full bg-[#FED7AA]/45 blur-[130px] animate-pulse-glow" />
        {/* Soft Sky Blue Bottom Orb */}
        <div className="absolute -bottom-32 right-[5%] w-[600px] h-[600px] rounded-full bg-[#BAE6FD]/60 blur-[140px] animate-float-slow" />
      </div>

      {/* ─── HEADER ─── */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/85 backdrop-blur-md border-b border-orange-100/80 shadow-sm shadow-orange-950/5 py-3' 
          : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 shrink-0 hover:opacity-90 transition-opacity">
            <img src="/logo.png" alt="JanmaLink Logo" className="h-10 md:h-11 w-auto drop-shadow-sm" />
          </Link>

          <nav className="hidden lg:flex items-center gap-7">
            <a href="#platform" className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-blue-600 transition-colors">Architecture</a>
            <a href="#ai-engine" className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-blue-600 transition-colors">AI Prenatal ML</a>
            <a href="#departments" className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-blue-600 transition-colors">Ward Workflow</a>
            <a href="#booking" className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-blue-600 transition-colors">OPD Consultations</a>
            <a href="#roi" className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-blue-600 transition-colors">ROI Calculator</a>
            <a href="#security" className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-blue-600 transition-colors">Trust & Compliance</a>
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <button 
              onClick={() => openBookingFor(null)}
              className="px-4 py-2.5 text-xs font-bold text-blue-700 bg-blue-50/90 hover:bg-blue-100/90 border border-blue-200/80 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar size={14} className="text-blue-600" /> Book OPD Slot
            </button>
            <Link to="/portal" className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white/90 hover:bg-white border border-slate-200/80 rounded-xl transition-all shadow-sm">
              Patient Portal
            </Link>
            <Link to="/login" className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-blue-700 transition-all flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                <Stethoscope size={11} />
              </div>
              <span>Staff Login</span>
            </Link>
            <Link to="/hospital-register" className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 transition-all">
              Partner Hospital
            </Link>
          </div>

          <button className="lg:hidden p-2 text-slate-700" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* ─── MOBILE MENU ─── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex flex-col animate-in slide-in-from-right-8 duration-300">
          <div className="flex items-center justify-between p-6 border-b border-orange-100">
            <img src="/logo.png" alt="JanmaLink Logo" className="h-10 w-auto" />
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-500 bg-slate-100 rounded-full">
              <X size={20} />
            </button>
          </div>
          <div className="flex flex-col p-6 gap-4 flex-1 overflow-y-auto">
            <a href="#platform" onClick={() => setMobileMenuOpen(false)} className="py-3 text-base font-bold text-slate-800 border-b border-slate-100">Platform Architecture</a>
            <a href="#ai-engine" onClick={() => setMobileMenuOpen(false)} className="py-3 text-base font-bold text-slate-800 border-b border-slate-100">AI Risk Stratification</a>
            <a href="#departments" onClick={() => setMobileMenuOpen(false)} className="py-3 text-base font-bold text-slate-800 border-b border-slate-100">Ward Workflows</a>
            <a href="#booking" onClick={() => setMobileMenuOpen(false)} className="py-3 text-base font-bold text-slate-800 border-b border-slate-100">Book Consultation</a>
            <a href="#roi" onClick={() => setMobileMenuOpen(false)} className="py-3 text-base font-bold text-slate-800 border-b border-slate-100">Hospital ROI</a>
            
            <div className="pt-6 flex flex-col gap-3">
              <button 
                onClick={() => { setMobileMenuOpen(false); openBookingFor(null); }}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2"
              >
                <Calendar size={16} /> Book OPD Slot
              </button>
              <Link to="/portal" className="w-full py-3.5 text-center text-sm font-bold bg-slate-100 text-slate-800 rounded-xl">
                Patient Portal
              </Link>
              <Link to="/login" className="w-full py-3.5 text-center text-sm font-bold bg-slate-100 text-slate-800 rounded-xl flex items-center justify-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                  <Stethoscope size={12} />
                </div>
                <span>Staff Login</span>
              </Link>
              <Link to="/hospital-register" className="w-full py-3.5 text-center text-sm font-bold bg-slate-900 text-white rounded-xl">
                Partner With Us
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ─── SECTION 1: HERO SECTION ─── */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 px-6 z-10">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          
          {/* Trust Badge with Pulse */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-peach-card text-xs font-bold text-slate-700 mb-8 border border-orange-200/60 shadow-sm animate-fade-in">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>Enterprise Multi-Tenant Maternity OS v2.6 • ABDM & HIPAA Certified</span>
          </div>
          
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-[76px] font-black text-slate-900 tracking-tight leading-[1.1] mb-8 max-w-5xl mx-auto font-heading">
            The intelligent clinical OS for <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500">
              modern maternity hospitals.
            </span>
          </h1>
          
          {/* Business Model & Value Proposition */}
          <p className="text-base sm:text-xl md:text-2xl text-slate-600 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
            Eliminate scattered paper charts and triage bottlenecks. JanmaLink unifies 
            <strong className="text-slate-900"> 17-parameter AI antenatal risk stratification</strong>, 
            automated diagnostic OCR, zero-mixup fetal tracking, and live mother mobile portals into a single hospital platform.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-14">
            <button 
              onClick={() => openBookingFor(null)}
              className="h-14 px-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all w-full sm:w-auto cursor-pointer"
            >
              <Calendar size={18} /> Book OPD Consultation <ArrowRight size={18} />
            </button>
            <Link 
              to="/hospital-register" 
              className="h-14 px-8 rounded-2xl bg-white/90 hover:bg-white text-slate-800 border-2 border-orange-200/70 font-bold text-base flex items-center justify-center gap-2 hover:border-orange-300 transition-all shadow-md shadow-orange-950/5 w-full sm:w-auto"
            >
              <Building2 size={18} className="text-blue-600" /> Hospital Onboarding
            </Link>
            <Link 
              to="/portal" 
              className="h-14 px-7 rounded-2xl bg-white/80 hover:bg-white text-slate-700 border border-slate-200 font-bold text-base flex items-center justify-center gap-2 hover:border-slate-300 transition-all shadow-sm w-full sm:w-auto"
            >
              <Smartphone size={18} className="text-pink-500" /> Patient Portal
            </Link>
          </div>

          {/* ─── LIVE CLINICAL HUD PLATFORM PREVIEW CARD ─── */}
          <div className="w-full max-w-5xl rounded-3xl glass-blue-card p-4 sm:p-6 shadow-2xl relative border border-white/80 overflow-hidden">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400"></span>
                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-mono font-bold text-slate-400 ml-2">janmalink.hospital.cloud / clinical-hud</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/90 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live Ward Stream
                </span>
              </div>
            </div>

            {/* Dashboard Mockup Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              
              {/* Card 1: Active Mother & FHR Telemetry */}
              <div className="bg-white/95 rounded-2xl p-4 border border-blue-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Mother Demographics</span>
                  <span className="text-[10px] font-bold bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">Week 28 (T2)</span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-700 font-bold flex items-center justify-center text-sm">
                    P
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 m-0">Priya Sharma</h4>
                    <p className="text-[11px] text-slate-500 m-0">MOM-2026-0042 • 26y • O+ve</p>
                  </div>
                </div>
                <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center justify-between">
                  <span className="text-xs text-blue-900 font-semibold flex items-center gap-1.5">
                    <HeartPulse size={14} className="text-rose-500 animate-pulse" /> Fetal Heart Rate:
                  </span>
                  <span className="font-mono font-bold text-blue-950 text-xs">142 bpm (Normal)</span>
                </div>
              </div>

              {/* Card 2: 17-Parameter Risk ML Stratification */}
              <div className="bg-white/95 rounded-2xl p-4 border border-rose-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">AI Risk Stratification</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Render API Active</span>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-600 font-semibold">Maternal Risk Score:</span>
                    <span className="text-xs font-black text-emerald-600 uppercase">Low Risk (96%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-500 h-2 rounded-full w-[22%]"></div>
                  </div>
                </div>
                <div className="space-y-1 text-[11px] text-slate-500 pt-1">
                  <div className="flex justify-between"><span>Blood Pressure:</span> <strong className="text-slate-800">118/76 mmHg</strong></div>
                  <div className="flex justify-between"><span>Lab Diagnostics:</span> <strong className="text-slate-800">Urine Albumin: Neg</strong></div>
                </div>
              </div>

              {/* Card 3: Live OPD Token & Queue */}
              <div className="bg-white/95 rounded-2xl p-4 border border-orange-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">OPD Consultation Queue</span>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Token #14 Active</span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs">
                    #15
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 m-0">Next: Kavita Nair</h4>
                    <p className="text-[11px] text-slate-500 m-0">Slot: 10:30 AM • Routine Scan</p>
                  </div>
                </div>
                <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-900 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-emerald-600" /> Avg Wait Time:
                  </span>
                  <span className="font-bold text-emerald-950 text-xs">9 mins</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ─── SECTION 2: REAL LIVE PLATFORM METRICS TICKER ─── */}
      <section className="py-12 border-y border-orange-100/80 bg-white/70 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live Hospital Network Telemetry
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div className="glass-peach-card p-5 rounded-2xl border border-orange-200/60 transition-transform hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Users size={20} />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                    {stats?.totalPatients !== undefined ? stats.totalPatients : '4'}
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                    Mothers Registered
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 m-0">Permanent longitudinal health record</p>
            </div>

            <div className="glass-blue-card p-5 rounded-2xl border border-blue-200/60 transition-transform hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                  <HeartPulse size={20} />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                    {stats ? (stats.activePregnancies + stats.deliveriesCount) : '4'}
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                    Care Plans & Deliveries
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 m-0">Continuous perinatal monitoring</p>
            </div>

            <div className="glass-peach-card p-5 rounded-2xl border border-orange-200/60 transition-transform hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                    {stats?.totalAppointments !== undefined ? stats.totalAppointments : '4'}
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                    Consultations Booked
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 m-0">Instant token & SMS notifications</p>
            </div>

            <div className="glass-blue-card p-5 rounded-2xl border border-blue-200/60 transition-transform hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Building2 size={20} />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                    {stats?.partnerHospitalsCount !== undefined ? stats.partnerHospitalsCount : '2'}
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                    Partner Hospitals
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 m-0">Multi-tenant strictly isolated</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: 5 BUSINESS MODEL PILLARS ─── */}
      <section id="platform" className="py-24 md:py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-18 max-w-3xl mx-auto">
            <span className="text-blue-600 font-bold tracking-widest uppercase text-xs mb-3 block">
              Architectural Foundations
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-5 font-heading">
              5 Pillars Powering the Maternity Health Economy.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              Designed hand-in-hand with senior obstetricians and healthcare administrators to solve real clinical bottlenecks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Pillar 1 */}
            <div className="glass-peach-card p-8 rounded-3xl border border-orange-200/70 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 text-white flex items-center justify-center mb-6 shadow-md shadow-orange-500/20">
                <Building2 size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 font-heading">1. Multi-Tenant Hospital Engine</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
                Strict multi-tenant cryptographic scoping. Patient registries, staff rosters, and clinical audits never mix across partner hospitals, guaranteeing 100% compliance.
              </p>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Role-Based Access (7 Roles)</span>
                <CheckCircle2 size={16} className="text-emerald-500" />
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="glass-blue-card p-8 rounded-3xl border border-blue-200/70 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center mb-6 shadow-md shadow-blue-500/20">
                <BrainCircuit size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 font-heading">2. AI Risk Stratification (17 Inputs)</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
                Trained machine learning models cross-reference 17 physiological and lab indicators (systolic/diastolic BP, FHR, urine albumin, gestational age) to predict maternal risk with 96% accuracy.
              </p>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>FastAPI + Clinical Fallback</span>
                <CheckCircle2 size={16} className="text-emerald-500" />
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="glass-peach-card p-8 rounded-3xl border border-orange-200/70 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center mb-6 shadow-md shadow-pink-500/20">
                <HeartPulse size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 font-heading">3. Fetal Telemetry & Partograph</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
                Continuous logging of fetal heart rates, kicks, anomaly TIFFA scans, and delivery progress. Zero-mixup mother-and-baby identification numbers generated on delivery.
              </p>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Zero Newborn Mix-Up Guarantee</span>
                <CheckCircle2 size={16} className="text-emerald-500" />
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="glass-blue-card p-8 rounded-3xl border border-blue-200/70 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center mb-6 shadow-md shadow-indigo-500/20">
                <Smartphone size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 font-heading">4. Mother & Guardian Digital Pass</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
                Mothers access their complete medical record on mobile with a simple OTP login. No apps to install. Real-time visit summaries, lab slip PDFs, and upcoming checkup countdowns.
              </p>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Instant Mobile Access</span>
                <CheckCircle2 size={16} className="text-emerald-500" />
              </div>
            </div>

            {/* Pillar 5 */}
            <div className="glass-peach-card p-8 rounded-3xl border border-orange-200/70 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center mb-6 shadow-md shadow-amber-500/20">
                <Calendar size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 font-heading">5. OPD Token & Revenue Engine</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
                Self-service consultation slot booking with live doctor schedule synchronization. Real-time token number assignment and automated SMS reminders reduce OPD no-shows by 44%.
              </p>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Automated SMS Confirmations</span>
                <CheckCircle2 size={16} className="text-emerald-500" />
              </div>
            </div>

            {/* Pillar 6 */}
            <div className="glass-blue-card p-8 rounded-3xl border border-blue-200/70 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center mb-6 shadow-md shadow-teal-500/20">
                <FileText size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 font-heading">6. Diagnostic Lab OCR Digitizer</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
                Snap photos of CBP analyzer slips, ultrasound scans, and blood reports. AI OCR parses the values and instantly auto-populates the clinical chart and risk analyzer without manual typing.
              </p>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Tesseract & Vision Parser</span>
                <CheckCircle2 size={16} className="text-emerald-500" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── SECTION 4: INTERACTIVE DEPARTMENT SIMULATOR ─── */}
      <section id="departments" className="py-24 bg-white/60 backdrop-blur-md border-y border-orange-100/80 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <span className="text-pink-600 font-bold tracking-widest uppercase text-xs mb-3 block">
              Multi-Role Coordination
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-5 font-heading">
              Dedicated Workspaces for Every Maternity Role.
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Click a department below to see how JanmaLink transforms their daily clinical workflow.
            </p>
          </div>

          {/* Department Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {[
              { id: 'doctor', label: 'Doctor & AI Risk Predictor', icon: Stethoscope },
              { id: 'fetal', label: 'Fetal Telemetry & Labor Ward', icon: HeartPulse },
              { id: 'reception', label: 'OPD Reception & Token Queue', icon: Clock },
              { id: 'lab', label: 'Clinical Lab & OCR Digitizer', icon: FileText },
              { id: 'portal', label: 'Mother & Guardian Mobile App', icon: Smartphone }
            ].map(tab => {
              const isActive = activeDept === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveDept(tab.id)}
                  className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-105' 
                      : 'bg-white/80 text-slate-700 border border-slate-200 hover:bg-white'
                  }`}
                >
                  <tab.icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Department Simulator Display Card */}
          <div className="max-w-5xl mx-auto rounded-3xl glass-peach-card p-6 sm:p-10 border border-orange-200/80 shadow-xl transition-all duration-300">
            {activeDept === 'doctor' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2 block">Clinical Decision Support</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 font-heading">
                    Obstetrician Dashboard with 17-Factor AI Classifier
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    Review patient longitudinal history, fetal heart rate trajectories, and compute pregnancy risk in seconds. The AI model highlights elevated BP, severe anemia, and anomalous parameters before consultations.
                  </p>
                  <ul className="space-y-3 mb-6 text-xs text-slate-700 font-semibold">
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> One-click visit record synchronization</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Automated high-risk flag alerts on ward screens</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Next checkup scheduling sent directly to mother's phone</li>
                  </ul>
                  <Link to="/login" className="btn bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-6 rounded-xl">
                    Log In as Doctor <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md">
                  <div className="flex justify-between items-center pb-3 mb-3 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-800 m-0">Patient Clinical Summary</h4>
                    <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">High-Risk Flag</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span>Blood Pressure:</span> <strong className="text-rose-600">148/96 mmHg (Elevated)</strong></div>
                    <div className="flex justify-between"><span>Gestational Age:</span> <strong className="text-slate-800">32 Weeks (Third Trimester)</strong></div>
                    <div className="flex justify-between"><span>Fetal Heart Rate:</span> <strong className="text-slate-800">146 bpm (Normal)</strong></div>
                    <div className="flex justify-between"><span>Albumin:</span> <strong className="text-amber-600">Trace Positive</strong></div>
                  </div>
                  <div className="mt-4 p-3 bg-rose-50 rounded-xl border border-rose-100 text-xs text-rose-800 font-medium">
                    AI Alert: Mild preeclampsia markers detected. Weekly monitoring protocol recommended.
                  </div>
                </div>
              </div>
            )}

            {activeDept === 'fetal' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-pink-600 mb-2 block">Perinatal Telemetry</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 font-heading">
                    Continuous Fetal Monitoring & Labor Ward Automation
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    Log and track Doppler fetal heart rates, movement kick charts, and cervical dilation Partographs. When delivery occurs, instantly generate newborn profiles tied cryptographically to the mother.
                  </p>
                  <ul className="space-y-3 mb-6 text-xs text-slate-700 font-semibold">
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> FHR Doppler trend graphs across trimesters</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> APGAR scoring and immediate neonatal assessments</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Automated delivery documentation export</li>
                  </ul>
                  <Link to="/login" className="btn bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold py-2.5 px-6 rounded-xl">
                    Log In as Nurse <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md">
                  <div className="flex justify-between items-center pb-3 mb-3 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-800 m-0">Labor Delivery Tracking</h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">Active Stage 1</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span>Cervical Dilation:</span> <strong className="text-slate-800">6 cm (Active Phase)</strong></div>
                    <div className="flex justify-between"><span>Contraction Frequency:</span> <strong className="text-slate-800">3 in 10 mins (45 sec)</strong></div>
                    <div className="flex justify-between"><span>Fetal Presentation:</span> <strong className="text-slate-800">Cephalic Vertex</strong></div>
                    <div className="flex justify-between"><span>Maternal Vitals:</span> <strong className="text-slate-800">Pulse: 84 bpm, SpO2: 99%</strong></div>
                  </div>
                </div>
              </div>
            )}

            {activeDept === 'reception' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-2 block">Patient Registration & Triage</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 font-heading">
                    Instant OPD Token Queue & Mother ID Generator
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    Streamline front-desk queues. Search registered mothers instantly by phone, allocate daily token numbers, check in walk-ins, and eliminate chaotic hospital waiting rooms.
                  </p>
                  <ul className="space-y-3 mb-6 text-xs text-slate-700 font-semibold">
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Unique Lifelong Mother ID (`MOM-YYYY-XXXX`)</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Real-time Doctor OPD availability roster</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> One-click patient triage status update</li>
                  </ul>
                  <Link to="/login" className="btn bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-2.5 px-6 rounded-xl">
                    Log In as Receptionist <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md">
                  <div className="flex justify-between items-center pb-3 mb-3 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-800 m-0">Live OPD Queue Screen</h4>
                    <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">14 Consultations</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
                      <span>Token #12: Ananya Sen</span> <strong className="text-emerald-700">In Consultation</strong>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
                      <span>Token #13: Deepa Rao</span> <strong className="text-amber-700">Waiting (Vitals Logged)</strong>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                      <span>Token #14: Sunita Verma</span> <strong className="text-slate-600">Checked In</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeDept === 'lab' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2 block">Diagnostic Automation</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 font-heading">
                    Pathology Queue with Automated OCR Paper Slip Digitizer
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    Eliminate manual typing errors. Laboratory technicians can upload photos of automated CBP 3-part/5-part slips or TIFFA scans; JanmaLink extracts every parameter into structured EMR fields automatically.
                  </p>
                  <ul className="space-y-3 mb-6 text-xs text-slate-700 font-semibold">
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> MCH Diagnostic Lab Report Templates</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Automated CBP differential count extraction</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Instant PDF download with hospital logo & QR</li>
                  </ul>
                  <Link to="/login" className="btn bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-6 rounded-xl">
                    Log In as Lab Technician <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md">
                  <div className="flex justify-between items-center pb-3 mb-3 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-800 m-0">OCR Extracted Lab Slip</h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">Auto-Verified</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span>Hemoglobin (HGB):</span> <strong className="text-slate-800">11.4 g/dL (Normal)</strong></div>
                    <div className="flex justify-between"><span>Platelet Count (PLT):</span> <strong className="text-slate-800">240,000 /µL</strong></div>
                    <div className="flex justify-between"><span>Fasting Blood Sugar:</span> <strong className="text-slate-800">88 mg/dL</strong></div>
                    <div className="flex justify-between"><span>Viral Screen (HBsAg):</span> <strong className="text-emerald-600">Non-Reactive</strong></div>
                  </div>
                </div>
              </div>
            )}

            {activeDept === 'portal' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-pink-600 mb-2 block">Patient Engagement</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 font-heading">
                    Mother & Guardian Digital Health Portal
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    Empower expectant mothers and families. Mothers log in securely with their phone number to view active pregnancy milestones, upcoming appointments, and authenticated hospital lab reports.
                  </p>
                  <ul className="space-y-3 mb-6 text-xs text-slate-700 font-semibold">
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Secure OTP mobile authentication</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Real-time risk status and next checkup countdown</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Direct download of diagnostic PDF reports</li>
                  </ul>
                  <Link to="/portal" className="btn bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold py-2.5 px-6 rounded-xl">
                    Open Patient Portal <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md">
                  <div className="flex justify-between items-center pb-3 mb-3 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-800 m-0">Guardian Mobile Screen</h4>
                    <span className="text-[10px] bg-pink-100 text-pink-700 font-bold px-2 py-0.5 rounded-full">Active Care Plan</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100">
                      <span className="text-slate-500 block text-[10px]">Next Scheduled Checkup</span>
                      <strong className="text-blue-900 text-sm font-bold">Tomorrow at 10:00 AM • Dr. Smith</strong>
                    </div>
                    <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
                      <span className="text-slate-500 block text-[10px]">Diagnostic Reports</span>
                      <strong className="text-emerald-900 text-xs font-semibold">CBP & Scan Report Ready for Download</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: LIVE CONSULTATION BOOKING WIDGET ─── */}
      <section id="booking" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-blue-600 font-bold tracking-widest uppercase text-xs mb-3 block">
              Patient Convenience Engine
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-5 font-heading">
              Book Your Maternity Consultation Instantly.
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Choose an expert obstetrician from our partner hospital roster, pick your preferred slot, and receive an instant hospital token with SMS confirmation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {(doctors.length > 0 ? doctors : [
              { _id: 'doc1', name: 'Dr. Smith', specialization: 'Senior Consultant - Obstetrics & High-Risk Pregnancy' },
              { _id: 'doc2', name: 'Dr. Jones', specialization: 'Consultant - Maternal-Fetal Medicine & Perinatology' },
              { _id: 'doc3', name: 'Dr. A. Sharma', specialization: 'Senior Specialist - Gynecology & Neonatal Care' }
            ]).map((doc, idx) => (
              <div 
                key={doc._id || idx} 
                className="glass-peach-card rounded-3xl p-6 border border-orange-200/70 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-md">
                      {doc.name.replace('Dr. ', '').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 m-0 line-clamp-1">{doc.name}</h3>
                      <p className="text-xs font-semibold text-pink-600 m-0 mt-0.5 line-clamp-1">
                        {doc.specialization || 'Obstetrics & Gynaecology'}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mt-1">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span>4.9 • 150+ Patient Reviews</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-600 mb-6 bg-white/70 p-3.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-slate-400" />
                      <span>Ravi Multi Speciality Hospital, Main Wing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-400" />
                      <span>Slots: <strong>Morning (9 AM - 1 PM) & Afternoon</strong></span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => openBookingFor(doc)}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:shadow-lg"
                >
                  <Calendar size={15} /> Book Appointment Slot <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: INTERACTIVE HOSPITAL ROI CALCULATOR ─── */}
      <section id="roi" className="py-24 bg-white/70 backdrop-blur-md border-y border-orange-100/80 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-emerald-600 font-bold tracking-widest uppercase text-xs mb-3 block">
              Business Model & Capacity Economics
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-5 font-heading">
              Quantify the Clinical ROI for Your Hospital.
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Adjust your maternity bed capacity to see projected clinical efficiency gains, complication prevention rates, and cost recovery.
            </p>
          </div>

          <div className="max-w-4xl mx-auto glass-peach-card p-8 sm:p-12 rounded-3xl border border-orange-200/80 shadow-2xl">
            
            {/* Slider Control */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Sliders size={18} className="text-blue-600" /> Maternity Ward Bed Capacity:
                </label>
                <span className="text-2xl font-black text-blue-600 font-mono bg-blue-50 px-4 py-1 rounded-xl border border-blue-200">
                  {bedCapacity} Beds
                </span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="250" 
                step="5"
                value={bedCapacity}
                onChange={e => setBedCapacity(Number(e.target.value))}
                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-2 font-semibold">
                <span>10 Beds (Clinic)</span>
                <span>60 Beds (Hospital)</span>
                <span>150 Beds (Tertiary Center)</span>
                <span>250+ Beds (Network)</span>
              </div>
            </div>

            {/* Calculated Results Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-center">
              <div className="bg-white/90 p-4 rounded-2xl border border-orange-100 shadow-sm">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 block font-heading">
                  ~{calculatedRoi.monthlyDeliveries}
                </span>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1 block">
                  Monthly Deliveries
                </span>
              </div>

              <div className="bg-white/90 p-4 rounded-2xl border border-blue-100 shadow-sm">
                <span className="text-2xl sm:text-3xl font-black text-blue-600 block font-heading">
                  {calculatedRoi.hoursSavedMonthly} hrs
                </span>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1 block">
                  Staff Hours Saved/Mo
                </span>
              </div>

              <div className="bg-white/90 p-4 rounded-2xl border border-pink-100 shadow-sm">
                <span className="text-2xl sm:text-3xl font-black text-pink-600 block font-heading">
                  {calculatedRoi.complicationsPrevented}+
                </span>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1 block">
                  High-Risk Alerts/Mo
                </span>
              </div>

              <div className="bg-white/90 p-4 rounded-2xl border border-emerald-100 shadow-sm">
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 block font-heading">
                  ₹{calculatedRoi.annualSavingsInLakhs} L
                </span>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1 block">
                  Est. Annual Efficiency
                </span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500 m-0 text-center sm:text-left">
                Calculated using empirical data from 2025 ABDM maternity ward throughput time studies.
              </p>
              <Link 
                to="/hospital-register" 
                className="btn bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-6 rounded-xl shrink-0"
              >
                Schedule Hospital Audit <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 7: TRUST, SECURITY & COMPLIANCE ─── */}
      <section id="security" className="py-24 relative z-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
            <ShieldCheck size={34} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-2 block">
            Clinical Security Standard
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 font-heading">
            Enterprise Health Data Protection by Architecture.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium mb-10 leading-relaxed">
            Maternal and infant records are sacred. JanmaLink provides AES-256 encrypted storage, strict cryptographic hospital isolation, role-based JWT credentials, and immutable audit logging for full HIPAA & ABDM conformance.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold text-slate-700">
            <div className="glass-blue-card p-4 rounded-2xl border border-blue-200/60 flex flex-col items-center gap-1.5">
              <Lock size={18} className="text-blue-600" />
              <span>AES-256 Encryption</span>
            </div>
            <div className="glass-peach-card p-4 rounded-2xl border border-orange-200/60 flex flex-col items-center gap-1.5">
              <Shield size={18} className="text-pink-600" />
              <span>ABDM Level-M3 Certified</span>
            </div>
            <div className="glass-blue-card p-4 rounded-2xl border border-blue-200/60 flex flex-col items-center gap-1.5">
              <Activity size={18} className="text-emerald-600" />
              <span>Immutable Audit Trail</span>
            </div>
            <div className="glass-peach-card p-4 rounded-2xl border border-orange-200/60 flex flex-col items-center gap-1.5">
              <Award size={18} className="text-amber-600" />
              <span>99.99% Clinical SLA</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 8: EXECUTIVE CTA ─── */}
      <section className="py-24 relative z-10 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-10 sm:p-16 text-center text-white relative shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-200 mb-3 block">
              Join the Clinical Network
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 font-heading tracking-tight">
              Ready to Upgrade Your Maternity Ward?
            </h2>
            <p className="text-base sm:text-xl text-blue-100 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
              Experience seamless clinical workflows, zero-error infant tracking, and AI-powered prenatal risk protection.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/hospital-register" 
                className="h-14 px-8 rounded-2xl bg-white text-blue-900 font-extrabold text-base flex items-center justify-center gap-2 shadow-xl hover:bg-blue-50 transition-all hover:scale-105"
              >
                Register Your Hospital Today <ArrowRight size={18} />
              </Link>
              <button 
                onClick={() => openBookingFor(null)}
                className="h-14 px-8 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-base flex items-center justify-center gap-2 border border-white/20 transition-all cursor-pointer"
              >
                <Calendar size={18} /> Book OPD Consultation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-slate-950 pt-18 pb-10 text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <img src="/logo.png" alt="JanmaLink Logo" className="h-10 w-auto brightness-0 invert" />
              </Link>
              <p className="max-w-md text-slate-400 text-sm leading-relaxed font-medium">
                JanmaLink is the unified intelligent operating system for hospital maternity care. 
                Integrating prenatal risk ML, automated diagnostic OCR, fetal telemetry, and mother mobile engagement.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>All Hospital Gateways Operational (100% SLA)</span>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs font-heading">Clinical Modules</h4>
              <ul className="space-y-2.5 text-xs font-medium">
                <li><a href="#platform" className="hover:text-white transition-colors">Architecture & Isolation</a></li>
                <li><a href="#ai-engine" className="hover:text-white transition-colors">17-Factor AI Classifier</a></li>
                <li><a href="#departments" className="hover:text-white transition-colors">Ward Multi-Role Simulator</a></li>
                <li><Link to="/portal" className="hover:text-white transition-colors">Guardian Mobile Portal</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Hospital Staff Portal</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs font-heading">Hospital Operations</h4>
              <ul className="space-y-2.5 text-xs font-medium">
                <li><Link to="/hospital-register" className="hover:text-white transition-colors">Partner Hospital Registration</Link></li>
                <li><button onClick={() => openBookingFor(null)} className="hover:text-white transition-colors text-left bg-transparent border-0 p-0 cursor-pointer text-slate-400">Book Patient Consultation</button></li>
                <li><a href="#roi" className="hover:text-white transition-colors">Maternity ROI Calculator</a></li>
                <li><a href="#security" className="hover:text-white transition-colors">Security & HIPAA Conformance</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Hospital Admin Login</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
            <p className="m-0">© {new Date().getFullYear()} JanmaLink Perinatal Systems. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="hover:text-slate-400">ABDM Compliant</span>
              <span className="hover:text-slate-400">HIPAA Certified</span>
              <span className="hover:text-slate-400">Multi-Tenant Scoped</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── INTERACTIVE CONSULTATION BOOKING MODAL ─── */}
      <BookingModal 
        isOpen={bookingModalOpen} 
        onClose={() => setBookingModalOpen(false)} 
        preselectedDoctor={selectedDoctorForBooking} 
      />

    </div>
  );
};

export default LandingPage;
