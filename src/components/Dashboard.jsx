import ProgressBar from './ProgressBar'
import { esportaExcel, esportaPDF } from '../utils/exportWBS'

const badgeClassi = {
  'todo': 'bg-red-500/20 text-red-400',
  'in-progress': 'bg-yellow-500/20 text-yellow-400',
  'done': 'bg-green-500/20 text-green-400',
}

const badgeLabels = {
  'todo': 'Da fare',
  'in-progress': 'In corso',
  'done': 'Completato',
}

const statusColors = {
  'todo': 'border-red-500/30 bg-red-500/10',
  'in-progress': 'border-yellow-500/30 bg-yellow-500/10',
  'done': 'border-green-500/30 bg-green-500/10',
}

/** Calcola lo stato di un nodo ricorsivamente in base ai discendenti */
function calcolaStatoNodo(nodo) {
  const foglie = raccogliFoglie(nodo)
  if (foglie.length === 0) return nodo.stato || 'todo'
  if (foglie.every(f => f.stato === 'done')) return 'done'
  if (foglie.some(f => f.stato === 'in-progress' || f.stato === 'done')) return 'in-progress'
  return 'todo'
}

/** Raccoglie tutte le foglie (nodi senza figli) ricorsivamente */
function raccogliFoglie(nodo) {
  if (!nodo.children || nodo.children.length === 0) return [nodo]
  return nodo.children.flatMap(raccogliFoglie)
}

/** Conta tutti i discendenti diretti e indiretti */
function contaDiscendenti(nodo) {
  if (!nodo.children || nodo.children.length === 0) return 0
  return nodo.children.reduce((acc, c) => acc + 1 + contaDiscendenti(c), 0)
}

