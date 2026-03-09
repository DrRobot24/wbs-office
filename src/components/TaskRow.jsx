const badgeClassi = {
  'todo': 'bg-red-500/20 text-red-400',
  'in-progress': 'bg-yellow-500/20 text-yellow-400',
  'done': 'bg-green-500/20 text-green-400',
}

const badgeLabels = {
  'todo': 'Da fare',
  'in-progress': 'In corso',
  'done': 'Completato',
}

export default function TaskRow({ task, wbsCode, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 ml-8 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all group"
    >
      {/* Codice WBS */}
      <span className="font-mono text-xs text-slate-400 min-w-[52px]">
        {wbsCode}
      </span>

      {/* Titolo */}
      <span className="flex-1 text-sm font-medium text-slate-700 truncate">
        {task.titolo}
      </span>

      {/* Responsabile */}
      {task.responsabile && (
        <span className="hidden sm:inline text-xs text-slate-400 truncate max-w-[120px]">
          {task.responsabile}
        </span>
      )}

      {/* Scadenza */}
      {task.dataScadenza && (
        <span className="hidden md:inline text-xs text-slate-400">
          {task.dataScadenza}
        </span>
      )}

      {/* Badge stato */}
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeClassi[task.stato] || badgeClassi['todo']}`}
      >
        {badgeLabels[task.stato] || task.stato}
      </span>

      {/* Percentuale */}
      <span className="text-xs font-semibold text-slate-500 min-w-[36px] text-right">
        {task.percentuale}%
      </span>
    </div>
  )
}
