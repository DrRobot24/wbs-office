import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { derivaStato } from "./treeHelpers";

const STATI_LABEL = {
  todo: "Da fare",
  "in-progress": "In corso",
  done: "Completato",
};

const PRIORITA_LABEL = {
  bassa: "Bassa",
  media: "Media",
  alta: "Alta",
  urgente: "Urgente",
};

/** Formatta i materiali come testo sintetico per export */
function formatMateriali(materiali) {
  if (!materiali || materiali.length === 0) return "";
  return materiali
    .filter((m) => m.descrizione)
    .map((m) => {
      const parts = [m.descrizione];
      if (m.quantita) parts.push(`(${m.quantita})`);
      if (m.fornitore) parts.push(`- ${m.fornitore}`);
      if (m.costo) parts.push(`€${m.costo}`);
      return parts.join(" ");
    })
    .join("; ");
}

/** Calcola il costo totale dei materiali di un nodo */
function costoMateriali(nodo) {
  if (!nodo.materiali || nodo.materiali.length === 0) return 0;
  return nodo.materiali.reduce((acc, m) => acc + (parseFloat(m.costo) || 0), 0);
}

/**
 * Build a flat table of rows from the recursive project hierarchy.
 */
function buildRows(progetto) {
  const rows = [];

  function visitNode(nodo, codice, livello) {
    const isLeaf = !nodo.children || nodo.children.length === 0;
    const costoMat = costoMateriali(nodo);
    rows.push({
      codice,
      titolo: nodo.titolo,
      livello,
      responsabile: nodo.responsabile || "—",
      priorita: PRIORITA_LABEL[nodo.priorita] || "",
      dataInizio: nodo.dataInizio || "—",
      scadenza: nodo.dataScadenza || "—",
      stato: isLeaf ? STATI_LABEL[derivaStato(nodo.percentuale)] || "" : "",
      percentuale: `${nodo.percentuale}%`,
      costoTotale:
        nodo.costoTotale !== "" && nodo.costoTotale !== undefined
          ? `€ ${Number(nodo.costoTotale).toFixed(2)}`
          : "",
      costoMateriali: costoMat > 0 ? `€ ${costoMat.toFixed(2)}` : "",
      materiali: formatMateriali(nodo.materiali),
      note: nodo.note || "",
      isParent: !isLeaf,
    });

    if (nodo.children) {
      nodo.children.forEach((child, i) => {
        visitNode(child, `${codice}.${i + 1}`, livello + 1);
      });
    }
  }

  (progetto.children || []).forEach((child, i) => {
    visitNode(child, `${i + 1}`, 1);
  });

  return rows;
}

/** Conta tutte le foglie ricorsivamente */
function contaFoglie(nodo) {
  if (!nodo.children || nodo.children.length === 0) return 1;
  return nodo.children.reduce((acc, c) => acc + contaFoglie(c), 0);
}

/** Conta i nodi di primo livello */
function contaNodi(progetto) {
  return (progetto.children || []).length;
}

/* ═══════════════════════════════════════
   EXPORT EXCEL
   ═══════════════════════════════════════ */
