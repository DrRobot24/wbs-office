import { useState, useEffect } from 'react'

const statiOptions = [
  { value: 'todo', label: 'Da fare' },
  { value: 'in-progress', label: 'In corso' },
  { value: 'done', label: 'Completato' },
]

export default function TaskModal({ task, onSave, onDelete, onClose }) {
  const isEdit = !!task?.id
  const [form, setForm] = useState({
    titolo: '',
    responsabile: '',
    dataScadenza: '',
    stato: 'todo',
    percentuale: 0,
  })
  const [errore, setErrore] = useState('')

  useEffect(() => {
    if (task) {
      setForm({
        titolo: task.titolo || '',
        responsabile: task.responsabile || '',
        dataScadenza: task.dataScadenza || '',
        stato: task.stato || 'todo',
        percentuale: task.percentuale || 0,
      })
    }
  }, [task])

  const handleChange = (campo, valore) => {
    setForm(prev => ({ ...prev, [campo]: valore }))
    if (campo === 'titolo' && valore.trim()) setErrore('')
  }

  const handleSave = () => {
    if (!form.titolo.trim()) {
      setErrore('Il titolo è obbligatorio')
      return
    }
    onSave({
      ...form,
      percentuale: Math.max(0, Math.min(100, Number(form.percentuale) || 0)),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#0d2137] border border-amber-500/30 rounded-xl shadow-2xl shadow-amber-900/20 w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-bold text-amber-400 mb-4">
          {isEdit ? 'Modifica Task' : 'Nuovo Task'}
        </h2>

        {/* Titolo */}
        <label className="block mb-1 text-sm font-medium text-amber-300/70">
          Titolo <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={form.titolo}
          onChange={e => handleChange('titolo', e.target.value)}
          className="w-full bg-[#0a1628] border border-amber-500/30 rounded-lg px-3 py-2 mb-1 focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm text-amber-300"
          placeholder="Titolo del task"
          autoFocus
        />
        {errore && <p className="text-red-400 text-xs mb-2">{errore}</p>}

        {/* Responsabile */}
        <label className="block mb-1 mt-3 text-sm font-medium text-amber-300/70">
          Responsabile
        </label>
        <input
          type="text"
          value={form.responsabile}
          onChange={e => handleChange('responsabile', e.target.value)}
          className="w-full bg-[#0a1628] border border-amber-500/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm text-amber-300"
          placeholder="Nome responsabile"
        />

        {/* Data Scadenza */}
        <label className="block mb-1 mt-3 text-sm font-medium text-amber-300/70">
          Data Scadenza
        </label>
        <input
          type="date"
          value={form.dataScadenza}
          onChange={e => handleChange('dataScadenza', e.target.value)}
          className="w-full bg-[#0a1628] border border-amber-500/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm text-amber-300"
        />

        {/* Stato */}
        <label className="block mb-1 mt-3 text-sm font-medium text-amber-300/70">
          Stato
        </label>
        <select
          value={form.stato}
          onChange={e => handleChange('stato', e.target.value)}
          className="w-full bg-[#0a1628] border border-amber-500/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm text-amber-300"
        >
          {statiOptions.map(s => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Percentuale */}
        <label className="block mb-1 mt-3 text-sm font-medium text-amber-300/70">
          Percentuale (0–100)
        </label>
        <input
          type="number"
          min="0"
          max="100"
          value={form.percentuale}
          onChange={e => handleChange('percentuale', e.target.value)}
          className="w-full bg-[#0a1628] border border-amber-500/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm text-amber-300"
        />

        {/* Azioni */}
        <div className="flex items-center justify-between mt-6">
          <div>
            {isEdit && (
              <button
                onClick={onDelete}
                className="text-sm text-red-400 hover:text-red-300 font-medium cursor-pointer"
              >
                Elimina
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg bg-slate-700/50 hover:bg-slate-700 text-amber-500/50 hover:text-amber-400 border border-amber-500/20 cursor-pointer"
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-400 font-medium cursor-pointer"
            >
              Salva
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
