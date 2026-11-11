import React, { useState, useEffect, useCallback, useMemo } from 'react'

import questions from './data/questions.json'
import reports from './data/reports.json'
import taxonomy from './data/taxonomy.json'
import results from './data/results.json'

import { groupReportsByQuestion } from './utils/urgency'

import Header from './components/Header'
import QueueList from './components/QueueList'
import QuestionDetail from './components/QuestionDetail'
import EditModal from './components/EditModal'
import AuditModal from './components/AuditModal'
import BonusModal from './components/BonusModal'

// ─── Build the enriched groups once ────────────────────────────────────────────
function buildGroups(questions, reports, results) {
  // normalize questions: flatten nested content (scq / integerQuestion / mcq field)
  const normalizedQs = questions.map(q => {
    const inner = q[q.questionType] || q.scq || q.integerQuestion || q.mcq || {}
    return {
      ...q,
      question: inner.question || '',
      solution: inner.solution || '',
      options:  inner.options  || {},
      answer:   inner.answer   ?? null,
    }
  })

  // Build lookup maps
  const qMap  = Object.fromEntries(normalizedQs.map(q => [q._id, q]))
  const rMap  = Object.fromEntries(reports.map(r => [r.reportId, r]))
  const triageMap = Object.fromEntries(results.map(t => [t.reportId, t]))

  // groupReportsByQuestion returns [{questionId, reports:[...], triage:TriageResult}]
  const groups = groupReportsByQuestion(normalizedQs, reports, results)
  return { groups, qMap, rMap, triageMap, normalizedQs }
}

