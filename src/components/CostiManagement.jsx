import { useState } from "react";
import ProgressBar from "./ProgressBar";

/* ── Helpers ricorsivi ── */

/** Raccoglie tutti i nodi foglia con il loro percorso (breadcrumb) */
function raccogliTuttiNodi(nodo, percorso = []) {
  const path = [...percorso, nodo.titolo];
  let risultati = [];

  // Se è una foglia (o ha costi/materiali), la includiamo
  const isFoglia = !nodo.children || nodo.children.length === 0;

  if (isFoglia) {
    risultati.push({
      id: nodo.id,
      titolo: nodo.titolo,
      percorso: path,
      costoTotale: nodo.costoTotale !== undefined && nodo.costoTotale !== "" ? Number(nodo.costoTotale) : 0,
      costoReale: nodo.costoReale !== undefined && nodo.costoReale !== "" ? Number(nodo.costoReale) : 0,
      materiali: nodo.materiali || [],
      fatture: nodo.fatture || [],
      stato: nodo.stato || "todo",
      percentuale: nodo.percentuale || 0,
    });
  }

  if (nodo.children) {
    for (const child of nodo.children) {
      risultati = risultati.concat(raccogliTuttiNodi(child, path));
    }
  }
  return risultati;
}

/** Raccoglie solo nodi con costi o materiali (per i totali) */
function raccogliNodi(nodo, percorso = []) {
  const path = [...percorso, nodo.titolo];
  let risultati = [];

  const hasCosto =
    nodo.costoTotale !== "" &&
    nodo.costoTotale !== undefined &&
    Number(nodo.costoTotale) > 0;
  const hasCostoReale =
    nodo.costoReale !== "" &&
    nodo.costoReale !== undefined &&
    Number(nodo.costoReale) > 0;
  const hasMateriali = nodo.materiali && nodo.materiali.length > 0;
  const hasFatture = nodo.fatture && nodo.fatture.length > 0;

  if (hasCosto || hasCostoReale || hasMateriali || hasFatture) {
    risultati.push({
      id: nodo.id,
      titolo: nodo.titolo,
      percorso: path,
      costoTotale: hasCosto ? Number(nodo.costoTotale) : 0,
      costoReale: hasCostoReale ? Number(nodo.costoReale) : 0,
      materiali: nodo.materiali || [],
      fatture: nodo.fatture || [],
      stato: nodo.stato || "todo",
      percentuale: nodo.percentuale || 0,
    });
  }

  if (nodo.children) {
    for (const child of nodo.children) {
      risultati = risultati.concat(raccogliNodi(child, path));
    }
  }
  return risultati;
}

const STATO_BADGE = {
  todo: "bg-red-500/20 text-red-400",
  "in-progress": "bg-yellow-500/20 text-yellow-400",
  done: "bg-green-500/20 text-green-400",
};
const STATO_LABEL = {
  todo: "Da fare",
  "in-progress": "In corso",
  done: "Completato",
};

const ORDINE_STATO = {
  "da-ordinare": "bg-red-500/15 text-red-400 border-red-500/25",
  ordinato: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  "in-consegna": "bg-blue-500/15 text-blue-400 border-blue-500/25",
  ricevuto: "bg-green-500/15 text-green-400 border-green-500/25",
};
const ORDINE_LABEL = {
  "da-ordinare": "Da ordinare",
  ordinato: "Ordinato",
  "in-consegna": "In consegna",
  ricevuto: "Ricevuto",
};

