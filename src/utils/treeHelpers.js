/* ── Shared tree utilities ── */

/** Deriva lo stato da una percentuale di avanzamento */
export function derivaStato(percentuale) {
  const p = Number(percentuale) || 0;
  if (p >= 100) return "done";
  if (p > 0) return "in-progress";
  return "todo";
}

/** Raccoglie tutte le foglie ricorsivamente */
export function raccogliFoglie(nodo) {
  if (!nodo.children || nodo.children.length === 0) return [nodo];
  return nodo.children.flatMap(raccogliFoglie);
}

/** Calcola lo stato ricorsivo di un nodo in base ai discendenti */
export function calcolaStatoNodo(nodo) {
  if (!nodo.children || nodo.children.length === 0) return derivaStato(nodo.percentuale);
  const foglie = raccogliFoglie(nodo);
  const stati = foglie.map((f) => derivaStato(f.percentuale));
  if (stati.every((s) => s === "done")) return "done";
  if (stati.some((s) => s === "in-progress" || s === "done"))
    return "in-progress";
  return "todo";
}

/** Conta tutti i discendenti diretti e indiretti */
export function contaDiscendenti(nodo) {
  if (!nodo.children || nodo.children.length === 0) return 0;
  return nodo.children.reduce((acc, c) => acc + 1 + contaDiscendenti(c), 0);
}

/* ── Status badge/label maps ── */
export const STATO_BADGE = {
  todo: "bg-rose-300 text-black border-2 border-black",
  "in-progress": "bg-yellow-300 text-black border-2 border-black",
  done: "bg-lime-300 text-black border-2 border-black",
};

export const STATO_LABEL = {
  todo: "Da fare",
  "in-progress": "In corso",
  done: "Completato",
};
