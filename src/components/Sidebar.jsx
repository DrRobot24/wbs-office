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
    <aside className="w-64 flex flex-col min-h-screen" style={{ background: 'linear-gradient(180deg, #0f1b2e 0%, #162544 50%, #0f1b2e 100%)' }}>
      {/* Logo / Titolo */}
      <div className="px-5 py-6 border-b border-white/10">
        <h1 className="text-lg font-bold tracking-tight flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
            <span className="text-[#0f1b2e] font-extrabold text-xs">RS</span>
          </div>
          <div>
            <span className="text-white font-bold block leading-tight">WBS Office</span>
            <span className="text-[11px] text-slate-400 font-normal">Gestione Progetti</span>
          </div>
        </h1>
      </div>

      {/* Lista progetti */}
      <div className="flex-1 overflow-y-auto py-4">
        <p className="px-5 text-[10px] text-slate-500 uppercase tracking-widest mb-3 font-semibold">
          Progetti
        </p>
        {projects.map(p => (
          <div
            key={p.id}
            className={`flex items-center gap-2 px-5 py-2.5 cursor-pointer transition-all duration-200 group ${
              p.id === activeProjectId
                ? 'bg-amber-400/10 border-l-[3px] border-amber-400 text-white'
                : 'text-slate-400 hover:bg-white/5 hover:text-white border-l-[3px] border-transparent'
            }`}
            onClick={() => onSelectProject(p.id)}
          >
            <span className="flex-1 text-sm truncate font-medium">{p.titolo}</span>
            <span className={`text-xs font-semibold ${p.id === activeProjectId ? 'text-amber-400' : 'text-slate-500'}`}>{p.percentuale}%</span>
            <button
              onClick={e => {
                e.stopPropagation()
                if (confirm(`Eliminare "${p.titolo}"?`)) {
                  onEliminaProgetto(p.id)
                }
              }}
              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs cursor-pointer transition-opacity"
              title="Elimina progetto"
            >
              ✕
            </button>
          </div>
        ))}

        {projects.length === 0 && (
          <p className="px-5 text-xs text-slate-600 italic py-4">
            Nessun progetto
          </p>
        )}
      </div>

      {/* Azioni in basso */}
      <div className="p-4 border-t border-white/10 flex flex-col gap-2.5">
        <button
          onClick={onAggiungiProgetto}
          className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-[#0f1b2e] rounded-lg text-sm font-bold transition-all cursor-pointer shadow-md shadow-amber-500/20 hover:shadow-amber-500/30"
        >
          + Nuovo Progetto
        </button>
        <div className="flex gap-2">
          <button
            onClick={onEsportaJSON}
            className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-all cursor-pointer"
            title="Esporta tutti i progetti in JSON"
          >
            💾 Esporta
          </button>
          <button
            onClick={handleImport}
            className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-all cursor-pointer"
            title="Importa progetti da file JSON"
          >
            📂 Importa
          </button>
        </div>
      </div>
    </aside>
  )
}
