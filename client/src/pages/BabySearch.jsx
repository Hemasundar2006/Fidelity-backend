import React, { useState, useEffect } from 'react';
import { Search, Baby, ChevronRight, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';
import { Link } from 'react-router-dom';

const BabySearch = () => {
  const { authHeader } = useAuth();
  const [query, setQuery] = useState('');
  const [babies, setBabies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBabies = async (searchQuery = '') => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/babies?q=${encodeURIComponent(searchQuery)}`, {
        headers: authHeader()
      });
      const data = await res.json();
      if (data.success) {
        setBabies(data.data);
      } else {
        setError(data.error?.message || 'Failed to fetch babies');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBabies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBabies(query);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-[28px] leading-[36px] font-heading font-semibold text-blue-800 m-0">Baby Directory</h1>
          <p className="text-[14px] text-ink-600 m-0 mt-1">Search and manage registered newborn profiles</p>
        </div>
        <Link to="/babies/register" className="btn btn-primary h-[40px]">
          <Baby size={18} />
          Register New Baby
        </Link>
      </div>

      <div className="card p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by Baby Name, ID..."
              className="input pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" size={18} />
          </div>
          <button type="submit" className="btn btn-primary px-6" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {error && <div className="text-red-600 p-4 bg-red-50 rounded-card mb-6 border border-red-200">{error}</div>}

      <div className="flex-1 overflow-auto bg-white rounded-card shadow-card border border-ink-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-ink-50 border-b border-ink-200">
              <th className="p-4 text-[13px] font-semibold text-ink-700 uppercase tracking-wider">Baby Details</th>
              <th className="p-4 text-[13px] font-semibold text-ink-700 uppercase tracking-wider">Mother</th>
              <th className="p-4 text-[13px] font-semibold text-ink-700 uppercase tracking-wider">DOB</th>
              <th className="p-4 text-[13px] font-semibold text-ink-700 uppercase tracking-wider">Sex</th>
              <th className="p-4 text-[13px] font-semibold text-ink-700 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-ink-500">Loading babies...</td>
              </tr>
            ) : babies.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-ink-500">
                  <Baby size={48} className="mx-auto mb-3 text-ink-300" />
                  <p>No babies found.</p>
                </td>
              </tr>
            ) : (
              babies.map((baby) => (
                <tr key={baby._id} className="border-b border-ink-100 hover:bg-ink-50 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-blue-900">{baby.name || `Baby of ${baby.mother?.name || 'Unknown'}`}</div>
                    <div className="text-xs text-ink-500">{baby.babyId}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-ink-800">{baby.mother?.name || 'N/A'}</div>
                    <div className="text-xs text-ink-500">ID: {baby.mother?.motherId}</div>
                  </td>
                  <td className="p-4 text-sm text-ink-700">{new Date(baby.dob).toLocaleDateString()}</td>
                  <td className="p-4 text-sm text-ink-700 capitalize">{baby.sex}</td>
                  <td className="p-4 text-right">
                    <Link to={`/babies/${baby.babyId}`} className="btn btn-outline h-[32px] px-3 py-0 text-[13px] inline-flex">
                      View <ChevronRight size={14} className="ml-1" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BabySearch;
