// Predefined clinical report templates for maternal lifecycle and diagnostic care
export const REPORT_TEMPLATES = [
  {
    id: 'before_pregnancy',
    phase: '1. Before Pregnancy',
    name: '1. Before Pregnancy — Pre-Conception Screening',
    category: 'blood',
    defaultTestType: 'Before Pregnancy Health Screening',
    description: 'Pre-pregnancy readiness, maternal baseline hormones, immunity & blood grouping (5 tests)',
    defaultRemarks: 'Pre-conception profile optimal. Rubella immunity verified. Thyroid and glycemic markers within healthy reproductive baseline.',
    parameters: [
      { parameter: 'Hemoglobin', unit: 'g/dL', refRange: '11.5-15.0', defaultValue: 12.5 },
      { parameter: 'Glucose Fasting', unit: 'mg/dL', refRange: '70-99', defaultValue: 90 },
      { parameter: 'Thyroid (TSH)', unit: 'mIU/L', refRange: '0.4-4.0', defaultValue: 2.1 },
      { parameter: 'Blood Group', unit: '—', refRange: 'ABO / Rh Standard', defaultValue: 'B Positive' },
      { parameter: 'Rubella IgG', unit: '—', refRange: 'Immune / >10 IU/mL', defaultValue: 'Immune' }
    ]
  },
  {
    id: 'during_pregnancy',
    phase: '2. During Pregnancy',
    name: '2. During Pregnancy — Antenatal Investigation Panel',
    category: 'blood',
    defaultTestType: 'Antenatal Comprehensive Panel (During Pregnancy)',
    description: 'Trimester monitoring, fetal viability scan, maternal glycemic, serology & beta-hCG (8 tests)',
    defaultRemarks: 'Antenatal markers within physiological limits. Fetal cardiac pulsation verified. Urine protein negative with no signs of pre-eclampsia.',
    parameters: [
      { parameter: 'Hemoglobin', unit: 'g/dL', refRange: '11.0-14.0', defaultValue: 11.2 },
      { parameter: 'Glucose Fasting', unit: 'mg/dL', refRange: '70-92', defaultValue: 88 },
      { parameter: 'First Trimester Ultrasound', unit: '—', refRange: 'Intrauterine Viable Gestation', defaultValue: '8 weeks, 2 days' },
      { parameter: 'Serum Beta-hCG', unit: 'mIU/mL', refRange: '5000-50000', defaultValue: '15,000' },
      { parameter: 'Blood Group & Rh', unit: '—', refRange: 'Rh Positive Confirmed', defaultValue: 'B Positive' },
      { parameter: 'Urine Protein', unit: '—', refRange: 'Negative / Nil', defaultValue: 'Negative' },
      { parameter: 'HIV Screening', unit: '—', refRange: 'Non-reactive', defaultValue: 'Non-reactive' },
      { parameter: 'Oral Glucose Tolerance Test (2-hour)', unit: 'mg/dL', refRange: '< 140', defaultValue: 130 }
    ]
  },
  {
    id: 'during_delivery',
    phase: '3. During Delivery',
    name: '3. During Delivery — Intrapartum Clinical Assessment',
    category: 'scan',
    defaultTestType: 'Intrapartum Clinical Assessment (During Delivery)',
    description: 'Active labor maternal hemodynamics, fetal heart rate monitoring & cervical progression (5 tests)',
    defaultRemarks: 'Maternal vitals stable throughout active stage. Fetal heart rate reassuring with good variability. Labor progressing normally.',
    parameters: [
      { parameter: 'Maternal Blood Pressure', unit: 'mmHg', refRange: '100/70 - 130/85', defaultValue: '120/80' },
      { parameter: 'Maternal Pulse', unit: 'beats/min', refRange: '60-100', defaultValue: 82 },
      { parameter: 'Maternal Temperature', unit: '°C', refRange: '36.5-37.5', defaultValue: 36.8 },
      { parameter: 'Fetal Heart Rate', unit: 'beats/min', refRange: '120-160', defaultValue: 140 },
      { parameter: 'Cervical Dilatation', unit: 'cm', refRange: '0-10 (Active Phase)', defaultValue: 5 }
    ]
  },
  {
    id: 'mch_clinical_lab',
    phase: 'Antenatal Comprehensive Lab Panel',
    name: 'MCH Clinical Lab Report (AP Vaidya Vidhana Parishad)',
    category: 'blood',
    defaultTestType: 'Antenatal Clinical Lab Report (MCH Ongole)',
    recommendedWhen: 'Prescribed at 1st Trimester Booking Visit & Routine Antenatal Follow-up (16-28 weeks)',
    description: 'Comprehensive Maternal Panel: CBP (Hb, Blood Group, BT/CT), Bio Chemistry (RBS, Urea, Creatinine, Bilirubin), Viral Markers & Urine Examination',
    defaultRemarks: 'Antenatal biochemistry and serology evaluated. Hemoglobin 8.0 gms% denotes moderate pregnancy anemia requiring therapeutic iron support. Viral markers non-reactive.',
    parameters: [
      { parameter: 'Haemoglobin', unit: 'gms%', refRange: '11.5-14.5', defaultValue: 8.0 },
      { parameter: 'Blood Grouping & Rh', unit: '—', refRange: 'ABO / Rh Positive', defaultValue: 'O Positive' },
      { parameter: 'Bleeding Time', unit: 'min', refRange: '1:00-3:00', defaultValue: '2:00' },
      { parameter: 'Clotting Time', unit: 'min', refRange: '3:00-7:00', defaultValue: '4:20' },
      { parameter: 'Random Blood Sugar', unit: 'mg%', refRange: '80-160', defaultValue: 116 },
      { parameter: 'Blood Urea', unit: 'mg%', refRange: '20-40', defaultValue: 20 },
      { parameter: 'Serum Creatinine', unit: 'mg%', refRange: '0.7-1.4', defaultValue: 0.7 },
      { parameter: 'Bilirubin Total', unit: 'mg/dl', refRange: '0.5-1.0', defaultValue: 0.6 },
      { parameter: 'HBsAg', unit: '—', refRange: 'Negative', defaultValue: 'Negative' },
      { parameter: 'HCV', unit: '—', refRange: 'Negative', defaultValue: 'Negative' },
      { parameter: 'HIV I & II', unit: '—', refRange: 'Non-Reactive', defaultValue: 'Non-Reactive' },
      { parameter: 'VDRL Dilutions', unit: '—', refRange: 'Non-Reactive', defaultValue: 'Non-Reactive' },
      { parameter: 'Urine Albumin', unit: '—', refRange: 'Nil / Negative', defaultValue: 'Nil' },
      { parameter: 'Urine Sugar', unit: '—', refRange: 'Nil', defaultValue: 'Nil' },
      { parameter: 'Urine Pus Cells', unit: '/HPF', refRange: '0-5', defaultValue: '1-2' },
      { parameter: 'Urine Epithelial Cells', unit: '/HPF', refRange: '0-5', defaultValue: '3-4' },
      { parameter: 'Urine Pregnancy Test', unit: '—', refRange: 'Positive', defaultValue: 'Positive' }
    ]
  },
  {
    id: 'cbp_analyzer_slip',
    phase: 'Hematology Cell Counter Slip',
    name: 'Complete Blood Picture (Automated Analyzer Slip)',
    category: 'blood',
    defaultTestType: 'Complete Blood Picture (Automated Cell Counter Slip)',
    recommendedWhen: 'Prescribed at Antenatal Booking, 24-28 Weeks Screening, and Pre-Labor Delivery Workup',
    description: 'Automated 3-part / 5-part analyzer differential: WBC, Gran#, Lymph#, Mid#, RBC, HGB, HCT, MCV, MCH, MCHC, RDW-CV, PLT, MPV, PCT',
    defaultRemarks: 'Automated cell counter analysis completed. Microcytic indices noted with HGB 9.1 g/dL. Granulocyte count slightly elevated physiological in gestation.',
    parameters: [
      { parameter: 'WBC (Total Count)', unit: '10^9/L', refRange: '4.0-11.0', defaultValue: 14.6 },
      { parameter: 'Gran# (Granulocytes)', unit: '10^9/L', refRange: '2.0-7.0', defaultValue: 11.3 },
      { parameter: 'Lymph# (Lymphocytes)', unit: '10^9/L', refRange: '1.0-4.0', defaultValue: 2.5 },
      { parameter: 'Mid# (Monocytes/Mid)', unit: '10^9/L', refRange: '0.1-1.0', defaultValue: 0.8 },
      { parameter: 'Gran%', unit: '%', refRange: '40.0-75.0', defaultValue: 77.6 },
      { parameter: 'Lymph%', unit: '%', refRange: '20.0-40.0', defaultValue: 16.8 },
      { parameter: 'RBC Count', unit: '10^12/L', refRange: '3.80-5.20', defaultValue: 3.27 },
      { parameter: 'HGB (Hemoglobin)', unit: 'g/dL', refRange: '11.0-15.0', defaultValue: 9.1 },
      { parameter: 'HCT (Hematocrit / PCV)', unit: 'L/L', refRange: '0.33-0.45', defaultValue: 0.269 },
      { parameter: 'MCV (Mean Cell Volume)', unit: 'fL', refRange: '80.0-100.0', defaultValue: 82.2 },
      { parameter: 'MCH', unit: 'pg', refRange: '27.0-33.0', defaultValue: 27.8 },
      { parameter: 'MCHC', unit: 'g/L', refRange: '320-360', defaultValue: 339 },
      { parameter: 'RDW-CV', unit: '%', refRange: '11.5-16.0', defaultValue: 13.6 },
      { parameter: 'RDW-SD', unit: 'fL', refRange: '35.0-46.0', defaultValue: 38.9 },
      { parameter: 'PLT (Platelets)', unit: '10^9/L', refRange: '150-450', defaultValue: 357 },
      { parameter: 'MPV (Mean Platelet Volume)', unit: 'fL', refRange: '7.4-11.0', defaultValue: 8.2 },
      { parameter: 'PDW', unit: '—', refRange: '9.0-17.0', defaultValue: 15.9 },
      { parameter: 'PCT (Plateletcrit)', unit: 'mL/L', refRange: '1.00-3.50', defaultValue: 2.92 }
    ]
  },
  {
    id: 'tiffa_scan',
    phase: '2nd Trimester Ultrasound',
    name: 'TIFFA Scan (Targeted Imaging for Foetal Anomalies)',
    category: 'scan',
    defaultTestType: 'Targeted Imaging for Foetal Anomalies (TIFFA)',
    recommendedWhen: 'Prescribed strictly between 18 to 24 Weeks of Gestation (Targeted Level II Scan)',
    description: 'Detailed fetal anatomical survey: Fetal Heart Rate, Placenta location, Amniotic fluid, Biometry (BPD, HC, AC, FL, Cerebellum, Cisterna Magna, Ventricles, EFW)',
    defaultRemarks: 'Targeted Level II ultrasound survey: Single viable fetus in variable lie with regular cardiac rhythm (158 bpm). Normal fetal biometry matching 23 weeks. Posterior placenta with adequate liquor. No structural anomalies detected.',
    parameters: [
      { parameter: 'Fetal Heart Rate (FHR)', unit: 'bpm', refRange: '120-160', defaultValue: 158 },
      { parameter: 'Gestational Age (EFA by USG)', unit: 'weeks', refRange: '18w 0d - 24w 0d', defaultValue: '23w 0d' },
      { parameter: 'Estimated Fetal Weight (EFW)', unit: 'grams', refRange: '450-700', defaultValue: 551 },
      { parameter: 'BPD (Biparietal Diameter)', unit: 'cm', refRange: '5.0-6.2', defaultValue: 5.56 },
      { parameter: 'HC (Head Circumference)', unit: 'cm', refRange: '19.0-22.5', defaultValue: 20.6 },
      { parameter: 'AC (Abdominal Circumference)', unit: 'cm', refRange: '16.5-20.0', defaultValue: 17.7 },
      { parameter: 'FL (Femur Length)', unit: 'cm', refRange: '3.8-4.6', defaultValue: 4.17 },
      { parameter: 'Cerebellar Transverse Diameter', unit: 'cm', refRange: '2.0-2.5', defaultValue: 2.2 },
      { parameter: 'Cisterna Magna', unit: 'mm', refRange: '< 10', defaultValue: 5 },
      { parameter: 'Lateral Ventricles', unit: 'mm', refRange: '< 10', defaultValue: 4 },
      { parameter: 'Placenta Location', unit: '—', refRange: 'Posterior / Anterior', defaultValue: 'Posterior wall' },
      { parameter: 'Amniotic Fluid', unit: '—', refRange: 'Adequate', defaultValue: 'Adequate' }
    ]
  },
  {
    id: 'after_delivery',
    phase: '4. After Delivery',
    name: '4. After Delivery — Postpartum & Newborn Assessment',
    category: 'blood',
    defaultTestType: 'Postpartum Maternal & Newborn Assessment',
    recommendedWhen: 'Prescribed within 24-72 hours post-delivery and at 6-week postpartum checkup',
    description: 'Mother postpartum vitals & OGTT alongside newborn birth weight, bilirubin & hearing screen (7 tests)',
    defaultRemarks: 'Mother recovering satisfactorily with normal postpartum glycemic response. Newborn baby healthy, normal bilirubin, hearing screening passed bilaterally.',
    parameters: [
      { parameter: 'Hemoglobin (Mother)', unit: 'g/dL', refRange: '11.0-15.0', defaultValue: 10.8 },
      { parameter: 'Blood Pressure (Mother)', unit: 'mmHg', refRange: '100/70 - 130/85', defaultValue: '118/76' },
      { parameter: 'Glucose Fasting (Mother)', unit: 'mg/dL', refRange: '70-99', defaultValue: 92 },
      { parameter: 'Postpartum OGTT 2-hour (Mother)', unit: 'mg/dL', refRange: '< 140', defaultValue: 125 },
      { parameter: 'Birth Weight (Newborn baby)', unit: 'kg', refRange: '2.5 - 4.0', defaultValue: 3.1 },
      { parameter: 'Bilirubin (Newborn baby)', unit: 'mg/dL', refRange: '< 12.0', defaultValue: 6.0 },
      { parameter: 'Newborn Hearing Screening', unit: '—', refRange: 'Pass (Bilateral)', defaultValue: 'Pass' }
    ]
  },
  {
    id: 'custom_template',
    phase: 'Custom',
    name: 'Custom / General Diagnostic Report',
    category: 'other',
    defaultTestType: 'General Diagnostic Investigation',
    recommendedWhen: 'Custom ad-hoc laboratory or diagnostic imaging referral',
    description: 'Flexible custom report builder for other specialized lab examinations or scans',
    defaultRemarks: 'Observed clinical parameters evaluated and recorded as per laboratory standard operating procedure.',
    parameters: [
      { parameter: 'Diagnostic Investigation Parameter', unit: 'units', refRange: 'Standard', defaultValue: 'Normal' }
    ]
  }
];

