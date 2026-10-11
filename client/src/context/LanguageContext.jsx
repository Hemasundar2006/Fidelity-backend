import React, { createContext, useContext, useState, useEffect } from 'react';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
];

const detectLanguage = () => {
  const saved = localStorage.getItem('jl_lang');
  if (saved && SUPPORTED_LANGUAGES.find(l => l.code === saved)) return saved;
  const browserLang = navigator.language || navigator.userLanguage || 'en';
  if (browserLang.startsWith('te')) return 'te';
  if (browserLang.startsWith('hi')) return 'hi';
  return 'en';
};

export const TRANSLATIONS = {
  en: {
    loading: 'Loading...', save: 'Save', cancel: 'Cancel', submit: 'Submit', close: 'Close',
    back: 'Back', next: 'Next', search: 'Search', upload: 'Upload', download: 'Download',
    delete: 'Delete', edit: 'Edit', view: 'View', add: 'Add', update: 'Update',
    confirm: 'Confirm', yes: 'Yes', no: 'No', error: 'Error', success: 'Success',
    warning: 'Warning', info: 'Information', noData: 'No data available', selectLanguage: 'Language',
    dashboard: 'Dashboard', patients: 'Patients', babies: 'Babies', reports: 'Reports',
    settings: 'Settings', logout: 'Logout', profile: 'Profile', notifications: 'Notifications',
    patientDirectory: 'Patient Directory', registerMother: 'Register Mother',
    babyDirectory: 'Baby Directory', registerBaby: 'Register Baby',
    fetalMonitor: 'Fetal Monitor', riskPredictor: 'Risk Predictor',
    opdDashboard: 'OPD Dashboard', clinicalDashboard: 'Clinical Dashboard',
    wardDashboard: 'Ward Dashboard', labQueue: 'Lab Queue', pharmacyQueue: 'Pharmacy Queue',
    adminOverview: 'Admin Overview', systemAdmin: 'System Admin',
    platformOverview: 'Platform Overview', partnerHospitals: 'Partner Hospitals',
    platformOfferings: 'Platform Offerings', systemLogs: 'System Logs',
    hero_title: 'Smart Maternal & Neonatal Health Platform',
    hero_subtitle: 'AI-powered clinical decision support for safer motherhood and newborn care.',
    hero_cta: 'Book Consultation', hero_cta2: 'Staff Login', hero_portal: 'Patient Portal',
    features_title: 'Everything You Need for Maternal Care',
    features_subtitle: 'From registration to delivery and beyond — JanmaLink connects all care touchpoints.',
    stats_patients: 'Patients Registered', stats_deliveries: 'Safe Deliveries',
    stats_hospitals: 'Partner Hospitals', stats_accuracy: 'AI Accuracy',
    patientProfile: 'Patient Profile', clinicalSummary: 'Clinical Summary',
    activeAlerts: 'Active Alerts', longitudinalTimeline: 'Patient Longitudinal Timeline',
    uploadReport: 'Upload Report', trackPregnancy: 'Track Pregnancy',
    voiceCopilot: 'Voice Copilot', aiRiskAnalyzer: 'AI Risk Analyzer',
    prescriptionReader: 'Prescription Reader', scanPrescription: 'Scan Prescription',
    prescriptionReaderTitle: 'AI Prescription Reader',
    prescriptionReaderSubtitle: 'Upload or photograph a prescription to get medication details, dosage information and health tips in your language.',
    uploadPrescription: 'Upload Prescription Image', takePicture: 'Take Picture',
    analyzing: 'Analyzing prescription...', medicationDetails: 'Medication Details',
    medicationTips: 'Medication Tips & Remedies', prescriptionLanguage: 'Prescription Language',
    detectedMedications: 'Detected Medications', dosageInstructions: 'Dosage Instructions',
    sideEffects: 'Side Effects to Watch', dietaryAdvice: 'Dietary Advice',
    importantReminders: 'Important Reminders', homeRemedies: 'Home Remedies',
    labReports: 'Lab Reports', reportHistory: 'Report History',
    uploadNewReport: 'Upload New Report', reportDate: 'Report Date',
    reportType: 'Report Type', generatePdf: 'Generate PDF',
    aiCopilot: 'AI Copilot', askQuestion: 'Ask a question...', sendMessage: 'Send Message',
    voiceInput: 'Voice Input', stopListening: 'Stop Listening', speak: 'Speak',
    stopSpeaking: 'Stop Speaking', reportPrediction: 'Report Prediction', predict: 'Predict Risk',
    myHealth: 'My Health', myReports: 'My Reports', myBaby: 'My Baby',
    mySafety: 'My Safety', myAppointments: 'My Appointments',
    loginWithPhone: 'Login with Phone', enterOtp: 'Enter OTP', sendOtp: 'Send OTP',
    verifyOtp: 'Verify OTP', welcomeBack: 'Welcome Back', yourHealthSummary: 'Your Health Summary',
    bookConsultation: 'Book Consultation', selectDoctor: 'Select Doctor',
    selectDate: 'Select Date', selectTime: 'Select Time Slot',
    patientName: 'Patient Name', phoneNumber: 'Phone Number',
    bookAppointment: 'Book Appointment', appointmentBooked: 'Appointment Booked Successfully!',
    registerNewMother: 'Register New Mother', personalDetails: 'Personal Details',
    medicalHistory: 'Medical History', pregnancyDetails: 'Pregnancy Details',
    fullName: 'Full Name', dateOfBirth: 'Date of Birth', bloodGroup: 'Blood Group',
    address: 'Address', city: 'City', state: 'State', husbandName: "Husband's Name",
    emergencyContact: 'Emergency Contact', pregnancyTracker: 'Pregnancy Tracker',
    gestationalAge: 'Gestational Age', weeks: 'weeks', trimester: 'Trimester',
    edd: 'Expected Delivery Date', fetalHeartRate: 'Fetal Heart Rate',
    bloodPressure: 'Blood Pressure', weight: 'Weight', hemoglobin: 'Hemoglobin',
    highRisk: 'High Risk', midRisk: 'Mid Risk', lowRisk: 'Low Risk',
    active: 'Active', delivered: 'Delivered', normal: 'Normal', critical: 'Critical',
    doctor: 'Doctor', nurse: 'Nurse', receptionist: 'Receptionist',
    lab: 'Lab Technician', pharmacy: 'Pharmacist', admin: 'Administrator', superadmin: 'Super Admin',
    shareWithPatient: 'Share with Patient Portal', addClinicalNote: 'Add Clinical Precaution / Note',
    sharePrecaution: 'Share Precaution', uploadDiagnostic: 'Upload Diagnostic Record',
    openOcrScanner: 'Open OCR Report Scanner', openPrescriptionReader: 'Open Prescription Reader',
    reportExchange: 'ABDM Report Exchange', linkAbha: 'Link ABHA Number',
    activeAbdmConsents: 'Active ABDM Consents', importClinicalRecords: 'Import Clinical Records from ABDM',
    pregnancyWeek: 'Pregnancy Week', daysLeft: 'days left', nextVisit: 'Next Visit',
    medications: 'Medications', vaccinations: 'Vaccinations', appointmentsTab: 'Appointments',
    healthTips: 'Health Tips', babyMovement: 'Baby Movement', weightGain: 'Weight Gain',
    viewDetails: 'View Details', downloadReport: 'Download Report', shareReport: 'Share Report',
  },
  te: {
    loading: 'లోడవుతోంది...', save: 'సేవ్ చేయండి', cancel: 'రద్దు చేయండి', submit: 'సమర్పించండి',
    close: 'మూసివేయండి', back: 'వెనుకకు', next: 'తదుపరి', search: 'వెతకండి',
    upload: 'అప్‌లోడ్ చేయండి', download: 'డౌన్‌లోడ్ చేయండి', delete: 'తొలగించండి',
    edit: 'సవరించండి', view: 'చూడండి', add: 'జోడించండి', update: 'నవీకరించండి',
    confirm: 'నిర్ధారించండి', yes: 'అవును', no: 'లేదు', error: 'లోపం',
    success: 'విజయవంతం', warning: 'హెచ్చరిక', info: 'సమాచారం',
    noData: 'డేటా అందుబాటులో లేదు', selectLanguage: 'భాష',
    dashboard: 'డాష్‌బోర్డ్', patients: 'రోగులు', babies: 'శిశువులు', reports: 'నివేదికలు',
    settings: 'సెట్టింగ్స్', logout: 'నిష్క్రమించు', profile: 'ప్రొఫైల్',
    notifications: 'నోటిఫికేషన్లు', patientDirectory: 'రోగుల డైరెక్టరీ',
    registerMother: 'తల్లిని నమోదు చేయండి', babyDirectory: 'శిశువుల డైరెక్టరీ',
    registerBaby: 'శిశువును నమోదు చేయండి', fetalMonitor: 'గర్భస్థ పర్యవేక్షణ',
    riskPredictor: 'ప్రమాద అంచనాకారి', opdDashboard: 'OPD డాష్‌బోర్డ్',
    clinicalDashboard: 'క్లినికల్ డాష్‌బోర్డ్', wardDashboard: 'వార్డ్ డాష్‌బోర్డ్',
    labQueue: 'ల్యాబ్ క్యూ', pharmacyQueue: 'ఫార్మసీ క్యూ',
    adminOverview: 'అడ్మిన్ అవలోకనం', systemAdmin: 'సిస్టమ్ అడ్మిన్',
    platformOverview: 'ప్లాట్‌ఫారమ్ అవలోకనం', partnerHospitals: 'భాగస్వామ్య ఆసుపత్రులు',
    platformOfferings: 'ప్లాట్‌ఫారమ్ సేవలు', systemLogs: 'సిస్టమ్ లాగ్‌లు',
    hero_title: 'స్మార్ట్ మాతృ మరియు నవజాత శిశు ఆరోగ్య వేదిక',
    hero_subtitle: 'సురక్షిత మాతృత్వం మరియు నవజాత శిశు సంరక్షణ కోసం AI-శక్తితో కూడిన క్లినికల్ నిర్ణయ మద్దతు.',
    hero_cta: 'సంప్రదింపు బుక్ చేయండి', hero_cta2: 'సిబ్బంది లాగిన్', hero_portal: 'రోగి పోర్టల్',
    features_title: 'మాతృ సంరక్షణ కోసం మీకు అవసరమైన అన్నీ',
    features_subtitle: 'నమోదు నుండి ప్రసవం మరియు ఆపై వరకు — JanmaLink అన్ని సంరక్షణ కేంద్రాలను కలుపుతుంది.',
    stats_patients: 'నమోదైన రోగులు', stats_deliveries: 'సురక్షిత ప్రసవాలు',
    stats_hospitals: 'భాగస్వామ్య ఆసుపత్రులు', stats_accuracy: 'AI ఖచ్చితత్వం',
    patientProfile: 'రోగి ప్రొఫైల్', clinicalSummary: 'క్లినికల్ సారాంశం',
    activeAlerts: 'చురుకైన హెచ్చరికలు', longitudinalTimeline: 'రోగి దీర్ఘకాల కాలరేఖ',
    uploadReport: 'నివేదిక అప్‌లోడ్ చేయండి', trackPregnancy: 'గర్భధారణ ట్రాక్ చేయండి',
    voiceCopilot: 'వాయిస్ కోపైలట్', aiRiskAnalyzer: 'AI ప్రమాద విశ్లేషకుడు',
    prescriptionReader: 'ప్రిస్క్రిప్షన్ రీడర్', scanPrescription: 'ప్రిస్క్రిప్షన్ స్కాన్ చేయండి',
    prescriptionReaderTitle: 'AI ప్రిస్క్రిప్షన్ రీడర్',
    prescriptionReaderSubtitle: 'మీ భాషలో మందుల వివరాలు మరియు ఆరోగ్య చిట్కాలు పొందడానికి ప్రిస్క్రిప్షన్ అప్‌లోడ్ చేయండి లేదా ఫోటో తీయండి.',
    uploadPrescription: 'ప్రిస్క్రిప్షన్ చిత్రం అప్‌లోడ్ చేయండి', takePicture: 'చిత్రం తీయండి',
    analyzing: 'ప్రిస్క్రిప్షన్ విశ్లేషిస్తోంది...', medicationDetails: 'మందుల వివరాలు',
    medicationTips: 'మందుల చిట్కాలు మరియు నివారణలు', prescriptionLanguage: 'ప్రిస్క్రిప్షన్ భాష',
    detectedMedications: 'గుర్తించిన మందులు', dosageInstructions: 'మోతాదు సూచనలు',
    sideEffects: 'గమనించవలసిన దుష్ప్రభావాలు', dietaryAdvice: 'ఆహార సలహా',
    importantReminders: 'ముఖ్యమైన రిమైండర్లు', homeRemedies: 'ఇంటి నివారణలు',
    labReports: 'ల్యాబ్ నివేదికలు', reportHistory: 'నివేదిక చరిత్ర',
    uploadNewReport: 'కొత్త నివేదిక అప్‌లోడ్ చేయండి', reportDate: 'నివేదిక తేదీ',
    reportType: 'నివేదిక రకం', generatePdf: 'PDF రూపొందించండి',
    aiCopilot: 'AI కోపైలట్', askQuestion: 'ప్రశ్న అడగండి...', sendMessage: 'సందేశం పంపండి',
    voiceInput: 'వాయిస్ ఇన్‌పుట్', stopListening: 'వినడం ఆపండి', speak: 'మాట్లాడండి',
    stopSpeaking: 'మాట్లాడడం ఆపండి', reportPrediction: 'నివేదిక అంచనా', predict: 'ప్రమాదం అంచనా వేయండి',
    myHealth: 'నా ఆరోగ్యం', myReports: 'నా నివేదికలు', myBaby: 'నా శిశువు',
    mySafety: 'నా భద్రత', myAppointments: 'నా అపాయింట్‌మెంట్‌లు',
    loginWithPhone: 'ఫోన్‌తో లాగిన్ అవ్వండి', enterOtp: 'OTP నమోదు చేయండి',
    sendOtp: 'OTP పంపండి', verifyOtp: 'OTP ధృవీకరించండి',
    welcomeBack: 'స్వాగతం', yourHealthSummary: 'మీ ఆరోగ్య సారాంశం',
    bookConsultation: 'సంప్రదింపు బుక్ చేయండి', selectDoctor: 'డాక్టర్ ఎంచుకోండి',
    selectDate: 'తేదీ ఎంచుకోండి', selectTime: 'సమయం ఎంచుకోండి',
    patientName: 'రోగి పేరు', phoneNumber: 'ఫోన్ నంబర్',
    bookAppointment: 'అపాయింట్‌మెంట్ బుక్ చేయండి',
    appointmentBooked: 'అపాయింట్‌మెంట్ విజయవంతంగా బుక్ చేయబడింది!',
    registerNewMother: 'కొత్త తల్లిని నమోదు చేయండి', personalDetails: 'వ్యక్తిగత వివరాలు',
    medicalHistory: 'వైద్య చరిత్ర', pregnancyDetails: 'గర్భధారణ వివరాలు',
    fullName: 'పూర్తి పేరు', dateOfBirth: 'పుట్టిన తేదీ', bloodGroup: 'రక్త సమూహం',
    address: 'చిరునామా', city: 'నగరం', state: 'రాష్ట్రం',
    husbandName: 'భర్త పేరు', emergencyContact: 'అత్యవసర సంప్రదింపు',
    pregnancyTracker: 'గర్భధారణ ట్రాకర్', gestationalAge: 'గర్భకాల వయసు',
    weeks: 'వారాలు', trimester: 'త్రైమాసికం', edd: 'అంచనా ప్రసవ తేదీ',
    fetalHeartRate: 'గర్భస్థ హృదయ స్పందన', bloodPressure: 'రక్తపోటు',
    weight: 'బరువు', hemoglobin: 'హిమోగ్లోబిన్',
    highRisk: 'అధిక ప్రమాదం', midRisk: 'మధ్యస్థ ప్రమాదం', lowRisk: 'తక్కువ ప్రమాదం',
    active: 'చురుకు', delivered: 'ప్రసవమైంది', normal: 'సాధారణం', critical: 'క్లిష్టమైన',
    doctor: 'వైద్యుడు', nurse: 'నర్సు', receptionist: 'రిసెప్షనిస్ట్',
    lab: 'ల్యాబ్ టెక్నీషియన్', pharmacy: 'ఫార్మసిస్ట్',
    admin: 'నిర్వాహకుడు', superadmin: 'సూపర్ అడ్మిన్',
    shareWithPatient: 'రోగి పోర్టల్‌తో పంచుకోండి', addClinicalNote: 'క్లినికల్ జాగ్రత్త / నోట్ జోడించండి',
    sharePrecaution: 'జాగ్రత్త పంచుకోండి', uploadDiagnostic: 'డయాగ్నొస్టిక్ రికార్డ్ అప్‌లోడ్ చేయండి',
    openOcrScanner: 'OCR రిపోర్ట్ స్కానర్ తెరవండి', openPrescriptionReader: 'ప్రిస్క్రిప్షన్ రీడర్ తెరవండి',
    reportExchange: 'ABDM రిపోర్ట్ ఎక్స్ఛేంజ్', linkAbha: 'ABHA నంబర్‌ను లింక్ చేయండి',
    activeAbdmConsents: 'క్రియాశీల ABDM సమ్మతులు', importClinicalRecords: 'ABDM నుండి క్లినికల్ రికార్డులను దిగుమతి చేయండి',
    pregnancyWeek: 'గర్భధారణ వారం', daysLeft: 'రోజులు మిగిలాయి', nextVisit: 'తదుపరి సందర్శన',
    medications: 'మందులు', vaccinations: 'టీకాలు', appointmentsTab: 'అపాయింట్‌మెంట్‌లు',
    healthTips: 'ఆరోగ్య చిట్కాలు', babyMovement: 'శిశువు కదలిక', weightGain: 'బరువు పెరుగుదల',
    viewDetails: 'వివరాలు చూడండి', downloadReport: 'నివేదిక డౌన్‌లోడ్ చేయండి', shareReport: 'నివేదిక పంచుకోండి',
  },
  hi: {
    loading: 'लोड हो रहा है...', save: 'सहेजें', cancel: 'रद्द करें', submit: 'जमा करें',
    close: 'बंद करें', back: 'पीछे', next: 'अगला', search: 'खोजें',
    upload: 'अपलोड करें', download: 'डाउनलोड करें', delete: 'हटाएं',
    edit: 'संपादित करें', view: 'देखें', add: 'जोड़ें', update: 'अपडेट करें',
    confirm: 'पुष्टि करें', yes: 'हाँ', no: 'नहीं', error: 'त्रुटि',
    success: 'सफलता', warning: 'चेतावनी', info: 'जानकारी',
    noData: 'कोई डेटा उपलब्ध नहीं', selectLanguage: 'भाषा',
    dashboard: 'डैशबोर्ड', patients: 'मरीज़', babies: 'शिशु', reports: 'रिपोर्ट्स',
    settings: 'सेटिंग्स', logout: 'लॉगआउट', profile: 'प्रोफाइल',
    notifications: 'सूचनाएं', patientDirectory: 'मरीज़ निर्देशिका',
    registerMother: 'माँ को पंजीकृत करें', babyDirectory: 'शिशु निर्देशिका',
    registerBaby: 'शिशु को पंजीकृत करें', fetalMonitor: 'भ्रूण मॉनिटर',
    riskPredictor: 'जोखिम भविष्यवक्ता', opdDashboard: 'OPD डैशबोर्ड',
    clinicalDashboard: 'क्लिनिकल डैशबोर्ड', wardDashboard: 'वार्ड डैशबोर्ड',
    labQueue: 'लैब कतार', pharmacyQueue: 'फार्मेसी कतार',
    adminOverview: 'एडमिन अवलोकन', systemAdmin: 'सिस्टम एडमिन',
    platformOverview: 'प्लेटफॉर्म अवलोकन', partnerHospitals: 'साझेदार अस्पताल',
    platformOfferings: 'प्लेटफॉर्म सेवाएं', systemLogs: 'सिस्टम लॉग',
    hero_title: 'स्मार्ट मातृ एवं नवजात स्वास्थ्य मंच',
    hero_subtitle: 'सुरक्षित मातृत्व और नवजात शिशु देखभाल के लिए AI-संचालित क्लिनिकल निर्णय समर्थन।',
    hero_cta: 'परामर्श बुक करें', hero_cta2: 'स्टाफ लॉगिन', hero_portal: 'मरीज़ पोर्टल',
    features_title: 'मातृ देखभाल के लिए आपको जो चाहिए वो सब',
    features_subtitle: 'पंजीकरण से प्रसव और उसके बाद तक — JanmaLink सभी देखभाल बिंदुओं को जोड़ता है।',
    stats_patients: 'पंजीकृत मरीज़', stats_deliveries: 'सुरक्षित प्रसव',
    stats_hospitals: 'साझेदार अस्पताल', stats_accuracy: 'AI सटीकता',
    patientProfile: 'मरीज़ प्रोफाइल', clinicalSummary: 'क्लिनिकल सारांश',
    activeAlerts: 'सक्रिय अलर्ट', longitudinalTimeline: 'मरीज़ दीर्घकालिक समयरेखा',
    uploadReport: 'रिपोर्ट अपलोड करें', trackPregnancy: 'गर्भावस्था ट्रैक करें',
    voiceCopilot: 'वॉइस कोपायलट', aiRiskAnalyzer: 'AI जोखिम विश्लेषक',
    prescriptionReader: 'प्रिस्क्रिप्शन रीडर', scanPrescription: 'प्रिस्क्रिप्शन स्कैन करें',
    prescriptionReaderTitle: 'AI प्रिस्क्रिप्शन रीडर',
    prescriptionReaderSubtitle: 'अपनी भाषा में दवा की जानकारी और स्वास्थ्य सुझाव पाने के लिए प्रिस्क्रिप्शन अपलोड करें या फोटो लें।',
    uploadPrescription: 'प्रिस्क्रिप्शन छवि अपलोड करें', takePicture: 'तस्वीर लें',
    analyzing: 'प्रिस्क्रिप्शन का विश्लेषण हो रहा है...', medicationDetails: 'दवा की जानकारी',
    medicationTips: 'दवा संबंधी सुझाव एवं उपचार', prescriptionLanguage: 'प्रिस्क्रिप्शन भाषा',
    detectedMedications: 'पहचानी गई दवाएं', dosageInstructions: 'खुराक निर्देश',
    sideEffects: 'देखने योग्य दुष्प्रभाव', dietaryAdvice: 'आहार संबंधी सलाह',
    importantReminders: 'महत्वपूर्ण अनुस्मारक', homeRemedies: 'घरेलू उपचार',
    labReports: 'लैब रिपोर्ट्स', reportHistory: 'रिपोर्ट इतिहास',
    uploadNewReport: 'नई रिपोर्ट अपलोड करें', reportDate: 'रिपोर्ट तिथि',
    reportType: 'रिपोर्ट प्रकार', generatePdf: 'PDF बनाएं',
    aiCopilot: 'AI कोपायलट', askQuestion: 'प्रश्न पूछें...', sendMessage: 'संदेश भेजें',
    voiceInput: 'वॉइस इनपुट', stopListening: 'सुनना बंद करें', speak: 'बोलें',
    stopSpeaking: 'बोलना बंद करें', reportPrediction: 'रिपोर्ट पूर्वानुमान', predict: 'जोखिम का अनुमान लगाएं',
    myHealth: 'मेरा स्वास्थ्य', myReports: 'मेरी रिपोर्ट्स', myBaby: 'मेरा शिशु',
    mySafety: 'मेरी सुरक्षा', myAppointments: 'मेरी अपॉइंटमेंट',
    loginWithPhone: 'फोन से लॉगिन करें', enterOtp: 'OTP दर्ज करें',
    sendOtp: 'OTP भेजें', verifyOtp: 'OTP सत्यापित करें',
    welcomeBack: 'वापस स्वागत है', yourHealthSummary: 'आपका स्वास्थ्य सारांश',
    bookConsultation: 'परामर्श बुक करें', selectDoctor: 'डॉक्टर चुनें',
    selectDate: 'तारीख चुनें', selectTime: 'समय चुनें',
    patientName: 'मरीज़ का नाम', phoneNumber: 'फोन नंबर',
    bookAppointment: 'अपॉइंटमेंट बुक करें',
    appointmentBooked: 'अपॉइंटमेंट सफलतापूर्वक बुक हो गई!',
    registerNewMother: 'नई माँ को पंजीकृत करें', personalDetails: 'व्यक्तिगत विवरण',
    medicalHistory: 'चिकित्सा इतिहास', pregnancyDetails: 'गर्भावस्था विवरण',
    fullName: 'पूरा नाम', dateOfBirth: 'जन्म तिथि', bloodGroup: 'रक्त समूह',
    address: 'पता', city: 'शहर', state: 'राज्य',
    husbandName: 'पति का नाम', emergencyContact: 'आपातकालीन संपर्क',
    pregnancyTracker: 'गर्भावस्था ट्रैकर', gestationalAge: 'गर्भकालीन आयु',
    weeks: 'सप्ताह', trimester: 'तिमाही', edd: 'अनुमानित प्रसव तिथि',
    fetalHeartRate: 'भ्रूण हृदय गति', bloodPressure: 'रक्तचाप',
    weight: 'वजन', hemoglobin: 'हीमोग्लोबिन',
    highRisk: 'उच्च जोखिम', midRisk: 'मध्यम जोखिम', lowRisk: 'कम जोखिम',
    active: 'सक्रिय', delivered: 'प्रसव हुआ', normal: 'सामान्य', critical: 'गंभीर',
    doctor: 'डॉक्टर', nurse: 'नर्स', receptionist: 'रिसेप्शनिस्ट',
    lab: 'लैब तकनीशियन', pharmacy: 'फार्मासिस्ट',
    admin: 'प्रशासक', superadmin: 'सुपर एडमिन',
    shareWithPatient: 'मरीज़ पोर्टल के साथ साझा करें', addClinicalNote: 'क्लिनिकल सावधानी / नोट जोड़ें',
    sharePrecaution: 'सावधानी साझा करें', uploadDiagnostic: 'डायग्नोस्टिक रिकॉर्ड अपलोड करें',
    openOcrScanner: 'OCR रिपोर्ट स्कैनर खोलें', openPrescriptionReader: 'प्रिस्क्रिप्शन रीडर खोलें',
    reportExchange: 'ABDM रिपोर्ट एक्सचेंज', linkAbha: 'ABHA नंबर लिंक करें',
    activeAbdmConsents: 'सक्रिय ABDM सहमतियां', importClinicalRecords: 'ABDM से क्लिनिकल रिकॉर्ड आयात करें',
    pregnancyWeek: 'गर्भावस्था सप्ताह', daysLeft: 'दिन बचे', nextVisit: 'अगली यात्रा',
    medications: 'दवाएं', vaccinations: 'टीकाकरण', appointmentsTab: 'अपॉइंटमेंट',
    healthTips: 'स्वास्थ्य सुझाव', babyMovement: 'शिशु की हलचल', weightGain: 'वजन बढ़ना',
    viewDetails: 'विवरण देखें', downloadReport: 'रिपोर्ट डाउनलोड करें', shareReport: 'रिपोर्ट साझा करें',
  }
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(detectLanguage);

  const changeLanguage = (code) => {
    if (SUPPORTED_LANGUAGES.find(l => l.code === code)) {
      setLanguage(code);
      localStorage.setItem('jl_lang', code);
      document.documentElement.lang = code;
    }
  };

  const t = (key) => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};

export default LanguageContext;
