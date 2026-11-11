# PRODUCT.md — Product Thinking & Architecture Strategy

## 1. Who Loses the Most When a Question is Broken?

The student who suffers the most is **the diligent, high-performing aspirant taking a timed national mock test who solves the question correctly but gets penalized with negative marking ($-1$) due to a corrupted answer key or an unsound question.**

### The Real Damage:
1. **Psychological & Rank Collapse:** In JEE Advanced or NEET, a 5-mark delta (missing out on $+4$ and taking $-1$) can swing an All-India Rank by 1,500 to 4,000 positions. During peak mock season, this creates acute crisis and imposter syndrome for a 17-year-old student who doubts their own sound conceptual understanding.
2. **Cascading Confusion:** An incorrect stored answer trains thousands of other students on false physics, cementing misconceptions right before the exam.

### How Our Design Reflects That:
- **Urgency Scoring Prioritizes Negative-Marking Hazards:** A report spike on `answer_key` or `unsound` triggers an immediate **P1 Critical Blocker** badge in the console queue, jumping ahead of cosmetic typos.
- **Empathetic, Affirming Student Replies:** When the student is right, our system replies within minutes, explicitly validating their calculation and confirming that the answer key was corrected. Restoring student psychological confidence is as critical as fixing the database row.
- **Deduplicated Grouping:** Grouping multiple complaints on the same question provides faculty with immediate visibility into live mock test disruptions.

---

## 2. What We Would NEVER Let the AI Auto-Apply (And Why)

We strictly prohibit automated patching (`auto: false`) for the following repair classes:

1. **`diagram` (Missing or Distorted Figures):**
   *Why:* An LLM cannot draw, verify, or align geometric or schematic vector diagrams. Auto-injecting a synthetic figure without exact scale, labels, and axes risks introducing fresh mathematical ambiguities.
2. **`unsound` (Contradictory Premises / No Valid Option):**
   *Why:* If the physics of the question is fundamentally contradictory (e.g. R034), no simple text replacement can fix it. Auto-applying an answer key change merely trades one error for another. The question must be cancelled, awarded grace marks, or retired by senior faculty.
3. **`identical_options` (Duplicate Distractors):**
   *Why:* Creating a legitimate, mathematically plausible distractor requires pedagogical nuance so that the replacement option tests common student misconceptions without overlapping.
4. **`wrong_question` & `syllabus` (Mismatched Content & Out-of-Syllabus):**
   *Why:* Deciding whether an advanced topic belongs to the latest NTA JEE/NEET syllabus requires curriculum compliance sign-off.

---

## 3. The Week 1 North-Star Metric

> **Primary Metric: Time to Resolution for High-Impact Defects (TTR-60m)**
> *Percentage of verified P1/P2 defect reports resolved (either via auto-apply or faculty sign-off) within 60 minutes of the first student report.*

### Why This Metric?
Raw volume metrics (e.g. "reports processed per day") are vanity metrics. What actually prevents student harm is **exposure mitigation**: minimizing the time window during which a broken question remains live to subsequent test-takers.

- If an incorrect key is auto-corrected within 12 minutes of the first student report, 95% of test-takers who attempt that question later in the test window receive accurate scoring.
- We pair this with a **Zero-Rollback Safety Guard**: `< 0.1%` of auto-applied edits reverted or contested by faculty in Week 1.

---

## 4. One Idea Beyond This Brief: The "Pre-Flight Zero-Harm" Gatekeeper

Instead of waiting for stressed students to report broken questions during high-stakes tests, we propose **Continuous Proactive Ingestion Triage**.

### How It Works:
1. **Pre-Flight Solver Pass:** Every newly authored or digitized question runs through the triage solver engine *before* being published to the live test bank.
2. **Dual-Solve Verification:** Two independent LLM solver prompts with different temperature seeds solve the question from scratch.
   - If both agree with the author's answer: **Auto-Certified**.
   - If either solver disagrees or flags a MathML leak, blank option, or missing figure: **Quarantined to Faculty Queue before any student ever sees it**.
3. **Real Validation in our Test Data:**
   Our proactive scan (`scripts/scan_all_defects.py`) caught **4 stealth defects** (e.g., MathML `<mspace>` leaks in `68dea87d387eea3d0d95fbe3`, garbled entity subscripts in `68dea657387eea3d0d95f54a`, and a contradictory biology assertion in `695ede2a88d7701e561aa9d9`) that had **zero student reports**.
   A pre-flight gatekeeper turns triage from an ambulance at the bottom of the cliff into a fence at the top.

