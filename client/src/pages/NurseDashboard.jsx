import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartPulse, Users, Thermometer, RefreshCw, ChevronRight,
  AlertTriangle, CheckCircle2, Clock, Baby, Activity, Loader
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000/api/v1';

const StatCard = ({ icon: Icon, label, value, color = 'blue' }) => {
  const c = {
    blue: 'bg-blue-50 text-blue-600',
    pink: 'bg-pink-50 text-pink-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
  }[color] || 'bg-blue-50 text-blue-600';

  return (
    <div className="bg-white rounded-xl border border-ink-100 shadow-sm p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${c}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-[12px] text-ink-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-ink-900">{value ?? '—'}</p>
      </div>
    </div>
  );
};

const NurseDashboard = () => {
  const { user, authHeader } = useAuth();
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [highRisk, setHighRisk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const load = async () => {
    setSyncing(true);
    try {
      const headers = { ...authHeader() };
      const [statsRes, patientsRes] = await Promise.all([
        fetch(`${API_BASE}/dashboard/stats`, { headers }),
        fetch(`${API_BASE}/patients?limit=30&sort=-updatedAt`, { headers })
      ]);
      if (statsRes.ok) {
        const s = await statsRes.json();
        if (s.success) {
          setStats(s.data);
          if (Array.isArray(s.data.highRiskList)) setHighRisk(s.data.highRiskList);
        }
      }
      if (patientsRes.ok) {
        const p = await patientsRes.json();
        if (p.success && Array.isArray(p.data)) setPatients(p.data);
      }
    } catch (e) {
      console.warn('Nurse dashboard error:', e);
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  };

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader size={32} className="animate-spin text-pink-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-heading text-ink-900">Ward / Nursing Dashboard</h1>
          <p className="text-sm text-ink-500 mt-0.5">Welcome, {user?.name || 'Nurse'} — Maternity ward overview</p>
        </div>
        <button onClick={load} disabled={syncing} className="btn btn-secondary h-[36px] px-3 text-sm flex items-center gap-2 cursor-pointer">
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> Sync
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Patients" value={stats?.totalPatients} color="blue" />
        <StatCard icon={HeartPulse} label="Active Pregnancies" value={stats?.activePregnancies} color="pink" />
        <StatCard icon={AlertTriangle} label="High Risk" value={stats?.highRiskPregnancies} color="amber" />
        <StatCard icon={Baby} label="Deliveries" value={stats?.deliveriesCount} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Risk Watch List */}
        <div className="bg-white rounded-xl border border-amber-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-ink-100 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            <h2 className="font-semibold text-ink-900 text-[15px]">High Risk Watch List</h2>
          </div>
          {highRisk.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 size={28} className="text-green-400 mx-auto mb-2" />
              <p className="text-sm text-ink-500">No high-risk patients today</p>
            </div>
          ) : (
            <div className="divide-y divide-ink-50">
              {highRisk.map((p, i) => (
                <Link
                  key={p._id || i}
                  to={`/patients/${p._id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-amber-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 font-bold text-[13px] flex items-center justify-center shrink-0">
                    {(p.name || 'P').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink-900 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-ink-500 truncate">{p.riskFactors?.join(', ') || 'Flagged'}</p>
                  </div>
                  <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-bold shrink-0">HIGH</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Admitted Patients */}
        <div className="bg-white rounded-xl border border-ink-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-ink-100 flex items-center gap-2">
            <Thermometer size={18} className="text-pink-500" />
            <h2 className="font-semibold text-ink-900 text-[15px]">Recent Patients</h2>
          </div>
          <div className="divide-y divide-ink-50">
            {patients.slice(0, 8).map((p, i) => (
              <Link
                key={p._id || i}
                to={`/patients/${p._id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-pink-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-700 font-bold text-[12px] flex items-center justify-center shrink-0">
                  {(p.name || 'P').charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink-900 text-[13px] truncate">{p.name}</p>
                  <p className="text-[11px] text-ink-500">{p.motherId || p._id?.slice(-6)}</p>
                </div>
                <ChevronRight size={14} className="text-ink-400" />
              </Link>
            ))}
            {patients.length === 0 && <div className="p-6 text-center text-ink-400 text-sm">No patients found</div>}
          </div>
        </div>
      </div>

      {/* Nursing Quick Actions */}
      <div className="bg-white rounded-xl border border-ink-100 shadow-sm p-5">
        <h3 className="font-semibold text-ink-900 mb-4 text-[15px]">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/patients/search', icon: Users, label: 'Patient Search', color: 'pink' },
            { to: '/patients/register', icon: Baby, label: 'New Admission', color: 'blue' },
            { to: '/patients/search', icon: Activity, label: 'Vitals Entry', color: 'green' },
            { to: '/patients/search', icon: Clock, label: 'Ward Rounds', color: 'amber' },
          ].map(a => (
            <Link
              key={a.label}
              to={a.to}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-ink-100 hover:border-pink-300 hover:shadow-md transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl bg-${a.color}-50 flex items-center justify-center`}>
                <a.icon size={20} className={`text-${a.color}-600`} />
              </div>
              <span className="text-[12px] font-semibold text-ink-700 text-center group-hover:text-pink-700">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;
