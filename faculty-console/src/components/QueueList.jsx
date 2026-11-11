import React from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  Users, 
  Search, 
  Filter, 
  Clock, 
  XCircle,
  Edit3
} from 'lucide-react';

export default function QueueList({
  groups,
  selectedId,
  onSelect,
  filterRoute,
  setFilterRoute,
  filterSubject,
  setFilterSubject,
  searchQuery,
  setSearchQuery,
  decisions
}) {
  // Extract unique subjects
  const subjects = ['All', ...new Set(groups.map(g => g.question?.subject).filter(Boolean))];

  // Filtering
  const filteredGroups = groups.filter(g => {
    const q = g.question || {};
    const primary = g.primaryResult || {};
    const decision = decisions[g.questionId];

    // Route filter
    if (filterRoute !== 'all') {
      if (filterRoute === 'pending_faculty') {
        if (primary.route !== 'faculty_review' || decision) return false;
      } else if (filterRoute === 'faculty_review' && primary.route !== 'faculty_review') {
        return false;
      } else if (filterRoute === 'auto_apply' && primary.route !== 'auto_apply') {
        return false;
      } else if (filterRoute === 'no_change' && primary.route !== 'no_change') {
        return false;
      } else if (filterRoute === 'decided' && !decision) {
        return false;
      }
    }

    // Subject filter
    if (filterSubject !== 'All' && q.subject !== filterSubject) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const qText = (q[q.questionType]?.question || '').toLowerCase();
      const comments = g.reports.map(r => r.comment.toLowerCase()).join(' ');
      const qid = g.questionId.toLowerCase();
      const rids = g.reports.map(r => r.reportId.toLowerCase()).join(' ');
      const target = searchQuery.toLowerCase();
      if (!qText.includes(target) && !comments.includes(target) && !qid.includes(target) && !rids.includes(target)) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      
      {/* Search and Filters Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by QID, topic, formula, or comment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        {/* Route Filter Pills */}
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'pending_faculty', label: 'Action Needed', badge: '6' },
            { id: 'auto_apply', label: 'Auto-Apply' },
            { id: 'no_change', label: 'No Change' },
            { id: 'decided', label: 'Decided' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterRoute(tab.id)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center space-x-1 ${
                filterRoute === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Subject Filter Dropdown */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <span className="flex items-center space-x-1">
            <Filter className="w-3 h-3" />
            <span>Subject:</span>
          </span>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Counter Info */}
        <div className="text-[11px] text-slate-400 dark:text-slate-500 flex justify-between">
          <span>Showing {filteredGroups.length} question groups</span>
          <span>Ranked by Urgency Score</span>
        </div>
      </div>

      {/* Queue List Cards */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {filteredGroups.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
            No question groups match the selected filter.
          </div>
        ) : (
          filteredGroups.map(group => {
            const isSelected = group.questionId === selectedId;
            const q = group.question || {};
            const primary = group.primaryResult || {};
            const urgency = group.urgency;
            const decision = decisions[group.questionId];

            // Clean text preview
            const rawHtml = q[q.questionType]?.question || '';
            const plainText = rawHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 110);

            return (
              <div
                key={group.questionId}
                onClick={() => onSelect(group.questionId)}
                className={`p-3.5 cursor-pointer transition relative border-l-4 ${
                  isSelected
                    ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-600 dark:border-blue-500'
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
                    {group.reports.length > 1 && (
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
                    {q.questionType}
                  </span>
                </div>

                {/* Text snippet preview */}
                <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed mb-2">
                  {plainText || 'No question text preview available'}
                </p>

                {/* Bottom Tags: Verdict & Route */}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center space-x-1.5">
                    {/* Route badge */}
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      primary.route === 'faculty_review'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        : primary.route === 'auto_apply'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {primary.route === 'faculty_review' ? 'Needs Review' : primary.route}
                    </span>

                    {/* Repair tag */}
                    {primary.repair && (
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        {primary.repair}
                      </span>
                    )}
                  </div>

                  {/* Stored Answer */}
                  <span className="text-[10px] text-slate-400 font-mono">
                    Key: <strong className="text-slate-700 dark:text-slate-300">{JSON.stringify(q[q.questionType]?.answer)}</strong>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

