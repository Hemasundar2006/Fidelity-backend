import { SOURCE_TABLES, BILINGUAL_QA_PAIRS, CLINICAL_ACTIONABLE_GUIDANCE } from '../data/ragKnowledgeBase.js';
import asyncHandler from '../utils/asyncHandler.js';
import Patient from '../models/Patient.js';
import LabReport from '../models/LabReport.js';
import Visit from '../models/Visit.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

/**
 * Call Gemini 1.5 Flash REST API with single prompt
 */
async function callGeminiRAG(prompt, systemInstruction = '') {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured on server');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1200
    }
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API failed with status ${response.status}: ${errorBody}`);
  }

  const result = await response.json();
  const textOutput = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textOutput) {
    throw new Error('Empty response from Gemini API');
  }

  return textOutput;
}

/**
 * Call Gemini 1.5 Flash REST API with continuous conversation history
 */
async function callGeminiMultiTurn(contents, systemInstruction = '') {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured on server');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const payload = {
    contents,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1200
    }
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API failed with status ${response.status}: ${errorBody}`);
  }

  const result = await response.json();
  const textOutput = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textOutput) {
    throw new Error('Empty response from Gemini API');
  }

  return textOutput;
}

/**
 * Deterministic Clinical Rule Engine mapping report metrics to Source Tables (DATA.docx)
 */
