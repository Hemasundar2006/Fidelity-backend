import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, User, Phone, Activity, ChevronRight, RefreshCw, Loader, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000/api/v1';

const RISK_BADGE = {
  high: 'text-red-700 bg-red-50 border-red-200',
  mid: 'text-amber-700 bg-amber-50 border-amber-200',
  low: 'text-green-700 bg-green-50 border-green-200',
};

const PatientSearch = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { authHeader } = useAuth();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);

  const loadPatients = useCallback(async (q = '') => {
    setLoading(true);
    setError('');
    try {
      let url = `${API_BASE}/patients?limit=100&sort=-createdAt`;
      if (q) url += `&search=${encodeURIComponent(q)}`;
      const res = await fetch(url, { headers: authHeader() });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Server error: ${res.status}`);
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPatients(data.data);
        setTotal(data.total || data.data.length);
      } else {
        setPatients([]);
      }
    } catch (e) {
      console.warn('PatientSearch error:', e);
      setError(e.message || 'Could not fetch patients');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [authHeader]);

  useEffect(() => {
    loadPatients(searchParams.get('q') || '');
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams(query ? { q: query } : {});
      loadPatients(query);
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  // Local filter in case server doesn't support search param
  const filtered = patients.filter(p => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.motherId?.toLowerCase().includes(q) ||
      p.phone?.includes(query) ||
      p._id?.includes(q)
    );
  });

  const getRiskLevel = (p) => {
    if (p.currentPregnancy?.riskLevel) return p.currentPregnancy.riskLevel;
    if (p.pregnancies?.some(pr => pr.riskLevel === 'high')) return 'high';
    return 'low';
  };

  return (
    <div className="max-w-6xl mx-auto pb-0 min-w-0">
      <div className="mb-6 max-sm:mb-4 flex flex-col gap-1">
        <h1 className="text-[28px] max-sm:text-[22px] leading-[36px] max-sm:leading-[30px] font-heading font-semibold text-blue-800 m-0">
          Patient Directory
        </h1>
        <p className="text-[16px] leading-[24px] text-ink-600 m-0">
          Search across registered mothers and their lifelong records
          {!loading && <span className="ml-2 text-ink-400 text-sm">— {total} total patients</span>}
        </p>
      </div>

      <div className="relative mb-6 max-sm:mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
          <input
            type="text"
            className="input pl-12 h-[44px] max-sm:h-[48px] max-sm:text-[16px] shadow-sm w-full"
            placeholder="Search by Mother ID, Name, or Phone Number..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {loading && (
            <Loader size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 animate-spin" />
          )}
        </div>
        <button
          onClick={() => loadPatients(query)}
          className="btn btn-secondary h-[44px] px-3 flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline text-sm">Refresh</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      <div className="card !p-0 overflow-hidden flex flex-col">
        {/* Desktop Table */}
        <div className="table-responsive hidden md:block">
          <table className="table">
            <thead>
              <tr className="border-b border-ink-100">
                <th className="px-4 py-3 text-left">Mother ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Age</th>
                <th className="px-4 py-3 text-left">Risk</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-ink-400">
                    <Loader size={28} className="animate-spin mx-auto mb-2 text-blue-500" />
                    Loading patients...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-ink-400">
                    {query ? `No patients found matching "${query}"` : 'No patients registered yet.'}
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const risk = getRiskLevel(p);
                  const badgeCls = RISK_BADGE[risk] || RISK_BADGE.low;
                  return (
                    <tr
                      key={p._id}
                      onClick={() => navigate(`/patients/${p._id}`)}
                      className="cursor-pointer hover:bg-blue-50 transition-colors border-b border-ink-100 last:border-0"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-ink-600">{p.motherId || p._id?.slice(-8)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-700 font-bold text-[12px] flex items-center justify-center shrink-0">
                            {(p.name || 'P').charAt(0)}
                          </div>
                          <span className="font-semibold text-ink-900">{p.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-600 text-sm">{p.phone || '—'}</td>
                      <td className="px-4 py-3 text-ink-600 text-sm">{p.age ? `${p.age}y` : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full border ${badgeCls}`}>
                          {risk}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          p.isActive ? 'text-green-700 bg-green-50' : 'text-ink-500 bg-ink-100'
                        }`}>
                          {p.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ChevronRight size={16} className="text-ink-400 inline-block" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-ink-100">
          {loading ? (
            <div className="p-8 text-center">
              <Loader size={28} className="animate-spin mx-auto text-blue-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-ink-400 text-sm">
              {query ? `No patients found matching "${query}"` : 'No patients registered yet.'}
            </div>
          ) : (
            filtered.map((p) => {
              const risk = getRiskLevel(p);
              const badgeCls = RISK_BADGE[risk] || RISK_BADGE.low;
              return (
                <div
                  key={p._id}
                  onClick={() => navigate(`/patients/${p._id}`)}
                  className="p-4 hover:bg-blue-50 cursor-pointer transition-colors flex items-center gap-3"
                >
                  <div className="w-11 h-11 rounded-full bg-pink-100 text-pink-700 font-bold text-[15px] flex items-center justify-center shrink-0">
                    {(p.name || 'P').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink-900 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-ink-500">{p.motherId || p._id?.slice(-8)} · {p.phone || '—'}</p>
                    <div className="flex gap-2 mt-1">
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${badgeCls}`}>
                        {risk} risk
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-ink-400 shrink-0" />
                </div>
              );
            })
          )}
        </div>

        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-ink-100 text-xs text-ink-400 bg-ink-50">
            Showing {filtered.length} of {total} patients
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientSearch;
