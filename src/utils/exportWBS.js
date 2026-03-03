import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const STATI_LABEL = {
  'todo': 'Da fare',
  'in-progress': 'In corso',
  'done': 'Completato',
}

/**
 * Build a flat table of rows from the project hierarchy.
 * Each row: [Codice WBS, Fase, Task, Responsabile, Scadenza, Stato, %]
 */
function buildRows(progetto) {
  const rows = []

  progetto.fasi.forEach((fase, fi) => {
    const codFase = `${fi + 1}`

    // Fase summary row
    rows.push({
      codice: codFase,
      fase: fase.titolo,
      task: '',
      responsabile: '',
      scadenza: '',
      stato: '',
      percentuale: `${fase.percentuale}%`,
      isFase: true,
    })

    // Task rows
    fase.tasks.forEach((task, ti) => {
      rows.push({
        codice: `${codFase}.${ti + 1}`,
        fase: '',
        task: task.titolo,
        responsabile: task.responsabile || '—',
        scadenza: task.dataScadenza || '—',
        stato: STATI_LABEL[task.stato] || task.stato,
        percentuale: `${task.percentuale}%`,
        isFase: false,
      })
    })
  })

  return rows
}

/* ═══════════════════════════════════════
   EXPORT EXCEL
   ═══════════════════════════════════════ */
export function esportaExcel(progetto) {
  const rows = buildRows(progetto)
  const header = ['Codice WBS', 'Fase', 'Task', 'Responsabile', 'Scadenza', 'Stato', '%']

  const data = rows.map(r => [
    r.codice,
    r.fase,
    r.task,
    r.responsabile,
    r.scadenza,
    r.stato,
    r.percentuale,
  ])

  // Create workbook
  const wb = XLSX.utils.book_new()

  // Summary sheet
  const summaryData = [
    ['Progetto', progetto.titolo],
    ['Avanzamento globale', `${progetto.percentuale}%`],
    ['Numero fasi', progetto.fasi.length],
    ['Numero task totali', progetto.fasi.reduce((acc, f) => acc + f.tasks.length, 0)],
    [],
    header,
    ...data,
  ]

  const ws = XLSX.utils.aoa_to_sheet(summaryData)

  // Column widths
  ws['!cols'] = [
    { wch: 12 },  // Codice WBS
    { wch: 25 },  // Fase
    { wch: 30 },  // Task
    { wch: 20 },  // Responsabile
    { wch: 14 },  // Scadenza
    { wch: 14 },  // Stato
    { wch: 8 },   // %
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'WBS')
  XLSX.writeFile(wb, `WBS_${progetto.titolo.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`)
}

/* ═══════════════════════════════════════
   EXPORT PDF
   ═══════════════════════════════════════ */
export function esportaPDF(progetto) {
  const rows = buildRows(progetto)

  // A4 landscape for better table fit
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()

  // ── Header ──
  doc.setFillColor(15, 27, 46) // #0f1b2e
  doc.rect(0, 0, pageW, 32, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(245, 158, 11) // amber
  doc.text('WBS Office', 14, 16)

  doc.setFontSize(10)
  doc.setTextColor(180, 180, 180)
  doc.text('Work Breakdown Structure', 14, 24)

  // ── Project info ──
  const y0 = 40

  doc.setFontSize(14)
  doc.setTextColor(30, 30, 30)
  doc.text(progetto.titolo, 14, y0)

  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  const infoLine = `Avanzamento: ${progetto.percentuale}%  |  Fasi: ${progetto.fasi.length}  |  Task: ${progetto.fasi.reduce((a, f) => a + f.tasks.length, 0)}`
  doc.text(infoLine, 14, y0 + 7)

  // ── Progress bar ──
  const barY = y0 + 12
  const barW = pageW - 28
  doc.setDrawColor(200, 200, 200)
  doc.setFillColor(230, 230, 230)
  doc.roundedRect(14, barY, barW, 4, 2, 2, 'FD')

  if (progetto.percentuale > 0) {
    const fillW = Math.max(4, (barW * progetto.percentuale) / 100)
    const color = progetto.percentuale >= 100 ? [34, 197, 94] : progetto.percentuale >= 50 ? [245, 158, 11] : [251, 191, 36]
    doc.setFillColor(...color)
    doc.roundedRect(14, barY, fillW, 4, 2, 2, 'F')
  }

  // ── Table ──
  const tableY = barY + 12

  const tableHead = [['WBS', 'Fase', 'Task', 'Responsabile', 'Scadenza', 'Stato', '%']]

  const tableBody = rows.map(r => [
    r.codice,
    r.fase,
    r.task,
    r.responsabile,
    r.scadenza,
    r.stato,
    r.percentuale,
  ])

  autoTable(doc, {
    startY: tableY,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    margin: { left: 14, right: 14 },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [15, 27, 46],
      textColor: [245, 158, 11],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      textColor: [40, 40, 40],
    },
    columnStyles: {
      0: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 38 },
      2: { cellWidth: 48 },
      3: { cellWidth: 35 },
      4: { cellWidth: 24, halign: 'center' },
      5: { cellWidth: 22, halign: 'center' },
      6: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
    },
    didParseCell(data) {
      // Highlight fase rows with a subtle background
      if (data.section === 'body') {
        const row = rows[data.row.index]
        if (row?.isFase) {
          data.cell.styles.fillColor = [240, 245, 255]
          data.cell.styles.fontStyle = 'bold'
        }

        // Color the status cell
        if (data.column.index === 5) {
          const stato = data.cell.raw
          if (stato === 'Completato') {
            data.cell.styles.textColor = [22, 163, 74]
            data.cell.styles.fontStyle = 'bold'
          } else if (stato === 'In corso') {
            data.cell.styles.textColor = [217, 119, 6]
            data.cell.styles.fontStyle = 'bold'
          }
        }
      }
    },
  })

  // ── Footer ──
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    const pageH = doc.internal.pageSize.getHeight()
    doc.setFontSize(8)
    doc.setTextColor(160, 160, 160)
    doc.text(
      `WBS Office — ${progetto.titolo} — Pagina ${i}/${pageCount}`,
      pageW / 2,
      pageH - 6,
      { align: 'center' }
    )
    doc.text(
      new Date().toLocaleDateString('it-IT'),
      pageW - 14,
      pageH - 6,
      { align: 'right' }
    )
  }

  doc.save(`WBS_${progetto.titolo.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`)
}
