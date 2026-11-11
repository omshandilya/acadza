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
  onApprove,
  onReject,
  onOpenEdit,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  decision
}) {
  const [activeReportTab, setActiveReportTab] = useState(0);

  if (!group) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-400 dark:text-slate-600">
        Select a question from the queue to review
      </div>
    );
  }

  const q = group.question || {};
  const qtype = q.questionType || 'scq';
  const content = q[qtype] || {};
  const primaryResult = group.primaryResult || {};
  const reports = group.reports || [];
  const activeReport = reports[activeReportTab] || reports[0] || {};
  const edit = primaryResult.edit;

  // Compute diff if edit exists
  const diff = edit && edit.field && content[edit.field]
    ? computeDiff(content[edit.field], edit.find, edit.replace)
    : null;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto">
      
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-semibold text-slate-900 dark:text-white">QID:</span>
          <span className="font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
            {group.questionId}
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-slate-600 dark:text-slate-400">{q.subject}</span>
          <span>&rsaquo;</span>
          <span className="text-slate-600 dark:text-slate-400">{q.chapter}</span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="uppercase text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
            {qtype}
          </span>
        </div>

        {/* Prev / Next Keyboard Navigation */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            title="Previous question [J]"
            className="p-1.5 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[10px] text-slate-400 font-mono px-1">
            Navigate [J/K]
          </span>
          <button
            onClick={onNext}
            disabled={!hasNext}
            title="Next question [K]"
            className="p-1.5 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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
              <ShieldCheck className="w-5 h-5" />
              <div>
                <span className="font-bold capitalize">{decision.action} by Faculty</span>
                <span className="ml-2 opacity-80 text-[11px] font-mono">
                  at {new Date(decision.timestamp).toLocaleTimeString()}
                </span>
                {decision.note && (
                  <p className="mt-0.5 text-xs italic">Note: "{decision.note}"</p>
                )}
              </div>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/60 dark:bg-slate-900/60 font-semibold">
              Action Recorded in Audit Log
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
              Treat as leads, not instructions
            </span>
          </div>

          {/* Multiple Student Tabs if > 1 */}
          {reports.length > 1 && (
            <div className="flex space-x-1 mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
              {reports.map((r, idx) => (
                <button
                  key={r.reportId}
                  onClick={() => setActiveReportTab(idx)}
                  className={`px-3 py-1 rounded text-xs font-medium transition ${
                    activeReportTab === idx
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Report {idx + 1} ({r.reportId})
                </button>
              ))}
            </div>
          )}

          {/* Active Report Detail */}
          <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-lg p-3.5">
            <div className="flex items-center justify-between text-[11px] text-amber-800 dark:text-amber-300 font-mono mb-1.5">
              <span>Student ID: <strong>{activeReport.studentId}</strong></span>
              <span>Platform: <strong className="capitalize">{activeReport.source}</strong></span>
              <span>Reported: {new Date(activeReport.reportedAt).toLocaleDateString()}</span>
            </div>
            <div className="text-sm font-medium text-slate-900 dark:text-amber-100 bg-white/80 dark:bg-slate-900/60 p-2.5 rounded border border-amber-200/50 dark:border-amber-900/30">
              "{activeReport.comment}"
            </div>
          </div>
        </div>

        {/* 2. RENDERED QUESTION & STORED SOLUTION */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Question Content (Native MathML Rendered)
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Key: <strong className="text-blue-600 dark:text-blue-400">{JSON.stringify(content.answer)}</strong>
            </span>
          </div>

          {/* Rendered Question HTML */}
          <div 
            className="question-rendered text-slate-800 dark:text-slate-200 leading-relaxed text-sm bg-slate-50 dark:bg-slate-950/50 p-4 rounded-lg border border-slate-200/60 dark:border-slate-800"
            dangerouslySetInnerHTML={{ __html: content.question || '<em>No question text</em>' }}
          />

          {/* Solution Section */}
          <details className="text-xs group border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            <summary className="p-3 bg-slate-50 dark:bg-slate-950/60 font-semibold cursor-pointer text-slate-700 dark:text-slate-300 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              <span>View Stored Database Solution</span>
              <span className="text-blue-600 dark:text-blue-400 text-[11px] group-open:rotate-90 transition transform">
                &rsaquo;
              </span>
            </summary>
            <div 
              className="p-4 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 question-rendered leading-relaxed border-t border-slate-100 dark:border-slate-800"
              dangerouslySetInnerHTML={{ __html: content.solution || '<em>No solution text</em>' }}
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
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5 font-mono">
                {primaryResult.verdict}
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
                {primaryResult.route}
              </div>
            </div>
          </div>

          {/* Evidence Explanation */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Solver Evidence & Reasoning
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              {primaryResult.evidence}
            </p>
          </div>
        </div>

        {/* 4. BEFORE / AFTER SURGICAL DIFF (If proposed edit exists) */}
        {edit && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Proposed Surgical Edit (Target Field: <code className="text-blue-600 dark:text-blue-400 font-mono font-bold">{edit.field}</code>)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Surgical find & replace (No full rewrites)
              </span>
            </div>

            {/* Answer Field Diff */}
            {edit.field === 'answer' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                    Current Answer Key
                  </span>
                  <div className="text-2xl font-black font-mono text-red-700 dark:text-red-300 mt-1">
                    {edit.find || JSON.stringify(content.answer)}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Proposed New Key
                  </span>
                  <div className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-300 mt-1">
                    {edit.replace}
                  </div>
                </div>
              </div>
            ) : (
              /* Text Field Diff (Question or Solution) */
              <div className="space-y-3">
                <div className="p-3.5 rounded-lg bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 block mb-1">
                    Remove (Find String)
                  </span>
                  <code className="text-xs font-mono text-red-800 dark:text-red-300 break-all bg-white/70 dark:bg-slate-900/60 p-2 rounded block border border-red-200/50">
                    {edit.find || '—'}
                  </code>
                </div>

                <div className="p-3.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                    Insert (Replace String)
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
            "{primaryResult.student_reply}"
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
              onClick={() => onReject(group.questionId)}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 transition"
            >
              <X className="w-4 h-4" />
              <span>Reject Fix</span>
            </button>

            {/* Edit Manually Button */}
            <button
              onClick={() => onOpenEdit(group)}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Manually</span>
            </button>

            {/* Approve Button */}
            <button
              onClick={() => onApprove(group.questionId)}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-5 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition transform active:scale-95"
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

