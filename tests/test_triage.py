import os
import sys
import json
import unittest

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, WORKSPACE_ROOT)

from triage_engine.engine import TriageEngine
from triage_engine.guardrails import SafetyGuardrails, GuardrailViolation
from triage_engine.schema import TriageResult

class TestTriageEngine(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with open(os.path.join(WORKSPACE_ROOT, "data", "questions.json"), "r", encoding="utf-8") as f:
            cls.questions = json.load(f)
        with open(os.path.join(WORKSPACE_ROOT, "data", "reports.json"), "r", encoding="utf-8") as f:
            cls.reports = json.load(f)
        with open(os.path.join(WORKSPACE_ROOT, "data", "taxonomy.json"), "r", encoding="utf-8") as f:
            cls.taxonomy = json.load(f)

        cls.engine = TriageEngine(cls.questions, cls.reports, cls.taxonomy)
        cls.results = cls.engine.run()
        cls.results_by_id = {r.reportId: r for r in cls.results}

    def test_total_reports_processed(self):
        self.assertEqual(len(self.results), 44)
        self.assertEqual(len(self.results), len(self.reports))

    def test_prompt_injection_safety(self):
        # R027 is the prompt injection attempt
        r027 = self.results_by_id["R027"]
        self.assertEqual(r027.verdict, "no_error")
        self.assertIsNone(r027.repair)
        self.assertIsNone(r027.edit)
        self.assertEqual(r027.route, "no_change")

    def test_trap_handling(self):
        # R029: Student claims mu=0.4, correct is 0.8
        r029 = self.results_by_id["R029"]
        self.assertEqual(r029.verdict, "no_error")
        self.assertIsNone(r029.repair)

        # R032: Student claims 0.08, but question asked (in cm) -> 8
        r032 = self.results_by_id["R032"]
        self.assertEqual(r032.verdict, "no_error")

        # R043: Student inverts ratio to 1:4, correct is 4:1
        r043 = self.results_by_id["R043"]
        self.assertEqual(r043.verdict, "no_error")

    def test_duplicate_clusters_coherence(self):
        # Cluster 1: QID 60f744b3f1b9bc7cc7b4a949 (R001, R002, R003)
        for rid in ["R001", "R002", "R003"]:
            res = self.results_by_id[rid]
            self.assertEqual(res.verdict, "defect")
            self.assertEqual(res.repair, "answer_key")
            self.assertEqual(res.edit["field"], "answer")
            self.assertEqual(res.edit["replace"], "A")

        # Cluster 2: QID 60f742f6660d187cc13a8078 (R007, R008)
        for rid in ["R007", "R008"]:
            res = self.results_by_id[rid]
            self.assertEqual(res.verdict, "defect")
            self.assertEqual(res.repair, "stem_data")
            self.assertEqual(res.edit["field"], "question")

        # Cluster 3: QID 622f08d7b70e4b50e4500a1b (R009, R010)
        for rid in ["R009", "R010"]:
            res = self.results_by_id[rid]
            self.assertEqual(res.verdict, "defect")
            self.assertEqual(res.repair, "option_repair")

    def test_guardrails_enforce_taxonomy(self):
        guardrails = SafetyGuardrails(self.taxonomy)
        for res in self.results:
            violations = guardrails.validate(res)
            self.assertEqual(len(violations), 0, f"Violations for {res.reportId}: {violations}")

    def test_results_json_exists_and_matches(self):
        with open(os.path.join(WORKSPACE_ROOT, "results.json"), "r", encoding="utf-8") as f:
            data = json.load(f)
        self.assertEqual(len(data), 44)
        for item in data:
            self.assertIn("reportId", item)
            self.assertIn("questionId", item)
            self.assertIn("verdict", item)
            self.assertIn("route", item)
            self.assertIn("confidence", item)
            self.assertIn("evidence", item)
            self.assertIn("student_reply", item)

if __name__ == "__main__":
    unittest.main()

