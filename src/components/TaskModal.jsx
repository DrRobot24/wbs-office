import { useState } from "react";
import { derivaStato, STATO_BADGE, STATO_LABEL } from "../utils/treeHelpers";

/* ─── Componente riga materiale ─── */
function MaterialeRow({ mat, index, onChange, onRemove }) {
  return (
    <div className="flex items-start gap-2 bg-gray-100 rounded-xl p-2.5 border-2 border-black">
      <div className="flex-1 grid grid-cols-2 gap-2">
        <input
          type="text"
          value={mat.descrizione}
          onChange={(e) => onChange(index, "descrizione", e.target.value)}
          className="bg-white border-2 border-black rounded-xl px-2 py-1.5 text-xs text-black font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 col-span-2"
          placeholder="Materiale / Articolo"
        />
        <input
          type="text"
          value={mat.quantita}
          onChange={(e) => onChange(index, "quantita", e.target.value)}
          className="bg-white border-2 border-black rounded-xl px-2 py-1.5 text-xs text-black font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
          placeholder="Qtà (es: 50 mq)"
        />
        <input
          type="text"
          value={mat.fornitore}
          onChange={(e) => onChange(index, "fornitore", e.target.value)}
          className="bg-white border-2 border-black rounded-xl px-2 py-1.5 text-xs text-black font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
          placeholder="Fornitore"
        />
        <input
          type="number"
          step="0.01"
          value={mat.costo}
          onChange={(e) => onChange(index, "costo", e.target.value)}
          className="bg-white border-2 border-black rounded-xl px-2 py-1.5 text-xs text-black font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
          placeholder="Costo €"
        />
        <select
          value={mat.statoOrdine || "da-ordinare"}
          onChange={(e) => onChange(index, "statoOrdine", e.target.value)}
          className="bg-white border-2 border-black rounded-xl px-2 py-1.5 text-xs text-black font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="da-ordinare">Da ordinare</option>
          <option value="ordinato">Ordinato</option>
          <option value="in-consegna">In consegna</option>
          <option value="ricevuto">Ricevuto</option>
        </select>
      </div>
      <button
        onClick={() => onRemove(index)}
        className="mt-1 w-6 h-6 flex items-center justify-center rounded-full bg-rose-300 border-2 border-black text-black text-xs font-bold cursor-pointer shrink-0"
        title="Rimuovi"
      >
        ×
      </button>
    </div>
  );
}

/* ─── Riga fattura ─── */
function FatturaRow({ fat, index, onChange, onRemove }) {
  return (
    <div className="flex items-start gap-2 bg-lime-100 rounded-xl p-2.5 border-2 border-black">
      <div className="flex-1 grid grid-cols-2 gap-2">
        <input
          type="text"
          value={fat.numero}
          onChange={(e) => onChange(index, "numero", e.target.value)}
          className="bg-white border-2 border-black rounded-xl px-2 py-1.5 text-xs text-black font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
          placeholder="N° Fattura"
        />
        <input
          type="date"
          value={fat.data}
          onChange={(e) => onChange(index, "data", e.target.value)}
          className="bg-white border-2 border-black rounded-xl px-2 py-1.5 text-xs text-black font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <input
          type="text"
          value={fat.fornitore}
          onChange={(e) => onChange(index, "fornitore", e.target.value)}
          className="bg-white border-2 border-black rounded-xl px-2 py-1.5 text-xs text-black font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
          placeholder="Fornitore"
        />
        <input
          type="number"
          step="0.01"
          value={fat.importo}
          onChange={(e) => onChange(index, "importo", e.target.value)}
          className="bg-white border-2 border-black rounded-xl px-2 py-1.5 text-xs text-black font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
          placeholder="Importo €"
        />
        <input
          type="text"
          value={fat.descrizione}
          onChange={(e) => onChange(index, "descrizione", e.target.value)}
          className="bg-white border-2 border-black rounded-xl px-2 py-1.5 text-xs text-black font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 col-span-2"
          placeholder="Descrizione"
        />
      </div>
      <button
        onClick={() => onRemove(index)}
        className="mt-1 w-6 h-6 flex items-center justify-center rounded-full bg-rose-300 border-2 border-black text-black text-xs font-bold cursor-pointer shrink-0"
        title="Rimuovi"
      >
        ×
      </button>
    </div>
  );
}

