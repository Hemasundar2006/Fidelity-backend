import React, { useState } from 'react';
import { Search, UserCheck, Baby, CheckCircle, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';
import { Link } from 'react-router-dom';

const RegisterBaby = () => {
  const { authHeader } = useAuth();
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMother, setSelectedMother] = useState(null);

  // Baby Form State
  const [formData, setFormData] = useState({
    name: '',
    sex: 'male',
    dob: new Date().toISOString().split('T')[0],
    birthWeightKg: '',
    birthLengthCm: '',
    bloodGroup: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const res = await fetch(`${API_BASE}/patients?q=${encodeURIComponent(searchQuery)}`, {
        headers: authHeader()
      });
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.data);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectMother = (mother) => {
    setSelectedMother(mother);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleClearMother = () => {
    setSelectedMother(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMother) {
      setError("Please select a mother first.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/babies`, {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motherId: selectedMother.motherId,
          ...formData,
          birthWeightKg: formData.birthWeightKg ? Number(formData.birthWeightKg) : undefined,
          birthLengthCm: formData.birthLengthCm ? Number(formData.birthLengthCm) : undefined
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccessData(data.data);
      } else {
        setError(data.error?.message || data.message || 'Failed to register baby');
      }
    } catch (err) {
      setError('Network error. Failed to connect to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="card max-w-lg mx-auto p-8 text-center mt-8 shadow-pop">
        <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={40} />
        </div>
        <h1 className="text-[28px] leading-[36px] font-heading font-semibold text-blue-800 mb-2">Baby Registered!</h1>
        <p className="text-ink-600 text-[14px] leading-[22px] mb-6">The new born has been successfully linked to {selectedMother.name}.</p>
        
        <div className="bg-blue-50/50 border border-dashed border-blue-600 p-4 rounded-card mb-6">
          <span className="text-[12px] text-ink-600 font-semibold uppercase tracking-[0.06em] block mb-1">Assigned Baby ID</span>
          <h2 className="text-[18px] font-mono font-bold text-blue-800 m-0">{successData.babyId}</h2>
        </div>
        
        <div className="mb-6 flex flex-col items-center">
          <div className="p-2 bg-white rounded-ctl border border-ink-200 shadow-card inline-block">
            <img src={successData.qr?.url} alt="QR Code" className="w-36 h-36 max-w-full h-auto" />
          </div>
          <p className="text-[12px] text-ink-600 mt-2 leading-[16px]">Scan to view baby's health card</p>
        </div>
        
        <div className="flex gap-3">
          <button className="btn btn-outline flex-1" onClick={() => {
            setSuccessData(null);
            setFormData({ name: '', sex: 'male', dob: new Date().toISOString().split('T')[0], birthWeightKg: '', birthLengthCm: '', bloodGroup: '' });
          }}>
            Register Another
          </button>
          <Link to={`/babies/${successData.babyId}`} className="btn btn-primary flex-1">
            View Profile <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-full">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-[28px] leading-[36px] font-heading font-semibold text-blue-800 m-0">Register New Born</h1>
        <p className="text-[18px] leading-[26px] text-ink-600 m-0">Link a new born baby to an existing registered mother</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-card text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Select Mother */}
      <div className="card p-6 mb-6">
        <h2 className="text-[16px] font-semibold text-blue-800 mb-4 flex items-center gap-2">
          <UserCheck size={20} className="text-pink-500" />
          Step 1: Select Mother
        </h2>

        {!selectedMother ? (
          <div>
            <form onSubmit={handleSearch} className="relative mb-4">
              <input
                type="text"
                placeholder="Search mother by name, ID, or phone..."
                className="input pl-10 h-[48px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" size={18} />
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-primary h-[36px] px-4 py-0"
                disabled={isSearching}
              >
                {isSearching ? '...' : 'Search'}
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="border border-ink-200 rounded-card overflow-hidden">
                {searchResults.map(patient => (
                  <div key={patient._id} className="p-3 border-b border-ink-100 last:border-b-0 flex items-center justify-between hover:bg-ink-50">
                    <div>
                      <div className="font-semibold text-blue-900">{patient.name}</div>
                      <div className="text-xs text-ink-500">ID: {patient.motherId} | Phone: {patient.phone}</div>
                    </div>
                    <button 
                      onClick={() => handleSelectMother(patient)}
                      className="btn btn-outline h-[32px] text-xs px-3 py-0"
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-green-50 border border-green-200 rounded-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold">
                {selectedMother.name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-green-900">{selectedMother.name}</div>
                <div className="text-xs text-green-700">Mother ID: {selectedMother.motherId}</div>
              </div>
            </div>
            <button 
              onClick={handleClearMother}
              className="text-green-700 hover:text-green-900 bg-green-100 hover:bg-green-200 p-2 rounded-full transition-colors"
              title="Change Mother"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Step 2: Baby Details */}
      <div className={`card p-6 ${!selectedMother ? 'opacity-50 pointer-events-none' : ''}`}>
        <h2 className="text-[16px] font-semibold text-blue-800 mb-4 flex items-center gap-2">
          <Baby size={20} className="text-pink-500" />
          Step 2: Baby Details
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-ink-600 uppercase">Baby Name (Optional)</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              className="input" 
              placeholder={selectedMother ? `e.g. Baby of ${selectedMother.name.split(' ')[0]}` : "Baby Name"} 
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-ink-600 uppercase">Date of Birth *</label>
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="input" required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-ink-600 uppercase">Sex *</label>
            <select name="sex" value={formData.sex} onChange={handleChange} className="input" required>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-ink-600 uppercase">Blood Group *</label>
            <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="input bg-white" required>
              <option value="" disabled>Select Blood Group</option>
              <option value="A+">A+</option><option value="A-">A-</option>
              <option value="B+">B+</option><option value="B-">B-</option>
              <option value="O+">O+</option><option value="O-">O-</option>
              <option value="AB+">AB+</option><option value="AB-">AB-</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-ink-600 uppercase">Birth Weight (kg) *</label>
            <input type="number" step="0.01" min="0.1" max="10" name="birthWeightKg" value={formData.birthWeightKg} onChange={handleChange} className="input" placeholder="Weight in kg" required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-ink-600 uppercase">Birth Length (cm) *</label>
            <input type="number" step="0.1" min="10" max="100" name="birthLengthCm" value={formData.birthLengthCm} onChange={handleChange} className="input" placeholder="Length in cm" required />
          </div>

          <div className="md:col-span-2 pt-4 border-t border-ink-100 mt-2">
            <button 
              type="submit" 
              className="btn btn-primary w-full h-[48px]"
              disabled={isSubmitting || !selectedMother}
            >
              {isSubmitting ? 'Registering...' : 'Register Baby'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterBaby;
