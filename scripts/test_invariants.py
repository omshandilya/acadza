import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import json
from scripts.verify_map import ground_truth_map

with open('data/taxonomy.json', 'r', encoding='utf-8') as f:
    tax = json.load(f)

verdicts = set(tax['verdicts'].keys())
repairs = set(tax['repairs'].keys())

errors = []
for rid, item in ground_truth_map.items():
    v = item['verdict']
    if v not in verdicts:
        errors.append(f"{rid}: invalid verdict {v}")
    
    r = item['repair']
    if v == 'defect':
        if not r or r not in repairs:
            errors.append(f"{rid}: invalid repair {r}")
        else:
            rep_spec = tax['repairs'][r]
            # check route
            if not rep_spec['auto'] and item['route'] != 'faculty_review':
                errors.append(f"{rid}: repair {r} is auto:false but route is {item['route']}")
            
            # check edit fields
            edit = item.get('edit')
            if edit:
                field = edit.get('field')
                if field not in rep_spec['fields']:
                    errors.append(f"{rid}: field {field} not allowed for repair {r} (allowed: {rep_spec['fields']})")
    else:
        if r is not None:
            errors.append(f"{rid}: non-defect has repair {r}")
        if item['edit'] is not None:
            errors.append(f"{rid}: non-defect has edit")
        if item['route'] != 'no_change':
            errors.append(f"{rid}: non-defect route is {item['route']}")

if errors:
    print("ERRORS FOUND:")
    for e in errors:
        print(" -", e)
else:
    print("ALL TAXONOMY INVARIANTS PASSED PERFECTLY!")
