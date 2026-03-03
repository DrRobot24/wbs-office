import ProgressBar from './ProgressBar'

const badgeClassi = {
  'todo': 'bg-slate-600/40 text-slate-300',
  'in-progress': 'bg-amber-500/20 text-amber-400',
  'done': 'bg-green-500/20 text-green-400',
}

const badgeLabels = {
  'todo': 'Da fare',
  'in-progress': 'In corso',
  'done': 'Completato',
}

const statusColors = {
  'todo': 'border-slate-600/40 bg-slate-800/50',
  'in-progress': 'border-amber-500/30 bg-amber-500/10',
  'done': 'border-green-500/30 bg-green-500/10',
}

function calcolaStatoFase(fase) {
  if (!fase.tasks || fase.tasks.length === 0) return 'todo'
  if (fase.tasks.every(t => t.stato === 'done')) return 'done'
  if (fase.tasks.some(t => t.stato === 'in-progress' || t.stato === 'done')) return 'in-progress'
  return 'todo'
}

function StatCard({ label, valore, icona, colore }) {
  return (
    <div className={`rounded-xl border px-5 py-4 flex items-center gap-4 ${colore}`}>
      <span className="text-3xl">{icona}</span>
      <div>
        <p className="text-2xl font-bold text-amber-400">{valore}</p>
        <p className="text-xs text-amber-500/50 font-medium">{label}</p>
      </div>
    </div>
  )
}

