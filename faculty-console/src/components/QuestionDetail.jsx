import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Edit3, 
  MessageSquare, 
  Cpu, 
  HelpCircle, 
  ArrowRight, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Send,
  Sparkles,
  Info
} from 'lucide-react';
import { computeDiff } from '../utils/urgency';

export default function QuestionDetail({
  group,
  question,
  decisions = {},
  decision: propDecision,
  onApprove,
  onReject,
  onEdit,
  onOpenEdit,
  onPrev,
  onNext,
  hasPrev,
  hasNext
}) {
  const [activeReportTab, setActiveReportTab] = useState(0);

  if (!group) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-400 dark:text-slate-600">
        <div className="text-center space-y-2">
          <div className="text-4xl opacity-40">📋</div>
          <p className="font-semibold text-base text-slate-600 dark:text-slate-300">Select a question from the queue</p>
          <p className="text-xs text-slate-400">Use J / K to cycle through reports</p>
        </div>
      </div>
    );
  }

  const q = question || group.question || {};
  const qtype = q.questionType || 'scq';
  const content = (q[qtype] && q[qtype].question) ? q[qtype] : q;
  const primaryResult = group.primaryResult || group.triage || {};
  const reports = group.reports || [];
  const activeReport = reports[activeReportTab] || reports[0] || {};
  const edit = primaryResult.edit;
  const decision = propDecision || decisions[group.questionId];

  const handleEdit = onOpenEdit || onEdit || (() => {});
  const handleApprove = onApprove || (() => {});
  const handleReject = onReject || (() => {});

  // Compute diff if edit exists
  const diff = edit && edit.field && content[edit.field]
    ? computeDiff(
        typeof content[edit.field] === 'object' ? JSON.stringify(content[edit.field]) : String(content[edit.field]),
        edit.find,
        edit.replace
      )
    : null;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto">
      
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-semibold text-slate-900 dark:text-slate-100">{q.subject}</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-600 dark:text-slate-400">{q.chapter}</span>
          {q.concept && (
            <>
              <span className="text-slate-400">/</span>
              <span className="text-slate-500 truncate max-w-[200px]">{q.concept}</span>
            </>
          )}
          <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
            ID: {group.questionId.slice(-8)}
          </span>
        </div>

        {/* Quick Keyboard Hint & Nav Arrows */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            title="Previous question [K]"
            className="p-1.5 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[10px] text-slate-400 font-mono px-1 select-none">
            J / K
          </span>
          <button
            onClick={onNext}
            disabled={!hasNext}
            title="Next question [J]"
            className="p-1.5 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 space-y-6 max-w-5xl mx-auto w-full">

        {/* DECISION BANNER (If already decided) */}
        {decision && (
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            decision.action === 'approved'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : decision.action === 'edited'
              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}>
            <div className="flex items-center space-x-3 text-xs">
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              <div>
                <span className="font-bold capitalize">{decision.action} by Faculty</span>
                <span className="ml-2 opacity-80 text-[11px] font-mono">
                  at {new Date(decision.timestamp).toLocaleTimeString()}
                </span>
                {decision.note && (
                  <p className="mt-0.5 text-xs italic">Faculty Note: "{decision.note}"</p>
                )}
                {decision.customEdit && (
                  <p className="mt-1 font-mono text-[11px] bg-white/60 dark:bg-slate-900/60 p-1.5 rounded">
                    Field: {decision.customEdit.field} | Replace: "{decision.customEdit.replace}"
                  </p>
                )}
              </div>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-white/70 dark:bg-slate-900/70 font-semibold shadow-xs">
              Recorded in Audit Log
            </span>
          </div>
        )}

        {/* 1. STUDENT REPORTS ACCORDION / PILLS */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Student Reports ({reports.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              Untrusted leads · Investigated independently
            </span>
          </div>

          {/* Multiple Student Tabs if > 1 */}
          {reports.length > 1 && (
            <div className="flex space-x-1 mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
              {reports.map((r, idx) => (
                <button
                  key={r.reportId}
                  onClick={() => setActiveReportTab(idx)}
                  className={`px-3 py-1 rounded text-xs font-medium transition cursor-pointer ${
                    activeReportTab === idx
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Report {idx + 1} ({r.reportId})
                </button>
              ))}
            </div>
          )}

          {/* Active Student Comment Box */}
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Report ID: <code className="font-mono font-bold text-slate-600 dark:text-slate-300">{activeReport.reportId}</code></span>
              <span>Source: {activeReport.source || 'student_app'}</span>
              <span>Reported: {activeReport.reportedAt ? new Date(activeReport.reportedAt).toLocaleDateString() : 'N/A'}</span>
            </div>
            <p className="text-sm text-slate-900 dark:text-slate-100 font-medium italic">
              "{activeReport.comment || 'No comment text provided'}"
            </p>
          </div>
        </div>

        {/* 2. RENDERED QUESTION & STORED SOLUTION */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Live Question Stem & Options
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Stored Answer: <strong className="text-blue-600 dark:text-blue-400">{JSON.stringify(content.answer ?? q.answer)}</strong>
            </span>
          </div>

          {/* Native MathML Question HTML */}
          <div 
            className="text-slate-900 dark:text-slate-100 question-rendered leading-relaxed text-sm"
            dangerouslySetInnerHTML={{ __html: content.question || q.question || '<em>No question content</em>' }}
          />

          {/* Render Options if SCQ/MCQ */}
          {content.options && Object.keys(content.options).length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Answer Options:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(content.options).map(([optKey, optVal]) => (
                  <div 
                    key={optKey}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs flex items-start space-x-2"
                  >
                    <span className="font-bold text-slate-700 dark:text-slate-300 w-5 flex-shrink-0">
                      {optKey}.
                    </span>
                    <div 
                      className="question-rendered flex-1"
                      dangerouslySetInnerHTML={{ __html: optVal }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collapsible Stored Solution */}
          <details className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 group">
            <summary className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer flex items-center justify-between select-none py-1">
              <span>View Stored Database Solution</span>
              <span className="text-blue-600 dark:text-blue-400 text-[11px] group-open:rotate-90 transition transform">
                &rsaquo;
              </span>
            </summary>
            <div 
              className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-lg mt-2 text-slate-700 dark:text-slate-300 question-rendered leading-relaxed text-xs border border-slate-200/60 dark:border-slate-800"
              dangerouslySetInnerHTML={{ __html: content.solution || q.solution || '<em>No solution text stored in database</em>' }}
            />
          </details>
        </div>

        {/* 3. AI TRIAGE VERDICT & EVIDENCE CARD */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                AI Engine Triage Decision
              </h3>
            </div>
            
            {/* Confidence pill */}
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Confidence: {Math.round((primaryResult.confidence || 0.95) * 100)}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Verdict</div>
              <div className={`text-sm font-bold mt-0.5 font-mono ${
                primaryResult.verdict === 'defect'
                  ? 'text-red-600 dark:text-red-400'
                  : primaryResult.verdict === 'no_error'
                  ? 'text-slate-700 dark:text-slate-300'
                  : 'text-amber-600 dark:text-amber-400'
              }`}>
                {primaryResult.verdict || 'no_error'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Repair Type</div>
              <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 font-mono">
                {primaryResult.repair || 'None (No Change)'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Assigned Route</div>
              <div className={`text-sm font-bold mt-0.5 font-mono ${
                primaryResult.route === 'faculty_review'
                  ? 'text-red-600 dark:text-red-400'
                  : primaryResult.route === 'auto_apply'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400'
              }`}>
                {primaryResult.route || 'no_change'}
              </div>
            </div>
          </div>

          {/* Evidence Explanation */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Solver Evidence & Academic Reasoning
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              {primaryResult.evidence}
            </p>
          </div>
        </div>

        {/* 4. SURGICAL BEFORE / AFTER DIFF (If an edit was proposed) */}
        {edit && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Proposed Surgical Edit (Field: <code className="text-indigo-600 dark:text-indigo-400 font-mono">{edit.field}</code>)
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Surgical replacement · No whole-question rewrite
              </span>
            </div>

            {/* Answer key diff */}
            {edit.field === 'answer' ? (
              <div className="flex items-center justify-center space-x-6 p-6 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 font-mono">
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Old Stored Key</span>
                  <span className="px-3 py-1 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-sm font-bold border border-red-200 dark:border-red-800 line-through">
                    {JSON.stringify(edit.find)}
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400" />
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">New Correct Key</span>
                  <span className="px-3 py-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-sm font-bold border border-emerald-200 dark:border-emerald-800">
                    {JSON.stringify(edit.replace)}
                  </span>
                </div>
              </div>
            ) : (
              /* Text Field Diff (Question or Solution) */
              <div className="space-y-3">
                <div className="p-3.5 rounded-lg bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 block mb-1">
                    Find String (Substring to remove)
                  </span>
                  <code className="text-xs font-mono text-red-800 dark:text-red-300 break-all bg-white/70 dark:bg-slate-900/60 p-2 rounded block border border-red-200/50">
                    {edit.find || '—'}
                  </code>
                </div>

                <div className="p-3.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                    Replace String (Substring to insert)
                  </span>
                  <code className="text-xs font-mono text-emerald-800 dark:text-emerald-300 break-all bg-white/70 dark:bg-slate-900/60 p-2 rounded block border border-emerald-200/50">
                    {edit.replace || '—'}
                  </code>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. STUDENT REPLY PREVIEW */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Send className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Student Notification Preview
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              1-3 sentences · Empathetic JEE/NEET tone
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-violet-50/60 dark:bg-violet-950/20 border border-violet-200/80 dark:border-violet-900/40 text-xs text-slate-800 dark:text-violet-200 leading-relaxed italic">
            "{primaryResult.student_reply || 'Thank you for your report. Our academic faculty has reviewed this question.'}"
          </div>
        </div>

      </div>

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="sticky bottom-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-6 py-4 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="text-xs text-slate-400 hidden sm:block">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">A</kbd> Approve &middot; <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">E</kbd> Edit &middot; <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">R</kbd> Reject
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            {/* Reject Button */}
            <button
              onClick={() => handleReject(group.questionId)}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 transition cursor-pointer active:scale-95"
            >
              <X className="w-4 h-4" />
              <span>Reject Fix</span>
            </button>

            {/* Edit Manually Button */}
            <button
              onClick={() => handleEdit(group)}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer active:scale-95"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Manually</span>
            </button>

            {/* Approve Button */}
            <button
              onClick={() => handleApprove(group.questionId)}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-5 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition transform active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Approve Fix</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
