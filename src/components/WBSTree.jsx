import { useState, useRef, Children } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import TaskModal from "./TaskModal";

/* ─── Priority colors ─── */
const PRIORITA_COLORI = {
  urgente: "bg-red-500/20 text-red-400 border-red-500/40",
  alta: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  media: "bg-amber-500/10 text-amber-400/50 border-amber-500/20",
  bassa: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

/* ─── Semaforo: stato ricorsivo del nodo ─── */
const STATO_BORDER = {
  todo: "border-red-300 shadow-red-100 hover:border-red-400",
  "in-progress": "border-yellow-300 shadow-yellow-100 hover:border-yellow-400",
  done: "border-green-300 shadow-green-100 hover:border-green-400",
};
const STATO_BADGE = {
  todo: "bg-red-100 text-red-600 border-red-200",
  "in-progress": "bg-yellow-100 text-yellow-700 border-yellow-200",
  done: "bg-green-100 text-green-600 border-green-200",
};
const STATO_LABEL = {
  todo: "Da fare",
  "in-progress": "In corso",
  done: "Completato",
};

function calcolaStatoNodo(nodo) {
  if (!nodo.children || nodo.children.length === 0) return nodo.stato || "todo";
  const foglie = raccogliFoglie(nodo);
  if (foglie.every((f) => f.stato === "done")) return "done";
  if (foglie.some((f) => f.stato === "in-progress" || f.stato === "done"))
    return "in-progress";
  return "todo";
}
function raccogliFoglie(nodo) {
  if (!nodo.children || nodo.children.length === 0) return [nodo];
  return nodo.children.flatMap(raccogliFoglie);
}

/* ─── Recursive Tree Node ─── */
function TreeNode({
  wbsCode,
  titolo,
  nodo,
  onAdd,
  onEdit,
  onDelete,
  onRename,
  onMoveUp,
  onMoveDown,
  onMoveLeft,
  onMoveRight,
  onPromote,
  onDemote,
  children: childElements,
}) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [titleTemp, setTitleTemp] = useState(titolo);

  const childArray = Children.toArray(childElements);
  const hasChildren = childArray.length > 0;
  const statoNodo = nodo ? calcolaStatoNodo(nodo) : "todo";

  const handleSave = () => {
    if (titleTemp.trim() && onRename) {
      onRename(titleTemp.trim());
    } else {
      setTitleTemp(titolo);
    }
    setEditing(false);
  };

  return (
    <div className="flex flex-col items-center">
      {/* ── Node Card ── */}
      <div
        className={`wbs-node-card relative border-2 rounded-lg px-5 py-3 min-w-[170px] max-w-[240px] bg-white text-center shadow-md transition-all select-none ${STATO_BORDER[statoNodo] || STATO_BORDER["todo"]}`}
      >
        <div className="text-amber-600 font-bold text-sm">{wbsCode}</div>

        {editing ? (
          <input
            value={titleTemp}
            onChange={(e) => setTitleTemp(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") {
                setTitleTemp(titolo);
                setEditing(false);
              }
            }}
            className="w-full bg-gray-100 border border-gray-300 rounded px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-400 text-center mt-1"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div
            className="text-gray-600 text-xs font-medium mt-1 leading-relaxed"
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (onRename) {
                setTitleTemp(titolo);
                setEditing(true);
              }
            }}
            title={onRename ? "Doppio click per rinominare" : ""}
          >
            {titolo}
          </div>
        )}

        {/* Status badge (semaforo) */}
        {nodo && (
          <div className="flex justify-center mt-1.5">
            <span
              className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold ${STATO_BADGE[statoNodo] || STATO_BADGE["todo"]}`}
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
            {nodo.priorita && nodo.priorita !== "media" && (
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded-full border ${PRIORITA_COLORI[nodo.priorita] || ""}`}
              >
                {nodo.priorita === "urgente"
                  ? "🔴"
                  : nodo.priorita === "alta"
                    ? "🟠"
                    : "🟢"}{" "}
                {nodo.priorita}
              </span>
            )}
            {nodo.materiali && nodo.materiali.length > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full border bg-blue-50 text-blue-600 border-blue-200">
                📦 {nodo.materiali.length}
              </span>
            )}
            {nodo.costoTotale !== "" &&
              nodo.costoTotale !== undefined &&
              nodo.costoTotale > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-600 border-emerald-200">
                  💰 €{Number(nodo.costoTotale).toLocaleString("it-IT")}
                </span>
              )}
            {nodo.note && (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full border bg-violet-50 text-violet-600 border-violet-200"
                title={nodo.note}
              >
                📝
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center items-center gap-1.5 mt-2.5">
          {onAdd && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
              className="text-[10px] px-2.5 py-1 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-full text-amber-700 font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              + Figlio
            </button>
          )}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="w-7 h-7 flex items-center justify-center bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-full text-amber-600 transition-colors cursor-pointer"
              title="Modifica"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          )}
          {!onEdit && onRename && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setTitleTemp(titolo);
                setEditing(true);
              }}
              className="w-7 h-7 flex items-center justify-center bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-full text-amber-600 transition-colors cursor-pointer"
              title="Rinomina"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="w-7 h-7 flex items-center justify-center bg-red-50 hover:bg-red-100 border border-red-200 rounded-full text-red-500 transition-colors cursor-pointer"
              title="Elimina"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Move Buttons — reorder among siblings */}
        {(onMoveUp || onMoveDown || onMoveLeft || onMoveRight) && (
          <div className="flex justify-center items-center gap-1 mt-1.5">
            {onMoveLeft && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveLeft();
                }}
                className="w-6 h-6 flex items-center justify-center bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-full text-sky-600 transition-colors cursor-pointer"
                title="Sposta a sinistra (tra fratelli)"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            {onMoveUp && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveUp();
                }}
                className="w-6 h-6 flex items-center justify-center bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-full text-sky-600 transition-colors cursor-pointer"
                title="Sposta su (tra fratelli)"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>
            )}
            {onMoveDown && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveDown();
                }}
                className="w-6 h-6 flex items-center justify-center bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-full text-sky-600 transition-colors cursor-pointer"
                title="Sposta giù (tra fratelli)"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            )}
            {onMoveRight && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveRight();
                }}
                className="w-6 h-6 flex items-center justify-center bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-full text-sky-600 transition-colors cursor-pointer"
                title="Sposta a destra (tra fratelli)"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Promote / Demote — change hierarchy level */}
        {(onPromote || onDemote) && (
          <div className="flex justify-center items-center gap-1 mt-1">
            {onPromote && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPromote();
                }}
                className="h-5 flex items-center gap-0.5 px-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-full text-emerald-600 transition-colors cursor-pointer"
                title="Promuovi (sali di livello)"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
                <span className="text-[8px] font-bold">LIV</span>
              </button>
            )}
            {onDemote && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDemote();
                }}
                className="h-5 flex items-center gap-0.5 px-1.5 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-full text-violet-600 transition-colors cursor-pointer"
                title="Declassa (scendi di livello)"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                <span className="text-[8px] font-bold">LIV</span>
              </button>
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
            className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-amber-300 flex items-center justify-center text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer z-10"
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
          <div className="w-px h-10 bg-amber-300" />

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
export default function WBSTree({
  progetto,
  progettoIndex,
  onRinominaProgetto,
  onAggiungiNodo,
  onEliminaNodo,
  onRinominaNodo,
  onAggiornaNodo,
  onSpostaNodo,
  onSpostaNodoLaterale,
  onPromuoviNodo,
  onDeclassaNodo,
}) {
  const [modal, setModal] = useState(null);
  const containerRef = useRef(null);
  const treeRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [formatoPDF, setFormatoPDF] = useState("a4");
  const panRef = useRef({ startX: 0, startY: 0, scrollX: 0, scrollY: 0 });

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
        let borderColor = "#92400e"; // fallback amber
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

  /* ── Node modal callbacks ── */
  const handleNodeSave = (nodeData) => {
    if (modal.node) {
      // Editing existing node
      onAggiornaNodo(progetto.id, modal.node.id, nodeData);
    } else {
      // Adding new child to parentId
      onAggiungiNodo(progetto.id, modal.parentId, nodeData);
    }
    setModal(null);
  };

  const handleNodeDelete = () => {
    if (modal?.node) {
      onEliminaNodo(progetto.id, modal.node.id);
    }
    setModal(null);
  };

  const rootCode = `${progettoIndex + 1}`;

  /* ── Recursive node renderer ── */
  function renderNodo(nodo, index, siblings, parentCode, depth = 1) {
    const code = `${parentCode}.${index + 1}`;
    const hasSiblings = siblings.length > 1;
    const isTopLevel = depth === 1; // direct child of root

    return (
      <TreeNode
        key={nodo.id}
        wbsCode={code}
        titolo={nodo.titolo}
        nodo={nodo}
        onAdd={() => onAggiungiNodo(progetto.id, nodo.id, {})}
        onEdit={() => setModal({ parentId: null, node: nodo })}
        onRename={(t) => onRinominaNodo(progetto.id, nodo.id, t)}
        onDelete={() => onEliminaNodo(progetto.id, nodo.id)}
        onMoveUp={
          index > 0 ? () => onSpostaNodo(progetto.id, nodo.id, -1) : null
        }
        onMoveDown={
          index < siblings.length - 1
            ? () => onSpostaNodo(progetto.id, nodo.id, 1)
            : null
        }
        onMoveLeft={
          hasSiblings && index > 0
            ? () => onSpostaNodoLaterale(progetto.id, nodo.id, -1)
            : null
        }
        onMoveRight={
          hasSiblings && index < siblings.length - 1
            ? () => onSpostaNodoLaterale(progetto.id, nodo.id, 1)
            : null
        }
        onPromote={
          !isTopLevel ? () => onPromuoviNodo(progetto.id, nodo.id) : null
        }
        onDemote={index > 0 ? () => onDeclassaNodo(progetto.id, nodo.id) : null}
      >
        {(nodo.children || []).map((child, ci) =>
          renderNodo(child, ci, nodo.children, code, depth + 1),
        )}
      </TreeNode>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      {/* ── Header bar ── */}
      <div className="shrink-0 px-6 py-3 bg-white border-b border-gray-300 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center shrink-0">
          <span className="text-amber-700 font-bold text-sm">WB</span>
        </div>
        <div className="flex-1">
          <h1 className="text-amber-600 font-bold text-lg">WBS Interattiva</h1>
          <p className="text-gray-400 text-xs">
            Work Breakdown Structure | Gerarchia libera a livelli infiniti
          </p>
        </div>
        <select
          value={formatoPDF}
          onChange={(e) => setFormatoPDF(e.target.value)}
          className="h-9 px-2 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-600 cursor-pointer focus:outline-none focus:ring-1 focus:ring-red-300"
          title="Formato carta PDF"
        >
          <option value="a4">A4</option>
          <option value="a3">A3</option>
        </select>
        <button
          onClick={handleExportTreePDF}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-wait border border-red-500 rounded-lg text-white text-sm font-semibold transition-colors cursor-pointer shadow-md"
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

      <p className="shrink-0 text-center text-gray-400 text-[11px] py-2 bg-gray-50 border-b border-gray-300">
        Trascina lo sfondo per navigare. Doppio click sui nomi per rinominare.
        Frecce azzurre = riordina tra fratelli. Frecce verdi/viola con LIV =
        cambia livello gerarchico.
      </p>

      {/* ── Legenda comandi ── */}
      <div className="shrink-0 bg-gray-100 border-b border-gray-300 px-6 py-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[10px]">
        <span className="text-gray-500 font-semibold mr-1">LEGENDA:</span>

        <span className="flex items-center gap-1">
          <span className="inline-block w-5 h-5 rounded-full bg-amber-100 border border-amber-300 text-amber-700 text-center leading-5 text-[9px] font-bold">
            +
          </span>
          <span className="text-gray-500">Aggiungi figlio</span>
        </span>

        <span className="flex items-center gap-1">
          <span className="inline-block w-5 h-5 rounded-full bg-amber-100 border border-amber-300 text-amber-600 text-center leading-5">
            ✏
          </span>
          <span className="text-gray-500">
            Modifica scheda (note, materiali, costi…)
          </span>
        </span>

        <span className="flex items-center gap-1">
          <span className="inline-block w-5 h-5 rounded-full bg-red-50 border border-red-200 text-red-500 text-center leading-5">
            🗑
          </span>
          <span className="text-gray-500">Elimina nodo</span>
        </span>

        <span className="flex items-center gap-1">
          <span className="inline-flex gap-0.5">
            <span className="inline-block w-4 h-4 rounded-full bg-sky-50 border border-sky-200 text-sky-600 text-center leading-4 text-[8px]">
              ↑
            </span>
            <span className="inline-block w-4 h-4 rounded-full bg-sky-50 border border-sky-200 text-sky-600 text-center leading-4 text-[8px]">
              ↓
            </span>
            <span className="inline-block w-4 h-4 rounded-full bg-sky-50 border border-sky-200 text-sky-600 text-center leading-4 text-[8px]">
              ←
            </span>
            <span className="inline-block w-4 h-4 rounded-full bg-sky-50 border border-sky-200 text-sky-600 text-center leading-4 text-[8px]">
              →
            </span>
          </span>
          <span className="text-gray-500">Riordina nello stesso livello</span>
        </span>

        <span className="flex items-center gap-1">
          <span className="inline-flex gap-0.5">
            <span className="inline-block h-4 px-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-center leading-4 text-[8px] font-bold">
              ↑LIV
            </span>
            <span className="inline-block h-4 px-1 rounded-full bg-violet-50 border border-violet-200 text-violet-600 text-center leading-4 text-[8px] font-bold">
              ↓LIV
            </span>
          </span>
          <span className="text-gray-500">
            Promuovi / Declassa livello gerarchico
          </span>
        </span>

        <span className="flex items-center gap-1">
          <span className="text-amber-600">Aa</span>
          <span className="text-gray-500">
            Doppio click sul nome → rinomina
          </span>
        </span>
      </div>

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
            onAdd={() => onAggiungiNodo(progetto.id, progetto.id, {})}
            onEdit={() => setModal({ parentId: null, node: progetto })}
            onRename={(t) => onRinominaProgetto(progetto.id, t)}
          >
            {(progetto.children || []).map((nodo, i) =>
              renderNodo(nodo, i, progetto.children, rootCode),
            )}
          </TreeNode>
        </div>
      </div>

      {/* ── Node Modal ── */}
      {modal && (
        <TaskModal
          task={modal.node}
          onSave={handleNodeSave}
          onDelete={handleNodeDelete}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
