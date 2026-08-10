import joblib
from typing import cast
from sklearn.pipeline import Pipeline
from app.config import BAYES_MODEL_PATH, KNN_MODEL_PATH
from models.params.PredictBayesParams import PredictBayesParams
from models.params.PredictKnnParams import PredictKnnParams


def predict_knn(params: PredictKnnParams) -> str:
    model = cast(Pipeline, joblib.load(str(KNN_MODEL_PATH)))
    ml_params = params.to_model_params()

    severity = {
        0: "mild",
        1: "medium",
        2: "severe",
    }
    return severity[int(model.predict([ml_params.to_array()])[0])]


def predict_bayes(params: PredictBayesParams) -> str:
    model = cast(Pipeline, joblib.load(str(BAYES_MODEL_PATH)))
    ml_params = params.to_model_params()

    severity = {
        0: "mild",
        1: "medium",
        2: "severe",
    }
    return severity[int(model.predict([ml_params.to_array()])[0])]
