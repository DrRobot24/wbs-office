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
 * Ricalcola le percentuali aggregate di un progetto:
 * - Ogni fase.percentuale = media dei suoi task
 * - progetto.percentuale = media delle fasi
 * Restituisce una copia aggiornata del progetto.
 */
export function ricalcolaPercentuali(progetto) {
  const fasiAggiornate = progetto.fasi.map(fase => ({
    ...fase,
    percentuale: calcolaMedia(fase.tasks),
  }))
  return {
    ...progetto,
    fasi: fasiAggiornate,
    percentuale: calcolaMedia(fasiAggiornate),
  }
}
