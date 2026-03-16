# WBS Office — Stato dei Lavori

> Ultimo aggiornamento: 9 Marzo 2026

---

## Panoramica Generale

**WBS Office** è un'applicazione web per la gestione progetti in ambito cantieristico/edile. Consente di strutturare il lavoro in una WBS (Work Breakdown Structure), monitorare avanzamenti, costi, materiali e tempistiche attraverso diverse viste interattive.

**Stack tecnologico:** React + Vite, Supabase (backend cloud), TailwindCSS-like inline styling, jsPDF + html-to-image per export.

---

## Funzionalità Implementate

### 1. Autenticazione & Profili Utente
- **Login / Registrazione** con pagina dedicata (split-view con hero e form)
- Autenticazione tramite **Supabase Auth** (email + password)
- **Profilo utente** con nome, email, azienda — salvato su tabella `profiles`
- **Modalità ibrida**: se Supabase non è configurato, l'app funziona in modalità offline con localStorage
- Listener real-time sullo stato di autenticazione
- Splashscreen animato durante il caricamento iniziale

### 2. Persistenza Dati (Cloud + Offline)
- **Storage Provider** con doppio backend:
  - `localProvider` → salvataggio su localStorage del browser
  - `supabaseProvider` → salvataggio su database Supabase con Row Level Security
- Switch automatico: cloud se autenticato, localStorage come fallback
- **Isolamento dati**: ogni utente vede solo i propri progetti (RLS attiva)
- Salvataggio immediato locale + sincronizzazione cloud in background
- Schema database: tabelle `profiles` e `projects` con indici e trigger

### 3. Gestione Progetti (CRUD)
- Creazione, eliminazione, rinomina progetti
- Selezione progetto attivo dalla sidebar
- **Import/Export JSON** per backup e condivisione
- Progetto demo precaricato come esempio

### 4. Albero WBS Interattivo
- Visualizzazione ad **albero orizzontale** con nodi ricorsivi
- Per ogni nodo: codice WBS (es. 1.2.3), titolo, stato, percentuale
- **Azioni su ogni nodo:**
  - Aggiungi figlio, Modifica, Elimina
  - Sposta su/giù (riordino tra fratelli)
  - Sposta sinistra/destra (riordino laterale)
  - Promuovi livello / Declassa livello
  - Editing inline del titolo (doppio-click)
- **Badge informativi**: priorità, materiali (📦), costi (💰), note (📝)
- **Bordi colorati** per stato (semaforo: rosso/giallo/verde)
- **Export**: PDF visuale dell'albero, Excel tabellare, JSON completo
- Tema scuro navy/oro

### 5. Dashboard
- Vista **workflow a cards** dei nodi principali del progetto
- Ogni card mostra: stato, percentuale, progress bar, lista figli
- **Sistema semaforo** coerente: rosso (da fare), giallo (in corso), verde (completato)
- Frecce di connessione tra cards
- Click su card per aprire il dettaglio/modifica

### 6. Cronoprogramma Gantt
- **Gantt chart interattivo** con griglia temporale giornaliera
- Colonna sinistra fissa con codice WBS e titolo
- Barre colorate per stato con riempimento proporzionale alla percentuale
- **Zoom a 3 livelli** (×0.5, ×1, ×2)
- Linea "oggi" evidenziata
- Calcolo automatico date e stato dai nodi figli
- Header con mesi e giorni della settimana
- **Export PDF** paesaggistico A4 con colori e paginazione

### 7. Gestione Costi & Materiali
- **3 card riepilogo**: Budget Previsto, Totale Materiali, Stato Ordini
- Tabella dettaglio per ogni voce WBS con:
  - Breadcrumb del percorso (Progetto > Fase > Attività)
  - Lista materiali: descrizione, quantità, fornitore, costo unitario
  - **Stato ordine** per materiale: Da ordinare → Ordinato → In consegna → Ricevuto
- Badge colorate per ogni stato ordine
- Formattazione importi in formato italiano (es. 1.234,56 €)

### 8. Scheda Dettaglio Attività (TaskModal)
- **3 tab**: Generale, Materiali & Costi, Note
- **Tab Generale**: titolo, responsabile, date inizio/scadenza, stato, % avanzamento, priorità
- **Tab Materiali**: budget voce, lista materiali con CRUD inline, stati ordine, calcolo automatico totali
- **Tab Note**: textarea libera per annotazioni
- Priorità con badge colorate (Urgente 🔴, Alta 🟠, Media 🟡, Bassa ⚪)
- Validazioni client-side

