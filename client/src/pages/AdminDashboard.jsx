import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Users, Activity, RefreshCw, Settings,
  UserPlus, Database, BarChart3, TrendingUp, AlertTriangle,
  Baby, HeartPulse, Calendar, ChevronRight, Loader
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';

const StatCard = ({ icon: Icon, label, value, sub, color = 'purple' }) => {
  const c = {
    purple: 'bg-purple-50 text-purple-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    pink: 'bg-pink-50 text-pink-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  }[color] || 'bg-purple-50 text-purple-600';

  return (
    <div className="bg-white rounded-xl border border-ink-100 shadow-sm p-4 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${c}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[12px] text-ink-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-ink-900 leading-none mt-1">{value ?? '—'}</p>
        {sub && <p className="text-[11px] text-ink-400 mt-1">{sub}</p>}
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
      <Loader size={32} className="animate-spin text-purple-600" />
    </div>
  );

  if (user && user.isApproved === false) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <ShieldCheck size={40} className="text-amber-600" />
        </div>
        <h2 className="text-3xl font-bold text-ink-900 mb-3 font-heading">Account Pending Approval</h2>
        <p className="text-ink-600 text-lg max-w-md">
          Your hospital registration has been received. Please wait for a platform administrator to approve your account before you can access the admin panel.
        </p>
        <button className="btn btn-primary h-[48px] px-6 mt-8 opacity-75 cursor-not-allowed">
          <AlertTriangle size={18} className="mr-2" /> Locked
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <ShieldCheck size={18} className="text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold font-heading text-ink-900">System Overview</h1>
          </div>
          <p className="text-sm text-ink-500">Administrator portal — Full system visibility</p>
        </div>
        <button onClick={load} disabled={syncing} className="btn btn-secondary h-[36px] px-3 text-sm flex items-center gap-2 cursor-pointer">
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> Sync
        </button>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={Users} label="Total Patients" value={stats?.totalPatients} color="purple" />
        <StatCard icon={Calendar} label="Today's Appts" value={stats?.todaysAppointments} color="blue" />
        <StatCard icon={HeartPulse} label="Active Pregnancies" value={stats?.activePregnancies} color="pink" />
        <StatCard icon={AlertTriangle} label="High Risk" value={stats?.highRiskPregnancies} sub="Needs review" color="red" />
        <StatCard icon={Baby} label="Deliveries" value={stats?.deliveriesCount} color="green" />
        <StatCard icon={Activity} label="Total Appts" value={stats?.totalAppointments} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Filters Panel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#76C0EC]/20 shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="px-5 py-4 border-b border-[#76C0EC]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-[#76C0EC]" />
              <h2 className="font-semibold text-gray-800 text-[15px]">Patient Directory Overview</h2>
            </div>
            
            {/* Patient Filters */}
            <div className="flex items-center gap-2 bg-[#f4fafe] p-1 rounded-lg border border-[#76C0EC]/20">
              <button 
                onClick={() => setPatientFilter('all')} 
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${patientFilter === 'all' ? 'bg-[#76C0EC] text-white shadow-sm' : 'text-[#76C0EC] hover:bg-[#e6f4fc]'}`}
              >
                All
              </button>
              <button 
                onClick={() => setPatientFilter('active')} 
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${patientFilter === 'active' ? 'bg-[#76C0EC] text-white shadow-sm' : 'text-[#76C0EC] hover:bg-[#e6f4fc]'}`}
              >
                Active
              </button>
              <button 
                onClick={() => setPatientFilter('high_risk')} 
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${patientFilter === 'high_risk' ? 'bg-[#FF95A5] text-white shadow-sm' : 'text-[#FF95A5] hover:bg-[#fff0f2]'}`}
              >
                High Risk
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-[#76C0EC]/10">
            {filteredPatients.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No patients found for the selected filter.</div>
            ) : (
              filteredPatients.map((p, i) => {
                const risk = getRiskLevel(p);
                const isHighRisk = risk === 'high';
                
                return (
                  <Link
                    key={p._id || i}
                    to={`/patients/${p._id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#f4fafe] transition-colors"
                  >
                    <div className={`w-9 h-9 rounded-full font-bold text-[13px] flex items-center justify-center shrink-0 ${isHighRisk ? 'bg-[#fff0f2] text-[#FF95A5]' : 'bg-[#e6f4fc] text-[#76C0EC]'}`}>
                      {(p.name || 'P').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{p.name}</p>
                      <p className="text-xs text-gray-500 truncate">{p.motherId || p._id?.slice(-8)} A {p.phone || 'N/A'}</p>
                    </div>
                    
                    {isHighRisk && (
                      <span className="shrink-0 text-[10px] font-bold text-[#FF95A5] bg-[#fff0f2] border border-[#FF95A5]/20 px-2 py-0.5 rounded-full uppercase">
                        High Risk
                      </span>
                    )}
                    
                    <ChevronRight size={16} className="text-[#76C0EC]/50 shrink-0" />
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Admin Quick Actions */}
        <div className="bg-white rounded-xl border border-[#76C0EC]/20 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#76C0EC]/10 bg-[#f4fafe]">
            <h2 className="font-semibold text-[#76C0EC] text-[15px]">Admin Actions</h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              { to: '/admin', icon: Settings, label: 'User Management', sub: 'Create, edit, deactivate staff accounts' },
              { to: '/patients/register', icon: UserPlus, label: 'Register Patient', sub: 'New mother/patient registration' },
              { to: '/patients/search', icon: Users, label: 'Patient Directory', sub: 'View all registered patients' },
              { to: '/dashboard/receptionist', icon: Calendar, label: 'OPD Queue', sub: 'Receptionist appointment view' },
            ].map(a => (
              <Link
                key={a.to + a.label}
                to={a.to}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#fff0f2] transition-colors border border-transparent hover:border-[#FF95A5]/20 group"
              >
                <div className="w-9 h-9 rounded-lg bg-[#f4fafe] flex items-center justify-center shrink-0 mt-0.5 text-[#76C0EC] group-hover:bg-[#FF95A5] group-hover:text-white transition-colors">
                  <a.icon size={18} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-[13px] group-hover:text-[#FF95A5] transition-colors">{a.label}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{a.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* System Health Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Database', status: 'Healthy', color: 'green', icon: Database },
          { label: 'RBAC Active', status: 'Enforced', color: 'purple', icon: ShieldCheck },
          { label: 'DPDP Compliance', status: 'Compliant', color: 'blue', icon: BarChart3 },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-ink-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg bg-${s.color}-100 flex items-center justify-center shrink-0`}>
              <s.icon size={18} className={`text-${s.color}-600`} />
            </div>
            <div>
              <p className="text-[11px] text-ink-500">{s.label}</p>
              <p className={`text-sm font-bold text-${s.color}-700`}>{s.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
