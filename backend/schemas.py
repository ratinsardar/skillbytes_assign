from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, model_validator


class QuizStartRequest(BaseModel):
    userId: str
    examId: str
    subjectId: str
    chapterId: str
    questionCount: int = Field(default=10, ge=1, le=50)
    difficulty: Literal["Easy", "Medium", "Hard"] | None = None


class AnswerSubmission(BaseModel):
    userId: str
    questionId: str
    selectedOption: int = Field(ge=0, le=3)
    positionInQuiz: int = Field(ge=1)
    questionShownTime: datetime
    answerSubmittedTime: datetime

    @model_validator(mode="after")
    def validate_times(self):
        if self.answerSubmittedTime < self.questionShownTime:
            raise ValueError("answerSubmittedTime must be after questionShownTime")
        return self


class QuizSubmitRequest(BaseModel):
    userId: str


class BatchAnswer(BaseModel):
    questionId: str
    selected: str | None = None
    duration: float = Field(default=0, ge=0)


class BatchSubmitRequest(BaseModel):
    userId: str
    answers: list[BatchAnswer]
