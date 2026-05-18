import { useState } from "react";
import { useAuth } from "../lib/AuthContext";

export default function Sidebar({
  projects,
  activeProjectId,
  onSelectProject,
  onAggiungiProgetto,
  onEliminaProgetto,
  onArchiviaProgetto,
  onEsportaProgettoJSON,
  isAdmin,
  vista,
  onOpenAdmin,
  onOpenProfile,
}) {
  const { user, profile, cloud, signOut } = useAuth();
  const [selezioneAttiva, setSelezioneAttiva] = useState(false);
  const [selezionati, setSelezionati] = useState(new Set());

  const progettiAttivi = projects.filter((p) => !p.archived);

  const toggleSelezione = (id) => {
    setSelezionati((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const archiviaSelezionati = () => {
    selezionati.forEach((id) => onArchiviaProgetto(id));
    setSelezionati(new Set());
    setSelezioneAttiva(false);
  };

  const chiudiSelezione = () => {
    setSelezionati(new Set());
    setSelezioneAttiva(false);
  };

  return (
    <aside className="w-64 flex flex-col min-h-screen bg-gray-900 border-r-2 border-black">
      {/* Logo / Titolo */}
      <div className="px-5 py-6 border-b-2 border-black">
        <h1 className="text-lg font-bold tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center shrink-0">
            <span className="text-black font-extrabold text-xs">RS</span>
          </div>
          <div>
            <span className="text-white font-extrabold block leading-tight">
              WBS Office
            </span>
            <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
              Gestione Progetti
            </span>
          </div>
        </h1>
      </div>

      {/* Profilo utente + Esci — subito sotto il logo */}
      {cloud && user && (
        <div className="px-4 py-3 border-b-2 border-black">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 border-2 border-black flex items-center justify-center shrink-0 text-[11px] font-extrabold text-black">
              {(profile?.full_name || user.email || "?")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              {profile?.full_name && (
                <p className="text-xs text-white font-bold truncate leading-tight">
                  {profile.full_name}
                </p>
              )}
              <p className="text-[10px] text-gray-500 truncate leading-tight">
                {user.email}
              </p>
            </div>
            <button
              onClick={signOut}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-2 bg-gray-800 text-rose-400 border-gray-700 hover:bg-rose-500 hover:text-white hover:border-black"
            >
              Esci
            </button>
          </div>
          <button
            onClick={onOpenProfile}
            className={`w-full mt-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 ${
              vista === "profile"
                ? "bg-amber-400 text-black border-black shadow-[2px_2px_0px_#000]"
                : "bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-white"
            }`}
          >
            👤 Il Mio Profilo
          </button>
        </div>
      )}

      {/* Pulsante Pannello Admin — visibile solo per admin */}
      {isAdmin && (
        <div className="px-4 py-2 border-b-2 border-black">
          <button
            onClick={onOpenAdmin}
            className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer border-2 ${
              vista === "admin"
                ? "bg-rose-500 text-white border-black shadow-[3px_3px_0px_#000]"
                : "bg-gray-800 text-gray-400 border-gray-700 hover:bg-rose-500 hover:text-white hover:border-black"
            }`}
          >
            ⚙ Pannello Admin
          </button>
        </div>
      )}

      {/* Lista progetti */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-5 flex items-center justify-between mb-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
            Progetti
          </p>
          <div className="flex gap-1.5">
            {progettiAttivi.length > 1 && (
              <button
                onClick={() => selezioneAttiva ? chiudiSelezione() : setSelezioneAttiva(true)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg border text-[11px] cursor-pointer transition-all ${
                  selezioneAttiva
                    ? "bg-amber-400 border-black text-black"
                    : "bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-400 hover:text-white"
                }`}
                title={selezioneAttiva ? "Esci dalla selezione" : "Seleziona più progetti"}
              >
                ☑
              </button>
            )}
            {activeProjectId && (
              <button
                onClick={() => onEsportaProgettoJSON(activeProjectId)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-400 hover:text-white text-[11px] cursor-pointer transition-all"
                title="Esporta progetto attivo come .json"
              >
                💾
              </button>
            )}
          </div>
        </div>

        {/* Barra azioni selezione multipla */}
        {selezioneAttiva && (
          <div className="px-4 mb-3 flex gap-2">
            <button
              onClick={archiviaSelezionati}
              disabled={selezionati.size === 0}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 ${
                selezionati.size > 0
                  ? "bg-amber-400 text-black border-black shadow-[2px_2px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                  : "bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed"
              }`}
            >
              📦 Archivia ({selezionati.size})
            </button>
            <button
              onClick={chiudiSelezione}
              className="py-2 px-3 rounded-xl text-xs font-bold bg-gray-800 text-gray-400 border-2 border-gray-700 hover:bg-gray-700 hover:text-white cursor-pointer transition-all"
            >
              ✕
            </button>
          </div>
        )}

        <div className="px-4 mb-3">
          <button
            onClick={onAggiungiProgetto}
            className="w-full py-2.5 bg-amber-400 text-black rounded-xl text-sm font-bold transition-all cursor-pointer border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            + Nuovo Progetto
          </button>
        </div>

        {progettiAttivi.map((p, i) => (
          <div
            key={p.id}
            className={`flex items-center gap-2 px-5 py-2.5 cursor-pointer transition-all duration-200 group ${
              p.id === activeProjectId
                ? "bg-amber-400/15 border-l-4 border-amber-400 text-white"
                : "text-gray-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent"
            }`}
            onClick={() => selezioneAttiva ? toggleSelezione(p.id) : onSelectProject(p.id)}
          >
            {selezioneAttiva ? (
              <span
                className={`shrink-0 w-5 h-5 flex items-center justify-center rounded-md border-2 transition-all ${
                  selezionati.has(p.id)
                    ? "bg-amber-400 border-black text-black"
                    : "bg-gray-800 border-gray-600 text-transparent"
                }`}
              >
                {selezionati.has(p.id) && <span className="text-[10px] font-extrabold">✓</span>}
              </span>
            ) : (
              <span className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-lg text-[11px] font-extrabold border-2 ${
                p.id === activeProjectId
                  ? "bg-amber-400 text-black border-black"
                  : "bg-white/10 text-gray-400 border-gray-600"
              }`}>
                {i + 1}
              </span>
            )}
            <span className="flex-1 text-sm truncate font-bold">
              {p.titolo}
            </span>
            <span
              className={`text-xs font-bold ${p.id === activeProjectId ? "text-amber-400" : "text-gray-500"}`}
            >
              {p.percentuale}%
            </span>
            {!selezioneAttiva && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchiviaProgetto(p.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-amber-400 text-xs cursor-pointer transition-opacity font-bold"
                  title="Archivia progetto"
                >
                  📦
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Eliminare "${p.titolo}"?`)) {
                      onEliminaProgetto(p.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 text-xs cursor-pointer transition-opacity font-bold"
                  title="Elimina progetto"
                >
                  ✕
                </button>
              </>
            )}
          </div>
        ))}

        {progettiAttivi.length === 0 && (
          <p className="px-5 text-xs text-gray-600 italic py-4 font-semibold">
            Nessun progetto
          </p>
        )}
      </div>

      {/* Footer — stato cloud */}
      <div className="p-4 border-t-2 border-black flex flex-col gap-2">
        {/* Cloud status */}
        <div className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-gray-800 border-2 border-gray-700">
          {cloud && user ? (
            <>
              <div className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse" />
              <span className="text-[10px] text-lime-400 font-bold flex-1 uppercase">
                Cloud sync attivo
              </span>
            </>
          ) : cloud ? (
            <>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <span className="text-[10px] text-yellow-400 font-bold uppercase">
                Cloud pronto — login richiesto
              </span>
            </>
          ) : (
            <>
              <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
              <span className="text-[10px] text-gray-500 font-bold uppercase">
                Modalità offline
              </span>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
