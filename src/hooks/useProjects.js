import { useState, useEffect, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { ricalcolaPercentuali, migraProgetto } from "../utils/calcPercent";
import { getProvider, isCloudMode } from "../lib/storageProvider";
import { logActivity } from "../lib/activityLogger";

const STORAGE_KEY = "wbs-projects";

/* ─── Helpers ricorsivi per navigare/modificare l'albero ─── */

/** Trova il nodo con l'id dato e il suo genitore, ricorsivamente */
/** Applica una funzione di trasformazione al nodo con l'id dato (ricorsivo, immutabile) */
function mapNodo(nodo, id, fn) {
  if (nodo.id === id) return fn(nodo);
  if (!nodo.children || nodo.children.length === 0) return nodo;
  return { ...nodo, children: nodo.children.map((c) => mapNodo(c, id, fn)) };
}

/** Rimuove il nodo con l'id dato dall'albero (ricorsivo, immutabile) */
function rimuoviNodo(nodo, id) {
  if (!nodo.children) return nodo;
  const filtered = nodo.children.filter((c) => c.id !== id);
  if (filtered.length !== nodo.children.length) {
    return { ...nodo, children: filtered };
  }
  return { ...nodo, children: nodo.children.map((c) => rimuoviNodo(c, id)) };
}

/** Trova il genitore di un nodo con l'id dato */
function trovaGenitore(nodo, id) {
  if (!nodo.children) return null;
  for (const child of nodo.children) {
    if (child.id === id) return nodo;
    const found = trovaGenitore(child, id);
    if (found) return found;
  }
  return null;
}

/** Sposta un nodo tra i suoi fratelli (direzione: -1 su, +1 giù) */
function spostaTratelli(nodo, nodeId, direzione) {
  if (!nodo.children) return nodo;
  const idx = nodo.children.findIndex((c) => c.id === nodeId);
  if (idx >= 0) {
    const newIdx = idx + direzione;
    if (newIdx < 0 || newIdx >= nodo.children.length) return nodo;
    const nuovi = [...nodo.children];
    [nuovi[idx], nuovi[newIdx]] = [nuovi[newIdx], nuovi[idx]];
    return { ...nodo, children: nuovi };
  }
  return {
    ...nodo,
    children: nodo.children.map((c) => spostaTratelli(c, nodeId, direzione)),
  };
}

/** Sposta un nodo nel fratello adiacente del genitore (laterale) */
function spostaLaterale(progetto, nodeId, direzione) {
  const genitore = trovaGenitore(progetto, nodeId);
  if (!genitore) return progetto;
  const nonno = trovaGenitore(progetto, genitore.id);
  if (!nonno) return progetto; // il genitore è il progetto root, non si può spostare lateralmente

  const genIdx = nonno.children.findIndex((c) => c.id === genitore.id);
  const targetIdx = genIdx + direzione;
  if (targetIdx < 0 || targetIdx >= nonno.children.length) return progetto;

  const nodo = genitore.children.find((c) => c.id === nodeId);
  if (!nodo) return progetto;

  // Rimuovi dal genitore attuale, aggiungi al fratello target
  let result = mapNodo(progetto, genitore.id, (g) => ({
    ...g,
    children: g.children.filter((c) => c.id !== nodeId),
  }));
  const targetId = nonno.children[targetIdx].id;
  result = mapNodo(result, targetId, (t) => ({
    ...t,
    children: [...(t.children || []), nodo],
  }));
  return result;
}

/** Promuovi un nodo: lo rimuove dal genitore e lo inserisce come fratello del genitore (sale di livello) */
function promuovi(progetto, nodeId) {
  const genitore = trovaGenitore(progetto, nodeId);
  if (!genitore) return progetto;
  const nonno = trovaGenitore(progetto, genitore.id);
  if (!nonno) {
    // il genitore è il progetto root → il nodo sale al livello top
    if (progetto.id === genitore.id) {
      // nodo è già figlio del root — non può salire oltre
      return progetto;
    }
    return progetto;
  }
  const nodo = genitore.children.find((c) => c.id === nodeId);
  if (!nodo) return progetto;

  // Rimuovi dal genitore
  let result = mapNodo(progetto, genitore.id, (g) => ({
    ...g,
    children: g.children.filter((c) => c.id !== nodeId),
  }));
  // Inserisci dopo il genitore nel nonno
  result = mapNodo(result, nonno.id, (n) => {
    const idx = n.children.findIndex((c) => c.id === genitore.id);
    const nuovi = [...n.children];
    nuovi.splice(idx + 1, 0, nodo);
    return { ...n, children: nuovi };
  });
  return result;
}

/** Declassa un nodo: lo rimuove e lo inserisce come ultimo figlio del fratello precedente (scende di livello) */
function declassa(progetto, nodeId) {
  const genitore = trovaGenitore(progetto, nodeId);
  if (!genitore) return progetto;
  const idx = genitore.children.findIndex((c) => c.id === nodeId);
  if (idx <= 0) return progetto; // nessun fratello precedente

  const nodo = genitore.children[idx];
  const fratelloPrecId = genitore.children[idx - 1].id;

  // Rimuovi dal genitore
  let result = mapNodo(progetto, genitore.id, (g) => ({
    ...g,
    children: g.children.filter((c) => c.id !== nodeId),
  }));
  // Aggiungi come ultimo figlio del fratello precedente
  result = mapNodo(result, fratelloPrecId, (f) => ({
    ...f,
    children: [...(f.children || []), nodo],
  }));
  return result;
}

function caricaDaStorage() {
  // Caricamento sincrono iniziale da localStorage (fallback sempre disponibile)
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filtra eventuali progetti demo residui
        const reali = parsed.filter((p) => p.titolo !== "Progetto Demo");
        if (reali.length > 0) {
          return reali.map((p) => ricalcolaPercentuali(migraProgetto(p)));
        }
        // Se rimangono solo demo, pulisci lo storage
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  } catch {
    // ignore
  }
  return [];
}