function evaluateReportMetrics(metrics) {
  const {
    systolicBP = 120,
    diastolicBP = 80,
    hemoglobin = 12.0,
    bloodGlucose,
    fastingGlucose = 85,
    ogtt2hr,
    urineAlbumin = 'negative',
    urineSugar = 'negative',
    fetalHeartRate = 140,
    gestationalAge = 24
  } = metrics;

  const numSys = Number(systolicBP) || 120;
  const numDia = Number(diastolicBP) || 80;
  const numHb = Number(hemoglobin) || 12.0;
  const numFasting = Number(fastingGlucose || bloodGlucose) || 85;
  const numOgtt = Number(ogtt2hr) || null;
  const numFhr = Number(fetalHeartRate) || 140;
  const numGa = Number(gestationalAge) || 24;

  const metricResults = [];
  const riskFactors = [];
  const matchedTables = ['Source Table 2: Antenatal Tests', 'Source Table 7: During Pregnancy Reference Values'];

  // 1. Hemoglobin evaluation (Trimester specific as per Source Table 7)
  let hbThreshold = 11.0;
  if (numGa >= 13 && numGa < 28) hbThreshold = 10.5; // 2nd trimester physiological hemodilution

  if (numHb < 9.0) {
    metricResults.push({
      metric: 'Hemoglobin (Hb)',
      value: `${numHb} g/dL`,
      reference: `>= ${hbThreshold} g/dL (Source Table 7)`,
      status: 'Critical Low',
      risk: 'high',
      conditionKey: 'anemia'
    });
    riskFactors.push('Severe Maternal Anemia (Hb < 9.0 g/dL)');
  } else if (numHb < hbThreshold) {
    metricResults.push({
      metric: 'Hemoglobin (Hb)',
      value: `${numHb} g/dL`,
      reference: `>= ${hbThreshold} g/dL (Source Table 7)`,
      status: 'Below Normal',
      risk: 'moderate',
      conditionKey: 'anemia'
    });
    riskFactors.push(`Maternal Anemia (Hb < ${hbThreshold} g/dL)`);
  } else {
    metricResults.push({
      metric: 'Hemoglobin (Hb)',
      value: `${numHb} g/dL`,
      reference: `>= ${hbThreshold} g/dL (Source Table 7)`,
      status: 'Normal',
      risk: 'low'
    });
  }

  // 2. Blood Pressure (Source Table 7 & 8)
  const isAlbuminPositive = String(urineAlbumin).toLowerCase().includes('+') || 
                            ['positive', 'trace', '1+', '2+', '3+', '4+'].includes(String(urineAlbumin).toLowerCase());

  if (numSys >= 160 || numDia >= 110) {
    metricResults.push({
      metric: 'Blood Pressure',
      value: `${numSys}/${numDia} mmHg`,
      reference: '< 140/90 mmHg (Source Table 7 & 8)',
      status: 'Severe Hypertension',
      risk: 'high',
      conditionKey: 'hypertension'
    });
    riskFactors.push('Severe Gestational Hypertension (BP >= 160/110 mmHg)');
  } else if (numSys >= 140 || numDia >= 90) {
    metricResults.push({
      metric: 'Blood Pressure',
      value: `${numSys}/${numDia} mmHg`,
      reference: '< 140/90 mmHg (Source Table 7 & 8)',
      status: 'Elevated / Stage 1 Hypertension',
      risk: isAlbuminPositive ? 'high' : 'moderate',
      conditionKey: 'hypertension'
    });
    riskFactors.push(isAlbuminPositive ? 'Preeclampsia Risk (Elevated BP + Proteinuria)' : 'Gestational Hypertension (BP >= 140/90)');
  } else {
    metricResults.push({
      metric: 'Blood Pressure',
      value: `${numSys}/${numDia} mmHg`,
      reference: '< 140/90 mmHg (Source Table 7 & 8)',
      status: 'Normal',
      risk: 'low'
    });
  }

  // 3. Urine Albumin
  metricResults.push({
    metric: 'Urine Albumin / Protein',
    value: String(urineAlbumin),
    reference: 'Negative or trace (Source Table 6 & 7)',
    status: isAlbuminPositive ? 'Positive / Proteinuria' : 'Normal',
    risk: isAlbuminPositive ? (numSys >= 140 ? 'high' : 'moderate') : 'low',
    conditionKey: isAlbuminPositive ? 'hypertension' : null
  });

  // 4. Glucose / GDM Screening (Source Table 7)
  if (numFasting >= 92 || (numOgtt && numOgtt >= 153)) {
    metricResults.push({
      metric: 'Fasting Blood Glucose / OGTT',
      value: `Fasting: ${numFasting} mg/dL${numOgtt ? `, 2-hr OGTT: ${numOgtt} mg/dL` : ''}`,
      reference: 'Fasting < 92 mg/dL, 2-hr OGTT < 153 mg/dL (Source Table 7)',
      status: numFasting >= 126 ? 'Severely Elevated' : 'GDM Threshold Exceeded',
      risk: numFasting >= 126 ? 'high' : 'moderate',
      conditionKey: 'gestational_diabetes'
    });
    riskFactors.push('Gestational Diabetes (Elevated Glycemic Marker)');
  } else {
    metricResults.push({
      metric: 'Fasting Blood Glucose',
      value: `${numFasting} mg/dL`,
      reference: '< 92 mg/dL (Source Table 7)',
      status: 'Normal',
      risk: 'low'
    });
  }

  // 5. Fetal Heart Rate (Source Table 7 & 8: 110-160 bpm)
  if (numFhr < 110) {
    metricResults.push({
      metric: 'Fetal Heart Rate (FHR)',
      value: `${numFhr} bpm`,
      reference: '110–160 bpm (Source Table 7 & 8)',
      status: 'Fetal Bradycardia (<110)',
      risk: 'high',
      conditionKey: 'fetal_tachycardia_bradycardia'
    });
    riskFactors.push('Fetal Bradycardia (FHR < 110 bpm)');
  } else if (numFhr > 160) {
    metricResults.push({
      metric: 'Fetal Heart Rate (FHR)',
      value: `${numFhr} bpm`,
      reference: '110–160 bpm (Source Table 7 & 8)',
      status: 'Fetal Tachycardia (>160)',
      risk: 'high',
      conditionKey: 'fetal_tachycardia_bradycardia'
    });
    riskFactors.push('Fetal Tachycardia (FHR > 160 bpm)');
  } else {
    metricResults.push({
      metric: 'Fetal Heart Rate (FHR)',
      value: `${numFhr} bpm`,
      reference: '110–160 bpm (Source Table 7 & 8)',
      status: 'Normal Baseline (Reassuring)',
      risk: 'low'
    });
  }

  // Determine overall risk
  let overallRisk = 'low';
  let overallRiskLabel = 'LOW RISK';
  let overallRiskLabelTe = 'తక్కువ ప్రమాదం (సాధారణ స్థితి)';
  let overallRiskLabelHi = 'कम जोखिम (सामान्य स्थिति)';

  const hasHigh = metricResults.some(m => m.risk === 'high');
  const hasModerate = metricResults.some(m => m.risk === 'moderate');

  if (hasHigh) {
    overallRisk = 'high';
    overallRiskLabel = 'HIGH RISK';
    overallRiskLabelTe = 'అధిక ప్రమాదం (తక్షణ పర్యవేక్షణ అవసరం)';
    overallRiskLabelHi = 'उच्च जोखिम (तत्काल निगरानी आवश्यक)';
  } else if (hasModerate) {
    overallRisk = 'moderate';
    overallRiskLabel = 'MODERATE RISK';
    overallRiskLabelTe = 'మధ్యస్థ ప్రమాదం (జాగ్రత్తలు & ఆహార మార్పులు అవసరం)';
    overallRiskLabelHi = 'मध्यम जोखिम (आहार व देखभाल आवश्यक)';
  }

  // Pick primary clinical guidance profile
  let primaryConditionKey = 'normal';
  if (hasHigh) {
    const highItem = metricResults.find(m => m.risk === 'high' && m.conditionKey);
    primaryConditionKey = highItem?.conditionKey || 'hypertension';
  } else if (hasModerate) {
    const modItem = metricResults.find(m => m.risk === 'moderate' && m.conditionKey);
    primaryConditionKey = modItem?.conditionKey || 'anemia';
  }

  return {
    overallRisk,
    overallRiskLabel,
    overallRiskLabelTe,
    overallRiskLabelHi,
    metricResults,
    riskFactors,
    matchedTables,
    primaryConditionKey
  };
}

/**
 * POST /api/v1/rag/predict-report
 * Analyzes patient lab report metrics against the 10 reference tables,
 * computes risk level, and generates simplified advice (issue, food choices, medication routine)
 * in English, Telugu, or Hindi.
 */
