import { useState } from "react";
import { derivaStato, STATO_BADGE, STATO_LABEL } from "../utils/treeHelpers";

/* ─── Input con label ─── */
const inputCls =
  "w-full bg-white border-2 border-black rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm text-black font-medium";
const labelCls = "block mb-1 text-xs font-bold text-black uppercase";

export default function TaskModal({ task, onSave, onDelete, onClose }) {
  const isEdit = !!task?.id;

  const buildForm = (t) => ({
    titolo: t?.titolo || "",
    responsabile: t?.responsabile || "",
    dataScadenza: t?.dataScadenza || "",
    stato: t?.stato || "todo",
    percentuale: t?.percentuale || 0,
    priorita: t?.priorita || "media",
    costoTotale: t?.costoTotale ?? "",
    costoReale: t?.costoReale ?? "",
    dataInizio: t?.dataInizio || "",
    note: t?.note || "",
    noteGrid: t?.noteGrid
      ? JSON.parse(JSON.stringify(t.noteGrid))
      : [
          { desc: "", add: "", sub: "", mul: "", div: "" },
          { desc: "", add: "", sub: "", mul: "", div: "" },
          { desc: "", add: "", sub: "", mul: "", div: "" },
        ],
  });

  const [form, setForm] = useState(() => buildForm(task));
  const [prevTask, setPrevTask] = useState(task);
  const [errore, setErrore] = useState("");
  const [tab, setTab] = useState("generale"); // 'generale' | 'materiali' | 'note'

  // React-recommended pattern: adjust state when props change
  if (task !== prevTask) {
    setPrevTask(task);
    if (task) setForm(buildForm(task));
  }

  const handleChange = (campo, valore) => {
    setForm((prev) => ({ ...prev, [campo]: valore }));
    if (campo === "titolo" && valore.trim()) setErrore("");
  };

  /* ── Grid helpers ── */
  const gridChange = (rowIdx, col, val) => {
    setForm((prev) => {
      const grid = prev.noteGrid.map((r, i) =>
        i === rowIdx ? { ...r, [col]: val } : r
      );
      return { ...prev, noteGrid: grid };
    });
  };
  const gridAddRow = () => {
    setForm((prev) => ({
      ...prev,
      noteGrid: [...prev.noteGrid, { desc: "", add: "", sub: "", mul: "", div: "" }],
    }));
  };
  const gridRemoveRow = (idx) => {
    setForm((prev) => ({
      ...prev,
      noteGrid: prev.noteGrid.filter((_, i) => i !== idx),
    }));
  };

  /* ── Grid totals ── */
  const gridTotals = (() => {
    const g = form.noteGrid;
    const nums = (col) => g.map((r) => parseFloat(r[col])).filter((v) => !isNaN(v));
    const addVals = nums("add");
    const subVals = nums("sub");
    const mulVals = nums("mul");
    const divVals = nums("div").filter((v) => v !== 0);
    return {
      add: addVals.length ? addVals.reduce((a, b) => a + b, 0) : null,
      sub: subVals.length ? subVals.reduce((a, b, i) => (i === 0 ? b : a - b)) : null,
      mul: mulVals.length ? mulVals.reduce((a, b) => a * b, 1) : null,
      div: divVals.length ? divVals.reduce((a, b, i) => (i === 0 ? b : a / b)) : null,
    };
  })();

  const handleSave = () => {
    if (!form.titolo.trim()) {
      setErrore("Il titolo è obbligatorio");
      setTab("generale");
      return;
    }
    const perc = Math.max(0, Math.min(100, Number(form.percentuale) || 0));
    onSave({
      ...form,
      percentuale: perc,
      stato: derivaStato(perc),
      costoTotale:
        form.costoTotale !== "" ? parseFloat(form.costoTotale) || 0 : "",
      costoReale:
        form.costoReale !== "" ? parseFloat(form.costoReale) || 0 : "",
    });
  };

  const tabCls = (t) =>
    `px-3 py-1.5 text-xs font-bold rounded-t-xl cursor-pointer transition-all ${
      tab === t
        ? "bg-amber-400 text-black border-2 border-black border-b-0 -mb-[2px] shadow-[2px_-2px_0px_#000]"
        : "text-gray-500 hover:text-black border-2 border-transparent"
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-white border-3 border-black rounded-2xl shadow-[8px_8px_0px_#000] w-full max-w-xl mx-4 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="px-5 pt-5 pb-3 border-b-2 border-black">
          <h2 className="text-lg font-extrabold text-black">
            {isEdit ? "✏️ Modifica Elemento" : "➕ Nuovo Elemento"}
          </h2>
          <p className="text-[11px] text-gray-600 font-semibold mt-0.5">
            Compila le informazioni per questa voce della WBS
          </p>
        </div>

        {/* ── Tabs ── */}
        <div className="shrink-0 bg-gray-50 px-5 flex gap-1 pt-2 border-b-2 border-black">
          <button
            className={tabCls("generale")}
            onClick={() => setTab("generale")}
          >
            📋 Generale
          </button>
          <button
            className={tabCls("materiali")}
            onClick={() => setTab("materiali")}
          >
            � Costi
          </button>
          <button className={tabCls("note")} onClick={() => setTab("note")}>
            📝 Note
          </button>
        </div>

        {/* ── Body (scrollabile) ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* ═══ TAB GENERALE ═══ */}
          {tab === "generale" && (
            <>
              {/* Titolo */}
              <div>
                <label className={labelCls}>
                  Titolo <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.titolo}
                  onChange={(e) => handleChange("titolo", e.target.value)}
                  className={inputCls}
                  placeholder="Es: Demolizione pareti interne"
                  autoFocus
                />
                {errore && (
                  <p className="text-red-400 text-xs mt-1">{errore}</p>
                )}
              </div>

              {/* Stakeholder */}
              <div>
                <label className={labelCls}>Stakeholder</label>
                <input
                  type="text"
                  value={form.responsabile}
                  onChange={(e) => handleChange("responsabile", e.target.value)}
                  className={inputCls}
                  placeholder="Nome e cognome"
                />
              </div>

              {/* Riga: Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Data Inizio</label>
                  <input
                    type="date"
                    value={form.dataInizio}
                    onChange={(e) => handleChange("dataInizio", e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Data Scadenza</label>
                  <input
                    type="date"
                    value={form.dataScadenza}
                    onChange={(e) =>
                      handleChange("dataScadenza", e.target.value)
                    }
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Avanzamento % — stato derivato automaticamente */}
              <div>
                <label className={labelCls}>Avanzamento %</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={form.percentuale}
                    onChange={(e) =>
                      handleChange("percentuale", Number(e.target.value))
                    }
                    className="flex-1 h-2.5 accent-amber-400"
                  />
                  <span className="text-black text-sm font-extrabold w-12 text-right">
                    {form.percentuale}%
                  </span>
                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold whitespace-nowrap ${STATO_BADGE[derivaStato(form.percentuale)]}`}
                  >
                    {STATO_LABEL[derivaStato(form.percentuale)]}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* ═══ TAB COSTI ═══ */}
          {tab === "materiali" && (
            <>
              {/* Costo Preventivato */}
              <div>
                <label className={labelCls}>Costo Preventivato (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.costoTotale}
                  onChange={(e) => handleChange("costoTotale", e.target.value)}
                  className={inputCls}
                  placeholder="Es: 15000.00"
                />
              </div>

              {/* Costo Reale */}
              <div>
                <label className={labelCls}>Costo Reale / Speso (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.costoReale}
                  onChange={(e) => handleChange("costoReale", e.target.value)}
                  className={inputCls}
                  placeholder="Es: 14500.00"
                />
              </div>

              {/* Scostamento (calcolato) */}
              {form.costoTotale !== "" && form.costoReale !== "" && (
                <div
                  className={`flex items-center justify-between rounded-xl px-4 py-3 border-2 border-black ${
                    (parseFloat(form.costoReale) || 0) > (parseFloat(form.costoTotale) || 0)
                      ? "bg-rose-200"
                      : "bg-lime-200"
                  }`}
                >
                  <span className="text-xs font-bold text-black">Scostamento:</span>
                  <span className="text-sm font-extrabold text-black">
                    {(parseFloat(form.costoReale) || 0) > (parseFloat(form.costoTotale) || 0) ? "+" : ""}
                    €{" "}
                    {((parseFloat(form.costoReale) || 0) - (parseFloat(form.costoTotale) || 0)).toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </>
          )}

          {/* ═══ TAB NOTE ═══ */}
          {tab === "note" && (
            <>
              {/* Mini spreadsheet */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100 border-2 border-black">
                      <th className="text-left px-2 py-1.5 font-bold text-black border-r-2 border-black w-[35%]">Descrizione</th>
                      <th className="px-2 py-1.5 font-bold text-green-700 border-r border-black w-[14%] text-center">➕ Somma</th>
                      <th className="px-2 py-1.5 font-bold text-red-600 border-r border-black w-[14%] text-center">➖ Diff.</th>
                      <th className="px-2 py-1.5 font-bold text-blue-700 border-r border-black w-[14%] text-center">✖️ Prodotto</th>
                      <th className="px-2 py-1.5 font-bold text-amber-700 border-r border-black w-[14%] text-center">➗ Quoz.</th>
                      <th className="w-[9%]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.noteGrid.map((row, i) => (
                      <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="border-r-2 border-black p-0.5">
                          <input
                            type="text"
                            value={row.desc}
                            onChange={(e) => gridChange(i, "desc", e.target.value)}
                            className="w-full px-2 py-1 text-xs bg-transparent focus:outline-none focus:bg-amber-50 rounded"
                            placeholder={`Voce ${i + 1}`}
                          />
                        </td>
                        {["add", "sub", "mul", "div"].map((col) => (
                          <td key={col} className="border-r border-gray-200 p-0.5 text-center">
                            <input
                              type="number"
                              value={row[col]}
                              onChange={(e) => gridChange(i, col, e.target.value)}
                              className="w-full px-1 py-1 text-xs text-center bg-transparent focus:outline-none focus:bg-amber-50 rounded"
                              placeholder="—"
                            />
                          </td>
                        ))}
                        <td className="text-center p-0.5">
                          <button
                            onClick={() => gridRemoveRow(i)}
                            className="w-5 h-5 flex items-center justify-center mx-auto rounded bg-gray-200 hover:bg-red-200 text-gray-500 hover:text-red-700 font-bold text-xs cursor-pointer transition-colors"
                            title="Rimuovi riga"
                          >×</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-black bg-gray-100 font-extrabold">
                      <td className="px-2 py-1.5 text-xs font-extrabold text-black border-r-2 border-black">TOTALE</td>
                      {[
                        { key: "add", color: "text-green-700" },
                        { key: "sub", color: "text-red-600" },
                        { key: "mul", color: "text-blue-700" },
                        { key: "div", color: "text-amber-700" },
                      ].map(({ key, color }) => (
                        <td key={key} className={`px-2 py-1.5 text-xs text-center border-r border-gray-300 ${color}`}>
                          {gridTotals[key] !== null
                            ? Number(gridTotals[key].toFixed(4)).toLocaleString("it-IT")
                            : "—"}
                        </td>
                      ))}
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>

              <button
                onClick={gridAddRow}
                className="w-full py-1.5 text-xs font-bold text-black bg-amber-100 hover:bg-amber-200 border-2 border-dashed border-amber-600 rounded-xl cursor-pointer transition-colors"
              >
                + Aggiungi riga
              </button>

              {/* Free text note */}
              <div>
                <label className={labelCls}>Appunti liberi</label>
                <textarea
                  value={form.note}
                  onChange={(e) => handleChange("note", e.target.value)}
                  className={`${inputCls} min-h-[80px] resize-y`}
                  placeholder="Appunti, promemoria, riferimenti..."
                />
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 px-5 py-3 border-t-2 border-black flex items-center justify-between bg-gray-100 rounded-b-2xl">
          <div>
            {isEdit && (
              <button
                onClick={onDelete}
                className="text-sm text-black font-bold bg-rose-300 px-3 py-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none cursor-pointer transition-all"
              >
                🗑 Elimina
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-xl bg-white text-black font-bold border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000] cursor-pointer transition-all"
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-sm rounded-xl bg-amber-400 text-black font-extrabold border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000] cursor-pointer transition-all"
            >
              💾 Salva
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
