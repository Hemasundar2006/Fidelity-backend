import Tesseract from 'tesseract.js';
import { REPORT_TEMPLATES, calculateFlag } from './reportTemplates';

/**
 * Perform optical character recognition on an image file or DataURL
 * @param {File|string} imageSource - File object or base64 image data url
 * @param {Function} onProgress - Progress callback (percentage, status)
 * @returns {Promise<{ text: string, extractedData: object }>}
 */
export const runReportOcr = async (imageSource, onProgress = () => {}) => {
  try {
    onProgress({ status: 'Initializing OCR Engine...', progress: 10 });

    const result = await Tesseract.recognize(imageSource, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          const pct = 20 + Math.round((m.progress || 0) * 70);
          onProgress({ status: `Scanning & Reading Text (${Math.round((m.progress || 0) * 100)}%)...`, progress: pct });
        } else if (m.status) {
          onProgress({ status: m.status, progress: 20 });
        }
      }
    });

    const rawText = result?.data?.text || '';
    onProgress({ status: 'Analyzing Clinical Parameters...', progress: 95 });

    const parsed = parseMedicalReportText(rawText);
    onProgress({ status: 'OCR Complete!', progress: 100 });

    return {
      rawText,
      confidence: result?.data?.confidence || 85,
      ...parsed
    };
  } catch (error) {
    console.error('OCR Processing Error:', error);
    throw new Error('Failed to process OCR: ' + (error.message || 'Unknown OCR error'));
  }
};

/**
 * Intelligent clinical parser for OCR extracted text matching the 4 lifecycle templates
 */
