import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import jsPDF from "jspdf";
import { calcolaStatoNodo, derivaStato, raccogliFoglie, STATO_LABEL } from "../utils/treeHelpers";

/* ═══════════════════════════════════════════
   CRONOPROGRAMMA – Diagramma di Gantt
   ═══════════════════════════════════════════ */

/* ── Semaforo ── */
const STATO_BAR = {
  todo: { bg: "#fb7185", bgLight: "rgba(251,113,133,0.25)", text: "#000" },
  "in-progress": {
    bg: "#facc15",
    bgLight: "rgba(250,204,21,0.25)",
    text: "#000",
  },
  done: { bg: "#a3e635", bgLight: "rgba(163,230,53,0.25)", text: "#000" },
};
/* ── Helpers date ── */
function parseDate(str) {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function diffDays(a, b) {
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function formatDate(d) {
  return d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

const MESI = [
  "Gen",
  "Feb",
  "Mar",
  "Apr",
  "Mag",
  "Giu",
  "Lug",
  "Ago",
  "Set",
  "Ott",
  "Nov",
  "Dic",
];

/* ── Appiattisce l'albero in righe con livello di indentazione ── */
function flattenTree(nodo, depth = 0, wbsCode = "") {
  const righe = [];
  const children = nodo.children || [];

  children.forEach((child, i) => {
    const code = wbsCode ? `${wbsCode}.${i + 1}` : `${i + 1}`;
    const isLeaf = !child.children || child.children.length === 0;
    const stato = isLeaf ? derivaStato(child.percentuale) : calcolaStatoNodo(child);

    // Calcola date per nodi padre (se non hanno date proprie, usa min/max dei figli)
    let inizio = parseDate(child.dataInizio);
    let fine = parseDate(child.dataScadenza);

    if (!isLeaf) {
      const dateFigli = raccogliDate(child);
      if (!inizio && dateFigli.minInizio) inizio = dateFigli.minInizio;
      if (!fine && dateFigli.maxFine) fine = dateFigli.maxFine;
    }

    righe.push({
      id: child.id,
      wbsCode: code,
      titolo: child.titolo,
      depth,
      isLeaf,
      stato,
      percentuale: child.percentuale || 0,
      inizio,
      fine,
      responsabile: child.responsabile || "",
    });

    if (!isLeaf) {
      righe.push(...flattenTree(child, depth + 1, code));
    }
  });

  return righe;
}



/** Raccoglie la data più vecchia e la più recente tra tutti i discendenti */
function raccogliDate(nodo) {
  let minInizio = null;
  let maxFine = null;

  function visit(n) {
    const di = parseDate(n.dataInizio);
    const df = parseDate(n.dataScadenza);
    if (di && (!minInizio || di < minInizio)) minInizio = di;
    if (df && (!maxFine || df > maxFine)) maxFine = df;
    if (n.children) n.children.forEach(visit);
  }
  visit(nodo);
  return { minInizio, maxFine };
}

/* ── Costanti di layout ── */
const ROW_H = 36;
const HEADER_H = 52;
const LABEL_W = 320;
const DAY_W = 32; // larghezza di ogni giorno
const MIN_BAR_W = 6;

export default function GanttChart({ progetto, onAggiornaNodo }) {
  const scrollRef = useRef(null);
  const [zoom, setZoom] = useState(1); // 0.5 | 1 | 2
  const [formatoPDF, setFormatoPDF] = useState("a4");

  /* ── Drag state for bar move / resize ── */
  const dragRef = useRef(null); // { id, mode: 'move'|'resize-l'|'resize-r', startX, origInizio, origFine }
  const [dragDelta, setDragDelta] = useState(null); // { id, deltaStart, deltaEnd } (in days) during drag

  const dayW = DAY_W * zoom;

  /** Format date as YYYY-MM-DD for storage */
  const toISO = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  /* ── Drag handlers ── */
  const dragListenersRef = useRef(null);

  // Cleanup drag listeners on unmount
  useEffect(() => {
    return () => {
      if (dragListenersRef.current) {
        document.removeEventListener("mousemove", dragListenersRef.current.onMove);
        document.removeEventListener("mouseup", dragListenersRef.current.onUp);
        dragListenersRef.current = null;
      }
    };
  }, []);

  const handleDragStart = useCallback((e, id, mode, inizio, fine) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { id, mode, startX: e.clientX, origInizio: inizio, origFine: fine };
    setDragDelta({ id, deltaStart: 0, deltaEnd: 0 });

    const latestDelta = { deltaStart: 0, deltaEnd: 0 };

    const onMove = (ev) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dDays = Math.round(dx / dayW);
      const { mode: m } = dragRef.current;
      if (m === "move") {
        latestDelta.deltaStart = dDays;
        latestDelta.deltaEnd = dDays;
      } else if (m === "resize-l") {
        latestDelta.deltaStart = dDays;
        latestDelta.deltaEnd = 0;
      } else if (m === "resize-r") {
        latestDelta.deltaStart = 0;
        latestDelta.deltaEnd = dDays;
      }
      setDragDelta({ id, ...latestDelta });
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      dragListenersRef.current = null;
      const ref = dragRef.current;
      dragRef.current = null;
      setDragDelta(null);
      if (!ref || !onAggiornaNodo) return;
      const { deltaStart: ds, deltaEnd: de } = latestDelta;
      if (ds === 0 && de === 0) return;
      const newInizio = addDays(ref.origInizio, ds);
      const newFine = addDays(ref.origFine, de);
      // Ensure start <= end (minimum 1 day)
      if (newInizio > newFine) return;
      onAggiornaNodo(ref.id, {
        dataInizio: toISO(newInizio),
        dataScadenza: toISO(newFine),
      });
    };

    dragListenersRef.current = { onMove, onUp };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [dayW, onAggiornaNodo]);

  const righe = useMemo(() => flattenTree(progetto, 0, ""), [progetto]);

  // Calcola range date globale del progetto
  const { globalStart, globalEnd, totalDays } = useMemo(() => {
    let min = null,
      max = null;
    for (const r of righe) {
      if (r.inizio && (!min || r.inizio < min)) min = r.inizio;
      if (r.fine && (!max || r.fine > max)) max = r.fine;
    }
    // Se non ci sono date, usa un range di default (oggi + 30gg)
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    if (!min) min = oggi;
    if (!max) max = addDays(oggi, 30);

    // Aggiungi un po' di padding
    min = addDays(min, -3);
    max = addDays(max, 7);

    const days = diffDays(min, max) + 1;
    return { globalStart: min, globalEnd: max, totalDays: Math.max(days, 7) };
  }, [righe]);

  const oggi = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const oggiOffset = diffDays(globalStart, oggi);

  // ── Genera header mesi e giorni ──
  const mesiHeader = useMemo(() => {
    const mesi = [];
    let corrente = new Date(globalStart);
    while (corrente <= globalEnd) {
      const m = corrente.getMonth();
      const y = corrente.getFullYear();
      const inizioMese = new Date(y, m, 1);
      const fineMese = new Date(y, m + 1, 0);
      const start = corrente > inizioMese ? corrente : inizioMese;
      const end = fineMese < globalEnd ? fineMese : globalEnd;
      const days = diffDays(start, end) + 1;
      const offset = diffDays(globalStart, start);
      mesi.push({ label: `${MESI[m]} ${y}`, offset, days });
      corrente = addDays(end, 1);
    }
    return mesi;
  }, [globalStart, globalEnd]);

  const giorniHeader = useMemo(() => {
    const giorni = [];
    for (let i = 0; i < totalDays; i++) {
      const d = addDays(globalStart, i);
      const dow = d.getDay();
      giorni.push({
        label: d.getDate(),
        isWeekend: dow === 0 || dow === 6,
        isToday: d.getTime() === oggi.getTime(),
      });
    }
    return giorni;
  }, [globalStart, totalDays, oggi]);

  const chartW = totalDays * dayW;
  const chartH = righe.length * ROW_H;

  // ── Stats ──
  const righeConDate = righe.filter((r) => r.inizio && r.fine);
  const righeSenzaDate = righe.filter((r) => !r.inizio || !r.fine);

  /* ── Export Gantt as PDF ── */
  const handleExportPDF = (formato = "a4") => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: formato,
    });
    const pW = doc.internal.pageSize.getWidth();
    const pH = doc.internal.pageSize.getHeight();
    const margin = 8;

    // Header
    doc.setFillColor(249, 250, 251);
    doc.rect(0, 0, pW, 22, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text(`Cronoprogramma — ${progetto.titolo}`, margin, 14);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Generato il ${new Date().toLocaleDateString("it-IT")}`,
      pW - margin,
      14,
      { align: "right" },
    );

    const tableTop = 28;
    const colWidths = [12, 55, 22, 22, 18, 18];
    const headers = ["WBS", "Attività", "Inizio", "Fine", "%", "Stato"];
    const totalW = colWidths.reduce((a, b) => a + b, 0);

    // Table header
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, tableTop, totalW, 7, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    let xPos = margin;
    headers.forEach((h, i) => {
      doc.text(h, xPos + 1, tableTop + 5);
      xPos += colWidths[i];
    });

    // Rows
    doc.setFont("helvetica", "normal");
    let y = tableTop + 7;
    righe.forEach((r, idx) => {
      if (y > pH - 15) {
        doc.addPage();
        y = 12;
      }
      const fillColor = idx % 2 === 0 ? [255, 255, 255] : [249, 250, 251];
      doc.setFillColor(...fillColor);
      doc.rect(margin, y, totalW, 6, "F");

      doc.setFontSize(6);
      const indent = "  ".repeat(r.depth);
      const statoLabel = STATO_LABEL[r.stato] || "Da fare";
      const vals = [
        r.wbsCode,
        indent + r.titolo,
        r.inizio ? formatDate(r.inizio) : "—",
        r.fine ? formatDate(r.fine) : "—",
        `${r.percentuale}%`,
        statoLabel,
      ];

      xPos = margin;
      vals.forEach((v, i) => {
        if (i === 5) {
          // Stato colorato
          const sc =
            r.stato === "done"
              ? [34, 197, 94]
              : r.stato === "in-progress"
                ? [234, 179, 8]
                : [239, 68, 68];
          doc.setTextColor(...sc);
        } else {
          doc.setTextColor(
            r.isLeaf ? 203 : 251,
            r.isLeaf ? 213 : 191,
            r.isLeaf ? 225 : 36,
          );
        }
        const text = doc.splitTextToSize(v, colWidths[i] - 2);
        doc.text(text[0] || "", xPos + 1, y + 4);
        xPos += colWidths[i];
      });

      y += 6;
    });

    // Gantt bar section on remaining space or new page
    doc.addPage();
    doc.setFillColor(249, 250, 251);
    doc.rect(0, 0, pW, 22, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text("Diagramma di Gantt", margin, 14);

    // Simple visual bars
    const barTop = 28;
    const barLabelW = 60;
    const barAreaW = pW - margin * 2 - barLabelW;
    let by = barTop;

    // Header row
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, by, barLabelW + barAreaW, 6, "F");
    doc.setFontSize(6);
    doc.setTextColor(120, 120, 120);
    doc.text("Attività", margin + 1, by + 4);

    // Date labels above bar area
    if (totalDays > 0) {
      const step = Math.max(1, Math.floor(totalDays / 10));
      for (let i = 0; i < totalDays; i += step) {
        const d = addDays(globalStart, i);
        const xd = margin + barLabelW + (i / totalDays) * barAreaW;
        doc.setTextColor(100, 100, 100);
        doc.text(formatDate(d), xd, by + 4);
      }
    }
    by += 7;

    righeConDate.forEach((r, idx) => {
      if (by > pH - 10) {
        doc.addPage();
        by = 12;
      }
      const fillColor = idx % 2 === 0 ? [255, 255, 255] : [249, 250, 251];
      doc.setFillColor(...fillColor);
      doc.rect(margin, by, barLabelW + barAreaW, 5, "F");

      // Label
      doc.setFontSize(5);
      doc.setTextColor(60, 60, 60);
      const label = doc.splitTextToSize(r.titolo, barLabelW - 2);
      doc.text(label[0] || "", margin + 1, by + 3.5);

      // Bar
      const startOff = diffDays(globalStart, r.inizio);
      const dur = Math.max(1, diffDays(r.inizio, r.fine));
      const barX = margin + barLabelW + (startOff / totalDays) * barAreaW;
      const barW = Math.max(1, (dur / totalDays) * barAreaW);

      // Background bar
      doc.setFillColor(229, 231, 235);
      doc.roundedRect(barX, by + 0.5, barW, 4, 1, 1, "F");

      // Progress fill
      const sc =
        r.stato === "done"
          ? [34, 197, 94]
          : r.stato === "in-progress"
            ? [234, 179, 8]
            : [239, 68, 68];
      doc.setFillColor(...sc);
      const fillW = barW * (r.percentuale / 100);
      if (fillW > 0) doc.roundedRect(barX, by + 0.5, fillW, 4, 1, 1, "F");

      // Percentage text
      doc.setFontSize(4);
      doc.setTextColor(255, 255, 255);
      if (barW > 10) doc.text(`${r.percentuale}%`, barX + 1, by + 3.5);

      by += 5;
    });

    doc.save(
      `Cronoprogramma_${progetto.titolo.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">
      {/* ── Header ── */}
      <div className="shrink-0 bg-white border-b-2 border-black px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">📅</span>
              <h1 className="text-xl font-extrabold text-black">
                {progetto.titolo}
              </h1>
            </div>
            <p className="text-sm text-gray-600 font-bold ml-10">
              Cronoprogramma — Diagramma di Gantt
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Zoom controls */}
            <div className="flex items-center gap-1.5 bg-white rounded-xl border-2 border-black px-2 py-1">
              <span className="text-[10px] text-black font-bold mr-1">
                Zoom
              </span>
              {[0.5, 1, 2].map((z) => (
                <button
                  key={z}
                  onClick={() => setZoom(z)}
                  className={`px-2 py-1 text-[11px] font-bold rounded-lg cursor-pointer transition-all ${
                    zoom === z
                      ? "bg-amber-400 text-black border-2 border-black shadow-[2px_2px_0px_#000]"
                      : "text-gray-600 hover:bg-gray-100 border-2 border-transparent"
                  }`}
                >
                  {z === 0.5 ? "−" : z === 1 ? "●" : "+"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 bg-white rounded-xl border-2 border-black px-2 py-1">
              <span className="text-[10px] text-black font-bold mr-1">
                Formato
              </span>
              <select
                value={formatoPDF}
                onChange={(e) => setFormatoPDF(e.target.value)}
                className="text-[11px] bg-transparent text-black font-bold cursor-pointer focus:outline-none"
              >
                <option value="a4">A4</option>
                <option value="a3">A3</option>
                <option value="a2">A2</option>
                <option value="a1">A1</option>
              </select>
            </div>
            <button
              onClick={() => handleExportPDF(formatoPDF)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-300 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none border-2 border-black rounded-xl text-black text-sm font-bold transition-all cursor-pointer shadow-[3px_3px_0px_#000]"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Esporta PDF
            </button>
          </div>
        </div>

        {/* Stats mini */}
        <div className="flex items-center gap-5 mt-3 ml-10">
          <span className="text-[11px] text-gray-600 font-bold">
            📊 {righe.length} attività totali
          </span>
          <span className="text-[11px] text-gray-600 font-bold">
            📅 {righeConDate.length} con date assegnate
          </span>
          {righeSenzaDate.length > 0 && (
            <span className="text-[11px] text-gray-600 font-bold">
              ⚠️ {righeSenzaDate.length} senza date
            </span>
          )}
          <span className="text-[11px] text-gray-600 font-bold">
            🗓️ {formatDate(globalStart)} → {formatDate(globalEnd)}
          </span>
        </div>
      </div>

      {/* ── Legenda stati ── */}
      <div className="shrink-0 bg-white border-b-2 border-black px-6 py-2 flex items-center gap-5">
        <span className="text-[10px] text-black font-bold uppercase">
          LEGENDA:
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-3 rounded-lg bg-rose-400 border-2 border-black" />
          <span className="text-[10px] text-black font-bold">Da fare</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-3 rounded-lg bg-yellow-400 border-2 border-black" />
          <span className="text-[10px] text-black font-bold">In corso</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-3 rounded-lg bg-lime-400 border-2 border-black" />
          <span className="text-[10px] text-black font-bold">Completato</span>
        </div>
        <div className="flex items-center gap-1.5 ml-3">
          <div className="w-px h-3 bg-amber-400" />
          <span className="text-[10px] text-black font-bold">Oggi</span>
        </div>
        <div className="flex items-center gap-1.5 ml-3">
          <span className="text-[10px] text-black font-bold">✋ Trascina barre per spostare · Bordi per ridimensionare</span>
        </div>
      </div>

      {/* ── Gantt area ── */}
      {righe.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-600">
          <div className="text-center">
            <p className="text-lg font-bold mb-2">Nessun elemento nel progetto</p>
            <p className="text-sm">
              Vai nell'Albero WBS per creare la struttura
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* ── Label column (fixed left) ── */}
          <div
            className="shrink-0 flex flex-col bg-white border-r-2 border-black z-10"
            style={{ width: LABEL_W }}
          >
            {/* Header above labels */}
            <div
              className="shrink-0 flex items-end border-b-2 border-black bg-gray-100"
              style={{ height: HEADER_H }}
            >
              <div className="flex items-center gap-2 px-4 pb-2">
                <span className="text-[10px] text-black font-bold uppercase tracking-wider">
                  Codice
                </span>
                <span className="text-[10px] text-black font-bold uppercase tracking-wider flex-1">
                  Attività
                </span>
              </div>
            </div>
            {/* Label rows */}
            <div
              className="flex-1 overflow-y-auto overflow-x-hidden"
              onScroll={(e) => {
                // Sync vertical scroll with chart area
                if (scrollRef.current)
                  scrollRef.current.scrollTop = e.target.scrollTop;
              }}
            >
              {righe.map((r, i) => (
                <div
                  key={r.id}
                  className={`flex items-center gap-2 px-3 border-b border-gray-200 ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-100"
                  } ${!r.isLeaf ? "font-bold" : ""}`}
                  style={{ height: ROW_H, paddingLeft: 12 + r.depth * 16 }}
                >
                  <span className="text-[10px] text-gray-600 font-mono shrink-0 w-10">
                    {r.wbsCode}
                  </span>
                  <span
                    className={`text-xs truncate flex-1 ${r.isLeaf ? "text-gray-700" : "text-black"}`}
                  >
                    {r.titolo}
                  </span>
                  <span className="text-[10px] text-black font-bold shrink-0 w-8 text-right">
                    {r.percentuale}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Chart area (scrollable) ── */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-auto"
            onScroll={(e) => {
              // Sync vertical scroll with label column
              const labelCol =
                e.target.previousSibling?.querySelector(".overflow-y-auto");
              if (labelCol) labelCol.scrollTop = e.target.scrollTop;
            }}
          >
            <div style={{ width: chartW, minHeight: chartH + HEADER_H }}>
              {/* ── Timeline header ── */}
              <div
                className="sticky top-0 z-10 bg-gray-100"
                style={{ height: HEADER_H }}
              >
                {/* Months row */}
                <div className="flex" style={{ height: 24 }}>
                  {mesiHeader.map((m, i) => (
                    <div
                      key={i}
                      className="border-r border-b-2 border-black flex items-center justify-center text-[11px] font-bold text-black"
                      style={{
                        width: m.days * dayW,
                        marginLeft: i === 0 ? m.offset * dayW : 0,
                      }}
                    >
                      {m.label}
                    </div>
                  ))}
                </div>
                {/* Days row */}
                <div className="flex" style={{ height: HEADER_H - 24 }}>
                  {giorniHeader.map((g, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-center text-[9px] border-r border-b font-bold ${
                        g.isToday
                          ? "bg-amber-200 text-black border-black font-extrabold"
                          : g.isWeekend
                            ? "bg-gray-100/50 text-gray-500 border-gray-200"
                            : "text-gray-500 border-gray-200"
                      }`}
                      style={{ width: dayW }}
                    >
                      {dayW >= 20 ? g.label : i % 2 === 0 ? g.label : ""}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Chart rows ── */}
              <div className="relative">
                {/* Weekend stripes + today line */}
                {giorniHeader.map(
                  (g, i) =>
                    (g.isWeekend || g.isToday) && (
                      <div
                        key={`bg-${i}`}
                        className={`absolute top-0 ${g.isToday ? "bg-amber-50" : "bg-gray-100/30"}`}
                        style={{ left: i * dayW, width: dayW, height: chartH }}
                      />
                    ),
                )}

                {/* Today line */}
                {oggiOffset >= 0 && oggiOffset < totalDays && (
                  <div
                    className="absolute top-0 w-0.5 bg-amber-400/60 z-20"
                    style={{
                      left: oggiOffset * dayW + dayW / 2,
                      height: chartH,
                    }}
                  />
                )}

                {/* Bars */}
                {righe.map((r, i) => {
                  const topY = i * ROW_H;
                  const colors = STATO_BAR[r.stato] || STATO_BAR["todo"];

                  if (!r.inizio || !r.fine) {
                    // No dates — show placeholder
                    return (
                      <div
                        key={r.id}
                        className={`absolute flex items-center border-b border-gray-100 ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}
                        style={{
                          top: topY,
                          height: ROW_H,
                          left: 0,
                          width: chartW,
                        }}
                      >
                        <span className="text-[9px] text-gray-300 italic ml-4">
                          date non assegnate
                        </span>
                      </div>
                    );
                  }

                  // Apply drag delta if this bar is being dragged
                  const isDragging = dragDelta && dragDelta.id === r.id;
                  const ds = isDragging ? dragDelta.deltaStart : 0;
                  const de = isDragging ? dragDelta.deltaEnd : 0;
                  const effInizio = addDays(r.inizio, ds);
                  const effFine = addDays(r.fine, de);

                  const startOff = diffDays(globalStart, effInizio);
                  const dur = Math.max(1, diffDays(effInizio, effFine));
                  const barLeft = startOff * dayW;
                  const barWidth = Math.max(MIN_BAR_W, dur * dayW);
                  const fillWidth = barWidth * (r.percentuale / 100);

                  const canDrag = r.isLeaf && onAggiornaNodo;

                  return (
                    <div
                      key={r.id}
                      className={`absolute flex items-center border-b border-gray-100 ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}
                      style={{
                        top: topY,
                        height: ROW_H,
                        left: 0,
                        width: chartW,
                      }}
                    >
                      {/* Bar container */}
                      <div
                        className={`absolute group ${r.isLeaf ? "rounded-md" : "rounded-sm"} ${isDragging ? "opacity-80 z-30" : ""} ${canDrag ? "cursor-grab active:cursor-grabbing" : ""}`}
                        style={{
                          left: barLeft,
                          width: barWidth,
                          top: r.isLeaf ? 8 : 14,
                          height: r.isLeaf ? 20 : 8,
                        }}
                        onMouseDown={canDrag ? (e) => {
                          // Only start move if not on a resize handle
                          if (e.target.dataset.resize) return;
                          handleDragStart(e, r.id, "move", r.inizio, r.fine);
                        } : undefined}
                      >
                        {/* Background */}
                        <div
                          className={`absolute inset-0 ${r.isLeaf ? "rounded-md border border-black/30" : "rounded-sm border-2 border-black/50"}`}
                          style={{
                            backgroundColor: r.isLeaf ? colors.bgLight : colors.bg,
                            opacity: r.isLeaf ? 1 : 0.5,
                          }}
                        />
                        {/* Parent diamond markers at start/end */}
                        {!r.isLeaf && (
                          <>
                            <div
                              className="absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 border-2 border-black/60"
                              style={{ backgroundColor: colors.bg }}
                            />
                            <div
                              className="absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 border-2 border-black/60"
                              style={{ backgroundColor: colors.bg }}
                            />
                          </>
                        )}
                        {/* Progress fill (only for leaf bars) */}
                        {r.isLeaf && (
                          <div
                            className={`absolute top-0 left-0 h-full rounded-md ${isDragging ? "" : "transition-all duration-300"}`}
                            style={{
                              width: fillWidth,
                              backgroundColor: colors.bg,
                              opacity: 0.7,
                            }}
                          />
                        )}
                        {/* Label inside bar */}
                        {r.isLeaf && barWidth > 50 && (
                          <div className="absolute inset-0 flex items-center px-2 z-10 pointer-events-none">
                            <span
                              className="text-[10px] font-bold truncate"
                              style={{ color: "#000" }}
                            >
                              {isDragging
                                ? `${formatDate(effInizio)} → ${formatDate(effFine)}`
                                : `${r.percentuale}%`}
                            </span>
                          </div>
                        )}

                        {/* ── Resize handle LEFT ── */}
                        {canDrag && (
                          <div
                            data-resize="left"
                            className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize z-20 group/handle"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handleDragStart(e, r.id, "resize-l", r.inizio, r.fine);
                            }}
                          >
                            <div className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-black/0 group-hover/handle:bg-black/40 transition-colors" />
                          </div>
                        )}

                        {/* ── Resize handle RIGHT ── */}
                        {canDrag && (
                          <div
                            data-resize="right"
                            className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize z-20 group/handle"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handleDragStart(e, r.id, "resize-r", r.inizio, r.fine);
                            }}
                          >
                            <div className="absolute right-0 top-1 bottom-1 w-1 rounded-full bg-black/0 group-hover/handle:bg-black/40 transition-colors" />
                          </div>
                        )}

                        {/* Tooltip hover */}
                        {!isDragging && (
                          <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 bg-white border-2 border-black rounded-xl px-3 py-2 shadow-[4px_4px_0px_#000] z-50 whitespace-nowrap transition-opacity">
                            <p className="text-xs font-bold text-black">
                              {r.titolo}
                            </p>
                            <p className="text-[10px] text-gray-600 mt-0.5">
                              {formatDate(r.inizio)} → {formatDate(r.fine)} ({dur}
                              gg)
                            </p>
                            <p
                              className="text-[10px] mt-0.5"
                              style={{ color: colors.text }}
                            >
                              {STATO_LABEL[r.stato]} — {r.percentuale}%
                            </p>
                            {canDrag && (
                              <p className="text-[9px] text-gray-400 mt-1 italic">
                                Trascina per spostare · Bordi per ridimensionare
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
