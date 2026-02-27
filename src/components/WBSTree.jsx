import { useState } from 'react'
import FaseRow from './FaseRow'
import TaskModal from './TaskModal'
import ProgressBar from './ProgressBar'

export default function WBSTree({
  progetto,
  progettoIndex,
  onAggiungiFase,
  onEliminaFase,
  onRinominaFase,
  onAggiungiTask,
  onAggiornaTask,
  onEliminaTask,
  onRinominaProgetto,
}) {
  // Modal state
  const [modal, setModal] = useState(null) // { faseId, task? }
  const [editingTitle, setEditingTitle] = useState(false)
  const [titoloTemp, setTitoloTemp] = useState(progetto.titolo)

  const handleTitleSave = () => {
    if (titoloTemp.trim()) {
      onRinominaProgetto(progetto.id, titoloTemp.trim())
    } else {
      setTitoloTemp(progetto.titolo)
    }
    setEditingTitle(false)
  }

  const handleTaskSave = (taskData) => {
    if (modal.task) {
      // Modifica
      onAggiornaTask(progetto.id, modal.faseId, modal.task.id, taskData)
    } else {
      // Creazione
      onAggiungiTask(progetto.id, modal.faseId, taskData)
    }
    setModal(null)
  }

  const handleTaskDelete = () => {
    if (modal?.task) {
      onEliminaTask(progetto.id, modal.faseId, modal.task.id)
    }
    setModal(null)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header del progetto */}
      <div className="p-6 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">📊</span>
          {editingTitle ? (
            <input
              value={titoloTemp}
              onChange={e => setTitoloTemp(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={e => e.key === 'Enter' && handleTitleSave()}
              className="text-xl font-bold text-slate-800 bg-white border border-indigo-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 flex-1"
              autoFocus
            />
          ) : (
            <h1
              className="text-xl font-bold text-slate-800 cursor-pointer"
              onDoubleClick={() => {
                setTitoloTemp(progetto.titolo)
                setEditingTitle(true)
              }}
              title="Doppio click per rinominare"
            >
              {progetto.titolo}
            </h1>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <ProgressBar percentuale={progetto.percentuale} altezza="h-4" />
          </div>
          <span className="text-sm font-bold text-indigo-600 min-w-[48px] text-right">
            {progetto.percentuale}%
          </span>
        </div>
      </div>

      {/* Albero WBS */}
      <div className="flex-1 overflow-y-auto p-6">
        {progetto.fasi.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-lg mb-2">Nessuna fase presente</p>
            <p className="text-sm">Clicca "Aggiungi Fase" per iniziare a costruire la WBS</p>
          </div>
        )}

        {progetto.fasi.map((fase, faseIndex) => (
          <FaseRow
            key={fase.id}
            fase={fase}
            faseIndex={faseIndex}
            progettoIndex={progettoIndex}
            onTaskClick={(faseId, task) => setModal({ faseId, task })}
            onAggiungiTask={() => setModal({ faseId: fase.id, task: null })}
            onEliminaFase={() => onEliminaFase(progetto.id, fase.id)}
            onRinominaFase={(faseId, nuovoTitolo) =>
              onRinominaFase(progetto.id, faseId, nuovoTitolo)
            }
          />
        ))}

        {/* Pulsante Aggiungi Fase */}
        <button
          onClick={() => onAggiungiFase(progetto.id)}
          className="mt-4 w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors text-sm font-medium cursor-pointer"
        >
          + Aggiungi Fase
        </button>
      </div>

      {/* Modale Task */}
      {modal && (
        <TaskModal
          task={modal.task}
          onSave={handleTaskSave}
          onDelete={handleTaskDelete}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