export const predictReport = asyncHandler(async (req, res) => {
  const {
    systolicBP,
    diastolicBP,
    hemoglobin,
    bloodGlucose,
    fastingGlucose,
    ogtt2hr,
    urineAlbumin,
    urineSugar,
    fetalHeartRate,
    gestationalAge,
    language = 'en',
    patientName,
    patientAge
  } = req.body;

  const evaluation = evaluateReportMetrics({
    systolicBP,
    diastolicBP,
    hemoglobin,
    bloodGlucose,
    fastingGlucose,
    ogtt2hr,
    urineAlbumin,
    urineSugar,
    fetalHeartRate,
    gestationalAge
  });

  const guidanceProfile = CLINICAL_ACTIONABLE_GUIDANCE[evaluation.primaryConditionKey] || CLINICAL_ACTIONABLE_GUIDANCE.normal;
  const isTelugu = language === 'te';
  const isHindi = language === 'hi';

  // Prepare deterministic structured response
  let explanation = isTelugu ? guidanceProfile.issue_te : isHindi ? guidanceProfile.issue_hi : guidanceProfile.issue_en;
  let foodChoices = isTelugu ? guidanceProfile.foods_te : isHindi ? guidanceProfile.foods_hi : guidanceProfile.foods_en;
  let medicationRoutine = isTelugu ? guidanceProfile.medication_te : isHindi ? guidanceProfile.medication_hi : guidanceProfile.medication_en;
  let escalationNotice = isTelugu ? guidanceProfile.escalation_te : isHindi ? guidanceProfile.escalation_hi : guidanceProfile.escalation_en;
  let conditionTitle = isTelugu ? guidanceProfile.condition_te : isHindi ? guidanceProfile.condition_hi : guidanceProfile.condition_en;

  const langLabel = isTelugu ? 'Telugu (తెలుగు)' : isHindi ? 'Hindi (हिंदी)' : 'English';

  // Enhance with Gemini 1.5 Flash if available
  let geminiOutput = null;
  if (GEMINI_API_KEY) {
    try {
      const systemPrompt = `You are JanmaLink's clinical AI grounded in the JanmaLink Unified Bilingual RAG Knowledge Base (DATA.docx tables 1-10).
The user wants simplified, empathetic, highly actionable guidance in ${langLabel}.
Strict safety rules:
1. Explain in 2 clear sentences what the issue is based on the report values compared to Source Tables 6, 7 & 8.
2. Outline 3 to 4 specific local food choices (e.g., Spinach, Jaggery, Pomegranate for anemia; coconut water, low salt for BP; millets, ragi for sugar).
3. Outline a specific medication routine: taking remedies regularly for a few days/weeks to resolve the problem (e.g., iron tablets daily for 60-90 days with lemon water, never with milk; taking BP meds strictly morning & evening; checking sugar levels).
4. Tone must be warm, reassuring, and culturally appropriate for Indian mothers.`;

      const userPrompt = `Patient: ${patientName || 'Maternal Patient'}, Age: ${patientAge || 26}, Gestational Age: ${gestationalAge || 24} weeks.
Report Metrics:
- Hemoglobin: ${hemoglobin || 12} g/dL
- Blood Pressure: ${systolicBP || 120}/${diastolicBP || 80} mmHg
- Fasting Blood Sugar: ${fastingGlucose || bloodGlucose || 85} mg/dL
- Urine Albumin: ${urineAlbumin || 'negative'}
- Fetal Heart Rate: ${fetalHeartRate || 140} bpm
Evaluated Risk: ${evaluation.overallRiskLabel} (${evaluation.riskFactors.join(', ') || 'Within Normal Reference Limits'}).
Condition Detected: ${conditionTitle}

Generate a concise, simplified explanation in ${langLabel} with:
- Issue Explanation
- Recommended Food Choices
- Medication & Remedy Routine (regularity, duration, timings)`;

      geminiOutput = await callGeminiRAG(userPrompt, systemPrompt);
    } catch (gErr) {
      console.warn('Gemini RAG call skipped/failed, using validated clinical knowledge base:', gErr.message);
    }
  }

  // Construct audio speech synthesis text for read-aloud
  let speechSummary = '';
  if (isTelugu) {
    speechSummary = `మీ రిపోర్ట్ విశ్లేషణ పూర్తయింది. ముప్పు స్థాయి: ${evaluation.overallRiskLabelTe}. ${explanation} ఆహార సూచనలు: ${foodChoices.slice(0, 3).join('. ')}. మందుల సమయపాలన: ${medicationRoutine.slice(0, 2).join('. ')}.`;
  } else if (isHindi) {
    speechSummary = `आपकी रिपोर्ट का विश्लेषण तैयार है। जोखिम स्तर: ${evaluation.overallRiskLabelHi}. ${explanation} आहार सुझाव: ${foodChoices.slice(0, 3).join('. ')}. दवा नियम: ${medicationRoutine.slice(0, 2).join('. ')}.`;
  } else {
    speechSummary = `Your report analysis is ready. Risk assessment: ${evaluation.overallRiskLabel}. ${explanation} Food choices: ${foodChoices.slice(0, 3).join('. ')}. Medication routine: ${medicationRoutine.slice(0, 2).join('. ')}.`;
  }

  res.json({
    success: true,
    data: {
      overallRisk: evaluation.overallRisk,
      riskLabel: isTelugu ? evaluation.overallRiskLabelTe : isHindi ? evaluation.overallRiskLabelHi : evaluation.overallRiskLabel,
      conditionTitle,
      language,
      metricResults: evaluation.metricResults,
      riskFactors: evaluation.riskFactors,
      matchedTables: evaluation.matchedTables,
      advice: {
        issue: explanation,
        foods: foodChoices,
        medicationRoutine: medicationRoutine,
        escalation: escalationNotice
      },
      aiGeneratedGuidance: geminiOutput,
      speechText: speechSummary
    }
  });
});