/* ─── Sezione collassabile ─── */
function Sezione({ titolo, icona, children, defaultOpen = true }) {
  const [aperta, setAperta] = useState(defaultOpen);
  return (
    <div className="border-2 border-black rounded-xl overflow-hidden">
      <button
        onClick={() => setAperta(!aperta)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-black text-xs font-bold cursor-pointer transition-colors"
      >
        <span>{icona}</span>
        <span className="flex-1 text-left">{titolo}</span>
        <svg
          className={`w-3 h-3 transition-transform ${aperta ? "" : "-rotate-90"}`}
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
      {aperta && <div className="p-3 space-y-3">{children}</div>}
    </div>
  );
}

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
    materiali: t?.materiali
      ? JSON.parse(JSON.stringify(t.materiali))
      : [],
    fatture: t?.fatture
      ? JSON.parse(JSON.stringify(t.fatture))
      : [],
    note: t?.note || "",
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

  // ─── Gestione materiali ───
  const aggiungiMateriale = () => {
    setForm((prev) => ({
      ...prev,
      materiali: [
        ...prev.materiali,
        {
          descrizione: "",
          quantita: "",
          fornitore: "",
          costo: "",
          statoOrdine: "da-ordinare",
        },
      ],
    }));
  };

  const aggiornaMateriale = (index, campo, valore) => {
    setForm((prev) => ({
      ...prev,
      materiali: prev.materiali.map((m, i) =>
        i === index ? { ...m, [campo]: valore } : m,
      ),
    }));
  };

  const rimuoviMateriale = (index) => {
    setForm((prev) => ({
      ...prev,
      materiali: prev.materiali.filter((_, i) => i !== index),
    }));
  };

  // ─── Gestione fatture ───
  const aggiungiFattura = () => {
    setForm((prev) => ({
      ...prev,
      fatture: [
        ...prev.fatture,
        { numero: "", data: "", importo: "", fornitore: "", descrizione: "" },
      ],
    }));
  };

  const aggiornaFattura = (index, campo, valore) => {
    setForm((prev) => ({
      ...prev,
      fatture: prev.fatture.map((f, i) =>
        i === index ? { ...f, [campo]: valore } : f,
      ),
    }));
  };

  const rimuoviFattura = (index) => {
    setForm((prev) => ({
      ...prev,
      fatture: prev.fatture.filter((_, i) => i !== index),
    }));
  };

  // ─── Calcolo costo materiali ───
  const costoMateriali = form.materiali.reduce(
    (acc, m) => acc + (parseFloat(m.costo) || 0),
    0,
  );
  const costoFatture = form.fatture.reduce(
    (acc, f) => acc + (parseFloat(f.importo) || 0),
    0,
  );

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
        className="bg-white border-3 border-black rounded-2xl shadow-[8px_8px_0px_#000] w-full max-w-lg mx-4 flex flex-col max-h-[90vh]"
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
            📦 Materiali & Costi
            {form.materiali.length > 0 && (
              <span className="ml-1.5 bg-amber-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-black">
                {form.materiali.length}
              </span>
            )}
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

          {/* ═══ TAB MATERIALI & COSTI ═══ */}
          {tab === "materiali" && (
            <>
              {/* Costo Preventivato */}
              <Sezione
                titolo="Costo Preventivato"
                icona="📋"
                defaultOpen={true}
              >
                <div>
                  <label className={labelCls}>
                    Budget previsto per questa voce (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.costoTotale}
                    onChange={(e) =>
                      handleChange("costoTotale", e.target.value)
                    }
                    className={inputCls}
                    placeholder="Es: 15000.00"
                  />
                </div>
                {form.materiali.length > 0 && (
                  <div className="flex items-center justify-between bg-gray-100 rounded-xl px-3 py-2 border-2 border-black">
                    <span className="text-xs text-gray-700 font-semibold">
                      Totale materiali inseriti:
                    </span>
                    <span className="text-sm font-extrabold text-black">
                      €{" "}
                      {costoMateriali.toLocaleString("it-IT", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
              </Sezione>

              {/* Costo Reale / Fatture */}
              <Sezione
                titolo="Costo Reale / Fatture"
                icona="🧾"
                defaultOpen={true}
              >
                <div>
                  <label className={labelCls}>
                    Costo reale complessivo (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.costoReale}
                    onChange={(e) =>
                      handleChange("costoReale", e.target.value)
                    }
                    className={inputCls}
                    placeholder="Es: 14500.00"
                  />
                </div>

                {/* Riepilogo fatture */}
                {form.fatture.length > 0 && (
                  <div className="flex items-center justify-between bg-gray-100 rounded-xl px-3 py-2 border-2 border-black">
                    <span className="text-xs text-gray-700 font-semibold">
                      Totale fatture inserite:
                    </span>
                    <span className="text-sm font-extrabold text-black">
                      €{" "}
                      {costoFatture.toLocaleString("it-IT", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}

                {/* Delta preventivo vs reale */}
                {form.costoTotale !== "" && form.costoReale !== "" && (
                  <div
                    className={`flex items-center justify-between rounded-xl px-3 py-2 border-2 border-black ${
                      (parseFloat(form.costoReale) || 0) >
                      (parseFloat(form.costoTotale) || 0)
                        ? "bg-rose-200"
                        : "bg-lime-200"
                    }`}
                  >
                    <span className="text-xs text-black font-bold">
                      Scostamento:
                    </span>
                    <span
                      className={`text-sm font-extrabold ${
                        (parseFloat(form.costoReale) || 0) >
                        (parseFloat(form.costoTotale) || 0)
                          ? "text-black"
                          : "text-black"
                      }`}
                    >
                      {(parseFloat(form.costoReale) || 0) >
                      (parseFloat(form.costoTotale) || 0)
                        ? "+"
                        : ""}
                      €{" "}
                      {(
                        (parseFloat(form.costoReale) || 0) -
                        (parseFloat(form.costoTotale) || 0)
                      ).toLocaleString("it-IT", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}

                {/* Lista fatture */}
                <div className="space-y-2 mt-2">
                  {form.fatture.length === 0 && (
                    <p className="text-xs text-gray-400 italic py-2 text-center">
                      Nessuna fattura inserita
                    </p>
                  )}
                  {form.fatture.map((fat, i) => (
                    <FatturaRow
                      key={i}
                      fat={fat}
                      index={i}
                      onChange={aggiornaFattura}
                      onRemove={rimuoviFattura}
                    />
                  ))}
                </div>
                <button
                  onClick={aggiungiFattura}
                  className="w-full py-2 text-xs font-bold text-black bg-lime-300 hover:translate-y-[1px] hover:shadow-none border-2 border-dashed border-black rounded-xl cursor-pointer transition-all shadow-[2px_2px_0px_#000]"
                >
                  + Aggiungi fattura
                </button>
              </Sezione>

              {/* Lista materiali */}
              <Sezione
                titolo={`Materiali da ordinare (${form.materiali.length})`}
                icona="📦"
                defaultOpen={true}
              >
                <div className="space-y-2">
                  {form.materiali.length === 0 && (
                    <p className="text-xs text-gray-400 italic py-2 text-center">
                      Nessun materiale aggiunto
                    </p>
                  )}
                  {form.materiali.map((mat, i) => (
                    <MaterialeRow
                      key={i}
                      mat={mat}
                      index={i}
                      onChange={aggiornaMateriale}
                      onRemove={rimuoviMateriale}
                    />
                  ))}
                </div>
                <button
                  onClick={aggiungiMateriale}
                  className="w-full py-2 text-xs font-bold text-black bg-amber-400 hover:translate-y-[1px] hover:shadow-none border-2 border-dashed border-black rounded-xl cursor-pointer transition-all shadow-[2px_2px_0px_#000]"
                >
                  + Aggiungi materiale
                </button>
              </Sezione>
            </>
          )}

          {/* ═══ TAB NOTE ═══ */}
          {tab === "note" && (
            <>
              <div>
                <label className={labelCls}>Note libere</label>
                <textarea
                  value={form.note}
                  onChange={(e) => handleChange("note", e.target.value)}
                  className={`${inputCls} min-h-[200px] resize-y`}
                  placeholder={
                    "Appunti, promemoria, specifiche tecniche, riferimenti normativi...\n\nEs:\n- Verificare conformità normativa impianti\n- Contattare geom. Rossi per rilievi\n- Attesa conferma preventivo fornitore XY"
                  }
                />
                <p className="text-[10px] text-gray-600 font-semibold mt-1 text-right">
                  {form.note.length} caratteri
                </p>
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
