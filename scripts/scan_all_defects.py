import json
import re

with open('data/questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)
with open('data/reports.json', 'r', encoding='utf-8') as f:
    reports = json.load(f)

reported_qids = set(r['questionId'] for r in reports)

print(f"Scanning all {len(questions)} questions for unreported defects...")

for q in questions:
    qid = q['_id']
    qt = q.get('questionType')
    c = q.get(qt, {})
    q_html = c.get('question', '')
    sol_html = c.get('solution', '')
    ans = c.get('answer')
    imgs = c.get('quesImages', [])

    is_reported = qid in reported_qids
    status = "REPORTED" if is_reported else ">>> UNREPORTED <<<"

    # Check for markup leaks like \frac, \times, \alpha outside tags, <mspace outside math
    if '<mspace' in q_html:
        print(f"[{status}] {qid} ({qt}) has <mspace> leak in question HTML!")
    if r'\frac' in q_html or r'\sqrt' in q_html or r'\times' in q_html:
        print(f"[{status}] {qid} ({qt}) has raw LaTeX leak in question HTML!")
    if 'figure' in q_html.lower() and not imgs:
        print(f"[{status}] {qid} ({qt}) mentions figure but has 0 images!")
    
    # Check for empty options (A), (B), (C), (D)
    for opt in ['(A)', '(B)', '(C)', '(D)']:
        if opt in q_html:
            # check what follows
            idx = q_html.find(opt)
            snippet = q_html[idx:idx+25]
            if f"{opt}<br" in snippet or f"{opt} <br" in snippet or f"{opt}\n" in snippet:
                print(f"[{status}] {qid} ({qt}) has blank option {opt}!")

    # Check for stray question labels like (JEE Main 2019) or (NEET 2019)
    if re.search(r'\((JEE|NEET|AIEEE|CBSE)\s+\d{4}\)', q_html):
        print(f"[{status}] {qid} ({qt}) has exam reference tag in question HTML!")

print("Scan complete.")

