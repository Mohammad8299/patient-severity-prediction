import json
from fastapi import APIRouter, HTTPException
from app.requests.BayesPredictionRequest import BayesPredictionRequest

from app.config import BAYES_MODEL_SCORES_PATH, KNN_MODEL_SCORES_PATH
from models.params.PredictBayesParams import PredictBayesParams
from models.ml import predict_bayes, predict_knn
from models.params.PredictKnnParams import PredictKnnParams
from app.requests.KnnPredictionRequest import KnnPredictionRequest

router = APIRouter()


@router.post("/predict/knn")
def knn_prediction(data: KnnPredictionRequest) -> dict:
    result = predict_knn(
        PredictKnnParams(
            age=data.age,
            temperature=data.temperature,
            blood_pressure=data.blood_pressure,
            heart_rate=data.heart_rate,
            oxygen_level=data.oxygen_level,
            symptom_count=data.symptom_count,
            days_with_symptom=data.days_with_symptom,
            previous_diseases=data.previous_diseases,
            medication_count=data.medication_count,
            test_score=data.test_score,
        )
    )
    return {"data": {"severity": result}}


@router.post("/predict/bayes")
def bayes_prediction(data: BayesPredictionRequest) -> dict:
    result = predict_bayes(
        PredictBayesParams(
            age=data.age,
            temperature=data.temperature,
            blood_pressure=data.blood_pressure,
            heart_rate=data.heart_rate,
            oxygen_level=data.oxygen_level,
            symptom_count=data.symptom_count,
            days_with_symptom=data.days_with_symptom,
            previous_diseases=data.previous_diseases,
            medication_count=data.medication_count,
            test_score=data.test_score,
        )
    )
    return {"data": {"severity": result}}


@router.get("/scores/knn")
def get_knn_model_scores() -> dict:
    if not KNN_MODEL_SCORES_PATH.exists():
        raise HTTPException(404)

    with open(KNN_MODEL_SCORES_PATH) as file:
        scores = json.load(file)
    return scores


@router.get("/scores/bayes")
def get_bayes_model_scores() -> dict:
    if not BAYES_MODEL_SCORES_PATH.exists():
        raise HTTPException(404)

    with open(BAYES_MODEL_SCORES_PATH) as file:
        scores = json.load(file)
    return scores
