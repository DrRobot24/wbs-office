import { useState } from 'react'
import ProgressBar from './ProgressBar'

const badgeClassi = {
  'todo': 'bg-slate-200 text-slate-600',
  'in-progress': 'bg-amber-100 text-amber-700',
  'done': 'bg-green-100 text-green-700',
}

const badgeLabels = {
  'todo': 'Da fare',
  'in-progress': 'In corso',
  'done': 'Completato',
}

const statusColors = {
  'todo': 'border-slate-300 bg-slate-50',
  'in-progress': 'border-amber-300 bg-amber-50',
  'done': 'border-green-300 bg-green-50',
}

function calcolaStatoFase(fase) {
  if (!fase.tasks || fase.tasks.length === 0) return 'todo'
  if (fase.tasks.every(t => t.stato === 'done')) return 'done'
  if (fase.tasks.some(t => t.stato === 'in-progress' || t.stato === 'done')) return 'in-progress'
  return 'todo'
}

function StatCard({ label, valore, icona, colore }) {
  return (
    <div className={`rounded-xl border px-5 py-4 flex items-center gap-4 ${colore}`}>
      <span className="text-3xl">{icona}</span>
      <div>
        <p className="text-2xl font-bold text-slate-800">{valore}</p>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  )
}

/* ── Connettore verticale (freccia verso il basso) ── */
function VerticalConnector() {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="w-0.5 h-6 bg-slate-300" />
      <svg className="w-4 h-4 text-slate-400 -mt-1" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 3a1 1 0 011 1v10.586l3.293-3.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 111.414-1.414L9 14.586V4a1 1 0 011-1z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  )
}

/* ── Connettore orizzontale (freccia verso destra) ── */
function HorizontalConnector() {
  return (
    <div className="flex items-center px-1 shrink-0">
      <div className="h-0.5 w-6 bg-slate-300" />
      <svg className="w-4 h-4 text-slate-400 -ml-1" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  )
}