export default function App() {
  // ── Dark mode (persisted) ──────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('darkMode') === 'true' } catch { return false }
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    try { localStorage.setItem('darkMode', darkMode) } catch {}
  }, [darkMode])

  // ── Build data ──────────────────────────────────────────────────────────────
  const { groups, qMap, rMap, triageMap, normalizedQs } = useMemo(
    () => buildGroups(questions, reports, results),
    []
  )

  // ── UI state ───────────────────────────────────────────────────────────────
  const [selectedId,   setSelectedId]   = useState(groups[0]?.questionId ?? null)
  const [decisions,    setDecisions]    = useState({})       // {[questionId]: {action, ...}}
  const [auditLog,     setAuditLog]     = useState([])       // [{...entry}]
  const [filterRoute,  setFilterRoute]  = useState('all')    // 'all' | 'faculty_review' | 'auto_apply' | 'no_change' | 'decided' | 'pending'
  const [filterSubject,setFilterSubject]= useState('All')
  const [searchQuery,  setSearchQuery]  = useState('')
  const [editModalGroup, setEditModalGroup] = useState(null) // group | null
  const [showAudit,    setShowAudit]    = useState(false)
  const [showBonus,    setShowBonus]    = useState(false)

  // ── Derived stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const facultyReview = groups.filter(g => g.triage?.route === 'faculty_review').length
    const autoApply     = groups.filter(g => g.triage?.route === 'auto_apply').length
    const decided       = Object.keys(decisions).length
    const total         = groups.length
    return { total, facultyReview, autoApply, decided, auditCount: auditLog.length }
  }, [groups, decisions, auditLog])

  // ── Filtered + ordered list (derived from groups + decisions + filters) ─────
  const filteredGroups = useMemo(() => {
    let list = [...groups]

    // Subject filter
    if (filterSubject !== 'All') {
      list = list.filter(g => qMap[g.questionId]?.subject === filterSubject)
    }

    // Route filter
    if (filterRoute === 'pending') {
      list = list.filter(g => !decisions[g.questionId])
    } else if (filterRoute === 'decided') {
      list = list.filter(g => !!decisions[g.questionId])
    } else if (filterRoute !== 'all') {
      list = list.filter(g => g.triage?.route === filterRoute)
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(g => {
        const question = qMap[g.questionId]
        if (!question) return false
        const qtext = (question.question || '').replace(/<[^>]+>/g, '').toLowerCase()
        const chapter = (question.chapter || '').toLowerCase()
        const subject = (question.subject || '').toLowerCase()
        const reportComments = g.reports.map(r => (r.comment || '').toLowerCase()).join(' ')
        return qtext.includes(q) || chapter.includes(q) || subject.includes(q) || reportComments.includes(q)
      })
    }

    return list
  }, [groups, decisions, filterSubject, filterRoute, searchQuery, qMap])

  // ── Action handlers ────────────────────────────────────────────────────────
  const addAuditEntry = useCallback((group, action, extra = {}) => {
    const q = qMap[group.questionId]
    const triage = group.triage
    const entry = {
      action,
      questionId: group.questionId,
      reportIds:  group.reports.map(r => r.reportId),
      subject:    q?.subject,
      chapter:    q?.chapter,
      verdict:    triage?.verdict,
      repair:     triage?.repair,
      timestamp:  new Date().toISOString(),
      ...extra,
    }
    setAuditLog(prev => [...prev, entry])
    return entry
  }, [qMap])

  const handleApprove = useCallback((questionId) => {
    const group = groups.find(g => g.questionId === questionId)
    if (!group) return
    const decision = { action: 'approved', timestamp: new Date().toISOString() }
    setDecisions(prev => ({ ...prev, [questionId]: decision }))
    addAuditEntry(group, 'approved')
  }, [groups, addAuditEntry])

  const handleReject = useCallback((questionId) => {
    const group = groups.find(g => g.questionId === questionId)
    if (!group) return
    const decision = { action: 'rejected', timestamp: new Date().toISOString() }
    setDecisions(prev => ({ ...prev, [questionId]: decision }))
    addAuditEntry(group, 'rejected')
  }, [groups, addAuditEntry])

  const handleEditSave = useCallback((questionId, customEdit, note) => {
    const group = groups.find(g => g.questionId === questionId)
    if (!group) return
    const decision = { action: 'edited', customEdit, note, timestamp: new Date().toISOString() }
    setDecisions(prev => ({ ...prev, [questionId]: decision }))
    addAuditEntry(group, 'edited', { customEdit, note })
    setEditModalGroup(null)
  }, [groups, addAuditEntry])

  const handleReset = useCallback(() => {
    setDecisions({})
    setAuditLog([])
  }, [])

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      // Don't fire when typing in an input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return
      if (e.metaKey || e.ctrlKey) return

      const idx = filteredGroups.findIndex(g => g.questionId === selectedId)

      switch (e.key) {
        case 'j': {
          // next
          const next = filteredGroups[Math.min(idx + 1, filteredGroups.length - 1)]
          if (next) setSelectedId(next.questionId)
          break
        }
        case 'k': {
          // prev
          const prev = filteredGroups[Math.max(idx - 1, 0)]
          if (prev) setSelectedId(prev.questionId)
          break
        }
        case 'a': {
          if (selectedId && !decisions[selectedId]) handleApprove(selectedId)
          break
        }
        case 'r': {
          if (selectedId && !decisions[selectedId]) handleReject(selectedId)
          break
        }
        case 'e': {
          const group = groups.find(g => g.questionId === selectedId)
          if (group && !decisions[selectedId]) setEditModalGroup(group)
          break
        }
        case 'Escape': {
          setEditModalGroup(null)
          setShowAudit(false)
          setShowBonus(false)
          break
        }
        default: break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [filteredGroups, selectedId, decisions, handleApprove, handleReject, groups])

  // ── Selected group ─────────────────────────────────────────────────────────
  const selectedGroup = useMemo(
    () => groups.find(g => g.questionId === selectedId) ?? null,
    [groups, selectedId]
  )

  // ── Subjects list (for filter dropdown) ───────────────────────────────────
  const subjects = useMemo(() => {
    const s = new Set(normalizedQs.map(q => q.subject).filter(Boolean))
    return ['All', ...Array.from(s).sort()]
  }, [normalizedQs])

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden">
      {/* Header */}
      <Header
        stats={stats}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
        onShowAudit={() => setShowAudit(true)}
        onShowBonus={() => setShowBonus(true)}
        onReset={handleReset}
      />

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Queue */}
        <QueueList
          groups={filteredGroups}
          allGroups={groups}
          qMap={qMap}
          decisions={decisions}
          selectedId={selectedId}
          onSelect={setSelectedId}
          filterRoute={filterRoute}
          onFilterRoute={setFilterRoute}
          filterSubject={filterSubject}
          onFilterSubject={setFilterSubject}
          subjects={subjects}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
        />

        {/* Right: Detail */}
        <div className="flex-1 overflow-hidden">
          {selectedGroup ? (
            <QuestionDetail
              group={selectedGroup}
              question={qMap[selectedGroup.questionId]}
              decisions={decisions}
              onApprove={handleApprove}
              onReject={handleReject}
              onEdit={(group) => setEditModalGroup(group)}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
              <div className="text-center">
                <div className="text-5xl mb-4">📋</div>
                <p className="text-lg font-medium">Select a report from the queue</p>
                <p className="text-sm mt-1">Use <kbd className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">j</kbd> / <kbd className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">k</kbd> to navigate</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {editModalGroup && (
        <EditModal
          group={editModalGroup}
          questions={normalizedQs}
          onSave={(customEdit, note) => handleEditSave(editModalGroup.questionId, customEdit, note)}
          onClose={() => setEditModalGroup(null)}
        />
      )}

      {showAudit && (
        <AuditModal
          auditLog={auditLog}
          decisions={decisions}
          onClear={() => setAuditLog([])}
          onClose={() => setShowAudit(false)}
        />
      )}

      {showBonus && (
        <BonusModal
          onClose={() => setShowBonus(false)}
        />
      )}
    </div>
  )
}

