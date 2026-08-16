from functools import lru_cache

from pymongo import ASCENDING, DESCENDING, MongoClient

from .config import DATABASE_NAME, MONGODB_URI


@lru_cache
def get_client() -> MongoClient:
    return MongoClient(MONGODB_URI, serverSelectionTimeoutMS=3000, tz_aware=True)


def get_database():
    return get_client()[DATABASE_NAME]


def verify_connection() -> None:
    get_client().admin.command("ping")


def ensure_indexes() -> None:
    db = get_database()
    db.users.create_index("userId", unique=True)
    db.users.create_index("email", unique=True)
    db.exams.create_index("examId", unique=True)
    db.subjects.create_index([("examId", ASCENDING), ("subjectId", ASCENDING)], unique=True)
    db.chapters.create_index([("subjectId", ASCENDING), ("chapterId", ASCENDING)], unique=True)
    db.questions.create_index("questionId", unique=True)
    db.questions.create_index([("examId", ASCENDING), ("subjectId", ASCENDING), ("chapterId", ASCENDING), ("difficulty", ASCENDING)])
    db.quizzes.create_index("quizId", unique=True)
    db.quizzes.create_index([("userId", ASCENDING), ("startedAt", DESCENDING)])
    db.events.create_index([("quizId", ASCENDING), ("questionId", ASCENDING)], unique=True)
    db.events.create_index([("userId", ASCENDING), ("answerSubmittedTime", DESCENDING)])
    db.events.create_index([("questionId", ASCENDING), ("isCorrect", ASCENDING)])