function FaseNode({ fase, faseIndex, isLast }) {
  const statoFase = calcolaStatoFase(fase)
  const borderColor =
    statoFase === 'done'
      ? 'border-green-500/50 shadow-green-900/20'
      : statoFase === 'in-progress'
        ? 'border-amber-500/50 shadow-amber-900/20'
        : 'border-slate-600 shadow-slate-900/20'

  const headerBg =
    statoFase === 'done'
      ? 'bg-green-500/30'
      : statoFase === 'in-progress'
        ? 'bg-amber-500/30'
        : 'bg-slate-600/30'

  return (
    <div className="flex items-start">
      {/* Card della fase */}
      <div
        className={`border-2 rounded-xl shadow-md min-w-[220px] max-w-[280px] overflow-hidden bg-[#0d2137] ${borderColor}`}
      >
        {/* Header fase */}
        <div className={`${headerBg} px-4 py-2.5 flex items-center gap-2`}>
          <span className="text-amber-400 text-xs font-bold bg-amber-500/20 rounded-full px-2 py-0.5">
            Fase {faseIndex + 1}
          </span>
          <span className="text-amber-300 text-sm font-semibold truncate flex-1">
            {fase.titolo}
          </span>
        </div>

        {/* Progress */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-amber-500/50 font-medium">Avanzamento</span>
            <span className="text-xs font-bold text-amber-400">{fase.percentuale}%</span>
          </div>
          <ProgressBar percentuale={fase.percentuale} altezza="h-2" />
        </div>

        {/* Tasks lista */}
        <div className="px-4 py-3 flex flex-col gap-1.5">
          {fase.tasks.length === 0 && (
            <p className="text-xs text-amber-500/30 italic py-1">Nessun task</p>
          )}
          {fase.tasks.map(task => (
            <div
              key={task.id}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${statusColors[task.stato] || statusColors['todo']} border`}
            >
              <span>
                {task.stato === 'done' ? '✅' : task.stato === 'in-progress' ? '🔄' : '⬜'}
              </span>
              <span className="flex-1 truncate font-medium text-amber-300/80">
                {task.titolo}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${badgeClassi[task.stato]}`}
              >
                {task.percentuale}%
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#091a2a] border-t border-amber-500/10 flex justify-between">
          <span className="text-[10px] text-amber-500/30">
            {fase.tasks.length} task
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${badgeClassi[statoFase]}`}>
            {badgeLabels[statoFase]}
          </span>
        </div>
      </div>

      {/* Freccia di connessione */}
      {!isLast && (
        <div className="flex items-center self-center mx-2">
          <div className="w-8 h-0.5 bg-amber-500/30" />
          <svg className="w-4 h-4 text-amber-500/40 -ml-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  )
}

export default function Dashboard({ progetto }) {
  const tuttiTask = progetto.fasi.flatMap(f => f.tasks)
  const totale = tuttiTask.length
  const completati = tuttiTask.filter(t => t.stato === 'done').length
  const inCorso = tuttiTask.filter(t => t.stato === 'in-progress').length
  const daFare = tuttiTask.filter(t => t.stato === 'todo').length
  const totaleFasi = progetto.fasi.length

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a1929]">
      {/* Header */}
      <div className="bg-[#0d2137] border-b border-amber-500/20 px-6 py-5">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">📊</span>
          <h1 className="text-xl font-bold text-amber-400">{progetto.titolo}</h1>
        </div>
        <p className="text-sm text-amber-500/40 ml-10">Dashboard di progetto</p>
      </div>

      <div className="p-6 space-y-8">
        {/* Progress globale */}
        <div className="bg-[#0d2137] rounded-xl border border-amber-500/20 p-5 shadow-lg shadow-amber-900/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-amber-300">Avanzamento Globale</h2>
            <span className="text-2xl font-bold text-amber-400">{progetto.percentuale}%</span>
          </div>
          <ProgressBar percentuale={progetto.percentuale} altezza="h-5" />
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Fasi totali" valore={totaleFasi} icona="📁" colore="bg-[#0d2137] border-amber-500/20" />
          <StatCard label="Task totali" valore={totale} icona="📋" colore="bg-[#0d2137] border-amber-500/20" />
          <StatCard label="Completati" valore={completati} icona="✅" colore="bg-green-500/5 border-green-500/20" />
          <StatCard label="In corso" valore={inCorso} icona="🔄" colore="bg-amber-500/5 border-amber-500/20" />
        </div>

        {/* Mini riepilogo */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#0d2137] border border-amber-500/15 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-slate-400">{daFare}</p>
            <p className="text-xs text-amber-500/30 mt-1">Da fare</p>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-amber-400">{inCorso}</p>
            <p className="text-xs text-amber-500/40 mt-1">In corso</p>
          </div>
          <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-400">{completati}</p>
            <p className="text-xs text-green-500/40 mt-1">Completati</p>
          </div>
        </div>

        {/* Diagramma di flusso */}
        <div className="bg-[#0d2137] rounded-xl border border-amber-500/20 p-5 shadow-lg shadow-amber-900/10">
          <h2 className="text-sm font-semibold text-amber-300 mb-5">
            Diagramma di Flusso — Fasi del Progetto
          </h2>

          {progetto.fasi.length === 0 ? (
            <div className="text-center py-12 text-amber-500/30">
              <p className="text-lg mb-2">Nessuna fase presente</p>
              <p className="text-sm">Vai nell'Albero WBS per aggiungere le fasi</p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <div className="flex items-start gap-0 min-w-max px-2 py-4">
                {/* Nodo START */}
                <div className="flex items-center self-center mr-2">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center shadow-md">
                    <span className="text-amber-400 text-xs font-bold">START</span>
                  </div>
                  <div className="w-6 h-0.5 bg-amber-500/30" />
                  <svg className="w-4 h-4 text-amber-500/40 -ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                {/* Nodi fase */}
                {progetto.fasi.map((fase, i) => (
                  <FaseNode
                    key={fase.id}
                    fase={fase}
                    faseIndex={i}
                    isLast={i === progetto.fasi.length - 1}
                  />
                ))}

                {/* Nodo END */}
                <div className="flex items-center self-center ml-2">
                  <div className="w-6 h-0.5 bg-amber-500/30" />
                  <div className="w-10 h-10 rounded-full bg-slate-700/50 border-2 border-slate-600 flex items-center justify-center shadow-md ml-1">
                    <span className="text-slate-400 text-xs font-bold">END</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-6 text-xs text-amber-500/40 justify-center pb-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-slate-500" />
            <span>Da fare</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <span>In corso</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span>Completato</span>
          </div>
        </div>
      </div>
    </div>
  )
}
