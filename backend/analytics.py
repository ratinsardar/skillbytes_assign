from pymongo.database import Database


def learning_velocity(db: Database) -> list[dict]:
    pipeline = [
        {"$group": {"_id": "$userId", "accuracy": {"$avg": {"$cond": ["$isCorrect", 100, 0]}}, "avgResponseTime": {"$avg": "$responseDuration"}, "responseStdDev": {"$stdDevPop": "$responseDuration"}, "totalQuestions": {"$sum": 1}, "questionsCorrect": {"$sum": {"$cond": ["$isCorrect", 1, 0]}}}},
        {"$set": {"consistencyScore": {"$divide": [100, {"$add": [1, "$responseStdDev"]}]}, "responseTimeScore": {"$max": [0, {"$subtract": [100, {"$multiply": ["$avgResponseTime", 2]}]}]}}},
        {"$set": {"learningVelocityIndex": {"$add": [{"$multiply": ["$accuracy", 0.5]}, {"$multiply": ["$responseTimeScore", 0.3]}, {"$multiply": ["$consistencyScore", 0.2]}]}}},
        {"$lookup": {"from": "users", "localField": "_id", "foreignField": "userId", "as": "user"}},
        {"$set": {"userName": {"$ifNull": [{"$first": "$user.name"}, "$_id"]}}},
        {"$project": {"_id": 0, "userId": "$_id", "userName": 1, "accuracy": {"$round": ["$accuracy", 2]}, "avgResponseTime": {"$round": ["$avgResponseTime", 2]}, "consistencyScore": {"$round": ["$consistencyScore", 2]}, "learningVelocityIndex": {"$round": ["$learningVelocityIndex", 2]}, "totalQuestions": 1, "questionsCorrect": 1}},
        {"$sort": {"learningVelocityIndex": -1}},
    ]
    return list(db.events.aggregate(pipeline))


def fatigue_analysis(db: Database, user_id: str | None = None) -> list[dict]:
    pipeline = []
    if user_id:
        pipeline.append({"$match": {"userId": user_id}})
    pipeline += [
        {"$set": {"segment": {"$ceil": {"$divide": ["$positionInQuiz", 5]}}}},
        {"$group": {"_id": {"quizId": "$quizId", "userId": "$userId", "segment": "$segment"}, "accuracy": {"$avg": {"$cond": ["$isCorrect", 100, 0]}}, "avgResponseTime": {"$avg": "$responseDuration"}, "questions": {"$sum": 1}}},
        {"$sort": {"_id.quizId": 1, "_id.segment": 1}},
        {"$group": {"_id": {"quizId": "$_id.quizId", "userId": "$_id.userId"}, "segments": {"$push": {"segment": "$_id.segment", "questionRange": {"$concat": ["Q", {"$toString": {"$add": [{"$multiply": [{"$subtract": ["$_id.segment", 1]}, 5]}, 1]}}, "-", {"$toString": {"$multiply": ["$_id.segment", 5]}}]}, "accuracy": {"$round": ["$accuracy", 2]}, "avgResponseTime": {"$round": ["$avgResponseTime", 2]}, "questions": "$questions"}}}},
        {"$project": {"_id": 0, "quizId": "$_id.quizId", "userId": "$_id.userId", "segments": 1}},
    ]
    return list(db.events.aggregate(pipeline))


def question_difficulty(db: Database) -> list[dict]:
    pipeline = [
        {"$group": {"_id": "$questionId", "totalAttempts": {"$sum": 1}, "accuracyPercentage": {"$avg": {"$cond": ["$isCorrect", 100, 0]}}, "avgResponseTime": {"$avg": "$responseDuration"}}},
        {"$set": {"difficultyScore": {"$add": [{"$multiply": [{"$subtract": [100, "$accuracyPercentage"]}, 0.6]}, {"$multiply": [{"$min": [100, {"$multiply": [{"$divide": ["$avgResponseTime", 30]}, 100]}]}, 0.4]}]}}},
        {"$lookup": {"from": "questions", "localField": "_id", "foreignField": "questionId", "as": "question"}},
        {"$set": {"question": {"$first": "$question"}}},
        {"$project": {"_id": 0, "questionId": "$_id", "question": "$question.text", "difficulty": "$question.difficulty", "totalAttempts": 1, "accuracyPercentage": {"$round": ["$accuracyPercentage", 2]}, "avgResponseTime": {"$round": ["$avgResponseTime", 2]}, "difficultyScore": {"$round": ["$difficultyScore", 2]}}},
        {"$sort": {"difficultyScore": -1}},
    ]
    return list(db.events.aggregate(pipeline))
