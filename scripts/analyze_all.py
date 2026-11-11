import json
import re

def clean_html(raw_html):
    if not raw_html: return ''
    cleanr = re.compile(r'<.*?>')
    cleantext = re.sub(cleanr, ' ', raw_html)
    return ' '.join(cleantext.split())

with open('data/questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)
with open('data/reports.json', 'r', encoding='utf-8') as f:
    reports = json.load(f)
with open('data/taxonomy.json', 'r', encoding='utf-8') as f:
    taxonomy = json.load(f)

q_map = {q['_id']: q for q in questions}

print(f"Loaded {len(reports)} reports and {len(questions)} questions.")

for i, r in enumerate(reports):
    qid = r['questionId']
    q = q_map.get(qid, {})
    qtype = q.get('questionType')
    c = q.get(qtype, {})
    print(f"#{i+1:02d} | Report: {r['reportId']} | QID: {qid} | Type: {qtype} | Stored Ans: {c.get('answer')}")
    print(f"Comment: {r['comment']}")
    print(f"Q: {c.get('question')}")
    print(f"SOL: {c.get('solution')}")
    print("="*80)