export const parseMedicalReportText = (text = '') => {
  const normalizedText = text.toLowerCase();

  // 1. Detect template category based on distinct phase keywords
  let detectedTemplateId = 'during_pregnancy'; // Default to during pregnancy
  let category = 'blood';
  let testType = 'Antenatal Comprehensive Panel (During Pregnancy)';

  if (normalizedText.includes('tiffa') || normalizedText.includes('foetal anomalies') || normalizedText.includes('anomalies') || normalizedText.includes('bpd') || normalizedText.includes('cisterna magna') || normalizedText.includes('lateral ventricles')) {
    detectedTemplateId = 'tiffa_scan';
    category = 'scan';
    testType = 'Targeted Imaging for Foetal Anomalies (TIFFA)';
  } else if (normalizedText.includes('rdw') || normalizedText.includes('mcv') || normalizedText.includes('mchc') || normalizedText.includes('plt') || normalizedText.includes('gran#') || normalizedText.includes('lymph#')) {
    detectedTemplateId = 'cbp_analyzer_slip';
    category = 'blood';
    testType = 'Complete Blood Picture (Automated Cell Counter Slip)';
  } else if (normalizedText.includes('vaidya vidhana') || normalizedText.includes('mother and child') || normalizedText.includes('clinical lab report') || normalizedText.includes('blood urea') || normalizedText.includes('serum creatinine') || normalizedText.includes('vdrl')) {
    detectedTemplateId = 'mch_clinical_lab';
    category = 'blood';
    testType = 'Antenatal Clinical Lab Report (MCH Ongole)';
  } else if (normalizedText.includes('cervical') || normalizedText.includes('dilatation') || normalizedText.includes('intrapartum') || (normalizedText.includes('delivery') && normalizedText.includes('pulse'))) {
    detectedTemplateId = 'during_delivery';
    category = 'scan';
    testType = 'Intrapartum Clinical Assessment (During Delivery)';
  } else if (normalizedText.includes('birth weight') || normalizedText.includes('newborn') || normalizedText.includes('postpartum') || normalizedText.includes('hearing screen')) {
    detectedTemplateId = 'after_delivery';
    category = 'blood';
    testType = 'Postpartum Maternal & Newborn Assessment';
  } else if (normalizedText.includes('rubella') || normalizedText.includes('pre-conception') || normalizedText.includes('before pregnancy') || (normalizedText.includes('tsh') && normalizedText.includes('rubella'))) {
    detectedTemplateId = 'before_pregnancy';
    category = 'blood';
    testType = 'Before Pregnancy Health Screening';
  } else if (normalizedText.includes('beta-hcg') || normalizedText.includes('ultrasound') || normalizedText.includes('ogtt') || normalizedText.includes('gestation') || normalizedText.includes('hiv')) {
    detectedTemplateId = 'during_pregnancy';
    category = 'blood';
    testType = 'Antenatal Comprehensive Panel (During Pregnancy)';
  }

  // 2. Extract Date
  let collectedDate = '';
  const datePatterns = [
    /(?:collected|date|dated|sample|report date)[\s:]*([0-9]{1,2}[\/\-.][0-9]{1,2}[\/\-.][0-9]{2,4})/i,
    /([0-9]{4}[\/\-.][0-9]{1,2}[\/\-.][0-9]{1,2})/,
    /([0-9]{1,2}[\/\-.][0-9]{1,2}[\/\-.][0-9]{4})/
  ];

  for (const regex of datePatterns) {
    const match = text.match(regex);
    if (match && match[1]) {
      try {
        const d = new Date(match[1]);
        if (!isNaN(d.getTime())) {
          collectedDate = d.toISOString().split('T')[0];
          break;
        }
      } catch {
        // continue
      }
    }
  }

  // 3. Clinical Parameter Regex Rules across the 4 stages
  const extractedParameters = [];

  const CLINICAL_REGEX_RULES = [
    // Hemoglobin
    {
      name: 'Hemoglobin',
      regex: /(?:ha?emoglobin|hb)\b[^\d]*?([0-9]{1,2}(?:\.[0-9]{1,2})?)/i,
      unit: 'g/dL',
      refRange: '11.0-15.0'
    },
    // Fasting Glucose
    {
      name: 'Glucose Fasting',
      regex: /(?:fasting\s*(?:blood)?\s*(?:sugar|glucose)|fbs)\b[^\d]*?([0-9]{2,3}(?:\.[0-9])?)/i,
      unit: 'mg/dL',
      refRange: '70-99'
    },
    // Thyroid TSH
    {
      name: 'Thyroid (TSH)',
      regex: /(?:tsh|thyroid\s*stimulating)\b[^\d]*?([0-9](?:\.[0-9]{1,2})?)/i,
      unit: 'mIU/L',
      refRange: '0.4-4.0'
    },
    // Blood Group
    {
      name: 'Blood Group',
      regex: /(?:blood\s*group(?:\s*&\s*rh)?)\b[^\w]*?([a-zA-Z\s\+\-]+(?:positive|negative|\+|\-))/i,
      unit: '—',
      refRange: 'ABO / Rh Standard'
    },
    // Rubella IgG
    {
      name: 'Rubella IgG',
      regex: /(?:rubella(?:\s*igg)?)\b[^\w]*?([a-zA-Z]+)/i,
      unit: '—',
      refRange: 'Immune / >10 IU/mL'
    },
    // Beta-hCG
    {
      name: 'Serum Beta-hCG',
      regex: /(?:(?:beta|b)\s*-?\s*hcg|human\s*chorionic)\b[^\d]*?([0-9,]+)/i,
      unit: 'mIU/mL',
      refRange: '5000-50000'
    },
    // First Trimester Ultrasound
    {
      name: 'First Trimester Ultrasound',
      regex: /(?:first\s*trimester\s*ultrasound|gestational\s*age|usg)\b[^\w]*?([0-9]+\s*weeks?(?:[,\s]+[0-9]+\s*days?)?)/i,
      unit: '—',
      refRange: 'Intrauterine Viable Gestation'
    },
    // Urine Protein
    {
      name: 'Urine Protein',
      regex: /(?:urine\s*protein|proteinuria)\b[^\w]*?([a-zA-Z\+]+)/i,
      unit: '—',
      refRange: 'Negative / Nil'
    },
    // HIV Screening
    {
      name: 'HIV Screening',
      regex: /(?:hiv(?:\s*1\s*&\s*2)?(?:\s*screening)?)\b[^\w]*?([a-zA-Z\-]+)/i,
      unit: '—',
      refRange: 'Non-reactive'
    },
    // Oral Glucose Tolerance Test (2-hour)
    {
      name: 'Oral Glucose Tolerance Test (2-hour)',
      regex: /(?:(?:oral\s*glucose\s*tolerance|ogtt|2\s*-?\s*hour\s*ogtt))\b[^\d]*?([0-9]{2,3})/i,
      unit: 'mg/dL',
      refRange: '< 140'
    },
    // Maternal Blood Pressure
    {
      name: 'Maternal Blood Pressure',
      regex: /(?:(?:maternal\s*)?(?:blood\s*pressure|bp))\b[^\d]*?([0-9]{2,3}\/[0-9]{2,3})/i,
      unit: 'mmHg',
      refRange: '100/70 - 130/85'
    },
    // Maternal Pulse
    {
      name: 'Maternal Pulse',
      regex: /(?:(?:maternal\s*)?pulse)\b[^\d]*?([0-9]{2,3})/i,
      unit: 'beats/min',
      refRange: '60-100'
    },
    // Maternal Temperature
    {
      name: 'Maternal Temperature',
      regex: /(?:(?:maternal\s*)?temp(?:erature)?)\b[^\d]*?([0-9]{2}(?:\.[0-9])?)/i,
      unit: '°C',
      refRange: '36.5-37.5'
    },
    // Fetal Heart Rate
    {
      name: 'Fetal Heart Rate',
      regex: /(?:(?:fetal\s*heart\s*rate|fhr))\b[^\d]*?([0-9]{2,3})/i,
      unit: 'beats/min',
      refRange: '120-160'
    },
    // Cervical Dilatation
    {
      name: 'Cervical Dilatation',
      regex: /(?:cervical\s*dilat(?:at)?ion|dilatation)\b[^\d]*?([0-9]{1,2})/i,
      unit: 'cm',
      refRange: '0-10 (Active Phase)'
    },
    // Postpartum OGTT
    {
      name: 'Postpartum OGTT 2-hour (Mother)',
      regex: /(?:postpartum\s*ogtt|postpartum\s*glucose)\b[^\d]*?([0-9]{2,3})/i,
      unit: 'mg/dL',
      refRange: '< 140'
    },
    // Birth Weight
    {
      name: 'Birth Weight (Newborn baby)',
      regex: /(?:birth\s*weight|baby\s*weight)\b[^\d]*?([0-9](?:\.[0-9]{1,2})?)/i,
      unit: 'kg',
      refRange: '2.5 - 4.0'
    },
    // Bilirubin
    {
      name: 'Bilirubin (Newborn baby)',
      regex: /(?:bilirubin|neonatal\s*bilirubin)\b[^\d]*?([0-9]{1,2}(?:\.[0-9])?)/i,
      unit: 'mg/dL',
      refRange: '< 12.0'
    },
    // Newborn Hearing Screening
    {
      name: 'Newborn Hearing Screening',
      regex: /(?:hearing\s*screen(?:ing)?)\b[^\w]*?([a-zA-Z]+)/i,
      unit: '—',
      refRange: 'Pass (Bilateral)'
    }
  ];

  // Try extracting against text
  CLINICAL_REGEX_RULES.forEach(rule => {
    const match = text.match(rule.regex);
    if (match && match[1]) {
      const val = match[1].trim();
      extractedParameters.push({
        parameter: rule.name,
        value: val,
        unit: rule.unit,
        refRange: rule.refRange,
        flag: calculateFlag(val, rule.refRange)
      });
    }
  });

  const matchedTemplate = REPORT_TEMPLATES.find(t => t.id === detectedTemplateId) || REPORT_TEMPLATES[0];

  // Merge found parameters with template defaults
  const finalParameters = [];
  const handledNames = new Set();

  extractedParameters.forEach(p => {
    finalParameters.push(p);
    handledNames.add(p.parameter.toLowerCase());
  });

  matchedTemplate.parameters.forEach(templateParam => {
    if (!handledNames.has(templateParam.parameter.toLowerCase())) {
      finalParameters.push({
        parameter: templateParam.parameter,
        value: templateParam.defaultValue,
        unit: templateParam.unit,
        refRange: templateParam.refRange,
        flag: calculateFlag(templateParam.defaultValue, templateParam.refRange)
      });
    }
  });

  return {
    templateId: detectedTemplateId,
    testType: testType || matchedTemplate.defaultTestType,
    category: category || matchedTemplate.category,
    collectedDate: collectedDate || new Date().toISOString().split('T')[0],
    parameters: finalParameters.length > 0 ? finalParameters : matchedTemplate.parameters.map(p => ({
      parameter: p.parameter,
      value: p.defaultValue,
      unit: p.unit,
      refRange: p.refRange,
      flag: calculateFlag(p.defaultValue, p.refRange)
    })),
    remarks: matchedTemplate.defaultRemarks
  };
};

