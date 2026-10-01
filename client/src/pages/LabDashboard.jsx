import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FlaskConical, Search, RefreshCw, ChevronRight, Users,
  FileText, CheckCircle2, Clock, AlertCircle, Loader
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';

const LabDashboard = () => {
  const { user, authHeader } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    setSyncing(true);
    try {
      const headers = authHeader();
      const res = await fetch(`${API_BASE}/patients?limit=50&sort=-updatedAt`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) setPatients(data.data);
      }
    } catch (e) {
      console.warn('Lab dashboard error:', e);
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  };

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);

  const filtered = patients.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.motherId?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader size={32} className="animate-spin text-amber-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-heading text-ink-900">Laboratory Dashboard</h1>
          <p className="text-sm text-ink-500 mt-0.5">Welcome, {user?.name || 'Lab Tech'} — Lab reports & patient queue</p>
        </div>
        <button onClick={load} disabled={syncing} className="btn btn-secondary h-[36px] px-3 text-sm flex items-center gap-2 cursor-pointer">
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> Sync
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Users, label: 'Total Patients', value: patients.length, color: 'amber' },
          { icon: FileText, label: 'With Reports', value: '—', color: 'blue' },
          { icon: Clock, label: 'Pending Results', value: '—', color: 'red' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-ink-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-${s.color}-50 flex items-center justify-center`}>
              <s.icon size={20} className={`text-${s.color}-600`} />
            </div>
            <div>
              <p className="text-[11px] text-ink-500">{s.label}</p>
              <p className="text-xl font-bold text-ink-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Patient Search & Queue */}
      <div className="bg-white rounded-xl border border-ink-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <FlaskConical size={18} className="text-amber-500" />
            <h2 className="font-semibold text-ink-900 text-[15px]">Patient Lab Queue</h2>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search patient..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 h-[34px] text-sm rounded-lg border border-ink-200 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 w-52"
            />
          </div>
        </div>
        <div className="divide-y divide-ink-50">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-ink-400 text-sm">No patients found.</div>
          ) : (
            filtered.slice(0, 20).map((p, i) => (
              <div
                key={p._id || i}
                onClick={() => navigate(`/patients/${p._id}/reports`)}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-amber-50 cursor-pointer transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 font-bold text-[13px] flex items-center justify-center shrink-0">
                  {(p.name || 'P').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-900 text-sm truncate">{p.name}</p>
                  <p className="text-xs text-ink-500">{p.motherId || p._id?.slice(-8)} · {p.phone || '—'}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">Lab Reports</span>
                  <ChevronRight size={15} className="text-ink-400" />
                </div>
              </div>
            ))
          )}
        </div>
        {filtered.length > 20 && (
          <div className="px-5 py-3 border-t border-ink-100">
            <p className="text-xs text-ink-400">Showing 20 of {filtered.length} patients. Use search to narrow down.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabDashboard;
