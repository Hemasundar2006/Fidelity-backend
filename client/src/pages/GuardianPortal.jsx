import React, { useState, useEffect } from 'react';
import { Home, FileText, Baby, Shield, User, Calendar, Syringe, ChevronRight, Lock, Phone, Download, Activity, LogOut, HeartPulse } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../config';

const GuardianPortal = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Phone, 2 = OTP
  const [patientData, setPatientData] = useState(null);
  
  // Real data state
  const [savedDocs, setSavedDocs] = useState([]);
  const [savedPrecautions, setSavedPrecautions] = useState([]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (step === 1 && phone.length === 10) {
      setStep(2);
    } else if (step === 2) {
      try {
        const res = await fetch(`${API_BASE}/auth/patient/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, otp })
        });
        const data = await res.json();
        if (data.success) {
          setPatientData(data.data);
          setIsLoggedIn(true);
        } else {
          alert('Login failed: ' + (data.error?.message || 'Invalid OTP'));
        }
      } catch (err) {
        alert('Server connection error.');
      }
    } else {
      alert(step === 1 ? 'Please enter a valid 10-digit phone number' : 'Invalid OTP');
    }
  };

  useEffect(() => {
    if (isLoggedIn && patientData) {
      const fetchPatientData = async () => {
        try {
          const headers = { 'Authorization': `Bearer ${patientData.accessToken}` };
          
          // Fetch visits for precautions
          const visitsRes = await fetch(`${API_BASE}/patients/${patientData.patientId}/visits`, { headers });
          const visitsData = await visitsRes.json();
          if (visitsData.success) {
            setSavedPrecautions(visitsData.data.filter(v => v.notes).map(v => ({
              text: v.notes,
              date: new Date(v.visitDate).toLocaleDateString('en-GB'),
              author: 'Clinical Staff'
            })));
          }

          // Fetch reports
          const reportsRes = await fetch(`${API_BASE}/patients/${patientData.patientId}/reports`, { headers });
          const reportsData = await reportsRes.json();
          if (reportsData.success) {
            setSavedDocs(reportsData.data.map(r => ({
              title: r.testType,
              type: r.category.charAt(0).toUpperCase() + r.category.slice(1),
              date: new Date(r.reportedAt).toLocaleDateString('en-GB'),
              doctor: 'Clinical Staff'
            })));
          }
        } catch (err) {
          console.error('Failed to fetch patient records', err);
        }
      };
      fetchPatientData();
    }
  }, [isLoggedIn, patientData]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center p-4 font-body">
        <div className="w-full max-w-4xl bg-white rounded-card shadow-lg border border-ink-200 overflow-hidden flex flex-col md:flex-row">
          
          <div className="flex-1 p-8 md:p-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center">
                <HeartPulse size={22} />
              </div>
              <div>
                <span className="font-heading font-bold text-lg text-pink-700 block leading-tight">Patient Portal</span>
                <span className="text-[11px] uppercase tracking-wider text-ink-600">Fidelity Healthcare</span>
              </div>
            </div>

            <h2 className="text-xl font-bold font-heading text-ink-900 mb-1">Access Your Health Records</h2>
            <p className="text-xs text-ink-600 mb-8">
              View your lab reports, prescriptions, and track your pregnancy journey securely.
            </p>

            <form onSubmit={handleLogin} className="space-y-5 max-w-sm">
              {step === 1 ? (
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-600 block mb-1">Registered Mobile Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
                    <input
                      type="tel"
                      maxLength={10}
                      className="input pl-10"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-600 block mb-1">Enter OTP</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
                    <input
                      type="text"
                      maxLength={4}
                      className="input pl-10 text-center tracking-[0.3em] font-bold text-lg"
                      placeholder="••••"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                  <p className="text-[11px] text-ink-500 mt-2">OTP sent to +91 {phone} (Demo: 1234)</p>
                </div>
              )}

              <button
                type="submit"
                className="btn bg-pink-600 hover:bg-pink-700 text-white w-full h-[46px] flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {step === 1 ? 'Get OTP' : 'Secure Login'}
              </button>

              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-xs font-semibold text-pink-600 text-center bg-transparent border-0 cursor-pointer p-2 hover:underline"
                >
                  Change Mobile Number
                </button>
              )}
            </form>

            <div className="mt-8 pt-4 border-t border-ink-100 flex items-center gap-1.5 text-xs text-ink-400">
              <Shield size={14} className="text-green-600" /> DPDP Act 2023 Compliant Platform
            </div>
          </div>

          <div className="w-full md:w-80 bg-pink-50 border-l border-pink-100 p-8 md:p-10 flex flex-col justify-center">
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-white text-pink-600 flex items-center justify-center shrink-0 shadow-sm"><FileText size={18} /></div>
                <div>
                  <h3 className="font-semibold text-ink-900 text-sm mb-1">Diagnostic Reports</h3>
                  <p className="text-xs text-ink-600 leading-relaxed">Download ultrasound scans, blood tests, and lab results instantly.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-white text-pink-600 flex items-center justify-center shrink-0 shadow-sm"><Baby size={18} /></div>
                <div>
                  <h3 className="font-semibold text-ink-900 text-sm mb-1">Pregnancy & Baby</h3>
                  <p className="text-xs text-ink-600 leading-relaxed">Track your trimester progress and your baby's vaccination schedule.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-white text-pink-600 flex items-center justify-center shrink-0 shadow-sm"><Calendar size={18} /></div>
                <div>
                  <h3 className="font-semibold text-ink-900 text-sm mb-1">Appointments</h3>
                  <p className="text-xs text-ink-600 leading-relaxed">View all upcoming and past clinical visits and doctor notes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    const allReports = [
      ...savedDocs,
      { title: 'First Trimester Ultrasound', date: '12 Oct 2026', doctor: 'Dr. Smith', type: 'Imaging' },
      { title: 'Complete Blood Count (CBC)', date: '05 Oct 2026', doctor: 'Lab Tech', type: 'Pathology' },
      { title: 'Thyroid Panel (T3, T4, TSH)', date: '05 Oct 2026', doctor: 'Lab Tech', type: 'Pathology' },
      { title: 'Urine Routine Analysis', date: '01 Oct 2026', doctor: 'Lab Tech', type: 'Pathology' }
    ];

    switch(activeTab) {
      case 'home':
        return (
          <div className="space-y-6 max-w-4xl">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-ink-100 flex flex-col sm:flex-row items-center gap-6 justify-between">
              <div>
                <h2 className="text-2xl font-bold font-heading text-ink-900 mb-1">Good Morning, Lakshmi</h2>
                <p className="text-sm text-ink-600 m-0">Here is what's happening in your care plan today.</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full font-semibold border border-green-200">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Active Care Plan
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pregnancy Progress Card */}
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20"><Baby size={100} /></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2">
                      <Baby size={22} />
                      <span className="font-semibold text-lg">Pregnancy Tracker</span>
                    </div>
                    <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">Week 12</span>
                  </div>
                  <div className="h-3 bg-white/30 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-white rounded-full transition-all" style={{ width: '30%' }}></div>
                  </div>
                  <p className="text-sm text-white/90 font-medium">Your baby is about the size of a plum!</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Dynamic Precautions from Nurse */}
                {savedPrecautions.length > 0 && (
                  <div className="bg-amber-50 rounded-2xl p-5 shadow-sm border border-amber-200">
                    <h3 className="m-0 text-base font-semibold text-amber-900 flex items-center gap-2 mb-3">
                      <Shield size={18} /> Clinical Precautions
                    </h3>
                    <div className="space-y-2">
                      {savedPrecautions.map((note, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-amber-100">
                          <p className="text-sm text-ink-900 m-0 font-medium">{note.text}</p>
                          <p className="text-[11px] text-ink-500 m-0 mt-1">Added by {note.author} on {note.date}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Appointment */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-ink-200 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h3 className="m-0 text-base font-semibold text-ink-900">Next Appointment</h3>
                    <p className="text-sm text-ink-600 mt-1">26 Oct 2026 at 09:30 AM</p>
                    <p className="text-xs text-ink-500 mt-0.5">Dr. Smith • Chamber 101</p>
                  </div>
                </div>

                {/* Vaccinations Due */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-red-100 flex items-center gap-4 hover:border-red-300 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors">
                    <Syringe size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="m-0 text-base font-semibold text-ink-900">Vaccinations Due</h3>
                    <p className="text-sm text-ink-600 mt-1">OPV-1 for Baby is overdue</p>
                  </div>
                  <ChevronRight size={20} className="text-ink-400 group-hover:text-red-500 transition-colors" />
                </div>
              </div>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="max-w-4xl space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold font-heading text-ink-900 mb-1">Diagnostic Reports</h2>
              <p className="text-sm text-ink-600 m-0">Download and view your medical records securely.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allReports.map((report, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-ink-200 flex flex-col justify-between group hover:border-pink-300 transition-all relative overflow-hidden">
                  {idx < savedDocs.length && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">NEW</div>
                  )}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${report.type === 'Imaging' ? 'bg-purple-50 text-purple-600' : 'bg-amber-50 text-amber-600'}`}>
                        {report.type === 'Imaging' ? <Activity size={20} /> : <FileText size={20} />}
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-ink-900 m-0 pr-8">{report.title}</h4>
                        <span className="text-xs text-ink-500">{report.date} • {report.doctor}</span>
                      </div>
                    </div>
                  </div>
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-pink-50 text-pink-700 text-sm font-semibold hover:bg-pink-100 transition-colors cursor-pointer border border-pink-100">
                    <Download size={16} /> Download PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'baby':
        return (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8 text-ink-600 max-w-4xl mx-auto bg-white rounded-2xl border border-ink-100 shadow-sm">
            <Baby size={48} className="text-pink-500 mb-4" />
            <h3 className="text-xl font-semibold text-ink-900 mb-2">Baby Health Record</h3>
            <p className="text-sm text-ink-600 max-w-md">Newborn records, growth charts, and immunization progress will appear here after delivery.</p>
          </div>
        );
      case 'consent':
        return (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8 text-ink-600 max-w-4xl mx-auto bg-white rounded-2xl border border-ink-100 shadow-sm">
            <Shield size={48} className="text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-ink-900 mb-2">Consent Preferences</h3>
            <p className="text-sm text-ink-600 max-w-md">Manage data sharing permissions, research opt-ins, and treatment authorizations anytime.</p>
          </div>
        );
      case 'profile':
        return (
          <div className="max-w-4xl space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold font-heading text-ink-900 mb-1">My Profile</h2>
              <p className="text-sm text-ink-600 m-0">Manage your account & view secure access logs.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-ink-200 text-center col-span-1 flex flex-col items-center h-min">
                <div className="w-24 h-24 rounded-full bg-blue-50 text-blue-800 font-bold text-3xl flex items-center justify-center mb-4">LD</div>
                <h3 className="font-bold text-xl text-ink-900 m-0">Lakshmi Devi</h3>
                <p className="text-sm text-ink-500 mb-3">MOM-2026-000001</p>
                <span className="inline-block px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full font-semibold border border-green-200 mb-6">Active Patient</span>
                
                <button onClick={() => setIsLoggedIn(false)} className="w-full flex items-center justify-center gap-2 py-3 text-red-600 text-sm font-semibold border border-red-100 bg-red-50 cursor-pointer hover:bg-red-100 rounded-xl transition-colors">
                  <LogOut size={16} /> Sign Out
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-ink-200 overflow-hidden col-span-1 md:col-span-2">
                <div className="px-6 py-4 border-b border-ink-100 bg-ink-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-blue-600" />
                    <span className="text-sm font-bold text-ink-900">Recent Data Access Logs</span>
                  </div>
                  <span className="text-xs text-ink-500">DPDP Compliant</span>
                </div>
                <div className="divide-y divide-ink-100">
                  {[
                    { user: 'Dr. Smith (OB)', action: 'Viewed Lab Reports', time: 'Today, 10:45 AM', ip: '10.0.1.4' },
                    { user: 'Nurse Joy', action: 'Added Vitals', time: 'Yesterday, 04:20 PM', ip: '10.0.1.12' },
                    { user: 'System Admin', action: 'Account Created', time: '12 Oct 2026', ip: 'System' }
                  ].map((log, i) => (
                    <div key={i} className="p-5 hover:bg-ink-50/50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-semibold text-ink-900 m-0">{log.user}</p>
                        <span className="text-xs text-ink-500">{log.time}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-ink-600">{log.action}</span>
                        <span className="text-[10px] text-ink-400 font-mono bg-ink-100 px-1.5 py-0.5 rounded">IP: {log.ip}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const navItems = [
    { id: 'home', icon: Home, label: 'Overview' },
    { id: 'reports', icon: FileText, label: 'Reports' },
    { id: 'baby', icon: Baby, label: 'Baby' },
    { id: 'consent', icon: Shield, label: 'Consent' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="flex h-screen bg-ink-50 font-body overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-ink-200 hidden md:flex flex-col">
        <div className="h-[72px] flex items-center px-6 border-b border-ink-100">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center">
              <HeartPulse size={18} />
            </div>
            <span className="font-heading font-bold text-lg text-ink-900">Patient Portal</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm cursor-pointer border-0 ${
                activeTab === item.id 
                  ? 'bg-pink-50 text-pink-700' 
                  : 'bg-transparent text-ink-600 hover:bg-ink-50 hover:text-ink-900'
              }`}
            >
              <item.icon size={18} className={activeTab === item.id ? 'text-pink-600' : 'text-ink-400'} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-ink-100">
          <button onClick={() => setIsLoggedIn(false)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-ink-600 hover:bg-red-50 hover:text-red-700 transition-colors text-sm font-semibold cursor-pointer border-0 bg-transparent">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="h-[60px] bg-white border-b border-ink-200 flex md:hidden items-center justify-center px-4 shrink-0">
          <span className="font-heading font-bold text-lg text-ink-900">Patient Portal</span>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          {renderContent()}
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 bg-white border-t border-ink-200 flex items-center justify-around px-2 py-2 pb-safe-area-bottom shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-colors border-0 bg-transparent cursor-pointer ${
                activeTab === item.id ? 'text-pink-600' : 'text-ink-400 hover:text-ink-700'
              }`}
            >
              <div className={`${activeTab === item.id ? 'bg-pink-50 text-pink-600 p-1.5 rounded-lg' : ''} transition-all`}>
                <item.icon size={20} />
              </div>
              <span className={`text-[10px] font-semibold ${activeTab === item.id ? 'text-pink-700' : 'text-ink-500'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default GuardianPortal;
