import { useRef } from "react";
import ProgressBar from "./ProgressBar";

function fmtArchivedAt(iso) {
  if (!iso) return null;
  const parts = iso.split("T")[0].split("-");
  if (parts.length !== 3) return null;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export default function Archivio({
  projects,
  onRipristina,
  onElimina,
  onEsportaProgetto,
  onImporta,
  onSelectProject,
}) {
  const fileInputRef = useRef(null);
  const archiviati = projects.filter((p) => p.archived);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImporta(file);
      e.target.value = "";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-100">
      <div className="bg-white border-b-2 border-black px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">📦</span>
              <h1 className="text-xl font-extrabold text-black">Archivio Progetti</h1>
            </div>
            <p className="text-sm text-gray-600 ml-10 font-semibold">
              {archiviati.length === 0
                ? "Nessun progetto archiviato"
                : `${archiviati.length} progett${archiviati.length === 1 ? "o" : "i"} archiviati`}
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 border-2 border-black rounded-xl text-black text-sm font-bold shadow-[3px_3px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
          >
            📂 Carica da file .json
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="p-6">
        {archiviati.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-xl font-extrabold text-black mb-2">Archivio vuoto</p>
            <p className="text-sm font-semibold text-gray-500 max-w-sm mb-8">
              Archivia un progetto con il tasto 📦 nella sidebar, oppure carica un file .json salvato
              in precedenza — come le cassette del Commodore 64.
            </p>
            <div className="bg-white border-2 border-black rounded-xl p-5 shadow-[4px_4px_0px_#000] max-w-sm text-left">
              <p className="text-xs font-extrabold text-black uppercase tracking-wide mb-3">
                💡 Come usare l'archivio
              </p>
              <ol className="text-xs text-gray-600 font-semibold space-y-2">
                <li>
                  <span className="font-extrabold text-black">1.</span> Archivia un progetto con
                  📦 (hover sulla sidebar)
                </li>
                <li>
                  <span className="font-extrabold text-black">2.</span> Esporta come .json per
                  salvarlo sul tuo PC
                </li>
                <li>
                  <span className="font-extrabold text-black">3.</span> Ricaricalo con "Carica da
                  file .json" — il progetto riparte da dove l'hai lasciato
                </li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {archiviati.map((p) => {
              const dataArchiviazione = fmtArchivedAt(p.archivedAt);
              return (
                <div
                  key={p.id}
                  className="bg-white border-2 border-black rounded-xl p-5 shadow-[4px_4px_0px_#000] flex flex-col gap-3 hover:shadow-[6px_6px_0px_#000] transition-all"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xl shrink-0">📦</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-black text-sm leading-snug line-clamp-2">
                        {p.titolo}
                      </h3>
                      {dataArchiviazione && (
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                          Archiviato il {dataArchiviazione}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-extrabold text-black shrink-0">
                      {p.percentuale}%
                    </span>
                  </div>

                  <ProgressBar percentuale={p.percentuale || 0} altezza="h-2" />

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => {
                        onRipristina(p.id);
                        onSelectProject(p.id);
                      }}
                      className="flex-1 py-2 bg-lime-300 border-2 border-black rounded-xl text-xs font-bold text-black shadow-[2px_2px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                      title="Ripristina progetto come attivo"
                    >
                      ↩ Ripristina
                    </button>
                    <button
                      onClick={() => onEsportaProgetto(p.id)}
                      className="py-2 px-3 bg-sky-300 border-2 border-black rounded-xl text-xs font-bold text-black shadow-[2px_2px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                      title="Esporta come .json"
                    >
                      💾
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Eliminare definitivamente "${p.titolo}"?`)) {
                          onElimina(p.id);
                        }
                      }}
                      className="py-2 px-3 bg-red-600 border-2 border-black rounded-xl text-xs font-bold text-white shadow-[2px_2px_0px_#000] hover:bg-red-700 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                      title="Elimina definitivamente"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
