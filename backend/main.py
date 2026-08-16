from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pymongo.errors import DuplicateKeyError, PyMongoError

from .analytics import fatigue_analysis, learning_velocity, question_difficulty
from .config import CORS_ORIGINS
from .database import ensure_indexes, get_database, verify_connection
from .schemas import AnswerSubmission, BatchSubmitRequest, QuizStartRequest, QuizSubmitRequest


def public(document: dict | None) -> dict | None:
    if document is None:
        return None
    result = dict(document)
    result.pop("_id", None)
    return result


def db_or_503():
    try:
        verify_connection()
        return get_database()
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="MongoDB is unavailable. Start MongoDB and run the seed command.") from exc


@asynccontextmanager
async def lifespan(_: FastAPI):
    try:
        verify_connection()
        ensure_indexes()
    except PyMongoError:
        pass
    yield


app = FastAPI(title="Skillbytes Quiz API", version="2.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=CORS_ORIGINS, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.get("/")
def root():
    return {"message": "Skillbytes Quiz API", "docs": "/docs"}


@app.get("/api/health")
def health():
    db = db_or_503()
    return {"ok": True, "database": db.name}


@app.get("/api/users")
def users():
    db = db_or_503()
    return {"data": [public(item) for item in db.users.find({}, {"_id": 0}).sort("name", 1)]}


@app.get("/api/exams")
def exams():
    db = db_or_503()
    return {"data": [public(item) for item in db.exams.find({}, {"_id": 0}).sort("name", 1)]}


@app.get("/api/exams/{exam_id}/subjects")
def subjects(exam_id: str):
    db = db_or_503()
    if not db.exams.find_one({"examId": exam_id}):
        raise HTTPException(404, "Exam not found")
    return {"data": [public(item) for item in db.subjects.find({"examId": exam_id}, {"_id": 0}).sort("name", 1)]}


@app.get("/api/exams/{exam_id}/subjects/{subject_id}/chapters")
def chapters(exam_id: str, subject_id: str):
    db = db_or_503()
    if not db.subjects.find_one({"examId": exam_id, "subjectId": subject_id}):
        raise HTTPException(404, "Subject not found")
    return {"data": [public(item) for item in db.chapters.find({"examId": exam_id, "subjectId": subject_id}, {"_id": 0}).sort("name", 1)]}


@app.post("/api/quizzes/start", status_code=201)
def start_quiz(payload: QuizStartRequest):
    db = db_or_503()
    if not db.users.find_one({"userId": payload.userId}):
        raise HTTPException(404, "userId not found")
    if not db.exams.find_one({"examId": payload.examId}):
        raise HTTPException(404, "examId not found")
    if not db.subjects.find_one({"subjectId": payload.subjectId, "examId": payload.examId}):
        raise HTTPException(404, "subjectId not found for exam")
    if not db.chapters.find_one({"chapterId": payload.chapterId, "subjectId": payload.subjectId, "examId": payload.examId}):
        raise HTTPException(404, "chapterId not found for subject")
    query = {"examId": payload.examId, "subjectId": payload.subjectId, "chapterId": payload.chapterId}
    if payload.difficulty:
        query["difficulty"] = payload.difficulty
    questions = list(db.questions.aggregate([{"$match": query}, {"$sample": {"size": payload.questionCount}}, {"$project": {"_id": 0, "correctOption": 0, "explanation": 0}}]))
    if not questions:
        raise HTTPException(404, "No questions found for this selection")
    quiz_id = f"quiz-{uuid4().hex}"
    now = datetime.now(timezone.utc)
    db.quizzes.insert_one({"quizId": quiz_id, "userId": payload.userId, "examId": payload.examId, "subjectId": payload.subjectId, "chapterId": payload.chapterId, "questionIds": [q["questionId"] for q in questions], "status": "in_progress", "startedAt": now, "submittedAt": None})
    return {"data": {"quizId": quiz_id, "startedAt": now, "questions": questions, "count": len(questions)}}


@app.post("/api/quizzes/{quiz_id}/answers", status_code=201)
def submit_answer(quiz_id: str, payload: AnswerSubmission):
    db = db_or_503()
    quiz = db.quizzes.find_one({"quizId": quiz_id, "userId": payload.userId})
    if not quiz or quiz["status"] != "in_progress":
        raise HTTPException(404, "Active quiz not found")
    expected_position = db.events.count_documents({"quizId": quiz_id}) + 1
    if payload.positionInQuiz != expected_position:
        raise HTTPException(409, f"Expected question position {expected_position}")
    if payload.positionInQuiz > len(quiz["questionIds"]) or quiz["questionIds"][payload.positionInQuiz - 1] != payload.questionId:
        raise HTTPException(400, "Question does not match quiz order")
    question = db.questions.find_one({"questionId": payload.questionId})
    if not question:
        raise HTTPException(404, "Question not found")
    duration = max(0, (payload.answerSubmittedTime - payload.questionShownTime).total_seconds())
    event = {"userId": payload.userId, "quizId": quiz_id, "questionId": payload.questionId, "examId": quiz["examId"], "subjectId": quiz["subjectId"], "chapterId": quiz["chapterId"], "questionShownTime": payload.questionShownTime, "answerSubmittedTime": payload.answerSubmittedTime, "responseDuration": round(duration, 3), "selectedOption": payload.selectedOption, "isCorrect": payload.selectedOption == question["correctOption"], "positionInQuiz": payload.positionInQuiz}
    try:
        db.events.insert_one(event)
    except DuplicateKeyError as exc:
        raise HTTPException(409, "Answer already submitted") from exc
    return {"data": {"accepted": True, "positionInQuiz": payload.positionInQuiz}}


@app.post("/api/quizzes/{quiz_id}/submit")
def finish_quiz(quiz_id: str, payload: QuizSubmitRequest):
    db = db_or_503()
    quiz = db.quizzes.find_one({"quizId": quiz_id, "userId": payload.userId})
    if not quiz:
        raise HTTPException(404, "Quiz not found")
    events = list(db.events.find({"quizId": quiz_id}, {"_id": 0}).sort("positionInQuiz", 1))
    if not events:
        raise HTTPException(400, "Submit at least one answer")
    correct = sum(1 for event in events if event["isCorrect"])
    total = len(quiz["questionIds"])
    summary = {"total": total, "attempted": len(events), "correct": correct, "incorrect": len(events) - correct, "skipped": total - len(events), "accuracy": round(correct / len(events) * 100, 2)}
    questions = {q["questionId"]: q for q in db.questions.find({"questionId": {"$in": quiz["questionIds"]}}, {"_id": 0})}
    solutions = [{**questions[event["questionId"]], "selectedOption": event["selectedOption"], "isCorrect": event["isCorrect"], "responseDuration": event["responseDuration"]} for event in events]
    breakdown = {level: {"questions": 0, "correct": 0, "incorrect": 0, "skipped": 0} for level in ["Easy", "Medium", "Hard"]}
    for solution in solutions:
        bucket = breakdown[solution["difficulty"]]
        bucket["questions"] += 1
        bucket["correct" if solution["isCorrect"] else "incorrect"] += 1
    durations = [event["responseDuration"] for event in events]
    result = {"summary": summary, "difficultyBreakdown": breakdown, "avgResponseTime": round(sum(durations) / len(durations), 2), "totalTime": round(sum(durations), 2), "weakTopics": [{"topic": "Accuracy and pacing", "priority": "High", "reason": "Review incorrect responses and slower questions.", "action": "Study the solutions, then attempt another mixed quiz."}]}
    submitted = datetime.now(timezone.utc)
    db.quizzes.update_one({"quizId": quiz_id}, {"$set": {"status": "completed", "submittedAt": submitted, "summary": summary}})
    return {"data": {"quizId": quiz_id, "submittedAt": submitted, "summary": summary, "result": result, "questions": solutions}}


@app.post("/api/quizzes/{quiz_id}/batch-submit")
def batch_submit(quiz_id: str, payload: BatchSubmitRequest):
    db = db_or_503()
    quiz = db.quizzes.find_one({"quizId": quiz_id, "userId": payload.userId, "status": "in_progress"})
    if not quiz:
        raise HTTPException(404, "Active quiz not found")
    answer_map = {answer.questionId: answer for answer in payload.answers}
    now = datetime.now(timezone.utc)
    events = []
    for position, question_id in enumerate(quiz["questionIds"], 1):
        answer = answer_map.get(question_id)
        if not answer or answer.selected is None:
            continue
        question = db.questions.find_one({"questionId": question_id})
        if answer.selected not in question["options"]:
            raise HTTPException(400, f"Invalid option for {question_id}")
        selected_option = question["options"].index(answer.selected)
        duration = round(answer.duration, 3)
        events.append({"userId": payload.userId, "quizId": quiz_id, "questionId": question_id, "examId": quiz["examId"], "subjectId": quiz["subjectId"], "chapterId": quiz["chapterId"], "questionShownTime": now - timedelta(seconds=duration), "answerSubmittedTime": now, "responseDuration": duration, "selectedOption": selected_option, "isCorrect": selected_option == question["correctOption"], "positionInQuiz": position})
    if events:
        db.events.insert_many(events, ordered=True)
    return finish_quiz(quiz_id, QuizSubmitRequest(userId=payload.userId))


@app.get("/api/analytics/learning-velocity")
def lvi():
    data = learning_velocity(db_or_503())
    return {"data": data, "count": len(data)}


@app.get("/api/analytics/fatigue-analysis")
def fatigue(userId: str | None = Query(default=None)):
    data = fatigue_analysis(db_or_503(), userId)
    return {"data": data, "count": len(data)}


@app.get("/api/analytics/question-difficulty")
def difficulty():
    data = question_difficulty(db_or_503())
    return {"data": data, "count": len(data)}


@app.get("/api/analytics/comprehensive")
def comprehensive(userId: str | None = Query(default=None)):
    db = db_or_503()
    return {"learningVelocity": learning_velocity(db), "fatigueAnalysis": fatigue_analysis(db, userId), "questionDifficulty": question_difficulty(db)}
