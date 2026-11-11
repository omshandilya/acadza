import json

def get_report_catalog():
    with open('data/questions.json', 'r', encoding='utf-8') as f:
        questions = json.load(f)
    with open('data/reports.json', 'r', encoding='utf-8') as f:
        reports = json.load(f)
    with open('data/taxonomy.json', 'r', encoding='utf-8') as f:
        taxonomy = json.load(f)

    q_map = {q['_id']: q for q in questions}

    results = []
    for r in reports:
        qid = r['questionId']
        q = q_map[qid]
        qtype = q['questionType']
        c = q[qtype]
        results.append({
            'reportId': r['reportId'],
            'questionId': qid,
            'comment': r['comment'],
            'studentId': r['studentId'],
            'source': r['source'],
            'reportedAt': r['reportedAt'],
            'qtype': qtype,
            'answer': c.get('answer'),
            'question': c.get('question'),
            'solution': c.get('solution')
        })
    return results

if __name__ == '__main__':
    items = get_report_catalog()
    for item in items:
        print(f"{item['reportId']} | {item['comment']}")

