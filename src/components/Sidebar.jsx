export default function Sidebar({
  projects,
  activeProjectId,
  onSelectProject,
  onAggiungiProgetto,
  onEliminaProgetto,
  onEsportaJSON,
  onImportaJSON,
}) {
  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files?.[0]
      if (file) onImportaJSON(file)
    }
    input.click()
  }

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
      {/* Logo / Titolo */}
      <div className="px-5 py-5 border-b border-slate-700">
        <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
          <span>📊</span> WBS Office
        </h1>
        <p className="text-xs text-slate-400 mt-1">Work Breakdown Structure</p>
      </div>

      {/* Lista progetti */}
      <div className="flex-1 overflow-y-auto py-3">
        <p className="px-5 text-xs text-slate-500 uppercase tracking-wider mb-2 font-medium">
          Progetti
        </p>
        {projects.map(p => (
          <div
            key={p.id}
            className={`flex items-center gap-2 px-5 py-2.5 cursor-pointer transition-colors group ${
              p.id === activeProjectId
                ? 'bg-indigo-600/30 border-r-2 border-indigo-400 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
            onClick={() => onSelectProject(p.id)}
          >
            <span className="flex-1 text-sm truncate">{p.titolo}</span>
            <span className="text-xs text-slate-500">{p.percentuale}%</span>
            <button
              onClick={e => {
                e.stopPropagation()
                if (confirm(`Eliminare "${p.titolo}"?`)) {
                  onEliminaProgetto(p.id)
                }
              }}
              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs cursor-pointer"
              title="Elimina progetto"
            >
              ✕
            </button>
          </div>
        ))}

        {projects.length === 0 && (
          <p className="px-5 text-xs text-slate-500 italic py-4">
            Nessun progetto
          </p>
        )}
      </div>

      {/* Azioni in basso */}
      <div className="p-4 border-t border-slate-700 flex flex-col gap-2">
        <button
          onClick={onAggiungiProgetto}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          + Nuovo Progetto
        </button>
        <div className="flex gap-2">
          <button
            onClick={onEsportaJSON}
            className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs transition-colors cursor-pointer"
            title="Esporta tutti i progetti in JSON"
          >
            💾 Esporta
          </button>
          <button
            onClick={handleImport}
            className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs transition-colors cursor-pointer"
            title="Importa progetti da file JSON"
          >
            📂 Importa
          </button>
        </div>
      </div>
    </aside>
  )
}