/**
 * POST /api/v1/rag/chat
 * General clinical Q&A query processing with trilingual support (EN, TE, HI)
 */
export const ragChat = asyncHandler(async (req, res) => {
  const { query, language = 'en', patientContext = null } = req.body;

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ success: false, message: 'Query string is required' });
  }

  const cleanQuery = query.trim().toLowerCase();
  const isTelugu = language === 'te' || /[\u0C00-\u0C7F]/.test(query);
  const isHindi = language === 'hi' || /[\u0900-\u097F]/.test(query);

  const langCode = isTelugu ? 'te' : isHindi ? 'hi' : 'en';
  const langName = isTelugu ? 'Telugu (తెలుగు)' : isHindi ? 'Hindi (हिंदी)' : 'English';

  // Keyword search against bilingual Q&A pairs
  let bestMatch = null;
  let maxScore = 0;

  for (const qa of BILINGUAL_QA_PAIRS) {
    let score = 0;
    const targetQ = isTelugu ? qa.question_te.toLowerCase() : qa.question_en.toLowerCase();
    const queryTokens = cleanQuery.split(/\s+/).filter(w => w.length > 2);

    for (const token of queryTokens) {
      if (targetQ.includes(token)) score += 3;
      if (qa.topic.toLowerCase().includes(token)) score += 2;
    }

    if (score > maxScore) {
      maxScore = score;
      bestMatch = qa;
    }
  }

  // Clinical advice mapping
  let clinicalAdvice = null;
  if (cleanQuery.includes('anemia') || cleanQuery.includes('hemoglobin') || cleanQuery.includes('రక్తహీనత') || cleanQuery.includes('एनीमिया')) {
    clinicalAdvice = CLINICAL_ACTIONABLE_GUIDANCE.anemia;
  } else if (cleanQuery.includes('bp') || cleanQuery.includes('pressure') || cleanQuery.includes('రక్తపోటు') || cleanQuery.includes('रक्तचाप')) {
    clinicalAdvice = CLINICAL_ACTIONABLE_GUIDANCE.hypertension;
  } else if (cleanQuery.includes('sugar') || cleanQuery.includes('diabetes') || cleanQuery.includes('మధుమేహం') || cleanQuery.includes('शुगर')) {
    clinicalAdvice = CLINICAL_ACTIONABLE_GUIDANCE.gestational_diabetes;
  }

  let answerText = '';
  let speechText = '';

  if (GEMINI_API_KEY) {
    try {
      const systemPrompt = `You are JanmaLink AI Assistant, an empathetic maternal healthcare chatbot grounded strictly in the "JanmaLink Unified Bilingual RAG Knowledge Base" (111 Clinical Q&A topics + DATA.docx reference tables 1-10).
Respond in ${langName}.
Provide:
1. Clear, straightforward answer.
2. If relevant, specific recommended Food Choices (e.g. spinach, dates, pomegranate, tender coconut, millets/ragi) and specific Medication Routine (regularity, duration for a few days/weeks, taking iron with lemon water and avoiding tea/milk).
3. Medical disclaimer: Consult your hospital doctor for formal diagnosis.
Keep response concise and easily readable aloud through audio speakers.`;

      const contextSnippet = bestMatch
        ? `Knowledge Base Q&A match:\nQ: ${qaSnippet(bestMatch, langCode)}\nA: ${qaSnippetAnswer(bestMatch, langCode)}`
        : `Grounded in DATA.docx Tables 1-10 (Preconception, Antenatal, Delivery, Postnatal & Newborn reference intervals).`;

      const prompt = `Context:\n${contextSnippet}\n\nPatient Query: "${query}"\n${patientContext ? `Patient Context: ${JSON.stringify(patientContext)}` : ''}\n\nProvide empathetic, conversational answer in ${langName}:`;

      answerText = await callGeminiRAG(prompt, systemPrompt);
      speechText = answerText;
    } catch (err) {
      console.warn('Gemini chat error, falling back to local knowledge base:', err.message);
    }
  }

  if (!answerText) {
    if (bestMatch) {
      answerText = isTelugu ? bestMatch.answer_te : bestMatch.answer_en;
    } else if (clinicalAdvice) {
      const issueTxt = isTelugu ? clinicalAdvice.issue_te : isHindi ? clinicalAdvice.issue_hi : clinicalAdvice.issue_en;
      const foodList = isTelugu ? clinicalAdvice.foods_te : isHindi ? clinicalAdvice.foods_hi : clinicalAdvice.foods_en;
      const medList = isTelugu ? clinicalAdvice.medication_te : isHindi ? clinicalAdvice.medication_hi : clinicalAdvice.medication_en;

      const foodHeader = isTelugu ? 'సిఫార్సు చేసిన ఆహారం:' : isHindi ? 'सिफारिश किए गए खाद्य पदार्थ:' : 'Recommended Foods:';
      const medHeader = isTelugu ? 'మందుల నియమాలు:' : isHindi ? 'दवा और दिनचर्या:' : 'Medication Routine:';

      answerText = `${issueTxt}\n\n**${foodHeader}**\n• ${foodList.join('\n• ')}\n\n**${medHeader}**\n• ${medList.join('\n• ')}`;
    } else {
      if (isTelugu) {
        answerText = 'నమస్కారం! JanmaLink బహుభాషా ఆరోగ్య సహాయకుడికి స్వాగతం. గర్భధారణ పరీక్షలు, బీపీ, రక్తహీనత, రక్తంలో చక్కెర, లేదా ఆహారపు అలవాట్ల గురించి అడగండి.';
      } else if (isHindi) {
        answerText = 'नमस्ते! JanmaLink बहुभाषी स्वास्थ्य सहायक में आपका स्वागत है। गर्भावस्था की जांच, रक्तचाप, हीमोग्लोबिन, शुगर या खान-पान के बारे में पूछें।';
      } else {
        answerText = 'Hello! Welcome to JanmaLink Clinical Assistant. You can ask about lab report values, Hemoglobin, Blood Pressure, Gestational Diabetes, food choices, or medication routines.';
      }
    }
    speechText = answerText.replace(/[*#•]/g, '');
  }

  res.json({
    success: true,
    data: {
      answer: answerText,
      speechText: speechText || answerText,
      language: langCode,
      matchedTopic: bestMatch ? bestMatch.topic : (clinicalAdvice ? 'Clinical Guidance' : 'General'),
      advice: clinicalAdvice ? {
        issue: isTelugu ? clinicalAdvice.issue_te : isHindi ? clinicalAdvice.issue_hi : clinicalAdvice.issue_en,
        foods: isTelugu ? clinicalAdvice.foods_te : isHindi ? clinicalAdvice.foods_hi : clinicalAdvice.foods_en,
        medicationRoutine: isTelugu ? clinicalAdvice.medication_te : isHindi ? clinicalAdvice.medication_hi : clinicalAdvice.medication_en
      } : null
    }
  });
});

