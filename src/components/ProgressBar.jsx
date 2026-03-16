export default function ProgressBar({ percentuale = 0, altezza = 'h-3' }) {
  const colore =
    percentuale >= 100
      ? 'bg-green-500'
      : percentuale >= 50
        ? 'bg-amber-500'
        : percentuale > 0
          ? 'bg-amber-500/70'
          : 'bg-slate-600'

  return (
    <div className={`w-full bg-gray-200 rounded-full ${altezza} overflow-hidden`}>
      <div
        className={`${colore} ${altezza} rounded-full transition-all duration-300`}
        style={{ width: `${Math.min(percentuale, 100)}%` }}
      />
    </div>
  )
}
