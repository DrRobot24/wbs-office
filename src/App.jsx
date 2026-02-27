import { useState } from 'react'
import Sidebar from './components/Sidebar'
import WBSTree from './components/WBSTree'
import Dashboard from './components/Dashboard'
import { useProjects } from './hooks/useProjects'

export default function App() {
  const {
    projects,
    activeProject,
    activeProjectId,
    setActiveProjectId,
    aggiungiProgetto,
    eliminaProgetto,
    rinominaProgetto,
    aggiungiFase,
    eliminaFase,
    rinominaFase,
    aggiungiTask,
    aggiornaTask,
    eliminaTask,
    esportaJSON,
    importaJSON,
  } = useProjects()

  const [vista, setVista] = useState('dashboard') // 'dashboard' | 'wbs'
  const progettoIndex = projects.findIndex(p => p.id === activeProjectId)

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={(id) => { setActiveProjectId(id); setVista('dashboard') }}
        onAggiungiProgetto={aggiungiProgetto}
        onEliminaProgetto={eliminaProgetto}
        onEsportaJSON={esportaJSON}
        onImportaJSON={importaJSON}
      />

      {/* Main Content */}
      {activeProject ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Navigation */}
          <div className="bg-white border-b border-slate-200 px-6 flex gap-1 pt-2">
            <button
              onClick={() => setVista('dashboard')}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors cursor-pointer ${
                vista === 'dashboard'
                  ? 'bg-slate-50 text-indigo-600 border border-slate-200 border-b-slate-50 -mb-px'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setVista('wbs')}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors cursor-pointer ${
                vista === 'wbs'
                  ? 'bg-slate-50 text-indigo-600 border border-slate-200 border-b-slate-50 -mb-px'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              🌳 Albero WBS
            </button>
          </div>

          {/* Vista attiva */}
          {vista === 'dashboard' ? (
            <Dashboard progetto={activeProject} />
          ) : (
            <WBSTree
              progetto={activeProject}
              progettoIndex={progettoIndex}
              onAggiungiFase={aggiungiFase}
              onEliminaFase={eliminaFase}
              onRinominaFase={rinominaFase}
              onAggiungiTask={aggiungiTask}
              onAggiornaTask={aggiornaTask}
              onEliminaTask={eliminaTask}
              onRinominaProgetto={rinominaProgetto}
            />
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <div className="text-center">
            <p className="text-5xl mb-4">📊</p>
            <p className="text-lg font-medium">WBS Office</p>
            <p className="text-sm mt-1">
              Seleziona o crea un progetto per iniziare
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
