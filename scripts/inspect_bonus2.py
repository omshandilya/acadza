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
        print(f"\n=== QID: {qid} ===")
        print(f"Keys: {list(q.keys())}")
        for k, v in q.items():
            val = str(v)[:300]
            print(f"  {k}: {val}")
    else:
        print(f"NOT FOUND: {qid}")

