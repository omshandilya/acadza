import json

with open('data/questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)
with open('data/reports.json', 'r', encoding='utf-8') as f:
    reports = json.load(f)
with open('data/taxonomy.json', 'r', encoding='utf-8') as f:
    taxonomy = json.load(f)

q_map = {q['_id']: q for q in questions}

print(f"Total reports: {len(reports)}")
for i, r in enumerate(reports):
    qid = r['questionId']
    print(f"[{i+1:02d}] {r['reportId']} -> Q: {qid}")

