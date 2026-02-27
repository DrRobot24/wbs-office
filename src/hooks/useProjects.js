import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { ricalcolaPercentuali } from '../utils/calcPercent'

const STORAGE_KEY = 'wbs-projects'

/** Progetto demo precaricato */
function creaProgettoDemo() {
  return {
    id: uuidv4(),
    titolo: 'Progetto Demo',
    percentuale: 0,
    fasi: [
      {
        id: uuidv4(),
        titolo: 'Progettazione',
        percentuale: 0,
        tasks: [
          {
            id: uuidv4(),
            titolo: 'Analisi requisiti',
            responsabile: 'Mario Rossi',
            dataScadenza: '2026-03-15',
            stato: 'done',
            percentuale: 100,
          },
          {
            id: uuidv4(),
            titolo: 'Definizione architettura',
            responsabile: 'Laura Bianchi',
            dataScadenza: '2026-03-20',
            stato: 'in-progress',
            percentuale: 60,
          },
        ],
      },
      {
        id: uuidv4(),
        titolo: 'Sviluppo',
        percentuale: 0,
        tasks: [
          {
            id: uuidv4(),
            titolo: 'Implementazione frontend',
            responsabile: 'Giulia Verdi',
            dataScadenza: '2026-04-10',
            stato: 'in-progress',
            percentuale: 40,
          },
          {
            id: uuidv4(),
            titolo: 'Implementazione backend',
            responsabile: 'Andrea Neri',
            dataScadenza: '2026-04-20',
            stato: 'todo',
            percentuale: 0,
          },
        ],
      },
    ],
  }
}

function caricaDaStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // ignore
  }
  // Se vuoto o non valido, restituisci progetto demo
  const demo = ricalcolaPercentuali(creaProgettoDemo())
  return [demo]
}

function salvaSuStorage(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export function useProjects() {
  const [projects, setProjects] = useState(() => caricaDaStorage())
  const [activeProjectId, setActiveProjectId] = useState(() => {
    const loaded = caricaDaStorage()
    return loaded.length > 0 ? loaded[0].id : null
  })

  // Salva su localStorage ad ogni modifica
  useEffect(() => {
    salvaSuStorage(projects)
  }, [projects])

  const activeProject = projects.find(p => p.id === activeProjectId) || null

  // --- CRUD Progetti ---
  const aggiungiProgetto = useCallback(() => {
    const nuovo = ricalcolaPercentuali({
      id: uuidv4(),
      titolo: 'Nuovo Progetto',
      percentuale: 0,
      fasi: [],
    })
    setProjects(prev => [...prev, nuovo])
    setActiveProjectId(nuovo.id)
  }, [])

  const eliminaProgetto = useCallback((id) => {
    setProjects(prev => {
      const next = prev.filter(p => p.id !== id)
      return next
    })
    setActiveProjectId(prev => {
      if (prev === id) {
        const remaining = projects.filter(p => p.id !== id)
        return remaining.length > 0 ? remaining[0].id : null
      }
      return prev
    })
  }, [projects])

  const rinominaProgetto = useCallback((id, nuovoTitolo) => {
    setProjects(prev =>
      prev.map(p => (p.id === id ? { ...p, titolo: nuovoTitolo } : p))
    )
  }, [])

  // --- Aggiorna un progetto intero (ricalcola %) ---
  const aggiornaProgetto = useCallback((progettoAggiornato) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === progettoAggiornato.id
          ? ricalcolaPercentuali(progettoAggiornato)
          : p
      )
    )
  }, [])

  // --- CRUD Fasi ---
  const aggiungiFase = useCallback((progettoId) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== progettoId) return p
        const nuovaFase = {
          id: uuidv4(),
          titolo: 'Nuova Fase',
          percentuale: 0,
          tasks: [],
        }
        return ricalcolaPercentuali({ ...p, fasi: [...p.fasi, nuovaFase] })
      })
    )
  }, [])

  const eliminaFase = useCallback((progettoId, faseId) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== progettoId) return p
        return ricalcolaPercentuali({
          ...p,
          fasi: p.fasi.filter(f => f.id !== faseId),
        })
      })
    )
  }, [])

  const rinominaFase = useCallback((progettoId, faseId, nuovoTitolo) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== progettoId) return p
        return {
          ...p,
          fasi: p.fasi.map(f =>
            f.id === faseId ? { ...f, titolo: nuovoTitolo } : f
          ),
        }
      })
    )
  }, [])

  // --- CRUD Tasks ---
  const aggiungiTask = useCallback((progettoId, faseId, taskData) => {
    const nuovoTask = {
      id: uuidv4(),
      titolo: taskData.titolo || 'Nuovo Task',
      responsabile: taskData.responsabile || '',
      dataScadenza: taskData.dataScadenza || '',
      stato: taskData.stato || 'todo',
      percentuale: taskData.percentuale || 0,
    }
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== progettoId) return p
        return ricalcolaPercentuali({
          ...p,
          fasi: p.fasi.map(f =>
            f.id === faseId ? { ...f, tasks: [...f.tasks, nuovoTask] } : f
          ),
        })
      })
    )
  }, [])

  const aggiornaTask = useCallback((progettoId, faseId, taskId, taskData) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== progettoId) return p
        return ricalcolaPercentuali({
          ...p,
          fasi: p.fasi.map(f => {
            if (f.id !== faseId) return f
            return {
              ...f,
              tasks: f.tasks.map(t =>
                t.id === taskId ? { ...t, ...taskData } : t
              ),
            }
          }),
        })
      })
    )
  }, [])

  const eliminaTask = useCallback((progettoId, faseId, taskId) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== progettoId) return p
        return ricalcolaPercentuali({
          ...p,
          fasi: p.fasi.map(f => {
            if (f.id !== faseId) return f
            return { ...f, tasks: f.tasks.filter(t => t.id !== taskId) }
          }),
        })
      })
    )
  }, [])

  // --- Export / Import ---
  const esportaJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(projects, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'wbs-backup.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [projects])

  const importaJSON = useCallback((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        if (Array.isArray(data)) {
          const ricalcolati = data.map(p => ricalcolaPercentuali(p))
          setProjects(ricalcolati)
          setActiveProjectId(ricalcolati.length > 0 ? ricalcolati[0].id : null)
        }
      } catch {
        alert('File JSON non valido.')
      }
    }
    reader.readAsText(file)
  }, [])

  return {
    projects,
    activeProject,
    activeProjectId,
    setActiveProjectId,
    aggiungiProgetto,
    eliminaProgetto,
    rinominaProgetto,
    aggiornaProgetto,
    aggiungiFase,
    eliminaFase,
    rinominaFase,
    aggiungiTask,
    aggiornaTask,
    eliminaTask,
    esportaJSON,
    importaJSON,
  }
}
