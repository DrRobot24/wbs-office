import { useState } from "react";

const statiOptions = [
  { value: "todo", label: "Da fare" },
  { value: "in-progress", label: "In corso" },
  { value: "done", label: "Completato" },
];

const _PRIORITA_OPTIONS = [
  { value: "bassa", label: "Bassa" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

/* ─── Componente riga materiale ─── */
function MaterialeRow({ mat, index, onChange, onRemove }) {
  return (
    <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-2.5 border border-gray-200">
      <div className="flex-1 grid grid-cols-2 gap-2">
        <input
          type="text"
          value={mat.descrizione}
          onChange={(e) => onChange(index, "descrizione", e.target.value)}
          className="bg-gray-50 border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-500/50 col-span-2"
          placeholder="Materiale / Articolo"
        />
        <input
          type="text"
          value={mat.quantita}
          onChange={(e) => onChange(index, "quantita", e.target.value)}
          className="bg-gray-50 border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          placeholder="Qtà (es: 50 mq)"
        />
        <input
          type="text"
          value={mat.fornitore}
          onChange={(e) => onChange(index, "fornitore", e.target.value)}
          className="bg-gray-50 border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          placeholder="Fornitore"
        />
        <input
          type="number"
          step="0.01"
          value={mat.costo}
          onChange={(e) => onChange(index, "costo", e.target.value)}
          className="bg-gray-50 border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          placeholder="Costo €"
        />
        <select
          value={mat.statoOrdine || "da-ordinare"}
          onChange={(e) => onChange(index, "statoOrdine", e.target.value)}
          className="bg-gray-50 border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
        >
          <option value="da-ordinare">Da ordinare</option>
          <option value="ordinato">Ordinato</option>
          <option value="in-consegna">In consegna</option>
          <option value="ricevuto">Ricevuto</option>
        </select>
      </div>
      <button
        onClick={() => onRemove(index)}
        className="mt-1 w-6 h-6 flex items-center justify-center rounded-full bg-red-500/10 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-xs cursor-pointer shrink-0"
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
    <div className="flex items-start gap-2 bg-emerald-50/50 rounded-lg p-2.5 border border-emerald-200">
      <div className="flex-1 grid grid-cols-2 gap-2">
        <input
          type="text"
          value={fat.numero}
          onChange={(e) => onChange(index, "numero", e.target.value)}
          className="bg-gray-50 border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          placeholder="N° Fattura"
        />
        <input
          type="date"
          value={fat.data}
          onChange={(e) => onChange(index, "data", e.target.value)}
          className="bg-gray-50 border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
        />
        <input
          type="text"
          value={fat.fornitore}
          onChange={(e) => onChange(index, "fornitore", e.target.value)}
          className="bg-gray-50 border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          placeholder="Fornitore"
        />
        <input
          type="number"
          step="0.01"
          value={fat.importo}
          onChange={(e) => onChange(index, "importo", e.target.value)}
          className="bg-gray-50 border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          placeholder="Importo €"
        />
        <input
          type="text"
          value={fat.descrizione}
          onChange={(e) => onChange(index, "descrizione", e.target.value)}
          className="bg-gray-50 border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 col-span-2"
          placeholder="Descrizione"
        />
      </div>
      <button
        onClick={() => onRemove(index)}
        className="mt-1 w-6 h-6 flex items-center justify-center rounded-full bg-red-500/10 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-xs cursor-pointer shrink-0"
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
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <button
        onClick={() => setAperta(!aperta)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold cursor-pointer transition-colors"
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
  "w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm text-gray-700";
const labelCls = "block mb-1 text-xs font-medium text-gray-500";

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
    onSave({
      ...form,
      percentuale: Math.max(0, Math.min(100, Number(form.percentuale) || 0)),
      costoTotale:
        form.costoTotale !== "" ? parseFloat(form.costoTotale) || 0 : "",
      costoReale:
        form.costoReale !== "" ? parseFloat(form.costoReale) || 0 : "",
    });
  };

  const tabCls = (t) =>
    `px-3 py-1.5 text-xs font-medium rounded-t-lg cursor-pointer transition-colors ${
      tab === t
        ? "bg-white text-amber-600 border border-gray-300 border-b-white -mb-px"
        : "text-gray-400 hover:text-amber-600"
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-white border border-gray-300 rounded-xl shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="px-5 pt-5 pb-3 border-b border-gray-300">
          <h2 className="text-lg font-bold text-amber-600">
            {isEdit ? "✏️ Modifica Elemento" : "➕ Nuovo Elemento"}
          </h2>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Compila le informazioni per questa voce della WBS
          </p>
        </div>

        {/* ── Tabs ── */}
        <div className="shrink-0 bg-gray-50 px-5 flex gap-1 pt-2 border-b border-gray-200">
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
              <span className="ml-1.5 bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
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

              {/* Riga: Stato + Percentuale */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Stato</label>
                  <select
                    value={form.stato}
                    onChange={(e) => handleChange("stato", e.target.value)}
                    className={inputCls}
                  >
                    {statiOptions.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Avanzamento %</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={form.percentuale}
                      onChange={(e) =>
                        handleChange("percentuale", Number(e.target.value))
                      }
                      className="flex-1 h-2 accent-amber-400"
                    />
                    <span className="text-amber-600 text-sm font-bold w-10 text-right">
                      {form.percentuale}%
                    </span>
                  </div>
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
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                    <span className="text-xs text-gray-400">
                      Totale materiali inseriti:
                    </span>
                    <span className="text-sm font-bold text-amber-600">
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
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                    <span className="text-xs text-gray-400">
                      Totale fatture inserite:
                    </span>
                    <span className="text-sm font-bold text-emerald-600">
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
                    className={`flex items-center justify-between rounded-lg px-3 py-2 border ${
                      (parseFloat(form.costoReale) || 0) >
                      (parseFloat(form.costoTotale) || 0)
                        ? "bg-red-50 border-red-200"
                        : "bg-emerald-50 border-emerald-200"
                    }`}
                  >
                    <span className="text-xs text-gray-500">
                      Scostamento:
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        (parseFloat(form.costoReale) || 0) >
                        (parseFloat(form.costoTotale) || 0)
                          ? "text-red-600"
                          : "text-emerald-600"
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
                  className="w-full py-2 text-xs font-semibold text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 border border-dashed border-gray-300 rounded-lg cursor-pointer transition-colors"
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
                  className="w-full py-2 text-xs font-semibold text-amber-600 bg-amber-500/10 hover:bg-amber-500/20 border border-dashed border-gray-300 rounded-lg cursor-pointer transition-colors"
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
                <p className="text-[10px] text-gray-300 mt-1 text-right">
                  {form.note.length} caratteri
                </p>
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 px-5 py-3 border-t border-gray-300 flex items-center justify-between bg-gray-50 rounded-b-xl">
          <div>
            {isEdit && (
              <button
                onClick={onDelete}
                className="text-sm text-red-400 hover:text-red-300 font-medium cursor-pointer"
              >
                🗑 Elimina
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-400 hover:text-amber-600 border border-gray-300 cursor-pointer"
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-sm rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-gray-1000 text-amber-600 font-semibold cursor-pointer"
            >
              💾 Salva
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
