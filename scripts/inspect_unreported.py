import json

with open('data/questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)
with open('data/reports.json', 'r', encoding='utf-8') as f:
    reports = json.load(f)

reported_qids = set(r['questionId'] for r in reports)
unreported = [q for q in questions if q['_id'] not in reported_qids]

print(f"Total unreported questions: {len(unreported)}")
for q in unreported:
    qid = q['_id']
    qt = q['questionType']
    c = q[qt]
    print("=" * 70)
    print(f"QID: {qid} | Subject: {q.get('subject')} | Chapter: {q.get('chapter')}")
    print(f"Type: {qt} | Stored Ans: {c.get('answer')}")
    print("QUESTION:\n", c.get('question'))
    print("SOLUTION:\n", c.get('solution'))

