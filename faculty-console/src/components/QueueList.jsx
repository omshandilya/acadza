import React from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  Users, 
  Search, 
  Filter, 
  Clock, 
  XCircle,
  Edit3,
  Layers
} from 'lucide-react';

export default function QueueList({
  groups,
  allGroups,
  qMap = {},
  selectedId,
  onSelect,
  filterRoute = 'all',
  onFilterRoute,
  setFilterRoute,
  filterSubject = 'All',
  onFilterSubject,
  setFilterSubject,
  subjects: propSubjects,
  searchQuery = '',
  onSearch,
  setSearchQuery,
  decisions = {}
}) {
  const setRoute = onFilterRoute || setFilterRoute || (() => {});
  const setSubject = onFilterSubject || setFilterSubject || (() => {});
  const setSearch = onSearch || setSearchQuery || (() => {});

  const sourceGroups = allGroups || groups || [];

  // Compute live counts for each filter pill across all question groups
  const counts = {
    all: sourceGroups.length,
    pending_faculty: sourceGroups.filter(g => {
      const route = g.primaryResult?.route || g.triage?.route;
      return route === 'faculty_review' && !decisions[g.questionId];
    }).length,
    auto_apply: sourceGroups.filter(g => {
      const route = g.primaryResult?.route || g.triage?.route;
      return route === 'auto_apply';
    }).length,
    no_change: sourceGroups.filter(g => {
      const route = g.primaryResult?.route || g.triage?.route;
      return route === 'no_change';
    }).length,
    decided: Object.keys(decisions).length,
  };

  // Extract unique subjects
  const subjects = propSubjects || ['All', ...new Set(sourceGroups.map(g => {
    const q = qMap[g.questionId] || g.question || {};
    return q.subject;
  }).filter(Boolean))];

  return (
    <div className="w-full md:w-96 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full overflow-hidden flex-shrink-0">
      
      {/* Search & Filter Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
        
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions, chapter, concepts, comments…"
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ×
            </button>
          )}
        </div>

        {/* Route Filter Pills */}
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'all', label: 'All Items', count: counts.all },
            { id: 'pending_faculty', label: 'Action Needed', count: counts.pending_faculty, highlight: true },
            { id: 'auto_apply', label: 'Auto-Apply', count: counts.auto_apply },
            { id: 'no_change', label: 'No Change', count: counts.no_change },
            { id: 'decided', label: 'Decided', count: counts.decided },
          ].map(tab => {
            const isActive = filterRoute === tab.id || (tab.id === 'pending_faculty' && filterRoute === 'faculty_review');
            return (
              <button
                key={tab.id}
                onClick={() => setRoute(tab.id)}
                className={`px-2.5 py-1.5 text-xs rounded-md font-medium transition flex items-center space-x-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-500 font-semibold'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-blue-700 text-white'
                    : tab.highlight && tab.count > 0
                    ? 'bg-red-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Subject Filter Dropdown */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <span className="flex items-center space-x-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <span className="font-medium">Filter Subject:</span>
          </span>
          <select
            value={filterSubject}
            onChange={(e) => setSubject(e.target.value)}
            className="text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Counter Info */}
        <div className="text-[11px] text-slate-400 dark:text-slate-500 flex justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
          <span>Showing <strong className="text-slate-700 dark:text-slate-300">{groups.length}</strong> of {counts.all}</span>
          <span className="font-medium">Ranked by Urgency</span>
        </div>
      </div>

      {/* Queue List Cards */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {groups.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs space-y-2">
            <div className="text-3xl opacity-40">🔍</div>
            <p className="font-semibold text-slate-600 dark:text-slate-300">No question groups match the selected filter.</p>
            <button
              onClick={() => {
                setRoute('all');
                setSubject('All');
                setSearch('');
              }}
              className="text-xs text-blue-600 dark:text-blue-400 underline hover:no-underline font-medium"
            >
              Clear filters and view all
            </button>
          </div>
        ) : (
          groups.map(group => {
            const isSelected = group.questionId === selectedId;
            const q = qMap[group.questionId] || group.question || {};
            const primary = group.primaryResult || group.triage || {};
            const urgency = group.urgency || { level: 'P3', levelLabel: 'Medium', score: 50, badgeColor: 'bg-slate-100 text-slate-700' };
            const decision = decisions[group.questionId];

            // Extract plain text snippet safely from question HTML
            const rawHtml = q.question || q[q.questionType]?.question || '';
            const plainText = rawHtml
              ? rawHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 110)
              : '';

            return (
              <div
                key={group.questionId}
                onClick={() => onSelect(group.questionId)}
                className={`p-3.5 cursor-pointer transition relative border-l-4 select-none ${
                  isSelected
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 shadow-sm'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border-transparent'
                }`}
              >
                {/* Top Row: Urgency & Subject */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    {/* Urgency Badge */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${urgency.badgeColor}`}>
                      {urgency.level} · {urgency.levelLabel}
                    </span>

                    {/* Report count badge if multiple */}
                    {group.reports?.length > 1 && (
                      <span className="flex items-center space-x-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        <Users className="w-3 h-3 mr-0.5" />
                        <span>{group.reports.length} reports</span>
                      </span>
                    )}
                  </div>

                  {/* Decision status if already reviewed */}
                  {decision ? (
                    <span className={`flex items-center space-x-1 text-[11px] font-semibold ${
                      decision.action === 'approved' 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : decision.action === 'edited'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {decision.action === 'approved' && <CheckCircle className="w-3.5 h-3.5" />}
                      {decision.action === 'edited' && <Edit3 className="w-3.5 h-3.5" />}
                      {decision.action === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                      <span className="capitalize">{decision.action}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400">
                      Score: {urgency.score}
                    </span>
                  )}
                </div>

                {/* Question Topic & Subject Tag */}
                <div className="flex items-center space-x-2 text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{q.subject || 'Subject'}</span>
                  <span>·</span>
                  <span className="truncate max-w-[140px]">{q.chapter || 'Chapter'}</span>
                  <span>·</span>
                  <span className="uppercase text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded font-mono">
                    {q.questionType || 'scq'}
                  </span>
                </div>

                {/* Text snippet preview */}
                <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed mb-2 font-normal">
                  {plainText || 'No question text preview available'}
                </p>

                {/* Bottom Tags: Verdict & Route */}
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center space-x-1.5">
                    <span className={`font-semibold uppercase tracking-wider ${
                      primary.verdict === 'defect' 
                        ? 'text-red-600 dark:text-red-400' 
                        : primary.verdict === 'no_error'
                        ? 'text-slate-500'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {primary.verdict}
                    </span>
                    {primary.repair && (
                      <>
                        <span className="text-slate-300 dark:text-slate-600">&rarr;</span>
                        <span className="font-mono text-slate-600 dark:text-slate-400">
                          {primary.repair}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {/* Engine Source Badge */}
                    <span className="text-[10px] font-medium">
                      {primary.engine_source === 'groq_llm' ? (
                        <span className="text-purple-600 dark:text-purple-400 font-semibold flex items-center" title="Live Groq LLM inference">
                          ⚡ Groq
                        </span>
                      ) : primary.engine_source === 'token_limit_fallback' ? (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center" title="Token limit fallback">
                          ⚠️ Fallback
                        </span>
                      ) : (
                        <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center" title="Precomputed verified solver">
                          🛡️ Verified
                        </span>
                      )}
                    </span>

                    <span className={`font-mono px-1.5 py-0.2 rounded font-semibold ${
                      primary.route === 'faculty_review'
                        ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                        : primary.route === 'auto_apply'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {primary.route}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
