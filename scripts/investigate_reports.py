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

q_map = {q['_id']: q for q in questions}

# Let's inspect specific reports
report_ids_to_check = [r['reportId'] for r in reports]

for r in reports:
    rid = r['reportId']
    qid = r['questionId']
    q = q_map[qid]
    qtype = q['questionType']
    content = q[qtype]
    print(f"=== {rid} (Q: {qid}) ===")
    print(f"Comment: {r['comment']}")
    print(f"Subject: {q.get('subject')}, Chapter: {q.get('chapter')}")
    print(f"Type: {qtype}, Ans: {content.get('answer')}")
    print(f"Q: {content.get('question')}")
    print(f"SOL: {content.get('solution')}\n")

