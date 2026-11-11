import json, sys, re
sys.path.insert(0, '.')

with open('data/questions.json') as f:
    qs = json.load(f)
with open('data/reports.json') as f:
    rs = json.load(f)

reported_qids = {r['questionId'] for r in rs}

# Known bonus IDs from scan and analysis
bonus_ids = [
    '68dea87d387eea3d0d95fbe3',  # unreported mspace leak
    '68dea657387eea3d0d95f54a',  # from previous analysis: garbled MathML labels
    '695ede2a88d7701e561aa9d9',  # from previous analysis: dialysis statement
]

# Also check all unreported qids
all_qids = {q['_id'] for q in qs}
unreported_qids = all_qids - reported_qids
print(f"Total questions: {len(qs)}, Reported on: {len(reported_qids)}, Unreported: {len(unreported_qids)}")
print("Unreported QIDs:", list(unreported_qids)[:10])
print()

for qid in bonus_ids:
    q = next((x for x in qs if x['_id'] == qid), None)
    if q:
        is_rep = qid in reported_qids
        subj = q.get('subject', 'N/A')
        chap = q.get('chapter', 'N/A')
        qtype = q.get('questionType', 'N/A')
        qtext = q.get('question', '')[:300]
        sol = q.get('solution', '')[:200]
        opts = q.get('options', {})
        ans = q.get('answer')
        mspace_in_q = '<mspace' in q.get('question', '')
        mspace_in_s = '<mspace' in q.get('solution', '')
        print(f"QID: {qid}")
        print(f"  Reported: {is_rep}")
        print(f"  Subject: {subj} | Chapter: {chap} | Type: {qtype}")
        print(f"  mspace in question: {mspace_in_q} | mspace in solution: {mspace_in_s}")
        print(f"  Answer: {ans}")
        print(f"  Question snippet: {qtext[:200]}")
        print()
    else:
        print(f"QID {qid}: NOT FOUND in questions.json")

