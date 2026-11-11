import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import json
from scripts.verify_map import ground_truth_map

with open('data/questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)
with open('data/reports.json', 'r', encoding='utf-8') as f:
    reports = {r['reportId']: r for r in json.load(f)}

q_map = {q['_id']: q for q in questions}

print("Testing surgical edits against actual question data...")
for rid, item in ground_truth_map.items():
    edit = item.get('edit')
    if not edit:
        continue
    
    qid = reports[rid]['questionId']
    q = q_map[qid]
    qtype = q['questionType']
    
    field = edit['field']
    find_str = edit.get('find')
    replace_str = edit.get('replace')
    
    if field == 'questionType':
        val = q.get('questionType')
        print(f"[{rid}] Field {field}: current='{val}', find='{find_str}', replace='{replace_str}'")
        assert find_str in val, f"find_str '{find_str}' not in questionType"
    elif field == 'answer':
        val = q[qtype].get('answer')
        print(f"[{rid}] Field {field}: current={val}, find='{find_str}', replace='{replace_str}'")
        if isinstance(val, list):
            # check representation
            assert find_str == str(val) or find_str in [str(x) for x in val]
        else:
            assert find_str == val or find_str in val
    else:
        val = q[qtype].get(field, '')
        found = find_str in val
        print(f"[{rid}] Field {field}: find='{find_str[:30]}...' -> Found in text: {found}")
        assert found, f"[{rid}] Could not find string in {field}: {find_str}"

print("\nALL SURGICAL EDITS VERIFIED SUCCESSFULLY AGAINST ACTUAL QUESTION DATA!")

