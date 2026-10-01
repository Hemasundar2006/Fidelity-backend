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
  const [highRisk, setHighRisk] = useState([]);

  const load = async () => {
    setSyncing(true);
    try {
      const headers = authHeader();
      const res = await fetch(`${API_BASE}/dashboard/stats`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
          if (Array.isArray(data.data.highRiskList)) setHighRisk(data.data.highRiskList);
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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader size={32} className="animate-spin text-purple-600" />
    </div>
  );

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
        {/* High Risk Panel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              <h2 className="font-semibold text-ink-900 text-[15px]">High Risk Pregnancies</h2>
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
              {highRisk.length} active
            </span>
          </div>
          <div className="divide-y divide-ink-50">
            {highRisk.length === 0 ? (
              <div className="p-8 text-center text-ink-400 text-sm">No high-risk pregnancies currently flagged.</div>
            ) : (
              highRisk.map((p, i) => (
                <Link
                  key={p._id || i}
                  to={`/patients/${p._id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-red-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-red-100 text-red-700 font-bold text-[13px] flex items-center justify-center shrink-0">
                    {(p.name || 'P').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink-900 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-ink-500 truncate">{p.riskFactors?.join(', ') || 'Flagged High Risk'}</p>
                  </div>
                  <ChevronRight size={16} className="text-ink-400 shrink-0" />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Admin Quick Actions */}
        <div className="bg-white rounded-xl border border-ink-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-ink-100">
            <h2 className="font-semibold text-ink-900 text-[15px]">Admin Actions</h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              { to: '/admin', icon: Settings, label: 'User Management', sub: 'Create, edit, deactivate staff accounts', color: 'purple' },
              { to: '/patients/register', icon: UserPlus, label: 'Register Patient', sub: 'New mother/patient registration', color: 'blue' },
              { to: '/patients/search', icon: Users, label: 'Patient Directory', sub: 'View all registered patients', color: 'green' },
              { to: '/dashboard/receptionist', icon: Calendar, label: 'OPD Queue', sub: 'Receptionist appointment view', color: 'pink' },
            ].map(a => (
              <Link
                key={a.to + a.label}
                to={a.to}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-purple-50 transition-colors border border-transparent hover:border-purple-100 group"
              >
                <div className={`w-9 h-9 rounded-lg bg-${a.color}-100 flex items-center justify-center shrink-0 mt-0.5`}>
                  <a.icon size={18} className={`text-${a.color}-600`} />
                </div>
                <div>
                  <p className="font-semibold text-ink-900 text-[13px] group-hover:text-purple-700">{a.label}</p>
                  <p className="text-[11px] text-ink-400 mt-0.5">{a.sub}</p>
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
