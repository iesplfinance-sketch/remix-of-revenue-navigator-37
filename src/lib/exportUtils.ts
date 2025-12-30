// Professional Excel and PDF export utilities
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CampusData, HostelData, GlobalSettings } from '@/data/schoolData';
import { calculateCampusRevenue, calculateClassBreakdown, calculateHostelRevenue, calculateTotals } from './calculations';

const BRAND_NAME = 'Pak Turk Maarif School & Colleges';
const REPORT_TITLE = 'Revenue Forecasting Report';

// Generate professional Excel export
export function generateExcelExport(
  campuses: CampusData[],
  hostels: HostelData[],
  globalSettings: GlobalSettings
): void {
  const workbook = XLSX.utils.book_new();
  const totals = calculateTotals(campuses, hostels, globalSettings);

  // ========== EXECUTIVE SUMMARY SHEET ==========
  const summaryData: (string | number)[][] = [
    [BRAND_NAME],
    [REPORT_TITLE],
    [`Generated on: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`],
    [''],
    ['EXECUTIVE SUMMARY'],
    [''],
    ['Metric', 'Value'],
    ['Total School Students', totals.schoolStudents],
    ['Total Hostel Students', totals.hostelStudents],
    ['Total Students', totals.totalStudents],
    [''],
    ['School Tuition Revenue', totals.schoolRevenue],
    ['Hostel Revenue', totals.hostelRevenue],
    ['Total Tuition Revenue', totals.totalRevenue],
    ['Annual Fee Revenue', totals.annualFeeRevenue],
    ['DCP Revenue', totals.dcpRevenue],
    ['GRAND TOTAL REVENUE', totals.grandTotalRevenue],
    [''],
    ['GLOBAL SETTINGS'],
    [''],
    ['Setting', 'Value'],
    ['Global Fee Hike', `${globalSettings.globalFeeHike}%`],
    ['Global Student Growth', `${globalSettings.globalStudentGrowth}%`],
    ['Global Discount Rate', `${globalSettings.globalDiscount}%`],
    ['School Annual Fee', globalSettings.schoolAnnualFee],
    ['Hostel Annual Fee', globalSettings.hostelAnnualFee],
    ['School DCP (School Only)', globalSettings.schoolDCP],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Set column widths
  summarySheet['!cols'] = [{ wch: 35 }, { wch: 25 }];
  
  // Apply styles using cell formatting
  applyHeaderStyle(summarySheet, 'A1', 'B1');
  
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Executive Summary');

  // ========== CAMPUS BREAKDOWN SHEETS ==========
  campuses.forEach((campus, campusIndex) => {
    const calc = calculateCampusRevenue(campus, globalSettings);
    const effectiveNewFeeHike = campus.newAdmissionFeeHike + globalSettings.globalFeeHike;
    const effectiveRenewalFeeHike = campus.renewalFeeHike + globalSettings.globalFeeHike;
    const effectiveNewGrowth = campus.newStudentGrowth + globalSettings.globalStudentGrowth;
    const effectiveRenewalGrowth = campus.renewalGrowth + globalSettings.globalStudentGrowth;

    const campusData: (string | number)[][] = [
      [BRAND_NAME],
      [`Campus: ${campus.name}`],
      [`New Adm Fee: ${effectiveNewFeeHike}% | Renewal Fee: ${effectiveRenewalFeeHike}% | New Growth: ${effectiveNewGrowth}% | Renewal Growth: ${effectiveRenewalGrowth}% | Discount: ${campus.discountRate}%`],
      [''],
      // Header rows
      [
        'Class',
        'New Adm (Current)', 'Fee', 'Total',
        'Renewal (Current)', 'Fee', 'Total',
        'New Adm (Forecast)', 'Fee', 'Total',
        'Renewal (Forecast)', 'Fee', 'Total'
      ],
    ];

    let totalCurrentNewAdm = 0, totalCurrentNewTotal = 0;
    let totalCurrentRenewal = 0, totalCurrentRenewalTotal = 0;
    let totalForecastNewAdm = 0, totalForecastNewTotal = 0;
    let totalForecastRenewal = 0, totalForecastRenewalTotal = 0;

    campus.classes
      .filter(cls => cls.renewalCount > 0 || cls.newAdmissionCount > 0)
      .forEach(cls => {
        const newGrowthMultiplier = 1 + (effectiveNewGrowth / 100);
        const renewalGrowthMultiplier = 1 + (effectiveRenewalGrowth / 100);
        const newFeeMultiplier = 1 + (effectiveNewFeeHike / 100);
        const renewalFeeMultiplier = 1 + (effectiveRenewalFeeHike / 100);

        const currentNewAdm = cls.newAdmissionCount;
        const currentNewFee = cls.newAdmissionFee;
        const currentNewTotal = currentNewAdm * currentNewFee;
        const currentRenewal = cls.renewalCount;
        const currentRenewalFee = cls.renewalFee;
        const currentRenewalTotal = currentRenewal * currentRenewalFee;

        const forecastNewAdm = Math.round(currentNewAdm * newGrowthMultiplier);
        const forecastNewFee = Math.round(currentNewFee * newFeeMultiplier);
        const forecastNewTotal = forecastNewAdm * forecastNewFee;
        const forecastRenewal = Math.round(currentRenewal * renewalGrowthMultiplier);
        const forecastRenewalFee = Math.round(currentRenewalFee * renewalFeeMultiplier);
        const forecastRenewalTotal = forecastRenewal * forecastRenewalFee;

        totalCurrentNewAdm += currentNewAdm;
        totalCurrentNewTotal += currentNewTotal;
        totalCurrentRenewal += currentRenewal;
        totalCurrentRenewalTotal += currentRenewalTotal;
        totalForecastNewAdm += forecastNewAdm;
        totalForecastNewTotal += forecastNewTotal;
        totalForecastRenewal += forecastRenewal;
        totalForecastRenewalTotal += forecastRenewalTotal;

        campusData.push([
          cls.className,
          currentNewAdm || '-', currentNewFee || '-', currentNewTotal || '-',
          currentRenewal || '-', currentRenewalFee || '-', currentRenewalTotal || '-',
          forecastNewAdm || '-', forecastNewFee || '-', forecastNewTotal || '-',
          forecastRenewal || '-', forecastRenewalFee || '-', forecastRenewalTotal || '-'
        ]);
      });

    // Totals row
    campusData.push([
      'TOTAL',
      totalCurrentNewAdm, '-', totalCurrentNewTotal,
      totalCurrentRenewal, '-', totalCurrentRenewalTotal,
      totalForecastNewAdm, '-', totalForecastNewTotal,
      totalForecastRenewal, '-', totalForecastRenewalTotal
    ]);

    // Summary at bottom
    campusData.push(['']);
    campusData.push(['CAMPUS SUMMARY']);
    campusData.push(['Current Total Revenue', '', '', '', '', '', calc.currentNetRevenue]);
    campusData.push(['Projected Total Revenue', '', '', '', '', '', '', '', '', calc.projectedNetRevenue]);
    campusData.push(['Revenue Change', '', '', '', '', '', '', '', '', '', '', '', calc.revenueChange]);

    const campusSheet = XLSX.utils.aoa_to_sheet(campusData);
    campusSheet['!cols'] = [
      { wch: 15 }, // Class
      { wch: 12 }, { wch: 10 }, { wch: 14 }, // Current New
      { wch: 12 }, { wch: 10 }, { wch: 14 }, // Current Renewal
      { wch: 12 }, { wch: 10 }, { wch: 14 }, // Forecast New
      { wch: 12 }, { wch: 10 }, { wch: 14 }, // Forecast Renewal
    ];

    const sheetName = campus.shortName.substring(0, 31); // Excel sheet name limit
    XLSX.utils.book_append_sheet(workbook, campusSheet, sheetName);
  });

  // ========== HOSTEL SHEET ==========
  const hostelData: (string | number)[][] = [
    [BRAND_NAME],
    ['Hostel Revenue Breakdown'],
    [''],
    ['Hostel Name', 'Current Occupancy', 'Max Capacity', 'Utilization %', 'Fee per Student', 'Total Revenue'],
  ];

  let totalHostelRevenue = 0;
  hostels.forEach(hostel => {
    const calc = calculateHostelRevenue(hostel);
    totalHostelRevenue += calc.currentRevenue;
    hostelData.push([
      hostel.name,
      hostel.currentOccupancy,
      hostel.maxCapacity,
      `${calc.utilizationPercent.toFixed(1)}%`,
      hostel.feePerStudent,
      calc.currentRevenue
    ]);
  });

  hostelData.push(['']);
  hostelData.push(['TOTAL HOSTEL REVENUE', '', '', '', '', totalHostelRevenue]);

  const hostelSheet = XLSX.utils.aoa_to_sheet(hostelData);
  hostelSheet['!cols'] = [
    { wch: 25 }, { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 18 }
  ];

  XLSX.utils.book_append_sheet(workbook, hostelSheet, 'Hostels');

  // ========== ALL CAMPUSES OVERVIEW SHEET ==========
  const overviewData: (string | number)[][] = [
    [BRAND_NAME],
    ['All Campuses Overview'],
    [''],
    ['Campus', 'Current Students', 'Projected Students', 'Current Revenue', 'Projected Revenue', 'Change', 'Change %'],
  ];

  let grandTotalCurrentStudents = 0, grandTotalProjectedStudents = 0;
  let grandTotalCurrentRevenue = 0, grandTotalProjectedRevenue = 0;

  campuses.forEach(campus => {
    const calc = calculateCampusRevenue(campus, globalSettings);
    grandTotalCurrentStudents += calc.currentTotalStudents;
    grandTotalProjectedStudents += calc.projectedTotalStudents;
    grandTotalCurrentRevenue += calc.currentNetRevenue;
    grandTotalProjectedRevenue += calc.projectedNetRevenue;

    overviewData.push([
      campus.shortName,
      calc.currentTotalStudents,
      calc.projectedTotalStudents,
      calc.currentNetRevenue,
      calc.projectedNetRevenue,
      calc.revenueChange,
      `${calc.revenueChangePercent.toFixed(1)}%`
    ]);
  });

  overviewData.push(['']);
  overviewData.push([
    'GRAND TOTAL',
    grandTotalCurrentStudents,
    grandTotalProjectedStudents,
    grandTotalCurrentRevenue,
    grandTotalProjectedRevenue,
    grandTotalProjectedRevenue - grandTotalCurrentRevenue,
    grandTotalCurrentRevenue > 0 ? `${(((grandTotalProjectedRevenue - grandTotalCurrentRevenue) / grandTotalCurrentRevenue) * 100).toFixed(1)}%` : 'N/A'
  ]);

  const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
  overviewSheet['!cols'] = [
    { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 15 }, { wch: 12 }
  ];

  XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview');

  // Download the file
  XLSX.writeFile(workbook, `${BRAND_NAME.replace(/\s+/g, '_')}_Revenue_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Helper function for styling (XLSX community edition has limited styling)
function applyHeaderStyle(sheet: XLSX.WorkSheet, startCell: string, endCell: string): void {
  // Note: Full styling requires XLSX Pro version
  // This is a placeholder for when styling is needed
}

// Generate professional PDF export
export function generatePDFExport(
  campuses: CampusData[],
  hostels: HostelData[],
  globalSettings: GlobalSettings
): void {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const totals = calculateTotals(campuses, hostels, globalSettings);
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const primaryColor: [number, number, number] = [59, 130, 246]; // Blue
  const headerBg: [number, number, number] = [30, 41, 59]; // Dark slate
  const lightBg: [number, number, number] = [241, 245, 249]; // Light gray

  // ========== COVER PAGE ==========
  doc.setFillColor(...headerBg);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(BRAND_NAME, pageWidth / 2, 25, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(REPORT_TITLE, pageWidth / 2, 38, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, 60, { align: 'center' });

  // Executive Summary Box
  doc.setFillColor(...lightBg);
  doc.roundedRect(20, 70, pageWidth - 40, 80, 3, 3, 'F');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Executive Summary', 30, 82);

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  const summaryItems = [
    [`Total Students: ${totals.totalStudents.toLocaleString()}`, `School Students: ${totals.schoolStudents.toLocaleString()}`, `Hostel Students: ${totals.hostelStudents.toLocaleString()}`],
    [`School Revenue: Rs. ${totals.schoolRevenue.toLocaleString()}`, `Hostel Revenue: Rs. ${totals.hostelRevenue.toLocaleString()}`, `Tuition Total: Rs. ${totals.totalRevenue.toLocaleString()}`],
    [`Annual Fee Revenue: Rs. ${totals.annualFeeRevenue.toLocaleString()}`, `DCP Revenue: Rs. ${totals.dcpRevenue.toLocaleString()}`, `GRAND TOTAL: Rs. ${totals.grandTotalRevenue.toLocaleString()}`],
  ];

  let yPos = 95;
  summaryItems.forEach(row => {
    let xPos = 30;
    row.forEach(item => {
      doc.text(item, xPos, yPos);
      xPos += 85;
    });
    yPos += 12;
  });

  // Global Settings
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Global Settings', 30, 135);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`Fee Hike: ${globalSettings.globalFeeHike}%  |  Student Growth: ${globalSettings.globalStudentGrowth}%  |  Discount: ${globalSettings.globalDiscount}%`, 30, 145);
  doc.text(`School Annual Fee: Rs. ${globalSettings.schoolAnnualFee.toLocaleString()}  |  Hostel Annual Fee: Rs. ${globalSettings.hostelAnnualFee.toLocaleString()}`, 30, 152);
  doc.text(`School DCP: Rs. ${globalSettings.schoolDCP.toLocaleString()} (School Only)`, 30, 159);

  // ========== CAMPUS OVERVIEW PAGE ==========
  doc.addPage();
  
  doc.setFillColor(...headerBg);
  doc.rect(0, 0, pageWidth, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('All Campuses Overview', pageWidth / 2, 13, { align: 'center' });

  const overviewData = campuses.map(campus => {
    const calc = calculateCampusRevenue(campus, globalSettings);
    return [
      campus.shortName,
      calc.currentTotalStudents.toString(),
      calc.projectedTotalStudents.toString(),
      `Rs. ${calc.currentNetRevenue.toLocaleString()}`,
      `Rs. ${calc.projectedNetRevenue.toLocaleString()}`,
      `Rs. ${calc.revenueChange.toLocaleString()}`,
      `${calc.revenueChangePercent.toFixed(1)}%`
    ];
  });

  // Calculate totals for footer
  let totalCurrentStudents = 0, totalProjectedStudents = 0;
  let totalCurrentRevenue = 0, totalProjectedRevenue = 0;
  campuses.forEach(campus => {
    const calc = calculateCampusRevenue(campus, globalSettings);
    totalCurrentStudents += calc.currentTotalStudents;
    totalProjectedStudents += calc.projectedTotalStudents;
    totalCurrentRevenue += calc.currentNetRevenue;
    totalProjectedRevenue += calc.projectedNetRevenue;
  });

  autoTable(doc, {
    head: [['Campus', 'Current Students', 'Projected Students', 'Current Revenue', 'Projected Revenue', 'Change', 'Change %']],
    body: overviewData,
    foot: [[
      'GRAND TOTAL',
      totalCurrentStudents.toString(),
      totalProjectedStudents.toString(),
      `Rs. ${totalCurrentRevenue.toLocaleString()}`,
      `Rs. ${totalProjectedRevenue.toLocaleString()}`,
      `Rs. ${(totalProjectedRevenue - totalCurrentRevenue).toLocaleString()}`,
      `${((totalProjectedRevenue - totalCurrentRevenue) / totalCurrentRevenue * 100).toFixed(1)}%`
    ]],
    startY: 30,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: headerBg, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: lightBg },
    styles: { fontSize: 8, cellPadding: 3 },
  });

  // ========== HOSTEL PAGE ==========
  doc.addPage();
  
  doc.setFillColor(...headerBg);
  doc.rect(0, 0, pageWidth, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Hostel Revenue Breakdown', pageWidth / 2, 13, { align: 'center' });

  const hostelData = hostels.map(hostel => {
    const calc = calculateHostelRevenue(hostel);
    return [
      hostel.name,
      hostel.currentOccupancy.toString(),
      hostel.maxCapacity.toString(),
      `${calc.utilizationPercent.toFixed(1)}%`,
      `Rs. ${hostel.feePerStudent.toLocaleString()}`,
      `Rs. ${calc.currentRevenue.toLocaleString()}`
    ];
  });

  let totalHostelRevenue = 0;
  hostels.forEach(hostel => {
    totalHostelRevenue += hostel.currentOccupancy * hostel.feePerStudent;
  });

  autoTable(doc, {
    head: [['Hostel Name', 'Current Occupancy', 'Max Capacity', 'Utilization', 'Fee/Student', 'Total Revenue']],
    body: hostelData,
    foot: [['TOTAL', '', '', '', '', `Rs. ${totalHostelRevenue.toLocaleString()}`]],
    startY: 30,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: headerBg, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: lightBg },
    styles: { fontSize: 9, cellPadding: 4 },
  });

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`${BRAND_NAME} - ${REPORT_TITLE}`, 20, doc.internal.pageSize.getHeight() - 10);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, doc.internal.pageSize.getHeight() - 10);
  }

  // Save the PDF
  doc.save(`${BRAND_NAME.replace(/\s+/g, '_')}_Revenue_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}
