import { useState, useRef, Children } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import TaskModal from './TaskModal'

/* ─── Recursive Tree Node ─── */
function TreeNode({ wbsCode, titolo, onAdd, onEdit, onDelete, onRename, children: childElements }) {
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
  onAggiungiFase,
  onEliminaFase,
  onRinominaFase,
  onAggiungiTask,
  onAggiornaTask,
  onEliminaTask,
  onRinominaProgetto,
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
      // Temporarily expand tree fully and remove clipping for capture
      const container = containerRef.current
      const prevOverflow = container.style.overflow
      const prevHeight = container.style.height
      const prevMaxHeight = container.style.maxHeight
      container.style.overflow = 'visible'
      container.style.height = 'auto'
      container.style.maxHeight = 'none'

      // ── Apply print-friendly theme (white bg, dark text) ──
      const tree = treeRef.current
      tree.style.backgroundColor = '#ffffff'

      const cards = tree.querySelectorAll('.wbs-node-card')
      const savedCardStyles = []
      cards.forEach(card => {
        savedCardStyles.push({
          bg: card.style.backgroundColor,
          border: card.style.borderColor,
          color: card.style.color,
        })
        card.style.backgroundColor = '#f8fafc'
        card.style.borderColor = '#d97706'
      })

      // Change text colors to dark for readability on white
      const amberTexts = tree.querySelectorAll('[class*="text-amber"]')
      const savedTextColors = []
      amberTexts.forEach(el => {
        savedTextColors.push(el.style.color)
        // WBS codes → dark amber, titles → dark gray
        if (el.classList.contains('font-bold') && el.textContent.match(/^\d/)) {
          el.style.color = '#92400e' // amber-800
        } else {
          el.style.color = '#1e293b' // slate-800
        }
      })

      // Change connector lines to dark
      const connectors = tree.querySelectorAll('.wbs-child-wrapper, .wbs-children-row')
      const vLines = tree.querySelectorAll('.bg-amber-500\\/30')
      const savedLineBgs = []
      vLines.forEach(line => {
        savedLineBgs.push(line.style.backgroundColor)
        line.style.backgroundColor = '#d97706'
      })

      // Hide action buttons for cleaner print
      const actionBtns = tree.querySelectorAll('button')
      const savedBtnDisplay = []
      actionBtns.forEach(btn => {
        savedBtnDisplay.push(btn.style.display)
        btn.style.display = 'none'
      })

      const canvas = await html2canvas(tree, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      })

      // ── Restore original dark theme ──
      tree.style.backgroundColor = ''
      cards.forEach((card, i) => {
        card.style.backgroundColor = savedCardStyles[i].bg
        card.style.borderColor = savedCardStyles[i].border
        card.style.color = savedCardStyles[i].color
      })
      amberTexts.forEach((el, i) => { el.style.color = savedTextColors[i] })
      vLines.forEach((line, i) => { line.style.backgroundColor = savedLineBgs[i] })
      actionBtns.forEach((btn, i) => { btn.style.display = savedBtnDisplay[i] })
      container.style.overflow = prevOverflow
      container.style.height = prevHeight
      container.style.maxHeight = prevMaxHeight

      const imgData = canvas.toDataURL('image/png')
      const imgW = canvas.width
      const imgH = canvas.height

      // A4 landscape dimensions in mm
      const pdfW = 297
      const pdfH = 210
      const margin = 10
      const headerH = 28
      const usableW = pdfW - margin * 2
      const usableH = pdfH - margin - headerH - 8

      // Scale image to fit page width, allow multi-page if tall
      const ratio = usableW / imgW
      const scaledW = usableW
      const scaledH = imgH * ratio

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

      // ── Branded header (white-friendly) ──
      const drawHeader = (pageNum, totalPages) => {
        // Subtle light header band
        doc.setFillColor(248, 250, 252) // slate-50
        doc.rect(0, 0, pdfW, headerH, 'F')
        doc.setDrawColor(217, 119, 6) // amber-600
        doc.setLineWidth(0.8)
        doc.line(0, headerH, pdfW, headerH)

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(16)
        doc.setTextColor(15, 23, 42) // slate-900
        doc.text('WBS Office – Albero WBS', margin, 14)

        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(71, 85, 105) // slate-600
        doc.text(`Progetto: ${progetto.titolo}`, margin, 21)
        doc.setTextColor(146, 64, 14) // amber-800
        doc.text(`Avanzamento: ${progetto.percentuale}%`, margin, 26)

        doc.setTextColor(100, 116, 139) // slate-500
        doc.text(`Pagina ${pageNum} / ${totalPages}`, pdfW - margin, 26, { align: 'right' })
        doc.text(new Date().toLocaleDateString('it-IT'), pdfW - margin, 21, { align: 'right' })
      }

      // Calculate total pages
      const totalPages = Math.max(1, Math.ceil(scaledH / usableH))

      for (let p = 0; p < totalPages; p++) {
        if (p > 0) doc.addPage()
        drawHeader(p + 1, totalPages)

        // Source crop from canvas
        const srcY = (p * usableH) / ratio
        const srcH = Math.min(usableH / ratio, imgH - srcY)
        if (srcH <= 0) break

        // Create cropped canvas for this page
        const pageCanvas = document.createElement('canvas')
        pageCanvas.width = imgW
        pageCanvas.height = Math.ceil(srcH)
        const ctx = pageCanvas.getContext('2d')
        ctx.drawImage(canvas, 0, srcY, imgW, srcH, 0, 0, imgW, srcH)

        const pageImg = pageCanvas.toDataURL('image/png')
        const destH = srcH * ratio
        doc.addImage(pageImg, 'PNG', margin, headerH + 4, scaledW, destH)
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

  /* ── Task modal callbacks ── */
  const handleTaskSave = (taskData) => {
    if (modal.task) {
      onAggiornaTask(progetto.id, modal.faseId, modal.task.id, taskData)
    } else {
      onAggiungiTask(progetto.id, modal.faseId, taskData)
    }
    setModal(null)
  }

  const handleTaskDelete = () => {
    if (modal?.task) {
      onEliminaTask(progetto.id, modal.faseId, modal.task.id)
    }
    setModal(null)
  }

  const rootCode = `${progettoIndex + 1}`

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
            Work Breakdown Structure | Numerazione automatica
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
        Suggerimento: trascina lo sfondo per navigare la mappa. Doppio click sui nomi per rinominare.
      </p>

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
            onAdd={() => onAggiungiFase(progetto.id)}
            onRename={t => onRinominaProgetto(progetto.id, t)}
          >
            {/* Level 1 = Fasi */}
            {progetto.fasi.map((fase, fi) => (
              <TreeNode
                key={fase.id}
                wbsCode={`${rootCode}.${fi + 1}`}
                titolo={fase.titolo}
                onAdd={() => setModal({ faseId: fase.id, task: null })}
                onRename={t => onRinominaFase(progetto.id, fase.id, t)}
                onDelete={() => onEliminaFase(progetto.id, fase.id)}
              >
                {/* Level 2 = Tasks */}
                {fase.tasks.map((task, ti) => (
                  <TreeNode
                    key={task.id}
                    wbsCode={`${rootCode}.${fi + 1}.${ti + 1}`}
                    titolo={task.titolo}
                    onEdit={() => setModal({ faseId: fase.id, task })}
                    onDelete={() => onEliminaTask(progetto.id, fase.id, task.id)}
                  />
                ))}
              </TreeNode>
            ))}
          </TreeNode>
        </div>
      </div>

      {/* ── Task Modal ── */}
      {modal && (
        <TaskModal
          task={modal.task}
          onSave={handleTaskSave}
          onDelete={handleTaskDelete}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
