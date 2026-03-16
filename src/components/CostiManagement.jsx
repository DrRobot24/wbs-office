import ProgressBar from './ProgressBar'

/* ── Helpers ricorsivi ── */

/** Raccoglie tutti i nodi con costi o materiali, con il loro percorso (breadcrumb) */
function raccogliNodi(nodo, percorso = []) {
  const path = [...percorso, nodo.titolo]
  let risultati = []

  const hasCosto = nodo.costoTotale !== '' && nodo.costoTotale !== undefined && Number(nodo.costoTotale) > 0
  const hasMateriali = nodo.materiali && nodo.materiali.length > 0

  if (hasCosto || hasMateriali) {
    risultati.push({
      id: nodo.id,
      titolo: nodo.titolo,
      percorso: path,
      costoTotale: hasCosto ? Number(nodo.costoTotale) : 0,
      materiali: nodo.materiali || [],
      stato: nodo.stato || 'todo',
      percentuale: nodo.percentuale || 0,
    })
  }

  if (nodo.children) {
    for (const child of nodo.children) {
      risultati = risultati.concat(raccogliNodi(child, path))
    }
  }
  return risultati
}

const STATO_BADGE = {
  'todo': 'bg-red-500/20 text-red-400',
  'in-progress': 'bg-yellow-500/20 text-yellow-400',
  'done': 'bg-green-500/20 text-green-400',
}
const STATO_LABEL = { 'todo': 'Da fare', 'in-progress': 'In corso', 'done': 'Completato' }

const ORDINE_STATO = {
  'da-ordinare': 'bg-red-500/15 text-red-400 border-red-500/25',
  'ordinato': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  'in-consegna': 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  'ricevuto': 'bg-green-500/15 text-green-400 border-green-500/25',
}
const ORDINE_LABEL = {
  'da-ordinare': 'Da ordinare',
  'ordinato': 'Ordinato',
  'in-consegna': 'In consegna',
  'ricevuto': 'Ricevuto',
}

function fmt(n) {
  return Number(n).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function CostiManagement({ progetto }) {
  const nodi = raccogliNodi(progetto)
  const costoTotaleProgetto = nodi.reduce((acc, n) => acc + n.costoTotale, 0)
  const totaleMateriali = nodi.reduce((acc, n) => acc + n.materiali.reduce((a, m) => a + (parseFloat(m.costo) || 0), 0), 0)
  const tuttiMateriali = nodi.flatMap(n => n.materiali.map(m => ({ ...m, nodoTitolo: n.titolo })))

  // Statistiche materiali per stato ordine
  const statsMateriali = tuttiMateriali.reduce((acc, m) => {
    const stato = m.statoOrdine || 'da-ordinare'
    acc[stato] = (acc[stato] || 0) + 1
    return acc
  }, {})

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 px-6 py-5">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">💰</span>
          <h1 className="text-xl font-bold text-amber-600">{progetto.titolo}</h1>
        </div>
        <p className="text-sm text-gray-400 ml-10">Gestione Costi &amp; Materiali</p>
      </div>

      <div className="p-6 space-y-6">
        {/* ── Riepilogo globale ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Budget previsto */}
          <div className="bg-white rounded-xl border border-gray-300 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📋</span>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Budget Previsto</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">
              € {fmt(costoTotaleProgetto)}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Somma di tutte le voci con costo assegnato
            </p>
          </div>

          {/* Costo materiali */}
          <div className="bg-white rounded-xl border border-gray-300 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📦</span>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Totale Materiali</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">
              € {fmt(totaleMateriali)}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              {tuttiMateriali.length} {tuttiMateriali.length === 1 ? 'materiale' : 'materiali'} inseriti
            </p>
          </div>

          {/* Stato ordini */}
          <div className="bg-white rounded-xl border border-gray-300 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🚚</span>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Stato Ordini</span>
            </div>
            {tuttiMateriali.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Nessun materiale</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {Object.entries(statsMateriali).map(([stato, count]) => (
                  <span key={stato} className={`text-xs px-2.5 py-1 rounded-full border font-medium ${ORDINE_STATO[stato] || ''}`}>
                    {ORDINE_LABEL[stato] || stato}: {count}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Dettaglio per voce ── */}
        <div className="bg-white rounded-xl border border-gray-300 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700">
              Dettaglio Costi per Voce — {nodi.length} {nodi.length === 1 ? 'voce' : 'voci'} con dati economici
            </h2>
          </div>

          {nodi.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg mb-2">Nessun costo registrato</p>
              <p className="text-sm">Apri un elemento dall'Albero WBS e compila il tab "Materiali &amp; Costi"</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {nodi.map(nodo => {
                const costoMat = nodo.materiali.reduce((a, m) => a + (parseFloat(m.costo) || 0), 0)
                return (
                  <div key={nodo.id} className="px-5 py-4">
                    {/* Header voce */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-700">{nodo.titolo}</h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {nodo.percorso.slice(0, -1).join(' › ')}
                        </p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATO_BADGE[nodo.stato] || STATO_BADGE['todo']}`}>
                        {STATO_LABEL[nodo.stato] || 'Da fare'}
                      </span>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Budget</p>
                        <p className="text-sm font-bold text-amber-600">€ {fmt(nodo.costoTotale)}</p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-gray-400">Avanzamento</span>
                        <span className="text-[11px] font-bold text-amber-600">{nodo.percentuale}%</span>
                      </div>
                      <ProgressBar percentuale={nodo.percentuale} altezza="h-1.5" />
                    </div>

                    {/* Materiali */}
                    {nodo.materiali.length > 0 && (
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
                                <td className="px-3 py-2">{mat.descrizione || '—'}</td>
                                <td className="px-3 py-2">{mat.quantita || '—'}</td>
                                <td className="px-3 py-2">{mat.fornitore || '—'}</td>
                                <td className="px-3 py-2 text-right font-medium text-amber-600">
                                  {mat.costo ? `€ ${fmt(mat.costo)}` : '—'}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${ORDINE_STATO[mat.statoOrdine] || ORDINE_STATO['da-ordinare']}`}>
                                    {ORDINE_LABEL[mat.statoOrdine] || 'Da ordinare'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          {nodo.materiali.length > 1 && (
                            <tfoot>
                              <tr className="border-t border-gray-300">
                                <td colSpan={3} className="px-3 py-2 text-gray-400 font-medium">Subtotale materiali</td>
                                <td className="px-3 py-2 text-right font-bold text-amber-600">€ {fmt(costoMat)}</td>
                                <td />
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Footer totale */}
          {nodi.length > 0 && (
            <div className="px-5 py-4 border-t border-gray-300 bg-gray-50 rounded-b-xl flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Totale Generale</span>
              <div className="text-right">
                <p className="text-xs text-gray-400">Budget previsto: <span className="font-bold text-amber-600">€ {fmt(costoTotaleProgetto)}</span></p>
                <p className="text-xs text-gray-400">Materiali: <span className="font-bold text-amber-600">€ {fmt(totaleMateriali)}</span></p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
