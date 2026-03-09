import { useState, useEffect } from 'react'

const statiOptions = [
  { value: 'todo', label: 'Da fare' },
  { value: 'in-progress', label: 'In corso' },
  { value: 'done', label: 'Completato' },
]

const prioritaOptions = [
  { value: 'bassa', label: 'Bassa' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
]

/* ─── Componente riga materiale ─── */
function MaterialeRow({ mat, index, onChange, onRemove }) {
  return (
    <div className="flex items-start gap-2 bg-[#091a2a] rounded-lg p-2.5 border border-amber-500/10">
      <div className="flex-1 grid grid-cols-2 gap-2">
        <input
          type="text"
          value={mat.descrizione}
          onChange={e => onChange(index, 'descrizione', e.target.value)}
          className="bg-[#0a1628] border border-amber-500/20 rounded px-2 py-1.5 text-xs text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400/50 col-span-2"
          placeholder="Materiale / Articolo"
        />
        <input
          type="text"
          value={mat.quantita}
          onChange={e => onChange(index, 'quantita', e.target.value)}
          className="bg-[#0a1628] border border-amber-500/20 rounded px-2 py-1.5 text-xs text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
          placeholder="Qtà (es: 50 mq)"
        />
        <input
          type="text"
          value={mat.fornitore}
          onChange={e => onChange(index, 'fornitore', e.target.value)}
          className="bg-[#0a1628] border border-amber-500/20 rounded px-2 py-1.5 text-xs text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
          placeholder="Fornitore"
        />
        <input
          type="number"
          step="0.01"
          value={mat.costo}
          onChange={e => onChange(index, 'costo', e.target.value)}
          className="bg-[#0a1628] border border-amber-500/20 rounded px-2 py-1.5 text-xs text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
          placeholder="Costo €"
        />
        <select
          value={mat.statoOrdine || 'da-ordinare'}
          onChange={e => onChange(index, 'statoOrdine', e.target.value)}
          className="bg-[#0a1628] border border-amber-500/20 rounded px-2 py-1.5 text-xs text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
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
      >×</button>
    </div>
  )
}

/* ─── Sezione collassabile ─── */
function Sezione({ titolo, icona, children, defaultOpen = true }) {
  const [aperta, setAperta] = useState(defaultOpen)
  return (
    <div className="border border-amber-500/15 rounded-lg overflow-hidden">
      <button
        onClick={() => setAperta(!aperta)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-[#091a2a] hover:bg-[#0a1e30] text-amber-300/80 text-xs font-semibold cursor-pointer transition-colors"
      >
        <span>{icona}</span>
        <span className="flex-1 text-left">{titolo}</span>
        <svg className={`w-3 h-3 transition-transform ${aperta ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {aperta && <div className="p-3 space-y-3">{children}</div>}
    </div>
  )
}

/* ─── Input con label ─── */
const inputCls = "w-full bg-[#0a1628] border border-amber-500/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm text-amber-300"
const labelCls = "block mb-1 text-xs font-medium text-amber-300/60"

export default function TaskModal({ task, onSave, onDelete, onClose }) {
  const isEdit = !!task?.id
  const [form, setForm] = useState({
    titolo: '',
    responsabile: '',
    dataScadenza: '',
    stato: 'todo',
    percentuale: 0,
    // Nuovi campi
    priorita: 'media',
    costoTotale: '',
    dataInizio: '',
    materiali: [],
    note: '',
  })
  const [errore, setErrore] = useState('')
  const [tab, setTab] = useState('generale') // 'generale' | 'materiali' | 'note'

  useEffect(() => {
    if (task) {
      setForm({
        titolo: task.titolo || '',
        responsabile: task.responsabile || '',
        dataScadenza: task.dataScadenza || '',
        stato: task.stato || 'todo',
        percentuale: task.percentuale || 0,
        priorita: task.priorita || 'media',
        costoTotale: task.costoTotale ?? '',
        dataInizio: task.dataInizio || '',
        materiali: task.materiali ? JSON.parse(JSON.stringify(task.materiali)) : [],
        note: task.note || '',
      })
    }
  }, [task])

  const handleChange = (campo, valore) => {
    setForm(prev => ({ ...prev, [campo]: valore }))
    if (campo === 'titolo' && valore.trim()) setErrore('')
  }

  // ─── Gestione materiali ───
  const aggiungiMateriale = () => {
    setForm(prev => ({
      ...prev,
      materiali: [...prev.materiali, {
        descrizione: '',
        quantita: '',
        fornitore: '',
        costo: '',
        statoOrdine: 'da-ordinare',
      }],
    }))
  }

  const aggiornaMateriale = (index, campo, valore) => {
    setForm(prev => ({
      ...prev,
      materiali: prev.materiali.map((m, i) =>
        i === index ? { ...m, [campo]: valore } : m
      ),
    }))
  }

  const rimuoviMateriale = (index) => {
    setForm(prev => ({
      ...prev,
      materiali: prev.materiali.filter((_, i) => i !== index),
    }))
  }

  // ─── Calcolo costo materiali ───
  const costoMateriali = form.materiali.reduce((acc, m) => acc + (parseFloat(m.costo) || 0), 0)

  const handleSave = () => {
    if (!form.titolo.trim()) {
      setErrore('Il titolo è obbligatorio')
      setTab('generale')
      return
    }
    onSave({
      ...form,
      percentuale: Math.max(0, Math.min(100, Number(form.percentuale) || 0)),
      costoTotale: form.costoTotale !== '' ? parseFloat(form.costoTotale) || 0 : '',
    })
  }

  const tabCls = (t) =>
    `px-3 py-1.5 text-xs font-medium rounded-t-lg cursor-pointer transition-colors ${
      tab === t
        ? 'bg-[#0d2137] text-amber-400 border border-amber-500/30 border-b-[#0d2137] -mb-px'
        : 'text-amber-500/40 hover:text-amber-400'
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-[#0d2137] border border-amber-500/30 rounded-xl shadow-2xl shadow-amber-900/20 w-full max-w-lg mx-4 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="px-5 pt-5 pb-3 border-b border-amber-500/15">
          <h2 className="text-lg font-bold text-amber-400">
            {isEdit ? '✏️ Modifica Elemento' : '➕ Nuovo Elemento'}
          </h2>
          <p className="text-[11px] text-amber-500/40 mt-0.5">
            Compila le informazioni per questa voce della WBS
          </p>
        </div>

        {/* ── Tabs ── */}
        <div className="shrink-0 bg-[#091a2a] px-5 flex gap-1 pt-2 border-b border-amber-500/10">
          <button className={tabCls('generale')} onClick={() => setTab('generale')}>
            📋 Generale
          </button>
          <button className={tabCls('materiali')} onClick={() => setTab('materiali')}>
            📦 Materiali & Costi
            {form.materiali.length > 0 && (
              <span className="ml-1.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {form.materiali.length}
              </span>
            )}
          </button>
          <button className={tabCls('note')} onClick={() => setTab('note')}>
            📝 Note
          </button>
        </div>

        {/* ── Body (scrollabile) ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* ═══ TAB GENERALE ═══ */}
          {tab === 'generale' && (
            <>
              {/* Titolo */}
              <div>
                <label className={labelCls}>
                  Titolo <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.titolo}
                  onChange={e => handleChange('titolo', e.target.value)}
                  className={inputCls}
                  placeholder="Es: Demolizione pareti interne"
                  autoFocus
                />
                {errore && <p className="text-red-400 text-xs mt-1">{errore}</p>}
              </div>

              {/* Stakeholder */}
              <div>
                <label className={labelCls}>Stakeholder</label>
                <input
                  type="text"
                  value={form.responsabile}
                  onChange={e => handleChange('responsabile', e.target.value)}
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
                    onChange={e => handleChange('dataInizio', e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Data Scadenza</label>
                  <input
                    type="date"
                    value={form.dataScadenza}
                    onChange={e => handleChange('dataScadenza', e.target.value)}
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
                    onChange={e => handleChange('stato', e.target.value)}
                    className={inputCls}
                  >
                    {statiOptions.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
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
                      onChange={e => handleChange('percentuale', Number(e.target.value))}
                      className="flex-1 h-2 accent-amber-400"
                    />
                    <span className="text-amber-400 text-sm font-bold w-10 text-right">{form.percentuale}%</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ═══ TAB MATERIALI & COSTI ═══ */}
          {tab === 'materiali' && (
            <>
              {/* Costo complessivo fase */}
              <Sezione titolo="Budget Complessivo" icona="💰" defaultOpen={true}>
                <div>
                  <label className={labelCls}>Costo previsto per questa voce (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.costoTotale}
                    onChange={e => handleChange('costoTotale', e.target.value)}
                    className={inputCls}
                    placeholder="Es: 15000.00"
                  />
                </div>
                {form.materiali.length > 0 && (
                  <div className="flex items-center justify-between bg-[#091a2a] rounded-lg px-3 py-2 border border-amber-500/10">
                    <span className="text-xs text-amber-500/50">Totale materiali inseriti:</span>
                    <span className="text-sm font-bold text-amber-400">
                      € {costoMateriali.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </Sezione>

              {/* Lista materiali */}
              <Sezione titolo={`Materiali da ordinare (${form.materiali.length})`} icona="📦" defaultOpen={true}>
                <div className="space-y-2">
                  {form.materiali.length === 0 && (
                    <p className="text-xs text-amber-500/30 italic py-2 text-center">
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
                  className="w-full py-2 text-xs font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-dashed border-amber-500/30 rounded-lg cursor-pointer transition-colors"
                >
                  + Aggiungi materiale
                </button>
              </Sezione>
            </>
          )}

          {/* ═══ TAB NOTE ═══ */}
          {tab === 'note' && (
            <>
              <div>
                <label className={labelCls}>Note libere</label>
                <textarea
                  value={form.note}
                  onChange={e => handleChange('note', e.target.value)}
                  className={`${inputCls} min-h-[200px] resize-y`}
                  placeholder={"Appunti, promemoria, specifiche tecniche, riferimenti normativi...\n\nEs:\n- Verificare conformità normativa impianti\n- Contattare geom. Rossi per rilievi\n- Attesa conferma preventivo fornitore XY"}
                />
                <p className="text-[10px] text-amber-500/25 mt-1 text-right">
                  {form.note.length} caratteri
                </p>
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 px-5 py-3 border-t border-amber-500/15 flex items-center justify-between bg-[#091a2a] rounded-b-xl">
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
              className="px-4 py-2 text-sm rounded-lg bg-slate-700/50 hover:bg-slate-700 text-amber-500/50 hover:text-amber-400 border border-amber-500/20 cursor-pointer"
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-sm rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-400 font-semibold cursor-pointer"
            >
              💾 Salva
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
