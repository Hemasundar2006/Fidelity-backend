import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, HeartPulse, Hospital as HospitalIcon } from 'lucide-react';
import { API_BASE } from '../config';

const HospitalRegister = () => {
  const [form, setForm] = useState({ hospitalName: '', email: '', mobile: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.hospitalName || !form.email || !form.mobile || !form.password || !form.confirmPassword) return;

    if (form.password !== form.confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }
    
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await fetch(`${API_BASE}/hospitals/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage({ text: 'Hospital registered successfully! Please wait for super admin approval.', type: 'success' });
        setForm({ hospitalName: '', email: '', mobile: '', password: '', confirmPassword: '' });
        // Could navigate away or show message
      } else {
        setMessage({ text: data.message || 'Error registering hospital', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: err.message || 'Error registering hospital', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4 shadow-sm">
            <HospitalIcon size={32} />
          </div>
          <h1 className="text-[28px] font-heading font-semibold text-blue-900 m-0 mb-2">Partner with JanmaLink</h1>
          <p className="text-ink-600 m-0">Register your hospital to manage maternity care</p>
        </div>

        <div className="card p-6 md:p-8 shadow-md">
          {message.text && (
            <div className={`p-4 rounded-xl mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <div className="flex items-start gap-3">
                {message.type === 'success' ? <ShieldCheck size={20} className="shrink-0 mt-0.5" /> : <HeartPulse size={20} className="shrink-0 mt-0.5" />}
                <p className="m-0 text-[14px] leading-[20px] font-medium">{message.text}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-ink-700 uppercase tracking-wider">Hospital Name</label>
              <input 
                type="text" 
                className="input h-[48px]" 
                placeholder="e.g. City General Hospital"
                value={form.hospitalName}
                onChange={e => setForm({ ...form, hospitalName: e.target.value })}
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-ink-700 uppercase tracking-wider">Official Email</label>
              <input 
                type="email" 
                className="input h-[48px]" 
                placeholder="e.g. admin@citygeneral.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-ink-700 uppercase tracking-wider">Mobile Number</label>
              <input 
                type="tel" 
                className="input h-[48px]" 
                placeholder="e.g. 9876543210"
                value={form.mobile}
                onChange={e => setForm({ ...form, mobile: e.target.value })}
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-ink-700 uppercase tracking-wider">Set Password</label>
              <input 
                type="password" 
                className="input h-[48px]" 
                placeholder="Create a strong password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-ink-700 uppercase tracking-wider">Confirm Password</label>
              <input 
                type="password" 
                className="input h-[48px]" 
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary h-[48px] w-full text-[16px] mt-2"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Submit Registration'}
            </button>
          </form>

          <div className="mt-6 text-center text-[14px] text-ink-600">
            Already approved? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Go to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalRegister;