function fmt(n) {
  return Number(n).toLocaleString("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const inputCls =
  "w-full bg-gray-50 border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-500/50";

/* ── Riga nodo editabile ── */
function NodoRow({ nodo, costoMat, isEditing, onStartEdit, onStopEdit, onAggiornaNodo }) {
  const [budget, setBudget] = useState(nodo.costoTotale || "");
  const [costoReale, setCostoReale] = useState(nodo.costoReale || "");
  const [materiali, setMateriali] = useState(
    () => nodo.materiali.length > 0
      ? JSON.parse(JSON.stringify(nodo.materiali))
      : [],
  );
  const [fatture, setFatture] = useState(
    () => nodo.fatture.length > 0
      ? JSON.parse(JSON.stringify(nodo.fatture))
      : [],
  );

  const handleSave = () => {
    onAggiornaNodo(nodo.id, {
      costoTotale: budget === "" ? "" : Number(budget),
      costoReale: costoReale === "" ? "" : Number(costoReale),
      materiali,
      fatture,
    });
    onStopEdit();
  };

  const handleCancel = () => {
    setBudget(nodo.costoTotale || "");
    setCostoReale(nodo.costoReale || "");
    setMateriali(
      nodo.materiali.length > 0
        ? JSON.parse(JSON.stringify(nodo.materiali))
        : [],
    );
    setFatture(
      nodo.fatture.length > 0
        ? JSON.parse(JSON.stringify(nodo.fatture))
        : [],
    );
    onStopEdit();
  };

  const aggiungiMateriale = () => {
    setMateriali((prev) => [
      ...prev,
      { descrizione: "", quantita: "", fornitore: "", costo: "", statoOrdine: "da-ordinare" },
    ]);
  };

  const aggiornaMateriale = (index, campo, valore) => {
    setMateriali((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [campo]: valore } : m)),
    );
  };

  const rimuoviMateriale = (index) => {
    setMateriali((prev) => prev.filter((_, i) => i !== index));
  };

  const aggiungiFattura = () => {
    setFatture((prev) => [
      ...prev,
      { numero: "", data: "", importo: "", fornitore: "", descrizione: "" },
    ]);
  };

  const aggiornaFattura = (index, campo, valore) => {
    setFatture((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [campo]: valore } : f)),
    );
  };

  const rimuoviFattura = (index) => {
    setFatture((prev) => prev.filter((_, i) => i !== index));
  };

  const costoMatEdit = materiali.reduce(
    (a, m) => a + (parseFloat(m.costo) || 0),
    0,
  );

  const costoFattureEdit = fatture.reduce(
    (a, f) => a + (parseFloat(f.importo) || 0),
    0,
  );

  const costoFattureNodo = nodo.fatture.reduce(
    (a, f) => a + (parseFloat(f.importo) || 0),
    0,
  );

  const delta = nodo.costoReale - nodo.costoTotale;

  return (
    <div key={nodo.id} className="px-5 py-4">
      {/* Header voce */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-700">
            {nodo.titolo}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {nodo.percorso.slice(0, -1).join(" › ")}
          </p>
        </div>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATO_BADGE[nodo.stato] || STATO_BADGE["todo"]}`}
        >
          {STATO_LABEL[nodo.stato] || "Da fare"}
        </span>

        {isEditing ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400">Prev. €</span>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-24 bg-gray-50 border border-amber-300 rounded px-2 py-1 text-sm text-right font-bold text-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400">Reale €</span>
              <input
                type="number"
                value={costoReale}
                onChange={(e) => setCostoReale(e.target.value)}
                className="w-24 bg-gray-50 border border-emerald-300 rounded px-2 py-1 text-sm text-right font-bold text-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        ) : (
          <div className="text-right space-y-0.5">
            <p className="text-xs text-gray-400">
              Preventivo:{" "}
              <span className="font-bold text-amber-600">€ {fmt(nodo.costoTotale)}</span>
            </p>
            <p className="text-xs text-gray-400">
              Reale:{" "}
              <span className="font-bold text-emerald-600">€ {fmt(nodo.costoReale)}</span>
            </p>
            {nodo.costoTotale > 0 && nodo.costoReale > 0 && (
              <p className={`text-[10px] font-semibold ${delta > 0 ? "text-red-500" : "text-emerald-500"}`}>
                {delta > 0 ? "+" : ""}€ {fmt(delta)}
              </p>
            )}
          </div>
        )}

        {!isEditing ? (
          <button
            onClick={onStartEdit}
            className="ml-2 text-[11px] px-2.5 py-1 rounded-lg border border-gray-300 text-gray-400 hover:text-amber-600 hover:border-amber-300 transition-colors cursor-pointer"
            title="Modifica costi"
          >
            ✏️ Modifica
          </button>
        ) : (
          <div className="ml-2 flex gap-1.5">
            <button
              onClick={handleSave}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors cursor-pointer"
            >
              💾 Salva
            </button>
            <button
              onClick={handleCancel}
              className="text-[11px] px-2.5 py-1 rounded-lg border border-gray-300 text-gray-400 hover:text-red-500 hover:border-red-300 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-gray-400">Avanzamento</span>
          <span className="text-[11px] font-bold text-amber-600">
            {nodo.percentuale}%
          </span>
        </div>
        <ProgressBar percentuale={nodo.percentuale} altezza="h-1.5" />
      </div>

      {/* Materiali — modalità lettura */}
      {!isEditing && nodo.materiali.length > 0 && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-gray-200">
                <th className="text-left px-3 py-2 font-medium">Materiale</th>
                <th className="text-left px-3 py-2 font-medium">Qtà</th>
                <th className="text-left px-3 py-2 font-medium">Fornitore</th>
                <th className="text-right px-3 py-2 font-medium">Costo</th>
                <th className="text-center px-3 py-2 font-medium">Stato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {nodo.materiali.map((mat, i) => (
                <tr key={i} className="text-gray-600">
                  <td className="px-3 py-2">{mat.descrizione || "—"}</td>
                  <td className="px-3 py-2">{mat.quantita || "—"}</td>
                  <td className="px-3 py-2">{mat.fornitore || "—"}</td>
                  <td className="px-3 py-2 text-right font-medium text-amber-600">
                    {mat.costo ? `€ ${fmt(mat.costo)}` : "—"}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${ORDINE_STATO[mat.statoOrdine] || ORDINE_STATO["da-ordinare"]}`}
                    >
                      {ORDINE_LABEL[mat.statoOrdine] || "Da ordinare"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            {nodo.materiali.length > 1 && (
              <tfoot>
                <tr className="border-t border-gray-300">
                  <td colSpan={3} className="px-3 py-2 text-gray-400 font-medium">
                    Subtotale materiali
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-amber-600">
                    € {fmt(costoMat)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {/* Materiali — modalità editing */}
      {isEditing && (
        <div className="bg-amber-50/50 rounded-lg border border-amber-200 p-3 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-600">
              📦 Materiali ({materiali.length})
            </span>
            <button
              onClick={aggiungiMateriale}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors cursor-pointer"
            >
              + Aggiungi materiale
            </button>
          </div>

          {materiali.length === 0 && (
            <p className="text-xs text-gray-400 italic py-2 text-center">
              Nessun materiale — clicca "Aggiungi materiale" per iniziare
            </p>
          )}

          {materiali.map((mat, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-gray-200 p-2.5 space-y-2"
            >
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={mat.descrizione}
                  onChange={(e) => aggiornaMateriale(i, "descrizione", e.target.value)}
                  className={`${inputCls} col-span-2`}
                  placeholder="Materiale / Articolo"
                />
                <input
                  type="text"
                  value={mat.quantita}
                  onChange={(e) => aggiornaMateriale(i, "quantita", e.target.value)}
                  className={inputCls}
                  placeholder="Quantità"
                />
                <input
                  type="text"
                  value={mat.fornitore || ""}
                  onChange={(e) => aggiornaMateriale(i, "fornitore", e.target.value)}
                  className={inputCls}
                  placeholder="Fornitore"
                />
                <input
                  type="number"
                  value={mat.costo}
                  onChange={(e) => aggiornaMateriale(i, "costo", e.target.value)}
                  className={inputCls}
                  placeholder="Costo €"
                  min="0"
                  step="0.01"
                />
                <select
                  value={mat.statoOrdine || "da-ordinare"}
                  onChange={(e) => aggiornaMateriale(i, "statoOrdine", e.target.value)}
                  className={inputCls}
                >
                  <option value="da-ordinare">Da ordinare</option>
                  <option value="ordinato">Ordinato</option>
                  <option value="in-consegna">In consegna</option>
                  <option value="ricevuto">Ricevuto</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => rimuoviMateriale(i)}
                  className="text-[10px] px-2 py-0.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  🗑 Rimuovi
                </button>
              </div>
            </div>
          ))}

          {materiali.length > 0 && (
            <div className="flex justify-end pt-1">
              <span className="text-xs text-gray-500">
                Subtotale materiali:{" "}
                <span className="font-bold text-amber-600">€ {fmt(costoMatEdit)}</span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Fatture — modalità lettura */}
      {!isEditing && nodo.fatture.length > 0 && (
        <div className="bg-emerald-50/50 rounded-lg border border-emerald-200 overflow-hidden mt-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-emerald-200">
                <th className="text-left px-3 py-2 font-medium">N° Fattura</th>
                <th className="text-left px-3 py-2 font-medium">Data</th>
                <th className="text-left px-3 py-2 font-medium">Fornitore</th>
                <th className="text-left px-3 py-2 font-medium">Descrizione</th>
                <th className="text-right px-3 py-2 font-medium">Importo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {nodo.fatture.map((fat, i) => (
                <tr key={i} className="text-gray-600">
                  <td className="px-3 py-2 font-medium">{fat.numero || "—"}</td>
                  <td className="px-3 py-2">{fat.data || "—"}</td>
                  <td className="px-3 py-2">{fat.fornitore || "—"}</td>
                  <td className="px-3 py-2">{fat.descrizione || "—"}</td>
                  <td className="px-3 py-2 text-right font-medium text-emerald-600">
                    {fat.importo ? `€ ${fmt(fat.importo)}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            {nodo.fatture.length > 1 && (
              <tfoot>
                <tr className="border-t border-emerald-300">
                  <td colSpan={4} className="px-3 py-2 text-gray-400 font-medium">
                    Subtotale fatture
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-emerald-600">
                    € {fmt(costoFattureNodo)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {/* Fatture — modalità editing */}
      {isEditing && (
        <div className="bg-emerald-50/50 rounded-lg border border-emerald-200 p-3 space-y-2 mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-600">
              🧾 Fatture ({fatture.length})
            </span>
            <button
              onClick={aggiungiFattura}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors cursor-pointer"
            >
              + Aggiungi fattura
            </button>
          </div>

          {fatture.length === 0 && (
            <p className="text-xs text-gray-400 italic py-2 text-center">
              Nessuna fattura — clicca "Aggiungi fattura" per iniziare
            </p>
          )}

          {fatture.map((fat, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-gray-200 p-2.5 space-y-2"
            >
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={fat.numero}
                  onChange={(e) => aggiornaFattura(i, "numero", e.target.value)}
                  className={inputCls}
                  placeholder="N° Fattura"
                />
                <input
                  type="date"
                  value={fat.data}
                  onChange={(e) => aggiornaFattura(i, "data", e.target.value)}
                  className={inputCls}
                />
                <input
                  type="text"
                  value={fat.fornitore}
                  onChange={(e) => aggiornaFattura(i, "fornitore", e.target.value)}
                  className={inputCls}
                  placeholder="Fornitore"
                />
                <input
                  type="number"
                  value={fat.importo}
                  onChange={(e) => aggiornaFattura(i, "importo", e.target.value)}
                  className={inputCls}
                  placeholder="Importo €"
                  min="0"
                  step="0.01"
                />
                <input
                  type="text"
                  value={fat.descrizione}
                  onChange={(e) => aggiornaFattura(i, "descrizione", e.target.value)}
                  className={`${inputCls} col-span-2`}
                  placeholder="Descrizione"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => rimuoviFattura(i)}
                  className="text-[10px] px-2 py-0.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  🗑 Rimuovi
                </button>
              </div>
            </div>
          ))}

          {fatture.length > 0 && (
            <div className="flex justify-end pt-1">
              <span className="text-xs text-gray-500">
                Subtotale fatture:{" "}
                <span className="font-bold text-emerald-600">€ {fmt(costoFattureEdit)}</span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Messaggio per voci senza costi in modalità lettura */}
      {!isEditing && nodo.costoTotale === 0 && nodo.costoReale === 0 && nodo.materiali.length === 0 && nodo.fatture.length === 0 && (
        <p className="text-xs text-gray-400 italic">
          Nessun costo assegnato — clicca "Modifica" per aggiungere
        </p>
      )}
    </div>
  );
}

export default function CostiManagement({ progetto, onAggiornaNodo }) {
  const [mostraTutti, setMostraTutti] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const nodiConCosti = raccogliNodi(progetto);
  const tuttiNodi = raccogliTuttiNodi(progetto);
  const nodi = mostraTutti ? tuttiNodi : nodiConCosti;

  const costoTotaleProgetto = nodiConCosti.reduce((acc, n) => acc + n.costoTotale, 0);
  const costoRealeProgetto = nodiConCosti.reduce((acc, n) => acc + n.costoReale, 0);
  const totaleFatture = nodi.reduce(
    (acc, n) =>
      acc + n.fatture.reduce((a, f) => a + (parseFloat(f.importo) || 0), 0),
    0,
  );
  const totaleMateriali = nodi.reduce(
    (acc, n) =>
      acc + n.materiali.reduce((a, m) => a + (parseFloat(m.costo) || 0), 0),
    0,
  );
  const tuttiMateriali = nodi.flatMap((n) =>
    n.materiali.map((m) => ({ ...m, nodoTitolo: n.titolo })),
  );

  // Statistiche materiali per stato ordine
  const statsMateriali = tuttiMateriali.reduce((acc, m) => {
    const stato = m.statoOrdine || "da-ordinare";
    acc[stato] = (acc[stato] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 px-6 py-5">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">💰</span>
          <h1 className="text-xl font-bold text-amber-600">
            {progetto.titolo}
          </h1>
        </div>
        <p className="text-sm text-gray-400 ml-10">
          Gestione Costi &amp; Materiali
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* ── Riepilogo globale ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Budget preventivato */}
          <div className="bg-white rounded-xl border border-gray-300 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📋</span>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                Costo Preventivato
              </span>
            </div>
            <p className="text-2xl font-bold text-amber-600">
              € {fmt(costoTotaleProgetto)}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Budget stimato per tutte le voci
            </p>
          </div>

          {/* Costo reale */}
          <div className="bg-white rounded-xl border border-gray-300 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🧾</span>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                Costo Reale
              </span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              € {fmt(costoRealeProgetto)}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              {totaleFatture > 0
                ? `di cui € ${fmt(totaleFatture)} da fatture`
                : "Nessuna fattura inserita"}
            </p>
          </div>

          {/* Scostamento */}
          <div className="bg-white rounded-xl border border-gray-300 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📊</span>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                Scostamento
              </span>
            </div>
            {costoTotaleProgetto > 0 ? (
              <>
                <p
                  className={`text-2xl font-bold ${costoRealeProgetto > costoTotaleProgetto ? "text-red-500" : "text-emerald-500"}`}
                >
                  {costoRealeProgetto > costoTotaleProgetto ? "+" : ""}€{" "}
                  {fmt(costoRealeProgetto - costoTotaleProgetto)}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  {costoRealeProgetto <= costoTotaleProgetto
                    ? "Sotto budget ✓"
                    : "Sopra budget ⚠"}
                </p>
              </>
            ) : (
              <p className="text-xs text-gray-400 italic mt-2">
                Inserisci un budget preventivato
              </p>
            )}
          </div>

          {/* Stato ordini */}
          <div className="bg-white rounded-xl border border-gray-300 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🚚</span>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                Stato Ordini
              </span>
            </div>
            {tuttiMateriali.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Nessun materiale</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {Object.entries(statsMateriali).map(([stato, count]) => (
                  <span
                    key={stato}
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium ${ORDINE_STATO[stato] || ""}`}
                  >
                    {ORDINE_LABEL[stato] || stato}: {count}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Dettaglio per voce ── */}
        <div className="bg-white rounded-xl border border-gray-300 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              Dettaglio Costi per Voce — {nodi.length}{" "}
              {nodi.length === 1 ? "voce" : "voci"}
            </h2>
            <button
              onClick={() => setMostraTutti(!mostraTutti)}
              className="text-[11px] px-3 py-1.5 rounded-lg border border-gray-300 text-gray-500 hover:text-amber-600 hover:border-amber-300 transition-colors cursor-pointer"
            >
              {mostraTutti ? "Solo con costi" : "Mostra tutte le voci"}
            </button>
          </div>

          {nodi.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg mb-2">Nessun costo registrato</p>
              <p className="text-sm">
                Clicca "Mostra tutte le voci" per aggiungere costi, oppure usa
                l'Albero WBS
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {nodi.map((nodo) => {
                const isEditing = editingId === nodo.id;
                const costoMat = nodo.materiali.reduce(
                  (a, m) => a + (parseFloat(m.costo) || 0),
                  0,
                );
                return (
                  <NodoRow
                    key={nodo.id}
                    nodo={nodo}
                    costoMat={costoMat}
                    isEditing={isEditing}
                    onStartEdit={() => setEditingId(nodo.id)}
                    onStopEdit={() => setEditingId(null)}
                    onAggiornaNodo={onAggiornaNodo}
                  />
                );
              })}
            </div>
          )}

          {/* Footer totale */}
          {nodi.length > 0 && (
            <div className="px-5 py-4 border-t border-gray-300 bg-gray-50 rounded-b-xl flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">
                Totale Generale
              </span>
              <div className="text-right space-y-0.5">
                <p className="text-xs text-gray-400">
                  Preventivato:{" "}
                  <span className="font-bold text-amber-600">
                    € {fmt(costoTotaleProgetto)}
                  </span>
                </p>
                <p className="text-xs text-gray-400">
                  Reale:{" "}
                  <span className="font-bold text-emerald-600">
                    € {fmt(costoRealeProgetto)}
                  </span>
                </p>
                {costoTotaleProgetto > 0 && (
                  <p
                    className={`text-xs font-semibold ${costoRealeProgetto > costoTotaleProgetto ? "text-red-500" : "text-emerald-500"}`}
                  >
                    Scostamento:{" "}
                    {costoRealeProgetto > costoTotaleProgetto ? "+" : ""}€{" "}
                    {fmt(costoRealeProgetto - costoTotaleProgetto)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
