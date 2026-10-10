/**
 * JanmaLink — Unified Bilingual RAG Knowledge Base
 * Sourced directly from the official JanmaLink Bilingual Clinical Document (111 Topics + DATA.docx Tables)
 * Part I: Bilingual Q&A
 * Part II & III: Source Tables 1 to 10 from DATA.docx
 * Part IV: Safety, Privacy, and Escalation Rules
 */

export const SOURCE_TABLES = [
  {
    tableNumber: 1,
    tableName: 'Preconception Tests (Before Pregnancy)',
    stage: 'Before Pregnancy',
    category: 'Preconception Diagnostics',
    items: [
      { id: 1, name: 'Complete Blood Count (CBC)', purpose: 'Baseline hematology, red blood cell count, infection indicator' },
      { id: 2, name: 'Hemoglobin (Hb) Test', purpose: 'Screens for pre-existing anemia before conception' },
      { id: 3, name: 'Blood Group and Rh Typing', purpose: 'Determines ABO blood group and Rh incompatibility risk' },
      { id: 4, name: 'Hemoglobin Electrophoresis / Thalassemia Screening', purpose: 'Identifies carrier status for thalassemia or sickle cell trait' },
      { id: 5, name: 'Blood Glucose Test', purpose: 'Identifies pre-existing impaired fasting glucose or diabetes' },
      { id: 6, name: 'HbA1c Test', purpose: 'Evaluates average 3-month glycemic control prior to pregnancy' },
      { id: 7, name: 'Thyroid-Stimulating Hormone (TSH)', purpose: 'Screens for hypo/hyperthyroidism which impacts fertility and neurodevelopment' },
      { id: 8, name: 'Rubella IgG', purpose: 'Evaluates immunity against congenital rubella syndrome' },
      { id: 9, name: 'Varicella IgG', purpose: 'Verifies chickenpox immunity status' },
      { id: 10, name: 'HIV 1 & 2 Screening', purpose: 'Routine voluntary preconception viral screening' },
      { id: 11, name: 'Hepatitis B Surface Antigen (HBsAg)', purpose: 'Screens for chronic Hepatitis B viral carriage' },
      { id: 12, name: 'Hepatitis C Antibody (Anti-HCV)', purpose: 'Screens for HCV exposure' },
      { id: 13, name: 'Syphilis Screening (VDRL/RPR)', purpose: 'Prevents maternal-fetal transmission of syphilis' },
      { id: 14, name: 'Urine Routine Examination', purpose: 'Screens for asymptomatic proteinuria, glycosuria, or hematuria' },
      { id: 15, name: 'Urine Culture', purpose: 'Identifies asymptomatic bacteriuria' },
      { id: 16, name: 'Cervical Cancer Screening (Pap Test/HPV Test)', purpose: 'If due according to local screening guideline' },
      { id: 17, name: 'Genetic Carrier Screening', purpose: 'When indicated by clinical or family history' },
      { id: 18, name: 'Kidney Function Test (KFT)', purpose: 'When indicated for hypertension or renal suspicion' },
      { id: 19, name: 'Liver Function Test (LFT)', purpose: 'When clinically indicated' },
      { id: 20, name: 'Pelvic Ultrasound', purpose: 'Evaluates uterine anatomy, ovaries, and endometrial lining' }
    ]
  },
  {
    tableNumber: 2,
    tableName: 'Antenatal Tests (During Pregnancy)',
    stage: 'During Pregnancy',
    category: 'Antenatal Diagnostics & Monitoring',
    items: [
      { id: 1, name: 'Urine Pregnancy Test (UPT)', purpose: 'Qualitative confirmation of pregnancy' },
      { id: 2, name: 'Serum Beta-hCG', purpose: 'Quantitative marker of trophoblastic activity and gestational progress' },
      { id: 3, name: 'Complete Blood Count (CBC)', purpose: 'Evaluates maternal anemia, platelet count, and leukocyte reaction' },
      { id: 4, name: 'Blood Group and Rh Typing', purpose: 'Identifies Rh-negative mothers requiring anti-D prophylaxis' },
      { id: 5, name: 'HIV Screening', purpose: 'Prevention of mother-to-child transmission (PMTCT)' },
      { id: 6, name: 'HBsAg', purpose: 'Identifies neonates requiring immediate Hep B immunoglobulin at birth' },
      { id: 7, name: 'Syphilis Screening (VDRL/RPR)', purpose: 'Treatable treponemal infection screening' },
      { id: 8, name: 'Anti-HCV', purpose: 'As recommended by protocol' },
      { id: 9, name: 'Rubella Immunity Assessment', purpose: 'When indicated' },
      { id: 10, name: 'Urine Routine Examination', purpose: 'Protein and glucose screening at every antenatal contact' },
      { id: 11, name: 'Urine Culture', purpose: 'Detects asymptomatic bacteriuria preventing pyelonephritis/preterm birth' },
      { id: 12, name: 'Thyroid Function Test (TSH)', purpose: 'When indicated; trimester-specific targets' },
      { id: 13, name: 'Blood Glucose Screening', purpose: 'Early screening for overt pre-existing diabetes' },
      { id: 14, name: 'Oral Glucose Tolerance Test (OGTT 75g)', purpose: 'Gestational diabetes mellitus (GDM) diagnosis at 24–28 weeks' },
      { id: 15, name: 'Dating / Viability Ultrasound', purpose: 'Confirm intrauterine gestation, crown-rump length (CRL), and EDD' },
      { id: 16, name: 'Nuchal Translucency (NT) Scan', purpose: 'First-trimester aneuploidy screening at 11–13+6 weeks' },
      { id: 17, name: 'Dual Marker Test', purpose: 'Serum PAPP-A and free beta-hCG combined with NT scan' },
      { id: 18, name: 'Non-Invasive Prenatal Testing (NIPT / cfDNA)', purpose: 'Cell-free DNA screening for common trisomies' },
      { id: 19, name: 'Quadruple Marker Test', purpose: 'Second-trimester serum screening at 15–20 weeks when indicated' },
      { id: 20, name: 'Fetal Anomaly Scan (TIFFA)', purpose: 'Comprehensive fetal anatomical survey at 18–20 weeks' },
      { id: 21, name: 'Fetal Growth Ultrasound', purpose: 'Monitors estimated fetal weight (EFW), abdominal circumference, and amniotic fluid index' },
      { id: 22, name: 'Fetal Doppler Ultrasound', purpose: 'Umbilical artery and middle cerebral artery flow for fetal growth restriction (FGR)' },
      { id: 23, name: 'Group B Streptococcus (GBS) Screening', purpose: 'Vagino-rectal culture at 35–37 weeks for intrapartum antibiotic prophylaxis' },
      { id: 24, name: 'Non-Stress Test (NST)', purpose: 'Biophysical electronic fetal heart rate monitoring in 3rd trimester' },
      { id: 25, name: 'Biophysical Profile (BPP)', purpose: 'Ultrasound assessment of fetal tone, movement, breathing, and liquor' }
    ]
  },
  {
    tableNumber: 3,
    tableName: 'Labour and Childbirth Assessments',
    stage: 'During Delivery',
    category: 'Intrapartum Monitoring',
    items: [
      { id: 1, name: 'Maternal Blood Pressure Monitoring', purpose: 'Screens for intrapartum preeclampsia / eclampsia' },
      { id: 2, name: 'Maternal Pulse Rate Monitoring', purpose: 'Monitors maternal hemodynamics, fever, or tachycardia' },
      { id: 3, name: 'Maternal Temperature Monitoring', purpose: 'Identifies intra-amniotic infection (chorioamnionitis)' },
      { id: 4, name: 'Fetal Heart Rate Monitoring', purpose: 'Continuous or intermittent auscultation during labor' },
      { id: 5, name: 'Cardiotocography (CTG)', purpose: 'Electronic fetal monitoring for decelerations and variability' },
      { id: 6, name: 'Intermittent Fetal Heart Rate Auscultation', purpose: 'Standard low-risk intrapartum auscultation using Doppler / Pinard' },
      { id: 7, name: 'Contraction Monitoring', purpose: 'Frequency, duration, and strength of uterine contractions' },
      { id: 8, name: 'Cervical Dilatation Assessment', purpose: 'Partogram progress tracking from latent to active labor (0–10 cm)' },
      { id: 9, name: 'Membrane Rupture Assessment', purpose: 'Clear vs meconium-stained liquor evaluation' },
      { id: 10, name: 'Urine Protein Test', purpose: 'When indicated for elevated blood pressure during labor' },
      { id: 11, name: 'Bedside Blood Glucose Test', purpose: 'Monitors maternal glycemic stability during active labor' },
      { id: 12, name: 'Complete Blood Count (CBC)', purpose: 'Intrapartum blood loss and platelet count baseline' },
      { id: 13, name: 'Blood Group and Crossmatch', purpose: 'Prepared when transfusion is anticipated or in postpartum hemorrhage risk' },
      { id: 14, name: 'Coagulation Profile', purpose: 'When indicated for suspected DIC or placental abruption' },
      { id: 15, name: 'Ultrasound Assessment', purpose: 'When indicated for fetal presentation or placental location' }
    ]
  },
  {
    tableNumber: 4,
    tableName: 'Postnatal Tests (Mother)',
    stage: 'After Delivery',
    category: 'Postpartum Maternal Care',
    items: [
      { id: 1, name: 'Complete Blood Count (CBC)', purpose: 'Postpartum anemia assessment after blood loss' },
      { id: 2, name: 'Hemoglobin (Hb) Test', purpose: 'Monitors recovery from delivery blood loss' },
      { id: 3, name: 'Blood Pressure Monitoring', purpose: 'Monitors postpartum preeclampsia (can occur up to 6 weeks postpartum)' },
      { id: 4, name: 'Blood Glucose Test', purpose: 'Monitors maternal glucose recovery' },
      { id: 5, name: 'Postpartum Oral Glucose Tolerance Test (OGTT 75g)', purpose: 'Particularly important at 4–12 weeks postpartum after gestational diabetes' },
      { id: 6, name: 'HbA1c Test', purpose: 'When appropriate to assess long-term glycemic state' },
      { id: 7, name: 'Thyroid Function Test (TSH)', purpose: 'When indicated for postpartum thyroiditis' },
      { id: 8, name: 'Urine Routine Examination', purpose: 'When indicated for urinary symptoms or postpartum hypertension' },
      { id: 9, name: 'Urine Culture', purpose: 'When indicated for suspected postpartum UTI' },
      { id: 10, name: 'Kidney Function Test (KFT)', purpose: 'When indicated following severe preeclampsia' },
      { id: 11, name: 'Liver Function Test (LFT)', purpose: 'When indicated following HELLP syndrome or liver involvement' },
      { id: 12, name: 'Coagulation Profile', purpose: 'When indicated' },
      { id: 13, name: 'Pelvic Ultrasound', purpose: 'When indicated for retained products of conception or subinvolution' }
    ]
  },
  {
    tableNumber: 5,
    tableName: 'Newborn Screening Tests',
    stage: 'Newborn Baby',
    category: 'Neonatal Care & Screening',
    items: [
      { id: 1, name: 'Newborn Blood Spot Screening', purpose: 'Dried blood spot heel-prick for inborn errors of metabolism' },
      { id: 2, name: 'Newborn Hearing Screening (OAE / AABR)', purpose: 'Early detection of congenital hearing impairment before 1 month' },
      { id: 3, name: 'Bilirubin Test / Jaundice Screening', purpose: 'Transcutaneous or total serum bilirubin for hyperbilirubinemia' },
      { id: 4, name: 'Pulse Oximetry Screening for CCHD', purpose: 'Screens for Critical Congenital Heart Disease at 24 hours of life' },
      { id: 5, name: 'Newborn Blood Glucose Test', purpose: 'Monitors infants of diabetic mothers, preterm, or small-for-gestational-age babies' },
      { id: 6, name: 'Newborn Blood Group and Rh Typing', purpose: 'When indicated for Rh-negative or O-positive mother' },
      { id: 7, name: 'Newborn Physical Examination', purpose: 'Systematic examination within 24 hours of birth' },
      { id: 8, name: 'Congenital Hypothyroidism Screening', purpose: 'TSH measurement to prevent neurodevelopmental delay' },
      { id: 9, name: 'Congenital Metabolic Disorder Screening', purpose: 'Tandem mass spectrometry panel' },
      { id: 10, name: 'G6PD Deficiency Screening', purpose: 'Where included in regional newborn screening programmes' }
    ]
  },
  {
    tableNumber: 6,
    tableName: 'Before Pregnancy — Sample Reference Values',
    stage: 'Before Pregnancy',
    category: 'Adult Baseline Norms',
    metrics: [
      { testName: 'Hemoglobin (adult female)', referenceValue: '12.0–15.5', unit: 'g/dL', normalMin: 12.0, normalMax: 15.5, cautionMin: 10.0, cautionMax: 11.9, lowRiskDesc: 'Normal non-pregnant female hemoglobin', highRiskDesc: 'Below 10.0 g/dL indicates moderate-to-severe anemia' },
      { testName: 'White Blood Cell Count (WBC)', referenceValue: '4,000–11,000', unit: 'cells/µL', normalMin: 4000, normalMax: 11000 },
      { testName: 'Platelet Count', referenceValue: '150,000–450,000', unit: 'cells/µL', normalMin: 150000, normalMax: 450000 },
      { testName: 'Blood Glucose, fasting', referenceValue: '70–99', unit: 'mg/dL', normalMin: 70, normalMax: 99, cautionMin: 100, cautionMax: 125, highRiskDesc: '>= 126 mg/dL indicates pre-existing Diabetes Mellitus' },
      { testName: 'HbA1c', referenceValue: 'Below 5.7%', unit: '%', normalMax: 5.7, cautionMax: 6.4, highRiskDesc: '>= 6.5% indicates pre-existing diabetes' },
      { testName: 'Thyroid-Stimulating Hormone (TSH)', referenceValue: '0.4–4.0', unit: 'mIU/L', normalMin: 0.4, normalMax: 4.0 },
      { testName: 'Blood Group', referenceValue: 'A, B, AB or O', unit: 'Group' },
      { testName: 'Rh Type', referenceValue: 'Positive or negative', unit: 'Status' },
      { testName: 'Rubella IgG', referenceValue: 'Lab-specific; interpreted as immune/non-immune', unit: 'IU/mL or index' },
      { testName: 'HIV Screening', referenceValue: 'Non-reactive', unit: 'Qualitative' },
      { testName: 'HBsAg', referenceValue: 'Non-reactive', unit: 'Qualitative' },
      { testName: 'Anti-HCV', referenceValue: 'Non-reactive', unit: 'Qualitative' },
      { testName: 'VDRL/RPR', referenceValue: 'Non-reactive', unit: 'Qualitative' },
      { testName: 'Urine Protein', referenceValue: 'Negative or trace', unit: 'Qualitative' },
      { testName: 'Urine Glucose', referenceValue: 'Negative', unit: 'Qualitative' }
    ]
  },
  {
    tableNumber: 7,
    tableName: 'During Pregnancy — Sample Reference Values',
    stage: 'During Pregnancy',
    category: 'Antenatal Gestational Reference Limits',
    metrics: [
      { testName: 'Serum Beta-hCG', referenceValue: 'Varies widely with gestational age', unit: 'mIU/mL' },
      { testName: 'Hemoglobin, 1st trimester', referenceValue: 'Anemia generally defined as below 11.0', unit: 'g/dL', normalMin: 11.0, normalMax: 15.0, cautionMin: 9.0, cautionMax: 10.9, highRiskThreshold: 9.0 },
      { testName: 'Hemoglobin, 2nd trimester', referenceValue: 'Anemia generally defined as below 10.5', unit: 'g/dL', normalMin: 10.5, normalMax: 14.5, cautionMin: 9.0, cautionMax: 10.4, highRiskThreshold: 9.0 },
      { testName: 'Hemoglobin, 3rd trimester', referenceValue: 'Anemia generally defined as below 11.0', unit: 'g/dL', normalMin: 11.0, normalMax: 15.0, cautionMin: 9.0, cautionMax: 10.9, highRiskThreshold: 9.0 },
      { testName: 'Platelet Count', referenceValue: 'Typically 150,000–450,000', unit: 'cells/µL', normalMin: 150000, normalMax: 450000, cautionMin: 100000, highRiskThreshold: 100000 },
      { testName: 'Blood Group', referenceValue: 'A, B, AB or O', unit: 'Group' },
      { testName: 'Rh Type', referenceValue: 'Positive or negative', unit: 'Status' },
      { testName: 'Fasting glucose', referenceValue: 'Depends on the test and clinical context (< 92 mg/dL)', unit: 'mg/dL', normalMax: 92, highRiskThreshold: 92 },
      { testName: '75-g OGTT, fasting', referenceValue: 'Gestational diabetes threshold commonly 92', unit: 'mg/dL', normalMax: 92, highRiskThreshold: 92 },
      { testName: '75-g OGTT, 1 hour', referenceValue: 'Gestational diabetes threshold commonly 180', unit: 'mg/dL', normalMax: 180, highRiskThreshold: 180 },
      { testName: '75-g OGTT, 2 hours', referenceValue: 'Gestational diabetes threshold commonly 153', unit: 'mg/dL', normalMax: 153, highRiskThreshold: 153 },
      { testName: 'TSH', referenceValue: 'Use trimester- and laboratory-specific ranges', unit: 'mIU/L' },
      { testName: 'HIV Screening', referenceValue: 'Non-reactive', unit: 'Qualitative' },
      { testName: 'HBsAg', referenceValue: 'Non-reactive', unit: 'Qualitative' },
      { testName: 'Syphilis Screening', referenceValue: 'Non-reactive', unit: 'Qualitative' },
      { testName: 'Urine Protein', referenceValue: 'Usually negative; interpret with blood pressure and symptoms', unit: 'Qualitative' },
      { testName: 'Urine Culture', referenceValue: 'No significant bacterial growth in a negative culture', unit: 'Culture result' },
      { testName: 'Fetal Heart Rate', referenceValue: 'Approximately 110–160', unit: 'beats/min', normalMin: 110, normalMax: 160, cautionMin: 100, cautionMax: 170, highRiskDesc: '<110 bpm indicates fetal bradycardia; >160 bpm indicates tachycardia' },
      { testName: 'Nuchal Translucency (NT)', referenceValue: 'Interpret by crown-rump length and gestational age (< 3.0 mm)', unit: 'mm' },
      { testName: 'Fetal Growth Ultrasound', referenceValue: 'Interpret using gestational-age-specific percentiles (10th to 90th)', unit: 'Percentile' },
      { testName: 'Non-Stress Test (NST)', referenceValue: 'Interpretation depends on gestational age and tracing (Reactive)', unit: 'Reactive/non-reactive' },
      { testName: 'Maternal Blood Pressure (Systolic)', referenceValue: 'Usually below 140', unit: 'mmHg', normalMax: 139, cautionMax: 159, highRiskThreshold: 160 },
      { testName: 'Maternal Blood Pressure (Diastolic)', referenceValue: 'Usually below 90', unit: 'mmHg', normalMax: 89, cautionMax: 109, highRiskThreshold: 110 }
    ]
  },
  {
    tableNumber: 8,
    tableName: 'During Delivery — Monitoring Values',
    stage: 'During Delivery',
    category: 'Intrapartum Vital & Clinical Limits',
    metrics: [
      { testName: 'Maternal blood pressure', referenceValue: 'Usually below 140/90', unit: 'mmHg', normalMaxSys: 139, normalMaxDia: 89 },
      { testName: 'Maternal pulse', referenceValue: 'Often 60–100 at rest, interpreted clinically', unit: 'beats/min', normalMin: 60, normalMax: 100 },
      { testName: 'Maternal temperature', referenceValue: 'Approximately 36.0–37.5', unit: '°C', normalMin: 36.0, normalMax: 37.5, highRiskThreshold: 38.0 },
      { testName: 'Fetal heart rate', referenceValue: 'Approximately 110–160', unit: 'beats/min', normalMin: 110, normalMax: 160 },
      { testName: 'Oxygen saturation', referenceValue: 'Usually 95% or higher at sea level', unit: '%', normalMin: 95 },
      { testName: 'Cervical dilatation', referenceValue: '0–10', unit: 'cm' },
      { testName: 'Uterine contractions', referenceValue: 'Frequency, duration and strength assessed together', unit: 'Clinical assessment' },
      { testName: 'Membrane status', referenceValue: 'Intact or ruptured', unit: 'Status' },
      { testName: 'Hemoglobin', referenceValue: 'Use the laboratory reference range and clinical context', unit: 'g/dL' },
      { testName: 'Platelet Count', referenceValue: 'Use laboratory range and clinical context', unit: 'cells/µL' },
      { testName: 'Blood Group and Crossmatch', referenceValue: 'Compatible blood if transfusion is required', unit: 'Qualitative' }
    ]
  },
  {
    tableNumber: 9,
    tableName: 'After Delivery — Sample Test Values (Mother)',
    stage: 'After Delivery',
    category: 'Postpartum Maternal Norms',
    metrics: [
      { testName: 'Hemoglobin', referenceValue: 'Adult female reference often 12.0–15.5; postpartum depends on blood loss and symptoms', unit: 'g/dL', normalMin: 11.0 },
      { testName: 'Platelet Count', referenceValue: 'Typically 150,000–450,000', unit: 'cells/µL', normalMin: 150000, normalMax: 450000 },
      { testName: 'White Blood Cell Count', referenceValue: 'May be elevated after childbirth; interpret by clinical context', unit: 'cells/µL' },
      { testName: 'Blood Pressure', referenceValue: 'Usually below 140/90', unit: 'mmHg', normalMaxSys: 139, normalMaxDia: 89 },
      { testName: 'Fasting Blood Glucose', referenceValue: '70–99 in non-pregnant adults', unit: 'mg/dL', normalMin: 70, normalMax: 99 },
      { testName: 'Postpartum 75-g OGTT, fasting', referenceValue: 'Below 100 is normal by standard non-pregnant criteria', unit: 'mg/dL', normalMax: 99 },
      { testName: 'Postpartum 75-g OGTT, 2 hours', referenceValue: 'Below 140 is normal by standard non-pregnant criteria', unit: 'mg/dL', normalMax: 139, cautionMax: 199, highRiskThreshold: 200 },
      { testName: 'TSH', referenceValue: 'Laboratory-specific adult reference range', unit: 'mIU/L' },
      { testName: 'Urine Protein', referenceValue: 'Usually negative; interpret with symptoms and blood pressure', unit: 'Qualitative' },
      { testName: 'Kidney Function', referenceValue: 'Creatinine interpreted against laboratory range and clinical context', unit: 'mg/dL' },
      { testName: 'Liver Function', referenceValue: 'AST/ALT interpreted against laboratory-specific ranges', unit: 'U/L' }
    ]
  },
  {
    tableNumber: 10,
    tableName: 'Newborn Baby — Sample Reference Values',
    stage: 'Newborn Baby',
    category: 'Neonatal Baseline Parameters',
    metrics: [
      { testName: 'Birth Weight', referenceValue: 'Common term newborn range approximately 2.5–4.0', unit: 'kg', normalMin: 2.5, normalMax: 4.0, highRiskThreshold: 2.5 },
      { testName: 'Apgar Score', referenceValue: 'Recorded at 1 and 5 minutes; 7–10 is generally reassuring at 5 minutes', unit: 'Score / 10', normalMin: 7, normalMax: 10, highRiskThreshold: 6 },
      { testName: 'Newborn Heart Rate', referenceValue: 'Commonly around 100–160', unit: 'beats/min', normalMin: 100, normalMax: 160 },
      { testName: 'Newborn Temperature', referenceValue: 'Approximately 36.5–37.5', unit: '°C', normalMin: 36.5, normalMax: 37.5 },
      { testName: 'Oxygen Saturation', referenceValue: 'Depends on minutes after birth and screening protocol (>= 95%)', unit: '%', normalMin: 95 },
      { testName: 'Bilirubin', referenceValue: 'Must be interpreted by age in hours, gestational age and risk factors', unit: 'mg/dL' },
      { testName: 'Blood Glucose', referenceValue: 'Threshold depends on age, symptoms and clinical protocol (>= 45 mg/dL)', unit: 'mg/dL', normalMin: 45 },
      { testName: 'Newborn Blood Group', referenceValue: 'A, B, AB or O, if tested', unit: 'Group' },
      { testName: 'Rh Type', referenceValue: 'Positive or negative, if tested', unit: 'Status' },
      { testName: 'Newborn Hearing Screening', referenceValue: 'Pass / refer', unit: 'Qualitative' },
      { testName: 'Newborn Blood Spot Screening', referenceValue: 'Condition-specific screening result', unit: 'Result' },
      { testName: 'Congenital Hypothyroidism Screening', referenceValue: 'Assessed using programme-specific TSH/T4 cutoffs', unit: 'Lab-specific' }
    ]
  }
];

