import json

with open('data/questions.json', 'r', encoding='utf-8') as f:
    qs = {q['_id']: q for q in json.load(f)}
with open('data/reports.json', 'r', encoding='utf-8') as f:
    reports = {r['reportId']: r for r in json.load(f)}

def inspect(rids):
    for rid in rids:
        r = reports[rid]
        q = qs[r['questionId']]
        qt = q['questionType']
        c = q[qt]
        print(f"*** {rid} *** : {r['comment']}")
        print(f"Subject: {q.get('subject')} | Chapter: {q.get('chapter')}")
        print(f"Type: {qt} | Stored Ans: {c.get('answer')}")
        print("Question:\n", c.get('question'))
        print("Solution:\n", c.get('solution'))
        print("="*60)

if __name__ == '__main__':
    import sys
    rids = sys.argv[1:] if len(sys.argv) > 1 else ['R034', 'R010', 'R017', 'R032', 'R026', 'R042', 'R023', 'R038', 'R014', 'R040', 'R044', 'R028']
    inspect(rids)

