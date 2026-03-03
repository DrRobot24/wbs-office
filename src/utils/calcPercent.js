/**
 * Calcola la percentuale media di un array di oggetti con proprietà `percentuale`.
 * Se l'array è vuoto restituisce 0.
 */
export function calcolaMedia(items) {
  if (!items || items.length === 0) return 0
  const somma = items.reduce((acc, item) => acc + (item.percentuale || 0), 0)
  return Math.round(somma / items.length)
}

/**
 * Ricalcola ricorsivamente le percentuali di un nodo.
 * - Se il nodo non ha children (foglia): la percentuale resta quella impostata manualmente.
 * - Se il nodo ha children: la percentuale = media dei figli (ricalcolati ricorsivamente).
 */
function ricalcolaNodo(nodo) {
  if (!nodo.children || nodo.children.length === 0) {
    return nodo // foglia: percentuale manuale
  }
  const childrenAggiornati = nodo.children.map(ricalcolaNodo)
  return {
    ...nodo,
    children: childrenAggiornati,
    percentuale: calcolaMedia(childrenAggiornati),
  }
}

/**
 * Ricalcola le percentuali aggregate di un progetto ricorsivamente.
 * progetto.children contiene la gerarchia ad albero.
 * Restituisce una copia aggiornata del progetto.
 */
export function ricalcolaPercentuali(progetto) {
  // Migrazione: se il progetto usa ancora il vecchio formato fasi/tasks, convertilo
  if (progetto.fasi && !progetto.children) {
    progetto = migraProgetto(progetto)
  }
  return ricalcolaNodo(progetto)
}

/**
 * Migra un progetto dal vecchio formato (fasi[].tasks[]) al nuovo (children[] ricorsivo).
 */
export function migraProgetto(progetto) {
  if (progetto.children) return progetto // già migrato
  const children = (progetto.fasi || []).map(fase => ({
    id: fase.id,
    titolo: fase.titolo,
    percentuale: fase.percentuale || 0,
    children: (fase.tasks || []).map(task => ({
      id: task.id,
      titolo: task.titolo,
      responsabile: task.responsabile || '',
      dataScadenza: task.dataScadenza || '',
      stato: task.stato || 'todo',
      percentuale: task.percentuale || 0,
      children: [],
    })),
  }))
  const { fasi, ...rest } = progetto
  return { ...rest, children }
}
