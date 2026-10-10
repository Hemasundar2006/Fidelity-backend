import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Calendar, ArrowRight, HeartPulse, ChevronLeft, Stethoscope, Loader } from 'lucide-react';
import { fetchDoctors } from '../services/api';
import BookingModal from '../components/BookingModal';

const BookConsultation = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [bookingOpen, setBookingOpen] = useState(false);
  const [activeDoctor, setActiveDoctor] = useState(null);

  useEffect(() => {
    fetchDoctors().then(data => {
      setDoctors(data || []);
      setLoading(false);
    });
  }, []);

  const handleOpenBooking = (doc) => {
    setActiveDoctor(doc);
    setBookingOpen(true);
  };

  const filteredDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(search.toLowerCase()) || 
    (doc.specialization || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* ─── HEADER ─── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <ChevronLeft size={20} />
            </div>
            <span className="font-bold text-slate-800 font-heading">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <HeartPulse size={24} className="text-pink-500" />
            <span className="font-extrabold text-xl font-heading text-slate-900 tracking-tight">JanmaLink</span>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <div className="bg-slate-900 text-white py-16 md:py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Book a Consultation
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
            Find the best maternity specialists and book your appointment instantly with a live hospital token.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
            <div className="relative bg-white h-16 rounded-2xl shadow-xl flex items-center px-4 gap-4">
              <Search className="text-slate-400 shrink-0" size={24} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by doctor name or specialization..."
                className="w-full h-full bg-transparent border-0 outline-none text-slate-800 text-lg placeholder:text-slate-400 font-medium"
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="text-slate-400 hover:text-slate-600 shrink-0"
                >
                  <Search size={20} className="opacity-0" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── DOCTORS LIST ─── */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold font-heading text-slate-900">
            {search ? 'Search Results' : 'Available Specialists'}
          </h2>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded-lg text-sm">
            {filteredDoctors.length} found
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader size={40} className="animate-spin mb-4 text-blue-500" />
            <p className="font-medium text-lg">Loading specialists...</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Stethoscope size={32} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No doctors found</h3>
            <p className="text-slate-500">Try adjusting your search criteria to find the right specialist.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <div 
                key={doc._id} 
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all group relative flex flex-col h-full"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 font-black text-xl flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-105 transition-transform">
                    {doc.name.replace('Dr. ', '').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {doc.name}
                    </h3>
                    <p className="text-sm font-medium text-pink-500 mb-2 line-clamp-2">
                      {doc.specialization || 'Obstetrics & Gynecology'}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md w-max">
                      <Star size={12} className="text-amber-400 fill-amber-400" /> 
                      4.9 (120+ Reviews)
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-8 flex-1">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <MapPin size={16} className="text-slate-400 shrink-0" />
                    <span className="line-clamp-1">Maternity OPD Wing, Consultation Suite</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Calendar size={16} className="text-slate-400 shrink-0" />
                    <span>Next Available: <strong className="text-slate-800">Tomorrow</strong></span>
                  </div>
                </div>

                <button 
                  onClick={() => handleOpenBooking(doc)}
                  className="w-full py-3.5 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 group-hover:shadow-lg shadow-blue-500/25 mt-auto cursor-pointer"
                >
                  Book Appointment <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Booking Modal */}
      <BookingModal 
        isOpen={bookingOpen} 
        onClose={() => setBookingOpen(false)} 
        preselectedDoctor={activeDoctor} 
      />

    </div>
  );
};

export default BookConsultation;
