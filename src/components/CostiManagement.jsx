import { useState } from "react";
import ProgressBar from "./ProgressBar";
import { derivaStato } from "../utils/treeHelpers";

/* ── Helpers ricorsivi ── */

/** Raccoglie tutti i nodi (foglie e nodi padre) con il loro percorso (breadcrumb) */
function raccogliTuttiNodi(nodo, percorso = []) {
  const path = [...percorso, nodo.titolo];
  let risultati = [];

  const isFoglia = !nodo.children || nodo.children.length === 0;

  // Include sempre il nodo (foglia o parent)
  risultati.push({
    id: nodo.id,
    titolo: nodo.titolo,
    percorso: path,
    isFoglia,
    costoTotale: nodo.costoTotale !== undefined && nodo.costoTotale !== "" ? Number(nodo.costoTotale) : 0,
    costoReale: nodo.costoReale !== undefined && nodo.costoReale !== "" ? Number(nodo.costoReale) : 0,
    materiali: nodo.materiali || [],
    fatture: nodo.fatture || [],
    stato: derivaStato(nodo.percentuale),
    percentuale: nodo.percentuale || 0,
  });

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
      stato: derivaStato(nodo.percentuale),
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
  todo: "bg-rose-300 text-black border-2 border-black",
  "in-progress": "bg-yellow-300 text-black border-2 border-black",
  done: "bg-lime-300 text-black border-2 border-black",
};
const STATO_LABEL = {
  todo: "Da fare",
  "in-progress": "In corso",
  done: "Completato",
};

