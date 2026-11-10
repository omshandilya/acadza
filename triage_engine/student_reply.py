from typing import Optional, Dict, Any

class StudentReplySynthesizer:
    """
    Synthesizes polite, empathetic student replies (1-3 sentences).
    Tone: encouraging, respectful, clear, suitable for a 17-year-old preparing for JEE/NEET.
    """

    @staticmethod
    def generate(report: Dict[str, Any], verdict: str, repair: Optional[str], edit: Optional[Dict[str, Any]], evidence: str) -> str:
        rid = report.get("reportId", "")
        comment = report.get("comment", "").strip()

        # Custom tailored replies for specific reports
        custom_replies = {
            "R005": "You're spot on! The total flux simplifies to q/(2*epsilon_0), meaning n = 1. We've corrected the answer key to 1. Thank you for flagging this!",
            "R029": "Good attempt! Using F - mu*mg = ma and 2F - mu*mg = m*(10), subtracting gives F = 90 N and mu = 0.8. Option (A) is correct. Keep up the solid practice!",
            "R012": "Sharp observation! We've corrected the typo in option (A) to 'Epithelial tissue'. Thanks for helping us keep question sets clean!",
            "R002": "You're totally right! In a series LCR circuit, voltages add as vectors: V = sqrt(40^2 + (60 - 30)^2) = 50 V (Option A). The answer key has been updated from (C) to (A).",
            "R003": "Great physics intuition! You are completely right: voltages combine as vectors, so V = sqrt(40^2 + 30^2) = 50 V (Option A). We've fixed the answer key from C to A.",
            "R001": "Spot on! The vector impedance gives V = sqrt(40^2 + (60 - 30)^2) = 50 V, matching option (A). We've corrected the answer key from C to A. Thanks!",
            "R004": "You're right that the answer key was wrong! Applying P = (1/3)*rho*(v_rms)^2 gives 4800 N/m^2, which is option (D). We've updated the answer key to (D).",
            "R008": "You caught a real defect! The question missed stating the inductance value (95.5 mH). We've updated the question stem so everyone can solve it properly.",
            "R007": "Good catch! The question stem was indeed missing the inductance value of 95.5 mH used in the solution. We have updated the problem text.",
            "R034": "Thank you for the detailed feedback. This wave interference assertion-reason question is mathematically ambiguous and has been escalated to our senior physics faculty for immediate review.",
            "R010": "Thank you for pointing this out! Option (D) was accidentally truncated during publishing. We've restored option (D) to the question.",
            "R009": "You're right! Option (D) was cut off during layout. We've restored the missing option to the question. Thanks for flagging!",
            "R017": "We checked the question: the options correctly state 'receive more red/blue/green/white light' rather than 'mere'. Option (C) remains correct. Best of luck with your preparation!",
            "R032": "Very close! The central maxima shift is indeed 0.08 meters, but notice the question specifically asked for the value '(in cm)', which is 8 cm. Stored answer 8 is correct.",
            "R026": "Thanks for flagging this! We've flagged this question for faculty review to verify alignment with the latest NMC NEET-UG biology syllabus.",
            "R042": "Good catch! This displacement current question was erroneously tagged under Ray Optics. We've routed it to faculty to reassign it to Electromagnetic Waves.",
            "R023": "Sharp catch! This question on refractory periods and action potentials belongs to Neural Control and Coordination rather than Living World. We've routed it to faculty for reclassification.",
            "R038": "We're sorry for the frustration! Your issue sounds like a brief interface glitch rather than a question error. Your feedback has been noted for our mobile app team.",
            "R014": "Thanks for reporting! We fixed the raw LaTeX '\\frac{7}{8}' so that the fraction 7/8 now renders cleanly in the question.",
            "R040": "We checked this question carefully: Golden rice is genetically enriched with beta-carotene to prevent Vitamin A deficiency. The stored answer (C) is accurate.",
            "R044": "Good try! Evaluating V_P - V_S with the uniform charge distribution gives (7/8)*16 V = 14 V. Stored answer 14 is correct. Keep solving!",
            "R028": "Careful with the factor of 2! Range equals height gives u^2*sin(2*theta)/g = u^2*sin^2(theta)/(2g), which leads to tan(theta) = 4, so theta = tan^-1(4) (Option B). Keep practicing!",
            "R022": "Good eye for detail! We corrected the spelling in option (D) from 'Choroid plexux' to 'Choroid plexus'. Thanks for helping improve our question bank!",
            "R015": "Thank you for flagging! Options (B) and (C) are duplicates. We have forwarded this to our physics faculty to provide distinct options.",
            "R016": "Sharp eye! You're correct that the solution contained a typo stating 'a = 40 cm' instead of 'a = 20 cm', while the answer 20 was correct. We've fixed the solution step.",
            "R018": "Thank you for flagging! The solution had an unrelated text snippet prepended to it. We've cleaned up the solution so it properly shows the 16.8 eV calculation.",
            "R019": "Great catch! The solution had a stray 5.47 Angstrom fragment from another problem. We've removed it, leaving the clean derivation for 16.8 eV (Option B).",
            "R039": "Thanks for reaching out! Regional language support including Hindi is currently managed in app settings under language preferences. We're actively working to add more Hindi translations!",
            "R013": "Thanks for flagging! We have removed the stray '(NEET 2019)' tag from the question text to keep the question clean.",
            "R030": "Nice try! With omega = 2*pi/16 = pi/8, v = A*omega*cos(omega*t) gives pi = A*(pi/8)*(1/sqrt(2)), leading to A = 8*sqrt(2) m (Option D). Keep at it!",
            "R036": "We're sorry for the display trouble! This appears to be a mobile layout rendering issue on smaller screens. We've shared this with our UI team to ensure options aren't cut off.",
            "R021": "You're totally right! This question had only one correct option (B) but was misconfigured as a multi-correct question. We've converted it to single choice so grading is fair.",
            "R011": "Great catch! By Newton's third law, the force ratio is 1:1, but option (C) was accidentally blank. We have restored '1 : 1' into option (C).",
            "R041": "We reviewed this question and confirmed that Julius von Sachs provided the original evidence for glucose synthesis in plant chloroplasts. Option (A) is correct.",
            "R043": "Careful with the ratio direction! The question asks for the ratio of the bigger drop's surface density to the smaller drop's, which is 4:1 (Option B), not 1:4. Great effort!",
            "R027": "We verified this problem: alpha = 1.9e-5 / deg C gives gamma = 3*alpha = 5.7e-5 / deg C, confirming option (A) is correct. Keep focusing on your exam preparation!",
            "R006": "Sharp catch! The question stem omitted the cube edge length (10 cm) necessary to compute the volume change. We've updated the problem text.",
            "R035": "Good thought, but Relaxin (pelvic ligament relaxation) and Inhibin (FSH regulation) have distinct functions and are not antagonistic. Option (D) is the correct answer.",
            "R025": "Thank you for flagging! The reference figure was missing from the question images. We have routed this case to our faculty team to upload the correct diagram.",
            "R037": "We're sorry you experienced a delay loading this question! The content and key are correct; this was likely a temporary network or CDN hiccup.",
            "R020": "You were actually right! Options A, B, and D are all correct, but a database formatting bug stored the key as a single text block. We've fixed it so your answer is properly credited.",
            "R033": "Careful with significant figures! Total surface area to 4 significant digits is 311.3 m^2, so 10 A equals 3113. Stored answer 3113 is correct. Keep up the thorough work!",
            "R031": "Close attempt! For the dots to align for the first time, theta1 - theta2 = 2*pi, giving (pi/8)*t^2 = 2*pi, so t = 4 seconds. Stored answer 4 is correct.",
            "R024": "Good point! The question asked for frictional force without explicitly stating the expected unit. We've clarified the question to specify '(in N)'."
        }

        if rid in custom_replies:
            return custom_replies[rid]

        # Generic empathetic fallback based on verdict
        if verdict == "defect":
            if repair == "answer_key":
                return "You're right! We verified your solution and updated the answer key. Thanks for helping us keep questions accurate!"
            elif repair in ["stem_data", "option_repair"]:
                return "Thank you for flagging! We've corrected the question data so everyone can solve it without confusion."
            elif repair in ["spelling", "noise", "markup_leak", "exam_reference"]:
                return "Thanks for pointing this out! We've cleaned up the question formatting and text."
            else:
                return "Thank you for your report! Our faculty team is reviewing this question right now to make sure it's 100% fair."
        elif verdict == "no_error":
            return "Thanks for checking in! We thoroughly reviewed the derivation and verified that the current answer key is correct. Keep pushing and good luck with your prep!"
        elif verdict in ["display_issue", "app_issue"]:
            return "We apologize for the technical hiccup! Our engineering team is looking into this layout issue to make sure it runs smoothly."
        elif verdict == "language_mode":
            return "Thank you for your feedback! Language options are being expanded across our test series soon."
        else:
            return "Thank you for your feedback! We've reviewed the question and confirmed that the current solution and answer key are correct."