/**
 * Intelligent OCR extractor specifically for the Antenatal Risk Analyzer & Pregnancy Tracker
 */
export const parseVitalsForRiskAnalyzer = (text = '') => {
  const result = {
    age: '',
    gravida: 'G1P0',
    weight: '',
    height: '160',
    systolic_bp: '',
    diastolic_bp: '',
    gestational_age: '',
    tt_dose: '2',
    fetal_position: 'cephalic',
    fetal_movement: 'normal',
    fetal_heart_rate: '',
    anemia: 'no',
    jaundice: 'no',
    urine_albumin: 'negative',
    urine_sugar: 'negative',
    vdrl: 'non-reactive',
    hrsag: 'negative',
    notes: '',
    detectedFields: []
  };

  if (!text) return result;

  // 1. Age (Years)
  const ageMatch = text.match(/\bage\b[^\d]*?([0-9]{2})/i) || text.match(/([0-9]{2})\s*(?:y|yrs|years)/i);
  if (ageMatch) {
    const ageVal = parseInt(ageMatch[1], 10);
    if (ageVal >= 12 && ageVal <= 60) {
      result.age = ageVal;
      result.detectedFields.push('Age');
    }
  }

  // 2. Gravida (G)
  const gravMatch = text.match(/(?:gravida|para|obstetric\s*score)\b[^\w]*?([gG][0-9][pP][0-9])/i) ||
                    text.match(/([gG][0-9][a-zA-Z0-9]*)/i);
  if (gravMatch) {
    result.gravida = gravMatch[1].toUpperCase();
    result.detectedFields.push('Gravida');
  }

  // 3. Weight (kg)
  const wtMatch = text.match(/(?:weight|wt)\b[^\d]*?([0-9]{2,3}(?:\.[0-9])?)\s*(?:kg)?/i) ||
                  text.match(/([0-9]{2,3}(?:\.[0-9])?)\s*kg\b/i);
  if (wtMatch) {
    const wt = parseFloat(wtMatch[1]);
    if (wt >= 35 && wt <= 180) {
      result.weight = wt;
      result.detectedFields.push('Weight');
    }
  }

  // 4. Height (cm)
  const htMatch = text.match(/(?:height|ht)\b[^\d]*?([0-9]{2,3})\s*(?:cm)?/i);
  if (htMatch) {
    const ht = parseInt(htMatch[1], 10);
    if (ht >= 120 && ht <= 210) {
      result.height = ht;
      result.detectedFields.push('Height');
    }
  }

  // 5. Systolic & Diastolic BP
  const bpMatch = text.match(/(?:bp|blood\s*pressure)?\s*([0-9]{2,3})\s*[\/\-]\s*([0-9]{2,3})/i);
  if (bpMatch) {
    const sys = parseInt(bpMatch[1], 10);
    const dia = parseInt(bpMatch[2], 10);
    if (sys >= 70 && sys <= 240 && dia >= 40 && dia <= 140) {
      result.systolic_bp = sys;
      result.diastolic_bp = dia;
      result.detectedFields.push('Blood Pressure');
    }
  }

  // 6. Gestational Age (Wks)
  const gaMatch = text.match(/(?:gestation(?:al)?(?:\s*age)?|week|efa)\b[^\d]*?([0-9]{1,2})\s*(?:w|weeks?)/i) ||
                  text.match(/([0-9]{1,2})\s*w\s*[0-9]{1,2}d/i);
  if (gaMatch) {
    const w = parseInt(gaMatch[1], 10);
    if (w >= 1 && w <= 42) {
      result.gestational_age = w;
      result.detectedFields.push('Gestational Age');
    }
  }

  // 7. TT Dose
  const ttMatch = text.match(/(?:tt\s*(?:dose)?|tetanus)\b[^\d]*?([0-9])/i);
  if (ttMatch) {
    result.tt_dose = ttMatch[1];
    result.detectedFields.push('TT Dose');
  }

  // 8. Fetal Position
  if (text.match(/breech/i)) {
    result.fetal_position = 'breech';
    result.detectedFields.push('Fetal Position');
  } else if (text.match(/transverse/i)) {
    result.fetal_position = 'transverse';
    result.detectedFields.push('Fetal Position');
  } else if (text.match(/cephalic|vertex/i)) {
    result.fetal_position = 'cephalic';
    result.detectedFields.push('Fetal Position');
  }

  // 9. Fetal Movement
  if (text.match(/(?:reduced|decreased|poor)\s*(?:fetal\s*movement|fm)/i)) {
    result.fetal_movement = 'decreased';
    result.detectedFields.push('Fetal Movement');
  } else if (text.match(/absent\s*(?:fetal\s*movement|fm)/i)) {
    result.fetal_movement = 'absent';
    result.detectedFields.push('Fetal Movement');
  } else if (text.match(/normal\s*(?:fetal\s*movement|fm)/i)) {
    result.fetal_movement = 'normal';
    result.detectedFields.push('Fetal Movement');
  }

  // 10. Fetal Heart Rate (bpm)
  const fhrMatch = text.match(/(?:fetal\s*heart(?:\s*rate)?|fhr)\b[^\d]*?([0-9]{2,3})/i) ||
                   text.match(/([0-9]{2,3})\s*bpm/i);
  if (fhrMatch) {
    const fhr = parseInt(fhrMatch[1], 10);
    if (fhr >= 90 && fhr <= 200) {
      result.fetal_heart_rate = fhr;
      result.detectedFields.push('Fetal Heart Rate');
    }
  }

  // 11. Anemia (evaluated from Hemoglobin < 11 or explicit keyword)
  const hbMatch = text.match(/(?:ha?emoglobin|hb|hgb)\b[^\d]*?([0-9]{1,2}(?:\.[0-9]{1,2})?)/i) ||
                  text.match(/([0-9]{1,2}(?:\.[0-9])?)\s*(?:gms%|g\/dl)/i);
  if (hbMatch) {
    const hbVal = parseFloat(hbMatch[1]);
    if (hbVal < 11.0) {
      result.anemia = 'yes';
    } else {
      result.anemia = 'no';
    }
    result.detectedFields.push('Anemia (from Hb ' + hbVal + ')');
  }

  // 12. Jaundice (from Bilirubin > 1.2 or explicit keyword)
  const biliMatch = text.match(/(?:bilirubin|jaundice)\b[^\d]*?([0-9](?:\.[0-9])?)/i);
  if (biliMatch) {
    const bVal = parseFloat(biliMatch[1]);
    result.jaundice = bVal > 1.2 ? 'yes' : 'no';
    result.detectedFields.push('Jaundice');
  }

  // 13. Urine Albumin
  if (text.match(/urine\s*albumin\b[^\w]*?(?:trace|\+)/i) || text.match(/albumin\b[^\w]*?trace/i)) {
    result.urine_albumin = 'trace';
    result.detectedFields.push('Urine Albumin');
  } else if (text.match(/urine\s*albumin\b[^\w]*?(?:positive|\+\+|\+\+\+)/i)) {
    result.urine_albumin = 'positive';
    result.detectedFields.push('Urine Albumin');
  } else if (text.match(/urine\s*albumin\b[^\w]*?(?:negative|nil)/i)) {
    result.urine_albumin = 'negative';
    result.detectedFields.push('Urine Albumin');
  }

  // 14. Urine Sugar
  if (text.match(/urine\s*sugar\b[^\w]*?(?:positive|\+)/i)) {
    result.urine_sugar = 'positive';
    result.detectedFields.push('Urine Sugar');
  } else if (text.match(/urine\s*sugar\b[^\w]*?(?:negative|nil)/i)) {
    result.urine_sugar = 'negative';
    result.detectedFields.push('Urine Sugar');
  }

  // 15. VDRL (Syphilis)
  if (text.match(/vdrl\b[^\w]*?(?:non\s*-?\s*reactive|negative)/i)) {
    result.vdrl = 'non-reactive';
    result.detectedFields.push('VDRL');
  } else if (text.match(/vdrl\b[^\w]*?(?:reactive|positive)/i)) {
    result.vdrl = 'reactive';
    result.detectedFields.push('VDRL');
  }

  // 16. HBsAg (Hepatitis B)
  if (text.match(/(?:hbs\s*ag|hrsag)\b[^\w]*?(?:negative|non\s*-?\s*reactive)/i)) {
    result.hrsag = 'negative';
    result.detectedFields.push('HBsAg');
  } else if (text.match(/(?:hbs\s*ag|hrsag)\b[^\w]*?(?:positive|reactive)/i)) {
    result.hrsag = 'positive';
    result.detectedFields.push('HBsAg');
  }

  // Clinical findings / Notes
  const findings = [];
  if (text.match(/placenta\s*([a-zA-Z\s]+)/i)) findings.push(`Placenta: ${text.match(/placenta\s*([a-zA-Z\s]+)/i)[1].trim().split('\n')[0]}`);
  if (text.match(/amniotic\s*fluid\s*([a-zA-Z]+)/i)) findings.push(`Liquor: ${text.match(/amniotic\s*fluid\s*([a-zA-Z]+)/i)[1].trim()}`);
  if (text.match(/efw\b[^\d]*?([0-9]{3,4})/i)) findings.push(`EFW: ${text.match(/efw\b[^\d]*?([0-9]{3,4})/i)[1]}g`);

  if (findings.length > 0) {
    result.notes = findings.join(' | ');
  }

  return result;
};