const ORDINE_STATO = {
  "da-ordinare": "bg-rose-300 text-black border-2 border-black",
  ordinato: "bg-yellow-300 text-black border-2 border-black",
  "in-consegna": "bg-sky-300 text-black border-2 border-black",
  ricevuto: "bg-lime-300 text-black border-2 border-black",
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
  "w-full bg-white border-2 border-black rounded-xl px-2 py-1.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-amber-400";

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
          <h3 className="text-sm font-bold text-black">
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
                className="w-24 bg-white border-2 border-black rounded-xl px-2 py-1 text-sm text-right font-bold text-black focus:outline-none focus:ring-2 focus:ring-amber-400"
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
                className="w-24 bg-white border-2 border-black rounded-xl px-2 py-1 text-sm text-right font-bold text-black focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        ) : (
          <div className="text-right space-y-0.5">
            <p className="text-xs text-gray-500">
              Preventivo:{" "}
              <span className="font-bold text-black">€ {fmt(nodo.costoTotale)}</span>
            </p>
            <p className="text-xs text-gray-500">
              Reale:{" "}
              <span className="font-bold text-black">€ {fmt(nodo.costoReale)}</span>
            </p>
            {nodo.costoTotale > 0 && nodo.costoReale > 0 && (
              <p className={`text-[10px] font-semibold ${delta > 0 ? "text-rose-600" : "text-lime-600"}`}>
                {delta > 0 ? "+" : ""}€ {fmt(delta)}
              </p>
            )}
          </div>
        )}

        {!isEditing ? (
          <button
            onClick={onStartEdit}
            className="ml-2 text-[11px] px-2.5 py-1 rounded-xl border-2 border-black text-black font-bold hover:bg-amber-400 hover:shadow-[2px_2px_0px_#000] transition-all cursor-pointer"
            title="Modifica costi"
          >
            ✏️ Modifica
          </button>
        ) : (
          <div className="ml-2 flex gap-1.5">
            <button
              onClick={handleSave}
              className="text-[11px] px-2.5 py-1 rounded-xl bg-amber-400 border-2 border-black text-black font-bold hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none shadow-[2px_2px_0px_#000] transition-all cursor-pointer"
            >
              💾 Salva
            </button>
            <button
              onClick={handleCancel}
              className="text-[11px] px-2.5 py-1 rounded-xl border-2 border-black text-black font-bold hover:bg-rose-300 transition-all cursor-pointer"
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
          <span className="text-[11px] font-bold text-black">
            {nodo.percentuale}%
          </span>
        </div>
        <ProgressBar percentuale={nodo.percentuale} altezza="h-1.5" />
      </div>

      {/* Materiali — modalità lettura */}
      {!isEditing && nodo.materiali.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-black overflow-hidden shadow-[4px_4px_0px_#000]">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-black border-b-2 border-black bg-gray-100">
                <th className="text-left px-3 py-2 font-bold">Materiale</th>
                <th className="text-left px-3 py-2 font-bold">Qtà</th>
                <th className="text-left px-3 py-2 font-bold">Fornitore</th>
                <th className="text-right px-3 py-2 font-bold">Costo</th>
                <th className="text-center px-3 py-2 font-bold">Stato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {nodo.materiali.map((mat, i) => (
                <tr key={i} className="text-black">
                  <td className="px-3 py-2">{mat.descrizione || "—"}</td>
                  <td className="px-3 py-2">{mat.quantita || "—"}</td>
                  <td className="px-3 py-2">{mat.fornitore || "—"}</td>
                  <td className="px-3 py-2 text-right font-bold text-black">
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
                <tr className="border-t-2 border-black">
                  <td colSpan={3} className="px-3 py-2 text-black font-bold">
                    Subtotale materiali
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-black">
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
        <div className="bg-amber-100 rounded-xl border-2 border-black p-3 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-black uppercase">
              📦 Materiali ({materiali.length})
            </span>
            <button
              onClick={aggiungiMateriale}
              className="text-[11px] px-2.5 py-1 rounded-xl bg-amber-400 border-2 border-black text-black font-bold hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none shadow-[2px_2px_0px_#000] transition-all cursor-pointer"
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
              className="bg-white rounded-xl border-2 border-black p-2.5 space-y-2"
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
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-rose-300 border-2 border-black text-black font-bold hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
                >
                  🗑 Rimuovi
                </button>
              </div>
            </div>
          ))}

          {materiali.length > 0 && (
            <div className="flex justify-end pt-1">
              <span className="text-xs text-black">
                Subtotale materiali:{" "}
                <span className="font-bold text-black">€ {fmt(costoMatEdit)}</span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Fatture — modalità lettura */}
      {!isEditing && nodo.fatture.length > 0 && (
        <div className="bg-sky-100 rounded-xl border-2 border-black overflow-hidden mt-3 shadow-[4px_4px_0px_#000]">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-black border-b-2 border-black bg-sky-200">
                <th className="text-left px-3 py-2 font-bold">N° Fattura</th>
                <th className="text-left px-3 py-2 font-bold">Data</th>
                <th className="text-left px-3 py-2 font-bold">Fornitore</th>
                <th className="text-left px-3 py-2 font-bold">Descrizione</th>
                <th className="text-right px-3 py-2 font-bold">Importo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {nodo.fatture.map((fat, i) => (
                <tr key={i} className="text-black">
                  <td className="px-3 py-2 font-medium">{fat.numero || "—"}</td>
                  <td className="px-3 py-2">{fat.data || "—"}</td>
                  <td className="px-3 py-2">{fat.fornitore || "—"}</td>
                  <td className="px-3 py-2">{fat.descrizione || "—"}</td>
                  <td className="px-3 py-2 text-right font-bold text-black">
                    {fat.importo ? `€ ${fmt(fat.importo)}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            {nodo.fatture.length > 1 && (
              <tfoot>
                <tr className="border-t-2 border-black">
                  <td colSpan={4} className="px-3 py-2 text-black font-bold">
                    Subtotale fatture
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-black">
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
        <div className="bg-sky-100 rounded-xl border-2 border-black p-3 space-y-2 mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-black uppercase">
              🧾 Fatture ({fatture.length})
            </span>
            <button
              onClick={aggiungiFattura}
              className="text-[11px] px-2.5 py-1 rounded-xl bg-sky-300 border-2 border-black text-black font-bold hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none shadow-[2px_2px_0px_#000] transition-all cursor-pointer"
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
              className="bg-white rounded-xl border-2 border-black p-2.5 space-y-2"
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
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-rose-300 border-2 border-black text-black font-bold hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
                >
                  🗑 Rimuovi
                </button>
              </div>
            </div>
          ))}

          {fatture.length > 0 && (
            <div className="flex justify-end pt-1">
              <span className="text-xs text-black">
                Subtotale fatture:{" "}
                <span className="font-bold text-black">€ {fmt(costoFattureEdit)}</span>
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

  // Per i totali usiamo solo le foglie (evita doppi conteggi padre+figlio)
  const foglieNodi = tuttiNodi.filter((n) => n.isFoglia);
  const budgetDiretto = foglieNodi.reduce((acc, n) => acc + n.costoTotale, 0);
  const totaleMateriali = foglieNodi.reduce(
    (acc, n) =>
      acc + n.materiali.reduce((a, m) => a + (parseFloat(m.costo) || 0), 0),
    0,
  );
  const costoTotaleProgetto = budgetDiretto + totaleMateriali;

  const realeDiretto = foglieNodi.reduce((acc, n) => acc + n.costoReale, 0);
  const totaleFatture = foglieNodi.reduce(
    (acc, n) =>
      acc + n.fatture.reduce((a, f) => a + (parseFloat(f.importo) || 0), 0),
    0,
  );
  const costoRealeProgetto = realeDiretto + totaleFatture;
  const tuttiMateriali = tuttiNodi.flatMap((n) =>
    n.materiali.map((m) => ({ ...m, nodoTitolo: n.titolo })),
  );

  // Statistiche materiali per stato ordine
  const statsMateriali = tuttiMateriali.reduce((acc, m) => {
    const stato = m.statoOrdine || "da-ordinare";
    acc[stato] = (acc[stato] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b-2 border-black px-6 py-5">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">💰</span>
          <h1 className="text-xl font-extrabold text-black">
            {progetto.titolo}
          </h1>
        </div>
        <p className="text-sm text-gray-600 font-bold ml-10">
          Gestione Costi &amp; Materiali
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* ── Riepilogo globale ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Budget preventivato */}
          <div className="bg-white rounded-xl border-2 border-black p-5 shadow-[4px_4px_0px_#000]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📋</span>
              <span className="text-xs text-black font-bold uppercase tracking-wide">
                Costo Preventivato
              </span>
            </div>
            <p className="text-2xl font-extrabold text-black">
              € {fmt(costoTotaleProgetto)}
            </p>
            <p className="text-[11px] text-gray-600 mt-1">
              {totaleMateriali > 0
                ? `di cui € ${fmt(totaleMateriali)} da materiali`
                : "Budget stimato per tutte le voci"}
            </p>
          </div>

          {/* Costo reale */}
          <div className="bg-white rounded-xl border-2 border-black p-5 shadow-[4px_4px_0px_#000]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🧾</span>
              <span className="text-xs text-black font-bold uppercase tracking-wide">
                Costo Reale
              </span>
            </div>
            <p className="text-2xl font-extrabold text-black">
              € {fmt(costoRealeProgetto)}
            </p>
            <p className="text-[11px] text-gray-600 mt-1">
              {totaleFatture > 0 && realeDiretto > 0
                ? `€ ${fmt(realeDiretto)} diretti + € ${fmt(totaleFatture)} fatture`
                : totaleFatture > 0
                  ? `di cui € ${fmt(totaleFatture)} da fatture`
                  : realeDiretto > 0
                    ? "Costi diretti inseriti"
                    : "Nessun costo reale inserito"}
            </p>
          </div>

          {/* Scostamento */}
          <div className="bg-white rounded-xl border-2 border-black p-5 shadow-[4px_4px_0px_#000]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📊</span>
              <span className="text-xs text-black font-bold uppercase tracking-wide">
                Scostamento
              </span>
            </div>
            {costoTotaleProgetto > 0 ? (
              <>
                <p
                  className={`text-2xl font-extrabold ${costoRealeProgetto > costoTotaleProgetto ? "text-rose-600" : "text-lime-600"}`}
                >
                  {costoRealeProgetto > costoTotaleProgetto ? "+" : ""}€{" "}
                  {fmt(costoRealeProgetto - costoTotaleProgetto)}
                </p>
                <p className="text-[11px] text-gray-600 mt-1">
                  {costoRealeProgetto <= costoTotaleProgetto
                    ? "Sotto budget ✓"
                    : "Sopra budget ⚠"}
                </p>
              </>
            ) : (
              <p className="text-xs text-gray-600 italic mt-2">
                Inserisci un budget preventivato
              </p>
            )}
          </div>

          {/* Stato ordini */}
          <div className="bg-white rounded-xl border-2 border-black p-5 shadow-[4px_4px_0px_#000]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🚚</span>
              <span className="text-xs text-black font-bold uppercase tracking-wide">
                Stato Ordini
              </span>
            </div>
            {tuttiMateriali.length === 0 ? (
              <p className="text-xs text-gray-600 italic">Nessun materiale</p>
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
        <div className="bg-white rounded-xl border-2 border-black shadow-[4px_4px_0px_#000]">
          <div className="px-5 py-4 border-b-2 border-black flex items-center justify-between">
            <h2 className="text-sm font-bold text-black">
              Dettaglio Costi per Voce — {nodi.length}{" "}
              {nodi.length === 1 ? "voce" : "voci"}
            </h2>
            <button
              onClick={() => setMostraTutti(!mostraTutti)}
              className="text-[11px] px-3 py-1.5 rounded-xl border-2 border-black text-black font-bold hover:bg-amber-400 hover:shadow-[2px_2px_0px_#000] transition-all cursor-pointer"
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
            <div className="divide-y divide-gray-300">
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
            <div className="px-5 py-4 border-t-2 border-black bg-gray-100 rounded-b-xl flex items-center justify-between">
              <span className="text-sm font-bold text-black">
                Totale Generale
              </span>
              <div className="text-right space-y-0.5">
                <p className="text-xs text-gray-600">
                  Preventivato:{" "}
                  <span className="font-bold text-black">
                    € {fmt(costoTotaleProgetto)}
                  </span>
                </p>
                <p className="text-xs text-gray-600">
                  Reale:{" "}
                  <span className="font-bold text-black">
                    € {fmt(costoRealeProgetto)}
                  </span>
                </p>
                {costoTotaleProgetto > 0 && (
                  <p
                    className={`text-xs font-bold ${costoRealeProgetto > costoTotaleProgetto ? "text-rose-600" : "text-lime-600"}`}
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
