import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Printer, CheckCircle, Clock, AlertCircle, Baby, Activity, Syringe } from 'lucide-react';

const MOCK_VACCINES = [
  { id: 1, name: 'BCG', due: '2027-04-03', given: '2027-04-03', status: 'given' },
  { id: 2, name: 'OPV-0', due: '2027-04-03', given: '2027-04-03', status: 'given' },
  { id: 3, name: 'Hep B-1', due: '2027-04-03', given: '2027-04-03', status: 'given' },
  { id: 4, name: 'OPV-1', due: '2027-05-15', given: null, status: 'overdue' },
  { id: 5, name: 'Penta-1', due: '2027-05-15', given: null, status: 'overdue' },
  { id: 6, name: 'OPV-2', due: '2027-06-12', given: null, status: 'due' },
  { id: 7, name: 'Penta-2', due: '2027-06-12', given: null, status: 'due' }
];

const BabyProfile = () => {
  const { babyId } = useParams();
  const [activeTab, setActiveTab] = useState('vaccinations');

  return (
    <div className="pb-8 max-sm:pb-4 max-w-4xl mx-auto min-w-0">
      {/* Baby Health Card */}
      <div className="mb-6 max-sm:mb-4">
        <div className="bg-gradient-to-br from-blue-700 to-blue-500 rounded-2xl p-8 max-sm:p-5 text-white shadow-[0_8px_24px_rgba(30,34,230,0.2)] relative overflow-hidden flex flex-col justify-between aspect-[1.586] max-md:aspect-auto max-md:min-h-[280px]">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500 opacity-10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

          <div className="flex justify-between items-center pb-5 mb-5 border-b border-white/20 relative z-10">
            <div className="flex items-center gap-3">
              <Baby size={28} className="text-white" />
              <h2 className="text-white font-heading font-bold text-[20px] leading-[28px] m-0">Fidelity Healthcare</h2>
            </div>
            <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase backdrop-blur-md border border-white/20 hidden sm:block">
              Official Newborn Health Passport
            </span>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
            <div className="w-full">
              <h1 className="text-white font-heading font-bold text-[24px] leading-[32px] mb-5 max-sm:mb-4 drop-shadow-sm truncate">Baby of Lakshmi Devi</h1>
              <div className="grid grid-cols-2 gap-x-8 max-sm:gap-x-4 gap-y-4 max-sm:gap-y-3 w-full">
                <div>
                  <span className="text-[10px] leading-[14px] uppercase tracking-wider text-blue-100 block mb-0.5 font-medium">Baby Identifier</span>
                  <strong className="text-[15px] leading-[22px] text-white font-mono drop-shadow-sm">{babyId || 'BBY-2027-00001'}</strong>
                </div>
                <div>
                  <span className="text-[10px] leading-[14px] uppercase tracking-wider text-blue-100 block mb-0.5 font-medium">Date of Birth</span>
                  <strong className="text-[15px] leading-[22px] text-white drop-shadow-sm">03 Apr 2027</strong>
                </div>
                <div>
                  <span className="text-[10px] leading-[14px] uppercase tracking-wider text-blue-100 block mb-0.5 font-medium">Blood Group</span>
                  <strong className="text-[15px] leading-[22px] text-white drop-shadow-sm">B+</strong>
                </div>
                <div>
                  <span className="text-[10px] leading-[14px] uppercase tracking-wider text-blue-100 block mb-0.5 font-medium">Mother ID</span>
                  <strong className="text-[15px] leading-[22px] text-white font-mono drop-shadow-sm">MOM-2026-000001</strong>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center shrink-0 max-md:absolute max-md:top-5 max-md:right-5">
              <div className="bg-white p-2 rounded-xl shadow-md">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${babyId || 'BBY-2027-00001'}`} 
                  alt="Baby QR Code" 
                  className="w-[80px] h-[80px] max-sm:w-[64px] max-sm:h-[64px] block"
                />
              </div>
              <span className="text-[10px] text-blue-100 mt-2 font-medium hidden md:block">Scan for digital verification</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex max-sm:flex-col justify-end gap-3">
          <button className="btn btn-outline h-[40px] max-sm:h-[48px] max-sm:text-[16px] max-sm:w-full border-ink-200"><Printer size={16} /> Print Physical Passport</button>
          <button className="btn btn-primary h-[40px] max-sm:h-[48px] max-sm:text-[16px] max-sm:w-full"><Download size={16} /> Download PDF</button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="card !p-0">
        <div className="flex border-b border-ink-100 px-6 max-sm:px-4">
          <button 
            type="button"
            className={`py-4 mr-6 max-sm:mr-4 text-[14px] leading-[22px] font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer bg-transparent border-t-0 border-x-0 ${
              activeTab === 'vaccinations' 
                ? 'border-b-blue-600 text-blue-600' 
                : 'border-b-transparent text-ink-600 hover:text-ink-900'
            }`}
            onClick={() => setActiveTab('vaccinations')}
          >
            <Syringe size={16} /> <span className="max-sm:hidden">Vaccinations</span><span className="sm:hidden">Vaccines</span>
          </button>
          <button 
            type="button"
            className={`py-4 text-[14px] leading-[22px] font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer bg-transparent border-t-0 border-x-0 ${
              activeTab === 'growth' 
                ? 'border-b-blue-600 text-blue-600' 
                : 'border-b-transparent text-ink-600 hover:text-ink-900'
            }`}
            onClick={() => setActiveTab('growth')}
          >
            <Activity size={16} /> Growth Chart
          </button>
        </div>

        <div className="p-6 max-sm:p-4">
          {activeTab === 'vaccinations' && (
            <div>
              <h3 className="text-[16px] leading-[24px] font-semibold text-blue-800 mb-4 max-sm:mb-3 m-0">National Immunization Schedule</h3>
              <div className="flex flex-col gap-3">
                {MOCK_VACCINES.map(vac => (
                  <div 
                    key={vac.id} 
                    className={`flex max-sm:flex-col items-center max-sm:items-start p-4 rounded-xl border transition-colors ${
                      vac.status === 'overdue' 
                        ? 'border-red-200 bg-red-50/50' 
                        : 'border-ink-100 bg-ink-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-white shadow-sm border border-ink-100">
                        {vac.status === 'given' && <CheckCircle size={20} className="text-green-600" />}
                        {vac.status === 'due' && <Clock size={20} className="text-ink-400" />}
                        {vac.status === 'overdue' && <AlertCircle size={20} className="text-red-600" />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h4 className="m-0 text-[14px] leading-[22px] font-semibold text-ink-900 truncate">{vac.name}</h4>
                        <p className="text-[13px] leading-[20px] text-ink-600 m-0 truncate">Due: {new Date(vac.due).toLocaleDateString('en-GB')}</p>
                      </div>
                      
                      <div className="ml-auto shrink-0 max-sm:hidden">
                        {vac.status === 'given' ? (
                          <span className="text-[12px] font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-md border border-green-200">
                            Given on {new Date(vac.given).toLocaleDateString('en-GB')}
                          </span>
                        ) : (
                          <button className="btn btn-outline h-[32px] text-[12px] border-ink-200">
                            Mark Administered
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Mobile actions below */}
                    <div className="sm:hidden w-full mt-3 pt-3 border-t border-ink-100">
                      {vac.status === 'given' ? (
                        <div className="text-[12px] font-semibold text-green-700 w-full text-center py-1">
                          Given on {new Date(vac.given).toLocaleDateString('en-GB')}
                        </div>
                      ) : (
                        <button className="btn btn-outline h-[40px] w-full text-[14px] border-ink-200">
                          Mark Administered
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'growth' && (
            <div>
              <h3 className="text-[16px] leading-[24px] font-semibold text-blue-800 mb-4 max-sm:mb-3 m-0">Growth Percentiles (WHO Clinical Standards)</h3>
              <div className="h-[280px] max-sm:h-[220px] bg-ink-50/50 border border-ink-100 rounded-xl flex items-center justify-center">
                <p className="text-[13px] leading-[20px] text-ink-600 flex flex-col items-center text-center gap-3 max-w-[200px]">
                  <Activity size={24} className="text-blue-600" /> 
                  Interactive WHO Weight-for-Age & Length Growth Curves
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BabyProfile;
