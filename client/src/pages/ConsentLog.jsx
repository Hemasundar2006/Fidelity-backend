import React from 'react';
import { useParams } from 'react-router-dom';
import { Shield, Eye, FileSignature, Monitor } from 'lucide-react';

const MOCK_CONSENTS = [
  { id: 1, type: 'Treatment Consent', status: 'Granted', date: '2026-09-28', method: 'In-person Signature' },
  { id: 2, type: 'Data Sharing (Network)', status: 'Granted', date: '2026-09-28', method: 'Portal' },
  { id: 3, type: 'ML & AI Risk Usage', status: 'Revoked', date: '2026-10-01', method: 'Portal' }
];

const MOCK_AUDIT = [
  { time: '10:14 AM Today', user: 'Dr. A. Smith (Doctor)', action: 'Read Pregnancy Record', ip: '192.168.1.45' },
  { time: '09:05 AM Today', user: 'System (ML Cron)', action: 'Create ML Risk Prediction', ip: 'Internal' },
  { time: '04:30 PM Yesterday', user: 'Lakshmi Devi (Patient)', action: 'Revoke ML Consent', ip: '117.234.12.9' },
  { time: '02:15 PM Yesterday', user: 'Nurse K. Rani (Nurse)', action: 'Update Vitals', ip: '192.168.1.12' }
];

const ConsentLog = () => {
  const { id } = useParams();

  return (
    <div className="max-w-4xl mx-auto pb-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-[28px] max-sm:text-[22px] leading-[36px] max-sm:leading-[30px] font-heading font-semibold text-blue-800 m-0">Consent & Access Audit</h1>
          <p className="text-[18px] max-sm:text-[16px] leading-[26px] text-ink-600 m-0">Manage privacy settings and view access logs for {id || 'MOM-2026-000001'}</p>
        </div>
        <div className="chip chip-green bg-ink-100 border border-ink-200 text-ink-900">
          <Shield size={16} className="text-blue-600" /> DPDP Compliant
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Consents Management */}
        <div className="card">
          <h2 className="mb-4 flex items-center gap-2 border-b border-ink-200 pb-2 text-lg font-semibold text-blue-800">
            <FileSignature size={20} className="text-blue-600" /> Active Consents
          </h2>

          <div className="flex flex-col gap-4">
            {MOCK_CONSENTS.map(consent => (
              <div 
                key={consent.id} 
                className="p-4 border border-ink-200 rounded bg-ink-50 flex justify-between items-center transition-colors hover:border-blue-600"
              >
                <div>
                  <h4 className="m-0 mb-1 font-semibold text-ink-900">{consent.type}</h4>
                  <p className="text-xs text-ink-600 m-0">Method: {consent.method} • {consent.date}</p>
                </div>
                {consent.status === 'Granted' ? (
                  <button className="btn btn-outline text-danger border-danger/30 hover:border-danger hover:bg-danger-light text-xs py-1 px-3">
                    Revoke
                  </button>
                ) : (
                  <button className="btn btn-primary text-xs py-1 px-3">
                    Grant
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log */}
        <div className="card flex flex-col h-full">
          <h2 className="mb-4 flex items-center gap-2 border-b border-ink-200 pb-2 text-lg font-semibold text-blue-800">
            <Eye size={20} className="text-blue-600" /> Immutable Access Log
          </h2>
          <p className="text-[18px] max-sm:text-[16px] leading-[26px] text-ink-600 m-0">Every read/write to this patient's record is logged here as per compliance.</p>

          <div className="flex-1 overflow-y-auto pr-2 max-h-[380px]">
            {MOCK_AUDIT.map((log, i) => (
              <div key={i} className="flex gap-4 mb-4 pb-4 border-b border-ink-200 last:border-0">
                <div className="mt-1 text-ink-400"><Monitor size={16} /></div>
                <div>
                  <p className="text-sm font-semibold text-ink-900 m-0 mb-1">{log.action}</p>
                  <p className="text-xs text-ink-600 m-0 mb-1">{log.user}</p>
                  <div className="flex gap-4 text-xs text-ink-400">
                    <span>{log.time}</span>
                    <span>IP: {log.ip}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentLog;
