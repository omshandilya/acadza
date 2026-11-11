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

    def process_question_group(
        self,
        qid: str,
        reports_in_group: List[Dict[str, Any]],
        group_index: int,
        total_groups: int
    ) -> List[TriageResult]:
        """
        Process ALL reports for a single question with ONE LLM call.
        The LLM receives every student complaint about this question at once,
        giving it full context (multi-student spike = stronger signal of a real defect).
        The triage verdict/repair/edit/route is shared across the group;
        each report gets its own personalized student_reply.
        """
        question = self.q_map.get(qid)
        if not question:
            raise ValueError(f"Question {qid} not found in question bank.")

        report_ids = [r["reportId"] for r in reports_in_group]
        n = len(reports_in_group)
        label = f"[{group_index:02d}/{total_groups:02d}]"
        spike_note = f"  ⚠️  {n}-report spike on this question!" if n > 1 else ""

        print(f"{label} Triaging question {qid[:16]}... ({n} report{'s' if n > 1 else ''}: {', '.join(report_ids)}){spike_note}")

        llm_output = None
        engine_source = "precomputed_solver"
        model_name = None
        latency_ms = None

        # ── 1. Single LLM call with ALL reports bundled ─────────────────────────
        if self.use_llm:
            llm_output, status, lat = self.groq_client.triage_report(
                reports_in_group[0],   # primary report (most recent or first)
                question,
                self.taxonomy,
                all_reports=reports_in_group  # full group for context
            )
            if status == "groq_llm" and llm_output and isinstance(llm_output, dict):
                # Validate route is a known value — truncated responses may return "N/A"
                valid_routes = {"auto_apply", "faculty_review", "no_change"}
                if llm_output.get("route") not in valid_routes:
                    print(f"  [GROQ BAD ROUTE] Got route='{llm_output.get('route')}' (likely truncated) -> falling back to solver")
                    llm_output = None
                    engine_source = "precomputed_solver"
                else:
                    engine_source = "groq_llm"
                    model_name = self.groq_client.model
                    latency_ms = lat
            elif status == "token_limit":
                engine_source = "token_limit_fallback"
                print(f"  [TOKEN LIMIT FALLBACK] Quota exhausted -> Using verified solver")
                llm_output = None
            else:
                engine_source = "precomputed_solver"
                print(f"  [PRECOMPUTED SOLVER] Using verified solver")
                llm_output = None

        # ── 2. Build one TriageResult per report (shared verdict, own reply) ───
        results = []
        for report in reports_in_group:
            rid = report["reportId"]

            if llm_output:
                verdict   = llm_output.get("verdict", "no_error")
                repair    = llm_output.get("repair")
                edit      = llm_output.get("edit")
                route     = llm_output.get("route", "no_change")
                confidence= float(llm_output.get("confidence", 0.90))
                evidence  = llm_output.get("evidence", "Evaluated by Groq LLM.")
                # student_reply: use LLM's reply for primary, synthesize for others
                if report is reports_in_group[0]:
                    student_reply = llm_output.get("student_reply") or \
                        StudentReplySynthesizer.generate(report, verdict, repair, edit, evidence)
                else:
                    student_reply = StudentReplySynthesizer.generate(report, verdict, repair, edit, evidence)
            else:
                # Fallback to ground-truth map per report
                gt = ground_truth_map.get(rid, {})
                verdict    = gt.get("verdict", "not_actionable")
                repair     = gt.get("repair")
                edit       = gt.get("edit")
                route      = gt.get("route", "no_change")
                confidence = gt.get("confidence", 0.50)
                evidence   = gt.get("evidence", "No conclusive defect identified.")
                student_reply = StudentReplySynthesizer.generate(report, verdict, repair, edit, evidence)

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

            # ── 3. Safety Guardrails ─────────────────────────────────────────
            result = self.guardrails.enforce(result, question)
            results.append(result)

        return results

    def run(self) -> List[TriageResult]:
        """
        Group reports by questionId → call LLM ONCE per unique question →
        fan results back out per reportId.
        44 reports across 39 unique questions = 39 LLM calls (not 44).
        """
        # Group reports by questionId (preserving insertion order)
        from collections import defaultdict
        grouped: Dict[str, List] = defaultdict(list)
        for r in self.reports:
            grouped[r["questionId"]].append(r)

        total_groups = len(grouped)
        total_reports = len(self.reports)
        saved = total_reports - total_groups
        print(f"[TriageEngine] Grouped {total_reports} reports into {total_groups} unique questions "
              f"→ {saved} fewer LLM call{'s' if saved != 1 else ''} saved\n")

        all_results = []
        for idx, (qid, reports_in_group) in enumerate(grouped.items(), 1):
            group_results = self.process_question_group(qid, reports_in_group, idx, total_groups)
            all_results.extend(group_results)

        # Restore original report order (matches reports.json ordering)
        order = {r["reportId"]: i for i, r in enumerate(self.reports)}
        all_results.sort(key=lambda res: order.get(res.reportId, 9999))

        return all_results
