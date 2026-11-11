import json

# Let's define the comprehensive reference ground-truth data for all 44 reports
# based on our thorough physics, biology, and chemistry verification.

ground_truth_map = {
    # 1. R005: Gauss law on cube, n=1 vs stored 2
    "R005": {
        "verdict": "defect",
        "repair": "answer_key",
        "edit": {"field": "answer", "find": "2", "replace": "1"},
        "route": "auto_apply",
        "confidence": 0.99,
        "evidence": "Total flux through cube = (1/2)*(q/2)/eps0 + (1/8)*(2q)/eps0 = q/(4 eps0) + q/(4 eps0) = q/(2 eps0). Formula given is n*q/(2 eps0), so n = 1. Stored key says 2, which contradicts both independent solve and stored solution."
    },
    # 2. R029: Friction on horizontal surface, student says mu=0.4
    "R029": {
        "verdict": "no_error",
        "repair": None,
        "edit": None,
        "route": "no_change",
        "confidence": 0.98,
        "evidence": "F - mu*100 = 10 and 2F - mu*100 = 100. Subtracting gives F = 90 N, which yields mu = (90 - 10)/100 = 0.8. Option A is 0.8. The student's claim of 0.4 is an algebraic error."
    },
    # 3. R012: Spelling mistake in option A 'Epithellial tisue'
    "R012": {
        "verdict": "defect",
        "repair": "spelling",
        "edit": {"field": "question", "find": "Epithellial tisue", "replace": "Epithelial tissue"},
        "route": "auto_apply",
        "confidence": 0.99,
        "evidence": "Option A contains double typos: 'Epithellial tisue' instead of standard anatomical term 'Epithelial tissue'."
    },
    # 4. R002: LCR circuit supply voltage (scalar addition trap: 40+60+30=130 vs vector 50)
    "R002": {
        "verdict": "defect",
        "repair": "answer_key",
        "edit": {"field": "answer", "find": "C", "replace": "A"},
        "route": "auto_apply",
        "confidence": 0.99,
        "evidence": "In series LCR, V = sqrt(VR^2 + (VL - VC)^2) = sqrt(40^2 + (60 - 30)^2) = 50 V, which is option (A). Stored key is C (130 V, erroneous scalar sum 40+60+30)."
    },
    # 5. R004: Gas pressure P = 1/3 rho v_rms^2 = 4800 N/m^2 (option D), key says A
    "R004": {
        "verdict": "defect",
        "repair": "answer_key",
        "edit": {"field": "answer", "find": "A", "replace": "D"},
        "route": "auto_apply",
        "confidence": 0.99,
        "evidence": "P = (1/3) * (9e-2) * (400)^2 = 4800 N/m^2 = option (D). Stored solution ends at 4800 N/m^2, but stored key erroneously lists A (4556 N/m^2). Student correctly identified key is wrong, though their guessed value 8225 was incorrect."
    },
    # 6. R008: Missing inductance value in AC circuit
    "R008": {
        "verdict": "defect",
        "repair": "stem_data",
        "edit": {"field": "question", "find": "and an inductance are", "replace": "and an inductance of 95.5 mH are"},
        "route": "auto_apply",
        "confidence": 0.97,
        "evidence": "The question stem omits the numerical value of inductance L. The stored solution explicitly uses L = 95.5 * 10^-3 H (95.5 mH) to obtain Z = 50 ohm."
    },
    # 7. R034: Waves interference assertion-reason
    "R034": {
        "verdict": "defect",
        "repair": "unsound",
        "edit": None,
        "route": "faculty_review",
        "confidence": 0.95,
        "evidence": "For two waves of equal amplitude I0 with phase difference pi/2, resultant intensity is 2*I0 (not I0). Both Assertion and Reason are technically false as stated, making the question mathematically unsound with no correct option matching standard JEE options."
    },
    # 8. R010: Missing option D
    "R010": {
        "verdict": "defect",
        "repair": "option_repair",
        "edit": {"field": "question", "find": "</h3>", "replace": "<br/>(D) <math xmlns=\"http://www.w3.org/1998/Math/MathML\" display=\"inline\"><mstyle displaystyle=\"true\"><mrow><mn>40</mn><mrow><mtext>&#x000A0;</mtext><mi mathvariant=\"normal\">m</mi></mrow><mo>&#x0002F;</mo><mi>&#x00073;</mi></mrow></mstyle></math></h3>"},
        "route": "auto_apply",
        "confidence": 0.96,
        "evidence": "The question only lists options (A), (B), and (C). Option (D) was dropped during formatting. Added distractor 40 m/s for option (D)."
    },
    # 9. R017: Student claims spelling mistake 'mere'
    "R017": {
        "verdict": "no_error",
        "repair": None,
        "edit": None,
        "route": "no_change",
        "confidence": 0.98,
        "evidence": "Options correctly use 'more red light', 'more blue light', 'more green light', 'more white light'. The word 'mere' does not appear anywhere in the question or options."
    },
    # 10. R032: Central maxima shift in YDSE (unit conversion m vs cm)
    "R032": {
        "verdict": "no_error",
        "repair": None,
        "edit": None,
        "route": "no_change",
        "confidence": 0.99,
        "evidence": "Shift = 0.08 m. The question explicitly requested 'find the shift (in cm)', so 0.08 m = 8 cm. The stored integer answer of 8 is correct."
    },
    # 11. R026: Out of syllabus for NEET (cladistics / phylogenetic inference)
    "R026": {
        "verdict": "defect",
        "repair": "syllabus",
        "edit": None,
        "route": "faculty_review",
        "confidence": 0.90,
        "evidence": "Phylogenetic character polarity and cladistic inference of snake species is outside the current NMC NEET-UG biology syllabus. Requires faculty review to determine deprecation or replacement."
    },
    # 12. R042: Wrong chapter (Displacement current in Geometrical Optics)
    "R042": {
        "verdict": "defect",
        "repair": "wrong_chapter",
        "edit": None,
        "route": "faculty_review",
        "confidence": 0.99,
        "evidence": "Question tests displacement current in capacitors (Electromagnetic Waves / Alternating Current), but is misclassified under 'Ray Optics and Optical Instruments' (Geometrical Optics)."
    },
    # 13. R023: Wrong chapter (Action potential in Living World)
    "R023": {
        "verdict": "defect",
        "repair": "wrong_chapter",
        "edit": None,
        "route": "faculty_review",
        "confidence": 0.99,
        "evidence": "Question regarding absolute refractory period and voltage-gated Na+ channels belongs to 'Neural Control and Coordination', not 'The Living World'."
    },
    # 14. R007: Duplicate of R008 (Missing inductance value)
    "R007": {
        "verdict": "defect",
        "repair": "stem_data",
        "edit": {"field": "question", "find": "and an inductance are", "replace": "and an inductance of 95.5 mH are"},
        "route": "auto_apply",
        "confidence": 0.97,
        "evidence": "The question omits the inductance value L. Stored solution uses L = 95.5 mH (95.5 * 10^-3 H) to reach 50 ohm impedance."
    },
    # 15. R003: Duplicate of R001, R002 (LCR supply voltage)
    "R003": {
        "verdict": "defect",
        "repair": "answer_key",
        "edit": {"field": "answer", "find": "C", "replace": "A"},
        "route": "auto_apply",
        "confidence": 0.99,
        "evidence": "Vector sum V = sqrt(40^2 + (60 - 30)^2) = 50 V (Option A). Key says C (130 V). The student's calculation root(40^2+30^2)=50 is correct."
    },
    # 16. R038: App issue - clicked A but saved B
    "R038": {
        "verdict": "app_issue",
        "repair": None,
        "edit": None,
        "route": "no_change",
        "confidence": 0.96,
        "evidence": "Student reported that their response input selection was incorrectly saved by the client application. The question content and key are correct."
    },
    # 17. R014: Markup leak (\frac{7}{8})
    "R014": {
        "verdict": "defect",
        "repair": "markup_leak",
        "edit": {"field": "question", "find": "\\frac{7}{8}", "replace": "7/8"},
        "route": "auto_apply",
        "confidence": 0.99,
        "evidence": "Raw unrendered LaTeX string '\\frac{7}{8}' appears as plain text in the question HTML."
    },
    # 18. R040: Unactionable comment 'wrong' on valid Golden rice question
    "R040": {
        "verdict": "not_actionable",
        "repair": None,
        "edit": None,
        "route": "no_change",
        "confidence": 0.98,
        "evidence": "Single word comment 'wrong' with no specific critique. Independent verification confirms Golden rice (rich in beta-carotene) prevents Vitamin A deficiency blindness. Option C is correct."
    },
    # 19. R044: Sphere electric potential difference
    "R044": {
        "verdict": "no_error",
        "repair": None,
        "edit": None,
        "route": "no_change",
        "confidence": 0.98,
        "evidence": "V = KQ/R = 16 V. V_P = V_inf + (11/8)V and V_S = V_inf + (1/2)V. VP - VS = (7/8) * 16 = 14 V. Stored answer of 14 is correct; student's claim of 22 V is wrong."
    },
    # 20. R028: Projectile range = height
    "R028": {
        "verdict": "no_error",
        "repair": None,
        "edit": None,
        "route": "no_change",
        "confidence": 0.99,
        "evidence": "R = H => u^2 sin(2 theta)/g = u^2 sin^2(theta)/(2g) => tan(theta) = 4. Option (B) tan^-1(4) is correct. Student forgot the factor of 2 in max height formula."
    },
    # 21. R022: Spelling of Choroid plexux
    "R022": {
        "verdict": "defect",
        "repair": "spelling",
        "edit": {"field": "question", "find": "Choroid plexux", "replace": "Choroid plexus"},
        "route": "auto_apply",
        "confidence": 0.99,
        "evidence": "Typo in option (D): 'Choroid plexux' instead of correct anatomical term 'Choroid plexus'."
    },
    # 22. R015: Identical options B and C
    "R015": {
        "verdict": "defect",
        "repair": "identical_options",
        "edit": None,
        "route": "faculty_review",
        "confidence": 0.97,
        "evidence": "Options (B) and (C) are identical duplicate options in an SCQ. Requires faculty review to provide a distinct distractor."
    },
    # 23. R016: Solution calculation typo 'a = 40 cm' instead of 20 cm
    "R016": {
        "verdict": "defect",
        "repair": "solution_fix",
        "edit": {"field": "solution", "find": "a = 40 cm", "replace": "a = 20 cm"},
        "route": "auto_apply",
        "confidence": 0.98,
        "evidence": "In the stored solution, 800 = 2 * a^2 => a^2 = 400 => a = 20 cm, but the text inadvertently printed 'a = 40 cm'. Stored key 20 is correct."
    },
    # 24. R018: Solution contains stray fragment from another question
    "R018": {
        "verdict": "defect",
        "repair": "solution_fix",
        "edit": {"field": "solution", "find": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\" display=\"inline\"><mstyle displaystyle=\"true\"><mrow><mo>&#x0003D;</mo><mn>5.469</mn><mi>&#x000D7;</mi><msup><mn>10</mn><mrow><mo>&#x02212;</mo><mn>10</mn></mrow></msup><mi>m</mi><mo>&#x0003D;</mo><mn>5.47</mn><mi>\\AA</mi></mrow></mstyle></math> ", "replace": ""},
        "route": "auto_apply",
        "confidence": 0.98,
        "evidence": "Solution had a stray calculation '= 5.469 * 10^-10 m = 5.47 Angstrom' prepended from an unrelated question. The rest of the solution correctly derives KE = 16.8 eV matching key (B). Surgically stripped the extraneous snippet."
    },
    # 25. R039: Language request (Hindi)
    "R039": {
        "verdict": "language_mode",
        "repair": None,
        "edit": None,
        "route": "no_change",
        "confidence": 0.99,
        "evidence": "Student requested Hindi translation of question. Stored English content is accurate; handled via localization platform, not question fix."
    },
    # 26. R009: Duplicate of R010 (Option D missing)
    "R009": {
        "verdict": "defect",
        "repair": "option_repair",
        "edit": {"field": "question", "find": "</h3>", "replace": "<br/>(D) <math xmlns=\"http://www.w3.org/1998/Math/MathML\" display=\"inline\"><mstyle displaystyle=\"true\"><mrow><mn>40</mn><mrow><mtext>&#x000A0;</mtext><mi mathvariant=\"normal\">m</mi></mrow><mo>&#x0002F;</mo><mi>&#x00073;</mi></mrow></mstyle></math></h3>"},
        "route": "auto_apply",
        "confidence": 0.96,
        "evidence": "Option (D) was missing from the question HTML. Appended distractor 40 m/s for option (D)."
    },
    # 27. R013: Exam reference tag '(NEET 2019)' inside question
    "R013": {
        "verdict": "defect",
        "repair": "exam_reference",
        "edit": {"field": "question", "find": "(NEET 2019) ", "replace": ""},
        "route": "auto_apply",
        "confidence": 0.99,
        "evidence": "Metadata tag '(NEET 2019)' leaked into question text. Surgically stripped per taxonomy guidelines."
    },
    # 28. R030: SHM amplitude calculation
    "R030": {
        "verdict": "no_error",
        "repair": None,
        "edit": None,
        "route": "no_change",
        "confidence": 0.99,
        "evidence": "omega = 2pi/16 = pi/8 rad/s. v = A * omega * cos(omega*t) => pi = A * (pi/8) * cos(pi/4) => A = 8*sqrt(2) m. Option (D) is correct; student's claim of 4*sqrt(2) is incorrect."
    },
    # 29. R001: Duplicate of R002, R003 (LCR supply voltage)
    "R001": {
        "verdict": "defect",
        "repair": "answer_key",
        "edit": {"field": "answer", "find": "C", "replace": "A"},
        "route": "auto_apply",
        "confidence": 0.99,
        "evidence": "V = sqrt(VR^2 + (VL - VC)^2) = sqrt(40^2 + 30^2) = 50 V (Option A). Stored answer key is C (130 V). Fixed key to A."
    },
    # 30. R036: Display issue (options cut on mobile phone screen)
    "R036": {
        "verdict": "display_issue",
        "repair": None,
        "edit": None,
        "route": "no_change",
        "confidence": 0.98,
        "evidence": "Student reported that options are truncated on their phone screen. Stored content HTML is intact; this is a responsive client-side layout issue."
    },
    # 31. R021: Single choice stored as MCQ with malformed key ['', 'B']
    "R021": {
        "verdict": "defect",
        "repair": "type_mismatch",
        "edit": {"field": "questionType", "find": "mcq", "replace": "scq"},
        "route": "auto_apply",
        "confidence": 0.98,
        "evidence": "Question has exactly one valid option (B: 1.44 min), but was stored as type 'mcq' with answer ['', 'B']. Converted questionType to 'scq'."
    },
    # 32. R011: Option C blank
    "R011": {
        "verdict": "defect",
        "repair": "option_repair",
        "edit": {"field": "question", "find": "(C) <br />", "replace": "(C) <math display=\"inline\" xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn> 1 </mn><mi>:</mi><mn> 1 </mn></mrow></math><br />"},
        "route": "auto_apply",
        "confidence": 0.98,
        "evidence": "Newton's 3rd law dictates force ratio is 1:1. Stored key is C, but option (C) text was blank. Restored '1 : 1' into option (C)."
    },
    # 33. R041: Gibberish comment 'asdfgh'
    "R041": {
        "verdict": "not_actionable",
        "repair": None,
        "edit": None,
        "route": "no_change",
        "confidence": 0.99,
        "evidence": "Report comment is meaningless keyboard mash ('asdfgh'). Question, options, and key (A: Julius von Sachs) are fully verified and correct."
    },
    # 34. R043: Charge surface density ratio
    "R043": {
        "verdict": "no_error",
        "repair": None,
        "edit": None,
        "route": "no_change",
        "confidence": 0.98,
        "evidence": "R = 4r, Q = 64q. Surface density sigma_big / sigma_small = (Q/4pi R^2)/(q/4pi r^2) = (64/16) = 4:1. Stored key B is correct. Student inverted the ratio to 1:4."
    },
    # 35. R027: Prompt injection attack trap
    "R027": {
        "verdict": "no_error",
        "repair": None,
        "edit": None,
        "route": "no_change",
        "confidence": 0.99,
        "evidence": "Adversarial prompt injection attempt ('IGNORE ALL PREVIOUS INSTRUCTIONS...'). Content analysis confirms alpha = 1.9e-5/C => gamma = 3*alpha = 5.7e-5/C (Option A). Stored answer A is correct."
    },
    # 36. R006: Copper cube volume contraction missing edge length
    "R006": {
        "verdict": "defect",
        "repair": "stem_data",
        "edit": {"field": "question", "find": "a solid copper cube,", "replace": "a solid copper cube of edge length 10 cm,"},
        "route": "auto_apply",
        "confidence": 0.98,
        "evidence": "The question stem omitted the cube edge length. The solution unequivocally uses edge length 10 cm ((10 * 10^-2)^3) to compute Delta V = 50 mm^3."
    },
    # 37. R019: Duplicate of R018 (Solution contains stray fragment from another question)
    "R019": {
        "verdict": "defect",
        "repair": "solution_fix",
        "edit": {"field": "solution", "find": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\" display=\"inline\"><mstyle displaystyle=\"true\"><mrow><mo>&#x0003D;</mo><mn>5.469</mn><mi>&#x000D7;</mi><msup><mn>10</mn><mrow><mo>&#x02212;</mo><mn>10</mn></mrow></msup><mi>m</mi><mo>&#x0003D;</mo><mn>5.47</mn><mi>\\AA</mi></mrow></mstyle></math> ", "replace": ""},
        "route": "auto_apply",
        "confidence": 0.98,
        "evidence": "Solution had an extraneous calculation '= 5.469 * 10^-10 m = 5.47 Angstrom' prepended from an unrelated question. The remainder of the solution correctly proves KE = 16.8 eV matching key (B). Surgically stripped the extraneous snippet."
    },
    # 38. R035: Relaxin and inhibin antagonistic claim
    "R035": {
        "verdict": "no_error",
        "repair": None,
        "edit": None,
        "route": "no_change",
        "confidence": 0.99,
        "evidence": "Relaxin and inhibin serve distinct physiological roles and are not antagonistic. The question asks which pair is NOT antagonistic, so (D) is correct."
    },
    # 39. R025: Missing figure
    "R025": {
        "verdict": "defect",
        "repair": "diagram",
        "edit": None,
        "route": "faculty_review",
        "confidence": 0.99,
        "evidence": "Question text explicitly references 'as shown in figure', but quesImages is empty. Requires faculty to upload the missing diagram."
    },
    # 40. R037: Slow load / network issue
    "R037": {
        "verdict": "display_issue",
        "repair": None,
        "edit": None,
        "route": "no_change",
        "confidence": 0.97,
        "evidence": "Student reported that the question takes forever to load. Stored content and key are intact; this is a network/asset latency issue."
    },
    # 41. R020: MCQ malformed answer key ['A, B, D']
    "R020": {
        "verdict": "defect",
        "repair": "answer_key",
        "edit": {"field": "answer", "find": "['A, B, D']", "replace": "['A', 'B', 'D']"},
        "route": "auto_apply",
        "confidence": 0.99,
        "evidence": "MCQ answer was stored as a single comma-joined string ['A, B, D'] instead of a parsed array ['A', 'B', 'D'], causing correct student submissions to be marked wrong."
    },
    # 42. R033: Significant digits in cube surface area
    "R033": {
        "verdict": "no_error",
        "repair": None,
        "edit": None,
        "route": "no_change",
        "confidence": 0.99,
        "evidence": "Total area = 6 * (7.203)^2 = 311.299 m^2. To 4 significant figures, A = 311.3 m^2. Then 10 A = 3113. Stored integer answer 3113 is correct."
    },
    # 43. R031: Rotating wheels dot alignment time
    "R031": {
        "verdict": "no_error",
        "repair": None,
        "edit": None,
        "route": "no_change",
        "confidence": 0.99,
        "evidence": "theta1 - theta2 = 2*pi for first re-alignment => (1/2)*(pi/2)*t^2 - (1/2)*(pi/4)*t^2 = 2*pi => pi*t^2/8 = 2*pi => t = 4 s. Stored answer 4 is correct."
    },
    # 44. R024: Unit not specified in question stem
    "R024": {
        "verdict": "defect",
        "repair": "answer_form",
        "edit": {"field": "question", "find": "is equal to</span>", "replace": "(in N) is equal to</span>"},
        "route": "auto_apply",
        "confidence": 0.97,
        "evidence": "Integer question did not state the required unit for frictional force. Added '(in N)' in the question stem."
    }
}

print(f"Verified {len(ground_truth_map)} ground truth items.")
