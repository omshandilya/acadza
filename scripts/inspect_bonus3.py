import json, sys
sys.path.insert(0, '.')

with open('data/questions.json') as f:
    qs = json.load(f)

target_ids = [
    '68dea87d387eea3d0d95fbe3',
    '68dea6e6387eea3d0d95f6f8',
    '68dea657387eea3d0d95f54a',
    '695ede2a88d7701e561aa9d9',
]

for qid in target_ids:
    q = next((x for x in qs if x['_id'] == qid), None)
    if q:
        qtype = q.get('questionType', 'scq')
        inner = q.get(qtype, q.get('scq', {}))
        question_html = inner.get('question', '')
        solution_html = inner.get('solution', '')
        options = inner.get('options', {})
        answer = inner.get('answer')
        mspace_q = '<mspace' in question_html
        mspace_s = '<mspace' in solution_html
        print(f"\n=== QID: {qid} ({q.get('qid')}) ===")
        print(f"Subject: {q['subject']} | Chapter: {q['chapter']}")
        print(f"mspace in question: {mspace_q} | mspace in solution: {mspace_s}")
        print(f"Answer: {answer}")
        # Print full question
        import re
        clean = re.sub(r'<[^>]+>', ' ', question_html).strip()
        print(f"Question (clean): {clean[:400]}")
        sol_clean = re.sub(r'<[^>]+>', ' ', solution_html).strip()
        print(f"Solution (clean, 300): {sol_clean[:300]}")
        if options:
            print(f"Options: {options}")
        print()

