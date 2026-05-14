import { useState, useRef, Children, useCallback } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { calcolaStatoNodo, STATO_BADGE, STATO_LABEL } from "../utils/treeHelpers";
import TaskModal from "./TaskModal";

/* ─── Semaforo: colori per nodo ─── */
const STATO_BORDER = {
  todo: "border-red-500",
  "in-progress": "border-yellow-500",
  done: "border-green-500",
};

const STATO_BG = {
  todo: "bg-red-100",
  "in-progress": "bg-yellow-100",
  done: "bg-lime-100",
};

/* ─── Recursive Tree Node ─── */
function TreeNode({
  wbsCode,
  titolo,
  nodo,
  children: childElements,
  onEdit,
  onAdd,
  onDelete,
  onMoveUp,
  onMoveDown,
  onPromuovi,
  onDeclassa,
  isFirst,
  isLast,
  isRoot,
}) {
  const [expanded, setExpanded] = useState(true);

  const childArray = Children.toArray(childElements);
  const hasChildren = childArray.length > 0;
  const statoNodo = nodo ? calcolaStatoNodo(nodo) : "todo";

  /* ── Root card style ── */
  if (isRoot) {
    return (
      <div className="flex flex-col items-center">
        <div className="wbs-node-card group relative border-4 border-black rounded-2xl px-6 py-4 min-w-[200px] max-w-[280px] bg-white text-center shadow-[6px_6px_0px_#000] select-none">
          {/* Crown icon */}
          <div className="text-base mb-1">🏗️</div>
          <div className="text-black font-extrabold text-base tracking-wide">{wbsCode}</div>
          <div className="text-black text-sm font-extrabold mt-1 leading-snug">{titolo}</div>
          {/* Progress */}
          {nodo && (
            <div className="mt-2 flex flex-col items-center gap-1">
              <div className="w-full bg-gray-200 rounded-full h-2 border border-black overflow-hidden">
                <div
                  className="h-full rounded-full bg-black"
                  style={{ width: `${nodo.percentuale || 0}%` }}
                />
              </div>
              <span className="text-xs font-extrabold text-black">{nodo.percentuale || 0}%</span>
            </div>
          )}
          {/* Action buttons (only add) */}
          {onAdd && nodo && (
            <div className="flex justify-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(nodo); }}
                  className="w-6 h-6 flex items-center justify-center rounded-lg bg-sky-300 border-2 border-black text-[10px] hover:scale-110 transition-transform cursor-pointer shadow-[1px_1px_0px_#000]"
                  title="Modifica progetto"
                >✏️</button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onAdd(nodo.id); }}
                className="w-7 h-6 flex items-center justify-center rounded-lg bg-amber-400 border-2 border-black text-black font-extrabold text-sm hover:scale-110 transition-transform cursor-pointer shadow-[2px_2px_0px_#000]"
                title="Aggiungi fase principale"
              >＋</button>
            </div>
          )}
          {/* Expand toggle */}
          {hasChildren && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
              className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-black flex items-center justify-center text-black hover:bg-amber-400 transition-colors cursor-pointer z-10 shadow-[2px_2px_0px_#000]"
              title={expanded ? "Comprimi" : "Espandi"}
            >
              <svg className={`w-3 h-3 transition-transform duration-200 ${expanded ? "" : "-rotate-90"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
        {hasChildren && expanded && (
          <div className="flex flex-col items-center">
            <div className="w-px h-10 bg-black" />
            <div className="flex items-start wbs-children-row">
              {childArray.map((child, i) => (
                <div key={child.key || i} className="wbs-child-wrapper flex flex-col items-center px-4">{child}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* ── Node Card ── */}
      <div
        className={`wbs-node-card group relative border-2 rounded-xl px-5 py-3 min-w-[170px] max-w-[240px] text-center shadow-[4px_4px_0px_#000] transition-all select-none ${STATO_BORDER[statoNodo] || STATO_BORDER["todo"]} ${STATO_BG[statoNodo] || STATO_BG["todo"]}`}
      >
        <div className="text-black font-extrabold text-sm">{wbsCode}</div>
        <div className="text-gray-700 text-xs font-bold mt-1 leading-relaxed">
          {titolo}
        </div>

        {/* Status badge */}
        {nodo && (
          <div className="flex justify-center mt-1.5">
            <span
              className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${STATO_BADGE[statoNodo] || STATO_BADGE["todo"]}`}
            >
              {statoNodo === "done"
                ? "✅"
                : statoNodo === "in-progress"
                  ? "🔄"
                  : "⬜"}{" "}
              {STATO_LABEL[statoNodo] || "Da fare"}
            </span>
          </div>
        )}

        {/* Info badges */}
        {nodo && (
          <div className="flex flex-wrap justify-center gap-1 mt-1.5">
            {nodo.percentuale > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full border-2 border-black bg-amber-200 text-black font-bold">
                {nodo.percentuale}%
              </span>
            )}
            {nodo.materiali && nodo.materiali.length > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full border-2 border-black bg-sky-200 text-black font-bold">
                📦 {nodo.materiali.length}
              </span>
            )}
            {nodo.costoTotale !== "" &&
              nodo.costoTotale !== undefined &&
              nodo.costoTotale > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full border-2 border-black bg-lime-200 text-black font-bold">
                  💰 €{Number(nodo.costoTotale).toLocaleString("it-IT")}
                </span>
              )}
            {nodo.note && (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full border-2 border-black bg-violet-200 text-black font-bold"
                title={nodo.note}
              >
                📝
              </span>
            )}
          </div>
        )}

        {/* Action buttons — visible on hover */}
        {(onEdit || onAdd || onDelete) && nodo && (
          <div className="flex justify-center gap-0.5 mt-2 pb-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(nodo); }}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-sky-300 border-2 border-black text-[10px] hover:scale-110 transition-transform cursor-pointer shadow-[1px_1px_0px_#000]"
                title="Modifica"
              >✏️</button>
            )}
            {onAdd && (
              <button
                onClick={(e) => { e.stopPropagation(); onAdd(nodo.id); }}
                className="w-7 h-6 flex items-center justify-center rounded-lg bg-amber-400 border-2 border-black text-black font-extrabold text-sm hover:scale-110 transition-transform cursor-pointer shadow-[2px_2px_0px_#000]"
                title="Aggiungi fase figlia"
              >＋</button>
            )}
            {onPromuovi && (
              <button
                onClick={(e) => { e.stopPropagation(); onPromuovi(nodo.id); }}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-white border-2 border-black text-black font-bold text-xs hover:scale-110 transition-transform cursor-pointer shadow-[1px_1px_0px_#000]"
                title="Promuovi (sale di livello)"
              >←</button>
            )}
            {onDeclassa && (
              <button
                onClick={(e) => { e.stopPropagation(); onDeclassa(nodo.id); }}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-white border-2 border-black text-black font-bold text-xs hover:scale-110 transition-transform cursor-pointer shadow-[1px_1px_0px_#000]"
                title="Declassa (scende di livello)"
              >→</button>
            )}
            {onMoveUp && !isFirst && (
              <button
                onClick={(e) => { e.stopPropagation(); onMoveUp(nodo.id); }}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-white border-2 border-black text-black font-bold text-xs hover:scale-110 transition-transform cursor-pointer shadow-[1px_1px_0px_#000]"
                title="Sposta su"
              >↑</button>
            )}
            {onMoveDown && !isLast && (
              <button
                onClick={(e) => { e.stopPropagation(); onMoveDown(nodo.id); }}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-white border-2 border-black text-black font-bold text-xs hover:scale-110 transition-transform cursor-pointer shadow-[1px_1px_0px_#000]"
                title="Sposta giù"
              >↓</button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(nodo.id); }}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-red-600 border-2 border-black text-black font-bold text-[10px] hover:scale-110 transition-transform cursor-pointer shadow-[1px_1px_0px_#000]"
                title="Elimina"
              >🗑</button>
            )}
          </div>
        )}

        {/* Expand / Collapse toggle */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-black flex items-center justify-center text-black hover:bg-amber-400 transition-colors cursor-pointer z-10 shadow-[2px_2px_0px_#000]"
            title={expanded ? "Comprimi" : "Espandi"}
          >
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${expanded ? "" : "-rotate-90"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        )}
      </div>

      {/* ── Children with connector lines ── */}
      {hasChildren && expanded && (
        <div className="flex flex-col items-center">
          {/* Vertical line: parent → horizontal bar */}
          <div className="w-px h-10 bg-black" />

          {/* Row of children */}
          <div className="flex items-start wbs-children-row">
            {childArray.map((child, i) => (
              <div
                key={child.key || i}
                className="wbs-child-wrapper flex flex-col items-center px-4"
              >
                {child}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main WBSTree component ─── */
export default function WBSTree({ progetto, progettoIndex, onAggiungiNodo, onEliminaNodo, onAggiornaNodo, onSpostaNodo, onPromuoviNodo, onDeclassaNodo, onReplaceProgetto }) {
  const containerRef = useRef(null);
  const treeRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [formatoPDF, setFormatoPDF] = useState("a4");
  const [modal, setModal] = useState(null);
  const panRef = useRef({ startX: 0, startY: 0, scrollX: 0, scrollY: 0 });

  /* ── Undo stack ── */
  const undoStackRef = useRef([]);
  const [canUndo, setCanUndo] = useState(false);
  const progettoRef = useRef(progetto);
  useRef(() => { progettoRef.current = progetto; });
  // Keep ref current on every render
  progettoRef.current = progetto;

  const pushUndo = useCallback(() => {
    undoStackRef.current = [...undoStackRef.current.slice(-29), JSON.parse(JSON.stringify(progettoRef.current))];
    setCanUndo(true);
  }, []);

  const handleUndo = useCallback(() => {
    if (undoStackRef.current.length === 0) return;
    const snapshot = undoStackRef.current[undoStackRef.current.length - 1];
    undoStackRef.current = undoStackRef.current.slice(0, -1);
    setCanUndo(undoStackRef.current.length > 0);
    onReplaceProgetto && onReplaceProgetto(progetto.id, snapshot);
  }, [progetto.id, onReplaceProgetto]);

  /* ── Edit handlers ── */
  const handleEdit = useCallback((nodo) => { setModal({ node: nodo }); }, []);
  const handleAdd = useCallback((parentId) => { setModal({ parentId, node: null }); }, []);
  const handleDelete = useCallback((nodeId) => { pushUndo(); onEliminaNodo && onEliminaNodo(progetto.id, nodeId); }, [progetto.id, onEliminaNodo, pushUndo]);
  const handleMoveUp = useCallback((nodeId) => { pushUndo(); onSpostaNodo && onSpostaNodo(progetto.id, nodeId, -1); }, [progetto.id, onSpostaNodo, pushUndo]);
  const handleMoveDown = useCallback((nodeId) => { pushUndo(); onSpostaNodo && onSpostaNodo(progetto.id, nodeId, 1); }, [progetto.id, onSpostaNodo, pushUndo]);
  const handlePromuovi = useCallback((nodeId) => { pushUndo(); onPromuoviNodo && onPromuoviNodo(progetto.id, nodeId); }, [progetto.id, onPromuoviNodo, pushUndo]);
  const handleDeclassa = useCallback((nodeId) => { pushUndo(); onDeclassaNodo && onDeclassaNodo(progetto.id, nodeId); }, [progetto.id, onDeclassaNodo, pushUndo]);
  const handleNodeSave = useCallback((nodeData) => {
    pushUndo();
    if (modal?.node) {
      onAggiornaNodo && onAggiornaNodo(progetto.id, modal.node.id, nodeData);
    } else {
      onAggiungiNodo && onAggiungiNodo(progetto.id, modal.parentId, nodeData);
    }
    setModal(null);
  }, [modal, progetto.id, onAggiornaNodo, onAggiungiNodo, pushUndo]);
  const handleNodeDelete = useCallback(() => {
    if (modal?.node) { pushUndo(); onEliminaNodo && onEliminaNodo(progetto.id, modal.node.id); }
    setModal(null);
  }, [modal, progetto.id, onEliminaNodo, pushUndo]);

  /* ── Export tree as visual PDF ── */
  const handleExportTreePDF = async () => {
    if (!treeRef.current) return;
    setExporting(true);
    try {
      const container = containerRef.current;
      const tree = treeRef.current;

      // Temporarily remove clipping so the full tree is visible
      const prevOverflow = container.style.overflow;
      const prevHeight = container.style.height;
      const prevMaxHeight = container.style.maxHeight;
      container.style.overflow = "visible";
      container.style.height = "auto";
      container.style.maxHeight = "none";

      // Hide action buttons for cleaner print
      const btns = tree.querySelectorAll("button");
      btns.forEach((b) => (b.style.display = "none"));

      // ── LIGHT THEME: remove dark Tailwind classes + set inline light styles ──
      // html-to-image clones DOM with classes intact, so we must REMOVE the dark
      // classes and replace with inline white/light styles for reliable rendering.
      const savedClasses = new Map(); // el → original className
      const savedCssText = new Map(); // el → original style.cssText

      const saveClass = (el) => {
        if (!savedClasses.has(el)) savedClasses.set(el, el.className);
      };
      const saveCss = (el) => {
        if (!savedCssText.has(el)) savedCssText.set(el, el.style.cssText);
      };

      // Tree wrapper background → white
      saveCss(tree);
      tree.style.cssText += "; background-color: #ffffff !important;";

      // Every node card → remove dark bg class, force white + semaforo border
      tree.querySelectorAll(".wbs-node-card").forEach((card) => {
        saveClass(card);
        saveCss(card);

        // Detect semaforo status from border classes
        const cls = card.className || "";
        let borderColor = "#000000"; // fallback black
        if (cls.includes("border-red-"))
          borderColor = "#ef4444"; // rosso
        else if (cls.includes("border-yellow-"))
          borderColor = "#eab308"; // giallo
        else if (cls.includes("border-green-")) borderColor = "#22c55e"; // verde

        // Remove all dark background/shadow/text classes
        card.className = card.className
          .replace(/bg-\[#[0-9a-fA-F]+\]/g, "")
          .replace(/shadow-[a-z]+-[^\s]*/g, "")
          .replace(/shadow-lg/g, "")
          .replace(/hover:[^\s]*/g, "")
          .replace(/transition-all/g, "");
        card.style.cssText += `; background-color: #ffffff !important; border-color: ${borderColor} !important; box-shadow: 0 1px 4px rgba(0,0,0,0.15) !important;`;

        // All child elements: force dark text, remove dark text classes
        card.querySelectorAll("*").forEach((child) => {
          if (child.tagName === "BUTTON") return;
          saveCss(child);
          if (typeof child.className === "string") {
            saveClass(child);
            child.className = child.className
              .replace(/text-amber-[^\s]*/g, "")
              .replace(/text-\[#[0-9a-fA-F]+\]/g, "")
              .replace(/bg-\[#[0-9a-fA-F]+\]/g, "");
          }
          child.style.cssText +=
            "; color: #1e293b !important; background-color: transparent !important;";
        });

        // Direct children divs: WBS code (brown) + title (dark grey)
        const directDivs = card.querySelectorAll(":scope > div");
        if (directDivs[0])
          directDivs[0].style.cssText +=
            "; color: #92400e !important; font-weight: bold !important;";
        if (directDivs[1])
          directDivs[1].style.cssText += "; color: #334155 !important;";

        // Badge spans — semaforo status badges keep their color, others neutral
        card.querySelectorAll("span").forEach((sp) => {
          const spCls = sp.className || "";
          if (spCls.includes("text-red-400")) {
            sp.style.cssText +=
              "; background-color: #fef2f2 !important; border-color: #ef4444 !important; color: #dc2626 !important;";
          } else if (spCls.includes("text-yellow-400")) {
            sp.style.cssText +=
              "; background-color: #fefce8 !important; border-color: #eab308 !important; color: #ca8a04 !important;";
          } else if (spCls.includes("text-green-400")) {
            sp.style.cssText +=
              "; background-color: #f0fdf4 !important; border-color: #22c55e !important; color: #16a34a !important;";
          } else {
            sp.style.cssText +=
              "; background-color: #f1f5f9 !important; border-color: #94a3b8 !important; color: #334155 !important;";
          }
        });

        // Force the card itself back to white (after children were set to transparent)
        card.style.cssText += "; background-color: #ffffff !important;";
      });

      // Connector lines → dark amber (any div with bg-amber class)
      tree.querySelectorAll("div").forEach((el) => {
        const cls = el.className || "";
        if (typeof cls === "string" && cls.includes("bg-amber")) {
          saveCss(el);
          el.style.cssText += "; background-color: #92400e !important;";
        }
      });

      // Force a browser repaint before capture
      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(r)),
      );

      // Capture the tree using html-to-image (native browser rendering — supports oklch)
      const dataUrl = await toPng(tree, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        filter: (node) => {
          if (node.tagName === "BUTTON") return false;
          return true;
        },
      });

      // ── Restore original dark theme (classes + inline styles) ──
      savedClasses.forEach((origClass, el) => {
        el.className = origClass;
      });
      savedCssText.forEach((origCss, el) => {
        el.style.cssText = origCss;
      });

      // Restore buttons & container
      btns.forEach((b) => (b.style.display = ""));
      container.style.overflow = prevOverflow;
      container.style.height = prevHeight;
      container.style.maxHeight = prevMaxHeight;

      // Load the image to get dimensions
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = dataUrl;
      });
      const imgW = img.width;
      const imgH = img.height;

      // Page dimensions in mm (landscape)
      const pdfW = formatoPDF === "a3" ? 420 : 297;
      const pdfH = formatoPDF === "a3" ? 297 : 210;
      const margin = 10;
      const headerH = 28;
      const usableW = pdfW - margin * 2;
      const usableH = pdfH - margin - headerH - 8;

      // Scale image to fit page width, allow multi-page if tall
      const ratio = usableW / imgW;
      const scaledH = imgH * ratio;

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: formatoPDF,
      });

      // ── Branded header (light) ──
      const drawHeader = (pageNum, totalPages) => {
        doc.setFillColor(248, 250, 252);
        doc.rect(0, 0, pdfW, headerH, "F");
        doc.setDrawColor(180, 83, 9);
        doc.setLineWidth(0.8);
        doc.line(0, headerH, pdfW, headerH);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(15, 23, 42);
        doc.text("WBS Office \u2013 Albero WBS", margin, 14);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        doc.text(`Progetto: ${progetto.titolo}`, margin, 21);
        doc.setTextColor(146, 64, 14);
        doc.text(`Avanzamento: ${progetto.percentuale}%`, margin, 26);
        doc.setTextColor(100, 116, 139);
        doc.text(`Pagina ${pageNum} / ${totalPages}`, pdfW - margin, 26, {
          align: "right",
        });
        doc.text(new Date().toLocaleDateString("it-IT"), pdfW - margin, 21, {
          align: "right",
        });
      };

      const totalPages = Math.max(1, Math.ceil(scaledH / usableH));

      for (let p = 0; p < totalPages; p++) {
        if (p > 0) doc.addPage();
        drawHeader(p + 1, totalPages);

        // Crop from source image for this page
        const srcY = (p * usableH) / ratio;
        const srcH = Math.min(usableH / ratio, imgH - srcY);
        if (srcH <= 0) break;

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = imgW;
        pageCanvas.height = Math.ceil(srcH);
        const ctx = pageCanvas.getContext("2d");
        ctx.drawImage(img, 0, srcY, imgW, srcH, 0, 0, imgW, srcH);

        const pageImg = pageCanvas.toDataURL("image/png");
        const destH = srcH * ratio;
        doc.addImage(pageImg, "PNG", margin, headerH + 4, usableW, destH);
      }

      doc.save(
        `WBS_Albero_${progetto.titolo.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
      );
    } catch (err) {
      console.error("Errore export PDF albero:", err);
      alert("Errore durante la generazione del PDF. Riprova.");
    } finally {
      setExporting(false);
    }
  };

  /* ── Pan (drag-to-scroll) ── */
  const handleMouseDown = (e) => {
    if (e.target.closest(".wbs-node-card")) return;
    e.preventDefault();
    setIsPanning(true);
    panRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      scrollX: containerRef.current.scrollLeft,
      scrollY: containerRef.current.scrollTop,
    };
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    e.preventDefault();
    const { startX, startY, scrollX, scrollY } = panRef.current;
    containerRef.current.scrollLeft = scrollX - (e.clientX - startX);
    containerRef.current.scrollTop = scrollY - (e.clientY - startY);
  };

  const handleMouseUp = () => setIsPanning(false);

  const rootCode = `${progettoIndex + 1}`;

  /* ── Recursive node renderer ── */
  function renderNodo(nodo, index, siblings, parentCode, depth = 1) {
    const code = `${parentCode}.${index + 1}`;
    const isFirst = index === 0;
    const isLast = index === (siblings ? siblings.length - 1 : 0);

    return (
      <TreeNode
        key={nodo.id}
        wbsCode={code}
        titolo={nodo.titolo}
        nodo={nodo}
        onEdit={onAggiornaNodo ? handleEdit : undefined}
        onAdd={onAggiungiNodo ? handleAdd : undefined}
        onDelete={onEliminaNodo ? handleDelete : undefined}
        onMoveUp={onSpostaNodo ? handleMoveUp : undefined}
        onMoveDown={onSpostaNodo ? handleMoveDown : undefined}
        onPromuovi={onPromuoviNodo ? handlePromuovi : undefined}
        onDeclassa={onDeclassaNodo ? handleDeclassa : undefined}
        isFirst={isFirst}
        isLast={isLast}
      >
        {(nodo.children || []).map((child, ci) =>
          renderNodo(child, ci, nodo.children, code, depth + 1),
        )}
      </TreeNode>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">
      {/* ── Header bar ── */}
      <div className="shrink-0 px-6 py-3 bg-white border-b-2 border-black flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-sky-300 border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000]">
          <span className="text-black font-extrabold text-sm">WB</span>
        </div>
        <div className="flex-1">
          <h1 className="text-black font-extrabold text-lg">Diagramma WBS</h1>
          <p className="text-gray-600 text-xs font-semibold">
            Work Breakdown Structure | Hover sui nodi per modificare
          </p>
        </div>

        {/* Undo button */}
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed border-2 border-black rounded-xl text-black text-sm font-bold transition-all cursor-pointer shadow-[3px_3px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
          title="Annulla ultima azione (Undo)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 14l-4-4m0 0l4-4m-4 4h11a4 4 0 010 8h-1" />
          </svg>
          Annulla
        </button>
        <select
          value={formatoPDF}
          onChange={(e) => setFormatoPDF(e.target.value)}
          className="h-9 px-2 bg-white border-2 border-black rounded-xl text-xs text-black font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
          title="Formato carta PDF"
        >
          <option value="a4">A4</option>
          <option value="a3">A3</option>
        </select>
        <button
          onClick={handleExportTreePDF}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 bg-rose-300 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-50 disabled:cursor-wait border-2 border-black rounded-xl text-black text-sm font-bold transition-all cursor-pointer shadow-[3px_3px_0px_#000]"
          title="Esporta l'albero WBS come PDF visuale"
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
          {exporting ? "Generazione..." : "Stampa PDF"}
        </button>
      </div>

      <p className="shrink-0 text-center text-gray-700 text-[11px] py-2 bg-white border-b-2 border-black font-bold">
        Trascina lo sfondo per navigare · Hover su un nodo per modificare · ＋ aggiunge fasi figlie · 🗑 elimina
      </p>

      {/* ── Pannable / scrollable tree canvas ── */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-auto p-12 select-none ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          ref={treeRef}
          className="inline-flex justify-center min-w-full pb-16"
        >
          {/* Root = Project */}
          <TreeNode
            wbsCode={rootCode}
            titolo={progetto.titolo}
            nodo={progetto}
            isRoot
            onAdd={onAggiungiNodo ? handleAdd : undefined}
            onEdit={onAggiornaNodo ? handleEdit : undefined}
          >
            {(progetto.children || []).map((nodo, i) =>
              renderNodo(nodo, i, progetto.children, rootCode),
            )}
          </TreeNode>
        </div>
      </div>

      {/* TaskModal */}
      {modal && (
        <TaskModal
          task={modal.node}
          onSave={handleNodeSave}
          onDelete={modal.node ? handleNodeDelete : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
