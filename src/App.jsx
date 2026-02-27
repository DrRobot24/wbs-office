import Sidebar from './components/Sidebar'
import WBSTree from './components/WBSTree'
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

  const progettoIndex = projects.findIndex(p => p.id === activeProjectId)

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={setActiveProjectId}
        onAggiungiProgetto={aggiungiProgetto}
        onEliminaProgetto={eliminaProgetto}
        onEsportaJSON={esportaJSON}
        onImportaJSON={importaJSON}
      />

      {/* Main Content */}
      {activeProject ? (
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
