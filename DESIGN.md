# WBS Office — Design System (Neo-Brutalism)

Stile ispirato a **Encreade.com** e **Codecademy**: Neo-Brutalism chiaro, professionale, adatto a contesto ufficio.

---

## Principi

| Principio | Regola |
|---|---|
| **No gradienti** | Mai `bg-gradient-*`. Solo colori piatti |
| **Bordi spessi** | `border-2 border-black` su card, bottoni, input, modal |
| **Ombre solide** | `shadow-[4px_4px_0px_#000]` — offset rigido, zero blur |
| **Colori vivaci** | Palette pastello piena (no opacity, no trasparenze) |
| **Alto contrasto** | Testo nero su sfondo chiaro. Mai grigio chiaro su bianco |
| **Effetto fisico** | Hover = traslazione + rimozione ombra (bottone che si "preme") |
| **Angoli morbidi** | `rounded-xl` (neo-brutalism, non brutalism puro) |

---

## Palette Colori

### Sfondo
| Token | Classe | Hex | Uso |
|---|---|---|---|
| bg-base | `bg-white` | `#FFFFFF` | Sfondo principale contenuto |
| bg-surface | `bg-gray-50` | `#F9FAFB` | Sfondo pagina, aree secondarie |
| bg-sidebar | `bg-gray-900` | `#111827` | Sidebar (scura per contrasto) |

### Accenti (piatti, senza gradient)
| Nome | Classe | Hex | Uso |
|---|---|---|---|
| Primario | `bg-amber-400` | `#FBBF24` | Bottoni primari, logo, brand |
| Secondario | `bg-sky-300` | `#7DD3FC` | Info, link, tab attivo |
| Successo | `bg-lime-300` | `#BEF264` | Stato "done", percentuali alte |
| Warning | `bg-yellow-300` | `#FDE047` | Stato "in-progress" |
| Errore | `bg-rose-300` | `#FDA4AF` | Stato "todo", errori, delete |
| Viola | `bg-violet-300` | `#C4B5FD` | Badge, accent secondario |

### Testo
| Token | Classe | Uso |
|---|---|---|
| Principale | `text-black` | Titoli, label, body text |
| Secondario | `text-gray-600` | Descrizioni, meta info |
| Su sidebar | `text-white` / `text-gray-400` | Testo su sfondo scuro |
| Su accento | `text-black` | Testo su bottoni colorati (mai bianco) |

---

## Componenti

### Bottone Primario
```
className="bg-amber-400 text-black font-bold border-2 border-black 
           rounded-xl px-5 py-2.5 shadow-[4px_4px_0px_#000] 
           hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none 
           transition-all cursor-pointer"
```

### Bottone Secondario
```
className="bg-white text-black font-bold border-2 border-black 
           rounded-xl px-5 py-2.5 shadow-[3px_3px_0px_#000] 
           hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000] 
           transition-all cursor-pointer"
```

### Bottone Danger
```
className="bg-rose-300 text-black font-bold border-2 border-black 
           rounded-xl px-4 py-2 shadow-[3px_3px_0px_#000] 
           hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000] 
           transition-all cursor-pointer"
```

### Card
```
className="bg-white border-2 border-black rounded-xl p-5 
           shadow-[4px_4px_0px_#000]"
```

### Card con colore accent (es. stato)
```
className="bg-lime-300 border-2 border-black rounded-xl p-4 
           shadow-[3px_3px_0px_#000]"
```

### Input / Select
```
className="w-full border-2 border-black rounded-xl px-4 py-2.5 
           text-sm font-medium bg-white 
           focus:outline-none focus:ring-2 focus:ring-amber-400 
           focus:shadow-[2px_2px_0px_#000]"
```

### Badge / Pill
```
className="inline-block px-3 py-1 text-xs font-bold uppercase 
           border-2 border-black rounded-full bg-sky-300"
```

### Tab Attivo
```
className="px-4 py-2.5 text-sm font-bold bg-amber-400 text-black 
           border-2 border-black rounded-t-xl 
           shadow-[2px_-2px_0px_#000] -mb-[2px]"
```

### Tab Inattivo
```
className="px-4 py-2.5 text-sm font-bold text-gray-500 
           hover:text-black hover:bg-gray-100 
           rounded-t-xl border-2 border-transparent 
           transition-all cursor-pointer"
```

### Modal
```
{/* Overlay */}
className="fixed inset-0 bg-black/50 z-40"

{/* Contenuto */}
className="bg-white border-3 border-black rounded-2xl p-6 
           shadow-[8px_8px_0px_#000] max-w-lg w-full"
```

---

## Sidebar

- Sfondo scuro: `bg-gray-900`
- Logo: box `bg-amber-400 border-2 border-black` con testo nero
- Progetto attivo: `bg-amber-400/20 border-l-4 border-amber-400`
- Progetto hover: `hover:bg-white/5`
- Bottone "Nuovo Progetto": stile Bottone Primario
- Footer cloud sync: `border-t border-gray-700`

---

## Stato Nodi (colori piatti)

| Stato | Background | Badge |
|---|---|---|
| `todo` | `bg-rose-300` | `bg-rose-400` |
| `in-progress` | `bg-yellow-300` | `bg-yellow-400` |
| `done` | `bg-lime-300` | `bg-lime-400` |

---

## Regole Generali

1. **Mai usare** `shadow-sm`, `shadow-md`, `shadow-lg` → solo `shadow-[Npx_Npx_0px_#000]`
2. **Mai usare** opacità sui bordi → `border-black` sempre pieno
3. **Mai** `rounded-sm` o `rounded-md` → minimo `rounded-xl`
4. **Font weight**: titoli `font-extrabold`, body `font-bold`, meta `font-semibold`
5. **Uppercase** su: label piccole, badge, bottoni di azione
6. **Connector lines** WBS: `background: #000` (nere, non grigie trasparenti)
7. **Hover universale**: traslazione + riduzione ombra (effetto "press")
8. **Focus ring**: `focus:ring-2 focus:ring-amber-400` (mai ring blu default)