/* ── Nodo fase del diagramma di flusso (espandibile) ── */
function FaseNode({ fase, faseIndex, expanded, onToggle, direction }) {
  const statoFase = calcolaStatoFase(fase)

  const borderColor =
    statoFase === 'done'
      ? 'border-green-400'
      : statoFase === 'in-progress'
        ? 'border-amber-400'
        : 'border-slate-300'

  const headerBg =
    statoFase === 'done'
      ? 'bg-green-500'
      : statoFase === 'in-progress'
        ? 'bg-amber-500'
        : 'bg-slate-400'

  const shadowColor =
    statoFase === 'done'
      ? 'shadow-green-100'
      : statoFase === 'in-progress'
        ? 'shadow-amber-100'
        : 'shadow-slate-100'

  const completati = fase.tasks.filter(t => t.stato === 'done').length
  const inCorso = fase.tasks.filter(t => t.stato === 'in-progress').length
  const daFare = fase.tasks.filter(t => t.stato === 'todo').length

  const isHorizontal = direction === 'horizontal'

  return (
    <div
      className={`border-2 rounded-xl shadow-md overflow-hidden cursor-pointer
        transition-all duration-300 ease-in-out
        ${borderColor} ${shadowColor}
        ${isHorizontal
          ? (expanded ? 'min-w-[320px] max-w-[420px]' : 'min-w-[220px] max-w-[280px]')
          : 'w-full max-w-[520px]'
        }
        hover:shadow-lg`}
      onClick={onToggle}
    >
      {/* Header – sempre visibile */}
      <div className={`${headerBg} px-5 py-3 flex items-center gap-3`}>
        <span className="text-white text-xs font-bold bg-white/20 rounded-full px-2.5 py-0.5">
          Fase {faseIndex + 1}
        </span>
        <span className="text-white text-sm font-semibold truncate flex-1">
          {fase.titolo}
        </span>
        <span className="text-white/90 text-sm font-bold">{fase.percentuale}%</span>
        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-white/80 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Mini summary – sempre visibile sotto l'header */}
      <div className="px-5 py-2.5 flex items-center gap-4 bg-white/80 border-b border-slate-100">
        <ProgressBar percentuale={fase.percentuale} altezza="h-2" />
        <div className="flex items-center gap-3 text-[11px] font-medium shrink-0 ml-3">
          <span className="text-slate-500">{fase.tasks.length} task</span>
          <span className={`px-2 py-0.5 rounded-full ${badgeClassi[statoFase]}`}>
            {badgeLabels[statoFase]}
          </span>
        </div>
      </div>

      {/* Dettagli espandibili */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          expanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {/* Statistiche mini */}
        <div className="px-5 pt-3 pb-2 grid grid-cols-3 gap-2">
          <div className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
            <p className="text-lg font-bold text-slate-600">{daFare}</p>
            <p className="text-[10px] text-slate-400">Da fare</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-2 text-center border border-amber-100">
            <p className="text-lg font-bold text-amber-600">{inCorso}</p>
            <p className="text-[10px] text-amber-400">In corso</p>
          </div>
          <div className="bg-green-50 rounded-lg p-2 text-center border border-green-100">
            <p className="text-lg font-bold text-green-600">{completati}</p>
            <p className="text-[10px] text-green-400">Completati</p>
          </div>
        </div>

        {/* Lista task */}
        <div className="px-5 py-3 flex flex-col gap-1.5">
          {fase.tasks.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2 text-center">Nessun task presente</p>
          ) : (
            fase.tasks.map(task => (
              <div
                key={task.id}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs
                  ${statusColors[task.stato] || statusColors['todo']} border`}
                onClick={e => e.stopPropagation()}
              >
                <span>
                  {task.stato === 'done' ? '✅' : task.stato === 'in-progress' ? '🔄' : '⬜'}
                </span>
                <span className="flex-1 truncate font-medium text-slate-700">
                  {task.titolo}
                </span>
                {task.responsabile && (
                  <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
                    👤 {task.responsabile}
                  </span>
                )}
                {task.dataScadenza && (
                  <span className="text-[10px] text-slate-400">
                    📅 {task.dataScadenza}
                  </span>
                )}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${badgeClassi[task.stato]}`}
                >
                  {task.percentuale}%
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard({ progetto }) {
  const [expandedFasi, setExpandedFasi] = useState({})
  const [direction, setDirection] = useState('vertical') // 'vertical' | 'horizontal'

  const toggleFase = (faseId) => {
    setExpandedFasi(prev => ({ ...prev, [faseId]: !prev[faseId] }))
  }

  // Calcola statistiche
  const tuttiTask = progetto.fasi.flatMap(f => f.tasks)
  const totale = tuttiTask.length
  const completati = tuttiTask.filter(t => t.stato === 'done').length
  const inCorso = tuttiTask.filter(t => t.stato === 'in-progress').length
  const daFare = tuttiTask.filter(t => t.stato === 'todo').length
  const totaleFasi = progetto.fasi.length

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">📊</span>
          <h1 className="text-xl font-bold text-slate-800">{progetto.titolo}</h1>
        </div>
        <p className="text-sm text-slate-500 ml-10">Dashboard di progetto</p>
      </div>

      <div className="p-6 space-y-8">
        {/* Progress globale */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700">Avanzamento Globale</h2>
            <span className="text-2xl font-bold text-indigo-600">{progetto.percentuale}%</span>
          </div>
          <ProgressBar percentuale={progetto.percentuale} altezza="h-5" />
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Fasi totali" valore={totaleFasi} icona="📁" colore="bg-white border-slate-200" />
          <StatCard label="Task totali" valore={totale} icona="📋" colore="bg-white border-slate-200" />
          <StatCard label="Completati" valore={completati} icona="✅" colore="bg-green-50 border-green-200" />
          <StatCard label="In corso" valore={inCorso} icona="🔄" colore="bg-amber-50 border-amber-200" />
        </div>

        {/* Diagramma di flusso */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-slate-700">
              Diagramma di Flusso — Fasi del Progetto
            </h2>
            <div className="flex items-center gap-3">
              <p className="text-[11px] text-slate-400 hidden sm:block">Clicca su una fase per espanderla</p>
              {/* Toggle direzione */}
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                <button
                  onClick={() => setDirection('vertical')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all
                    ${direction === 'vertical'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                  title="Layout verticale"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span className="hidden sm:inline">Verticale</span>
                </button>
                <button
                  onClick={() => setDirection('horizontal')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all
                    ${direction === 'horizontal'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                  title="Layout orizzontale"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <span className="hidden sm:inline">Orizzontale</span>
                </button>
              </div>
            </div>
          </div>

          {progetto.fasi.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-lg mb-2">Nessuna fase presente</p>
              <p className="text-sm">Vai nell'Albero WBS per aggiungere le fasi</p>
            </div>
          ) : direction === 'vertical' ? (
            /* ── Layout VERTICALE ── */
            <div className="flex flex-col items-center py-4">
              {/* Nodo START */}
              <div className="w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg ring-4 ring-indigo-100">
                <span className="text-white text-xs font-bold">START</span>
              </div>

              {/* Nodi fase con connettori */}
              {progetto.fasi.map((fase, i) => (
                <div key={fase.id} className="flex flex-col items-center w-full max-w-[520px]">
                  <VerticalConnector />
                  <FaseNode
                    fase={fase}
                    faseIndex={i}
                    expanded={!!expandedFasi[fase.id]}
                    onToggle={() => toggleFase(fase.id)}
                    direction="vertical"
                  />
                </div>
              ))}

              {/* Connettore finale + Nodo END */}
              <VerticalConnector />
              <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center shadow-lg ring-4 ring-slate-200">
                <span className="text-white text-xs font-bold">END</span>
              </div>
            </div>
          ) : (
            /* ── Layout ORIZZONTALE ── */
            <div className="overflow-x-auto pb-4">
              <div className="flex items-start gap-0 min-w-max px-2 py-4">
                {/* Nodo START */}
                <div className="flex items-center self-center shrink-0">
                  <div className="w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg ring-4 ring-indigo-100">
                    <span className="text-white text-xs font-bold">START</span>
                  </div>
                </div>

                {/* Nodi fase con connettori orizzontali */}
                {progetto.fasi.map((fase, i) => (
                  <div key={fase.id} className="flex items-start shrink-0">
                    <HorizontalConnector />
                    <FaseNode
                      fase={fase}
                      faseIndex={i}
                      expanded={!!expandedFasi[fase.id]}
                      onToggle={() => toggleFase(fase.id)}
                      direction="horizontal"
                    />
                  </div>
                ))}

                {/* Connettore finale + Nodo END */}
                <HorizontalConnector />
                <div className="flex items-center self-center shrink-0">
                  <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center shadow-lg ring-4 ring-slate-200">
                    <span className="text-white text-xs font-bold">END</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-6 text-xs text-slate-500 justify-center pb-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-slate-300" />
            <span>Da fare</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <span>In corso</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Completato</span>
          </div>
        </div>
      </div>
    </div>
  )
}
