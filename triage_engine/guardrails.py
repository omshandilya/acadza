import json
from typing import Dict, Any, List, Tuple
from triage_engine.schema import TriageResult

class GuardrailViolation(Exception):
    pass

class SafetyGuardrails:
    """
    Enforces strict safety boundaries and taxonomy invariants:
    1. Verdicts must exist in taxonomy.verdicts.
    2. Defects must map to taxonomy.repairs; non-defects must have repair=None.
    3. Edits may only touch fields explicitly permitted by taxonomy.repairs[repair]['fields'].
       - If field is not permitted, SOFT-CORRECT: reroute to faculty_review and clear the edit.
    4. If taxonomy.repairs[repair]['auto'] == False, route MUST be 'faculty_review'.
    5. If verdict != 'defect', route MUST be 'no_change' and edit MUST be None.
    6. Confidence must be between 0.0 and 1.0.
    7. Surgical edits must be verified against actual question data when provided.
    """

    def __init__(self, taxonomy: Dict[str, Any]):
        self.taxonomy = taxonomy
        self.valid_verdicts = set(taxonomy.get("verdicts", {}).keys())
        self.valid_repairs = taxonomy.get("repairs", {})

    def _soft_correct(self, result: TriageResult, field: str, repair: str, allowed_fields: list) -> TriageResult:
        """
        Soft correction: when LLM returns an edit field not in taxonomy's allowed list,
        reroute to faculty_review and clear the edit rather than crashing the batch.
        """
        print(
            f"  [GUARDRAIL SOFT] {result.reportId}: edit field '{field}' not in "
            f"allowed {allowed_fields} for repair '{repair}'. "
            f"Rerouting to faculty_review — human must verify."
        )
        d = result.__dict__.copy()
        d["route"] = "faculty_review"
        d["edit"] = None
        d["evidence"] = (d.get("evidence") or "") + (
            f" [Guardrail soft-correction: edit field '{field}' outside taxonomy scope "
            f"for '{repair}'; sent to faculty_review for human verification.]"
        )
        return result.__class__(**d)

    def validate(self, result: TriageResult, question: Dict[str, Any] = None) -> List[str]:
        """Return list of hard violation strings. Soft corrections are handled in enforce()."""
        violations = []

        # 1. Verdict check
        if result.verdict not in self.valid_verdicts:
            violations.append(f"Verdict '{result.verdict}' is not in closed taxonomy verdicts.")

        # 2. Defect vs non-defect invariants
        if result.verdict == "defect":
            if not result.repair:
                violations.append("Verdict is 'defect' but repair type is null.")
            elif result.repair not in self.valid_repairs:
                violations.append(f"Repair '{result.repair}' is not in closed taxonomy repairs.")
            else:
                repair_meta = self.valid_repairs[result.repair]
                allowed_fields = repair_meta.get("fields", [])
                is_auto = repair_meta.get("auto", False)

                # Check route safety (auto:false must go to faculty_review)
                if not is_auto and result.route != "faculty_review":
                    violations.append(
                        f"Repair '{result.repair}' has auto:false; route must be 'faculty_review', got '{result.route}'."
                    )

                # Check edit field scope — field-not-allowed is a SOFT violation handled in enforce()
                if result.edit:
                    field = result.edit.get("field")
                    if field in allowed_fields and question:
                        # Hard-check: surgical find string must exist in the actual question text
                        qtype = question.get("questionType", "")
                        content = question.get(qtype, {})
                        find_str = result.edit.get("find")
                        if field in content and find_str:
                            val = content[field]
                            if isinstance(val, str) and find_str not in val:
                                violations.append(
                                    f"Edit find string '{find_str[:40]}' not found in question field '{field}'."
                                )
        else:
            # Non-defect
            if result.repair is not None:
                violations.append(f"Non-defect verdict '{result.verdict}' cannot have repair '{result.repair}'.")
            if result.edit is not None:
                violations.append(f"Non-defect verdict '{result.verdict}' cannot have proposed edit.")
            if result.route != "no_change":
                violations.append(
                    f"Non-defect verdict '{result.verdict}' must have route 'no_change', got '{result.route}'."
                )

        # 3. Confidence range
        if not (0.0 <= result.confidence <= 1.0):
            violations.append(f"Confidence {result.confidence} out of range [0.0, 1.0].")

        # 4. Student reply sanity
        if not result.student_reply or len(result.student_reply.strip()) < 5:
            violations.append("Student reply is empty or too short.")

        return violations

    def enforce(self, result: TriageResult, question: Dict[str, Any] = None) -> TriageResult:
        """
        Apply soft corrections first (edit field scope), then validate hard invariants.
        Returns the (possibly corrected) TriageResult. Raises GuardrailViolation on hard failures.
        """
        # --- Soft correction pass ---
        if result.verdict == "defect" and result.repair and result.edit:
            repair_meta = self.valid_repairs.get(result.repair, {})
            allowed_fields = repair_meta.get("fields", [])
            field = result.edit.get("field")
            if allowed_fields is not None and field not in allowed_fields:
                result = self._soft_correct(result, field, result.repair, allowed_fields)

        # --- Hard validation pass on (possibly corrected) result ---
        violations = self.validate(result, question)
        if violations:
            raise GuardrailViolation(
                f"Guardrail check failed for report {result.reportId}: {'; '.join(violations)}"
            )
        return result

