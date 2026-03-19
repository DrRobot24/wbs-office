/**
 * Genera il codice WBS automaticamente.
 * progettoIndex: indice 0-based del progetto (sempre 1 nel contesto corrente)
 * faseIndex:     indice 0-based della fase
 * taskIndex:     indice 0-based del task (opzionale)
 *
 * Esempi: "1.1", "1.2", "1.2.3"
 */
export function generaWbsCode(progettoIndex, faseIndex, taskIndex) {
  const p = progettoIndex + 1;
  const f = faseIndex + 1;
  if (taskIndex === undefined || taskIndex === null) {
    return `${p}.${f}`;
  }
  return `${p}.${f}.${taskIndex + 1}`;
}
