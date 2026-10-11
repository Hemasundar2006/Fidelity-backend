import React, { useState, useRef, useEffect } from 'react';
import {
  Camera, Upload, X, Loader2, Pill, AlertTriangle, Apple, Heart,
  Clock, FileText, ChevronDown, ChevronUp, Sparkles, RefreshCw,
  Shield, Info, Globe, Volume2, VolumeX, CheckCircle2
} from 'lucide-react';
import { readPrescriptionAI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const LANG_OPTS = [
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

const PrescriptionReader = ({ isOpen, onClose, patientName = '', patientId = '' }) => {
  const { t, language: globalLang } = useLanguage();
  const [lang, setLang] = useState(globalLang || 'te');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imageMime, setImageMime] = useState('image/jpeg');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [expandedSection, setExpandedSection] = useState('medications');
  const [cameraStream, setCameraStream] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Sync with global language on mount or change if not yet custom-picked
  useEffect(() => {
    if (globalLang && !result) {
      setLang(globalLang);
    }
  }, [globalLang]);

  // Stop speech when closing modal
  useEffect(() => {
    if (!isOpen) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      stopCamera();
    }
  }, [isOpen]);

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setResult(null);
    const b64 = await fileToBase64(file);
    setImageBase64(b64);
    setImagePreview(b64);
    setImageMime(file.type || 'image/jpeg');
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setCameraStream(stream);
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      setError('Camera access denied. Please allow camera permission or use file upload.');
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setImageBase64(dataUrl);
    setImagePreview(dataUrl);
    setImageMime('image/jpeg');
    stopCamera();
    setResult(null);
    setError(null);
  };

  const stopCamera = () => {
    cameraStream?.getTracks().forEach(t => t.stop());
    setCameraStream(null);
    setShowCamera(false);
  };

  // Instant Sample Maternal Prescription for live evaluation
  const handleLoadDemo = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 600, 360);
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('JanmaLink Maternity Hospital — Antenatal Care Rx', 24, 36);
    ctx.fillStyle = '#64748b';
    ctx.font = '13px sans-serif';
    ctx.fillText(`Patient: ${patientName || 'Maternal Case'}  •  Dr. Ramana Reddy (OB-GYN)`, 24, 62);
    ctx.strokeStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(24, 76);
    ctx.lineTo(576, 76);
    ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.font = '15px monospace';
    ctx.fillText('1. Tab. Ferrous Ascorbate + Folic Acid (IFA)  -  1 Tab OD (HS)', 30, 115);
    ctx.fillText('2. Tab. Calcium Carbonate + Vit D3 (500mg)     -  1 Tab OD (Post BF)', 30, 155);
    ctx.fillText('3. Cap. Prenatal Multivitamin & Zinc          -  1 Cap OD (Post Lunch)', 30, 195);
    ctx.fillText('4. Tab. Pantoprazole 40mg                     -  1 Tab PRN (Empty Stomach)', 30, 235);
    ctx.fillStyle = '#059669';
    ctx.font = 'italic 13px sans-serif';
    ctx.fillText('Advice: Keep 2h gap between calcium & iron. Drink lemon water. 3L hydration.', 30, 290);
    const demoDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setImageBase64(demoDataUrl);
    setImagePreview(demoDataUrl);
    setImageMime('image/jpeg');
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!imageBase64) return;
    setAnalyzing(true);
    setError(null);
    setResult(null);
    try {
      const data = await readPrescriptionAI({
        imageBase64,
        mimeType: imageMime,
        language: lang,
        patientName
      });
      setResult(data);
      setExpandedSection('medications');
    } catch (err) {
      setError(err.message || 'Prescription analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Trilingual language toggle: Instant switch if translation already loaded, or re-fetch
  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);

    if (result) {
      if (result.translations && result.translations[newLang]) {
        // Instantaneous switch
        setResult(prev => ({
          ...prev,
          ...result.translations[newLang],
          language: newLang,
          langName: newLang === 'te' ? 'Telugu' : newLang === 'hi' ? 'Hindi' : 'English'
        }));
      } else if (imageBase64) {
        // Re-analyze in requested language
        setAnalyzing(true);
        readPrescriptionAI({
          imageBase64,
          mimeType: imageMime,
          language: newLang,
          patientName
        }).then(data => {
          setResult(data);
        }).catch(err => {
          setError(err.message || 'Analysis failed');
        }).finally(() => {
          setAnalyzing(false);
        });
      }
    }
  };

  // Text to Speech Readout in active language
  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    if (!result) return;

    const medsText = (result.detectedMedications || []).map(m => `${m.name}. ${m.timing || ''}.`).join(' ');
    const doseText = (result.dosageInstructions || []).join('. ');
    const remText = (result.homeRemedies || []).join('. ');
    const fullSpeech = `${medsText}. ${doseText}. ${remText}`;

    const utterance = new SpeechSynthesisUtterance(fullSpeech);
    utterance.lang = lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.92;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const reset = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setImagePreview(null);
    setImageBase64(null);
    setResult(null);
    setError(null);
    stopCamera();
  };

  const toggle = (section) => setExpandedSection(s => s === section ? null : section);

  if (!isOpen) return null;

  const SECTIONS = [
    {
      key: 'medications',
      icon: <Pill size={16} className="text-blue-500" />,
      label: t('detectedMedications'),
      color: 'blue',
      data: result?.detectedMedications,
      renderItem: (med, i) => (
        <div key={i} className="bg-blue-50/80 rounded-xl p-3 mb-2 border border-blue-100 hover:border-blue-200 transition-all">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-blue-900 text-[14px] flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                {med.name}
              </p>
              {med.strength && <p className="text-[12px] text-blue-700 mt-0.5 font-medium">💊 {med.strength}</p>}
              {med.frequency && <p className="text-[12px] text-blue-600">⏰ {med.frequency}</p>}
              {med.timing && <p className="text-[11px] text-blue-800 mt-1 bg-white/70 px-2 py-0.5 rounded-md inline-block">🕒 {med.timing}</p>}
            </div>
            {med.purpose && (
              <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 font-medium">
                {med.purpose}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'dosage',
      icon: <Clock size={16} className="text-teal-500" />,
      label: t('dosageInstructions'),
      color: 'teal',
      data: result?.dosageInstructions,
      renderItem: (item, i) => (
        <li key={i} className="text-[13px] text-ink-700 leading-[22px] mb-1.5">{item}</li>
      )
    },
    {
      key: 'sideEffects',
      icon: <AlertTriangle size={16} className="text-amber-500" />,
      label: t('sideEffects'),
      color: 'amber',
      data: result?.sideEffects,
      renderItem: (item, i) => (
        <li key={i} className="text-[13px] text-ink-700 leading-[22px] mb-1.5">{item}</li>
      )
    },
    {
      key: 'dietary',
      icon: <Apple size={16} className="text-green-500" />,
      label: t('dietaryAdvice'),
      color: 'green',
      data: result?.dietaryAdvice,
      renderItem: (item, i) => (
        <li key={i} className="text-[13px] text-ink-700 leading-[22px] mb-1.5">{item}</li>
      )
    },
    {
      key: 'remedies',
      icon: <Heart size={16} className="text-rose-500" />,
      label: t('homeRemedies'),
      color: 'rose',
      data: result?.homeRemedies,
      renderItem: (item, i) => (
        <li key={i} className="text-[13px] text-ink-700 leading-[22px] mb-1.5">{item}</li>
      )
    },
    {
      key: 'reminders',
      icon: <Shield size={16} className="text-purple-500" />,
      label: t('importantReminders'),
      color: 'purple',
      data: result?.importantReminders,
      renderItem: (item, i) => (
        <li key={i} className="text-[13px] text-ink-700 leading-[22px] mb-1.5">{item}</li>
      )
    },
  ];

  const colorMap = {
    blue: 'border-blue-200 bg-blue-50/60',
    teal: 'border-teal-200 bg-teal-50/60',
    amber: 'border-amber-200 bg-amber-50/60',
    green: 'border-green-200 bg-green-50/60',
    rose: 'border-rose-200 bg-rose-50/60',
    purple: 'border-purple-200 bg-purple-50/60',
  };

  const headerColorMap = {
    blue: 'bg-blue-100 text-blue-800',
    teal: 'bg-teal-100 text-teal-800',
    amber: 'bg-amber-100 text-amber-800',
    green: 'bg-green-100 text-green-800',
    rose: 'bg-rose-100 text-rose-800',
    purple: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-hidden flex flex-col border border-slate-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 p-4 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-xs">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-bold text-[15px] leading-tight m-0">{t('prescriptionReaderTitle')}</h2>
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold border border-white/20">
                  Gemini AI
                </span>
              </div>
              <p className="text-violet-200 text-[11px] m-0 mt-0.5">
                {patientName ? `${patientName} • ` : ''}Trilingual Maternal Analysis
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Trilingual Selector Bar */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <Globe size={14} className="text-violet-600 shrink-0" />
            <span className="text-[12px] font-semibold text-slate-700">{t('prescriptionLanguage')}:</span>
          </div>
          <div className="flex items-center gap-1.5">
            {LANG_OPTS.map(l => (
              <button
                key={l.code}
                onClick={() => handleLanguageChange(l.code)}
                className={`px-3 py-1 rounded-lg text-[12px] font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                  lang === l.code
                    ? 'bg-violet-600 text-white border-violet-600 shadow-xs scale-102'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-violet-300 hover:bg-violet-50/50'
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Camera Active Mode */}
          {showCamera && (
            <div className="relative rounded-xl overflow-hidden bg-black shadow-inner">
              <video ref={videoRef} className="w-full max-h-52 object-cover" muted playsInline />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
                <button
                  onClick={capturePhoto}
                  className="bg-white text-violet-700 font-bold px-5 py-2 rounded-xl text-[13px] shadow-lg cursor-pointer hover:bg-violet-50 flex items-center gap-1.5 transition-transform active:scale-95"
                >
                  <Camera size={16} /> {t('takePicture')}
                </button>
                <button
                  onClick={stopCamera}
                  className="bg-black/50 text-white px-4 py-2 rounded-xl text-[13px] cursor-pointer hover:bg-black/70 backdrop-blur-xs"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Upload / Capture Trigger Area */}
          {!showCamera && !imagePreview && (
            <div className="space-y-3">
              <p className="text-[12px] text-slate-600 m-0 leading-relaxed">
                {t('prescriptionReaderSubtitle')}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={startCamera}
                  className="flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed border-violet-200 rounded-xl text-violet-700 hover:bg-violet-50/60 hover:border-violet-400 transition-all cursor-pointer group bg-violet-50/20"
                >
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera size={20} className="text-violet-600" />
                  </div>
                  <span className="text-[12px] font-bold">{t('takePicture')}</span>
                  <span className="text-[10px] text-slate-400">Mobile or Webcam</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed border-blue-200 rounded-xl text-blue-700 hover:bg-blue-50/60 hover:border-blue-400 transition-all cursor-pointer group bg-blue-50/20"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload size={20} className="text-blue-600" />
                  </div>
                  <span className="text-[12px] font-bold">{t('uploadPrescription')}</span>
                  <span className="text-[10px] text-slate-400">JPG, PNG or PDF</span>
                </button>
              </div>

              {/* Demo Sample Button for Instant Evaluation */}
              <div className="pt-1">
                <button
                  onClick={handleLoadDemo}
                  className="w-full py-2 px-3 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-teal-800 rounded-xl border border-teal-200 text-[12px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs"
                >
                  <Sparkles size={14} className="text-teal-600" />
                  <span>✨ Try Demo Maternal Prescription (నమూనా ప్రిస్క్రిప్షన్)</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* Image Preview */}
          {imagePreview && !showCamera && (
            <div className="relative rounded-xl overflow-hidden border-2 border-violet-200 bg-slate-50">
              <img src={imagePreview} alt="Prescription" className="w-full max-h-52 object-contain bg-white" />
              <button
                onClick={reset}
                className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md text-slate-600 hover:text-red-500 cursor-pointer transition-colors"
                title="Remove image"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Analyze CTA */}
          {imageBase64 && !analyzing && !result && (
            <button
              onClick={handleAnalyze}
              className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer transform active:scale-98"
            >
              <Sparkles size={16} className="animate-spin" />
              <span>{t('scanPrescription')} (AI Analysis)</span>
            </button>
          )}

          {/* Analyzing Spinner */}
          {analyzing && (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-violet-600 bg-violet-50/50 rounded-2xl border border-violet-100">
              <Loader2 size={36} className="animate-spin text-violet-600" />
              <div className="text-center">
                <p className="text-[14px] font-bold text-slate-800 m-0">{t('analyzing')}</p>
                <p className="text-[11px] text-slate-500 m-0 mt-0.5">Matching Gemini Vision & Maternal Clinical Rules...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-[13px] flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <p className="m-0 leading-tight">{error}</p>
            </div>
          )}

          {/* Structured Analysis Results */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-violet-50/60 p-2.5 rounded-xl border border-violet-100">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700 bg-white px-2 py-0.5 rounded-md border border-violet-200">
                    {result.langName || 'Analysis'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {result.aiEngine || 'Gemini Vision AI'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Text-to-Speech audio button */}
                  <button
                    onClick={handleSpeak}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                      isSpeaking 
                        ? 'bg-rose-500 text-white border-rose-600 animate-pulse' 
                        : 'bg-white text-violet-700 border-violet-200 hover:bg-violet-50'
                    }`}
                    title="Listen to medicine schedule and remedies in chosen language"
                  >
                    {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                    <span>{isSpeaking ? 'Stop Audio' : '🔊 Speak'}</span>
                  </button>

                  <button
                    onClick={reset}
                    className="text-[11px] text-violet-600 font-semibold flex items-center gap-1 hover:underline cursor-pointer bg-white px-2 py-1 rounded-lg border border-violet-200"
                  >
                    <RefreshCw size={11} /> {t('scanPrescription')}
                  </button>
                </div>
              </div>

              {SECTIONS.map(section => {
                const hasData = Array.isArray(section.data) && section.data.length > 0;
                if (!hasData) return null;
                const isExpanded = expandedSection === section.key;
                return (
                  <div key={section.key} className={`rounded-xl border overflow-hidden transition-all ${colorMap[section.color]}`}>
                    <button
                      onClick={() => toggle(section.key)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 ${headerColorMap[section.color]} cursor-pointer`}
                    >
                      <span className="flex items-center gap-2 font-bold text-[13px]">
                        {section.icon}
                        {section.label}
                        <span className="text-[11px] font-normal opacity-80 ml-1">({section.data.length})</span>
                      </span>
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                    {isExpanded && (
                      <div className="px-3.5 py-3">
                        {section.key === 'medications' ? (
                          <div>{section.data.map(section.renderItem)}</div>
                        ) : (
                          <ul className="list-disc pl-4 space-y-1 m-0">
                            {section.data.map(section.renderItem)}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Disclaimer */}
              {result.disclaimer && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 shadow-xs">
                  <Info size={15} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-800 leading-relaxed m-0 font-medium">
                    {result.disclaimer}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PrescriptionReader;
