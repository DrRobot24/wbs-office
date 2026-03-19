import { useState } from "react";
import Sidebar from "./components/Sidebar";
import WBSTree from "./components/WBSTree";
import Dashboard from "./components/Dashboard";
import CostiManagement from "./components/CostiManagement";
import GanttChart from "./components/GanttChart";
import LoginPage from "./components/LoginPage";
import { useProjects } from "./hooks/useProjects";
import { useAuth } from "./lib/AuthContext";

export default function App() {
  const { user, loading, cloud } = useAuth();

  const {
    projects,
    activeProject,
    activeProjectId,
    setActiveProjectId,
    aggiungiProgetto,
    eliminaProgetto,
    rinominaProgetto,
    aggiungiNodo,
    eliminaNodo,
    rinominaNodo,
    aggiornaNodo,
    spostaNodo,
    spostaNodoLaterale,
    promuoviNodo,
    declassaNodo,
    esportaJSON,
    importaJSON,
  } = useProjects();

  const [vista, setVista] = useState("dashboard"); // 'dashboard' | 'wbs' | 'costi' | 'gantt'

  // Se Supabase è configurato e non c'è utente → mostra login
  if (cloud && !user) {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-white font-extrabold text-lg">RS</span>
            </div>
            <p className="text-amber-600 text-sm">Caricamento...</p>
          </div>
        </div>
      );
    }
    return <LoginPage />;
  }
  const progettoIndex = projects.findIndex((p) => p.id === activeProjectId);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={(id) => {
          setActiveProjectId(id);
          setVista("dashboard");
        }}
        onAggiungiProgetto={aggiungiProgetto}
        onEliminaProgetto={eliminaProgetto}
        onEsportaJSON={esportaJSON}
        onImportaJSON={importaJSON}
      />

      {/* Main Content */}
      {activeProject ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Navigation */}
          <div className="bg-white border-b border-gray-300 px-6 flex gap-1 pt-2">
            <button
              onClick={() => setVista("dashboard")}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors cursor-pointer ${
                vista === "dashboard"
                  ? "bg-gray-50 text-amber-600 border border-gray-300 border-b-gray-50 -mb-px"
                  : "text-gray-400 hover:text-amber-600"
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setVista("wbs")}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors cursor-pointer ${
                vista === "wbs"
                  ? "bg-gray-50 text-amber-600 border border-gray-300 border-b-gray-50 -mb-px"
                  : "text-gray-400 hover:text-amber-600"
              }`}
            >
              🌳 Albero WBS
            </button>
            <button
              onClick={() => setVista("costi")}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors cursor-pointer ${
                vista === "costi"
                  ? "bg-gray-50 text-amber-600 border border-gray-300 border-b-gray-50 -mb-px"
                  : "text-gray-400 hover:text-amber-600"
              }`}
            >
              💰 Costi
            </button>
            <button
              onClick={() => setVista("gantt")}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors cursor-pointer ${
                vista === "gantt"
                  ? "bg-gray-50 text-amber-600 border border-gray-300 border-b-gray-50 -mb-px"
                  : "text-gray-400 hover:text-amber-600"
              }`}
            >
              📅 Cronoprogramma
            </button>
          </div>

          {/* Vista attiva */}
          {vista === "dashboard" ? (
            <Dashboard progetto={activeProject} />
          ) : vista === "costi" ? (
            <CostiManagement
              progetto={activeProject}
              onAggiornaNodo={(nodeId, data) =>
                aggiornaNodo(activeProject.id, nodeId, data)
              }
            />
          ) : vista === "gantt" ? (
            <GanttChart progetto={activeProject} />
          ) : (
            <WBSTree
              progetto={activeProject}
              progettoIndex={progettoIndex}
              onRinominaProgetto={rinominaProgetto}
              onAggiungiNodo={aggiungiNodo}
              onEliminaNodo={eliminaNodo}
              onRinominaNodo={rinominaNodo}
              onAggiornaNodo={aggiornaNodo}
              onSpostaNodo={spostaNodo}
              onSpostaNodoLaterale={spostaNodoLaterale}
              onPromuoviNodo={promuoviNodo}
              onDeclassaNodo={declassaNodo}
            />
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <p className="text-5xl mb-4">📊</p>
            <p className="text-lg font-medium text-amber-600">WBS Office</p>
            <p className="text-sm mt-1">
              Seleziona o crea un progetto per iniziare
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
