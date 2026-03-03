import { useState, useRef, Children } from 'react'
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'
import TaskModal from './TaskModal'

/* ─── Priority colors ─── */
const PRIORITA_COLORI = {
  urgente: 'bg-red-500/20 text-red-400 border-red-500/40',
  alta: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  media: 'bg-amber-500/10 text-amber-400/50 border-amber-500/20',
  bassa: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
}

/* ─── Recursive Tree Node ─── */
function TreeNode({ wbsCode, titolo, nodo, onAdd, onEdit, onDelete, onRename, onMoveUp, onMoveDown, onMoveLeft, onMoveRight, onPromote, onDemote, children: childElements }) {
  const [expanded, setExpanded] = useState(true)
  const [editing, setEditing] = useState(false)
  const [titleTemp, setTitleTemp] = useState(titolo)

  const childArray = Children.toArray(childElements)
  const hasChildren = childArray.length > 0

  const handleSave = () => {
    if (titleTemp.trim() && onRename) {
      onRename(titleTemp.trim())
    } else {
      setTitleTemp(titolo)
    }
    setEditing(false)
  }

  return (
    <div className="flex flex-col items-center">
      {/* ── Node Card ── */}
      <div className="wbs-node-card relative border-2 border-amber-500/70 rounded-lg px-5 py-3 min-w-[170px] max-w-[240px] bg-[#0d2137] text-center shadow-lg shadow-amber-900/20 hover:border-amber-400 hover:shadow-amber-800/30 transition-all select-none">
        <div className="text-amber-400 font-bold text-sm">{wbsCode}</div>

        {editing ? (
          <input
            value={titleTemp}
            onChange={e => setTitleTemp(e.target.value)}
            onBlur={handleSave}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') { setTitleTemp(titolo); setEditing(false) }
            }}
            className="w-full bg-[#0a1628] border border-amber-500/50 rounded px-2 py-1 text-xs text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400 text-center mt-1"
            autoFocus
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <div
            className="text-amber-300/90 text-xs font-medium mt-1 leading-relaxed"
            onDoubleClick={e => {
              e.stopPropagation()
              if (onRename) { setTitleTemp(titolo); setEditing(true) }
            }}
            title={onRename ? 'Doppio click per rinominare' : ''}
          >
            {titolo}
          </div>
        )}

        {/* Info badges */}
        {nodo && (
          <div className="flex flex-wrap justify-center gap-1 mt-1.5">
            {nodo.priorita && nodo.priorita !== 'media' && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${PRIORITA_COLORI[nodo.priorita] || ''}`}>
                {nodo.priorita === 'urgente' ? '🔴' : nodo.priorita === 'alta' ? '🟠' : '🟢'} {nodo.priorita}
              </span>
            )}
            {nodo.materiali && nodo.materiali.length > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full border bg-blue-500/10 text-blue-400 border-blue-500/25">
                📦 {nodo.materiali.length}
              </span>
            )}
            {(nodo.costoTotale !== '' && nodo.costoTotale !== undefined && nodo.costoTotale > 0) && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/25">
                💰 €{Number(nodo.costoTotale).toLocaleString('it-IT')}
              </span>
            )}
            {nodo.note && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full border bg-violet-500/10 text-violet-400 border-violet-500/25" title={nodo.note}>
                📝
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center items-center gap-1.5 mt-2.5">
          {onAdd && (
            <button
              onClick={e => { e.stopPropagation(); onAdd() }}
              className="text-[10px] px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/50 rounded-full text-amber-400 font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              + Figlio
            </button>
          )}
          {onEdit && (
            <button
              onClick={e => { e.stopPropagation(); onEdit() }}
              className="w-7 h-7 flex items-center justify-center bg-amber-500/15 hover:bg-amber-500/35 border border-amber-500/40 rounded-full text-amber-400 transition-colors cursor-pointer"
              title="Modifica"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {!onEdit && onRename && (
            <button
              onClick={e => { e.stopPropagation(); setTitleTemp(titolo); setEditing(true) }}
              className="w-7 h-7 flex items-center justify-center bg-amber-500/15 hover:bg-amber-500/35 border border-amber-500/40 rounded-full text-amber-400 transition-colors cursor-pointer"
              title="Rinomina"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={e => { e.stopPropagation(); onDelete() }}
              className="w-7 h-7 flex items-center justify-center bg-red-500/10 hover:bg-red-500/30 border border-red-500/30 rounded-full text-red-400 transition-colors cursor-pointer"
              title="Elimina"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>

        {/* Move Buttons — reorder among siblings */}
        {(onMoveUp || onMoveDown || onMoveLeft || onMoveRight) && (
          <div className="flex justify-center items-center gap-1 mt-1.5">
            {onMoveLeft && (
              <button
                onClick={e => { e.stopPropagation(); onMoveLeft() }}
                className="w-6 h-6 flex items-center justify-center bg-sky-500/15 hover:bg-sky-500/35 border border-sky-500/40 rounded-full text-sky-400 transition-colors cursor-pointer"
                title="Sposta a sinistra (tra fratelli)"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            {onMoveUp && (
              <button
                onClick={e => { e.stopPropagation(); onMoveUp() }}
                className="w-6 h-6 flex items-center justify-center bg-sky-500/15 hover:bg-sky-500/35 border border-sky-500/40 rounded-full text-sky-400 transition-colors cursor-pointer"
                title="Sposta su (tra fratelli)"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            )}
            {onMoveDown && (
              <button
                onClick={e => { e.stopPropagation(); onMoveDown() }}
                className="w-6 h-6 flex items-center justify-center bg-sky-500/15 hover:bg-sky-500/35 border border-sky-500/40 rounded-full text-sky-400 transition-colors cursor-pointer"
                title="Sposta giù (tra fratelli)"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
            {onMoveRight && (
              <button
                onClick={e => { e.stopPropagation(); onMoveRight() }}
                className="w-6 h-6 flex items-center justify-center bg-sky-500/15 hover:bg-sky-500/35 border border-sky-500/40 rounded-full text-sky-400 transition-colors cursor-pointer"
                title="Sposta a destra (tra fratelli)"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Promote / Demote — change hierarchy level */}
        {(onPromote || onDemote) && (
          <div className="flex justify-center items-center gap-1 mt-1">
            {onPromote && (
              <button
                onClick={e => { e.stopPropagation(); onPromote() }}
                className="h-5 flex items-center gap-0.5 px-1.5 bg-emerald-500/15 hover:bg-emerald-500/35 border border-emerald-500/40 rounded-full text-emerald-400 transition-colors cursor-pointer"
                title="Promuovi (sali di livello)"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                </svg>
                <span className="text-[8px] font-bold">LIV</span>
              </button>
            )}
            {onDemote && (
              <button
                onClick={e => { e.stopPropagation(); onDemote() }}
                className="h-5 flex items-center gap-0.5 px-1.5 bg-violet-500/15 hover:bg-violet-500/35 border border-violet-500/40 rounded-full text-violet-400 transition-colors cursor-pointer"
                title="Declassa (scendi di livello)"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
                <span className="text-[8px] font-bold">LIV</span>
              </button>
            )}
          </div>
        )}

        {/* Expand / Collapse toggle */}
        {hasChildren && (
          <button
            onClick={e => { e.stopPropagation(); setExpanded(!expanded) }}
            className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#0d2137] border border-amber-500/50 flex items-center justify-center text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer z-10"
            title={expanded ? 'Comprimi' : 'Espandi'}
          >
            <svg className={`w-3 h-3 transition-transform duration-200 ${expanded ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Children with connector lines ── */}
      {hasChildren && expanded && (
        <div className="flex flex-col items-center">
          {/* Vertical line: parent → horizontal bar */}
          <div className="w-px h-10 bg-amber-500/30" />

          {/* Row of children */}
          <div className="flex items-start wbs-children-row">
            {childArray.map((child, i) => (
              <div key={child.key || i} className="wbs-child-wrapper flex flex-col items-center px-4">
                {child}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Main WBSTree component ─── */
export default function WBSTree({
  progetto,
  progettoIndex,
  onRinominaProgetto,
  onAggiungiNodo,
  onEliminaNodo,
  onRinominaNodo,
  onAggiornaNodo,
  onSpostaNodo,
  onSpostaNodoLaterale,
  onPromuoviNodo,
  onDeclassaNodo,
}) {
  const [modal, setModal] = useState(null)
  const containerRef = useRef(null)
  const treeRef = useRef(null)
  const [isPanning, setIsPanning] = useState(false)
  const [exporting, setExporting] = useState(false)
  const panRef = useRef({ startX: 0, startY: 0, scrollX: 0, scrollY: 0 })

  /* ── Export tree as visual PDF ── */
  const handleExportTreePDF = async () => {
    if (!treeRef.current) return
    setExporting(true)
    try {
      const container = containerRef.current
      const tree = treeRef.current

      // Temporarily remove clipping so the full tree is visible
      const prevOverflow = container.style.overflow
      const prevHeight = container.style.height
      const prevMaxHeight = container.style.maxHeight
      container.style.overflow = 'visible'
      container.style.height = 'auto'
      container.style.maxHeight = 'none'

      // Hide action buttons for cleaner print
      const btns = tree.querySelectorAll('button')
      btns.forEach(b => b.style.display = 'none')

      // ── Apply print-friendly light theme temporarily ──
      const savedStyles = new Map()

      // Tree background → white
      savedStyles.set(tree, { backgroundColor: tree.style.backgroundColor })
      tree.style.backgroundColor = '#ffffff'

      // Inject comprehensive print-override CSS with !important to beat Tailwind
      const printCSS = document.createElement('style')
      printCSS.textContent = `
        .wbs-node-card {
          background-color: #ffffff !important;
          border-color: #92400e !important;
          box-shadow: 0 1px 4px rgba(0,0,0,0.12) !important;
        }
        .wbs-node-card * {
          color: #1e293b !important;
        }
        .wbs-node-card .text-amber-400,
        .wbs-node-card .text-amber-300\\/90 {
          color: #92400e !important;
        }
        .wbs-node-card span[class*="bg-red"], .wbs-node-card span[class*="bg-blue"],
        .wbs-node-card span[class*="bg-emerald"], .wbs-node-card span[class*="bg-violet"],
        .wbs-node-card span[class*="bg-orange"], .wbs-node-card span[class*="bg-amber"],
        .wbs-node-card span[class*="bg-slate"] {
          background-color: #f1f5f9 !important;
          border-color: #94a3b8 !important;
          color: #334155 !important;
        }
        .wbs-child-wrapper::before, .wbs-child-wrapper::after {
          background-color: #92400e !important;
        }
        [class*="bg-amber-500\\/30"], [class*="bg-amber-500\\/20"] {
          background-color: #92400e !important;
        }
        .w-px.bg-amber-500\\/30, .h-px.bg-amber-500\\/30,
        [class*="w-px"][class*="bg-amber"], [class*="h-px"][class*="bg-amber"] {
          background-color: #92400e !important;
        }
      `
      document.head.appendChild(printCSS)

      // Also force connector lines via inline for reliability
      tree.querySelectorAll('[class*="bg-amber"]').forEach(el => {
        const tag = el.tagName
        if (tag !== 'BUTTON' && tag !== 'SPAN') {
          if (!savedStyles.has(el)) savedStyles.set(el, {})
          savedStyles.get(el).backgroundColor = el.style.backgroundColor
          el.style.backgroundColor = '#92400e'
        }
      })

      // Capture the tree using html-to-image (native browser rendering — supports oklch)
      const dataUrl = await toPng(tree, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        filter: (node) => {
          if (node.tagName === 'BUTTON') return false
          return true
        },
      })

      // ── Restore original dark theme ──
      document.head.removeChild(printCSS)
      savedStyles.forEach((saved, el) => {
        Object.entries(saved).forEach(([prop, val]) => {
          el.style[prop] = val || ''
        })
      })

      // Restore buttons & container
      btns.forEach(b => b.style.display = '')
      container.style.overflow = prevOverflow
      container.style.height = prevHeight
      container.style.maxHeight = prevMaxHeight

      // Load the image to get dimensions
      const img = new Image()
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = dataUrl
      })
      const imgW = img.width
      const imgH = img.height

      // A4 landscape dimensions in mm
      const pdfW = 297
      const pdfH = 210
      const margin = 10
      const headerH = 28
      const usableW = pdfW - margin * 2
      const usableH = pdfH - margin - headerH - 8

      // Scale image to fit page width, allow multi-page if tall
      const ratio = usableW / imgW
      const scaledH = imgH * ratio

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

      // ── Branded header (light) ──
      const drawHeader = (pageNum, totalPages) => {
        doc.setFillColor(248, 250, 252)
        doc.rect(0, 0, pdfW, headerH, 'F')
        doc.setDrawColor(180, 83, 9)
        doc.setLineWidth(0.8)
        doc.line(0, headerH, pdfW, headerH)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(16)
        doc.setTextColor(15, 23, 42)
        doc.text('WBS Office \u2013 Albero WBS', margin, 14)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(71, 85, 105)
        doc.text(`Progetto: ${progetto.titolo}`, margin, 21)
        doc.setTextColor(146, 64, 14)
        doc.text(`Avanzamento: ${progetto.percentuale}%`, margin, 26)
        doc.setTextColor(100, 116, 139)
        doc.text(`Pagina ${pageNum} / ${totalPages}`, pdfW - margin, 26, { align: 'right' })
        doc.text(new Date().toLocaleDateString('it-IT'), pdfW - margin, 21, { align: 'right' })
      }

      const totalPages = Math.max(1, Math.ceil(scaledH / usableH))

      for (let p = 0; p < totalPages; p++) {
        if (p > 0) doc.addPage()
        drawHeader(p + 1, totalPages)

        // Crop from source image for this page
        const srcY = (p * usableH) / ratio
        const srcH = Math.min(usableH / ratio, imgH - srcY)
        if (srcH <= 0) break

        const pageCanvas = document.createElement('canvas')
        pageCanvas.width = imgW
        pageCanvas.height = Math.ceil(srcH)
        const ctx = pageCanvas.getContext('2d')
        ctx.drawImage(img, 0, srcY, imgW, srcH, 0, 0, imgW, srcH)

        const pageImg = pageCanvas.toDataURL('image/png')
        const destH = srcH * ratio
        doc.addImage(pageImg, 'PNG', margin, headerH + 4, usableW, destH)
      }

      doc.save(`WBS_Albero_${progetto.titolo.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`)
    } catch (err) {
      console.error('Errore export PDF albero:', err)
      alert('Errore durante la generazione del PDF. Riprova.')
    } finally {
      setExporting(false)
    }
  }

  /* ── Pan (drag-to-scroll) ── */
  const handleMouseDown = (e) => {
    if (e.target.closest('.wbs-node-card')) return
    e.preventDefault()
    setIsPanning(true)
    panRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      scrollX: containerRef.current.scrollLeft,
      scrollY: containerRef.current.scrollTop,
    }
  }

  const handleMouseMove = (e) => {
    if (!isPanning) return
    e.preventDefault()
    const { startX, startY, scrollX, scrollY } = panRef.current
    containerRef.current.scrollLeft = scrollX - (e.clientX - startX)
    containerRef.current.scrollTop = scrollY - (e.clientY - startY)
  }

  const handleMouseUp = () => setIsPanning(false)

  /* ── Node modal callbacks ── */
  const handleNodeSave = (nodeData) => {
    if (modal.node) {
      // Editing existing node
      onAggiornaNodo(progetto.id, modal.node.id, nodeData)
    } else {
      // Adding new child to parentId
      onAggiungiNodo(progetto.id, modal.parentId, nodeData)
    }
    setModal(null)
  }

  const handleNodeDelete = () => {
    if (modal?.node) {
      onEliminaNodo(progetto.id, modal.node.id)
    }
    setModal(null)
  }

  const rootCode = `${progettoIndex + 1}`

  /* ── Recursive node renderer ── */
  function renderNodo(nodo, index, siblings, parentCode, depth = 1) {
    const code = `${parentCode}.${index + 1}`
    const isLeaf = !nodo.children || nodo.children.length === 0
    const hasSiblings = siblings.length > 1
    const isTopLevel = depth === 1 // direct child of root

    return (
      <TreeNode
        key={nodo.id}
        wbsCode={code}
        titolo={nodo.titolo}
        nodo={nodo}
        onAdd={() => onAggiungiNodo(progetto.id, nodo.id, {})}
        onEdit={() => setModal({ parentId: null, node: nodo })}
        onRename={t => onRinominaNodo(progetto.id, nodo.id, t)}
        onDelete={() => onEliminaNodo(progetto.id, nodo.id)}
        onMoveUp={index > 0 ? () => onSpostaNodo(progetto.id, nodo.id, -1) : null}
        onMoveDown={index < siblings.length - 1 ? () => onSpostaNodo(progetto.id, nodo.id, 1) : null}
        onMoveLeft={hasSiblings && index > 0 ? () => onSpostaNodoLaterale(progetto.id, nodo.id, -1) : null}
        onMoveRight={hasSiblings && index < siblings.length - 1 ? () => onSpostaNodoLaterale(progetto.id, nodo.id, 1) : null}
        onPromote={!isTopLevel ? () => onPromuoviNodo(progetto.id, nodo.id) : null}
        onDemote={index > 0 ? () => onDeclassaNodo(progetto.id, nodo.id) : null}
      >
        {(nodo.children || []).map((child, ci) =>
          renderNodo(child, ci, nodo.children, code, depth + 1)
        )}
      </TreeNode>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0a1929]">
      {/* ── Header bar ── */}
      <div className="shrink-0 px-6 py-3 bg-[#0d2137] border-b border-amber-500/20 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center shrink-0">
          <span className="text-amber-400 font-bold text-sm">WB</span>
        </div>
        <div className="flex-1">
          <h1 className="text-amber-400 font-bold text-lg">WBS Interattiva</h1>
          <p className="text-amber-500/50 text-xs">
            Work Breakdown Structure | Gerarchia libera a livelli infiniti
          </p>
        </div>
        <button
          onClick={handleExportTreePDF}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-600 disabled:opacity-50 disabled:cursor-wait border border-red-500/50 rounded-lg text-white text-sm font-semibold transition-colors cursor-pointer shadow-lg shadow-red-900/30"
          title="Esporta l'albero WBS come PDF visuale"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {exporting ? 'Generazione...' : 'Stampa PDF'}
        </button>
      </div>

      <p className="shrink-0 text-center text-amber-500/30 text-[11px] py-2 bg-[#0a1929] border-b border-amber-500/10">
        Trascina lo sfondo per navigare. Doppio click sui nomi per rinominare. Frecce azzurre = riordina tra fratelli. Frecce verdi/viola con LIV = cambia livello gerarchico.
      </p>

      {/* ── Legenda comandi ── */}
      <div className="shrink-0 bg-[#091a2a] border-b border-amber-500/10 px-6 py-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[10px]">
        <span className="text-amber-500/50 font-semibold mr-1">LEGENDA:</span>

        <span className="flex items-center gap-1">
          <span className="inline-block w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-400 text-center leading-5 text-[9px] font-bold">+</span>
          <span className="text-amber-300/50">Aggiungi figlio</span>
        </span>

        <span className="flex items-center gap-1">
          <span className="inline-block w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-center leading-5">✏</span>
          <span className="text-amber-300/50">Modifica scheda (note, materiali, costi…)</span>
        </span>

        <span className="flex items-center gap-1">
          <span className="inline-block w-5 h-5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-center leading-5">🗑</span>
          <span className="text-amber-300/50">Elimina nodo</span>
        </span>

        <span className="flex items-center gap-1">
          <span className="inline-flex gap-0.5">
            <span className="inline-block w-4 h-4 rounded-full bg-sky-500/15 border border-sky-500/40 text-sky-400 text-center leading-4 text-[8px]">↑</span>
            <span className="inline-block w-4 h-4 rounded-full bg-sky-500/15 border border-sky-500/40 text-sky-400 text-center leading-4 text-[8px]">↓</span>
            <span className="inline-block w-4 h-4 rounded-full bg-sky-500/15 border border-sky-500/40 text-sky-400 text-center leading-4 text-[8px]">←</span>
            <span className="inline-block w-4 h-4 rounded-full bg-sky-500/15 border border-sky-500/40 text-sky-400 text-center leading-4 text-[8px]">→</span>
          </span>
          <span className="text-amber-300/50">Riordina nello stesso livello</span>
        </span>

        <span className="flex items-center gap-1">
          <span className="inline-flex gap-0.5">
            <span className="inline-block h-4 px-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-center leading-4 text-[8px] font-bold">↑LIV</span>
            <span className="inline-block h-4 px-1 rounded-full bg-violet-500/15 border border-violet-500/40 text-violet-400 text-center leading-4 text-[8px] font-bold">↓LIV</span>
          </span>
          <span className="text-amber-300/50">Promuovi / Declassa livello gerarchico</span>
        </span>

        <span className="flex items-center gap-1">
          <span className="text-amber-400/60">Aa</span>
          <span className="text-amber-300/50">Doppio click sul nome → rinomina</span>
        </span>
      </div>

      {/* ── Pannable / scrollable tree canvas ── */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-auto p-12 select-none ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div ref={treeRef} className="inline-flex justify-center min-w-full pb-16">
          {/* Root = Project */}
          <TreeNode
            wbsCode={rootCode}
            titolo={progetto.titolo}
            nodo={progetto}
            onAdd={() => onAggiungiNodo(progetto.id, progetto.id, {})}
            onEdit={() => setModal({ parentId: null, node: progetto })}
            onRename={t => onRinominaProgetto(progetto.id, t)}
          >
            {(progetto.children || []).map((nodo, i) =>
              renderNodo(nodo, i, progetto.children, rootCode)
            )}
          </TreeNode>
        </div>
      </div>

      {/* ── Node Modal ── */}
      {modal && (
        <TaskModal
          task={modal.node}
          onSave={handleNodeSave}
          onDelete={handleNodeDelete}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
