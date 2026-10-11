import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Mic, MicOff, Volume2, VolumeX, Send, Sparkles, AlertTriangle, 
  CheckCircle2, X, RefreshCw, FileText, ChevronRight, Apple, Pill, 
  HelpCircle, Globe, Shield, HeartPulse, Activity, UserCheck, Lock,
  Maximize2, Minimize2, MessageSquare
} from 'lucide-react';
import { predictRagReport, askRagChat, askRagPersonalAssistant } from '../services/api';

export default function JanmaLinkAIAssistant({ isOpen: externalIsOpen, onClose: externalOnClose, patientContext = null }) {
  const [isOpen, setIsOpen] = useState(externalIsOpen !== undefined ? externalIsOpen : false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showGreetingBubble, setShowGreetingBubble] = useState(true);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'predict'
  const [language, setLanguage] = useState('te'); // 'te' | 'hi' | 'en' (default Telugu as per user preference)
  
  // Voice Input (Speech Recognition) state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Audio Output (Speech Synthesis) state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);

  // Determine if personal patient mode is active
  const patientId = patientContext?._id || patientContext?.id || patientContext?.patientId;
  const patientName = patientContext?.name || '';
  const patientMotherId = patientContext?.motherId || patientContext?.patientId || '';

  // Initial welcome message based on patient login status
  const getInitialMessage = (lang) => {
    if (patientName) {
      if (lang === 'te') {
        return `నమస్కారం ${patientName} గారూ! నేను మీ వ్యక్తిగత ఆరోగ్య సహాయకురాలిని. మీ ఆసుపత్రి రిపోర్టులు మరియు డాక్టర్ సలహాలను పరిశీలించాను. ఈరోజు మీ ఆరోగ్యం ఎలా ఉంది? మీ రక్త పరీక్షల ఫలితాలు, ఇంట్లో తినవలసిన ఆహారం లేదా బిడ్డ ఆరోగ్యం గురించి ఏదైనా అడగండి.`;
      } else if (lang === 'hi') {
        return `नमस्ते ${patientName} जी! मैं आपकी व्यक्तिगत स्वास्थ्य सहायिका हूँ। मैंने आपकी मेडिकल रिपोर्ट्स और डॉक्टर की सलाह को देखा है। आज आपकी तबीयत कैसी है? आप अपनी जांच रिपोर्ट, खान-पान या शिशु के बारे में कुछ भी पूछ सकती हैं।`;
      } else {
        return `Hello ${patientName}! I am your personal health assistant. I have reviewed your hospital lab reports and doctor notes. How are you feeling today? Ask me anything about your blood reports, diet, or baby.`;
      }
    } else {
      if (lang === 'te') {
        return `నమస్కారం! నేను మీ జన్మలింక్ క్లినికల్ సహాయకుడిని. ల్యాబ్ రిపోర్టులు, ఆహార నియమాలు, మందుల సమయాలు లేదా గర్భధారణ జాగ్రత్తల గురించి అడగండి.`;
      } else if (lang === 'hi') {
        return `नमस्ते! मैं आपका जन्मलिंक स्वास्थ्य सहायक हूँ। लैब रिपोर्ट्स, खान-पान, दवाइयों के नियम या गर्भावस्था की देखभाल के बारे में पूछें।`;
      } else {
        return `Hello! I am your JanmaLink Clinical Assistant. Ask me anything about lab reports, nutrition, symptoms, or pregnancy care.`;
      }
    }
  };

  // Chat State
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  // Reset or initialize welcome message on load or patient change
  useEffect(() => {
    setMessages([
      {
        id: 1,
        sender: 'assistant',
        text: getInitialMessage(language),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        advice: null
      }
    ]);
  }, [patientName, language]);

  // Report Prediction State
  const [reportForm, setReportForm] = useState({
    hemoglobin: patientContext?.vitals?.hb || patientContext?.vitals?.hemoglobin || 10.2,
    systolicBP: patientContext?.vitals?.bpSys || patientContext?.vitals?.systolicBP || 135,
    diastolicBP: patientContext?.vitals?.bpDia || patientContext?.vitals?.diastolicBP || 88,
    fastingGlucose: patientContext?.vitals?.bloodSugar || 88,
    ogtt2hr: 130,
    urineAlbumin: 'trace',
    fetalHeartRate: patientContext?.vitals?.fhr || 142,
    gestationalAge: patientContext?.currentPregnancy?.gestationWeeks || patientContext?.gestationalAge || 24,
    patientName: patientName || 'Maternal Patient'
  });
  const [predictLoading, setPredictLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [showRawMetrics, setShowRawMetrics] = useState(false); // Hidden by default

  // Sync with external open state if provided
  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  // Check Web Speech API support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
    }
    if ('speechSynthesis' in window) {
      setTtsSupported(true);
    }
  }, []);

  // Scroll to bottom on new chat messages
  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  // Handle Speech Recognition setup (Voice Input)
  const toggleListening = () => {
    if (!speechSupported) {
      alert('Speech Recognition is not supported on this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      // Configure language based on active selection
      if (language === 'te') {
        recognition.lang = 'te-IN';
      } else if (language === 'hi') {
        recognition.lang = 'hi-IN';
      } else {
        recognition.lang = 'en-IN';
      }

      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(r => r[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  // Handle Speech Synthesis (Speak Aloud through Speaker)
  const speakText = (text) => {
    if (!ttsSupported || !text) return;

    window.speechSynthesis.cancel(); // Stop any active speech

    const cleanText = text.replace(/[*#•_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    if (language === 'te') {
      utterance.lang = 'te-IN';
    } else if (language === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Pick appropriate voice if available
    const voices = window.speechSynthesis.getVoices();
    if (language === 'te') {
      const teVoice = voices.find(v => v.lang.includes('te') || v.name.toLowerCase().includes('telugu'));
      if (teVoice) utterance.voice = teVoice;
    } else if (language === 'hi') {
      const hiVoice = voices.find(v => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi'));
      if (hiVoice) utterance.voice = hiVoice;
    } else {
      const enVoice = voices.find(v => v.lang.includes('en-IN') || v.name.toLowerCase().includes('india'));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (ttsSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Submit Chat Query (Personal Assistant or General Clinical RAG)
  const handleSendMessage = async (textToSend = null) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setChatLoading(true);

    try {
      let result;
      
      // If patient is logged in, use the dedicated Personal Health Assistant
      if (patientId) {
        const historyPayload = messages.map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          text: m.text
        }));

        result = await askRagPersonalAssistant({
          patientId,
          query,
          conversationHistory: historyPayload,
          language
        });
      } else {
        // Fallback to general RAG chat
        result = await askRagChat({
          query,
          language,
          patientContext
        });
      }

      const assistantMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: result.answer,
        speechText: result.speechText,
        advice: result.advice,
        matchedTopic: result.matchedTopic || (patientName ? `Personal Health Record (${patientName})` : null),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Read aloud automatically if enabled
      if (autoSpeak && result.speechText) {
        speakText(result.speechText);
      }
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: language === 'te'
          ? 'క్షమించండి, సమాధానం పొందడంలో సమస్య ఎదురైంది. దయచేసి మళ్లీ ప్రయత్నించండి.'
          : language === 'hi'
          ? 'क्षमा करें, उत्तर प्राप्त करने में समस्या आई। कृपया पुनः प्रयास करें।'
          : 'Sorry, I encountered an issue retrieving that answer. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  // Submit Report-Based Prediction
  const handlePredictReport = async () => {
    setPredictLoading(true);
    try {
      const payload = {
        ...reportForm,
        language
      };
      const result = await predictRagReport(payload);
      setPredictionResult(result);

      if (autoSpeak && result.speechText) {
        speakText(result.speechText);
      }
    } catch (err) {
      alert(`Report prediction failed: ${err.message}`);
    } finally {
      setPredictLoading(false);
    }
  };

  // Presets for quick clinical demonstration
  const loadPreset = (presetType) => {
    if (presetType === 'normal') {
      setReportForm({
        hemoglobin: 12.4,
        systolicBP: 118,
        diastolicBP: 76,
        fastingGlucose: 84,
        ogtt2hr: 120,
        urineAlbumin: 'negative',
        fetalHeartRate: 140,
        gestationalAge: 24,
        patientName: patientName || 'Anitha Rao'
      });
    } else if (presetType === 'anemia') {
      setReportForm({
        hemoglobin: 9.2,
        systolicBP: 122,
        diastolicBP: 78,
        fastingGlucose: 86,
        ogtt2hr: 124,
        urineAlbumin: 'negative',
        fetalHeartRate: 138,
        gestationalAge: 26,
        patientName: patientName || 'Lakshmi Priya'
      });
    } else if (presetType === 'preeclampsia') {
      setReportForm({
        hemoglobin: 11.2,
        systolicBP: 152,
        diastolicBP: 98,
        fastingGlucose: 88,
        ogtt2hr: 132,
        urineAlbumin: '2+',
        fetalHeartRate: 154,
        gestationalAge: 32,
        patientName: patientName || 'Kavitha Devi'
      });
    } else if (presetType === 'gdm') {
      setReportForm({
        hemoglobin: 11.8,
        systolicBP: 124,
        diastolicBP: 82,
        fastingGlucose: 108,
        ogtt2hr: 168,
        urineAlbumin: 'negative',
        fetalHeartRate: 144,
        gestationalAge: 28,
        patientName: patientName || 'Swapna Varma'
      });
    }
  };

  // Dynamic suggested question chips
  const suggestedChips = patientName ? (
    language === 'te' ? [
      'నా తాజా రిపోర్టును తేలికగా వివరించండి',
      'నా హిమోగ్లోబిన్ పెరగడానికి ఇంట్లో ఏం తినాలి?',
      'నా రక్తపోటు (BP) మరియు బిడ్డ గుండె చప్పుడు ఎలా ఉంది?',
      'ఐరన్ మాత్ర ఎప్పుడు ఎలా వేసుకోవాలి?'
    ] : language === 'hi' ? [
      'मेरी ताज़ा रिपोर्ट को आसान भाषा में समझाइए',
      'हीमोग्लोबिन बढ़ाने के लिए रसोई में क्या खाएं?',
      'क्या मेरा ब्लड प्रेशर (BP) और शिशु की धड़कन ठीक है?',
      'आयरन की गोली किस समय और कैसे लेनी चाहिए?'
    ] : [
      'Explain my latest lab report in simple words',
      'What everyday kitchen foods will boost my Hemoglobin?',
      'Is my Blood Pressure and Baby Heart Rate normal?',
      'When and how should I take my iron tablets?'
    ]
  ) : (
    language === 'te' ? [
      'రక్తహీనత ఉన్నప్పుడు ఎలాంటి ఆహారం తీసుకోవాలి?',
      'బీపీ 145/95 ఉంది, ప్రమాదకరమా?',
      'గర్భధారణలో ప్రమాదకర లక్షణాలు ఏమిటి?',
      'షుగర్ నియంత్రణకు ఆహార నియమాలు?'
    ] : language === 'hi' ? [
      'एनीमिया में क्या आहार लेना चाहिए?',
      'ब्लड प्रेशर 145/95 है, क्या यह खतरनाक है?',
      'गर्भावस्था के खतरे के लक्षण क्या हैं?',
      'शुगर नियंत्रण के लिए घरेलू उपाय?'
    ] : [
      'What foods help with low Hemoglobin?',
      'BP is 145/95 mmHg, what should I do?',
      'What are emergency warning signs in pregnancy?',
      'What diet routine is best for Gestational Diabetes?'
    ]
  );

  return (
    <>
      {/* ── Global Floating Trigger Button (Circle-Based Interactive AI Chatbot) ── */}
      {!isOpen && externalIsOpen === undefined && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          {/* Interactive greeting speech bubble callout */}
          {showGreetingBubble && (
            <div 
              onClick={() => setIsOpen(true)}
              className="relative hidden sm:flex items-center gap-3 px-4 py-2.5 bg-white/95 hover:bg-white text-slate-800 rounded-2xl shadow-xl shadow-teal-900/10 border border-teal-100 backdrop-blur-md cursor-pointer transition-all duration-300 hover:scale-105 group select-none"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse relative">
                <span className="absolute -inset-0.5 rounded-full bg-emerald-400 animate-ping opacity-75"></span>
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-teal-800 flex items-center gap-1.5">
                  <span>
                    {patientName 
                      ? (language === 'te' ? `${patientName} AI సహాయకుడు` : language === 'hi' ? `${patientName} AI सहायक` : `${patientName}'s AI Copilot`)
                      : (language === 'te' ? 'జన్మలింక్ AI సహాయకుడు' : language === 'hi' ? 'जन्मलिंक AI सहायक' : 'JanmaLink AI Copilot')}
                  </span>
                  <span className="text-[10px] bg-teal-50 text-teal-700 px-1.5 py-0.2 rounded font-bold uppercase border border-teal-200/50">
                    {language === 'te' ? 'తెలుగు' : language === 'hi' ? 'हिंदी' : 'EN'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium leading-tight">
                  {language === 'te' 
                    ? 'ఏదైనా అడగండి లేదా మాట్లాడండి 👋' 
                    : language === 'hi' 
                    ? 'कोई भी सवाल पूछें या बोलें 👋' 
                    : 'Ask anything or tap to speak 👋'}
                </div>
              </div>

              {/* Mini dismiss button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGreetingBubble(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-0.5 -mr-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Chat bubble tail pointing right towards the circle */}
              <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white rotate-45 border-r border-t border-teal-100"></div>
            </div>
          )}

          {/* Circular Floating Action Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-teal-600 via-emerald-600 to-cyan-500 text-white shadow-2xl shadow-teal-800/40 hover:shadow-cyan-500/50 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center border-2 border-white/60 cursor-pointer group"
            title={patientName ? `${patientName}'s AI Copilot` : "JanmaLink Interactive AI Chatbot"}
            aria-label="Open AI Assistant"
          >
            {/* Glowing animated halo */}
            <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-emerald-400 via-teal-400 to-cyan-400 opacity-50 blur group-hover:opacity-90 animate-pulse transition duration-500" />

            {/* Inner circle with Robot Avatar & Sparkles */}
            <div className="relative flex items-center justify-center">
              <Bot className="w-7 h-7 sm:w-8 sm:h-8 text-white group-hover:rotate-6 transition-transform duration-300 drop-shadow-md" />
              <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
            </div>

            {/* Live active indicator badge */}
            <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white shadow-xs"></span>
            </span>

            {/* Bottom active language badge */}
            <span className="absolute -bottom-1 px-1.5 py-0.2 bg-slate-900/90 text-[9px] font-black text-cyan-300 rounded-full border border-teal-400/40 shadow-sm uppercase tracking-wider">
              {language === 'te' ? 'తె' : language === 'hi' ? 'हि' : 'EN'}
            </span>
          </button>
        </div>
      )}

      {/* ── Main Interactive Chatbot Widget / Modal ── */}
      {isOpen && (
        <div className={
          isExpanded
            ? "fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            : "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex justify-end items-end animate-in slide-in-from-bottom-6 fade-in duration-300"
        }>
          <div className={
            isExpanded
              ? "relative w-full max-w-4xl h-[94vh] max-h-[850px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800"
              : "relative w-[96vw] sm:w-[440px] md:w-[460px] h-[650px] max-h-[calc(100vh-3.5rem)] bg-white rounded-3xl shadow-2xl border border-teal-200/70 flex flex-col overflow-hidden text-slate-800 ring-1 ring-slate-900/10"
          }>
            
            {/* ── Modal Header ── */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-teal-700 via-cyan-800 to-slate-900 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                  <HeartPulse className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base leading-tight">
                      {patientName 
                        ? (language === 'te' ? `${patientName} వ్యక్తిగత ఆరోగ్య సహాయకుడు` : language === 'hi' ? `${patientName} व्यक्तिगत स्वास्थ्य सहायक` : `${patientName}'s Personal Health Assistant`)
                        : 'JanmaLink Clinical RAG Assistant'}
                    </h3>
                    {patientMotherId && (
                      <span className="text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>ID: {patientMotherId}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-cyan-200/90 leading-tight">
                    {language === 'te' 
                      ? 'సులువైన వివరణ • ఇంట్లో ఆహార చిట్కాలు • మందుల నియమాలు • వాయిస్ స్పీచ్' 
                      : language === 'hi'
                      ? 'आसान समझ • घरेलू पौष्टिक आहार • दवा नियम • बोलकर सुनें'
                      : 'Simple Explanations • Kitchen Food Remedies • Medication Routine • Voice Speech'}
                  </p>
                </div>
              </div>

              {/* Controls: 3-Way Language Toggle, Audio Stop, Auto-read, Maximize/Dock, Close */}
              <div className="flex items-center gap-2">
                {/* 3-Language Selector */}
                <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/20">
                  <button
                    onClick={() => { setLanguage('te'); stopSpeaking(); }}
                    className={`px-2 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${language === 'te' ? 'bg-emerald-500 text-white shadow-xs' : 'text-cyan-200 hover:text-white'}`}
                  >
                    తెలుగు
                  </button>
                  <button
                    onClick={() => { setLanguage('hi'); stopSpeaking(); }}
                    className={`px-2 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${language === 'hi' ? 'bg-emerald-500 text-white shadow-xs' : 'text-cyan-200 hover:text-white'}`}
                  >
                    हिंदी
                  </button>
                  <button
                    onClick={() => { setLanguage('en'); stopSpeaking(); }}
                    className={`px-2 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${language === 'en' ? 'bg-emerald-500 text-white shadow-xs' : 'text-cyan-200 hover:text-white'}`}
                  >
                    EN
                  </button>
                </div>

                {/* Speaker Audio Stop button if speaking */}
                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold animate-pulse shadow-md cursor-pointer"
                    title="Stop Speaker Audio"
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Stop</span>
                  </button>
                )}

                {/* Auto-read toggle */}
                <button
                  onClick={() => setAutoSpeak(!autoSpeak)}
                  className={`p-2 rounded-lg border text-xs transition-colors cursor-pointer ${autoSpeak ? 'bg-emerald-500/30 border-emerald-400/40 text-emerald-200' : 'bg-white/5 border-white/10 text-white/50'}`}
                  title={autoSpeak ? 'Auto-Read Audio is ON' : 'Auto-Read Audio is OFF'}
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                {/* Maximize / Dock toggle */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer hidden sm:flex items-center justify-center"
                  title={isExpanded ? 'Dock to corner' : 'Expand full screen'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => {
                    stopSpeaking();
                    if (recognitionRef.current) recognitionRef.current.stop();
                    if (externalOnClose) externalOnClose();
                    setIsOpen(false);
                  }}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                  title="Close Assistant"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Privacy Notification Banner for Personal Patient Assistant */}
            {patientName && (
              <div className="bg-emerald-50/90 border-b border-emerald-200 px-4 py-1.5 flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="font-medium">
                    {language === 'te' 
                      ? `గోప్యతా భద్రత: మీ (${patientName}) రికార్డులు మాత్రమే విశ్లేషించబడుతున్నాయి. ఇతర రోగుల వివరాలు ఖచ్చితంగా నిరోధించబడ్డాయి.` 
                      : language === 'hi'
                      ? `गोपनीयता सुरक्षा: केवल आपका (${patientName}) व्यक्तिगत रिकॉर्ड विश्लेषण किया जा रहा है। अन्य मरीजों का डेटा पूरी तरह सुरक्षित व प्रतिबंधित है।`
                      : `Privacy Guard: Securely isolated to ${patientName}'s medical record. Zero cross-patient access allowed.`}
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  Active Patient Record
                </span>
              </div>
            )}

            {/* ── Navigation Tabs ── */}
            <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 pt-2">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'chat'
                    ? 'border-teal-600 text-teal-800 bg-white rounded-t-lg shadow-sm'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>
                  {language === 'te' ? 'వ్యక్తిగత సంభాషణ & వాయిస్' : language === 'hi' ? 'व्यक्तिगत बातचीत व आवाज' : 'Personal Chat & Voice'}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('predict')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'predict'
                    ? 'border-teal-600 text-teal-800 bg-white rounded-t-lg shadow-sm'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>
                  {language === 'te' ? 'రిపోర్ట్ విశ్లేషణ & సలహాలు' : language === 'hi' ? 'रिपोर्ट विश्लेषण व सलाह' : 'Report Analysis & Guidance'}
                </span>
              </button>
            </div>

            {/* ── Active Speaking Equalizer Banner ── */}
            {isSpeaking && (
              <div className="bg-cyan-50 border-b border-cyan-200 px-4 py-1.5 flex items-center justify-between text-xs text-cyan-900">
                <div className="flex items-center gap-2">
                  <div className="flex items-end gap-0.5 h-3.5">
                    <span className="w-1 bg-teal-600 animate-pulse h-2 rounded-full" />
                    <span className="w-1 bg-teal-600 animate-bounce h-3 rounded-full" />
                    <span className="w-1 bg-teal-600 animate-pulse h-1.5 rounded-full" />
                    <span className="w-1 bg-teal-600 animate-bounce h-3.5 rounded-full" />
                  </div>
                  <span className="font-semibold">
                    {language === 'te' 
                      ? 'స్పీకర్ ద్వారా సమాధానం స్పష్టంగా చదువుతోంది...' 
                      : language === 'hi'
                      ? 'स्पीकर द्वारा उत्तर पढ़ा जा रहा है...'
                      : 'Reading response aloud through speaker...'}
                  </span>
                </div>
                <button
                  onClick={stopSpeaking}
                  className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                >
                  {language === 'te' ? 'ఆపు' : language === 'hi' ? 'रोकें' : 'Stop Audio'}
                </button>
              </div>
            )}

            {/* ── TAB 1: CONTINUOUS CHAT & VOICE ASSISTANT ── */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => {
                    const isUser = msg.sender === 'user';
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isUser && (
                          <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                            <Bot className="w-4 h-4" />
                          </div>
                        )}

                        <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                          isUser 
                            ? 'bg-gradient-to-r from-teal-600 to-cyan-700 text-white rounded-br-none' 
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                        }`}>
                          {/* Grounded Badge */}
                          {msg.matchedTopic && (
                            <div className="text-[10px] font-bold uppercase tracking-wider text-teal-600 mb-1.5 flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              <span>{msg.matchedTopic}</span>
                            </div>
                          )}

                          {/* Message Body */}
                          <div className="text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.text}
                          </div>

                          {/* Actionable Advice Cards if returned */}
                          {msg.advice && (
                            <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                              {/* Food Choices */}
                              {msg.advice.foods?.length > 0 && (
                                <div className="bg-emerald-50/90 p-3 rounded-xl border border-emerald-100">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-1.5">
                                    <Apple className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>
                                      {language === 'te' ? 'ఇంట్లో తినవలసిన పోషకాహారం:' : language === 'hi' ? 'रसोई के पौष्टिक आहार:' : 'Recommended Kitchen Foods:'}
                                    </span>
                                  </div>
                                  <ul className="text-xs text-emerald-900 space-y-1 list-disc list-inside">
                                    {msg.advice.foods.slice(0, 4).map((f, i) => (
                                      <li key={i}>{f}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Medication Routine */}
                              {msg.advice.medicationRoutine?.length > 0 && (
                                <div className="bg-amber-50/90 p-3 rounded-xl border border-amber-100">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1.5">
                                    <Pill className="w-3.5 h-3.5 text-amber-700" />
                                    <span>
                                      {language === 'te' ? 'మందుల సమయపాలన & అలవాట్లు:' : language === 'hi' ? 'दवाइयों का सही नियम:' : 'Medication Routine & Regularity:'}
                                    </span>
                                  </div>
                                  <ul className="text-xs text-amber-900 space-y-1 list-disc list-inside">
                                    {msg.advice.medicationRoutine.slice(0, 3).map((m, i) => (
                                      <li key={i}>{m}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Message Footer: Timestamp + Read Aloud Speaker Button */}
                          <div className={`mt-2.5 flex items-center justify-between text-[11px] ${isUser ? 'text-cyan-100' : 'text-slate-400'}`}>
                            <span>{msg.timestamp}</span>

                            {!isUser && (
                              <button
                                onClick={() => speakText(msg.speechText || msg.text)}
                                className="flex items-center gap-1.5 text-teal-700 hover:text-teal-900 font-bold px-2.5 py-1 rounded-md bg-teal-50 hover:bg-teal-100 transition-colors cursor-pointer"
                                title="Listen to this explanation aloud via speaker"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>{language === 'te' ? '🔊 వినిపించు' : language === 'hi' ? '🔊 बोलकर सुनाएं' : '🔊 Listen'}</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {isUser && (
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                            <span className="text-xs font-bold">You</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {chatLoading && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
                      <span>
                        {language === 'te' 
                          ? 'మీ వ్యక్తిగత రికార్డులను పరిశీలించి సమాధానం తయారుచేస్తోంది...' 
                          : language === 'hi'
                          ? 'आपके रिकॉर्ड का विश्लेषण कर उत्तर तैयार किया जा रहा है...'
                          : 'Analyzing personal patient records...'}
                      </span>
                    </div>
                  )}

                  <div ref={chatBottomRef} />
                </div>

                {/* Suggested Question Chips */}
                <div className="p-2.5 bg-slate-100/70 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
                  <span className="text-slate-400 text-[11px] font-semibold whitespace-nowrap">
                    {language === 'te' ? 'అడగండి:' : language === 'hi' ? 'पूछें:' : 'Suggestions:'}
                  </span>
                  {suggestedChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip)}
                      className="whitespace-nowrap px-3 py-1 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 rounded-full border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Input Bar with Voice Microphone and Speaker */}
                <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                  {/* Voice Microphone Input Button */}
                  <button
                    onClick={toggleListening}
                    className={`relative p-3 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      isListening
                        ? 'bg-rose-500 border-rose-600 text-white animate-pulse shadow-lg shadow-rose-500/25'
                        : 'bg-slate-100 hover:bg-teal-50 border-slate-200 text-slate-700 hover:text-teal-700'
                    }`}
                    title={isListening 
                      ? (language === 'te' ? 'రికార్డింగ్ ఆపు' : language === 'hi' ? 'रिकॉर्डिंग रोकें' : 'Stop Listening') 
                      : (language === 'te' ? 'వాయిస్ ఇన్‌పుట్ ప్రారంభించు (మైక్)' : language === 'hi' ? 'माइक से बोलें' : 'Start Voice Input (Mic)')}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-5 h-5" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-400 rounded-full animate-ping" />
                      </>
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </button>

                  {/* Input field */}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendMessage();
                      }}
                      placeholder={
                        isListening
                          ? (language === 'te' ? 'వింటున్నాము... మాట్లాడండి...' : language === 'hi' ? 'सुन रहे हैं... बोलिए...' : 'Listening... speak now...')
                          : (language === 'te' ? 'మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి లేదా మైక్ ద్వారా మాట్లాడండి...' : language === 'hi' ? 'अपना प्रश्न लिखें या माइक से बोलें...' : 'Type your question or speak via mic...')
                      }
                      className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                    />
                    {inputText && (
                      <button
                        onClick={() => setInputText('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() || chatLoading}
                    className="p-3 bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 disabled:opacity-40 text-white rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer"
                    title="Send Message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* ── TAB 2: REPORT-BASED RISK PREDICTION (RAG) ── */}
            {activeTab === 'predict' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 space-y-6">
                
                {/* Clinical Demonstration Presets */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>{language === 'te' ? 'రిపోర్ట్ నమూనా ఎంపిక (క్లినికల్ ప్రీసెట్లు)' : language === 'hi' ? 'रिपोर्ट नमूना चयन (प्रीसेट)' : 'Sample Report Presets (Quick Clinical Demos)'}</span>
                    </div>
                    <span className="text-[11px] text-teal-600 font-semibold">{language === 'te' ? 'క్లినికల్ మార్గదర్శకాలు' : language === 'hi' ? 'नैदानिक दिशानिर्देश' : 'Clinical Guidelines'}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={() => loadPreset('normal')}
                      className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-left transition-colors cursor-pointer"
                    >
                      <div className="text-xs font-bold text-emerald-800">Normal Baseline</div>
                      <div className="text-[10px] text-emerald-600">Hb 12.4, BP 118/76</div>
                    </button>
                    <button
                      onClick={() => loadPreset('anemia')}
                      className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 text-left transition-colors cursor-pointer"
                    >
                      <div className="text-xs font-bold text-amber-800">Maternal Anemia</div>
                      <div className="text-[10px] text-amber-600">Hb 9.2, Pallor</div>
                    </button>
                    <button
                      onClick={() => loadPreset('preeclampsia')}
                      className="p-2.5 rounded-lg border border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 text-left transition-colors cursor-pointer"
                    >
                      <div className="text-xs font-bold text-rose-800">Preeclampsia Risk</div>
                      <div className="text-[10px] text-rose-600">BP 152/98, Alb 2+</div>
                    </button>
                    <button
                      onClick={() => loadPreset('gdm')}
                      className="p-2.5 rounded-lg border border-purple-200 bg-purple-50/60 hover:bg-purple-100/70 text-left transition-colors cursor-pointer"
                    >
                      <div className="text-xs font-bold text-purple-800">Gestational Diabetes</div>
                      <div className="text-[10px] text-purple-600">Fast 108, OGTT 168</div>
                    </button>
                  </div>
                </div>

                {/* Report Form Parameters */}
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-teal-600" />
                      <span>{language === 'te' ? 'ల్యాబ్ రిపోర్ట్ వివరాలు (ఇన్‌పుట్)' : language === 'hi' ? 'लैब रिपोर्ट विवरण' : 'Lab Report Parameters (Source Values)'}</span>
                    </h4>
                    <span className="text-xs text-slate-500">
                      Patient: <strong className="text-slate-700">{reportForm.patientName}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Hemoglobin (g/dL)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={reportForm.hemoglobin}
                        onChange={(e) => setReportForm({ ...reportForm, hemoglobin: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-teal-500 focus:bg-white"
                      />
                      <span className="text-[10px] text-slate-400">Ref: ≥ 10.5–11.0</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Systolic BP (mmHg)
                      </label>
                      <input
                        type="number"
                        value={reportForm.systolicBP}
                        onChange={(e) => setReportForm({ ...reportForm, systolicBP: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-teal-500 focus:bg-white"
                      />
                      <span className="text-[10px] text-slate-400">Ref: &lt; 140 mmHg</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Diastolic BP (mmHg)
                      </label>
                      <input
                        type="number"
                        value={reportForm.diastolicBP}
                        onChange={(e) => setReportForm({ ...reportForm, diastolicBP: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-teal-500 focus:bg-white"
                      />
                      <span className="text-[10px] text-slate-400">Ref: &lt; 90 mmHg</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Urine Albumin
                      </label>
                      <select
                        value={reportForm.urineAlbumin}
                        onChange={(e) => setReportForm({ ...reportForm, urineAlbumin: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-teal-500 focus:bg-white"
                      >
                        <option value="negative">Negative</option>
                        <option value="trace">Trace</option>
                        <option value="1+">1+</option>
                        <option value="2+">2+</option>
                        <option value="3+">3+</option>
                      </select>
                      <span className="text-[10px] text-slate-400">Ref: Negative</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Fasting Glucose (mg/dL)
                      </label>
                      <input
                        type="number"
                        value={reportForm.fastingGlucose}
                        onChange={(e) => setReportForm({ ...reportForm, fastingGlucose: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-teal-500 focus:bg-white"
                      />
                      <span className="text-[10px] text-slate-400">Ref: &lt; 92 mg/dL</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        2-Hr OGTT (mg/dL)
                      </label>
                      <input
                        type="number"
                        value={reportForm.ogtt2hr}
                        onChange={(e) => setReportForm({ ...reportForm, ogtt2hr: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-teal-500 focus:bg-white"
                      />
                      <span className="text-[10px] text-slate-400">Ref: &lt; 153 mg/dL</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Fetal Heart Rate (bpm)
                      </label>
                      <input
                        type="number"
                        value={reportForm.fetalHeartRate}
                        onChange={(e) => setReportForm({ ...reportForm, fetalHeartRate: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-teal-500 focus:bg-white"
                      />
                      <span className="text-[10px] text-slate-400">Ref: 110–160 bpm</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Gestational Age (Wks)
                      </label>
                      <input
                        type="number"
                        value={reportForm.gestationalAge}
                        onChange={(e) => setReportForm({ ...reportForm, gestationalAge: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-teal-500 focus:bg-white"
                      />
                      <span className="text-[10px] text-slate-400">Trimester marker</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handlePredictReport}
                      disabled={predictLoading}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 text-white rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {predictLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>
                            {language === 'te' ? 'విశ్లేషిస్తోంది...' : language === 'hi' ? 'विश्लेषण हो रहा है...' : 'Analyzing Health Indicators...'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>
                            {language === 'te' ? 'రిపోర్ట్ విశ్లేషించి సులువుగా వివరించు' : language === 'hi' ? 'रिपोर्ट समझें व सलाह प्राप्त करें' : 'Analyze Report & Generate Guidance'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* ── Prediction Result & Simplified Guidance ── */}
                {predictionResult && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    
                    {/* Risk Status Header Card */}
                    <div className={`p-4 sm:p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
                      predictionResult.overallRisk === 'high'
                        ? 'bg-rose-50 border-rose-200 text-rose-950'
                        : predictionResult.overallRisk === 'moderate'
                        ? 'bg-amber-50 border-amber-200 text-amber-950'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    }`}>
                      <div className="flex items-start gap-3">
                        {predictionResult.overallRisk === 'high' ? (
                          <AlertTriangle className="w-7 h-7 text-rose-600 flex-shrink-0 mt-0.5" />
                        ) : predictionResult.overallRisk === 'moderate' ? (
                          <AlertTriangle className="w-7 h-7 text-amber-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-7 h-7 text-emerald-600 flex-shrink-0 mt-0.5" />
                        )}

                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                              predictionResult.overallRisk === 'high'
                                ? 'bg-rose-600 text-white'
                                : predictionResult.overallRisk === 'moderate'
                                ? 'bg-amber-600 text-white'
                                : 'bg-emerald-600 text-white'
                            }`}>
                              {predictionResult.riskLabel}
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              {predictionResult.conditionTitle}
                            </span>
                          </div>

                          {predictionResult.riskFactors?.length > 0 ? (
                            <p className="text-xs mt-1 text-slate-600 font-medium">
                              Signals: {predictionResult.riskFactors.join(' • ')}
                            </p>
                          ) : (
                            <p className="text-xs mt-1 text-slate-600 font-medium">
                              {language === 'te' 
                                ? 'అన్ని ముఖ్యమైన ఆరోగ్య సూచికలు సాధారణ పరిధిలో ఉన్నాయి.' 
                                : language === 'hi' 
                                ? 'सभी स्वास्थ्य संकेत सामान्य सुरक्षित सीमा में हैं।' 
                                : 'All maternal health indicators are within healthy normal ranges.'}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Read Aloud Button */}
                      <button
                        onClick={() => speakText(predictionResult.speechText)}
                        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 shadow-sm transition-colors whitespace-nowrap self-start sm:self-center cursor-pointer"
                        title="Read this report prediction aloud via speaker"
                      >
                        <Volume2 className="w-4 h-4 text-teal-600" />
                        <span>{language === 'te' ? '🔊 మొత్తం వినిపించు' : language === 'hi' ? '🔊 पूरा बोलकर सुनाएं' : '🔊 Read Aloud via Speaker'}</span>
                      </button>
                    </div>

                    {/* ── SIMPLIFIED ADVICE & GUIDANCE (SHOWN FIRST & CLEARLY) ── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* 1. What the issue is (plain language) */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 pb-1 border-b border-slate-100">
                          <HelpCircle className="w-4 h-4 text-teal-600" />
                          <span>{language === 'te' ? 'సులువైన వివరణ (సమస్య ఏమిటి?)' : language === 'hi' ? 'आसान समझ (बात क्या है?)' : 'Simple Explanation'}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {predictionResult.advice.issue}
                        </p>
                      </div>

                      {/* 2. Recommended Food Choices */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 pb-1 border-b border-slate-100">
                          <Apple className="w-4 h-4 text-emerald-600" />
                          <span>{language === 'te' ? 'ఇంట్లో తినవలసిన పోషకాహారం' : language === 'hi' ? 'रसोई के पौष्टिक आहार' : 'Kitchen Foods & Nutrition'}</span>
                        </div>
                        <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                          {predictionResult.advice.foods?.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>

                      {/* 3. Medication & Remedy Routine */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-800 pb-1 border-b border-slate-100">
                          <Pill className="w-4 h-4 text-amber-600" />
                          <span>{language === 'te' ? 'మందుల సమయపాలన & అలవాట్లు' : language === 'hi' ? 'दवाइयों का सही नियम' : 'Medication Routine & Regularity'}</span>
                        </div>
                        <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                          {predictionResult.advice.medicationRoutine?.map((m, i) => (
                            <li key={i}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Escalation Warning */}
                    {predictionResult.advice.escalation && (
                      <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold">{language === 'te' ? 'వైద్యుల హెచ్చరిక:' : language === 'hi' ? 'चिकित्सकीय सलाह:' : 'Clinical Escalation Notice:'} </strong>
                          <span>{predictionResult.advice.escalation}</span>
                        </div>
                      </div>
                    )}

                    {/* Hidden by default: Collapsed optional metric toggle */}
                    <div className="pt-1">
                      <button
                        onClick={() => setShowRawMetrics(!showRawMetrics)}
                        className="text-xs text-slate-400 hover:text-teal-700 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>{showRawMetrics 
                          ? (language === 'te' ? '▲ ల్యాబ్ కొలతల పట్టికను దాచు' : language === 'hi' ? '▲ लैब माप तालिका छिपाएं' : '▲ Hide Lab Test Metrics') 
                          : (language === 'te' ? '▼ ల్యాబ్ కొలతల పట్టికను చూడండి (ఐచ్ఛికం)' : language === 'hi' ? '▼ लैब टेस्ट माप देखें (वैकल्पिक)' : '▼ View Lab Test Metrics (Optional)')}</span>
                      </button>

                      {showRawMetrics && (
                        <div className="mt-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs animate-in fade-in">
                          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
                            {language === 'te' ? 'ల్యాబ్ కొలతల నివేదిక' : language === 'hi' ? 'लैब टेस्ट माप रिपोर्ट' : 'Recorded Lab Test Metrics'}
                          </div>
                          <div className="divide-y divide-slate-100 text-xs">
                            {predictionResult.metricResults?.map((m, idx) => (
                              <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50/50">
                                <div>
                                  <div className="font-semibold text-slate-800">{m.metric}</div>
                                  <div className="text-[11px] text-slate-400">Ref: {m.reference}</div>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-slate-900">{m.value}</span>
                                  <div className={`text-[10px] font-bold ${
                                    m.risk === 'high' ? 'text-rose-600' : m.risk === 'moderate' ? 'text-amber-600' : 'text-emerald-600'
                                  }`}>
                                    {m.status}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* ── Modal Footer ── */}
            <div className="px-4 py-2.5 bg-slate-100/90 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-teal-600" />
                <span>
                  {patientName 
                    ? `Personal Assistant • Data strictly restricted to ${patientName}` 
                    : 'JanmaLink Clinical AI Assistant • Voice & Report Guidance'}
                </span>
              </span>
              <span className="text-[10px] text-slate-400">
                Spoken Interaction & Audio Speaker (Telugu • Hindi • English)
              </span>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