export const calculateFlag = (value, refRange) => {
  if (value === undefined || value === null || value === '') return 'normal';
  
  const str = String(value).toLowerCase().trim();

  // Known qualitative clinical benchmarks
  if (['immune', 'negative', 'non-reactive', 'pass', 'b positive', 'normal', 'adequate'].includes(str)) {
    return 'normal';
  }
  if (['reactive', 'positive', 'fail', 'abnormal'].includes(str)) {
    return 'high';
  }
  if (str.includes('weeks') || str.includes('day')) {
    return 'normal';
  }

  // Blood pressure e.g. "120/80"
  if (str.includes('/')) {
    const parts = str.split('/');
    const sys = parseFloat(parts[0]);
    const dia = parseFloat(parts[1]);
    if (!isNaN(sys) && !isNaN(dia)) {
      if (sys > 140 || dia > 90) return 'high';
      if (sys < 90 || dia < 60) return 'low';
      return 'normal';
    }
  }

  // Clean numeric strings e.g. "15,000" -> 15000
  const cleanNumStr = str.replace(/,/g, '');
  const num = parseFloat(cleanNumStr);
  if (isNaN(num)) return 'normal';

  if (!refRange) return 'normal';
  const cleanRef = String(refRange).replace(/,/g, '').trim();

  // Range format: "< 140" or "<140"
  if (cleanRef.startsWith('<')) {
    const max = parseFloat(cleanRef.replace('<', '').trim());
    if (!isNaN(max) && num > max) return 'high';
    return 'normal';
  }

  // Range format: "11.0-15.0" or "100/70 - 130/85"
  const parts = cleanRef.split('-');
  if (parts.length === 2) {
    const min = parseFloat(parts[0]);
    const max = parseFloat(parts[1]);
    if (!isNaN(min) && !isNaN(max)) {
      if (num < min) return 'low';
      if (num > max) return 'high';
      return 'normal';
    }
  }

  return 'normal';
};
