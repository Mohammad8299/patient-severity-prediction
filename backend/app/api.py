from fastapi import APIRouter

from app.requests.BayesPredictionRequest import BayesPredictionRequest
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
