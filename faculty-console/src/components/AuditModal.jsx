import React, { useEffect } from 'react'
import { X, Download, Trash2, CheckCircle, XCircle, Edit3, Clock } from 'lucide-react'

const ACTION_STYLES = {
  approved:  { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', label: 'Approved' },
  rejected:  { icon: XCircle,    color: 'text-red-500',   bg: 'bg-red-50 dark:bg-red-900/20',   label: 'Rejected' },
  edited:    { icon: Edit3,      color: 'text-blue-500',  bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'Edited'   },
}

function ActionBadge({ action }) {
  const cfg = ACTION_STYLES[action] || { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-100', label: action }
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  )
}

export default function AuditModal({ auditLog, decisions, onClear, onClose }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleExport = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      totalDecisions: auditLog.length,
      log: auditLog,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col border border-gray-200 dark:border-gray-700">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Audit Log</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {auditLog.length} decision{auditLog.length !== 1 ? 's' : ''} recorded this session
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {auditLog.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-500">
              <Clock className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No decisions recorded yet.</p>
              <p className="text-xs mt-1">Approve, reject, or edit a question to begin.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {[...auditLog].reverse().map((entry, i) => (
                <div key={i} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <ActionBadge action={entry.action} />
                        <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
                          {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-sm text-gray-800 dark:text-gray-200 font-medium truncate">
                        {entry.subject} · {entry.chapter}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                        QID: {entry.questionId?.slice(-12)} · {entry.reportIds?.length || 0} report{(entry.reportIds?.length || 0) !== 1 ? 's' : ''}
                      </div>
                      {entry.verdict && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          AI: <span className="font-medium text-gray-700 dark:text-gray-300">{entry.verdict}</span>
                          {entry.repair && <span> → {entry.repair}</span>}
                        </div>
                      )}
                      {entry.action === 'edited' && entry.customEdit && (
                        <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-xs font-mono text-blue-700 dark:text-blue-300">
                          <div>field: <span className="font-semibold">{entry.customEdit.field}</span></div>
                          <div className="mt-0.5 truncate">find: "{entry.customEdit.find?.slice(0, 60)}{(entry.customEdit.find?.length || 0) > 60 ? '…' : ''}"</div>
                          <div className="truncate">replace: "{entry.customEdit.replace?.slice(0, 60)}{(entry.customEdit.replace?.length || 0) > 60 ? '…' : ''}"</div>
                        </div>
                      )}
                      {entry.note && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
                          Note: {entry.note}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClear}
            disabled={auditLog.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear Log
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleExport}
              disabled={auditLog.length === 0}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

