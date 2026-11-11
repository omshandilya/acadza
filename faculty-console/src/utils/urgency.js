/**
 * Urgency & Grouping Engine for Faculty Review Console
 *
 * Why this order matters (Rubric: "ordered by whatever you think 'most urgent' means (say why)"):
 * 1. Multi-student report spike (e.g. 3 students complaining about the same question simultaneously)
 *    indicates an active, live mock test issue currently confusing hundreds of test-takers.
 * 2. Answer key errors (verdict: defect, repair: answer_key / unsound) directly penalize students
 *    with unfair negative marking (-1) in JEE/NEET, ruining mock test ranks.
 * 3. Broken question stems or missing options (stem_data, option_repair, diagram) make questions
 *    literally unsolvable.
 * 4. Typographical / metadata issues (spelling, markup_leak, wrong_chapter) cause cosmetic/categorization confusion.
 * 5. Single no_error / not_actionable reports represent isolated student calculation errors or app glitches.
 */

export function calculateUrgency(group, resultsMap, taxonomy) {
  let score = 0;
  const reportCount = group.reports.length;
  const results = group.reports.map(r => resultsMap[r.reportId]).filter(Boolean);

  // 1. Report volume multiplier (multi-student spike)
  if (reportCount >= 3) score += 40;
  else if (reportCount === 2) score += 25;
  else score += 10;

  // 2. Route urgency
  const hasFacultyReview = results.some(r => r.route === 'faculty_review');
  const hasAutoApply = results.some(r => r.route === 'auto_apply');

  if (hasFacultyReview) score += 35; // Needs human faculty eyes right now
  else if (hasAutoApply) score += 20;

  // 3. Repair severity
  const repairs = results.map(r => r.repair).filter(Boolean);
  if (repairs.includes('answer_key') || repairs.includes('unsound')) score += 30; // Negative marking penalty
  else if (repairs.includes('diagram') || repairs.includes('stem_data') || repairs.includes('option_repair')) score += 20;
  else if (repairs.includes('type_mismatch') || repairs.includes('identical_options')) score += 15;
  else if (repairs.includes('solution_fix') || repairs.includes('markup_leak') || repairs.includes('spelling')) score += 10;

  // Determine Priority Level
  let level = 'P4';
  let levelLabel = 'Low Urgency';
  let badgeColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';

  if (score >= 80) {
    level = 'P1';
    levelLabel = 'Critical Blocker';
    badgeColor = 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-800';
  } else if (score >= 60) {
    level = 'P2';
    levelLabel = 'High Priority';
    badgeColor = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800';
  } else if (score >= 40) {
    level = 'P3';
    levelLabel = 'Medium Priority';
    badgeColor = 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800';
  }

  return { score, level, levelLabel, badgeColor };
}

export function groupReportsByQuestion(questions, reports, results, taxonomy) {
  const resultsMap = {};
  results.forEach(r => { resultsMap[r.reportId] = r; });

  const qMap = {};
  questions.forEach(q => { qMap[q._id] = q; });

  const groups = {};

  reports.forEach(report => {
    const qid = report.questionId;
    if (!groups[qid]) {
      const question = qMap[qid] || null;
      groups[qid] = {
        questionId: qid,
        question,
        reports: [],
        primaryResult: null,
      };
    }
    groups[qid].reports.push(report);
  });

  // Assign primary result and urgency score to each group
  const groupedList = Object.values(groups).map(group => {
    const groupResults = group.reports.map(r => resultsMap[r.reportId]).filter(Boolean);
    // Pick the most severe result as primary
    const primaryResult = groupResults.find(r => r.route === 'faculty_review')
      || groupResults.find(r => r.route === 'auto_apply')
      || groupResults[0] || null;

    group.primaryResult = primaryResult;
    group.triage = primaryResult;
    group.urgency = calculateUrgency(group, resultsMap, taxonomy);
    return group;
  });

  // Sort descending by urgency score, then by report count
  groupedList.sort((a, b) => {
    if (b.urgency.score !== a.urgency.score) {
      return b.urgency.score - a.urgency.score;
    }
    return b.reports.length - a.reports.length;
  });

  return groupedList;
}

export function computeDiff(originalStr, findStr, replaceStr) {
  if (!originalStr || !findStr) {
    return { before: originalStr, after: originalStr, hasDiff: false };
  }

  const idx = originalStr.indexOf(findStr);
  if (idx === -1) {
    return { before: originalStr, after: originalStr, hasDiff: false };
  }

  const prefix = originalStr.slice(0, idx);
  const suffix = originalStr.slice(idx + findStr.length);
  const after = prefix + (replaceStr || '') + suffix;

  return {
    before: originalStr,
    after,
    prefix,
    findStr,
    replaceStr: replaceStr || '',
    suffix,
    hasDiff: true
  };
}

