import { useState, useRef, Children } from 'react'
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
  const [isPanning, setIsPanning] = useState(false)
  const panRef = useRef({ startX: 0, startY: 0, scrollX: 0, scrollY: 0 })

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
        <div>
          <h1 className="text-amber-400 font-bold text-lg">WBS Interattiva</h1>
          <p className="text-amber-500/50 text-xs">
            Work Breakdown Structure | Numerazione automatica
          </p>
        </div>
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
        <div className="inline-flex justify-center min-w-full pb-16">
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