function qaSnippet(qa, lang) {
  if (lang === 'te') return qa.question_te;
  return qa.question_en;
}
function qaSnippetAnswer(qa, lang) {
  if (lang === 'te') return qa.answer_te;
  return qa.answer_en;
}

/**
 * POST /api/v1/rag/patient-chat
 * Dedicated Personal Health Assistant for the Logged-In Patient
 * - Analyzes her previous lab reports, clinical visits, vitals, and trimester from the database
 * - STRICT PRIVACY GUARD: ONLY queries records for patientId; strictly forbids discussing other patients
 * - Multi-turn continuous conversation memory
 * - Multi-lingual: Telugu, Hindi, English
 * - Outlines issue explanation, food remedies, and medication routines
 */
export const ragPersonalPatientChat = asyncHandler(async (req, res) => {
  const { patientId, query, conversationHistory = [], language = 'en' } = req.body;

  if (!patientId) {
    return res.status(400).json({ success: false, message: 'Patient ID is required for personal assistant' });
  }

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ success: false, message: 'Query string is required' });
  }

  // 1. STRICT PRIVACY GUARD: Query ONLY for the specified patientId
  const patient = await Patient.findById(patientId);
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }

  const isTelugu = language === 'te';
  const isHindi = language === 'hi';
  const langName = isTelugu ? 'Telugu (తెలుగు)' : isHindi ? 'Hindi (हिंदी)' : 'English';

  // Check if query is attempting to access another user's data
  const lowerQuery = query.toLowerCase();
  const otherPatientRegex = /(other patient|another patient|patient mom-|someone else|other record|other woman|ఇతర రోగి|వేరే రోగి|अन्य मरीज|दूसरे मरीज)/i;
  if (otherPatientRegex.test(lowerQuery)) {
    let rejectionText = '';
    if (isTelugu) {
      rejectionText = `గోప్యతా నిబంధన: నేను మీ వ్యక్తిగత ఆరోగ్య సహాయకుడిని. నేను మీ (${patient.name}) రికార్డులను మాత్రమే చూడగలను. ఇతర రోగుల వివరాలను చర్చించడం ఖచ్చితంగా నిషిద్ధం. మీ స్వంత ఆరోగ్యం లేదా రిపోర్టుల గురించి అడగండి.`;
    } else if (isHindi) {
      rejectionText = `गोपनीयता प्रतिबंध: मैं आपका व्यक्तिगत स्वास्थ्य सहायक हूँ। मैं केवल आपके (${patient.name}) मेडिकल रिकॉर्ड देख सकता हूँ। किसी अन्य मरीज की जानकारी देखना या साझा करना सख्त वर्जित है। कृपया केवल अपने स्वास्थ्य या रिपोर्ट के बारे में पूछें।`;
    } else {
      rejectionText = `Privacy Policy Restriction: I am your dedicated personal health assistant and can only access your own medical records (${patient.name}, ID: ${patient.motherId}). Accessing or discussing other patients' information is strictly restricted. How can I help with your own care today?`;
    }

    return res.json({
      success: true,
      data: {
        answer: rejectionText,
        speechText: rejectionText,
        language,
        isPrivacyNotice: true
      }
    });
  }

  // 2. Fetch previous lab reports and clinical visits strictly for THIS patient
  const [reports, visits] = await Promise.all([
    LabReport.find({ patient: patient._id, isDeleted: { $ne: true } })
      .sort({ reportedAt: -1, createdAt: -1 })
      .limit(6),
    Visit.find({ patient: patient._id, isDeleted: { $ne: true } })
      .sort({ visitDate: -1 })
      .limit(4)
  ]);

  // Construct summarized clinical profile for this patient
  const vitalsSummary = {
    bloodPressure: patient.vitals?.bpSys ? `${patient.vitals.bpSys}/${patient.vitals.bpDia || 80} mmHg` : '120/80 mmHg',
    hemoglobin: patient.vitals?.hb ? `${patient.vitals.hb} g/dL` : '11.4 g/dL',
    bloodSugar: patient.vitals?.bloodSugar ? `${patient.vitals.bloodSugar} mg/dL` : '86 mg/dL',
    fetalHeartRate: patient.vitals?.fhr ? `${patient.vitals.fhr} bpm` : '140 bpm',
    weight: patient.vitals?.weightKg || patient.weight || 60,
    gestationWeeks: patient.currentPregnancy?.gestationWeeks || 24,
    edd: patient.currentPregnancy?.edd ? new Date(patient.currentPregnancy.edd).toLocaleDateString('en-GB') : 'Not set',
    riskLevel: patient.riskLevel || 'low',
    nextVisitDate: patient.nextVisitDate ? new Date(patient.nextVisitDate).toLocaleDateString('en-GB') : 'None scheduled'
  };

  const reportsSummary = reports.map(r => ({
    test: r.testType || r.templateName,
    date: r.reportedAt ? new Date(r.reportedAt).toLocaleDateString('en-GB') : 'Recent',
    remarks: r.remarks || 'Standard report',
    results: (r.results || []).map(res => `${res.parameter}: ${res.value} ${res.unit || ''} (Flag: ${res.flag || 'normal'})`).join(', ')
  }));

  const visitsSummary = visits.map(v => ({
    date: new Date(v.visitDate).toLocaleDateString('en-GB'),
    complaint: v.complaint || 'Routine checkup',
    diagnosis: (v.diagnosis || []).join(', ') || 'Normal progress',
    doctorNotes: v.notes || 'No specific precautions noted',
    prescriptions: (v.prescription || []).map(p => `${p.drug} ${p.dose || ''} (${p.frequency || ''} for ${p.durationDays || '7'} days)`).join(', ')
  }));

  // Detect abnormal clinical issues
  const detectedIssues = [];
  const numHb = patient.vitals?.hb;
  if (numHb && numHb < 11.0) detectedIssues.push('anemia');
  const numSys = patient.vitals?.bpSys;
  if (numSys && numSys >= 140) detectedIssues.push('hypertension');
  const numSugar = patient.vitals?.bloodSugar;
  if (numSugar && numSugar >= 92) detectedIssues.push('gestational_diabetes');

  const primaryGuidanceKey = detectedIssues[0] || 'normal';
  const guidance = CLINICAL_ACTIONABLE_GUIDANCE[primaryGuidanceKey] || CLINICAL_ACTIONABLE_GUIDANCE.normal;

  // Build system instruction for personal assistant
  const systemInstruction = `You are JanmaLink's warm, caring, and expert Personal Health Assistant for the pregnant mother: ${patient.name} (Patient ID: ${patient.motherId}).

STRICT PRIVACY POLICY: You must NEVER share, discuss, or invent information regarding any other patient. You ONLY speak regarding ${patient.name}'s medical records.

CRITICAL INSTRUCTION ("అర్థమయ్యేటట్టు చెప్పాలి, అక్కడ ఉన్నది చదివేయకూడదు"):
- DO NOT just mechanically recite tables, metrics, cutoff numbers, or dry clinical definitions.
- Explain everything in simple, conversational, crystal-clear everyday words so an ordinary mother completely understands what is happening to her body and her baby.
- Explain the WHY:
  * If Hemoglobin is low: Explain that hemoglobin carries oxygen and energy to her and her baby. When low, that is why she feels fatigued, tired, or dizzy. Reassure her that everyday kitchen foods and regular tablets can easily build it back up.
  * If Blood Pressure is high: Explain that blood vessels are under strain, which can reduce blood flow to the placenta and baby.
  * If Sugar is high: Explain that excess sugar reaches the baby and can cause the baby to grow too heavy too quickly.
- Recommend concrete kitchen foods and natural home remedies:
  * In Telugu: పాలకూర, తోటకూర, మునగాకు, దానిమ్మ పండు, ఖర్జూరం, కొద్దిగా బెల్లం, తాజా కొబ్బరి నీళ్ళు, రాగి జావ, మొలకలు.
  * In Hindi: पालक, मेथी, सहजन (मुनगा), अनार, खजूर, थोड़ा गुड़-चना, ताजा नारियल पानी, रागी, दालें.
  * In English: Spinach, drumstick leaves, pomegranate, dates, a little jaggery with roasted gram, fresh tender coconut water, ragi millets, lentils.
- Recommend practical daily medication habits:
  * Iron tablets: Take daily at night with water or lemon water (Vitamin C absorbs iron). NEVER take with milk, tea, or coffee because they block iron absorption. Keep a 2-hour gap with calcium tablets.
  * BP tablets: Take every morning at the exact prescribed hour without skipping a single day.
  * Sugar routine: Take small, frequent meals every 3 hours; take a relaxed 15-minute walk after meals.
- Tone: Extremely warm, reassuring, caring, respectful, and comforting like a family doctor or elder sister speaking to her.
- Language: Respond fluently and naturally in ${langName}.

Patient Context from Hospital Database:
- Name: ${patient.name}, Age: ${patient.dob ? Math.floor((new Date() - new Date(patient.dob))/(365.25*24*3600*1000)) : 26}
- Gestational Progress: ${vitalsSummary.gestationWeeks} weeks (Estimated Delivery: ${vitalsSummary.edd})
- Current Vitals: BP: ${vitalsSummary.bloodPressure}, Hb: ${vitalsSummary.hemoglobin}, Blood Sugar: ${vitalsSummary.bloodSugar}, Fetal Heart Rate: ${vitalsSummary.fetalHeartRate}, Weight: ${vitalsSummary.weight} kg
- Next Scheduled Visit: ${vitalsSummary.nextVisitDate}
- Previous Lab Reports (${reportsSummary.length} on file): ${JSON.stringify(reportsSummary)}
- Previous Doctor Consultations (${visitsSummary.length} on file): ${JSON.stringify(visitsSummary)}
- Known Allergies: ${(patient.medicalHistory?.allergies || []).join(', ') || 'None'}`;

  // Build multi-turn contents array
  const formattedContents = [];
  if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
    const recentHistory = conversationHistory.slice(-6);
    for (const turn of recentHistory) {
      if (turn.role && turn.text) {
        formattedContents.push({
          role: turn.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: turn.text }]
        });
      }
    }
  }

  // Add current user query
  formattedContents.push({
    role: 'user',
    parts: [{ text: query }]
  });

  let answerText = '';
  let speechText = '';

  if (GEMINI_API_KEY) {
    try {
      answerText = await callGeminiMultiTurn(formattedContents, systemInstruction);
      speechText = answerText;
    } catch (gErr) {
      console.warn('Gemini personal assistant chat failed, using database clinical synthesizer:', gErr.message);
    }
  }

  // Fallback to warm, plain-language database synthesis if Gemini is unavailable
  if (!answerText) {
    if (isTelugu) {
      if (primaryGuidanceKey === 'anemia') {
        answerText = `నమస్కారం ${patient.name} గారూ! మీ తాజా రక్త పరీక్షను చూశాను. మీలో రక్తం శాతం (హిమోగ్లోబిన్) ${vitalsSummary.hemoglobin} ఉంది, ఇది సాధారణం కంటే కొద్దిగా తక్కువగా ఉంది.\n\n` +
          `**దీని అర్థం ఏమిటి?**\nహిమోగ్లోబిన్ తక్కువగా ఉంటే శరీరానికి మరియు కడుపులోని బిడ్డకు ఆక్సిజన్ తక్కువగా అందుతుంది. అందుకే మీకు త్వరగా అలసట, నీరసం, లేదా కాస్త కళ్ళు తిరిగినట్లు అనిపించవచ్చు. కంగారు పడకండి, సరైన ఆహారంతో దీన్ని తేలికగా పెంచుకోవచ్చు.\n\n` +
          `**ఇంట్లో ఏం తినాలి?**\n` +
          `• ఆకుకూరలు: పాలకూర, తోటకూర, మునగాకు తరచుగా వండుకోండి.\n` +
          `• పండ్లు: రోజూ 4 ఖర్జూరాలు, ఒక దానిమ్మ పండు తినండి.\n` +
          `• వేరుశెనగ గుళ్లు మరియు కొద్దిగా బెల్లం తీసుకోండి.\n` +
          `• ఐరన్ బాగా ఒంటపట్టడానికి రోజూ నిమ్మరసం లేదా ఉసిరికాయ రసం తాగండి.\n\n` +
          `**మందులు ఎలా వేసుకోవాలి?**\n` +
          `• డాక్టర్ రాసిన ఐరన్ మాత్రను రోజూ రాత్రి భోజనం తర్వాత నిమ్మరసం లేదా నీటితో వేసుకోండి.\n` +
          `• ముఖ్యమైన విషయం: ఐరన్ మాత్ర వేసుకున్నప్పుడు పాలు, టీ లేదా కాఫీ తాగకూడదు (కనీసం 2 గంటల వ్యవధి ఉండాలి).\n` +
          `• కాల్షియం మాత్రను ఉదయం, ఐరన్ మాత్రను రాత్రి వేసుకోవాలి.\n\n` +
          (vitalsSummary.nextVisitDate !== 'None scheduled' ? `మీ తదుపరి ఆసుపత్రి చెకప్ తేదీ: ${vitalsSummary.nextVisitDate}.` : '');
      } else if (primaryGuidanceKey === 'hypertension') {
        answerText = `నమస్కారం ${patient.name} గారూ! మీ తాజా రక్తపోటు (BP) ${vitalsSummary.bloodPressure} గా నమోదైంది, ఇది కొద్దిగా ఎక్కువగా ఉంది.\n\n` +
          `**దీని అర్థం ఏమిటి?**\nరక్తపోటు పెరిగినప్పుడు రక్తనాళాలు బిగుసుకుంటాయి, దీనివల్ల గర్భాశయానికి రక్త ప్రసరణ తగ్గుతుంది. అందుకే దీన్ని అదుపులో ఉంచుకోవడం చాలా ముఖ్యం.\n\n` +
          `**ఆహార జాగ్రత్తలు:**\n` +
          `• పచ్చళ్ళు, అప్పడాలు, చిప్స్ వంటి ఉప్పు ఎక్కువగా ఉండే పదార్థాలు పూర్తిగా మానేయండి.\n` +
          `• రోజూ తాజా కొబ్బరి నీళ్ళు మరియు సొరకాయ కూర తినండి.\n` +
          `• కాఫీ, టీ తగ్గించి రోజూ 3 లీటర్ల మంచినీరు తాగండి.\n\n` +
          `**మందులు & అలవాట్లు:**\n` +
          `• డాక్టర్ సూచించిన బీపీ మాత్రలను ఉదయం, సాయంత్రం ఒక రోజు కూడా మానకుండా వేసుకోండి.\n` +
          `• మధ్యాహ్నం వేళల్లో ఎడమవైపు తిరిగి 1-2 గంటలు విశ్రాంతి తీసుకోండి.\n\n` +
          `తీవ్రమైన తలనొప్పి లేదా కంటిచూపు మసకబారితే వెంటనే ఆసుపత్రికి వెళ్ళండి.`;
      } else {
        answerText = `నమస్కారం ${patient.name} గారూ! మీ తాజా రికార్డుల ప్రకారం మీ రక్తపోటు (${vitalsSummary.bloodPressure}), హిమోగ్లోబిన్ (${vitalsSummary.hemoglobin}), మరియు బిడ్డ గుండె స్పందనలు (${vitalsSummary.fetalHeartRate}) అన్నీ చాలా ఆరోగ్యంగా మరియు సాధారణంగా ఉన్నాయి!\n\n` +
          `రోజూ తాజా ఆకుకూరలు, పప్పులు, 2 గ్లాసుల పాలు లేదా మజ్జిగ తీసుకోండి. డాక్టర్ రాసిన విటమిన్ మాత్రలు క్రమం తప్పకుండా వేసుకోండి. మీకు ఎలాంటి సందేహం ఉన్నా నన్ను అడగండి!`;
      }
    } else if (isHindi) {
      if (primaryGuidanceKey === 'anemia') {
        answerText = `नमस्ते ${patient.name} जी! आपकी ताज़ा रिपोर्ट में हीमोग्लोबिन ${vitalsSummary.hemoglobin} है, जो सामान्य से थोड़ा कम है।\n\n` +
          `**इसका क्या मतलब है?**\nहीमोग्लोबिन कम होने से शरीर और गर्भस्थ शिशु तक ऑक्सीजन कम पहुँचती है। इसी वजह से आपको जल्दी थकान, कमजोरी या चक्कर महसूस हो सकते हैं। चिंता न करें, सही खान-पान से यह आसानी से बढ़ जाएगा।\n\n` +
          `**रसोई में क्या खाएं?**\n` +
          `• हरी पत्तेदार सब्जियां: पालक, मेथी, सहजन की पत्तियां खाएं।\n` +
          `• फल: रोजाना 4 खजूर और एक अनार खाएं।\n` +
          `• भुने चने के साथ थोड़ा गुड़ खाएं।\n` +
          `• आयरन बेहतर सोखने के लिए नींबू पानी या आंवला लें।\n\n` +
          `**दवाइयों का सही नियम:**\n` +
          `• डॉक्टर द्वारा दी गई आयरन की गोली रात को पानी या नींबू पानी के साथ लें।\n` +
          `• ध्यान रखें: आयरन की गोली के साथ दूध या चाय कभी न पिएं (कम से कम 2 घंटे का अंतर रखें)।\n\n` +
          (vitalsSummary.nextVisitDate !== 'None scheduled' ? `आपकी अगली मुलाकात: ${vitalsSummary.nextVisitDate}.` : '');
      } else {
        answerText = `नमस्ते ${patient.name} जी! आपकी सभी जांचें और रक्तचाप सामान्य हैं। घर का बना पौष्टिक खाना खाएं और समय पर दवाइयां लें।`;
      }
    } else {
      answerText = `Hello ${patient.name}! I have reviewed your personal health records. Your Hemoglobin is ${vitalsSummary.hemoglobin} and Blood Pressure is ${vitalsSummary.bloodPressure}.\n\n` +
        `**What this means:**\n${guidance.issue_en}\n\n` +
        `**Recommended Everyday Foods:**\n• ${guidance.foods_en.slice(0, 3).join('\n• ')}\n\n` +
        `**Medication Routine:**\n• ${guidance.medication_en.slice(0, 2).join('\n• ')}\n\n` +
        (vitalsSummary.nextVisitDate !== 'None scheduled' ? `Next visit: ${vitalsSummary.nextVisitDate}.` : '');
    }
    speechText = answerText.replace(/[*#•_]/g, '');
  }

  res.json({
    success: true,
    data: {
      answer: answerText,
      speechText: speechText || answerText,
      language,
      patientName: patient.name,
      vitalsSummary,
      reportsCount: reports.length,
      visitsCount: visits.length,
      advice: {
        issue: isTelugu ? guidance.issue_te : isHindi ? guidance.issue_hi : guidance.issue_en,
        foods: isTelugu ? guidance.foods_te : isHindi ? guidance.foods_hi : guidance.foods_en,
        medicationRoutine: isTelugu ? guidance.medication_te : isHindi ? guidance.medication_hi : guidance.medication_en
      }
    }
  });
});

/**
 * GET /api/v1/rag/reference
 * Returns the preserved 10 tables and sample bilingual Q&As
 */
export const getKnowledgeBaseReference = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      tables: SOURCE_TABLES,
      totalTables: SOURCE_TABLES.length,
      sampleQAs: BILINGUAL_QA_PAIRS
    }
  });
});
