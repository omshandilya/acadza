import json
import time
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from triage_engine.llm_client import GroqTriageClient

def test():
    with open("data/questions.json", encoding="utf-8") as f:
        qs = json.load(f)
    with open("data/reports.json", encoding="utf-8") as f:
        rs = json.load(f)
    with open("data/taxonomy.json", encoding="utf-8") as f:
        tax = json.load(f)

    client = GroqTriageClient()
    q_map = {q["_id"]: q for q in qs}

    r001 = rs[0]
    q001 = q_map[r001["questionId"]]

    print(f"[TEST] Sending live call to Groq API ({client.model}) for report {r001['reportId']}...")
    t0 = time.time()
    res = client.triage_report(r001, q001, tax)
    dt = time.time() - t0

    print(f"[TEST] Groq responded in {dt:.2f}s!")
    print(json.dumps(res, indent=2))

if __name__ == "__main__":
    test()

