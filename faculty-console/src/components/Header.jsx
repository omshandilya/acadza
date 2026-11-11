import React from 'react';
import { 
  ShieldCheck, 
  Moon, 
  Sun, 
  History, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  RotateCcw 
} from 'lucide-react';

export default function Header({ 
  stats, 
  darkMode, 
  setDarkMode, 
  onToggleDark,
  onOpenAudit, 
  onShowAudit,
  onOpenBonus, 
  onShowBonus,
  onReset,
  onSelectFilter,
  filterRoute
}) {
  const toggleDark = onToggleDark || (() => setDarkMode?.(!darkMode));
  const openAudit = onOpenAudit || onShowAudit;
  const openBonus = onOpenBonus || onShowBonus;

  const totalCount = stats?.totalGroups ?? stats?.total ?? 0;
  const facultyCount = stats?.facultyReview ?? 0;
  const autoApplyCount = stats?.autoApply ?? 0;
  const auditCount = stats?.auditCount ?? 0;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Product Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Acadza
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Faculty Review Console
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Intelligent Student Report → Fix Loop · 8 Lakh JEE/NEET Question Bank
              </p>
            </div>
          </div>

          {/* Real-time Status Counters / Filter Shortcuts */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={() => onSelectFilter && onSelectFilter('pending_faculty')}
              title="Click to filter by Action Needed"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                filterRoute === 'pending_faculty' || filterRoute === 'faculty_review'
                  ? 'bg-red-100 dark:bg-red-950/80 border-red-400 text-red-800 dark:text-red-200 ring-2 ring-red-500/30'
                  : 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span className="font-bold">{facultyCount}</span>
              <span>Action Needed</span>
            </button>

            <button
              onClick={() => onSelectFilter && onSelectFilter('auto_apply')}
              title="Click to filter by Auto-Apply"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                filterRoute === 'auto_apply'
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-400 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/30'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bold">{autoApplyCount}</span>
              <span>Auto-Apply</span>
            </button>

            <button
              onClick={() => onSelectFilter && onSelectFilter('all')}
              title="Click to show All Questions"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                filterRoute === 'all'
                  ? 'bg-blue-100 dark:bg-blue-950/80 border-blue-400 text-blue-800 dark:text-blue-200 ring-2 ring-blue-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-bold">{totalCount}</span>
              <span>All Questions</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            {/* Bonus Stealth Defects Modal Trigger */}
            <button
              onClick={openBonus}
              title="Bonus: View un-reported defects found in questions.json"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 transition shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Bonus:</span>
              <span className="font-semibold">Stealth Bugs</span>
            </button>

            {/* Audit Trail Modal Trigger */}
            <button
              onClick={openAudit}
              title="View faculty approval & rejection audit log"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition shadow-sm"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Audit Log</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 font-bold">
                {auditCount}
              </span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleDark}
              title={darkMode ? "Switch to daytime light mode" : "Late-night 10 PM dark mode"}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Session Reset */}
            <button
              onClick={() => {
                if (window.confirm("Reset all review decisions made in this session?")) {
                  onReset();
                }
              }}
              title="Reset all review decisions"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:border-slate-700 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
