import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportRoutinePDF = (routine, userName = 'Student') => {
  if (!routine || !routine.days || routine.days.length === 0) {
    alert('No study routine available to export.');
    return;
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header Banner
  doc.setFillColor(99, 102, 241); // Indigo brand color
  doc.rect(0, 0, 210, 35, 'F');

  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('AI STUDY ROUTINE', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated for: ${userName}`, 14, 28);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 28);

  let currentY = 45;

  // Preferences Summary Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, currentY, 182, 20, 3, 3, 'F');
  
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Schedule Overview:', 18, currentY + 7);

  doc.setFont('helvetica', 'normal');
  const dailyHours = routine.preferences?.dailyHours || 4;
  const totalDays = routine.days.length;
  const totalSessions = routine.days.reduce((acc, d) => acc + d.sessions.length, 0);

  doc.text(`Target Daily Hours: ${dailyHours} hrs | Total Days: ${totalDays} | Total Sessions: ${totalSessions}`, 18, currentY + 14);

  currentY += 28;

  // Prepare table data for each day
  routine.days.forEach((dayObj, index) => {
    const dayDate = new Date(dayObj.date).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    // Check page space
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setTextColor(79, 70, 229);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Day ${index + 1}: ${dayDate}`, 14, currentY);

    currentY += 4;

    const tableRows = dayObj.sessions.map((sess, idx) => [
      idx + 1,
      sess.subjectName,
      sess.topic,
      `${sess.durationMinutes} mins`,
      sess.completed ? 'Completed' : 'Pending',
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['#', 'Subject', 'Topic / Module', 'Duration', 'Status']],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 45, fontStyle: 'bold' },
        2: { cellWidth: 80 },
        3: { cellWidth: 25 },
        4: { cellWidth: 22 },
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        currentY = data.cursor.y + 10;
      },
    });

    currentY += 4;
  });

  // Footer Page Numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${pageCount} - AI Study Planner`, 105, 290, { align: 'center' });
  }

  // Save PDF
  doc.save(`Study_Routine_${userName.replace(/\s+/g, '_')}.pdf`);
};
