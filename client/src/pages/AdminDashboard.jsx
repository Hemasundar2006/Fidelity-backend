import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Users, Activity, RefreshCw, Settings,
  UserPlus, Database, BarChart3, AlertTriangle,
  Baby, HeartPulse, Calendar, ChevronRight, Loader
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';

// Brand Colors
const BLUE = '#76C0EC';
const BLUE_LIGHT = '#f0f8fd';
const PINK = '#FF95A5';
const PINK_LIGHT = '#fff0f2';

const StatCard = ({ icon: Icon, label, value, sub, theme = 'blue' }) => {
  const isPink = theme === 'pink';
  const color = isPink ? PINK : BLUE;
  const bgColor = isPink ? PINK_LIGHT : BLUE_LIGHT;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: bgColor }}>
          <Icon size={20} style={{ color: color }} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 leading-none">{value ?? '—'}</p>
        <p className="text-[13px] text-slate-500 font-medium mt-2">{label}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { user, authHeader } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [allPatients, setAllPatients] = useState([]);
  const [patientFilter, setPatientFilter] = useState('all'); // all, high_risk, active

  const load = async () => {
    setSyncing(true);
    try {
      const headers = authHeader();
      const res = await fetch(`${API_BASE}/dashboard/stats`, { headers });
      const pRes = await fetch(`${API_BASE}/patients`, { headers });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      }
      
      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData.success) {
          setAllPatients(pData.data);
        }
      }
    } catch (e) {
      console.warn('Admin dashboard error:', e);
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  };

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);

  const getRiskLevel = (p) => {
    if (p.currentPregnancy?.riskLevel) return p.currentPregnancy.riskLevel;
    if (p.pregnancies?.some(pr => pr.riskLevel === 'high')) return 'high';
    return 'low';
  };

  const filteredPatients = allPatients.filter(p => {
    if (patientFilter === 'high_risk') return getRiskLevel(p) === 'high';
    if (patientFilter === 'active') return p.isActive !== false;
    return true;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader size={32} className="animate-spin" style={{ color: BLUE }} />
    </div>
  );

  if (user && user.isApproved === false) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-amber-100">
          <ShieldCheck size={40} className="text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3 font-heading">Account Pending Approval</h2>
        <p className="text-slate-500 text-sm max-w-md">
          Your hospital registration has been received. Please wait for a platform administrator to approve your account before you can access the admin panel.
        </p>
        <button className="h-[44px] rounded-lg px-6 mt-8 font-semibold text-white bg-slate-300 cursor-not-allowed flex items-center gap-2">
          <AlertTriangle size={18} /> Locked
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: BLUE_LIGHT }}>
              <ShieldCheck size={20} style={{ color: BLUE }} />
            </div>
            <h1 className="text-2xl font-bold font-heading text-slate-900">System Overview</h1>
          </div>
          <p className="text-sm text-slate-500 ml-12">Administrator portal — Full system visibility</p>
        </div>
        <button 
          onClick={load} 
          disabled={syncing} 
          className="h-[38px] px-4 rounded-lg text-sm font-semibold flex items-center gap-2 border transition-all"
          style={{ backgroundColor: 'white', color: BLUE, borderColor: BLUE }}
        >
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> Sync Data
        </button>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={Users} label="Total Patients" value={stats?.totalPatients} theme="blue" />
        <StatCard icon={Calendar} label="Today's Appts" value={stats?.todaysAppointments} theme="blue" />
        <StatCard icon={HeartPulse} label="Active Pregnancies" value={stats?.activePregnancies} theme="pink" />
        <StatCard icon={AlertTriangle} label="High Risk" value={stats?.highRiskPregnancies} sub="Requires attention" theme="pink" />
        <StatCard icon={Baby} label="Deliveries" value={stats?.deliveriesCount} theme="blue" />
        <StatCard icon={Activity} label="Total Appts" value={stats?.totalAppointments} theme="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Directory Preview */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[420px]">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-slate-400" />
              <h2 className="font-semibold text-slate-800 text-[15px]">Patient Overview</h2>
            </div>
            
            {/* Filters */}
            <div className="flex items-center p-1 bg-slate-50 rounded-lg border border-slate-200">
              <button 
                onClick={() => setPatientFilter('all')} 
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${patientFilter === 'all' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700 border border-transparent'}`}
              >
                All
              </button>
              <button 
                onClick={() => setPatientFilter('active')} 
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${patientFilter === 'active' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700 border border-transparent'}`}
              >
                Active
              </button>
              <button 
                onClick={() => setPatientFilter('high_risk')} 
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${patientFilter === 'high_risk' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700 border border-transparent'}`}
              >
                High Risk
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredPatients.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center">
                <Users size={32} className="text-slate-300 mb-3" />
                <p className="text-slate-500 text-sm">No patients found for the selected filter.</p>
              </div>
            ) : (
              filteredPatients.map((p, i) => {
                const risk = getRiskLevel(p);
                const isHighRisk = risk === 'high';
                
                return (
                  <Link
                    key={p._id || i}
                    to={`/patients/${p._id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg font-bold text-[14px] flex items-center justify-center shrink-0 border" style={{ backgroundColor: isHighRisk ? PINK_LIGHT : BLUE_LIGHT, color: isHighRisk ? PINK : BLUE, borderColor: isHighRisk ? '#FF95A540' : '#76C0EC40' }}>
                      {(p.name || 'P').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-[14px] truncate">{p.name}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">ID: {p.motherId || p._id?.slice(-8)} • Ph: {p.phone || 'N/A'}</p>
                    </div>
                    
                    {isHighRisk && (
                      <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase" style={{ backgroundColor: PINK_LIGHT, color: PINK }}>
                        High Risk
                      </span>
                    )}
                    
                    <ChevronRight size={18} className="text-slate-300 shrink-0 group-hover:text-slate-600 transition-colors" />
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[420px]">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 text-[15px]">Quick Actions</h2>
          </div>
          <div className="p-4 flex-1 flex flex-col gap-2 overflow-y-auto">
            {[
              { to: '/admin', icon: Settings, label: 'User Management', sub: 'Manage hospital staff access' },
              { to: '/patients/register', icon: UserPlus, label: 'Register Patient', sub: 'Add new mother profiles' },
              { to: '/patients/search', icon: Users, label: 'Patient Directory', sub: 'Search existing records' },
              { to: '/dashboard/receptionist', icon: Calendar, label: 'OPD Queue', sub: 'View daily appointments' },
            ].map(a => (
              <Link
                key={a.to + a.label}
                to={a.to}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-colors" style={{ backgroundColor: BLUE_LIGHT, color: BLUE, borderColor: '#76C0EC40' }}>
                  <a.icon size={18} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-[14px]">{a.label}</p>
                  <p className="text-[12px] text-slate-500 mt-0.5">{a.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Database Connection', status: 'Healthy', icon: Database },
          { label: 'Access Control', status: 'Enforced', icon: ShieldCheck },
          { label: 'Data Privacy', status: 'DPDP Compliant', icon: BarChart3 },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
              <s.icon size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-[12px] text-slate-500 font-medium mb-0.5">{s.label}</p>
              <p className="text-[14px] font-bold text-slate-800">{s.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
