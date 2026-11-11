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

  // groupReportsByQuestion returns [{questionId, reports:[...], primaryResult, triage, urgency}]
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
  const [selectedId,     setSelectedId]     = useState(groups[0]?.questionId ?? null)
  const [decisions,      setDecisions]      = useState({})       // {[questionId]: {action, ...}}
  const [auditLog,       setAuditLog]       = useState([])       // [{...entry}]
  const [filterRoute,    setFilterRoute]    = useState('all')    // 'all' | 'pending_faculty' | 'auto_apply' | 'no_change' | 'decided'
  const [filterSubject,  setFilterSubject]  = useState('All')
  const [searchQuery,    setSearchQuery]    = useState('')
  const [editModalGroup, setEditModalGroup] = useState(null)     // group | null
  const [showAudit,      setShowAudit]      = useState(false)
  const [showBonus,      setShowBonus]      = useState(false)

  // ── Derived stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const facultyReview = groups.filter(g => {
      const r = g.primaryResult?.route || g.triage?.route;
      return r === 'faculty_review';
    }).length;
    const autoApply = groups.filter(g => {
      const r = g.primaryResult?.route || g.triage?.route;
      return r === 'auto_apply';
    }).length;
    const decided = Object.keys(decisions).length;
    const total = groups.length;
    return { total, totalGroups: total, facultyReview, autoApply, decided, auditCount: auditLog.length };
  }, [groups, decisions, auditLog]);

  // ── Filtered list (derived from groups + decisions + filters) ──────────────
  const filteredGroups = useMemo(() => {
    let list = [...groups]

    // 1. Subject filter
    if (filterSubject !== 'All') {
      list = list.filter(g => {
        const q = qMap[g.questionId] || g.question || {};
        return q.subject === filterSubject;
      });
    }

    // 2. Route filter
    if (filterRoute === 'pending_faculty' || filterRoute === 'faculty_review') {
      list = list.filter(g => {
        const route = g.primaryResult?.route || g.triage?.route;
        return route === 'faculty_review';
      });
    } else if (filterRoute === 'auto_apply') {
      list = list.filter(g => {
        const route = g.primaryResult?.route || g.triage?.route;
        return route === 'auto_apply';
      });
    } else if (filterRoute === 'no_change') {
      list = list.filter(g => {
        const route = g.primaryResult?.route || g.triage?.route;
        return route === 'no_change';
      });
    } else if (filterRoute === 'decided') {
      list = list.filter(g => !!decisions[g.questionId]);
    }

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(g => {
        const question = qMap[g.questionId] || g.question || {}
        const qtext = (question.question || '').replace(/<[^>]+>/g, '').toLowerCase()
        const chapter = (question.chapter || '').toLowerCase()
        const subject = (question.subject || '').toLowerCase()
        const reportComments = (g.reports || []).map(r => (r.comment || '').toLowerCase()).join(' ')
        return qtext.includes(q) || chapter.includes(q) || subject.includes(q) || reportComments.includes(q)
      })
    }

    return list
  }, [groups, decisions, filterSubject, filterRoute, searchQuery, qMap])

  // If currently selected ID is not in filtered list, auto-select the first visible item
  useEffect(() => {
    if (filteredGroups.length > 0) {
      const isStillVisible = filteredGroups.some(g => g.questionId === selectedId);
      if (!isStillVisible) {
        setSelectedId(filteredGroups[0].questionId);
      }
    }
  }, [filteredGroups, selectedId]);

  // ── Navigation Indices ─────────────────────────────────────────────────────
  const currentIndex = useMemo(() => {
    return filteredGroups.findIndex(g => g.questionId === selectedId);
  }, [filteredGroups, selectedId]);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < filteredGroups.length - 1;

  const handlePrev = useCallback(() => {
    if (hasPrev) {
      setSelectedId(filteredGroups[currentIndex - 1].questionId);
    }
  }, [hasPrev, currentIndex, filteredGroups]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      setSelectedId(filteredGroups[currentIndex + 1].questionId);
    }
  }, [hasNext, currentIndex, filteredGroups]);

  // ── Action handlers ────────────────────────────────────────────────────────
  const addAuditEntry = useCallback((group, action, extra = {}) => {
    const q = qMap[group.questionId] || group.question || {};
    const triage = group.primaryResult || group.triage || {};
    const entry = {
      action,
      questionId: group.questionId,
      reportIds:  (group.reports || []).map(r => r.reportId),
      subject:    q.subject,
      chapter:    q.chapter,
      verdict:    triage.verdict,
      repair:     triage.repair,
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
      // Don't fire when typing in an input/textarea/select
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return
      if (e.metaKey || e.ctrlKey) return

      switch (e.key.toLowerCase()) {
        case 'j': {
          handleNext()
          break
        }
        case 'k': {
          handlePrev()
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
        case 'escape': {
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
  }, [handleNext, handlePrev, selectedId, decisions, handleApprove, handleReject, groups])

  // ── Selected group ─────────────────────────────────────────────────────────
  const selectedGroup = useMemo(
    () => groups.find(g => g.questionId === selectedId) ?? filteredGroups[0] ?? null,
    [groups, selectedId, filteredGroups]
  )

  // ── Subjects list (for filter dropdown) ───────────────────────────────────
  const subjects = useMemo(() => {
    const s = new Set(normalizedQs.map(q => q.subject).filter(Boolean))
    return ['All', ...Array.from(s).sort()]
  }, [normalizedQs])

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Header */}
      <Header
        stats={stats}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onToggleDark={() => setDarkMode(d => !d)}
        onOpenAudit={() => setShowAudit(true)}
        onShowAudit={() => setShowAudit(true)}
        onOpenBonus={() => setShowBonus(true)}
        onShowBonus={() => setShowBonus(true)}
        onReset={handleReset}
        filterRoute={filterRoute}
        onSelectFilter={setFilterRoute}
      />

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Queue List */}
        <QueueList
          groups={filteredGroups}
          allGroups={groups}
          qMap={qMap}
          decisions={decisions}
          selectedId={selectedId}
          onSelect={setSelectedId}
          filterRoute={filterRoute}
          setFilterRoute={setFilterRoute}
          onFilterRoute={setFilterRoute}
          filterSubject={filterSubject}
          setFilterSubject={setFilterSubject}
          onFilterSubject={setFilterSubject}
          subjects={subjects}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={setSearchQuery}
        />

        {/* Right: Question Detail View */}
        <div className="flex-1 overflow-hidden">
          {selectedGroup ? (
            <QuestionDetail
              group={selectedGroup}
              question={qMap[selectedGroup.questionId]}
              decision={decisions[selectedGroup.questionId]}
              decisions={decisions}
              onApprove={handleApprove}
              onReject={handleReject}
              onOpenEdit={(group) => setEditModalGroup(group)}
              onEdit={(group) => setEditModalGroup(group)}
              onPrev={handlePrev}
              onNext={handleNext}
              hasPrev={hasPrev}
              hasNext={hasNext}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
              <div className="text-center space-y-2">
                <div className="text-5xl mb-2">📋</div>
                <p className="text-base font-semibold text-slate-700 dark:text-slate-300">No question selected</p>
                <p className="text-xs text-slate-400">
                  Select a report from the queue or clear your search/filters
                </p>
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
