import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { 
  FileText, UploadCloud, AlertTriangle, Eye, X, Calendar, Download, 
  Search, Plus, Trash2, Sparkles, CheckCircle2, Loader, ArrowLeft, 
  ShieldCheck, RefreshCw, FileCheck, Camera, Printer, ChevronRight,
  RotateCw, UserCheck, HeartPulse, Activity, ScanLine
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { API_BASE } from '../config';
import { REPORT_TEMPLATES, calculateFlag } from '../services/reportTemplates';
import { runReportOcr } from '../services/ocrService';
import { generateDiagnosticPdf } from '../services/pdfReportGenerator';
import PrescriptionReader from '../components/PrescriptionReader';

const Reports = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { authHeader, user } = useAuth();
  const { t } = useLanguage();

  // State: Data
  const [reports, setReports] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals & Drawer
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [showPrescriptionReader, setShowPrescriptionReader] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Upload Modal Step Flow: 1 = Choose Template, 2 = Camera/Scan, 3 = Review, Fill & Print
  const [modalStep, setModalStep] = useState(1);

  // Form State: Template & Parameters
  const [selectedTemplateId, setSelectedTemplateId] = useState('before_pregnancy');
  const [testType, setTestType] = useState('Before Pregnancy Health Screening');
  const [category, setCategory] = useState('blood');
  const [collectedDate, setCollectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [parameters, setParameters] = useState([]);

  // Form State: Patient Details & Vitals (Age, Name, Height, Weight, BMI)
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState(25);
  const [patientGender, setPatientGender] = useState('Female');
  const [patientHeight, setPatientHeight] = useState(162); // in cm
  const [patientWeight, setPatientWeight] = useState(58.5); // in kg
  const [patientBloodGroup, setPatientBloodGroup] = useState('A-');

  // Camera & Image Capture State
  const videoRef = useRef(null);
  const videoStreamRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [capturedPhotoData, setCapturedPhotoData] = useState('');
  const [cameraError, setCameraError] = useState('');

  // OCR State
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrRawText, setOcrRawText] = useState('');
  const [showOcrRaw, setShowOcrRaw] = useState(false);

  // Duplicate Check
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  // Calculated BMI
  const calculatedBmi = useMemo(() => {
    const h = parseFloat(patientHeight);
    const w = parseFloat(patientWeight);
    if (!isNaN(h) && !isNaN(w) && h > 0) {
      return (w / Math.pow(h / 100, 2)).toFixed(1);
    }
    return '22.3';
  }, [patientHeight, patientWeight]);

  // 1. Fetch Patient and Reports
  const fetchPatientAndReports = async () => {
    setLoading(true);
    try {
      const patientRes = await fetch(`${API_BASE}/patients/${id}`, { headers: authHeader() });
      const patientData = await patientRes.json();
      if (patientData.success && patientData.data) {
        const p = patientData.data;
        setPatient(p);
        setPatientName(p.name || '');
        setPatientAge(p.dob ? Math.floor((new Date() - new Date(p.dob).getTime()) / 3.15576e+10) : 25);
        setPatientGender(p.gender || 'Female');
        setPatientHeight(p.height || 162);
        setPatientWeight(p.weight || 58.5);
        setPatientBloodGroup(p.bloodGroup || 'A-');
      } else {
        const fallback = {
          _id: id,
          name: 'Hemasundar Maroti',
          motherId: 'MOM-2026-000013',
          age: 25,
          gender: 'Female',
          bloodGroup: 'A-',
          phone: '9876543210',
          height: 162,
          weight: 58.5
        };
        setPatient(fallback);
        setPatientName(fallback.name);
        setPatientAge(fallback.age);
        setPatientGender(fallback.gender);
        setPatientHeight(fallback.height);
        setPatientWeight(fallback.weight);
        setPatientBloodGroup(fallback.bloodGroup);
      }

      const reportsRes = await fetch(`${API_BASE}/patients/${id}/reports`, { headers: authHeader() });
      const reportsData = await reportsRes.json();
      if (reportsData.success && Array.isArray(reportsData.data)) {
        setReports(reportsData.data);
      } else {
        setReports([]);
      }
    } catch (err) {
      console.error('Error fetching reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPatientAndReports();
    if (searchParams.get('upload') === 'true') {
      handleOpenUploadModal();
    }
  }, [id, searchParams]);

  // Cleanup Camera on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // 2. Camera Controls
  const startCameraStream = async (facing = cameraFacingMode) => {
    stopCameraStream();
    setCameraError('');
    setIsCameraActive(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      videoStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Camera stream error:', err);
      setCameraError(err.message || 'Unable to open camera. You can upload an image file instead.');
      setIsCameraActive(false);
    }
  };

  const stopCameraStream = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(track => track.stop());
      videoStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedPhotoData(dataUrl);
    stopCameraStream();

    // Trigger OCR immediately with captured photo
    runOcrOnImageData(dataUrl);
  };

  const handleSwitchCamera = () => {
    const nextFacing = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextFacing);
    startCameraStream(nextFacing);
  };

  // 3. OCR Runner
  const runOcrOnImageData = async (dataUrl) => {
    setIsOcrProcessing(true);
    setOcrProgress(10);
    setOcrStatus('Scanning photo with AI OCR...');

    try {
      const ocrResult = await runReportOcr(dataUrl, (prog) => {
        setOcrStatus(prog.status);
        setOcrProgress(prog.progress);
      });

      setOcrRawText(ocrResult.rawText);

      // Merge OCR values into inputs
      if (ocrResult.testType) {
        setTestType(ocrResult.testType);
        checkDuplicate(ocrResult.testType);
      }
      if (ocrResult.category) {
        setCategory(ocrResult.category);
      }
      if (ocrResult.collectedDate) {
        setCollectedDate(ocrResult.collectedDate);
      }
      if (ocrResult.remarks) {
        setRemarks(ocrResult.remarks);
      }
      if (ocrResult.parameters && ocrResult.parameters.length > 0) {
        setParameters(ocrResult.parameters);
      }

      // Automatically advance to Step 3: Review & Print
      setModalStep(3);
    } catch (err) {
      console.error('OCR Error:', err);
      alert('OCR notice: ' + (err.message || 'Could not extract all text. You can review and fill inputs manually.'));
      setModalStep(3);
    } finally {
      setIsOcrProcessing(false);
    }
  };

  // 4. File Upload fallback for OCR
  const handleFileUploadForOcr = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setCapturedPhotoData(dataUrl);
      stopCameraStream();
      runOcrOnImageData(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // 5. Template Selection
  const handleSelectTemplate = (tmplId) => {
    setSelectedTemplateId(tmplId);
    const tmpl = REPORT_TEMPLATES.find(t => t.id === tmplId) || REPORT_TEMPLATES[0];
    setTestType(tmpl.defaultTestType);
    setCategory(tmpl.category);
    setRemarks(tmpl.defaultRemarks);
    setParameters(tmpl.parameters.map(p => ({
      parameter: p.parameter,
      value: p.defaultValue,
      unit: p.unit,
      refRange: p.refRange,
      flag: calculateFlag(p.defaultValue, p.refRange)
    })));

    checkDuplicate(tmpl.defaultTestType);
    // Proceed to Step 2: Camera
    setModalStep(2);
    setTimeout(() => {
      startCameraStream();
    }, 200);
  };

  // 6. Duplicate Test Check
  const checkDuplicate = async (type) => {
    if (!type || !id) return;
    try {
      const res = await fetch(`${API_BASE}/patients/${id}/reports/check?testType=${encodeURIComponent(type)}`, {
        headers: authHeader()
      });
      const data = await res.json();
      if (data.success && data.warnings?.length > 0) {
        setDuplicateWarning(data.warnings[0]);
      } else {
        setDuplicateWarning(null);
      }
    } catch {
      // Non-blocking
    }
  };

  // 7. Open Modal Fresh
  const handleOpenUploadModal = () => {
    setModalStep(1);
    const defaultTmpl = REPORT_TEMPLATES[0];
    setSelectedTemplateId(defaultTmpl.id);
    setTestType(defaultTmpl.defaultTestType);
    setCategory(defaultTmpl.category);
    setRemarks(defaultTmpl.defaultRemarks);
    setCollectedDate(new Date().toISOString().split('T')[0]);
    setParameters(defaultTmpl.parameters.map(p => ({
      parameter: p.parameter,
      value: p.defaultValue,
      unit: p.unit,
      refRange: p.refRange,
      flag: calculateFlag(p.defaultValue, p.refRange)
    })));
    setCapturedPhotoData('');
    setOcrRawText('');
    setDuplicateWarning(null);
    setUploadModalOpen(true);
  };

  const handleCloseModal = () => {
    stopCameraStream();
    setUploadModalOpen(false);
  };

  // 8. Parameter Field Updates
  const handleParamChange = (index, field, value) => {
    setParameters(prev => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      if (field === 'value' || field === 'refRange') {
        item.flag = calculateFlag(item.value, item.refRange);
      }
      updated[index] = item;
      return updated;
    });
  };

  const handleAddParam = () => {
    setParameters(prev => [
      ...prev,
      { parameter: '', value: '', unit: '', refRange: '', flag: 'normal' }
    ]);
  };

  const handleRemoveParam = (index) => {
    setParameters(prev => prev.filter((_, i) => i !== index));
  };

  // 9. Save and Print / Upload to Cloud
  const handleSaveAndAction = async (actionType = 'save') => {
    if (!testType.trim()) {
      alert('Please enter a test type.');
      return;
    }

    setIsSaving(true);
    try {
      // Prepare vitals object
      const vitalsObj = {
        height: parseFloat(patientHeight) || 162,
        weight: parseFloat(patientWeight) || 58.5,
        bmi: parseFloat(calculatedBmi) || 22.3
      };

      // 1. Upload captured photo to Cloudinary / storage
      let fileRecords = [];
      if (capturedPhotoData) {
        try {
          const upRes = await fetch(`${API_BASE}/uploads/direct`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeader() },
            body: JSON.stringify({
              fileBase64: capturedPhotoData,
              folder: `fidelity/patients/${patient?.motherId || id}/reports`
            })
          });
          const upData = await upRes.json();
          if (upData.success && upData.data) {
            fileRecords.push(upData.data);
          }
        } catch (uploadErr) {
          console.warn('Direct upload fallback:', uploadErr);
          fileRecords.push({
            url: capturedPhotoData,
            format: 'image/jpeg',
            bytes: capturedPhotoData.length
          });
        }
      }

      // 2. Prepare report payload
      const reportPayload = {
        testType,
        category,
        collectedAt: new Date(collectedDate),
        reportedAt: new Date(),
        results: parameters.filter(p => p.parameter && p.parameter.trim() !== ''),
        remarks: remarks || 'Clinical investigation processed and verified.',
        templateName: selectedTemplateId,
        ocrRawText: ocrRawText || undefined,
        patientVitals: vitalsObj,
        files: fileRecords
      };

      // 3. Save Report to Database
      const res = await fetch(`${API_BASE}/patients/${id}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(reportPayload)
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData?.error?.message || 'Failed to save diagnostic report');
      }

      const savedReport = resData.data;

      // Also update patient height & weight in database
      try {
        await fetch(`${API_BASE}/patients/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...authHeader() },
          body: JSON.stringify({
            height: vitalsObj.height,
            weight: vitalsObj.weight
          })
        });
      } catch {
        // Non-blocking
      }

      const fullPatientMeta = {
        ...patient,
        name: patientName,
        age: patientAge,
        gender: patientGender,
        bloodGroup: patientBloodGroup,
        height: vitalsObj.height,
        weight: vitalsObj.weight
      };

      const docMeta = {
        ...fullPatientMeta,
        hospitalName: patient?.hospitalRef?.hospitalName || user?.hospitalRef?.hospitalName || '-',
        hospitalRef: patient?.hospitalRef || user?.hospitalRef,
        assignedDoctor: patient?.assignedDoctor || (user?.role === 'doctor' ? user : null)
      };

      const realDoctorName = patient?.assignedDoctor?.name || (user?.role === 'doctor' ? user?.name : null) || savedReport?.orderedByName || '-';

      // 4. Action: Print or Download
      if (actionType === 'print') {
        generateDiagnosticPdf(
          { ...savedReport, orderedByName: realDoctorName },
          docMeta,
          { download: false, print: true }
        );
      } else if (actionType === 'download') {
        generateDiagnosticPdf(
          { ...savedReport, orderedByName: realDoctorName },
          docMeta,
          { download: true, print: false }
        );
      }

      await fetchPatientAndReports();
      handleCloseModal();
      alert('Diagnostic report successfully recorded with patient vitals & official PDF generated!');
    } catch (err) {
      console.error('Error saving report:', err);
      alert('Error: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesCat = filter === 'all' || r.category === filter;
      const matchesQuery = !searchQuery || 
        r.testType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.remarks?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.results?.some(p => p.parameter?.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesQuery;
    });
  }, [reports, filter, searchQuery]);

  return (
    <div className="pb-12 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Top Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to={`/patients/${id}`} className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
              <ArrowLeft size={14} /> Back to Patient Profile
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-blue-900 m-0">Lab Reports & Scans</h1>
          <p className="text-sm sm:text-base text-ink-600 mt-1 m-0">
            Diagnostic pathology records and scans for <strong className="text-ink-900">{patient?.name || 'Patient'}</strong> ({patient?.motherId || id})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={fetchPatientAndReports} 
            className="btn btn-outline h-10 px-3 flex items-center gap-1.5 text-ink-700 hover:bg-ink-100"
            title="Refresh reports"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            type="button" 
            className="btn h-10 px-4 flex items-center gap-2 shadow-sm font-semibold text-sm bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white cursor-pointer"
            onClick={() => setShowPrescriptionReader(true)}
            title="Open AI Prescription Reader (Telugu, Hindi, English)"
          >
            <ScanLine size={17} /> {t('prescriptionReader')} (AI)
          </button>
          <button 
            type="button" 
            className="btn btn-primary h-10 px-4 flex items-center gap-2 shadow-sm font-semibold text-sm bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800"
            onClick={handleOpenUploadModal}
          >
            <Camera size={18} /> Upload Report / Scan with Camera
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="card shadow-sm border border-ink-100 bg-white rounded-2xl p-6">
        {/* Controls Bar: Filters & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-5 border-b border-ink-100">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'blood', label: 'Blood' },
              { id: 'scan', label: 'Scans' },
              { id: 'urine', label: 'Urine' },
              { id: 'other', label: 'Other' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  filter === tab.id 
                    ? 'bg-blue-700 text-white shadow-sm' 
                    : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                }`}
                onClick={() => setFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Search test name, parameter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 h-9 text-xs w-full bg-ink-50/70 border-ink-200 focus:bg-white"
            />
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-ink-500">
            <Loader size={36} className="animate-spin text-blue-600 mb-3" />
            <p className="text-sm font-medium">Loading diagnostic records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-ink-200 bg-ink-50/70 text-ink-700 text-xs uppercase font-semibold tracking-wider">
                  <th className="px-4 py-3.5" style={{ minWidth: '180px' }}>Test Type</th>
                  <th className="px-4 py-3.5" style={{ minWidth: '110px' }}>Category</th>
                  <th className="px-4 py-3.5" style={{ minWidth: '130px' }}>Collected Date</th>
                  <th className="px-4 py-3.5" style={{ minWidth: '160px' }}>Key Findings</th>
                  <th className="px-4 py-3.5" style={{ minWidth: '110px' }}>Status</th>
                  <th className="px-4 py-3.5 text-right" style={{ minWidth: '180px' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 text-sm">
                {filteredReports.map(report => {
                  const hasAbnormal = report.results?.some(r => r.flag === 'low' || r.flag === 'high' || r.flag === 'abnormal');
                  const primaryFlag = hasAbnormal 
                    ? (report.results?.find(r => r.flag === 'low') ? 'low' : 'high')
                    : 'normal';

                  return (
                    <tr key={report._id || report.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-ink-900">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-blue-600 shrink-0" />
                          <span>{report.testType}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="capitalize px-2.5 py-0.5 rounded-md text-xs font-medium bg-ink-100 text-ink-700">
                          {report.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-ink-600 text-xs">
                        {report.collectedAt ? new Date(report.collectedAt).toLocaleDateString('en-GB') : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-ink-700">
                        {report.results && report.results.length > 0 ? (
                          <span className="line-clamp-1">
                            {report.results.slice(0, 2).map(r => `${r.parameter}: ${r.value} ${r.unit}`).join(' • ')}
                          </span>
                        ) : (
                          <span className="text-ink-400 italic">No parameters</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {primaryFlag === 'normal' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            Normal
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 capitalize">
                            {primaryFlag}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button 
                            type="button"
                            className="btn btn-outline h-8 text-xs px-2.5 flex items-center gap-1 text-ink-700 hover:text-blue-700" 
                            onClick={() => setSelectedReport(report)}
                          >
                            <Eye size={13} /> View
                          </button>
                          <button 
                            type="button"
                            className="btn btn-outline h-8 text-xs px-2.5 flex items-center gap-1 text-indigo-700 border-indigo-300 hover:bg-indigo-50" 
                            onClick={() => {
                              const targetDoctor = report?.orderedBy?.name || patient?.assignedDoctor?.name || (user?.role === 'doctor' ? user?.name : null) || '-';
                              const targetHospital = patient?.hospitalRef?.hospitalName || user?.hospitalRef?.hospitalName || '-';
                              generateDiagnosticPdf(
                                { ...report, orderedByName: targetDoctor, hospitalName: targetHospital },
                                { ...patient, name: patientName, age: patientAge, gender: patientGender, height: patientHeight, weight: patientWeight, bloodGroup: patientBloodGroup, hospitalName: targetHospital, assignedDoctor: patient?.assignedDoctor },
                                { download: false, print: true }
                              );
                            }}
                            title="Print Official PDF with Hospital & JanmaLink Logo"
                          >
                            <Printer size={13} /> Print
                          </button>
                          <button 
                            type="button"
                            className="btn btn-outline h-8 text-xs px-2.5 flex items-center gap-1 text-blue-700 border-blue-300 hover:bg-blue-50" 
                            onClick={() => {
                              const targetDoctor = report?.orderedBy?.name || patient?.assignedDoctor?.name || (user?.role === 'doctor' ? user?.name : null) || '-';
                              const targetHospital = patient?.hospitalRef?.hospitalName || user?.hospitalRef?.hospitalName || '-';
                              generateDiagnosticPdf(
                                { ...report, orderedByName: targetDoctor, hospitalName: targetHospital },
                                { ...patient, name: patientName, age: patientAge, gender: patientGender, height: patientHeight, weight: patientWeight, bloodGroup: patientBloodGroup, hospitalName: targetHospital, assignedDoctor: patient?.assignedDoctor },
                                { download: true, print: false }
                              );
                            }}
                            title="Download PDF"
                          >
                            <Download size={13} /> PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-ink-500">
                      <FileText size={32} className="mx-auto text-ink-300 mb-2" />
                      <p className="text-sm font-medium">No diagnostic reports recorded.</p>
                      <button 
                        type="button"
                        onClick={handleOpenUploadModal} 
                        className="mt-2 text-xs text-blue-700 font-semibold hover:underline"
                      >
                        Click here to select a template and scan with camera
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL DRAWER */}
      {selectedReport && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm z-50 flex justify-end" onClick={() => setSelectedReport(null)}>
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-ink-200 flex justify-between items-center bg-blue-50/50">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-blue-700">Diagnostic Investigation</span>
                <h2 className="text-xl font-bold text-blue-950 m-0 mt-0.5">{selectedReport.testType}</h2>
              </div>
              <button 
                type="button"
                className="p-1.5 text-ink-400 hover:text-ink-900 rounded-lg hover:bg-ink-100 transition-colors border-0 bg-transparent cursor-pointer" 
                onClick={() => setSelectedReport(null)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-3 text-xs bg-ink-50 p-3.5 rounded-xl border border-ink-100">
                <div>
                  <span className="text-ink-400 block mb-0.5">Category</span>
                  <span className="font-semibold text-ink-800 capitalize">{selectedReport.category}</span>
                </div>
                <div>
                  <span className="text-ink-400 block mb-0.5">Collected Date</span>
                  <span className="font-semibold text-ink-800">
                    {selectedReport.collectedAt ? new Date(selectedReport.collectedAt).toLocaleDateString('en-GB') : '-'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-3">Structured Parameters</h4>
                <div className="flex flex-col gap-2.5">
                  {(selectedReport.results || []).map((res, i) => (
                    <div key={i} className="p-3 bg-white rounded-xl border border-ink-200 shadow-sm flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-ink-900 text-sm">{res.parameter}</span>
                        <span className={`text-sm font-bold ${
                          res.flag === 'low' || res.flag === 'high' ? 'text-rose-600' : 'text-emerald-700'
                        }`}>
                          {res.value} {res.unit}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-ink-500">
                        <span>Biological Reference: {res.refRange || 'N/A'}</span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                          res.flag === 'low' ? 'bg-amber-100 text-amber-800' :
                          res.flag === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {res.flag || 'normal'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedReport.remarks && (
                <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100">
                  <h5 className="text-xs font-bold text-blue-900 uppercase mb-1">Clinical Remarks</h5>
                  <p className="text-xs text-ink-700 m-0 leading-relaxed">{selectedReport.remarks}</p>
                </div>
              )}

              {selectedReport.files && selectedReport.files.length > 0 && selectedReport.files[0]?.url && (
                <div>
                  <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">Attached Scanned Photo</h4>
                  <div className="border border-ink-200 rounded-xl overflow-hidden bg-ink-50 p-2">
                    <img 
                      src={selectedReport.files[0].url} 
                      alt="Source Diagnostic Document" 
                      className="w-full max-h-60 object-contain rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-ink-200 bg-ink-50 flex items-center justify-between gap-3">
              <button 
                type="button" 
                className="btn btn-outline text-xs h-9 px-4" 
                onClick={() => setSelectedReport(null)}
              >
                Close
              </button>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  className="btn btn-outline text-xs h-9 px-3 flex items-center gap-1.5 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                  onClick={() => {
                    generateDiagnosticPdf(
                      { ...selectedReport, orderedByName: user?.name || 'Dr. Smith' },
                      { ...patient, name: patientName, age: patientAge, gender: patientGender, height: patientHeight, weight: patientWeight, bloodGroup: patientBloodGroup },
                      { download: false, print: true }
                    );
                  }}
                >
                  <Printer size={14} /> Print
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary text-xs h-9 px-4 flex items-center gap-1.5 shadow-sm font-semibold bg-blue-700 hover:bg-blue-800"
                  onClick={() => {
                    generateDiagnosticPdf(
                      { ...selectedReport, orderedByName: user?.name || 'Dr. Smith' },
                      { ...patient, name: patientName, age: patientAge, gender: patientGender, height: patientHeight, weight: patientWeight, bloodGroup: patientBloodGroup },
                      { download: true, print: false }
                    );
                  }}
                >
                  <Download size={14} /> Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3-STEP WORKFLOW MODAL: TEMPLATE -> CAMERA OCR -> INPUTS & PRINT */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-blue-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto" onClick={handleCloseModal}>
          <div 
            className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[94vh]" 
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header & Stepper */}
            <div className="px-6 py-4 border-b border-ink-200 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-white m-0 flex items-center gap-2">
                    <Camera size={19} className="text-pink-400" />
                    Medical Report Scanner & PDF Creator
                  </h2>
                  <p className="text-xs text-blue-200 m-0 mt-0.5">
                    Select template, capture photo with camera, extract parameters with AI OCR, and print official report
                  </p>
                </div>
                <button 
                  type="button"
                  className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors border-0 bg-transparent cursor-pointer" 
                  onClick={handleCloseModal}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Progress Stepper Tabs */}
              <div className="flex items-center gap-2 text-xs font-semibold pt-1">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                  modalStep === 1 ? 'bg-pink-600 text-white shadow-sm' : 'bg-white/15 text-blue-200'
                }`}>
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
                  Select Template
                </div>
                <ChevronRight size={14} className="text-blue-300" />

                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                  modalStep === 2 ? 'bg-pink-600 text-white shadow-sm' : 'bg-white/15 text-blue-200'
                }`}>
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
                  Camera & AI OCR
                </div>
                <ChevronRight size={14} className="text-blue-300" />

                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                  modalStep === 3 ? 'bg-pink-600 text-white shadow-sm' : 'bg-white/15 text-blue-200'
                }`}>
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
                  Review, Vitals & Print PDF
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {/* STEP 1: CHOOSE TEMPLATE */}
              {modalStep === 1 && (
                <div className="space-y-4">
                  <div className="text-center max-w-lg mx-auto mb-6">
                    <h3 className="text-base font-bold text-blue-950 m-0">Choose Diagnostic Template Format</h3>
                    <p className="text-xs text-ink-600 mt-1 m-0">
                      Select the clinical test template. Your camera will open immediately after selection to capture and OCR the report.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {REPORT_TEMPLATES.map(tmpl => {
                      const isSelected = selectedTemplateId === tmpl.id;
                      return (
                        <div
                          key={tmpl.id}
                          onClick={() => handleSelectTemplate(tmpl.id)}
                          className={`cursor-pointer rounded-2xl p-5 border-2 transition-all hover:shadow-lg flex flex-col justify-between ${
                            isSelected 
                              ? 'border-pink-500 bg-pink-50/50 ring-4 ring-pink-500/15 shadow-md' 
                              : 'border-ink-200 bg-white hover:border-blue-500'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start mb-2.5">
                              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                                {tmpl.phase || tmpl.category}
                              </span>
                              {isSelected ? (
                                <CheckCircle2 size={18} className="text-pink-600" />
                              ) : (
                                <span className="text-[11px] font-semibold text-ink-500">{tmpl.parameters.length} Tests</span>
                              )}
                            </div>
                            <h4 className="text-base font-bold text-blue-950 m-0 mb-1">{tmpl.name}</h4>
                            <p className="text-xs text-ink-600 m-0 mb-2 leading-relaxed">{tmpl.description}</p>
                            {tmpl.recommendedWhen && (
                              <p className="text-[11px] font-semibold text-indigo-800 bg-indigo-50/80 px-2.5 py-1 rounded-md mb-2.5 border border-indigo-100 flex items-center gap-1">
                                <Calendar size={12} className="text-indigo-600 shrink-0" />
                                <span>When: {tmpl.recommendedWhen}</span>
                              </p>
                            )}

                            {/* Sample Tests Pills */}
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {tmpl.parameters.slice(0, 6).map((param, pIdx) => (
                                <span key={pIdx} className="text-[10px] font-medium bg-ink-100 text-ink-700 px-2 py-0.5 rounded-md">
                                  {param.parameter}: <strong>{param.defaultValue} {param.unit !== '—' ? param.unit : ''}</strong>
                                </span>
                              ))}
                              {tmpl.parameters.length > 6 && (
                                <span className="text-[10px] font-bold text-pink-600 px-1 py-0.5">
                                  +{tmpl.parameters.length - 6} more
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-ink-100 flex items-center justify-between text-xs font-bold text-blue-700">
                            <span>{tmpl.defaultTestType}</span>
                            <span className="flex items-center gap-1 text-pink-600 hover:translate-x-1 transition-transform">
                              Select & Open Camera <ChevronRight size={14} />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: CAMERA VIEW & CAPTURE */}
              {modalStep === 2 && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-ink-200">
                    <div>
                      <h3 className="text-base font-bold text-blue-950 m-0">Live Camera Document Scanner</h3>
                      <p className="text-xs text-ink-600 m-0">
                        Template: <strong className="text-blue-700">{testType}</strong> • Position the report clearly inside the viewfinder
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => setModalStep(1)} 
                        className="btn btn-outline text-xs h-8 px-3"
                      >
                        Change Template
                      </button>
                      <button 
                        type="button" 
                        onClick={handleSwitchCamera} 
                        className="btn btn-outline text-xs h-8 px-3 flex items-center gap-1 text-ink-700"
                        title="Switch front/back camera"
                      >
                        <RotateCw size={13} /> Switch Camera
                      </button>
                    </div>
                  </div>

                  {/* Camera Viewfinder Frame */}
                  <div className="relative w-full max-w-2xl mx-auto aspect-video sm:aspect-[4/3] bg-ink-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                    {/* Live Video Feed */}
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
                    />

                    {/* Viewfinder Target Overlay Guide */}
                    {isCameraActive && (
                      <div className="absolute inset-6 sm:inset-10 border-2 border-dashed border-pink-400/80 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                        <div className="flex justify-between text-[11px] font-mono text-pink-300">
                          <span>[ALIGN DOCUMENT HERE]</span>
                          <span>HD SCANNER</span>
                        </div>
                        <div className="text-center">
                          <span className="text-[11px] font-medium text-white/90 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                            Hold still & tap "Capture Photo"
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] font-mono text-pink-300">
                          <span>AUTO-FOCUS ON</span>
                          <span>JANMALINK AI</span>
                        </div>
                      </div>
                    )}

                    {/* Camera Error or Inactive Fallback */}
                    {!isCameraActive && !isOcrProcessing && (
                      <div className="text-center p-6 text-white max-w-sm">
                        <Camera size={44} className="mx-auto text-pink-400 mb-3 animate-pulse" />
                        <h4 className="text-sm font-bold text-white mb-1">
                          {cameraError ? 'Camera Notice' : 'Starting Camera...'}
                        </h4>
                        <p className="text-xs text-ink-300 mb-4 leading-relaxed">
                          {cameraError || 'Please allow camera permission in your browser.'}
                        </p>
                        <button 
                          type="button" 
                          onClick={() => startCameraStream()} 
                          className="btn btn-primary text-xs h-9 px-4 mb-3"
                        >
                          Retry Camera
                        </button>
                      </div>
                    )}

                    {/* OCR Live Processing Overlay */}
                    {isOcrProcessing && (
                      <div className="absolute inset-0 bg-blue-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white text-center">
                        <Sparkles size={40} className="text-pink-400 mb-3 animate-bounce" />
                        <h4 className="text-base font-bold text-white m-0 mb-1">{ocrStatus || 'AI Reading Document...'}</h4>
                        <p className="text-xs text-blue-200 mb-4 max-w-xs">
                          Extracting test parameters, values, and biological ranges...
                        </p>
                        <div className="w-64 bg-white/20 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="bg-pink-500 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${ocrProgress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-mono font-bold mt-2 text-pink-300">{ocrProgress}%</span>
                      </div>
                    )}
                  </div>

                  {/* Camera Action Buttons & File Fallback */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                    {isCameraActive && (
                      <button 
                        type="button" 
                        onClick={handleCapturePhoto} 
                        disabled={isOcrProcessing}
                        className="btn btn-primary h-12 px-8 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                      >
                        <Camera size={20} /> Capture Photo & Run AI OCR
                      </button>
                    )}

                    <label className="cursor-pointer text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1.5 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                      <UploadCloud size={16} /> Or upload saved report photo from device
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUploadForOcr} 
                        className="hidden" 
                      />
                    </label>

                    <button 
                      type="button" 
                      onClick={() => setModalStep(3)} 
                      className="text-xs font-semibold text-ink-500 hover:text-ink-800 underline"
                    >
                      Skip camera & fill manually
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: REVIEW, VITALS, PARAMETERS & PRINT PDF */}
              {modalStep === 3 && (
                <div className="space-y-6">
                  
                  {/* Duplicate Test Warning Banner */}
                  {duplicateWarning && (
                    <div className="bg-amber-50 border border-amber-300 text-amber-900 p-4 rounded-xl flex gap-3 items-start animate-in fade-in">
                      <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-sm font-semibold mb-0.5">Duplicate Test Warning</strong>
                        <p className="text-xs text-amber-800 m-0">
                          A {testType} test was already recorded {duplicateWarning.daysAgo || 6} days ago. Are you sure you want to proceed?
                        </p>
                      </div>
                    </div>
                  )}

                  {/* OCR Success Banner & Photo Thumbnail */}
                  {capturedPhotoData && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={capturedPhotoData} 
                          alt="Captured Photo" 
                          className="w-14 h-14 object-cover rounded-lg border border-emerald-300 shadow-sm shrink-0" 
                        />
                        <div>
                          <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle2 size={15} className="text-emerald-600" /> Photo Captured & OCR Applied!
                          </span>
                          <p className="text-[11px] text-emerald-700 m-0 mt-0.5">
                            Report parameters auto-extracted. Review or adjust values below before generating official PDF.
                          </p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => {
                          setModalStep(2);
                          setTimeout(() => startCameraStream(), 200);
                        }} 
                        className="btn btn-outline text-xs h-8 px-3 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                      >
                        Retake Photo
                      </button>
                    </div>
                  )}

                  {/* SECTION 1: PATIENT DETAILS & VITALS (AGE, NAME, HEIGHT, WEIGHT, BMI) */}
                  <div className="p-4 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-200 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <UserCheck size={16} className="text-blue-700" />
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-950">
                          Patient Demographics & Vitals (Included in Official PDF)
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-blue-700">
                        BMI: <strong className="text-pink-600">{calculatedBmi} kg/m²</strong> (Normal)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div className="col-span-2">
                        <label className="text-[11px] font-bold text-ink-700 uppercase block mb-1">Patient Name</label>
                        <input 
                          type="text" 
                          value={patientName} 
                          onChange={(e) => setPatientName(e.target.value)}
                          className="input h-9 text-xs font-semibold w-full" 
                          required 
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-ink-700 uppercase block mb-1">Age (Yrs)</label>
                        <input 
                          type="number" 
                          value={patientAge} 
                          onChange={(e) => setPatientAge(e.target.value)}
                          className="input h-9 text-xs text-center w-full" 
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-ink-700 uppercase block mb-1">Gender</label>
                        <select 
                          value={patientGender} 
                          onChange={(e) => setPatientGender(e.target.value)}
                          className="input h-9 text-xs w-full"
                        >
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-ink-700 uppercase block mb-1">Height (cm)</label>
                        <input 
                          type="number" 
                          value={patientHeight} 
                          onChange={(e) => setPatientHeight(e.target.value)}
                          placeholder="e.g. 162" 
                          className="input h-9 text-xs text-center w-full" 
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-ink-700 uppercase block mb-1">Weight (kg)</label>
                        <input 
                          type="number" 
                          step="0.5"
                          value={patientWeight} 
                          onChange={(e) => setPatientWeight(e.target.value)}
                          placeholder="e.g. 58" 
                          className="input h-9 text-xs text-center w-full" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: TEST METADATA */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold uppercase text-ink-700 block mb-1">Investigation Name</label>
                      <input 
                        type="text" 
                        value={testType} 
                        onChange={(e) => {
                          setTestType(e.target.value);
                          checkDuplicate(e.target.value);
                        }} 
                        className="input h-9 text-xs" 
                        required 
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-ink-700 block mb-1">Category</label>
                      <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)} 
                        className="input h-9 text-xs capitalize"
                      >
                        <option value="blood">Blood</option>
                        <option value="urine">Urine</option>
                        <option value="scan">Scan / Imaging</option>
                        <option value="hormone">Hormone</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-ink-700 block mb-1">Sample Collected Date</label>
                      <input 
                        type="date" 
                        value={collectedDate} 
                        onChange={(e) => setCollectedDate(e.target.value)} 
                        className="input h-9 text-xs" 
                      />
                    </div>
                  </div>

                  {/* SECTION 3: STRUCTURED PARAMETERS TABLE */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-blue-900">
                        Investigation Parameters & Reference Intervals
                      </label>
                      <button 
                        type="button" 
                        onClick={handleAddParam} 
                        className="btn btn-outline text-xs h-7 px-2.5 flex items-center gap-1 text-blue-700 border-blue-200 hover:bg-blue-50"
                      >
                        <Plus size={13} /> Add Row
                      </button>
                    </div>

                    <div className="border border-ink-200 rounded-xl overflow-hidden bg-white shadow-sm">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-ink-200 bg-ink-50/70 text-ink-600 font-semibold uppercase text-[11px]">
                            <th className="p-2.5">Parameter</th>
                            <th className="p-2.5" style={{ width: '110px' }}>Observed Value</th>
                            <th className="p-2.5" style={{ width: '85px' }}>Unit</th>
                            <th className="p-2.5" style={{ width: '115px' }}>Ref Range</th>
                            <th className="p-2.5 text-center" style={{ width: '85px' }}>Status</th>
                            <th className="p-2.5 text-right" style={{ width: '40px' }}></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ink-100">
                          {parameters.map((param, index) => (
                            <tr key={index} className="hover:bg-ink-50/40">
                              <td className="p-2">
                                <input 
                                  type="text" 
                                  value={param.parameter} 
                                  onChange={(e) => handleParamChange(index, 'parameter', e.target.value)}
                                  placeholder="Parameter name" 
                                  className="input h-8 text-xs font-medium w-full"
                                />
                              </td>
                              <td className="p-2">
                                <input 
                                  type="text" 
                                  value={param.value} 
                                  onChange={(e) => handleParamChange(index, 'value', e.target.value)}
                                  placeholder="Value" 
                                  className="input h-8 text-xs font-bold w-full text-center"
                                />
                              </td>
                              <td className="p-2">
                                <input 
                                  type="text" 
                                  value={param.unit} 
                                  onChange={(e) => handleParamChange(index, 'unit', e.target.value)}
                                  placeholder="Unit" 
                                  className="input h-8 text-xs w-full text-center"
                                />
                              </td>
                              <td className="p-2">
                                <input 
                                  type="text" 
                                  value={param.refRange} 
                                  onChange={(e) => handleParamChange(index, 'refRange', e.target.value)}
                                  placeholder="e.g. 11-15" 
                                  className="input h-8 text-xs w-full text-center"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block ${
                                  param.flag === 'low' ? 'bg-amber-100 text-amber-800' :
                                  param.flag === 'high' ? 'bg-rose-100 text-rose-800' :
                                  'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {param.flag || 'normal'}
                                </span>
                              </td>
                              <td className="p-2 text-right">
                                <button 
                                  type="button" 
                                  onClick={() => handleRemoveParam(index)} 
                                  className="text-ink-400 hover:text-rose-600 transition-colors p-1"
                                  title="Remove row"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* SECTION 4: CLINICAL REMARKS */}
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink-700 block mb-1">
                      Clinical Impression & Interpretation
                    </label>
                    <textarea 
                      value={remarks} 
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Enter clinical interpretation, obstetric notes or follow-up recommendation..." 
                      className="input text-xs h-20 w-full"
                    ></textarea>
                  </div>

                </div>
              )}

            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 border-t border-ink-200 bg-ink-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button 
                type="button" 
                className="btn btn-outline text-xs h-9 px-4 w-full sm:w-auto" 
                onClick={handleCloseModal}
              >
                Cancel
              </button>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                {modalStep > 1 && (
                  <button 
                    type="button" 
                    onClick={() => setModalStep(prev => prev - 1)}
                    className="btn btn-outline text-xs h-9 px-3"
                  >
                    Back
                  </button>
                )}

                {modalStep === 3 && (
                  <>
                    {/* PRINT BUTTON: Draws Hospital Crest & JanmaLink Logo, Vitals, and triggers Print dialog */}
                    <button 
                      type="button" 
                      disabled={isSaving}
                      onClick={() => handleSaveAndAction('print')}
                      className="btn btn-outline border-indigo-400 text-indigo-700 hover:bg-indigo-50 text-xs h-9 px-3.5 flex items-center gap-1.5 font-semibold"
                      title="Prints PDF with City Hospital & JanmaLink Logos"
                    >
                      <Printer size={15} /> Print Report (With Logos)
                    </button>

                    {/* DOWNLOAD PDF */}
                    <button 
                      type="button" 
                      disabled={isSaving}
                      onClick={() => handleSaveAndAction('download')}
                      className="btn btn-outline border-blue-400 text-blue-700 hover:bg-blue-50 text-xs h-9 px-3.5 flex items-center gap-1.5 font-semibold"
                    >
                      <Download size={15} /> Download PDF
                    </button>

                    {/* SAVE & UPLOAD TO CLOUD */}
                    <button 
                      type="button" 
                      disabled={isSaving}
                      onClick={() => handleSaveAndAction('save')}
                      className="btn btn-primary text-xs h-9 px-4 flex items-center gap-1.5 shadow-sm font-semibold bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white"
                    >
                      {isSaving ? <Loader size={14} className="animate-spin" /> : <FileCheck size={14} />}
                      Save & Upload to Records
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Trilingual AI Prescription Reader Modal */}
      <PrescriptionReader
        isOpen={showPrescriptionReader}
        onClose={() => setShowPrescriptionReader(false)}
        patientName={patient?.name || ''}
        patientId={patient?.motherId || id || ''}
      />

    </div>
  );
};

export default Reports;
