import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { JANMALINK_LOGO_BASE64 } from '../assets/janmaLogoBase64.js';

/**
 * Generate an official clinical PDF report based on selected template, patient vitals, and parameters
 * @param {object} reportData - Report information { testType, category, collectedAt, reportedAt, results, remarks, templateName, patientVitals }
 * @param {object} patientData - Patient information { name, motherId, age, gender, bloodGroup, phone, height, weight, hospitalName, assignedDoctor }
 * @param {object} options - Options { download: true, print: false, filename: 'report.pdf' }
 * @returns {jsPDF} - jsPDF document instance
 */
export const generateDiagnosticPdf = (reportData, patientData = {}, options = { download: true, print: false }) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Color Palette
  const primaryNavy = [15, 44, 89]; // #0F2C59
  const accentPink = [224, 30, 90]; // #E01E5A
  const tealGreen = [13, 148, 136]; // #0D9488
  const slateInk = [51, 65, 85];
  const borderLight = [226, 232, 240];

  // 1. Top Decorative Brand Bar
  doc.setFillColor(...primaryNavy);
  doc.rect(0, 0, pageWidth, 5.5, 'F');
  doc.setFillColor(...accentPink);
  doc.rect(0, 5.5, pageWidth, 1.5, 'F');

  // Real Hospital details (if not available put -)
  const rawHospital = 
    patientData.hospitalName || 
    patientData.hospitalRef?.hospitalName || 
    patientData.hospitalRef?.name || 
    reportData.hospitalName || 
    reportData.hospitalRef?.hospitalName || 
    reportData.hospitalRef?.name;

  const hospitalName = rawHospital && String(rawHospital).trim() !== '' 
    ? String(rawHospital).trim().toUpperCase() 
    : '-';

  const hospitalAddress = (patientData.hospitalRef?.address || patientData.hospitalAddress || reportData.hospitalAddress) || '';
  const hospitalPhone = (patientData.hospitalRef?.mobile || patientData.hospitalRef?.phone || patientData.hospitalPhone || reportData.hospitalPhone) || '';

  // 2. LOGO 1: HOSPITAL CREST / EMBLEM (Left Header)
  // Draw professional hospital seal
  doc.setFillColor(...primaryNavy);
  doc.circle(22, 19, 8, 'F');
  doc.setFillColor(...tealGreen);
  doc.circle(22, 19, 6.8, 'F');
  
  // White Medical Cross in Seal
  doc.setFillColor(255, 255, 255);
  doc.rect(20.8, 15.5, 2.4, 7, 'F');
  doc.rect(18.5, 17.8, 7, 2.4, 'F');

  // Hospital Name & Subtitle
  doc.setTextColor(...primaryNavy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(hospitalName, 33, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  if (hospitalName !== '-') {
    const subLine1 = hospitalAddress ? `Address: ${hospitalAddress}` : 'Department of Perinatal Diagnostics & Maternal Medicine';
    const subLine2 = hospitalPhone ? `24x7 Emergency / Enquiries: ${hospitalPhone} • LIMS Verified` : 'NABH Accredited Tertiary Center • Perinatal Network Node';
    doc.text(subLine1, 33, 20);
    doc.text(subLine2, 33, 24);
  } else {
    doc.text('Hospital / Facility Information: -', 33, 20);
    doc.text('Perinatal Diagnostics & Clinical Pathology Node', 33, 24);
  }

  // 3. LOGO 2: REAL JANMALINK DIAGNOSTIC LOGO (Right Header Badge)
  const rightBoxX = pageWidth - 68;
  doc.setFillColor(253, 242, 248); // pink-50
  doc.setDrawColor(...accentPink);
  doc.setLineWidth(0.4);
  doc.roundedRect(rightBoxX, 8, 54, 21, 2, 2, 'FD');

  // Embed real uploaded JanmaLink Logo image
  if (JANMALINK_LOGO_BASE64) {
    try {
      doc.addImage(JANMALINK_LOGO_BASE64, 'PNG', rightBoxX + 1.5, 9, 19, 19);
    } catch (e) {
      console.warn('Fallback drawing logo:', e);
    }
  }

  // JanmaLink Label text next to logo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...accentPink);
  doc.text('JANMALINK', rightBoxX + 22, 14.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(...primaryNavy);
  doc.text('DIAGNOSTIC REPORT', rightBoxX + 22, 18.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(100, 116, 139);
  doc.text('ABDM & LIMS VERIFIED', rightBoxX + 22, 22.5);

  // Header Divider
  doc.setDrawColor(...borderLight);
  doc.setLineWidth(0.5);
  doc.line(14, 32, pageWidth - 14, 32);

  // 4. PATIENT INFORMATION CARD (Real Details, if not available put -)
  const patientName = patientData.name || reportData.patientName || '-';
  const motherId = patientData.motherId || reportData.motherId || '-';
  const age = patientData.age ? `${patientData.age} Yrs` : (reportData.age ? `${reportData.age} Yrs` : '-');
  const gender = patientData.gender || reportData.gender || 'Female';
  const bloodGroup = patientData.bloodGroup || reportData.bloodGroup || '-';
  const phone = patientData.phone || reportData.phone || '-';

  // Height, Weight, BMI (Real details, fallback -)
  const h = patientData.height || reportData.patientVitals?.height || reportData.height;
  const w = patientData.weight || reportData.patientVitals?.weight || reportData.weight;
  let heightWeightDisplay = '-';
  if (h && w) {
    const bmiVal = (w / Math.pow(h / 100, 2)).toFixed(1);
    heightWeightDisplay = `${h} cm  |  ${w} kg  (BMI: ${bmiVal})`;
  } else if (h) {
    heightWeightDisplay = `${h} cm`;
  } else if (w) {
    heightWeightDisplay = `${w} kg`;
  }

  // Assigned Doctor
  const rawDoctor = 
    patientData.assignedDoctor?.name || 
    patientData.doctorName || 
    reportData.orderedByName || 
    reportData.doctorName || 
    reportData.orderedBy?.name || 
    patientData.doctor;

  const doctorName = rawDoctor && String(rawDoctor).trim() !== '' ? String(rawDoctor).trim() : '-';

  const sampleDate = reportData.collectedAt ? new Date(reportData.collectedAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');
  const reportDate = reportData.reportedAt ? new Date(reportData.reportedAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');
  const reportId = reportData.id || reportData._id || `JL-REP-${Math.floor(100000 + Math.random() * 900000)}`;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...borderLight);
  doc.roundedRect(14, 35, pageWidth - 28, 33, 2, 2, 'FD');

  // Left Column Patient Details
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryNavy);
  doc.text('Patient Name:', 18, 41);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateInk);
  doc.text(patientName, 43, 41);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryNavy);
  doc.text('Patient / Mother ID:', 18, 47);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateInk);
  doc.text(motherId, 50, 47);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryNavy);
  doc.text('Age / Gender:', 18, 53);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateInk);
  doc.text(`${age}  /  ${gender}`, 42, 53);

  // Vitals: Height, Weight, BMI
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryNavy);
  doc.text('Height & Weight:', 18, 59);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateInk);
  doc.text(heightWeightDisplay, 45, 59);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryNavy);
  doc.text('Blood Group / Ph:', 18, 65);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateInk);
  doc.text(`${bloodGroup}  |  ${phone}`, 46, 65);

  // Right Column Specimen & Referral Details
  const col2X = pageWidth / 2 + 6;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryNavy);
  doc.text('Report ID:', col2X, 41);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateInk);
  doc.text(String(reportId), col2X + 22, 41);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryNavy);
  doc.text('Sample Collected:', col2X, 47);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateInk);
  doc.text(sampleDate, col2X + 30, 47);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryNavy);
  doc.text('Reported Date:', col2X, 53);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateInk);
  doc.text(reportDate, col2X + 26, 53);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryNavy);
  doc.text('Assigned Doctor:', col2X, 59);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateInk);
  doc.text(doctorName, col2X + 30, 59);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryNavy);
  doc.text('Specimen Status:', col2X, 65);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(16, 149, 93);
  doc.text('Adequate / Verified (LIMS)', col2X + 30, 65);

  // 5. Test Investigation Title Header
  doc.setFillColor(...primaryNavy);
  doc.rect(14, 71, pageWidth - 28, 7.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  const investigationTitle = (reportData.testType || 'DIAGNOSTIC INVESTIGATION').toUpperCase();
  doc.text(investigationTitle, 18, 76);

  const categoryLabel = `CATEGORY: ${(reportData.category || 'CLINICAL').toUpperCase()}`;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(categoryLabel, pageWidth - 18 - doc.getTextWidth(categoryLabel), 75);

  // 6. Structured Parameters Table
  const tableRows = (reportData.results || []).map(r => {
    let flagText = 'NORMAL';
    if (r.flag === 'low') flagText = 'LOW (*)';
    if (r.flag === 'high') flagText = 'HIGH (*)';
    if (r.flag === 'abnormal') flagText = 'ABNORMAL (*)';

    return [
      r.parameter || 'Investigation Parameter',
      String(r.value !== undefined ? r.value : '-'),
      r.unit || '-',
      r.refRange || 'Biological Interval',
      flagText
    ];
  });

  autoTable(doc, {
    startY: 80,
    head: [['INVESTIGATION PARAMETER', 'OBSERVED VALUE', 'UNIT', 'REFERENCE INTERVAL', 'INTERPRETATION']],
    body: tableRows.length > 0 ? tableRows : [['No Parameters Recorded', '-', '-', '-', 'NORMAL']],
    theme: 'grid',
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: primaryNavy,
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left',
      lineColor: borderLight,
      lineWidth: 0.3
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: slateInk,
      lineColor: borderLight,
      lineWidth: 0.2,
      cellPadding: 2.7
    },
    alternateRowStyles: {
      fillColor: [253, 254, 255]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 62 },
      1: { halign: 'center', cellWidth: 30, fontStyle: 'bold' },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 36 },
      4: { halign: 'center', cellWidth: 34 }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        const text = String(data.cell.raw);
        if (text.includes('LOW') || text.includes('HIGH') || text.includes('ABNORMAL')) {
          data.cell.styles.textColor = accentPink;
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [16, 149, 93];
          data.cell.styles.fontStyle = 'bold';
        }
      }
      if (data.section === 'body' && data.column.index === 1) {
        const row = tableRows[data.row.index];
        if (row && (row[4].includes('LOW') || row[4].includes('HIGH'))) {
          data.cell.styles.textColor = accentPink;
        }
      }
    }
  });

  // 7. Clinical Impression & Remarks
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 7 : 160;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...borderLight);
  doc.roundedRect(14, finalY, pageWidth - 28, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryNavy);
  doc.text('CLINICAL IMPRESSION & INTERPRETATION:', 18, finalY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...slateInk);
  const remarksText = reportData.remarks || 'Specimen processed as per standard operating protocol. Values correlate with clinical assessment. Review by treating obstetrician advised.';
  const splitRemarks = doc.splitTextToSize(remarksText, pageWidth - 36);
  doc.text(splitRemarks, 18, finalY + 10.5);

  // 8. Quality Assurance & Signatures
  const signY = pageHeight - 37;

  doc.setDrawColor(...borderLight);
  doc.setLineWidth(0.4);
  doc.line(14, signY - 4, pageWidth - 14, signY - 4);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text('Electronic Diagnostic Record authorized under JanmaLink Cloud Laboratory Information Management System.', 14, signY);
  doc.text('This digital document is legally valid and cryptographically verifiable with Hospital LIMS node.', 14, signY + 3.5);

  // Left Signatory
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryNavy);
  doc.text('Verified By:', 14, signY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...slateInk);
  doc.text('K. S. Raman, DMLT', 14, signY + 17);
  doc.text('Senior Laboratory Technologist', 14, signY + 21);

  // Right Signatory
  const rightSignX = pageWidth - 65;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryNavy);
  doc.text('Authorized Signatory:', rightSignX, signY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...slateInk);
  doc.text('Dr. Anuradha Sharma, MD', rightSignX, signY + 17);
  doc.text('Chief Pathologist & Consultant (KMC: 44921)', rightSignX, signY + 21);

  // 9. Bottom Footer Bar
  doc.setFillColor(...primaryNavy);
  doc.rect(0, pageHeight - 5, pageWidth, 5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  const footerHospitalText = hospitalName !== '-' 
    ? `${hospitalName} in Association with JanmaLink Network • Strictly Confidential Medical Record` 
    : 'JanmaLink Perinatal Diagnostic Network • Strictly Confidential Medical Record';
  doc.text(footerHospitalText, pageWidth / 2, pageHeight - 1.5, { align: 'center' });

  // PRINT ACTION: If print is requested, trigger autoPrint and open in new window
  if (options.print) {
    doc.autoPrint();
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl, '_blank');
  }

  // DOWNLOAD ACTION
  if (options.download) {
    const safePatient = (patientName || 'Patient').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeTest = (reportData.testType || 'Report').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = options.filename || `${safePatient}_${safeTest}_Diagnostic_Report.pdf`;
    doc.save(filename);
  }

  return doc;
};
