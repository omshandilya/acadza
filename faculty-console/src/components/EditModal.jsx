import React, { useState, useEffect } from 'react'
import { X, Save, Eye, Code2 } from 'lucide-react'

export default function EditModal({ group, questions, onSave, onClose }) {
  const question = questions.find(q => q._id === group.questionId)
  const triage = group.triage

  // Build initial edit from triage suggestion
  const suggestedEdit = triage?.edit || {}
  const [field, setField] = useState(suggestedEdit.field || 'solution')
  const [findText, setFindText] = useState(suggestedEdit.find || '')
  const [replaceText, setReplaceText] = useState(suggestedEdit.replace || '')
  const [note, setNote] = useState('')
  const [previewMode, setPreviewMode] = useState('rendered') // 'rendered' | 'raw'

  const fieldOptions = ['question', 'solution', 'options', 'answer']

  // Compute preview of the patched field
  const getFieldContent = (f) => {
    if (!question) return ''
    if (f === 'question') return question.question || ''
    if (f === 'solution') return question.solution || ''
    if (f === 'options') return JSON.stringify(question.options, null, 2)
    if (f === 'answer') return JSON.stringify(question.answer)
    return ''
  }

  const originalContent = getFieldContent(field)
  const patchedContent = findText && originalContent.includes(findText)
    ? originalContent.replace(findText, replaceText)
    : originalContent

  const hasChange = findText && originalContent.includes(findText) && findText !== replaceText
  const findMissing = findText && !originalContent.includes(findText)

  const handleSave = () => {
    if (!findText.trim()) return
    onSave({
      field,
      find: findText,
      replace: replaceText,
    }, note)
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col border border-gray-200 dark:border-gray-700">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Manual Edit</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {question?.subject} · {question?.chapter} · QID <code className="text-xs">{group.questionId.slice(-8)}</code>
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body: 3 columns */}
        <div className="flex flex-1 overflow-hidden gap-0 divide-x divide-gray-200 dark:divide-gray-700">
          
          {/* Left: Original question render */}
          <div className="w-1/3 flex flex-col overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Original Question</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
              {question ? (
                <div dangerouslySetInnerHTML={{ __html: question.question }} />
              ) : (
                <p className="text-gray-400 italic">Question not found</p>
              )}
              {question?.options && (
                <div className="mt-4 space-y-2">
                  {Object.entries(question.options).map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="font-semibold text-gray-500 dark:text-gray-400 w-6">{k}.</span>
                      <span dangerouslySetInnerHTML={{ __html: v }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: Edit form */}
          <div className="w-1/3 flex flex-col overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Edit Specification</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              
              {/* AI Suggestion notice */}
              {triage?.edit && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-300">
                  <span className="font-semibold">AI suggestion pre-filled.</span> Review before saving.
                </div>
              )}

              {/* Field selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Field to edit</label>
                <select
                  value={field}
                  onChange={e => setField(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {fieldOptions.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              {/* Find */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Find (exact text in field)</label>
                <textarea
                  value={findText}
                  onChange={e => setFindText(e.target.value)}
                  rows={5}
                  placeholder="Paste exact text to find…"
                  className={`w-full px-3 py-2 rounded-lg border text-sm font-mono text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 resize-none ${
                    findMissing
                      ? 'border-red-400 dark:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                />
                {findMissing && (
                  <p className="text-xs text-red-500 mt-1">⚠ Text not found in the selected field</p>
                )}
              </div>

              {/* Replace */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Replace with</label>
                <textarea
                  value={replaceText}
                  onChange={e => setReplaceText(e.target.value)}
                  rows={5}
                  placeholder="Replacement text…"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Faculty note */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Faculty note (optional)</label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={3}
                  placeholder="Reason for this edit…"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="w-1/3 flex flex-col overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Live Preview</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPreviewMode('rendered')}
                  className={`p-1.5 rounded-md transition-colors ${previewMode === 'rendered' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                  title="Rendered preview"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewMode('raw')}
                  className={`p-1.5 rounded-md transition-colors ${previewMode === 'raw' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                  title="Raw HTML"
                >
                  <Code2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {hasChange ? (
                <>
                  <div className="mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                      hasChange ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                    }`}>
                      {hasChange ? '✓ Change applied' : 'No change'}
                    </span>
                  </div>
                  {previewMode === 'rendered' ? (
                    <div
                      className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: patchedContent }}
                    />
                  ) : (
                    <pre className="text-xs text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap break-all bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      {patchedContent}
                    </pre>
                  )}
                </>
              ) : (
                <div className="text-sm text-gray-400 dark:text-gray-500 italic mt-8 text-center">
                  Fill in Find + Replace to preview the change
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Surgical edit — only the matched substring is replaced.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!findText.trim() || findMissing}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