export const BILINGUAL_QA_PAIRS = [
  {
    topic_id: 1,
    topic: 'Registration',
    question_en: 'How do I register as a patient?',
    answer_en: 'Visit the hospital registration desk or use the hospital’s approved registration process. Share the requested details and a valid contact number. Keep your patient ID for future visits.',
    question_te: 'రోగిగా ఎలా నమోదు చేసుకోవాలి?',
    answer_te: 'ఆసుపత్రి రిజిస్ట్రేషన్ డెస్క్ వద్ద లేదా ఆమోదించిన విధానం ద్వారా వివరాలు మరియు ఫోన్ నంబర్ ఇచ్చి నమోదు చేసుకోండి. మీ పేషెంట్ ఐడీని భవిష్యత్ అవసరాల కోసం భద్రంగా ఉంచుకోండి.'
  },
  {
    topic_id: 2,
    topic: 'Registration',
    question_en: 'Do I need to register again for every visit?',
    answer_en: 'Usually, no. Your permanent patient ID should be used for later visits. A new visit or appointment record may be created each time. If you have forgotten your ID, ask the registration desk to help verify your identity.',
    question_te: 'ప్రతి విజిట్‌కు మళ్లీ నమోదు చేసుకోవాలా?',
    answer_te: 'సాధారణంగా అవసరం లేదు. మీ శాశ్వత పేషెంట్ ఐడీని తరువాతి విజిట్‌లకు ఉపయోగించాలి. ఒకవేళ ఐడీ మర్చిపోతే, గుర్తింపు ధృవీకరణ కోసం రిజిస్ట్రేషన్ డెస్క్‌ను సంప్రదించండి.'
  },
  {
    topic_id: 6,
    topic: 'Reports',
    question_en: 'How do I get my test results?',
    answer_en: 'Ask the hospital how and when results will be released. Results may be available through the hospital’s approved portal or records desk. Identity verification may be required before sharing them.',
    question_te: 'నా పరీక్ష ఫలితాలను నేను ఎలా పొందగలను?',
    answer_te: 'ఫలితాలు ఎప్పుడు మరియు ఎలా వస్తాయో ఆసుపత్రిని అడగండి. ఆసుపత్రి పోర్టల్ లేదా రికార్డ్స్ డెస్క్ ద్వారా ఫలితాలు అందుబాటులో ఉంటాయి. గుర్తింపు ధృవీకరణ అవసరం కావచ్చు.'
  },
  {
    topic_id: 7,
    topic: 'Lab Diagnostics',
    question_en: 'Do all blood tests require fasting?',
    answer_en: 'No. Fasting depends on the specific test. Follow the instructions given by your clinician or laboratory. Routine CBC and Blood Group do not require fasting, while Fasting Blood Glucose and OGTT require 8-10 hours fasting.',
    question_te: 'అన్ని రక్త పరీక్షలకు ఉపవాసం (ఫాస్టింగ్) అవసరమా?',
    answer_te: 'కాదు. ఉపవాసం అనేది నిర్దిష్ట పరీక్షపై ఆధారపడి ఉంటుంది. ఫాస్టింగ్ బ్లడ్ షుగర్ మరియు OGTT కి మాత్రమే ఉపవాసం అవసరం. సాధారణ CBC లేదా బ్లడ్ గ్రూప్‌కు ఉపవాసం అక్కర్లేదు.'
  },
  {
    topic_id: 13,
    topic: 'General Health',
    question_en: 'What should I do if I have a fever?',
    answer_en: 'Rest and drink fluids if you can, and contact a healthcare professional for advice—especially if the fever is persistent, worsening, or affects a pregnant mother or newborn. Seek urgent care for trouble breathing or confusion.',
    question_te: 'నాకు జ్వరం వస్తే నేను ఏమి చేయాలి?',
    answer_te: 'విశ్రాంతి తీసుకోండి, ద్రవాలు ఎక్కువగా తాగండి. జ్వరం తగ్గకపోతే లేదా గర్భిణీలకు, శిశువులకు వస్తే వెంటనే వైద్యుడిని సంప్రదించండి. శ్వాస తీసుకోవడంలో ఇబ్బంది ఉంటే వెంటనే అత్యవసర చికిత్స తీసుకోండి.'
  },
  {
    topic_id: 14,
    topic: 'Emergencies',
    question_en: 'When should I seek emergency care?',
    answer_en: 'Seek emergency medical help immediately for severe difficulty breathing, chest pain, signs of stroke, heavy bleeding, loss of consciousness, seizures, or severe allergic reaction. Do not wait for an online answer or routine appointment.',
    question_te: 'నేను అత్యవసర సంరక్షణను ఎప్పుడు పొందాలి?',
    answer_te: 'తీవ్రమైన శ్వాస ఆడకపోవడం, ఛాతీ నొప్పి, తీవ్ర రక్తస్రావం, స్పృహ కోల్పోవడం, ఫిట్స్ లేదా తీవ్రమైన అలర్జీ ఉంటే వెంటనే అత్యవసర వైద్య సహాయం పొందండి. చాట్ లేదా రొటీన్ అపాయింట్‌మెంట్ కోసం వేచి ఉండకండి.'
  },
  {
    topic_id: 15,
    topic: 'Pregnancy',
    question_en: 'I am pregnant. When should I attend antenatal check-ups?',
    answer_en: 'Arrange antenatal care as early as possible and follow the schedule recommended by your obstetric clinician. Standard cadence: monthly until 28 weeks, every 2 weeks until 36 weeks, and weekly thereafter. Seek urgent care for bleeding, abdominal pain, or decreased fetal kicks.',
    question_te: 'నేను గర్భవతిని. నేను ఎప్పుడు ప్రసవపూర్వ పరీక్షలకు హాజరుకావాలి?',
    answer_te: 'సాధ్యమైనంత త్వరగా గర్భధారణ నమోదు చేయించుకుని క్రమం తప్పకుండా పరీక్షలకు వెళ్ళండి. తీవ్రమైన రక్తస్రావం, కడుపునొప్పి లేదా బిడ్డ కదలికలు తగ్గితే వెంటనే అత్యవసర సంరక్షణ పొందండి.'
  },
  {
    topic_id: 16,
    topic: 'Medicines & Prescriptions',
    question_en: 'Can I take medicines during pregnancy?',
    answer_en: 'Do not start, stop, or change a medicine, supplement, or herbal product without advice from your obstetric clinician or pharmacist. Routine Iron, Calcium, and Folic Acid must be taken strictly as prescribed.',
    question_te: 'గర్భధారణ సమయంలో నేను మందులు తీసుకోవచ్చా?',
    answer_te: 'మీ వైద్యుని సలహా లేకుండా ఎటువంటి మందులు, సప్లిమెంట్లు లేదా మూలికా ఉత్పత్తులను ప్రారంభించవద్దు లేదా ఆపవద్దు. వైద్యులు సూచించిన ఐరన్, కాల్షియం, ఫోలిక్ యాసిడ్ మాత్రమే క్రమబద్ధంగా వాడాలి.'
  },
  {
    topic_id: 34,
    topic: 'Pregnancy',
    question_en: 'How can I manage high blood pressure in pregnancy?',
    answer_en: 'Have blood pressure measured correctly. Blood pressure >= 140/90 requires careful obstetric monitoring. Limit added salt, take prescribed anti-hypertensives (such as Labetalol) regularly, and seek emergency care for severe headache, vision changes, or upper belly pain.',
    question_te: 'గర్భధారణలో అధిక రక్తపోటును ఎలా నియంత్రించాలి?',
    answer_te: 'రక్తపోటు 140/90 లేదా అంతకంటే ఎక్కువ ఉంటే తప్పనిసరిగా వైద్యుల పర్యవేక్షణలో ఉండాలి. అదనపు ఉప్పు తగ్గించండి, సూచించిన మందులు క్రమం తప్పకుండా వేసుకోండి. తీవ్ర తలనొప్పి లేదా కంటి చూపు మసకబారితే వెంటనే ఆసుపత్రికి వెళ్ళండి.'
  },
  {
    topic_id: 35,
    topic: 'Pregnancy',
    question_en: 'What are signs of gestational diabetes?',
    answer_en: 'Possible symptoms include increased thirst, frequent urination, fatigue, and rapid fetal weight gain, though many mothers show no symptoms. An Oral Glucose Tolerance Test (OGTT 75g) at 24–28 weeks is standard for diagnosis.',
    question_te: 'గర్భధారణ మధుమేహం (షుగర్) లక్షణాలు ఏమిటి?',
    answer_te: 'ఎక్కువగా దాహం వేయడం, మాటిమాటికి మూత్రవిసర్జన, నీరసం సాధారణ లక్షణాలు. చాలామందికి ఎటువంటి లక్షణాలు కనిపించకపోవచ్చు, కాబట్టి 24-28 వారాల్లో 75-g OGTT రక్త పరీక్ష ద్వారా ఖచ్చితంగా నిర్ధారించుకోవాలి.'
  },
  {
    topic_id: 47,
    topic: 'Pregnancy Warning Signs',
    question_en: 'What are warning signs during pregnancy?',
    answer_en: 'Seek urgent medical assessment for heavy vaginal bleeding, severe abdominal pain, fainting, severe headache with vision changes, difficulty breathing, seizures, fluid leakage, or reduced fetal kicks.',
    question_te: 'గర్భధారణ సమయంలో ప్రమాద హెచ్చరిక సంకేతాలు ఏమిటి?',
    answer_te: 'తీవ్ర రక్తస్రావం, తీవ్రమైన కడుపు నొప్పి, కళ్ళు తిరగడం, కంటి చూపు మసకబారడం, శ్వాస తీసుకోవడంలో ఇబ్బంది, ఉమ్మనీరు కారడం లేదా పిండం కదలికలు తగ్గడం ప్రమాద సంకేతాలు; వెంటనే ఆసుపత్రికి వెళ్ళాలి.'
  },
  {
    topic_id: 48,
    topic: 'Medicines & Prescriptions',
    question_en: 'Can I take painkillers during pregnancy?',
    answer_en: 'Do not take painkillers or NSAIDs during pregnancy without advice from your obstetric clinician. Paracetamol is commonly considered only when clinically indicated and approved; avoid aspirin or ibuprofen unless specifically prescribed.',
    question_te: 'గర్భధారణలో నొప్పి నివారణ మందులు (పెయిన్‌కిల్లర్స్) తీసుకోవచ్చా?',
    answer_te: 'వైద్యుల సలహా లేకుండా పెయిన్‌కిల్లర్స్ తీసుకోకూడదు. అవసరమైతే వైద్యులు ఆమోదించిన నిర్దిష్ట మోతాదులో మాత్రమే వాడాలి. ఇబుప్రోఫెన్ వంటి మందులను నివారించాలి.'
  },
  {
    topic_id: 54,
    topic: 'Diet & Routine',
    question_en: 'How can I maintain a healthy diet during pregnancy?',
    answer_en: 'Aim for a balanced diet rich in green leafy vegetables, seasonal fruits, whole grains, pulses, dairy (milk/curd for calcium), and at least 2.5 to 3 liters of clean water daily. Avoid raw or unpasteurized foods.',
    question_te: 'ఆరోగ్యకరమైన ఆహారాన్ని ఎలా నిర్వహించాలి?',
    answer_te: 'తాజా ఆకుకూరలు, సీజనల్ పండ్లు, తృణధాన్యాలు, పప్పుదినుసులు మరియు పాలు/పెరుగుతో కూడిన సమతుల్య ఆహారం తీసుకోండి. రోజుకు కనీసం 2.5 నుండి 3 లీటర్ల శుభ్రమైన నీరు తాగండి.'
  },
  {
    topic_id: 91,
    topic: 'AI Safety & Guidance',
    question_en: 'Can JanmaLink AI recommend a dose from a report?',
    answer_en: 'No. The AI must not create or alter prescription doses. It explains clinical report metrics against source reference tables, suggests home food choices and verified lifestyle habits, and directs prescription adjustments to the treating clinician.',
    question_te: 'రిపోర్ట్ ఆధారంగా AI మోతాదును సిఫార్సు చేయగలదా?',
    answer_te: 'లేదు. JanmaLink AI మోతాదును స్వతంత్రంగా మార్చదు. ఇది రిపోర్టును రిఫరెన్స్ టేబుల్స్ ఆధారంగా విశ్లేషించి ఆహార నియమాలు మరియు మందుల సమయపాలనపై మార్గదర్శకత్వం మాత్రమే ఇస్తుంది.'
  }
];

