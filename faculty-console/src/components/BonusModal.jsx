import React, { useEffect } from 'react'
import { X, Sparkles, AlertTriangle, Bug, FileSearch } from 'lucide-react'

// 4 unreported questions with stealth defects — found by proactive scan
const BONUS_DEFECTS = [
  {
    qid: 'SecAQ4',
    questionId: '68dea87d387eea3d0d95fbe3',
    subject: 'Physics',
    chapter: 'Electrostatics',
    concept: 'Parallel plate capacitors',
    type: 'scq',
    defectType: 'rendering_bug',
    severity: 'medium',
    title: 'MathML <mspace> tag leaking into question text',
    description:
      'The question HTML contains a raw <mspace> MathML element that leaks outside its MathML namespace in some browsers, causing the dielectric constant formula "K = αV" to render with an invisible extra space character and misalign the inline math. Students see broken spacing in the formula region.',
    evidence: 'Detected by automated scan: <mspace> present in question field HTML',
    suggestedFix: 'Remove orphaned <mspace/> element from outside <math> tags, or wrap it inside the adjacent <mrow> element.',
    repair: 'display_fix',
    questionSnippet: 'A parallel plate capacitor is filled with a dielectric whose dielectric constant varies with the applied voltage as K = αV, where α = 1 volt⁻¹…',
  },
  {
    qid: 'SecAQ11',
    questionId: '68dea6e6387eea3d0d95f6f8',
    subject: 'Physics',
    chapter: 'Geometrical Optics',
    concept: 'Displacement method — image ratios',
    type: 'integerQuestion',
    defectType: 'rendering_bug',
    severity: 'medium',
    title: 'MathML <mspace> tag leaking into solution HTML',
    description:
      'The solution HTML for this displacement-method optics problem contains a stray <mspace> element outside its <math> block. While the question text renders correctly, the step-by-step solution has broken MathML whitespace that disrupts the derivation of the image-size ratio formula.',
    evidence: 'Detected by automated scan: <mspace> present in solution field HTML',
    suggestedFix: 'Remove orphaned <mspace/> from solution HTML outside <math> tags. The math content itself is correct (answer = 16).',
    repair: 'display_fix',
    questionSnippet: 'In a setup of displacement method experiment, D = 150 cm, f = 24 cm. Find the ratio of the sizes of the two images…',
  },
  {
    qid: 'SecAQ14',
    questionId: '68dea657387eea3d0d95f54a',
    subject: 'Physics',
    chapter: 'Geometrical Optics',
    concept: 'Combination of lenses — optical power',
    type: 'integerQuestion',
    defectType: 'solution_mismatch',
    severity: 'high',
    title: 'Solution labels contain garbled MathML entity sequences',
    description:
      'The solution for the two-lenses-in-contact optical power problem uses garbled Unicode escape sequences (like "eqcu", "eqch") in intermediate labels where proper MathML subscript notation should appear. The final answer (5 dioptres) is correct, but the derivation is unreadable, leaving students unable to follow the working.',
    evidence: 'Manual inspection of solution MathML: intermediate steps use malformed entity references instead of <msub> tags',
    suggestedFix: 'Reformat the solution MathML to use proper <msub> notation for subscripted focal length labels (f_eq). The logic and final answer are correct.',
    repair: 'solution_fix',
    questionSnippet: 'Two identical thin converging lenses are kept in contact at 12.5 cm from an object. Real image is 4× enlarged. Find optical power of each lens (dioptres).',
  },
  {
    qid: 'MHCET_PCB_PYQ_2021_1_BIO_L876',
    questionId: '695ede2a88d7701e561aa9d9',
    subject: 'Zoology',
    chapter: 'Excretory Products and their Elimination',
    concept: 'Disorders of excretory system — Dialysis',
    type: 'scq',
    defectType: 'incorrect_statement',
    severity: 'high',
    title: 'Statement-II is factually incorrect as written',
    description:
      'Statement-II reads: "Sometimes dialysis is not a supportive measure in those for whom transplant is inappropriate." This is scientifically wrong — dialysis IS used long-term or indefinitely for patients who cannot receive a transplant (due to age, comorbidities, etc.). The correct answer key (D) says Statement-II is incorrect, which is right, but the statement itself should be corrected to its inverse for clarity and to prevent confusion.',
    evidence: 'Medically: Dialysis is the standard long-term therapy for patients who are not transplant candidates. NCERT Biology Ch. 19 confirms this.',
    suggestedFix: 'Rewrite Statement-II: "Dialysis is a long-term supportive measure for patients for whom renal transplant is not appropriate." Then correct answer becomes A (both statements correct).',
    repair: 'unsound',
    questionSnippet: 'Based on the statements regarding dialysis…\nStatement-II: Sometimes dialysis is NOT a supportive measure in those for whom transplant is inappropriate.',
  },
]

const SEVERITY_STYLES = {
  high:   { color: 'text-red-600 dark:text-red-400',    bg: 'bg-red-50 dark:bg-red-900/20',    border: 'border-red-200 dark:border-red-800',    dot: 'bg-red-500' },
  medium: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' },
  low:    { color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-900/20',   border: 'border-blue-200 dark:border-blue-800',   dot: 'bg-blue-500' },
}

const DEFECT_TYPE_LABELS = {
  rendering_bug:      { label: 'Rendering Bug',        icon: Bug },
  solution_mismatch:  { label: 'Solution Mismatch',    icon: AlertTriangle },
  incorrect_statement:{ label: 'Incorrect Statement',  icon: AlertTriangle },
}

export default function BonusModal({ onClose }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Stealth Defects Found</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {BONUS_DEFECTS.length} unreported questions with hidden issues — proactive scan bonus
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Banner */}
        <div className="mx-6 mt-5 mb-1 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 flex gap-3">
          <FileSearch className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-purple-800 dark:text-purple-300">
            <span className="font-semibold">Proactive scan detected these issues</span> in questions with no student reports yet.
            Running the triage engine on all questions before they go live could eliminate student harm entirely.
          </div>
        </div>

        {/* Body: list of defects */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {BONUS_DEFECTS.map((defect, i) => {
            const sev = SEVERITY_STYLES[defect.severity]
            const dtInfo = DEFECT_TYPE_LABELS[defect.defectType] || { label: defect.defectType, icon: Bug }
            const DtIcon = dtInfo.icon

            return (
              <div key={defect.questionId} className={`rounded-xl border ${sev.border} overflow-hidden`}>
                {/* Card header */}
                <div className={`${sev.bg} px-4 py-3 flex items-center gap-3`}>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sev.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold uppercase tracking-wider ${sev.color}`}>
                        {defect.severity === 'high' ? 'High Priority' : 'Medium Priority'}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">·</span>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                        <DtIcon className="w-3 h-3" />
                        {dtInfo.label}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">·</span>
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{defect.qid}</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{defect.title}</div>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4 space-y-3 bg-white dark:bg-gray-900">
                  <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{defect.subject}</span>
                    <span>·</span>
                    <span>{defect.chapter}</span>
                    <span>·</span>
                    <span>{defect.concept}</span>
                  </div>

                  <blockquote className="border-l-2 border-gray-300 dark:border-gray-600 pl-3 text-xs text-gray-600 dark:text-gray-400 italic font-mono">
                    {defect.questionSnippet}
                  </blockquote>

                  <div>
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Defect</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{defect.description}</p>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Evidence</div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{defect.evidence}</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Suggested Fix</div>
                    <p className="text-xs text-gray-700 dark:text-gray-300">{defect.suggestedFix}</p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        repair: {defect.repair}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-semibold bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

