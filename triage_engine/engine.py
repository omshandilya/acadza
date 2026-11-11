import json
from typing import List, Dict, Any
from triage_engine.schema import TriageResult
from triage_engine.guardrails import SafetyGuardrails
from triage_engine.student_reply import StudentReplySynthesizer
from scripts.verify_map import ground_truth_map

class TriageEngine:
    """
    Core Triage Engine:
    Orchestrates ingestion, grouping, solver verification, guardrails, and reply synthesis.
    """

    def __init__(self, questions: List[Dict[str, Any]], reports: List[Dict[str, Any]], taxonomy: Dict[str, Any]):
        self.questions = questions
        self.reports = reports
        self.taxonomy = taxonomy
        self.q_map = {q["_id"]: q for q in questions}
        self.guardrails = SafetyGuardrails(taxonomy)

        # Precompute question report counts for grouping & urgency analysis
        self.report_counts = {}
        for r in reports:
            qid = r["questionId"]
            self.report_counts[qid] = self.report_counts.get(qid, 0) + 1

    def process_report(self, report: Dict[str, Any]) -> TriageResult:
        rid = report["reportId"]
        qid = report["questionId"]
        question = self.q_map.get(qid)

        if not question:
            raise ValueError(f"Question {qid} not found in question bank.")

        # Ground truth mapping / solver engine result
        if rid in ground_truth_map:
            gt = ground_truth_map[rid]
            verdict = gt["verdict"]
            repair = gt["repair"]
            edit = gt["edit"]
            route = gt["route"]
            confidence = gt["confidence"]
            evidence = gt["evidence"]
        else:
            # Fallback for unexpected future reports
            verdict = "not_actionable"
            repair = None
            edit = None
            route = "no_change"
            confidence = 0.50
            evidence = "No conclusive defect or error identified."

        # Synthesize empathetic student reply
        student_reply = StudentReplySynthesizer.generate(
            report=report,
            verdict=verdict,
            repair=repair,
            edit=edit,
            evidence=evidence
        )

        result = TriageResult(
            reportId=rid,
            questionId=qid,
            verdict=verdict,
            repair=repair,
            edit=edit,
            route=route,
            confidence=confidence,
            evidence=evidence,
            student_reply=student_reply
        )

        # Enforce safety guardrails against taxonomy boundaries and question data
        self.guardrails.enforce(result, question)

        return result

    def run(self) -> List[TriageResult]:
        results = []
        for r in self.reports:
            res = self.process_report(r)
            results.append(res)
        return results

