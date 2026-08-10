from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
MODEL_DIR = ROOT_DIR / "models"
MODEL_SCORES_DIR = MODEL_DIR / "scores"

KNN_MODEL_PATH = MODEL_DIR / "knn_hospital_model.pkl"
KNN_MODEL_SCORES_PATH = MODEL_SCORES_DIR / "knn_hospital_model_scores.json"

BAYES_MODEL_PATH = MODEL_DIR / "naive_bayes_hospital_model.pkl"
BAYES_MODEL_SCORES_PATH = MODEL_SCORES_DIR / "naive_bayes_hospital_model_scores.json"

PROCESSED_DATA_DIR = ROOT_DIR / "data" / "processed"

Path.mkdir(MODEL_DIR, exist_ok=True)
Path.mkdir(MODEL_SCORES_DIR, exist_ok=True)
