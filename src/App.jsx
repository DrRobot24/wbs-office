import { useState } from "react";
import Sidebar from "./components/Sidebar";
import WBSTree from "./components/WBSTree";
import Dashboard from "./components/Dashboard";
import GanttChart from "./components/GanttChart";
import Archivio from "./components/Archivio";
import LoginPage from "./components/LoginPage";
import AdminPanel from "./components/AdminPanel";
import ProfilePage from "./components/ProfilePage";
import { useProjects } from "./hooks/useProjects";
import { useAuth } from "./lib/AuthContext";

export default function App() {
  const { user, profile, loading, cloud, isAdmin, signOut } = useAuth();

  const {
    projects,
    activeProject,
    activeProjectId,
    setActiveProjectId,
    aggiungiProgetto,
    eliminaProgetto,
    archiviaProgetto,
    ripristinaProgetto,
    aggiungiNodo,
    eliminaNodo,
    aggiornaNodo,
    spostaNodo,
    promuoviNodo,
    declassaNodo,
    replaceProgetto,
    esportaProgettoJSON,
    importaJSON,
  } = useProjects(user?.id);

  const [vista, setVista] = useState("dashboard"); // 'dashboard' | 'wbs' | 'gantt' | 'archivio' | 'admin' | 'profile'

  // Se Supabase è configurato e non c'è utente → mostra login
  if (cloud && !user) {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-14 h-14 rounded-xl bg-amber-400 border-2 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-black font-extrabold text-lg">RS</span>
            </div>
            <p className="text-black font-bold text-sm">Caricamento...</p>
          </div>
        </div>
      );
    }
    return <LoginPage />;
  }
  const progettoIndex = projects.findIndex((p) => p.id === activeProjectId);

  return (
    <div className="flex h-screen bg-gray-100">
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
        onArchiviaProgetto={archiviaProgetto}
        onEsportaProgettoJSON={esportaProgettoJSON}
        isAdmin={isAdmin}
        vista={vista}
        onOpenAdmin={() => setVista("admin")}
        onOpenProfile={() => setVista("profile")}
      />

      {/* Admin Panel */}
      {vista === "admin" && isAdmin ? (
        <AdminPanel
          projects={projects}
          onClose={() => setVista("dashboard")}
        />
      ) : vista === "profile" ? (
        <ProfilePage
          onClose={() => setVista("dashboard")}
        />
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Navigation — sempre visibile */}
          <div className="bg-white border-b-2 border-black px-6 flex items-end gap-2 pt-3">
            <button
              onClick={() => { if (activeProject) setVista("dashboard"); }}
              className={`px-5 py-2.5 text-sm font-bold rounded-t-xl transition-all ${
                activeProject ? "cursor-pointer" : "opacity-40 cursor-not-allowed"
              } ${
                vista === "dashboard" && activeProject
                  ? "bg-amber-400 text-black border-2 border-black border-b-0 -mb-[2px] shadow-[2px_-2px_0px_#000]"
                  : "text-gray-500 hover:text-black hover:bg-gray-100 border-2 border-transparent"
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => { if (activeProject) setVista("wbs"); }}
              className={`px-5 py-2.5 text-sm font-bold rounded-t-xl transition-all ${
                activeProject ? "cursor-pointer" : "opacity-40 cursor-not-allowed"
              } ${
                vista === "wbs" && activeProject
                  ? "bg-sky-300 text-black border-2 border-black border-b-0 -mb-[2px] shadow-[2px_-2px_0px_#000]"
                  : "text-gray-500 hover:text-black hover:bg-gray-100 border-2 border-transparent"
              }`}
            >
              🌳 Albero WBS
            </button>
            <button
              onClick={() => { if (activeProject) setVista("gantt"); }}
              className={`px-5 py-2.5 text-sm font-bold rounded-t-xl transition-all ${
                activeProject ? "cursor-pointer" : "opacity-40 cursor-not-allowed"
              } ${
                vista === "gantt" && activeProject
                  ? "bg-violet-300 text-black border-2 border-black border-b-0 -mb-[2px] shadow-[2px_-2px_0px_#000]"
                  : "text-gray-500 hover:text-black hover:bg-gray-100 border-2 border-transparent"
              }`}
            >
              📅 Cronoprogramma
            </button>
            <button
              onClick={() => setVista("archivio")}
              className={`px-5 py-2.5 text-sm font-bold rounded-t-xl transition-all cursor-pointer ${
                vista === "archivio"
                  ? "bg-orange-300 text-black border-2 border-black border-b-0 -mb-[2px] shadow-[2px_-2px_0px_#000]"
                  : "text-gray-500 hover:text-black hover:bg-gray-100 border-2 border-transparent"
              }`}
            >
              📦 Archivio
            </button>

            {/* Spacer + User badge */}
            <div className="flex-1" />
            {user && (
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000]">
                  <div className="w-6 h-6 rounded-lg bg-amber-400 border-2 border-black flex items-center justify-center shrink-0 text-[10px] font-extrabold text-black">
                    {(profile?.full_name || user.email || "?")[0].toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-black truncate max-w-[140px]">
                    {profile?.full_name || user.email}
                  </span>
                </div>
                <button
                  onClick={signOut}
                  className="px-3 py-1.5 bg-rose-500 text-white rounded-xl text-xs font-bold border-2 border-black shadow-[2px_2px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                >
                  Esci
                </button>
              </div>
            )}
          </div>

          {/* Vista attiva */}
          {vista === "archivio" ? (
            <Archivio
              projects={projects}
              onRipristina={ripristinaProgetto}
              onElimina={eliminaProgetto}
              onEsportaProgetto={esportaProgettoJSON}
              onImporta={importaJSON}
              onSelectProject={(id) => {
                setActiveProjectId(id);
                setVista("dashboard");
              }}
            />
          ) : activeProject ? (
            <>
              {vista === "dashboard" ? (
                <Dashboard
                  progetto={activeProject}
                  onAggiungiNodo={aggiungiNodo}
                  onEliminaNodo={eliminaNodo}
                  onAggiornaNodo={aggiornaNodo}
                  onSpostaNodo={spostaNodo}
                />
              ) : vista === "gantt" ? (
                <GanttChart
                  progetto={activeProject}
                  onAggiornaNodo={(nodeId, data) =>
                    aggiornaNodo(activeProject.id, nodeId, data)
                  }
                />
              ) : (
                <WBSTree
                  progetto={activeProject}
                  progettoIndex={progettoIndex}
                  onAggiungiNodo={aggiungiNodo}
                  onEliminaNodo={eliminaNodo}
                  onAggiornaNodo={aggiornaNodo}
                  onSpostaNodo={spostaNodo}
                  onPromuoviNodo={promuoviNodo}
                  onDeclassaNodo={declassaNodo}
                  onReplaceProgetto={replaceProgetto}
                />
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center bg-white border-2 border-black rounded-xl p-10 shadow-[6px_6px_0px_#000]">
                <p className="text-5xl mb-4">📊</p>
                <p className="text-xl font-extrabold text-black">WBS Office</p>
                <p className="text-sm mt-2 font-semibold text-gray-600">
                  Seleziona o crea un progetto per iniziare
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
