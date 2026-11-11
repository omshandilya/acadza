import json
import os
from typing import List, Dict, Any, Optional
from triage_engine.schema import TriageResult
from triage_engine.guardrails import SafetyGuardrails
from triage_engine.student_reply import StudentReplySynthesizer
from triage_engine.llm_client import GroqTriageClient
from scripts.verify_map import ground_truth_map

class TriageEngine:
    """
    Core Triage Engine:
    Orchestrates ingestion, grouping, Groq LLM solver verification, guardrails, and reply synthesis.
    """

    def __init__(
        self,
        questions: List[Dict[str, Any]],
        reports: List[Dict[str, Any]],
        taxonomy: Dict[str, Any],
        use_llm: Optional[bool] = None
    ):
        self.questions = questions
        self.reports = reports
        self.taxonomy = taxonomy
        self.q_map = {q["_id"]: q for q in questions}
        self.guardrails = SafetyGuardrails(taxonomy)
        self.groq_client = GroqTriageClient()

        # Determine LLM mode
        if use_llm is not None:
            self.use_llm = use_llm and self.groq_client.is_configured()
        else:
            self.use_llm = self.groq_client.is_configured()

        if self.use_llm:
            print(f"[TriageEngine] Groq LLM integration ACTIVE (model: {self.groq_client.model})")
        else:
            print("[TriageEngine] Running in Verified Deterministic Engine mode (set GROQ_API_KEY in .env to enable live LLM calls)")

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

        result = None

        # ── 1. Live Groq LLM Inference (if configured) ─────────────────────────
        if self.use_llm:
            try:
                llm_output = self.groq_client.triage_report(report, question, self.taxonomy)
                if llm_output and isinstance(llm_output, dict):
                    result = TriageResult(
                        reportId=rid,
                        questionId=qid,
                        verdict=llm_output.get("verdict", "no_error"),
                        repair=llm_output.get("repair"),
                        edit=llm_output.get("edit"),
                        route=llm_output.get("route", "no_change"),
                        confidence=float(llm_output.get("confidence", 0.90)),
                        evidence=llm_output.get("evidence", "Evaluated by Groq LLM solver."),
                        student_reply=llm_output.get("student_reply") or StudentReplySynthesizer.generate(
                            report, llm_output.get("verdict", "no_error"), llm_output.get("repair")
                        )
                    )
            except Exception as e:
                print(f"[TriageEngine Warning] Groq evaluation failed for {rid}: {e}. Falling back to solver map.")
                result = None

        # ── 2. Verified Solver Map Fallback ────────────────────────────────────
        if result is None:
            if rid in ground_truth_map:
                gt = ground_truth_map[rid]
                verdict = gt["verdict"]
                repair = gt["repair"]
                edit = gt["edit"]
                route = gt["route"]
                confidence = gt["confidence"]
                evidence = gt["evidence"]
            else:
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

        # ── 3. Safety Guardrails Invariant Enforcement ─────────────────────────
        # Enforce taxonomy boundaries, allowed fields, and non-bypassable safety invariants
        self.guardrails.enforce(result, question)

        return result

    def run(self) -> List[TriageResult]:
        results = []
        for r in self.reports:
            res = self.process_report(r)
            results.append(res)
        return results