/** Rendering ricorsivo dei figli dentro la card */
function ChildrenList({ children, depth = 0 }) {
  if (!children || children.length === 0) return null
  return (
    <div className={`flex flex-col gap-1 ${depth > 0 ? 'ml-3 border-l border-amber-500/10 pl-2' : ''}`}>
      {children.map(child => {
        const isLeaf = !child.children || child.children.length === 0
        const stato = isLeaf ? (child.stato || 'todo') : calcolaStatoNodo(child)
        return (
          <div key={child.id}>
            <div
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${statusColors[stato] || statusColors['todo']} border`}
            >
              <span>
                {stato === 'done' ? '✅' : stato === 'in-progress' ? '🔄' : '⬜'}
              </span>
              <span className="flex-1 truncate font-medium text-amber-300/80">
                {child.titolo}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${badgeClassi[stato]}`}
              >
                {child.percentuale}%
              </span>
            </div>
            {!isLeaf && (
              <ChildrenList children={child.children} depth={depth + 1} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function NodoFlusso({ nodo, nodoIndex, isLast }) {
  const statoNodo = calcolaStatoNodo(nodo)
  const discendenti = contaDiscendenti(nodo)
  const borderColor =
    statoNodo === 'done'
      ? 'border-green-500/50 shadow-green-900/20'
      : statoNodo === 'in-progress'
        ? 'border-yellow-500/50 shadow-yellow-900/20'
        : 'border-red-500/50 shadow-red-900/20'

  const headerBg =
    statoNodo === 'done'
      ? 'bg-green-500/30'
      : statoNodo === 'in-progress'
        ? 'bg-yellow-500/30'
        : 'bg-red-500/30'

  return (
    <div className="flex items-start">
      <div
        className={`border-2 rounded-xl shadow-md min-w-[220px] max-w-[300px] overflow-hidden bg-[#0d2137] ${borderColor}`}
      >
        {/* Header */}
        <div className={`${headerBg} px-4 py-2.5 flex items-center gap-2`}>
          <span className="text-amber-400 text-xs font-bold bg-amber-500/20 rounded-full px-2 py-0.5">
            {nodoIndex + 1}
          </span>
          <span className="text-amber-300 text-sm font-semibold truncate flex-1">
            {nodo.titolo}
          </span>
        </div>

        {/* Progress */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-amber-500/50 font-medium">Avanzamento</span>
            <span className="text-xs font-bold text-amber-400">{nodo.percentuale}%</span>
          </div>
          <ProgressBar percentuale={nodo.percentuale} altezza="h-2" />
        </div>

        {/* Children ricorsivi */}
        <div className="px-4 py-3">
          {(!nodo.children || nodo.children.length === 0) ? (
            <p className="text-xs text-amber-500/30 italic py-1">Nessun sotto-elemento</p>
          ) : (
            <ChildrenList children={nodo.children} />
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#091a2a] border-t border-amber-500/10 flex justify-between">
          <span className="text-[10px] text-amber-500/30">
            {discendenti} {discendenti === 1 ? 'elemento' : 'elementi'}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${badgeClassi[statoNodo]}`}>
            {badgeLabels[statoNodo]}
          </span>
        </div>
      </div>

      {/* Freccia di connessione */}
      {!isLast && (
        <div className="flex items-center self-center mx-2">
          <div className="w-8 h-0.5 bg-amber-500/30" />
          <svg className="w-4 h-4 text-amber-500/40 -ml-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  )
}

export default function Dashboard({ progetto }) {
  const children = progetto.children || []
  const totaleNodi = children.length

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a1929]">
      {/* Header */}
      <div className="bg-[#0d2137] border-b border-amber-500/20 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">📊</span>
              <h1 className="text-xl font-bold text-amber-400">{progetto.titolo}</h1>
            </div>
            <p className="text-sm text-amber-500/40 ml-10">Dashboard di progetto</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => esportaExcel(progetto)}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 hover:border-green-500/50 text-green-400 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              title="Esporta in Excel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Excel
            </button>
            <button
              onClick={() => esportaPDF(progetto)}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 hover:border-red-500/50 text-red-400 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              title="Esporta in PDF"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              PDF
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Progress globale */}
        <div className="bg-[#0d2137] rounded-xl border border-amber-500/20 p-5 shadow-lg shadow-amber-900/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-amber-300">Avanzamento Globale</h2>
            <span className="text-2xl font-bold text-amber-400">{progetto.percentuale}%</span>
          </div>
          <ProgressBar percentuale={progetto.percentuale} altezza="h-5" />
        </div>

        {/* Diagramma di flusso */}
        <div className="bg-[#0d2137] rounded-xl border border-amber-500/20 p-5 shadow-lg shadow-amber-900/10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-amber-300">
              Flusso della Struttura — {totaleNodi} {totaleNodi === 1 ? 'nodo' : 'nodi'} principali
            </h2>
            <p className="text-[11px] text-amber-500/30">
              Gestisci la struttura dall'Albero WBS
            </p>
          </div>

          {children.length === 0 ? (
            <div className="text-center py-12 text-amber-500/30">
              <p className="text-lg mb-2">Nessun elemento presente</p>
              <p className="text-sm">Vai nell'Albero WBS per creare la struttura</p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <div className="flex items-start gap-0 min-w-max px-2 py-4">
                {/* Nodo START */}
                <div className="flex items-center self-center mr-2">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center shadow-md">
                    <span className="text-amber-400 text-xs font-bold">START</span>
                  </div>
                  <div className="w-6 h-0.5 bg-amber-500/30" />
                  <svg className="w-4 h-4 text-amber-500/40 -ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                {/* Nodi principali */}
                {children.map((nodo, i) => (
                  <NodoFlusso
                    key={nodo.id}
                    nodo={nodo}
                    nodoIndex={i}
                    isLast={i === children.length - 1}
                  />
                ))}

                {/* Nodo END */}
                <div className="flex items-center self-center ml-2">
                  <div className="w-6 h-0.5 bg-amber-500/30" />
                  <div className="w-10 h-10 rounded-full bg-slate-700/50 border-2 border-slate-600 flex items-center justify-center shadow-md ml-1">
                    <span className="text-slate-400 text-xs font-bold">END</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-6 text-xs text-amber-500/40 justify-center pb-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Da fare</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <span>In corso</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span>Completato</span>
          </div>
        </div>
      </div>
    </div>
  )
}
