import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Stethoscope, Users, AlertTriangle, Baby, ChevronRight,
  Clock, RefreshCw, HeartPulse, FileText, CheckCircle2,
  TrendingUp, Calendar, Activity, Loader
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000/api/v1';

const StatCard = ({ icon: Icon, label, value, sub, color = 'blue' }) => {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    green: 'text-green-600 bg-green-50 border-green-100',
    pink: 'text-pink-600 bg-pink-50 border-pink-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    red: 'text-red-600 bg-red-50 border-red-100',
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className={`rounded-xl border p-4 flex items-start gap-4 bg-white shadow-sm`}>
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${c.split(' ').slice(1).join(' ')}`}>
        <Icon size={22} className={c.split(' ')[0]} />
      </div>
      <div>
        <p className="text-[13px] text-ink-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-ink-900 leading-none mt-0.5">{value}</p>
        {sub && <p className="text-[11px] text-ink-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
};

const DoctorDashboard = () => {
  const { user, authHeader } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [highRisk, setHighRisk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());

  const load = async () => {
    setSyncing(true);
    try {
      const headers = { ...authHeader(), 'Content-Type': 'application/json' };
      const [statsRes, patientsRes] = await Promise.all([
        fetch(`${API_BASE}/dashboard/stats`, { headers }),
        fetch(`${API_BASE}/patients?limit=20&sort=-createdAt`, { headers })
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
      setLastSync(new Date());
    } catch (e) {
      console.warn('Doctor dashboard error:', e);
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader size={32} className="animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-heading text-ink-900">Clinical Dashboard</h1>
          <p className="text-sm text-ink-500 mt-0.5">
            Welcome, {user?.name || 'Doctor'} — Today's maternity clinical overview
          </p>
        </div>
        <button
          onClick={load}
          disabled={syncing}
          className="btn btn-secondary h-[36px] px-3 text-sm flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          Sync
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Patients" value={stats?.totalPatients ?? '—'} color="blue" />
        <StatCard icon={HeartPulse} label="Active Pregnancies" value={stats?.activePregnancies ?? '—'} color="pink" />
        <StatCard icon={AlertTriangle} label="High Risk" value={stats?.highRiskPregnancies ?? '—'} sub="Requires attention" color="red" />
        <StatCard icon={Baby} label="Deliveries (Total)" value={stats?.deliveriesCount ?? '—'} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* High Risk Patients */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              <h2 className="font-semibold text-ink-900 text-[15px]">High Risk Pregnancies</h2>
            </div>
            <span className="text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full font-semibold">
              {highRisk.length} flagged
            </span>
          </div>
          {highRisk.length === 0 ? (
            <div className="p-8 text-center text-ink-400 text-sm">
              <CheckCircle2 size={32} className="text-green-400 mx-auto mb-2" />
              No high-risk pregnancies flagged today.
            </div>
          ) : (
            <div className="divide-y divide-ink-50">
              {highRisk.map((p, i) => (
                <div
                  key={p._id || i}
                  onClick={() => navigate(`/patients/${p._id}`)}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-red-50 cursor-pointer transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-[13px] font-bold shrink-0">
                    {(p.name || 'P').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink-900 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-ink-500 mt-0.5 truncate">
                      {p.age ? `${p.age}y · ` : ''}{p.riskFactors?.join(', ') || 'High Risk'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">HIGH RISK</span>
                    <ChevronRight size={16} className="text-ink-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-xl border border-ink-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-blue-500" />
              <h2 className="font-semibold text-ink-900 text-[15px]">Recent Patients</h2>
            </div>
          </div>
          <div className="divide-y divide-ink-50">
            {patients.slice(0, 8).map((p, i) => (
              <Link
                key={p._id || i}
                to={`/patients/${p._id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-blue-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[12px] font-bold shrink-0">
                  {(p.name || 'P').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink-900 text-[13px] truncate">{p.name}</p>
                  <p className="text-[11px] text-ink-500 truncate">{p.motherId || p._id?.slice(-6)}</p>
                </div>
                <ChevronRight size={14} className="text-ink-400 shrink-0" />
              </Link>
            ))}
            {patients.length === 0 && (
              <div className="p-6 text-center text-ink-400 text-sm">No patients found</div>
            )}
          </div>
          <div className="px-5 py-3 border-t border-ink-100">
            <Link to="/patients/search" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
              View all patients <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/patients/register', icon: Users, label: 'Register New Patient', color: 'blue' },
          { to: '/patients/search', icon: Stethoscope, label: 'Open Patient Record', color: 'green' },
          { to: '/patients/search', icon: FileText, label: 'View Lab Reports', color: 'amber' },
          { to: '/patients/search', icon: Activity, label: 'Antenatal Records', color: 'pink' },
        ].map(q => (
          <Link
            key={q.to + q.label}
            to={q.to}
            className="bg-white rounded-xl border border-ink-100 p-4 flex flex-col items-center gap-2 hover:border-blue-300 hover:shadow-md transition-all text-center group"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${q.color}-50`}>
              <q.icon size={20} className={`text-${q.color}-600`} />
            </div>
            <span className="text-[12px] font-semibold text-ink-700 group-hover:text-blue-700">{q.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DoctorDashboard;