/** Salvataggio locale (sempre attivo come cache) */
function salvaSuStorage(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

/** Salvataggio asincrono sul provider attivo (cloud se disponibile) */
async function syncToProvider(projects) {
  try {
    const provider = await getProvider();
    await provider.saveProjects(projects);
  } catch (err) {
    console.warn("[sync] Fallback a localStorage:", err.message);
  }
}

export function useProjects(userId) {
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);

  // Caricamento asincrono dal cloud al mount (se disponibile)
  const cloudLoaded = useRef(false); // diventa true dopo il primo caricamento dal cloud

  useEffect(() => {
    if (isCloudMode() && !cloudLoaded.current) return; // attende il caricamento cloud per evitare di salvare dati stale
    salvaSuStorage(projects); // cache locale sempre aggiornata
    syncToProvider(projects); // sync cloud (no-op se non configurato)
  }, [projects]);

  // Ricarica dal cloud quando cambia utente
  useEffect(() => {
    cloudLoaded.current = false;
    if (!userId) {
      setProjects([]);
      setActiveProjectId(null);
      return;
    }
    (async () => {
      if (!isCloudMode()) {
        // Offline: carica da localStorage
        const local = caricaDaStorage();
        setProjects(local);
        setActiveProjectId(local.length > 0 ? local[0].id : null);
        return;
      }
      try {
        const provider = await getProvider();
        const cloud = await provider.loadProjects();
        console.log("[cloud] loadProjects result:", cloud?.length, "progetti");
        cloudLoaded.current = true;
        if (cloud !== null) {
          const migrated = cloud
            .filter((p) => p.titolo !== "Progetto Demo")
            .map((p) => ricalcolaPercentuali(migraProgetto(p)));
          setProjects(migrated);
          setActiveProjectId(migrated.length > 0 ? migrated[0].id : null);
        } else {
          setProjects([]);
          setActiveProjectId(null);
        }
      } catch {
        cloudLoaded.current = true;
        const local = caricaDaStorage();
        setProjects(local);
        setActiveProjectId(local.length > 0 ? local[0].id : null);
      }
    })();
  }, [userId]);

  const activeProject = projects.find((p) => p.id === activeProjectId) || null;

  // --- CRUD Progetti ---
  const aggiungiProgetto = useCallback(() => {
    const nuovo = ricalcolaPercentuali({
      id: uuidv4(),
      titolo: "Nuovo Progetto",
      percentuale: 0,
      children: [],
    });
    setProjects((prev) => [...prev, nuovo]);
    setActiveProjectId(nuovo.id);
    logActivity("project.create", "project", nuovo.id, { titolo: nuovo.titolo });
  }, []);

  const eliminaProgetto = useCallback(
    (id) => {
      const proj = projects.find((p) => p.id === id);
      setProjects((prev) => {
        const next = prev.filter((p) => p.id !== id);
        return next;
      });
      setActiveProjectId((prev) => {
        if (prev === id) {
          const remaining = projects.filter((p) => p.id !== id && !p.archived);
          return remaining.length > 0 ? remaining[0].id : null;
        }
        return prev;
      });
      logActivity("project.delete", "project", id, { titolo: proj?.titolo });
      // Elimina dal cloud
      (async () => {
        try {
          const provider = await getProvider();
          await provider.deleteProject(id);
        } catch (err) {
          console.warn("[sync] deleteProject error:", err.message);
        }
      })();
    },
    [projects],
  );

  const archiviaProgetto = useCallback(
    (id) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, archived: true } : p)),
      );
      setActiveProjectId((prev) => {
        if (prev === id) {
          const remaining = projects.filter((p) => p.id !== id && !p.archived);
          return remaining.length > 0 ? remaining[0].id : null;
        }
        return prev;
      });
    },
    [projects],
  );

  const ripristinaProgetto = useCallback((id) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, archived: false } : p)),
    );
    setActiveProjectId(id);
  }, []);

  const rinominaProgetto = useCallback((id, nuovoTitolo) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, titolo: nuovoTitolo } : p)),
    );
  }, []);

  // --- Operazioni ricorsive sui nodi ---

  /** Aggiunge un nodo figlio a qualsiasi nodo nell'albero */
  const aggiungiNodo = useCallback((progettoId, parentId, nodeData = {}) => {
    const nuovoNodo = {
      id: uuidv4(),
      titolo: nodeData.titolo || "Nuovo Elemento",
      responsabile: nodeData.responsabile || "",
      dataScadenza: nodeData.dataScadenza || "",
      dataInizio: nodeData.dataInizio || "",
      stato: nodeData.stato || "todo",
      percentuale: nodeData.percentuale || 0,
      priorita: nodeData.priorita || "media",
      costoTotale: nodeData.costoTotale ?? "",
      costoReale: nodeData.costoReale ?? "",
      materiali: nodeData.materiali || [],
      note: nodeData.note || "",
      noteGrid: nodeData.noteGrid || null,
      children: [],
    };
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== progettoId) return p;
        const aggiornato = mapNodo(p, parentId, (parent) => ({
          ...parent,
          children: [...(parent.children || []), nuovoNodo],
        }));
        return ricalcolaPercentuali(aggiornato);
      }),
    );
    logActivity("node.create", "node", nuovoNodo.id, { titolo: nuovoNodo.titolo, progettoId });
  }, []);

  /** Elimina qualsiasi nodo dall'albero (e tutti i suoi discendenti) */
  const eliminaNodo = useCallback((progettoId, nodeId) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== progettoId) return p;
        return ricalcolaPercentuali(rimuoviNodo(p, nodeId));
      }),
    );
    logActivity("node.delete", "node", nodeId, { progettoId });
  }, []);

  /** Rinomina qualsiasi nodo */
  const rinominaNodo = useCallback((progettoId, nodeId, nuovoTitolo) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== progettoId) return p;
        return mapNodo(p, nodeId, (n) => ({ ...n, titolo: nuovoTitolo }));
      }),
    );
  }, []);

  /** Aggiorna le proprietà di un nodo (per il modal di editing) */
  const aggiornaNodo = useCallback((progettoId, nodeId, data) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== progettoId) return p;
        return ricalcolaPercentuali(
          mapNodo(p, nodeId, (n) => ({ ...n, ...data })),
        );
      }),
    );
    logActivity("node.update", "node", nodeId, { progettoId, fields: Object.keys(data) });
  }, []);

  /** Sposta un nodo su/giù tra i suoi fratelli */
  const spostaNodo = useCallback((progettoId, nodeId, direzione) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== progettoId) return p;
        return spostaTratelli(p, nodeId, direzione);
      }),
    );
  }, []);

  /** Sposta un nodo lateralmente (nel fratello adiacente del genitore) */
  const spostaNodoLaterale = useCallback((progettoId, nodeId, direzione) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== progettoId) return p;
        return ricalcolaPercentuali(spostaLaterale(p, nodeId, direzione));
      }),
    );
  }, []);

  /** Promuovi un nodo (sale di un livello nella gerarchia) */
  const promuoviNodo = useCallback((progettoId, nodeId) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== progettoId) return p;
        return ricalcolaPercentuali(promuovi(p, nodeId));
      }),
    );
  }, []);

  /** Declassa un nodo (scende di un livello, diventa figlio del fratello precedente) */
  const declassaNodo = useCallback((progettoId, nodeId) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== progettoId) return p;
        return ricalcolaPercentuali(declassa(p, nodeId));
      }),
    );
  }, []);

  /** Sostituisce un intero progetto con uno snapshot (usato per undo) */
  const replaceProgetto = useCallback((progettoId, snapshot) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === progettoId ? snapshot : p)),
    );
  }, []);

  // --- Export / Import ---
  const esportaJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(projects, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wbs-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [projects]);

  const importaJSON = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data)) {
          const ricalcolati = data.map((p) =>
            ricalcolaPercentuali(migraProgetto(p)),
          );
          setProjects(ricalcolati);
          setActiveProjectId(ricalcolati.length > 0 ? ricalcolati[0].id : null);
        }
      } catch {
        alert("File JSON non valido.");
      }
    };
    reader.readAsText(file);
  }, []);

  return {
    projects,
    activeProject,
    activeProjectId,
    setActiveProjectId,
    aggiungiProgetto,
    eliminaProgetto,
    archiviaProgetto,
    ripristinaProgetto,
    rinominaProgetto,
    aggiungiNodo,
    eliminaNodo,
    rinominaNodo,
    aggiornaNodo,
    spostaNodo,
    spostaNodoLaterale,
    promuoviNodo,
    declassaNodo,
    replaceProgetto,
    esportaJSON,
    importaJSON,
  };
}