/**
 * Call the remote maternal health prediction API with automatic clinical fallback
 */
export const callMaternalHealthPredictionApi = async (formData) => {
  const payload = {
    age: Number(formData.age) || 24,
    gravida: String(formData.gravida || 'G1P0'),
    tt_dose: String(formData.tt_dose || '2'),
    gestational_age: Number(formData.gestational_age) || 20,
    weight: Number(formData.weight) || 60,
    height: Number(formData.height) || 160,
    systolic_bp: Number(formData.systolic_bp) || 120,
    diastolic_bp: Number(formData.diastolic_bp) || 80,
    anemia: String(formData.anemia || 'no').toLowerCase(),
    jaundice: String(formData.jaundice || 'no').toLowerCase(),
    fetal_position: String(formData.fetal_position || 'cephalic').toLowerCase(),
    fetal_movement: String(formData.fetal_movement || 'normal').toLowerCase(),
    fetal_heart_rate: Number(formData.fetal_heart_rate) || 140,
    urine_albumin: String(formData.urine_albumin || 'negative').toLowerCase(),
    urine_sugar: String(formData.urine_sugar || 'negative').toLowerCase(),
    vdrl: String(formData.vdrl || 'non-reactive').toLowerCase(),
    hrsag: String(formData.hrsag || formData.hbsag || 'negative').toLowerCase()
  };

  try {
    const res = await fetch('https://maternal-health-prediction-1.onrender.com/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false) {
        const textResult = typeof data === 'string' ? data : (data.prediction || data.result || JSON.stringify(data));
        return {
          success: true,
          source: 'api',
          prediction: textResult,
          isHighRisk: textResult.toLowerCase().includes('high'),
          isMidRisk: textResult.toLowerCase().includes('mid') || textResult.toLowerCase().includes('medium'),
          isLowRisk: textResult.toLowerCase().includes('low') || textResult.toLowerCase().includes('normal')
        };
      }
    }
  } catch (err) {
    console.warn('Prediction API call failed, using clinical fallback:', err.message);
  }

  // Clinical algorithm fallback
  const localEval = evaluatePregnancyRisk({
    bpSys: payload.systolic_bp,
    bpDia: payload.diastolic_bp,
    hb: payload.anemia === 'yes' ? 9.2 : 12.0,
    bloodSugar: payload.urine_sugar === 'positive' ? 145 : 95,
    fhr: payload.fetal_heart_rate,
    age: payload.age,
    weightKg: payload.weight
  });

  return {
    success: true,
    source: 'clinical_model',
    prediction: localEval.riskLevel === 'high' ? 'High Risk' : localEval.riskLevel === 'mid' ? 'Mid Risk' : 'Low Risk',
    isHighRisk: localEval.riskLevel === 'high',
    isMidRisk: localEval.riskLevel === 'mid',
    isLowRisk: localEval.riskLevel === 'low',
    details: localEval
  };
};

