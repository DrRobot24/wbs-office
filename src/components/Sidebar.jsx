import { useAuth } from '../lib/AuthContext'

export default function Sidebar({
  projects,
  activeProjectId,
  onSelectProject,
  onAggiungiProgetto,
  onEliminaProgetto,
  onEsportaJSON,
  onImportaJSON,
}) {
  const { user, profile, cloud, signOut } = useAuth()
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
    <aside className="w-64 flex flex-col min-h-screen bg-white border-r border-gray-300 shadow-sm">
      {/* Logo / Titolo */}
      <div className="px-5 py-6 border-b border-gray-300">
        <h1 className="text-lg font-bold tracking-tight flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
            <span className="text-white font-extrabold text-xs">RS</span>
          </div>
          <div>
            <span className="text-gray-800 font-bold block leading-tight">WBS Office</span>
            <span className="text-[11px] text-gray-400 font-normal">Gestione Progetti</span>
          </div>
        </h1>
      </div>

      {/* Lista progetti */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-5 flex items-center justify-between mb-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
            Progetti
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={onEsportaJSON}
              className="w-6 h-6 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 text-[11px] cursor-pointer transition-all"
              title="Esporta JSON"
            >
              💾
            </button>
            <button
              onClick={handleImport}
              className="w-6 h-6 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 text-[11px] cursor-pointer transition-all"
              title="Importa JSON"
            >
              📂
            </button>
          </div>
        </div>

        <div className="px-4 mb-3">
          <button
            onClick={onAggiungiProgetto}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-lg text-sm font-bold transition-all cursor-pointer shadow-md shadow-amber-500/20 hover:shadow-amber-500/30"
          >
            + Nuovo Progetto
          </button>
        </div>

        {projects.map(p => (
          <div
            key={p.id}
            className={`flex items-center gap-2 px-5 py-2.5 cursor-pointer transition-all duration-200 group ${
              p.id === activeProjectId
                ? 'bg-amber-50 border-l-[3px] border-amber-500 text-gray-800'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 border-l-[3px] border-transparent'
            }`}
            onClick={() => onSelectProject(p.id)}
          >
            <span className="flex-1 text-sm truncate font-medium">{p.titolo}</span>
            <span className={`text-xs font-semibold ${p.id === activeProjectId ? 'text-amber-600' : 'text-gray-400'}`}>{p.percentuale}%</span>
            <button
              onClick={e => {
                e.stopPropagation()
                if (confirm(`Eliminare "${p.titolo}"?`)) {
                  onEliminaProgetto(p.id)
                }
              }}
              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 text-xs cursor-pointer transition-opacity"
              title="Elimina progetto"
            >
              ✕
            </button>
          </div>
        ))}

        {projects.length === 0 && (
          <p className="px-5 text-xs text-gray-400 italic py-4">
            Nessun progetto
          </p>
        )}
      </div>

      {/* Footer — Utente e stato cloud */}
      <div className="p-4 border-t border-gray-300 flex flex-col gap-2">
        {/* Profilo utente */}
        {cloud && user && (
          <div className="flex items-center gap-2.5 py-2 px-3 rounded-lg bg-gray-50 border border-gray-300">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 text-[10px] font-bold text-white">
              {(profile?.full_name || user.email || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              {profile?.full_name && (
                <p className="text-xs text-gray-700 font-medium truncate leading-tight">{profile.full_name}</p>
              )}
              <p className="text-[10px] text-gray-400 truncate leading-tight">{user.email}</p>
            </div>
            <button
              onClick={signOut}
              className="text-[10px] text-gray-400 hover:text-red-500 cursor-pointer transition-colors shrink-0"
              title="Disconnetti"
            >
              Esci
            </button>
          </div>
        )}
        {/* Cloud status */}
        <div className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg bg-gray-50 border border-gray-300">
          {cloud && user ? (
            <>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-green-600 font-medium flex-1">Cloud sync attivo</span>
            </>
          ) : cloud ? (
            <>
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-[10px] text-yellow-600 font-medium">Cloud pronto — login richiesto</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <span className="text-[10px] text-gray-400 font-medium">Modalità offline</span>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
