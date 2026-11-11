import json
import re

def main():
    with open('data/questions.json', 'r', encoding='utf-8') as f:
        questions = json.load(f)
    with open('data/reports.json', 'r', encoding='utf-8') as f:
        reports = json.load(f)
    with open('data/taxonomy.json', 'r', encoding='utf-8') as f:
        taxonomy = json.load(f)

    q_map = {q['_id']: q for q in questions}

    with open('scripts/all_reports_detailed.txt', 'w', encoding='utf-8') as out:
        for i, r in enumerate(reports):
            qid = r['questionId']
            q = q_map.get(qid, {})
            qtype = q.get('questionType', 'unknown')
            content = q.get(qtype, {})
            out.write(f"================================================================================\n")
            out.write(f"REPORT [{i+1:02d}] ID: {r['reportId']} | QID: {qid} | Subject: {q.get('subject')} | Chapter: {q.get('chapter')}\n")
            out.write(f"Student: {r.get('studentId')} | Source: {r.get('source')} | ReportedAt: {r.get('reportedAt')}\n")
            out.write(f"Student Comment: {r.get('comment')}\n")
            out.write(f"Question Type: {qtype} | Stored Answer: {content.get('answer')}\n")
            out.write(f"QUESTION HTML:\n{content.get('question')}\n")
            out.write(f"SOLUTION HTML:\n{content.get('solution')}\n")
            out.write("\n")

    print("Wrote scripts/all_reports_detailed.txt successfully.")

if __name__ == '__main__':
    main()