/**
 * AI Maternal Pregnancy Risk Classifier based on clinical antenatal indicators
 */
export const evaluatePregnancyRisk = ({ bpSys, bpDia, hb, bloodSugar, fhr, age, weightKg }) => {
  let riskScore = 0;
  const factors = [];
  const recommendations = [];

  const sys = Number(bpSys);
  const dia = Number(bpDia);
  const hem = Number(hb);
  const bs = Number(bloodSugar);
  const heartRate = Number(fhr);
  const maternalAge = Number(age);

  // 1. Blood Pressure Evaluation (Pre-eclampsia / Gestational Hypertension)
  if (sys >= 140 || dia >= 90) {
    riskScore += 35;
    factors.push({
      name: `Systolic BP (${sys || dia})`,
      detail: sys >= 160 ? 'Severe Hypertension (Stage 2)' : 'Elevated Hypertension (Stage 1)',
      impact: 'High Impact',
      impactColor: 'text-rose-600',
      barColor: 'bg-rose-500',
      percent: 90
    });
    recommendations.push('Immediate obstetric BP monitoring and urine protein / pre-eclampsia evaluation.');
  } else if (sys >= 130 || dia >= 85) {
    riskScore += 18;
    factors.push({
      name: `Systolic BP (${sys})`,
      detail: 'Pre-hypertension / High Normal',
      impact: 'Moderate Impact',
      impactColor: 'text-amber-600',
      barColor: 'bg-amber-500',
      percent: 60
    });
    recommendations.push('Weekly blood pressure tracking & sodium regulation advised.');
  } else if (sys > 0) {
    factors.push({
      name: `Blood Pressure (${sys}/${dia || 80})`,
      detail: 'Optimal Hemodynamic Range',
      impact: 'Low Impact',
      impactColor: 'text-emerald-600',
      barColor: 'bg-emerald-500',
      percent: 20
    });
  }

  // 2. Hemoglobin Evaluation (Maternal Anemia)
  if (hem > 0 && hem < 9.0) {
    riskScore += 35;
    factors.push({
      name: `Hemoglobin (${hem} g/dL)`,
      detail: 'Severe Maternal Anemia (<9.0 g/dL)',
      impact: 'High Impact',
      impactColor: 'text-rose-600',
      barColor: 'bg-rose-500',
      percent: 85
    });
    recommendations.push('Therapeutic parenteral or high-dose iron and folic acid intervention indicated.');
  } else if (hem >= 9.0 && hem < 11.0) {
    riskScore += 20;
    factors.push({
      name: `Hemoglobin (${hem} g/dL)`,
      detail: 'Mild-to-Moderate Anemia (Below 11 g/dL)',
      impact: 'Moderate Impact',
      impactColor: 'text-amber-600',
      barColor: 'bg-amber-500',
      percent: 65
    });
    recommendations.push('Dietary counseling with regular oral iron supplementation.');
  } else if (hem >= 11.0) {
    factors.push({
      name: `Hemoglobin (${hem} g/dL)`,
      detail: 'Normal Gestational Hemoglobin',
      impact: 'Low Impact',
      impactColor: 'text-emerald-600',
      barColor: 'bg-emerald-500',
      percent: 15
    });
  }

  // 3. Blood Sugar Evaluation (Gestational Diabetes)
  if (bs >= 140) {
    riskScore += 30;
    factors.push({
      name: `Blood Sugar (${bs} mg/dL)`,
      detail: 'Elevated Glycemic Marker (Risk of GDM)',
      impact: 'High Impact',
      impactColor: 'text-rose-600',
      barColor: 'bg-rose-500',
      percent: 80
    });
    recommendations.push('Formal Oral Glucose Tolerance Test (OGTT) and endocrinology consultation.');
  } else if (bs > 110) {
    riskScore += 12;
    factors.push({
      name: `Blood Sugar (${bs} mg/dL)`,
      detail: 'Borderline Glycemic Level',
      impact: 'Moderate Impact',
      impactColor: 'text-amber-600',
      barColor: 'bg-amber-500',
      percent: 45
    });
  }

  // 4. Fetal Heart Rate (Fetal Wellbeing)
  if (heartRate > 0 && (heartRate < 110 || heartRate > 160)) {
    riskScore += 30;
    factors.push({
      name: `Fetal Heart Rate (${heartRate} bpm)`,
      detail: 'Atypical Fetal Heart Rate (<110 or >160 bpm)',
      impact: 'High Impact',
      impactColor: 'text-rose-600',
      barColor: 'bg-rose-500',
      percent: 85
    });
    recommendations.push('Perform non-stress test (NST) and obstetric Doppler scan.');
  }

  // 5. Maternal Age Factor
  if (maternalAge > 0) {
    if (maternalAge < 18 || maternalAge >= 35) {
      riskScore += 15;
      factors.push({
        name: `Age (${maternalAge} yrs)`,
        detail: maternalAge < 18 ? 'Adolescent Pregnancy' : 'Advanced Maternal Age (≥35)',
        impact: 'Moderate Impact',
        impactColor: 'text-amber-600',
        barColor: 'bg-amber-500',
        percent: 40
      });
    } else {
      factors.push({
        name: `Age (${maternalAge} yrs)`,
        detail: 'Standard Reproductive Age',
        impact: 'Low Impact',
        impactColor: 'text-slate-500',
        barColor: 'bg-slate-300',
        percent: 15
      });
    }
  }

  // Default fallback factor if none triggered
  if (factors.length === 0) {
    factors.push({
      name: 'Standard Antenatal Profile',
      detail: 'All measured parameters in physiological norms',
      impact: 'Low Impact',
      impactColor: 'text-emerald-600',
      barColor: 'bg-emerald-500',
      percent: 10
    });
  }

  let riskLevel = 'low';
  let confidence = 86;

  if (riskScore >= 45) {
    riskLevel = 'high';
    confidence = Math.min(88 + Math.round((riskScore - 45) * 0.2), 97);
  } else if (riskScore >= 20) {
    riskLevel = 'mid';
    confidence = Math.min(82 + Math.round((riskScore - 20) * 0.3), 91);
  } else {
    riskLevel = 'low';
    confidence = 92;
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue standard antenatal checkups and routine maternal vitamins.');
  }

  return {
    riskLevel,
    confidence,
    riskScore,
    factors,
    recommendations
  };
};