export const CLINICAL_ACTIONABLE_GUIDANCE = {
  anemia: {
    condition_en: 'Maternal Anemia (Low Hemoglobin)',
    condition_te: 'రక్తహీనత (తక్కువ హిమోగ్లోబిన్ స్థాయిలు)',
    condition_hi: 'मातृ एनीमिया (कम हीमोग्लोबिन स्तर)',
    issue_en: 'Your Hemoglobin level is below the reference threshold (normal >= 11.0 g/dL in 1st/3rd trimester, >= 10.5 g/dL in 2nd trimester as per Source Table 7). This means red blood cells carry less oxygen to you and your growing baby, resulting in fatigue, dizziness, and risk during delivery.',
    issue_te: 'మీ హిమోగ్లోబిన్ స్థాయి సాధారణ ప్రమాణం కంటే తక్కువగా ఉంది (రిఫరెన్స్ టేబుల్ 7 ప్రకారం కనీసం 11.0 g/dL ఉండాలి). దీనివల్ల మీ శరీరానికి మరియు కడుపులోని బిడ్డకు ఆక్సిజన్ అందడం తగ్గి తీవ్ర అలసట, నీరసం మరియు ప్రసవ సమయంలో సమస్యలు వచ్చే అవకాశం ఉంది.',
    issue_hi: 'आपका हीमोग्लोबिन स्तर संदर्भ मानक से कम है (सोर्स टेबल 7 के अनुसार 11.0 g/dL या 10.5 g/dL से ऊपर होना चाहिए)। इससे शरीर और शिशु तक ऑक्सीजन का प्रवाह कम हो जाता है, जिससे कमजोरी, चक्कर और प्रसव जटिलताओं का खतरा रहता है।',
    foods_en: [
      'Iron-rich green leafy vegetables: Spinach (Palak), Fenugreek leaves (Methi), Drumstick leaves (Munagaku)',
      'Iron-dense fruits & dry fruits: Pomegranates, Dates (Kharjoora), Figs (Anjeer), Black raisins',
      'Cooked beets and carrots, Jaggery (Bellam) in moderate amounts with roasted gram',
      'Proteins: Well-cooked lentils (dal), sprouted pulses, and boiled eggs (for non-vegetarians)',
      'Vitamin C boosters to enhance iron absorption: Fresh lemon juice, amla (Indian gooseberry), and oranges'
    ],
    foods_te: [
      'ఆకుకూరలు: పాలకూర, తోటకూర, మునగాకు మరియు మెంతికూర తరచుగా తీసుకోవాలి',
      'పండ్లు & డ్రై ఫ్రూట్స్: దానిమ్మ పండు, ఖర్జూరం, అంజీర, నల్ల ద్రాక్ష',
      'కూరగాయలు: ఉడకబెట్టిన బీట్‌రూట్, క్యారెట్, మరియు కొద్దిగా బెల్లం-వేరుశెనగ గుళ్లు',
      'ప్రోటీన్లు: ఉడకబెట్టిన గుడ్లు, పప్పుధాన్యాలు మరియు మొలకెత్తిన గింజలు',
      'విటమిన్-సి: ఐరన్ బాగా ఒంటపట్టడానికి తాజా నిమ్మరసం, ఉసిరికాయ మరియు బత్తాయి రసం తాగాలి'
    ],
    foods_hi: [
      'हरी पत्तेदार सब्जियां: पालक, मेथी, सहजन (मुनगा) की पत्तियां नियमित रूप से खाएं',
      'फल और सूखे मेवे: अनार, खजूर, अंजीर, काली किशमिश',
      'सब्जियां: उबला हुआ चुकंदर, गाजर, और भुने चने के साथ थोड़ा गुड़',
      'प्रोटीन: उबले अंडे (मांसाहारी होने पर), दालें और अंकुरित अनाज',
      'विटामिन सी: आयरन के बेहतर अवशोषण के लिए ताजा नींबू पानी, आंवला और संतरा लें'
    ],
    medication_en: [
      'Routine Iron + Folic Acid (IFA) tablets: Take 1 tablet daily at bedtime or 1 hour after lunch consistently for at least 60–90 days.',
      'Always take iron tablets with water or a sip of lemon water. NEVER take iron with milk, tea, or coffee.',
      'Maintain at least a 2-hour gap between Calcium tablets and Iron tablets to prevent absorption blocking.',
      'Schedule a repeat Hemoglobin CBC test after 3 to 4 weeks to verify improvement.'
    ],
    medication_te: [
      'ఐరన్ మరియు ఫోలిక్ యాసిడ్ మాత్రలు: రోజూ ఒకే సమయానికి (రాత్రి పడుకునే ముందు లేదా మధ్యాహ్న భోజనం తర్వాత 1 గంటకు) కనీసం 60 నుండి 90 రోజులు క్రమం తప్పకుండా వేసుకోవాలి.',
      'ఐరన్ మాత్రలను నిమ్మరసం లేదా నీటితో మాత్రమే వేసుకోవాలి. పాలు, కాఫీ లేదా టీతో కలిపి ఎప్పుడూ వేసుకోకూడదు.',
      'కాల్షియం మాత్రకు మరియు ఐరన్ మాత్రకు మధ్య కనీసం 2 గంటల వ్యవధి ఉండాలి.',
      '3 నుండి 4 వారాల తర్వాత మళ్ళీ హిమోగ్లోబిన్ రక్త పరీక్ష చేయించుకుని స్థాయిలు పెరిగాయో లేదో తెలుసుకోవాలి.'
    ],
    medication_hi: [
      'आयरन और फोलिक एसिड (IFA) गोलियां: रोजाना रात को सोने से पहले या दोपहर के खाने के 1 घंटे बाद 60-90 दिनों तक लगातार लें।',
      'आयरन की गोली हमेशा नींबू पानी या सादे पानी के साथ लें। दूध, चाय या कॉफी के साथ कभी न लें।',
      'कैल्शियम और आयरन की गोलियों के बीच कम से कम 2 घंटे का अंतर रखें।',
      '3 से 4 सप्ताह बाद दोबारा हीमोग्लोबिन रक्त परीक्षण कराएं।'
    ],
    escalation_en: 'If you experience severe dizziness, breathlessness while resting, pale skin, or fainting, visit the hospital labor ward immediately.',
    escalation_te: 'విపరీతమైన కళ్ళు తిరగడం, విశ్రాంతిలో కూడా ఆయాసం రావడం, లేదా స్పృహ తప్పే పరిస్థితి వస్తే వెంటనే ఆసుపత్రికి వెళ్ళండి.',
    escalation_hi: 'यदि आपको अत्यधिक चक्कर आना, आराम के समय भी सांस फूलना, या बेहोशी महसूस हो तो तुरंत अस्पताल जाएं।'
  },

  hypertension: {
    condition_en: 'Elevated Maternal Blood Pressure / Preeclampsia Alert',
    condition_te: 'అధిక రక్తపోటు / ప్రీ-ఎక్లాంప్సియా హెచ్చరిక',
    condition_hi: 'उच्च रक्तचाप / प्री-एक्लेमप्सिया चेतावनी',
    issue_en: 'Your blood pressure is elevated (>= 140/90 mmHg as documented in Source Table 7 & 8). High blood pressure constricts placental blood vessels, reducing blood flow to the baby, and when combined with urine albumin, indicates preeclampsia risk.',
    issue_te: 'మీ రక్తపోటు సాధారణం కంటే ఎక్కువగా ఉంది (రిఫరెన్స్ టేబుల్ 7 & 8 ప్రకారం 140/90 mmHg దాటింది). అధిక రక్తపోటు వల్ల గర్భాశయానికి మరియు బిడ్డకు రక్త ప్రసరణ తగ్గిపోతుంది. మూత్రంలో అల్బుమిన్ (ప్రోటీన్) ఉన్నట్లయితే ప్రీ-ఎక్లాంప్సియా ముప్పు పెరుగుతుంది.',
    issue_hi: 'आपका रक्तचाप सामान्य से अधिक है (सोर्स टेबल 7 और 8 के अनुसार 140/90 mmHg से ऊपर)। उच्च रक्तचाप गर्भनाल में रक्त प्रवाह को कम करता है, और पेशाब में प्रोटीन होने पर प्री-एक्लेमप्सिया का खतरा बढ़ जाता है।',
    foods_en: [
      'Strictly avoid pickles (ooragayalu), papads (appadalu), packaged salty snacks, and canned foods.',
      'Limit cooking salt to less than 1 level teaspoon per day; do not sprinkle raw salt onto salads or curries.',
      'Hydrate with tender coconut water (rich in natural potassium), fresh barley water, and at least 2.5–3 liters of water.',
      'Eat fresh garlic, steamed bottle gourd (sorakaya), oats, and unsalted nuts.',
      'Avoid high caffeine drinks (strong coffee, tea, and colas).'
    ],
    foods_te: [
      'ఉప్పు ఎక్కువగా ఉండే పచ్చళ్ళు, అప్పడాలు, చిప్స్ మరియు ప్రాసెస్ చేసిన ఆహారాలను పూర్తిగా మానివేయాలి.',
      'వంటల్లో ఉప్పును రోజుకు ఒక చెంచా లోపే వాడాలి; పళ్ళపై లేదా అన్నంపై పచ్చి ఉప్పు చల్లుకోరాదు.',
      'పొటాషియం సమృద్ధిగా ఉండే కొబ్బరి నీళ్ళు, బార్లీ నీళ్ళు మరియు రోజూ 3 లీటర్ల మంచినీరు తాగాలి.',
      'సొరకాయ, తాజా కూరగాయలు, ఓట్స్ మరియు వెల్లుల్లి ఆహారంలో చేర్చుకోవాలి.',
      'కాఫీ, టీ మరియు కూల్ డ్రింక్స్ పూర్తిగా తగ్గించాలి.'
    ],
    foods_hi: [
      'अचार, पापड़, नमकीन चिप्स और डिब्बाबंद खाद्य पदार्थों से पूरी तरह परहेज करें।',
      'भोजन में नमक प्रतिदिन 1 चम्मच से कम रखें; सलाद या पके खाने पर कच्चा नमक न डालें।',
      'पोटैशियम युक्त नारियल पानी, जौ का पानी और रोजाना 2.5-3 लीटर साफ पानी पिएं।',
      'लौकी, हरी सब्जियां, ओट्स और बिना नमक वाले मेवे खाएं।',
      'तेज चाय, कॉफी और कोल्ड ड्रिंक्स से बचें।'
    ],
    medication_en: [
      'Anti-hypertensive medication (such as Labetalol): Take strictly as prescribed by your obstetrician at the exact prescribed hour every morning and evening without skipping.',
      'Record your BP twice daily in a home logbook.',
      'Practice left-lateral resting for 1 to 2 hours every afternoon (improves kidney and uteroplacental perfusion).',
      'Never discontinue or alter BP medicines independently even if you feel completely normal.'
    ],
    medication_te: [
      'బీపీ మందులు (ఉదాహరణకు లాబెటాలాల్): డాక్టర్ సూచించిన సమయానికి ఉదయం మరియు సాయంత్రం ఒక రోజు కూడా మానకుండా ఖచ్చితంగా వేసుకోవాలి.',
      'రోజూ ఉదయం మరియు సాయంత్రం బీపీ చెక్ చేసుకుని డైరీలో రాసి ఉంచుకోవాలి.',
      'మధ్యాహ్నం వేళల్లో ఎడమవైపు తిరిగి 1-2 గంటలు విశ్రాంతి తీసుకోవడం వల్ల గర్భాశయానికి రక్త ప్రసరణ బాగుంటుంది.',
      'లక్షణాలు లేకపోయినా డాక్టర్ చెప్పేంతవరకు బీపీ మందులను ఎట్టి పరిస్థితుల్లోనూ ఆపకూడదు.'
    ],
    medication_hi: [
      'बीपी की दवाएं (जैसे लेबेटालोल): डॉक्टर द्वारा बताए गए समय पर सुबह और शाम बिना छूटे नियमित लें।',
      'रोजाना सुबह और शाम बीपी मापकर डायरी में नोट करें।',
      'दोपहर में 1-2 घंटे बाईं करवट लेकर आराम करें, इससे गर्भाशय में रक्त संचार बेहतर होता है।',
      'डॉक्टर की सलाह के बिना बीपी की दवा कभी बंद न करें।'
    ],
    escalation_en: 'SEEK EMERGENCY CARE IMMEDIATELY if you notice: severe front-headache not relieved by rest, flashing spots or blurred vision, sudden swelling of face/fingers, or pain under right ribs.',
    escalation_te: 'అత్యవసర హెచ్చరిక: తీవ్రమైన తలనొప్పి, కంటిముందు మెరుపులు లేదా చూపు మసకబారడం, ముఖం మరియు చేతులపై ఆకస్మిక వాపు, లేదా కుడిపక్క కడుపు పైభాగంలో నొప్పి వస్తే క్షణం ఆలస్యం చేయకుండా ఆసుపత్రికి వెళ్ళాలి.',
    escalation_hi: 'आपातकालीन चेतावनी: तेज सिरदर्द, आंखों के सामने अंधेरा छाना, चेहरे या हाथों में अचानक सूजन, या पेट के ऊपरी हिस्से में दर्द होने पर तुरंत आपातकालीन चिकित्सा लें।'
  },

  gestational_diabetes: {
    condition_en: 'Gestational Diabetes Mellitus (Elevated Glucose / OGTT)',
    condition_te: 'గర్భధారణ మధుమేహం (అధిక గ్లూకోజ్ / షుగర్ స్థాయిలు)',
    condition_hi: 'गर्भावधि मधुमेह (ब्लड शुगर स्तर में वृद्धि)',
    issue_en: 'Your blood glucose or 75-g OGTT result exceeds the pregnancy thresholds defined in Source Table 7 (Fasting >= 92 mg/dL, 1-hr >= 180 mg/dL, or 2-hr >= 153 mg/dL). Elevated maternal blood sugar crosses the placenta, causing excessive fetal growth (macrosomia) and delivery difficulties.',
    issue_te: 'మీ రక్తంలో చక్కెర స్థాయిలు లేదా 75-g OGTT పరీక్ష ఫలితాలు రిఫరెన్స్ టేబుల్ 7 పరిమితులను మించి ఉన్నాయి (ఫాస్టింగ్ >= 92 mg/dL లేదా 2-గంటల OGTT >= 153 mg/dL). అధిక చక్కెర శిశువు శరీరంలోకి చేరి బిడ్డ బరువు అసాధారణంగా పెరగడానికి మరియు ప్రసవ సమస్యలకు దారితీస్తుంది.',
    issue_hi: 'आपका ब्लड शुगर या 75-g OGTT परिणाम गर्भावस्था सीमा से अधिक है (फास्टिंग >= 92 mg/dL या 2-घंटे OGTT >= 153 mg/dL)। उच्च शुगर गर्भनाल पार करके शिशु का वजन अत्यधिक बढ़ा सकती है।',
    foods_en: [
      'Replace polished white rice with low-glycemic complex carbohydrates: Finger millet (Ragi), Sorghum (Jowar), whole wheat rotis, and brown rice.',
      'Strictly eliminate white sugar, sweets, cold drinks, packaged fruit juices, cakes, and honey.',
      'Eat small, divided meals every 2.5 to 3 hours rather than heavy feast-like meals.',
      'High soluble fiber: Cucumbers, fenugreek seeds soaked in water, bitter gourd (karela), bottle gourd, and fresh salads before meals.',
      'Limit high-glycemic fruits like mangoes, bananas, sapota, and grapes; prefer green apples, guava, and papaya in small portions.'
    ],
    foods_te: [
      'తెల్ల బియ్యానికి బదులుగా ముతక ధాన్యాలు: రాగి జావ/రొట్టెలు, జొన్న రొట్టెలు, గోధుమ పిండి మరియు బ్రౌన్ రైస్ తీసుకోవాలి.',
      'పంచదార, తీపి మిఠాయిలు, కూల్ డ్రింక్స్, ప్యాక్ చేసిన ఫ్రూట్ జ్యూస్‌లు పూర్తిగా నిలిపివేయాలి.',
      'ఒకేసారి కడుపునిండా తినకుండా ప్రతి 2.5 నుండి 3 గంటలకు కొద్దికొద్దిగా ఆహారం విభజించి తినాలి.',
      'పీచు పదార్థాలు: కీరదోస, నానబెట్టిన మెంతులు, కాకరకాయ, సొరకాయ మరియు తాజా సలాడ్లు ఎక్కువగా తినాలి.',
      'మామిడి, అరటి, సపోటా పండ్లు తగ్గించి జామకాయ, బొప్పాయి, ఆపిల్ తక్కువ మోతాదులో తినాలి.'
    ],
    foods_hi: [
      'सफेद चावल की जगह मोटे अनाज: रागी, ज्वार, बाजरा, गेहूं की रोटी और ब्राउन राइस खाएं।',
      'सफेद चीनी, मिठाइयां, कोल्ड ड्रिंक्स, पैक किए गए जूस और केक पूरी तरह बंद करें।',
      'एक बार में ज्यादा न खाएं, हर 2.5 से 3 घंटे में थोड़ा-थोड़ा संतुलित भोजन लें।',
      'फाइबर युक्त खीरा, भीगी मेथी, करेला, लौकी और ताजा सलाद ज्यादा खाएं।',
      'आम, केला, चीकू और अंगूर सीमित करें; अमरूद, पपीता और सेब थोड़ी मात्रा में लें।'
    ],
    medication_en: [
      'Daily blood glucose self-monitoring: Check Fasting blood sugar and 2-hour Post-Meal blood sugar at least 3 days a week.',
      'Gentle post-meal walking: A relaxed 15–20 minute walk after meals helps muscles absorb glucose without insulin spikes.',
      'If prescribed oral hypoglycemic agents or insulin, take them strictly with meal timing as instructed by the doctor.',
      'Schedule periodic growth scans to monitor fetal abdominal circumference and amniotic fluid index (AFI).'
    ],
    medication_te: [
      'షుగర్ పరీక్ష: వారానికి కనీసం 3 రోజులు ఉదయం పరగడుపున (ఫాస్టింగ్) మరియు భోజనం చేసిన 2 గంటల తర్వాత గ్లూకోజ్ రీడింగ్స్ రికార్డ్ చేసుకోవాలి.',
      'నడక: భోజనం తర్వాత 15-20 నిమిషాలు నెమ్మదిగా నడవడం వల్ల చక్కెర స్థాయిలు అదుపులో ఉంటాయి.',
      'డాక్టర్ సూచించిన మాత్రలు లేదా ఇన్సులిన్ భోజన సమయానికి అనుగుణంగా క్రమం తప్పకుండా తీసుకోవాలి.',
      'శిశువు బరువు మరియు ఉమ్మనీరు స్థాయిలను గమనించడానికి నిర్ణీత సమయంలో అల్ట్రాసౌండ్ స్కాన్ చేయించుకోవాలి.'
    ],
    medication_hi: [
      'शुगर जांच: हफ्ते में 3 दिन खाली पेट (फास्टिंग) और भोजन के 2 घंटे बाद शुगर मापें।',
      'भोजन के बाद 15-20 मिनट धीमी गति से टहलें।',
      'डॉक्टर द्वारा दी गई शुगर की दवा या इंसुलिन भोजन के समय पर ही लें।',
      'शिशु के विकास और एमनियोटिक द्रव की निगरानी के लिए समय पर अल्ट्रासाउंड कराएं।'
    ],
    escalation_en: 'Report immediately if urine tests show 2+ ketones, if you feel extreme drowsiness, persistent nausea, or baby kicks feel sluggish.',
    escalation_te: 'విపరీతమైన మగత, వాంతులు, లేదా కడుపులో బిడ్డ కదలికలు బాగా నెమ్మదించినట్లు అనిపిస్తే వెంటనే వైద్యుడిని సంప్రదించండి.',
    escalation_hi: 'अत्यधिक चक्कर आना, उल्टी होना, या शिशु की हलचल बहुत कम महसूस होने पर तुरंत डॉक्टर से संपर्क करें।'
  },

  fetal_tachycardia_bradycardia: {
    condition_en: 'Abnormal Fetal Heart Rate (FHR Outside 110–160 bpm)',
    condition_te: 'పిండం గుండె చప్పుడులో అసహజత (110-160 bpm వెలుపల)',
    condition_hi: 'शिशु की हृदय गति में असामान्यता (110-160 bpm के बाहर)',
    issue_en: 'The fetal heart rate reading is outside the standard reference range (110–160 bpm as documented in Source Table 7 & 8). Rates below 110 bpm suggest fetal bradycardia/hypoxia; rates above 160 bpm suggest fetal tachycardia, maternal fever, or fetal stress.',
    issue_te: 'పిండం గుండె స్పందన రేటు సాధారణ పరిధి 110–160 bpm వెలుపల ఉంది (రిఫరెన్స్ టేబుల్ 7 & 8 ప్రకారం). 110 కంటే తక్కువ ఉంటే బ్రాడీకార్డియా (ఆక్సిజన్ కొరత), 160 కంటే ఎక్కువ ఉంటే టాకీకార్డియా (ఒత్తిడి లేదా జ్వరం) సంకేతం కావచ్చు.',
    issue_hi: 'शिशु की हृदय गति सामान्य सीमा 110–160 bpm के बाहर है। 110 से कम होना ब्रैडीकार्डिया (ऑक्सीजन की कमी) और 160 से अधिक होना टैचीकार्डिया (बुखार या तनाव) का संकेत हो सकता है।',
    foods_en: [
      'Drink 2 full glasses of cold water or fresh electrolyte water immediately (hydration often settles fetal heart rate).',
      'Rest comfortably on your left side to maximize uterine blood flow and placental oxygenation.',
      'Avoid caffeinated beverages completely.'
    ],
    foods_te: [
      'వెంటనే రెండు గ్లాసుల మంచినీరు లేదా ఓఆర్ఎస్ ఎలక్ట్రోలైట్ నీరు తాగండి.',
      'వెంటనే ఎడమవైపు తిరిగి పడుకుని విశ్రాంతి తీసుకోండి.',
      'టీ మరియు కాఫీ పూర్తిగా నివారించండి.'
    ],
    foods_hi: [
      'तुरंत 2 गिलास ठंडा साफ पानी या ओआरएस इलेक्ट्रोलाइट पिएं।',
      'तुरंत बाईं करवट लेकर आराम करें ताकि गर्भनाल में रक्त संचार बढ़े।',
      'चाय और कॉफी पूरी तरह बंद करें।'
    ],
    medication_en: [
      'Perform continuous Cardiotocography (CTG) or repeat Doppler auscultation after 20 minutes.',
      'If maternal fever is present, physician-directed paracetamol may be administered to reduce maternal core temperature.',
      'Evaluate for umbilical cord compression or maternal dehydration.'
    ],
    medication_te: [
      '20 నిమిషాల తర్వాత కార్డియోటోకోగ్రఫీ (CTG) లేదా డాప్లర్ పరీక్ష మళ్ళీ చేయించుకోవాలి.',
      'తల్లికి జ్వరం ఉంటే వైద్యుల సూచన మేరకు మాత్రమే పారాసిటమాల్ వాడాలి.',
      'తక్షణ పర్యవేక్షణ కోసం వైద్య బృందాన్ని సంప్రదించాలి.'
    ],
    medication_hi: [
      '20 मिनट बाद कार्डियोटोकोोग्राफी (CTG) या डॉक्टर द्वारा जांच कराएं।',
      'यदि बुखार है तो डॉक्टर की सलाह पर ही पैरासिटामोल लें।',
      'तत्काल चिकित्सकीय निगरानी प्राप्त करें।'
    ],
    escalation_en: 'Urgent CTG tracing and obstetric evaluation required. If fetal heart rate remains below 110 bpm or above 160 bpm with reduced movement, do not wait.',
    escalation_te: 'వెంటనే లేబర్ వార్డుకు వెళ్లి ఎలక్ట్రానిక్ ఫీటల్ మానిటరింగ్ (CTG) చేయించుకోవాలి.',
    escalation_hi: 'तुरंत लेबर वार्ड जाकर सीटीजी मॉनिटरिंग कराएं।'
  },

  normal: {
    condition_en: 'Reassuring Normal Maternal & Fetal Health (Low Risk)',
    condition_te: 'పూర్తిగా సాధారణ మరియు ఆరోగ్యకరమైన గర్భధారణ పారామితులు (తక్కువ ముప్పు)',
    condition_hi: 'सामान्य एवं स्वस्थ गर्भावस्था पैरामीटर्स (कम जोखिम)',
    issue_en: 'All recorded vitals, fetal parameters, and lab diagnostics match the healthy reference intervals specified in JanmaLink Reference Document Tables 6, 7 & 8. Mother and fetus are progressing well.',
    issue_te: 'మీ రక్తపోటు, హిమోగ్లోబిన్, షుగర్ స్థాయిలు మరియు పిండం గుండె స్పందనలు అన్నీ జన్మలింక్ రిఫరెన్స్ టేబుల్స్ ప్రకారం పూర్తిగా సాధారణ పరిధిలో ఆరోగ్యంగా ఉన్నాయి.',
    issue_hi: 'आपके सभी परीक्षण परिणाम, रक्तचाप, हीमोग्लोबिन और शिशु की धड़कन जन्मलिंक संदर्भ तालिकाओं के अनुसार पूरी तरह सामान्य और स्वस्थ हैं।',
    foods_en: [
      'Maintain balanced home-cooked nutritious meals with a colorful plate of seasonal vegetables, lentils, and whole grains.',
      'Drink 2 glasses of milk, buttermilk, or fresh curd daily for natural calcium and gut probiotics.',
      'Include healthy snacks: Soaked almonds, walnuts, roasted chickpeas, and seasonal fruits (apples, pomegranates, guava).',
      'Drink 2.5 to 3 liters of clean boiled and cooled water daily.'
    ],
    foods_te: [
      'ఆకుకూరలు, కూరగాయలు, పప్పులు మరియు తృణధాన్యాలతో కూడిన తాజా ఇంటి భోజనం తినండి.',
      'కాల్షియం మరియు జీర్ణక్రియ కోసం రోజూ 2 గ్లాసుల పాలు, మజ్జిగ లేదా పెరుగు తీసుకోండి.',
      'నానబెట్టిన బాదం, అక్రోట్లు, వేయించిన శనగలు మరియు తాజా పండ్లను స్నాక్స్‌గా తినండి.',
      'రోజుకు కనీసం 2.5 నుండి 3 లీటర్ల కాచి చల్లార్చిన మంచినీరు తాగుతూ ఉండండి.'
    ],
    foods_hi: [
      'घर का बना ताजा, पौष्टिक भोजन जिसमें दालें, सब्जियां और साबुत अनाज शामिल हों।',
      'कैल्शियम के लिए रोजाना 2 गिलास दूध, छाछ या ताजा दही लें।',
      'भीगे बादाम, अखरोट, भुने चने और मौसमी फल नाश्ते में खाएं।',
      'रोजाना 2.5 से 3 लीटर उबला हुआ और ठंडा किया हुआ पानी पिएं।'
    ],
    medication_en: [
      'Continue prescribed daily Iron-Folic Acid (IFA) and Calcium tablets as scheduled by your doctor.',
      'Take Calcium in the morning and Iron at bedtime with citrus juice/water (avoid taking together).',
      'Attend routine monthly antenatal checkups and scheduled ultrasound scans.',
      'Maintain 8 hours of peaceful sleep and gentle 20-minute daily morning walks.'
    ],
    medication_te: [
      'డాక్టర్ సూచించిన ఐరన్, ఫోలిక్ యాసిడ్ మరియు కాల్షియం మాత్రలను రోజూ సమయానికి వేసుకోండి.',
      'ఉదయం కాల్షియం మాత్ర, రాత్రి ఐరన్ మాత్ర వేసుకోవాలి (రెండూ కలిపి ఒకేసారి వేసుకోకూడదు).',
      'నిర్ణీత తేదీలలో నెలవారీ చెకప్‌లు మరియు అల్ట్రాసౌండ్ స్కాన్‌లకు హాజరవ్వండి.',
      'రోజూ కనీసం 8 గంటల నిద్ర మరియు ఉదయం పూట 20 నిమిషాల తేలికపాటి నడకను కొనసాగించండి.'
    ],
    medication_hi: [
      'डॉक्टर द्वारा दी गई आयरन, फोलिक एसिड और कैल्शियम की गोलियां समय पर लें।',
      'सुबह कैल्शियम और रात को आयरन की गोली लें (दोनों एक साथ न लें)।',
      'नियमित मासिक जांच और अल्ट्रासाउंड स्कैन पर समय से जाएं।',
      '8 घंटे की पर्याप्त नींद और रोजाना सुबह 20 मिनट हल्की सैर जारी रखें।'
    ],
    escalation_en: 'Continue standard antenatal care. If any unexpected bleeding, leaking, or reduced baby kicks occur, report to the hospital.',
    escalation_te: 'సాధారణ సంరక్షణను కొనసాగించండి. ఎటువంటి అసాధారణ రక్తస్రావం లేదా బిడ్డ కదలికలు తగ్గినా వెంటనే ఆసుపత్రికి వెళ్ళండి.',
    escalation_hi: 'नियमित जांच जारी रखें। किसी भी असामान्य रक्तस्राव या शिशु की हलचल में कमी होने पर अस्पताल जाएं।'
  }
};
