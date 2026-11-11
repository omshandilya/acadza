import json
import re

def clean_html(raw_html):
    if not raw_html:
        return ''
    cleanr = re.compile(r'<.*?>')
    cleantext = re.sub(cleanr, ' ', raw_html)
    return ' '.join(cleantext.split())

def main():
    with open('data/questions.json', 'r', encoding='utf-8') as f:
        questions = json.load(f)
    with open('data/reports.json', 'r', encoding='utf-8') as f:
        reports = json.load(f)
    with open('data/taxonomy.json', 'r', encoding='utf-8') as f:
        taxonomy = json.load(f)

    q_map = {q['_id']: q for q in questions}

    print("=== SUMMARY OF ALL 44 REPORTS ===")
    for i, r in enumerate(reports):
        qid = r['questionId']
        q = q_map.get(qid, {})
        qtype = q.get('questionType', 'unknown')
        content = q.get(qtype, {})
        q_text = clean_html(content.get('question', ''))[:90]
        sol_text = clean_html(content.get('solution', ''))[:90]
        ans = content.get('answer', '')
        print(f"[{i+1:02d}] {r['reportId']} | QID: {qid} | Type: {qtype} | Ans: {ans}")
        print(f"     Comment : {r['comment']}")
        print(f"     Question: {q_text}")
        print(f"     Solution: {sol_text}")
        print("-" * 80)

    print("\n=== UNREPORTED QUESTIONS (BONUS CANDIDATES) ===")
    reported_qids = set(r['questionId'] for r in reports)
    for q in questions:
        if q['_id'] not in reported_qids:
            qtype = q.get('questionType', 'unknown')
            content = q.get(qtype, {})
            q_text = clean_html(content.get('question', ''))[:100]
            sol_text = clean_html(content.get('solution', ''))[:100]
            ans = content.get('answer', '')
            print(f"Unreported QID: {q['_id']} | Type: {qtype} | Ans: {ans}")
            print(f"Question: {q_text}")
            print(f"Solution: {sol_text}")
            print("-" * 80)

if __name__ == '__main__':
    main()