### 9. Sidebar
- Logo "RS" con gradient + titolo "WBS Office"
- Lista progetti con selezione, percentuale, eliminazione (con conferma)
- Bottoni import/export JSON
- **Sezione profilo utente**: avatar, nome, email, bottone logout
- **Indicatore stato cloud**:
  - 🟢 Verde pulsante: sincronizzazione cloud attiva
  - 🟡 Giallo: cloud pronto, login richiesto
  - ⚫ Grigio: modalità offline

### 10. Layout & Navigazione
- Layout a due colonne: sidebar (264px) + area contenuto principale
- **4 viste navigabili** tramite tab: Dashboard, Albero WBS, Costi, Cronoprogramma
- Empty state per nessun progetto selezionato
- Responsive (adattamento mobile/tablet)

---

## Struttura File

```
├── .env                          # Variabili ambiente Supabase
├── .env.example                  # Template variabili ambiente
├── index.html                    # Entry point HTML
├── package.json                  # Dipendenze e script
├── vite.config.js                # Configurazione Vite
├── supabase/
│   └── schema.sql                # Schema database (profiles, projects, RLS)
├── src/
│   ├── main.jsx                  # Entry point React + AuthProvider
│   ├── App.jsx                   # Layout principale + routing viste
│   ├── index.css                 # Stili globali
│   ├── lib/
│   │   ├── supabaseClient.js     # Client Supabase
│   │   ├── AuthContext.jsx       # Context autenticazione
│   │   └── storageProvider.js    # Astrazione persistenza dati
│   ├── hooks/
│   │   └── useProjects.js        # Hook CRUD progetti + sync
│   ├── components/
│   │   ├── LoginPage.jsx         # Pagina login/registrazione
│   │   ├── Sidebar.jsx           # Pannello laterale
│   │   ├── Dashboard.jsx         # Vista dashboard workflow
│   │   ├── WBSTree.jsx           # Albero WBS interattivo
│   │   ├── GanttChart.jsx        # Cronoprogramma Gantt
│   │   ├── CostiManagement.jsx   # Gestione costi/materiali
│   │   ├── TaskModal.jsx         # Scheda dettaglio attività
│   │   ├── TaskRow.jsx           # Riga tabellare attività
│   │   ├── FaseRow.jsx           # Riga fase
│   │   └── ProgressBar.jsx       # Barra avanzamento
│   └── utils/
│       ├── calcPercent.js        # Calcolo percentuali ricorsivo
│       ├── exportWBS.js          # Export Excel/PDF
│       └── wbsCode.js            # Generazione codici WBS
```

---

## Storico Commit

| Commit | Descrizione |
|--------|-------------|
| `a422cd2` | Supabase integration, login page, profiles, Gantt, Costi, semaforo, sidebar redesign |
| `4f10d68` | Fix PDF albero WBS con nodi bianchi leggibili per stampa |
| `c83319e` | Fix PDF tree export - celle sfondo bianco, bordo scuro, testo leggibile |
| `d57eced` | Note/materiali/costi per nodo, promuovi/declassa livello, legenda comandi |
| `5c22af0` | Aggiornamento README completo |
| `b08f370` | PDF albero WBS con sfondo bianco per stampa |
| `ad34e11` | Sostituito html2canvas con html-to-image per export PDF albero |
| `1d63fcc` | Eliminato errore oklch in stampa PDF albero |
| `5fd22c2` | Risolto errore oklch in export PDF albero |
| `7be8ed0` | Risolto errore oklch in export PDF albero WBS |
| `783d642` | PDF albero WBS con sfondo bianco per stampa |
| `bf7c490` | Stampa PDF visuale dell'albero WBS |
| `2edd592` | Export Excel e PDF della WBS |
| `c11b4f4` | README.md con documentazione completa |
| `4ab845a` | Sidebar ridisegnata - gradiente, testi leggibili, bottone CTA |
| `ebe270b` | WBS Interattiva - albero orizzontale panoramico + tema scuro |
| `eee90c0` | Dashboard: diagramma di flusso espandibile toggle verticale/orizzontale |
| `df7f63d` | Dashboard con diagramma di flusso e tab navigation |
| `07e3170` | First commit: WBS MVP |

---

## Stato Attuale

- ✅ Autenticazione e profili utente
- ✅ Persistenza cloud con Supabase + fallback offline
- ✅ Albero WBS completo con editing, riordino, promozione/declassamento
- ✅ Dashboard workflow con semaforo
- ✅ Cronoprogramma Gantt interattivo con export PDF
- ✅ Gestione costi, budget e materiali con stati ordine
- ✅ Scheda dettaglio attività a 3 tab
- ✅ Export PDF/Excel/JSON
- ✅ Import/Export progetti per backup
- ✅ Sidebar con profilo e stato cloud
- ✅ Design responsive
