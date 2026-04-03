import { useState, useCallback } from "react";
import ProgressBar from "./ProgressBar";
import TaskModal from "./TaskModal";
import { esportaExcel, esportaPDF } from "../utils/exportWBS";
import { calcolaStatoNodo, derivaStato, contaDiscendenti, STATO_BADGE as badgeClassi, STATO_LABEL as badgeLabels } from "../utils/treeHelpers";

/* ── Riga del nodo nell'albero verticale ── */
function TreeRow({ nodo, depth, onEdit, onAdd, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [expanded, setExpanded] = useState(depth < 2);

  const isLeaf = !nodo.children || nodo.children.length === 0;
  const stato = isLeaf ? derivaStato(nodo.percentuale) : calcolaStatoNodo(nodo);
  const discendenti = contaDiscendenti(nodo);
  const hasChildren = nodo.children && nodo.children.length > 0;

  const headerBg =
    stato === "done"
      ? "bg-lime-200"
      : stato === "in-progress"
        ? "bg-yellow-100"
        : "bg-white";

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-3 py-2 ${headerBg} border-2 border-black rounded-xl mb-1 group hover:shadow-[3px_3px_0px_#000] transition-all`}
        style={{ marginLeft: depth * 24 }}
      >
        {/* Expand/Collapse */}
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-6 h-6 flex items-center justify-center rounded-lg border-2 border-black bg-white text-black font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer shrink-0"
          >
            {expanded ? "−" : "+"}
          </button>
        ) : (
          <span className="w-6 h-6 flex items-center justify-center text-gray-400 shrink-0">•</span>
        )}

        {/* Status icon */}
        <span className="text-sm shrink-0">
          {stato === "done" ? "✅" : stato === "in-progress" ? "🔄" : "⬜"}
        </span>

        {/* Title */}
        <span className={`flex-1 text-sm truncate ${isLeaf ? "font-bold" : "font-extrabold"} text-black`}>
          {nodo.titolo}
        </span>

        {/* Costi inline */}
        {(Number(nodo.costoTotale) > 0 || Number(nodo.costoReale) > 0) && (
          <div className="flex items-center gap-1.5 shrink-0">
            {nodo.costoTotale > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-white border-2 border-black font-bold text-black">
                📋 €{Number(nodo.costoTotale).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
            {nodo.costoReale > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-lg border-2 border-black font-bold ${nodo.costoTotale > 0 && nodo.costoReale > nodo.costoTotale ? "bg-rose-300 text-black" : "bg-lime-200 text-black"}`}>
                🧾 €{Number(nodo.costoReale).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
          </div>
        )}

        {/* Descendant count for non-leaves */}
        {!isLeaf && (
          <span className="text-[10px] text-gray-600 font-bold shrink-0">
            {discendenti} elem.
          </span>
        )}

        {/* Progress mini */}
        <div className="w-20 shrink-0 hidden sm:block">
          <ProgressBar percentuale={nodo.percentuale || 0} altezza="h-1.5" />
        </div>
        <span className="text-[11px] font-bold text-black min-w-[32px] text-right shrink-0">
          {nodo.percentuale || 0}%
        </span>

        {/* Status badge */}
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${badgeClassi[stato]}`}>
          {badgeLabels[stato]}
        </span>

        {/* Action buttons — visible on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(nodo)}
            className="text-[10px] px-2 py-1 rounded-lg bg-sky-300 border-2 border-black text-black font-bold hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
            title="Modifica scheda"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(nodo.id)}
            className="text-[10px] px-2 py-1 rounded-lg bg-red-600 border-2 border-black text-black font-bold hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
            title="Elimina"
          >
            🗑
          </button>
        </div>
      </div>

      {/* Children ricorsivi */}
      {expanded && hasChildren && nodo.children.map((child, i) => (
        <TreeRow
          key={child.id}
          nodo={child}
          depth={depth + 1}
          onEdit={onEdit}
          onAdd={onAdd}
          onDelete={onDelete}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          isFirst={i === 0}
          isLast={i === nodo.children.length - 1}
        />
      ))}
    </div>
  );
}

/* ── Totali costi ricorsivi ── */
function sommaCosti(nodo) {
  const isLeaf = !nodo.children || nodo.children.length === 0;
  if (isLeaf) {
    return {
      preventivato: Number(nodo.costoTotale) || 0,
      reale: Number(nodo.costoReale) || 0,
    };
  }
  return nodo.children.reduce(
    (acc, child) => {
      const c = sommaCosti(child);
      return { preventivato: acc.preventivato + c.preventivato, reale: acc.reale + c.reale };
    },
    { preventivato: 0, reale: 0 },
  );
}

function fmt(n) {
  return n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Dashboard({
  progetto,
  onAggiungiNodo,
  onEliminaNodo,
  onAggiornaNodo,
  onSpostaNodo,
}) {
  const [formatoPDF, setFormatoPDF] = useState("a4");
  const [modal, setModal] = useState(null); // { node } for editing, { parentId } for new
  const children = progetto.children || [];

  const costiTotali = children.reduce(
    (acc, child) => {
      const c = sommaCosti(child);
      return { preventivato: acc.preventivato + c.preventivato, reale: acc.reale + c.reale };
    },
    { preventivato: 0, reale: 0 },
  );
  const scostamento = costiTotali.reale - costiTotali.preventivato;
  const hasCosti = costiTotali.preventivato > 0 || costiTotali.reale > 0;

  /* ── Callbacks ── */
  const handleEdit = useCallback((nodo) => {
    setModal({ node: nodo });
  }, []);

  const handleAdd = useCallback((parentId) => {
    setModal({ parentId, node: null });
  }, []);

  const handleDelete = useCallback((nodeId) => {
    onEliminaNodo(progetto.id, nodeId);
  }, [progetto.id, onEliminaNodo]);

  const handleMoveUp = useCallback((nodeId) => {
    onSpostaNodo(progetto.id, nodeId, -1);
  }, [progetto.id, onSpostaNodo]);

  const handleMoveDown = useCallback((nodeId) => {
    onSpostaNodo(progetto.id, nodeId, 1);
  }, [progetto.id, onSpostaNodo]);

  const handleNodeSave = useCallback((nodeData) => {
    if (modal.node) {
      onAggiornaNodo(progetto.id, modal.node.id, nodeData);
    } else {
      onAggiungiNodo(progetto.id, modal.parentId, nodeData);
    }
    setModal(null);
  }, [modal, progetto.id, onAggiornaNodo, onAggiungiNodo]);

  const handleNodeDelete = useCallback(() => {
    if (modal?.node) {
      onEliminaNodo(progetto.id, modal.node.id);
    }
    setModal(null);
  }, [modal, progetto.id, onEliminaNodo]);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b-2 border-black px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">📊</span>
              <h1 className="text-xl font-extrabold text-black">
                {progetto.titolo}
              </h1>
            </div>
            <p className="text-sm text-gray-600 ml-10 font-semibold">Pagina di pilotaggio</p>
          </div>

          {/* Totali costi */}
          {hasCosti && (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center px-4 py-2 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000]">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">📋 Preventivato</span>
                <span className="text-base font-extrabold text-black">€ {fmt(costiTotali.preventivato)}</span>
              </div>
              <div className="flex flex-col items-center px-4 py-2 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000]">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">🧾 Reale</span>
                <span className="text-base font-extrabold text-black">€ {fmt(costiTotali.reale)}</span>
              </div>
              {costiTotali.preventivato > 0 && costiTotali.reale > 0 && (
                <div className={`flex flex-col items-center px-4 py-2 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] ${scostamento > 0 ? "bg-rose-300" : "bg-lime-300"}`}>
                  <span className="text-[10px] font-bold text-black uppercase tracking-wide">📊 Scostamento</span>
                  <span className="text-base font-extrabold text-black">{scostamento > 0 ? "+" : ""}€ {fmt(scostamento)}</span>
                </div>
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => esportaExcel(progetto)}
              className="flex items-center gap-1.5 px-4 py-2 bg-lime-300 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none border-2 border-black text-black rounded-xl text-xs font-bold transition-all cursor-pointer shadow-[3px_3px_0px_#000]"
              title="Esporta in Excel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel
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
              onClick={() => esportaPDF(progetto, formatoPDF)}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-300 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none border-2 border-black text-black rounded-xl text-xs font-bold transition-all cursor-pointer shadow-[3px_3px_0px_#000]"
              title="Esporta in PDF"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              PDF
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Progress globale */}
        <div className="bg-white rounded-xl border-2 border-black p-5 shadow-[4px_4px_0px_#000]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-black">
              Avanzamento Globale
            </h2>
            <span className="text-2xl font-extrabold text-black">
              {progetto.percentuale}%
            </span>
          </div>
          <ProgressBar percentuale={progetto.percentuale} altezza="h-5" />
        </div>

        {/* ── Struttura progetto (albero verticale editabile) ── */}
        <div className="bg-white rounded-xl border-2 border-black p-5 shadow-[4px_4px_0px_#000]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-black">
              Struttura Progetto
            </h2>
            <button
              onClick={() => handleAdd(progetto.id)}
              className="text-[11px] px-3 py-1.5 rounded-xl bg-amber-400 border-2 border-black text-black font-bold hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none shadow-[2px_2px_0px_#000] transition-all cursor-pointer"
            >
              ＋ Aggiungi nodo
            </button>
          </div>

          {children.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg mb-2 font-bold text-black">Nessun elemento presente</p>
              <p className="text-sm font-semibold text-gray-600 mb-4">
                Clicca "Aggiungi nodo" per iniziare a costruire la struttura
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {children.map((nodo, i) => (
                <TreeRow
                  key={nodo.id}
                  nodo={nodo}
                  depth={0}
                  onEdit={handleEdit}
                  onAdd={handleAdd}
                  onDelete={handleDelete}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  isFirst={i === 0}
                  isLast={i === children.length - 1}
                />
              ))}
            </div>
          )}
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-6 text-xs text-gray-700 justify-center pb-4 font-bold">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-lg bg-rose-400 border-2 border-black" />
            <span>Da fare</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-lg bg-yellow-400 border-2 border-black" />
            <span>In corso</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-lg bg-lime-400 border-2 border-black" />
            <span>Completato</span>
          </div>
          <span className="text-gray-400 ml-2">|</span>
          <span className="text-gray-500">Passa il mouse su un nodo per le azioni</span>
        </div>
      </div>

      {/* TaskModal */}
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
