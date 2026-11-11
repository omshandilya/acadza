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
  onOpenAudit, 
  onOpenBonus, 
  onReset 
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
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

          {/* Real-time Status Counters */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span className="font-semibold text-red-700 dark:text-red-300">{stats.facultyReview}</span>
              <span className="text-red-600/80 dark:text-red-400/80">Faculty Review</span>
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">{stats.autoApply}</span>
              <span className="text-emerald-600/80 dark:text-emerald-400/80">Auto-Apply</span>
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.totalGroups}</span>
              <span className="text-slate-500 dark:text-slate-400">Questions</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            {/* Bonus Stealth Defects Modal Trigger */}
            <button
              onClick={onOpenBonus}
              title="Bonus: View un-reported defects found in questions.json"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Bonus:</span>
              <span>Stealth Bugs</span>
            </button>

            {/* Audit Trail Modal Trigger */}
            <button
              onClick={onOpenAudit}
              title="View faculty approval & rejection audit log"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Audit Log</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700">
                {stats.auditCount}
              </span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Switch to daytime light mode" : "Late-night 10 PM dark mode"}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Reset button */}
            <button
              onClick={onReset}
              title="Reset decisions to fresh defaults"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}

