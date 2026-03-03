# 📊 WBS Office

**Work Breakdown Structure interattiva** per la gestione visuale di progetti complessi.

![WBS Office](https://img.shields.io/badge/React-19-blue?logo=react) ![Vite](https://img.shields.io/badge/Vite-7-purple?logo=vite) ![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)

---

## ✨ Funzionalità

| Feature | Descrizione |
|---|---|
| 🌳 **Albero WBS interattivo** | Visualizzazione top-down ad albero con nodi espandibili/comprimibili |
| 📊 **Dashboard progetto** | Statistiche, avanzamento globale e diagramma di flusso delle fasi |
| 🔢 **Numerazione WBS automatica** | Codici gerarchici generati automaticamente (1, 1.1, 1.1.1, ...) |
| ✏️ **Rinomina inline** | Doppio click su qualsiasi nodo per rinominarlo sul posto |
| 🗂️ **Multi-progetto** | Gestione di più progetti con sidebar navigabile |
| 💾 **Persistenza locale** | Salvataggio automatico su localStorage |
| 📤 **Export / Import JSON** | Backup e ripristino completo dei progetti |
| � **Export PDF** | PDF A4 landscape brandizzato con tabella WBS, barra avanzamento e paginazione |
| 📗 **Export Excel** | Foglio .xlsx con info progetto e tabella WBS, modificabile liberamente |
| �🖱️ **Pan panoramico** | Trascina lo sfondo per navigare l'albero WBS |

---

## 🚀 Avvio rapido

```bash
# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev
```

L'app sarà disponibile su `http://localhost:5173`

---

## 🏗️ Struttura del progetto

```
src/
├── App.jsx                   # Layout principale con tab navigation
├── main.jsx                  # Entry point React
├── index.css                 # Stili globali + connettori albero WBS
├── components/
│   ├── Sidebar.jsx           # Sidebar navigazione progetti
│   ├── Dashboard.jsx         # Dashboard con statistiche e diagramma di flusso
│   ├── WBSTree.jsx           # Albero WBS interattivo (nodi ricorsivi)
│   ├── TaskModal.jsx         # Modale creazione/modifica task
│   ├── ProgressBar.jsx       # Barra di avanzamento riutilizzabile
│   ├── FaseRow.jsx           # Riga fase (vista lista)
│   └── TaskRow.jsx           # Riga task (vista lista)
├── hooks/
│   └── useProjects.js        # Hook CRUD progetti, fasi, task + localStorage
└── utils/
    ├── calcPercent.js         # Calcolo percentuali aggregate
    ├── wbsCode.js             # Generazione codici WBS
    └── exportWBS.js           # Export Excel (.xlsx) e PDF
```

---

## 📐 Architettura dati

```
Progetto
├── id, titolo, percentuale
└── fasi[]
    ├── id, titolo, percentuale
    └── tasks[]
        ├── id, titolo
        ├── responsabile
        ├── dataScadenza
        ├── stato (todo | in-progress | done)
        └── percentuale (0-100)
```

Le percentuali vengono **ricalcolate automaticamente** dal basso verso l'alto:
- `fase.percentuale` = media dei task
- `progetto.percentuale` = media delle fasi

---

## 🛠️ Tech Stack

- **React 19** — UI con componenti funzionali e hooks
- **Vite 7** — Build tool ultrarapido
- **Tailwind CSS 4** — Utility-first styling
- **UUID** — Generazione ID univoci
- **SheetJS (xlsx)** — Generazione file Excel
- **jsPDF + AutoTable** — Generazione documenti PDF
- **localStorage** — Persistenza dati lato client

---

## 📦 Script disponibili

| Comando | Descrizione |
|---|---|
| `npm run dev` | Avvia il server di sviluppo |
| `npm run build` | Build di produzione in `dist/` |
| `npm run preview` | Anteprima della build di produzione |

---

## 📄 Licenza

ISC
