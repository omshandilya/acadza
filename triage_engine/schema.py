from typing import Optional, Dict, Any, List
from dataclasses import dataclass, asdict

@dataclass
class Edit:
    field: str
    find: Optional[str] = None
    replace: Optional[str] = None

@dataclass
class TriageResult:
    reportId: str
    questionId: str
    verdict: str
    repair: Optional[str]
    edit: Optional[Dict[str, Any]]
    route: str  # "auto_apply" | "faculty_review" | "no_change"
    confidence: float
    evidence: str
    student_reply: str
    engine_source: str = "groq_llm"  # "groq_llm" | "precomputed_solver" | "token_limit_fallback"
    model_name: Optional[str] = None
    latency_ms: Optional[int] = None

    def to_dict(self) -> Dict[str, Any]:
        d = {
            "reportId": self.reportId,
            "questionId": self.questionId,
            "verdict": self.verdict,
            "repair": self.repair,
            "edit": self.edit,
            "route": self.route,
            "confidence": round(self.confidence, 2),
            "evidence": self.evidence,
            "student_reply": self.student_reply,
            "engine_source": self.engine_source
        }
        if self.model_name:
            d["model_name"] = self.model_name
        if self.latency_ms:
            d["latency_ms"] = self.latency_ms
        return d
