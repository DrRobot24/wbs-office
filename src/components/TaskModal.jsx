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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          {isEdit ? 'Modifica Task' : 'Nuovo Task'}
        </h2>

        {/* Titolo */}
        <label className="block mb-1 text-sm font-medium text-slate-600">
          Titolo <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.titolo}
          onChange={e => handleChange('titolo', e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
          placeholder="Titolo del task"
          autoFocus
        />
        {errore && <p className="text-red-500 text-xs mb-2">{errore}</p>}

        {/* Responsabile */}
        <label className="block mb-1 mt-3 text-sm font-medium text-slate-600">
          Responsabile
        </label>
        <input
          type="text"
          value={form.responsabile}
          onChange={e => handleChange('responsabile', e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
          placeholder="Nome responsabile"
        />

        {/* Data Scadenza */}
        <label className="block mb-1 mt-3 text-sm font-medium text-slate-600">
          Data Scadenza
        </label>
        <input
          type="date"
          value={form.dataScadenza}
          onChange={e => handleChange('dataScadenza', e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
        />

        {/* Stato */}
        <label className="block mb-1 mt-3 text-sm font-medium text-slate-600">
          Stato
        </label>
        <select
          value={form.stato}
          onChange={e => handleChange('stato', e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
        >
          {statiOptions.map(s => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Percentuale */}
        <label className="block mb-1 mt-3 text-sm font-medium text-slate-600">
          Percentuale (0–100)
        </label>
        <input
          type="number"
          min="0"
          max="100"
          value={form.percentuale}
          onChange={e => handleChange('percentuale', e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
        />

        {/* Azioni */}
        <div className="flex items-center justify-between mt-6">
          <div>
            {isEdit && (
              <button
                onClick={onDelete}
                className="text-sm text-red-500 hover:text-red-700 font-medium cursor-pointer"
              >
                Elimina
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium cursor-pointer"
            >
              Salva
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
