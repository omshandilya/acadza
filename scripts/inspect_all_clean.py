import json
import re

def clean_html(raw_html):
    if not raw_html: return ''
    cleanr = re.compile(r'<.*?>')
    cleantext = re.sub(cleanr, ' ', raw_html)
    return ' '.join(cleantext.split())

def inspect_all():
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
        q = q_map.get(qid, {})
        qtype = q.get('questionType', 'unknown')
        c = q.get(qtype, {})
        print(f"[{i+1}] {r['reportId']} | QID: {qid} | Type: {qtype} | Ans: {c.get('answer')}")
        print(f"    Comment: {r['comment']}")
        print(f"    Q text : {clean_html(c.get('question',''))[:120]}")
        print(f"    Sol text: {clean_html(c.get('solution',''))[:120]}")
        print("="*60)

if __name__ == '__main__':
    inspect_all()

