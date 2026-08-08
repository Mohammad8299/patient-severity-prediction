from pathlib import Path
ROOT_DIR = Path(__file__).parent.parent
MODEL_DIR = ROOT_DIR / "models"
KNN_MODEL_PATH = MODEL_DIR / 'knn_hospital_model.pkl'
BAYES_MODEL_PATH = MODEL_DIR / 'naive_bayes_hospital_model.pkl'
PROCESSED_DATA_DIR = ROOT_DIR / "data" / "processed"
Path.mkdir(MODEL_DIR, exist_ok=True)
