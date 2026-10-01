import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, UploadCloud, AlertTriangle, Eye, X, Calendar, Download } from 'lucide-react';

const MOCK_REPORTS = [
  { id: 'REP-001', testType: 'Hemoglobin', category: 'blood', collectedAt: '2026-09-20', reportedAt: '2026-09-21', status: 'low' },
  { id: 'REP-002', testType: 'Glucose Fasting', category: 'blood', collectedAt: '2026-09-20', reportedAt: '2026-09-21', status: 'normal' },
  { id: 'REP-003', testType: 'First Trimester Ultrasound', category: 'scan', collectedAt: '2026-08-15', reportedAt: '2026-08-15', status: 'normal' }
];

const MOCK_RESULTS_DETAIL = [
  { parameter: 'Hemoglobin (Hb)', value: 9.8, unit: 'g/dL', refRange: '11-14', flag: 'low' },
  { parameter: 'RBC Count', value: 4.1, unit: 'mill/mm3', refRange: '4.0-5.5', flag: 'normal' }
];

const Reports = () => {
  const { id } = useParams();
  const [filter, setFilter] = useState('all');
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const filteredReports = filter === 'all' 
    ? MOCK_REPORTS 
    : MOCK_REPORTS.filter(r => r.category === filter);

  const handleUploadSimulate = (e) => {
    e.preventDefault();
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setUploadModalOpen(false);
    }, 2000);
  };

  return (
    <div className="pb-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-[28px] max-sm:text-[22px] leading-[36px] max-sm:leading-[30px] font-heading font-semibold text-blue-800 m-0">Lab Reports & Scans</h1>
          <p className="text-[18px] max-sm:text-[16px] leading-[26px] text-ink-600 m-0">Manage diagnostic records for {id || 'MOM-2026-000001'}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setUploadModalOpen(true)}>
          <UploadCloud size={18} /> Upload Report
        </button>
      </div>

      <div className="card">
        <div className="flex gap-3 mb-6">
          <button className={`btn ${filter === 'all' ? 'btn-secondary' : 'btn-outline'}`} onClick={() => setFilter('all')}>All</button>
          <button className={`btn ${filter === 'blood' ? 'btn-secondary' : 'btn-outline'}`} onClick={() => setFilter('blood')}>Blood</button>
          <button className={`btn ${filter === 'scan' ? 'btn-secondary' : 'btn-outline'}`} onClick={() => setFilter('scan')}>Scans</button>
          <button className={`btn ${filter === 'urine' ? 'btn-secondary' : 'btn-outline'}`} onClick={() => setFilter('urine')}>Urine</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50/50">
                <th className="px-4 py-3 font-semibold text-ink-900 text-[13px]" style={{ width: '28%', minWidth: '180px' }}>Test Type</th>
                <th className="px-4 py-3 font-semibold text-ink-900 text-[13px]" style={{ width: '18%', minWidth: '130px' }}>Category</th>
                <th className="px-4 py-3 font-semibold text-ink-900 text-[13px]" style={{ width: '22%', minWidth: '140px' }}>Collected Date</th>
                <th className="px-4 py-3 font-semibold text-ink-900 text-[13px]" style={{ width: '18%', minWidth: '120px' }}>Status</th>
                <th className="px-4 py-3 font-semibold text-ink-900 text-[13px]" style={{ width: '14%', minWidth: '110px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map(report => (
                <tr key={report.id} className="border-b border-ink-50 hover:bg-blue-50/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-ink-900 text-[13px]">{report.testType}</td>
                  <td className="px-4 py-3 capitalize text-ink-700 text-[13px]">{report.category}</td>
                  <td className="px-4 py-3 text-ink-700 text-[13px]">{new Date(report.collectedAt).toLocaleDateString('en-GB')}</td>
                  <td className="px-4 py-3">
                    {report.status === 'normal' ? (
                      <span className="chip chip-green text-[11px]">Normal</span>
                    ) : (
                      <span className="chip chip-red capitalize text-[11px]">{report.status}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button className="btn btn-outline h-[32px] text-[12px] px-3" onClick={() => setSelectedReport(report)}>
                      <Eye size={16} /> View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center p-6 text-ink-600">No reports found for this category.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedReport && (
        <div className="fixed inset-0 bg-blue-800/40 backdrop-blur-[2px] z-50 flex justify-end" onClick={() => setSelectedReport(null)}>
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-ink-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-blue-800 m-0">{selectedReport.testType}</h2>
              <button 
                type="button"
                className="p-1 text-ink-400 hover:text-ink-900 rounded hover:bg-ink-100 transition-colors border-0 bg-transparent cursor-pointer" 
                onClick={() => setSelectedReport(null)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6 flex gap-4 text-sm text-ink-600">
                <span><Calendar size={14} className="inline mr-1 text-blue-600" /> {selectedReport.collectedAt}</span>
                <span className="capitalize"><FileText size={14} className="inline mr-1 text-blue-600" /> {selectedReport.category}</span>
              </div>
              
              <h4 className="mb-4 text-base font-semibold text-blue-800">Structured Parameters</h4>
              <div className="mb-8 flex flex-col gap-3">
                {MOCK_RESULTS_DETAIL.map((res, i) => (
                  <div key={i} className="p-3.5 bg-ink-50 rounded-card border border-ink-200">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-ink-900">{res.parameter}</span>
                      <span className={res.flag === 'normal' ? 'text-success font-semibold' : 'text-danger font-semibold'}>
                        {res.value} {res.unit}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-ink-600">
                      <span>Reference: {res.refRange}</span>
                      <span className="capitalize">{res.flag}</span>
                    </div>
                  </div>
                ))}
              </div>

              <h4 className="mb-4 text-base font-semibold text-blue-800">Source Document</h4>
              <div className="h-44 bg-ink-50 border border-dashed border-ink-200 rounded-card flex items-center justify-center flex-col p-4 text-center">
                <FileText size={40} className="text-ink-200 mb-2" />
                <p className="text-xs text-ink-600 mb-3">clinical_scan_report.pdf</p>
                <button className="btn btn-outline text-xs py-1.5 px-3"><Download size={14} /> Download Source PDF</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="modal-overlay" onClick={() => setUploadModalOpen(false)}>
          <div className="modal card p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-ink-200">
              <h2 className="text-xl font-semibold text-blue-800 m-0">Upload Diagnostic Report</h2>
              <button 
                type="button"
                className="p-1 text-ink-400 hover:text-ink-900 rounded hover:bg-ink-100 transition-colors border-0 bg-transparent cursor-pointer" 
                onClick={() => setUploadModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Warning Banner Showcase */}
            <div className="bg-amber-50 border border-amber-300 text-amber-900 p-4 rounded-card flex gap-3 items-start mb-6">
              <AlertTriangle size={20} className="text-warning shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-semibold mb-0.5">Duplicate Test Warning</strong>
                <p className="text-xs text-amber-800 m-0">A Hemoglobin test was already recorded 6 days ago. Are you sure you want to proceed?</p>
              </div>
            </div>

            <form onSubmit={handleUploadSimulate}>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="col-span-2">
                  <label className="text-xs font-semibold uppercase text-ink-600 block mb-1">Test Type</label>
                  <input type="text" className="input max-sm:h-[48px] max-sm:text-[16px]" defaultValue="Hemoglobin" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-600 block mb-1">Category</label>
                  <select className="input max-sm:h-[48px] max-sm:text-[16px]">
                    <option>Blood</option>
                    <option>Urine</option>
                    <option>Scan</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-600 block mb-1">Collected Date</label>
                  <input type="date" className="input max-sm:h-[48px] max-sm:text-[16px]" defaultValue="2026-09-30" />
                </div>
              </div>
              
              <div className="border-2 border-dashed border-ink-200 hover:border-blue-600 rounded-card p-6 flex flex-col items-center justify-center relative bg-ink-50 transition-colors mb-6 text-center cursor-pointer">
                <UploadCloud size={32} className="text-blue-600 mb-2" />
                <p className="text-sm font-medium text-ink-900 m-0">Drag and drop PDF or scan image here</p>
                <p className="text-xs text-ink-600 mt-1 m-0">Supported: PDF, DICOM, JPG, PNG (Max 10MB)</p>
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-ink-200">
                <button type="button" className="btn btn-outline" onClick={() => setUploadModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Save Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Reports;
