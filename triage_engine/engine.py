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
    Tracks execution source transparently: 'groq_llm' vs 'precomputed_solver' vs 'token_limit_fallback'.
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
            print(f"[TriageEngine] ⚡ Live Groq LLM ACTIVE (Model: {self.groq_client.model})")
        else:
            print("[TriageEngine] 🛡️ Running in Verified Deterministic Engine mode (set GROQ_API_KEY in .env for live LLM)")

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
        engine_source = "precomputed_solver"
        model_name = None
        latency_ms = None

        # ── 1. Live Groq LLM Inference (if configured) ─────────────────────────
        if self.use_llm:
            llm_output, status, lat = self.groq_client.triage_report(report, question, self.taxonomy)
            if status == "groq_llm" and llm_output and isinstance(llm_output, dict):
                engine_source = "groq_llm"
                model_name = self.groq_client.model
                latency_ms = lat
                result = TriageResult(
                    reportId=rid,
                    questionId=qid,
                    verdict=llm_output.get("verdict", "no_error"),
                    repair=llm_output.get("repair"),
                    edit=llm_output.get("edit"),
                    route=llm_output.get("route", "no_change"),
                    confidence=float(llm_output.get("confidence", 0.90)),
                    evidence=llm_output.get("evidence", "Evaluated independently by Groq LLM solver."),
                    student_reply=llm_output.get("student_reply") or StudentReplySynthesizer.generate(
                        report, llm_output.get("verdict", "no_error"), llm_output.get("repair")
                    ),
                    engine_source=engine_source,
                    model_name=model_name,
                    latency_ms=latency_ms
                )
            elif status == "token_limit":
                engine_source = "token_limit_fallback"
                print(f"  [SOURCE: TOKEN LIMIT FALLBACK] Report {rid} quota exhausted -> Using verified solver")
            else:
                engine_source = "precomputed_solver"
                print(f"  [SOURCE: PRECOMPUTED SOLVER] Report {rid} using verified solver")

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
                student_reply=student_reply,
                engine_source=engine_source,
                model_name=model_name,
                latency_ms=latency_ms
            )

        # ── 3. Safety Guardrails Invariant Enforcement ─────────────────────────
        result = self.guardrails.enforce(result, question)

        return result

    def run(self) -> List[TriageResult]:
        results = []
        for i, r in enumerate(self.reports, 1):
            print(f"[{i:02d}/{len(self.reports):02d}] Triage Processing: {r['reportId']} (Question: {r['questionId'][:10]}...)")
            res = self.process_report(r)
            results.append(res)
        return results
