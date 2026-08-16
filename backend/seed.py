import random
from datetime import datetime, timedelta, timezone

from .database import ensure_indexes, get_database, verify_connection

EXAMS = [("cuet", "CUET"), ("ipmat", "IPMAT"), ("cat", "CAT")]
SUBJECTS = [
    ("quantitative-ability", "cuet", "Quantitative Ability"), ("logical-reasoning", "cuet", "Logical Reasoning"),
    ("verbal", "ipmat", "Verbal Ability"), ("data", "ipmat", "Data Interpretation"),
    ("english", "cuet", "English"), ("mathematics", "cat", "Mathematics"),
    ("general-knowledge", "cuet", "General Knowledge"), ("reading-comprehension", "cat", "Reading Comprehension"),
    ("analytical-reasoning", "cat", "Analytical Reasoning"), ("vocabulary", "ipmat", "Vocabulary"),
]
CHAPTER_NAMES = ["Foundations", "Core Concepts", "Advanced Practice"]


def seed() -> None:
    random.seed(42)
    verify_connection()
    db = get_database()
    for name in ["users", "exams", "subjects", "chapters", "questions", "quizzes", "events"]:
        db[name].delete_many({})
    users = [{"userId": f"user-{i:03}", "name": f"Student {i:02}", "email": f"student{i:02}@example.com"} for i in range(1, 51)]
    exams = [{"examId": key, "name": name} for key, name in EXAMS]
    subjects, chapters = [], []
    chapter_ids = {"quantitative-ability": ["arithmetic", "algebra", "advanced-quant"], "logical-reasoning": ["series", "analytical", "advanced-logic"], "verbal": ["grammar", "vocabulary", "reading"], "data": ["tables", "charts", "caselets"]}
    for index, (subject_id, exam_id, name) in enumerate(SUBJECTS):
        subjects.append({"subjectId": subject_id, "examId": exam_id, "name": name})
        for chapter_index, chapter_name in enumerate(CHAPTER_NAMES, 1):
            chapter_id = chapter_ids.get(subject_id, [f"chapter-{index + 1:02}-{number}" for number in range(1, 4)])[chapter_index - 1]
            chapters.append({"chapterId": chapter_id, "subjectId": subject_id, "examId": exam_id, "name": f"{name}: {chapter_name}"})
    questions = []
    for index in range(500):
        chapter = chapters[index % len(chapters)]
        left, right = index + 2, (index % 12) + 1
        answer = left + right
        options = [answer, answer + 1, answer - 1, answer + 2]
        random.shuffle(options)
        questions.append({"questionId": f"question-{index + 1:04}", "examId": chapter["examId"], "subjectId": chapter["subjectId"], "chapterId": chapter["chapterId"], "text": f"Practice question {index + 1}: What is {left} + {right}?", "options": [str(value) for value in options], "correctOption": options.index(answer), "difficulty": ["Easy", "Medium", "Hard"][index % 3], "explanation": f"{left} + {right} = {answer}."})
    db.users.insert_many(users); db.exams.insert_many(exams); db.subjects.insert_many(subjects); db.chapters.insert_many(chapters); db.questions.insert_many(questions)
    now = datetime.now(timezone.utc)
    quizzes, events = [], []
    for user_index, user in enumerate(users):
        chapter = chapters[user_index % len(chapters)]
        quiz_id = f"seed-quiz-{user_index + 1:03}"
        selected_questions = [q for q in questions if q["chapterId"] == chapter["chapterId"]][:10]
        quizzes.append({"quizId": quiz_id, "userId": user["userId"], "examId": chapter["examId"], "subjectId": chapter["subjectId"], "chapterId": chapter["chapterId"], "questionIds": [q["questionId"] for q in selected_questions], "status": "completed", "startedAt": now - timedelta(days=user_index % 10), "submittedAt": now})
        for position, question in enumerate(selected_questions, 1):
            shown = now - timedelta(seconds=(11 - position) * 25)
            duration = 8 + (position * 0.8) + (user_index % 7)
            correct = random.random() > (0.15 + user_index % 5 * 0.05)
            selected = question["correctOption"] if correct else (question["correctOption"] + 1) % 4
            events.append({"userId": user["userId"], "quizId": quiz_id, "questionId": question["questionId"], "examId": chapter["examId"], "subjectId": chapter["subjectId"], "chapterId": chapter["chapterId"], "questionShownTime": shown, "answerSubmittedTime": shown + timedelta(seconds=duration), "responseDuration": duration, "selectedOption": selected, "isCorrect": correct, "positionInQuiz": position})
    db.quizzes.insert_many(quizzes); db.events.insert_many(events)
    ensure_indexes()
    print(f"Seeded {len(users)} users, {len(exams)} exams, {len(subjects)} subjects, {len(chapters)} chapters, {len(questions)} questions, and {len(events)} events.")


if __name__ == "__main__":
    seed()