export function esportaExcel(progetto) {
  const rows = buildRows(progetto);

  const wb = XLSX.utils.book_new();

  // ── Foglio 1: WBS Principale ──
  const header1 = [
    "Codice WBS",
    "Titolo",
    "Liv.",
    "Responsabile",
    "Data Inizio",
    "Scadenza",
    "Stato",
    "%",
    "Costo Prev.",
    "Costo Mat.",
    "Note",
  ];
  const data1 = rows.map((r) => [
    r.codice,
    r.titolo,
    r.livello,
    r.responsabile,
    r.dataInizio,
    r.scadenza,
    r.stato,
    r.percentuale,
    r.costoTotale,
    r.costoMateriali,
    r.note,
  ]);

  const summaryData = [
    ["Progetto", progetto.titolo],
    ["Avanzamento globale", `${progetto.percentuale}%`],
    ["Nodi principali", contaNodi(progetto)],
    ["Elementi totali (foglie)", contaFoglie(progetto)],
    [],
    header1,
    ...data1,
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
  ws1["!cols"] = [
    { wch: 14 },
    { wch: 35 },
    { wch: 6 },
    { wch: 20 },
    { wch: 10 },
    { wch: 14 },
    { wch: 14 },
    { wch: 8 },
    { wch: 14 },
    { wch: 14 },
    { wch: 40 },
  ];
  XLSX.utils.book_append_sheet(wb, ws1, "WBS");

  // ── Foglio 2: Materiali ──
  const materialiRows = [];
  rows.forEach((r) => {
    if (r.materiali) {
      // Scomponiamo i materiali se il nodo originale li aveva
      // Usiamo il campo formattato come fallback
      materialiRows.push([r.codice, r.titolo, r.materiali]);
    }
  });
  if (materialiRows.length > 0) {
    const headerMat = [
      "Codice WBS",
      "Voce",
      "Materiali (Descrizione, Qtà, Fornitore, Costo)",
    ];
    const wsMat = XLSX.utils.aoa_to_sheet([headerMat, ...materialiRows]);
    wsMat["!cols"] = [{ wch: 14 }, { wch: 30 }, { wch: 80 }];
    XLSX.utils.book_append_sheet(wb, wsMat, "Materiali");
  }

  XLSX.writeFile(
    wb,
    `WBS_${progetto.titolo.replace(/[^a-zA-Z0-9]/g, "_")}.xlsx`,
  );
}

/* ═══════════════════════════════════════
   EXPORT PDF
   ═══════════════════════════════════════ */
export function esportaPDF(progetto, formato = "a4") {
  const rows = buildRows(progetto);

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: formato });
  const pageW = doc.internal.pageSize.getWidth();

  // ── Header ──
  doc.setFillColor(249, 250, 251);
  doc.rect(0, 0, pageW, 32, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(30, 30, 30);
  doc.text("WBS Office", 14, 16);

  doc.setFontSize(10);
  doc.setTextColor(180, 180, 180);
  doc.text("Work Breakdown Structure", 14, 24);

  // ── Project info ──
  const y0 = 40;

  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text(progetto.titolo, 14, y0);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const infoLine = `Avanzamento: ${progetto.percentuale}%  |  Nodi: ${contaNodi(progetto)}  |  Elementi: ${contaFoglie(progetto)}`;
  doc.text(infoLine, 14, y0 + 7);

  // ── Progress bar ──
  const barY = y0 + 12;
  const barW = pageW - 28;
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(230, 230, 230);
  doc.roundedRect(14, barY, barW, 4, 2, 2, "FD");

  if (progetto.percentuale > 0) {
    const fillW = Math.max(4, (barW * progetto.percentuale) / 100);
    const color =
      progetto.percentuale >= 100
        ? [34, 197, 94]
        : progetto.percentuale >= 50
          ? [234, 179, 8]
          : [220, 38, 38];
    doc.setFillColor(...color);
    doc.roundedRect(14, barY, fillW, 4, 2, 2, "F");
  }

  // ── Table ──
  const tableY = barY + 12;

  const tableHead = [
    [
      "WBS",
      "Titolo",
      "Liv.",
      "Responsabile",
      "Scadenza",
      "Stato",
      "%",
      "Costo",
    ],
  ];

  const tableBody = rows.map((r) => [
    r.codice,
    r.titolo,
    r.livello,
    r.responsabile,
    r.scadenza,
    r.stato,
    r.percentuale,
    r.costoTotale || r.costoMateriali || "",
  ]);

  autoTable(doc, {
    startY: tableY,
    head: tableHead,
    body: tableBody,
    theme: "grid",
    margin: { left: 14, right: 14 },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      lineColor: [200, 200, 200],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [243, 244, 246],
      textColor: [30, 30, 30],
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: {
      textColor: [40, 40, 40],
    },
    columnStyles: {
      0: { cellWidth: "auto", halign: "center", fontStyle: "bold" },
      1: { cellWidth: "auto" },
      2: { cellWidth: "auto", halign: "center" },
      3: { cellWidth: "auto" },
      4: { cellWidth: "auto", halign: "center" },
      5: { cellWidth: "auto", halign: "center" },
      6: { cellWidth: "auto", halign: "center", fontStyle: "bold" },
      7: { cellWidth: "auto", halign: "right" },
    },
    didParseCell(data) {
      if (data.section === "body") {
        const row = rows[data.row.index];
        if (row?.isParent) {
          data.cell.styles.fillColor = [240, 245, 255];
          data.cell.styles.fontStyle = "bold";
        }
        // Color status — semaforo
        if (data.column.index === 5) {
          const stato = data.cell.raw;
          if (stato === "Completato") {
            data.cell.styles.textColor = [22, 163, 74];
            data.cell.styles.fontStyle = "bold";
          } else if (stato === "In corso") {
            data.cell.styles.textColor = [217, 119, 6];
            data.cell.styles.fontStyle = "bold";
          } else if (stato === "Da fare") {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = "bold";
          }
        }
      }
    },
  });

  // ── Footer ──
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text(
      `WBS Office — ${progetto.titolo} — Pagina ${i}/${pageCount}`,
      pageW / 2,
      pageH - 6,
      { align: "center" },
    );
    doc.text(new Date().toLocaleDateString("it-IT"), pageW - 14, pageH - 6, {
      align: "right",
    });
  }

  doc.save(`WBS_${progetto.titolo.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
}
