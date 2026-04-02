export default function ProgressBar({ percentuale = 0, altezza = "h-3" }) {
  const colore =
    percentuale >= 100
      ? "bg-lime-400"
      : percentuale >= 50
        ? "bg-yellow-400"
        : percentuale > 0
          ? "bg-rose-400"
          : "bg-gray-300";

  return (
    <div
      className={`w-full bg-gray-200 border-2 border-black rounded-full ${altezza} overflow-hidden`}
    >
      <div
        className={`${colore} ${altezza} rounded-full transition-all duration-300`}
        style={{ width: `${Math.min(percentuale, 100)}%` }}
      />
    </div>
  );
}
