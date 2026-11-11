import os
import sys
import json

# Ensure workspace root is in python path
WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, WORKSPACE_ROOT)

from triage_engine.engine import TriageEngine

def main():
    questions_path = os.path.join(WORKSPACE_ROOT, "data", "questions.json")
    reports_path = os.path.join(WORKSPACE_ROOT, "data", "reports.json")
    taxonomy_path = os.path.join(WORKSPACE_ROOT, "data", "taxonomy.json")
    output_path = os.path.join(WORKSPACE_ROOT, "results.json")

    print(f"Loading data from {WORKSPACE_ROOT}/data ...")
    with open(questions_path, "r", encoding="utf-8") as f:
        questions = json.load(f)
    with open(reports_path, "r", encoding="utf-8") as f:
        reports = json.load(f)
    with open(taxonomy_path, "r", encoding="utf-8") as f:
        taxonomy = json.load(f)

    print(f"Initializing TriageEngine ({len(reports)} reports, {len(questions)} questions) ...")
    engine = TriageEngine(questions=questions, reports=reports, taxonomy=taxonomy)

    print("Running triage engine across all reports...")
    results = engine.run()

    # Convert to serialized dicts
    results_data = [r.to_dict() for r in results]

    print(f"Writing {len(results_data)} results to {output_path} ...")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results_data, f, indent=2, ensure_ascii=False)

    print("\n" + "="*60)
    print("TRIAGE SUMMARY:")
    verdict_counts = {}
    route_counts = {}
    repair_counts = {}

    for item in results_data:
        v = item["verdict"]
        r = item["route"]
        rep = item["repair"]
        verdict_counts[v] = verdict_counts.get(v, 0) + 1
        route_counts[r] = route_counts.get(r, 0) + 1
        if rep:
            repair_counts[rep] = repair_counts.get(rep, 0) + 1

    print("Verdicts breakdown:")
    for k, v in sorted(verdict_counts.items(), key=lambda x: -x[1]):
        print(f"  - {k}: {v}")

    print("\nRouting breakdown:")
    for k, v in sorted(route_counts.items(), key=lambda x: -x[1]):
        print(f"  - {k}: {v}")

    print("\nRepairs applied (defects only):")
    for k, v in sorted(repair_counts.items(), key=lambda x: -x[1]):
        print(f"  - {k}: {v}")

    print("="*60)
    print("results.json generated successfully!")

if __name__ == "__main__":
    main()

