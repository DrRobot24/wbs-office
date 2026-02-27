import { useState } from 'react'
import TaskRow from './TaskRow'
import ProgressBar from './ProgressBar'
import { generaWbsCode } from '../utils/wbsCode'

export default function FaseRow({
  fase,
  faseIndex,
  progettoIndex,
  onTaskClick,
  onAggiungiTask,
  onEliminaFase,
  onRinominaFase,
}) {
  const [aperta, setAperta] = useState(true)
  const [editing, setEditing] = useState(false)
  const [titoloTemp, setTitoloTemp] = useState(fase.titolo)

  const wbsCodeFase = generaWbsCode(progettoIndex, faseIndex)

  const handleRinomina = () => {
    if (titoloTemp.trim()) {
      onRinominaFase(fase.id, titoloTemp.trim())
    } else {
      setTitoloTemp(fase.titolo)
    }
    setEditing(false)
  }

  return (
    <div className="mb-4">
      {/* Header Fase */}
      <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-4 py-3">
        {/* Freccia collassa */}
        <button
          onClick={() => setAperta(!aperta)}
          className="text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer"
          title={aperta ? 'Comprimi' : 'Espandi'}
        >
          <svg
            className={`w-4 h-4 transition-transform ${aperta ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Codice WBS Fase */}
        <span className="font-mono text-xs text-slate-400">{wbsCodeFase}</span>

        {/* Titolo Fase (editabile con doppio click) */}
        {editing ? (
          <input
            value={titoloTemp}
            onChange={e => setTitoloTemp(e.target.value)}
            onBlur={handleRinomina}
            onKeyDown={e => e.key === 'Enter' && handleRinomina()}
            className="flex-1 bg-white border border-indigo-300 rounded px-2 py-0.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            autoFocus
          />
        ) : (
          <span
            className="flex-1 text-sm font-semibold text-slate-700 cursor-pointer"
            onDoubleClick={() => {
              setTitoloTemp(fase.titolo)
              setEditing(true)
            }}
            title="Doppio click per rinominare"
          >
            {fase.titolo}
          </span>
        )}

        {/* Progress mini */}
        <div className="w-24">
          <ProgressBar percentuale={fase.percentuale} altezza="h-2" />
        </div>
        <span className="text-xs font-semibold text-slate-500 min-w-[36px] text-right">
          {fase.percentuale}%
        </span>

        {/* Pulsante aggiungi task */}
        <button
          onClick={onAggiungiTask}
          className="text-xs text-indigo-500 hover:text-indigo-700 font-medium cursor-pointer"
          title="Aggiungi Task"
        >
          + Task
        </button>

        {/* Pulsante elimina fase */}
        <button
          onClick={onEliminaFase}
          className="text-xs text-red-400 hover:text-red-600 cursor-pointer"
          title="Elimina Fase"
        >
          ✕
        </button>
      </div>

      {/* Lista Task */}
      {aperta && (
        <div className="flex flex-col gap-1.5 mt-1.5">
          {fase.tasks.length === 0 && (
            <p className="text-xs text-slate-400 ml-12 py-2 italic">
              Nessun task. Clicca "+ Task" per aggiungerne uno.
            </p>
          )}
          {fase.tasks.map((task, taskIndex) => (
            <TaskRow
              key={task.id}
              task={task}
              wbsCode={generaWbsCode(progettoIndex, faseIndex, taskIndex)}
              onClick={() => onTaskClick(fase.id, task)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
