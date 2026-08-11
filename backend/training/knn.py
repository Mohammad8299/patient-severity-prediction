import json
from numpy import ndarray
import pandas as pd
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
import joblib
from app.config import KNN_MODEL_PATH, KNN_MODEL_SCORES_PATH, PROCESSED_DATA_DIR
from utils.scores import get_model_scores

data_file = PROCESSED_DATA_DIR / "cleaned_hospital_data.xlsx"
df = pd.read_excel(data_file)

target_cols = ["Condition_Mild", "Condition_Medium", "Condition_Severe"]

X = df.drop(columns=target_cols)
y = (
    df[target_cols]
    .idxmax(axis=1)
    .map({"Condition_Mild": 0, "Condition_Medium": 1, "Condition_Severe": 2})
)

k_range = range(1, 31)
k_scores = []
best_k = 5
best_score = 0

for k in k_range:
    pipeline = Pipeline(
        [("scaler", StandardScaler()), ("knn", KNeighborsClassifier(n_neighbors=k))]
    )

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scores = cross_val_score(pipeline, X, y, cv=cv, scoring="accuracy")
    mean_score = scores.mean()
    k_scores.append(mean_score)

    if mean_score > best_score:
        best_score = mean_score
        best_k = k

pipeline = Pipeline(
    [("scaler", StandardScaler()), ("knn", KNeighborsClassifier(n_neighbors=best_k))]
)

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_val_score(pipeline, X, y, cv=cv, scoring="accuracy")

pipeline.fit(X, y)


joblib.dump(pipeline, KNN_MODEL_PATH)

scores = get_model_scores(pipeline, X, y,average="weighted")

with open(KNN_MODEL_SCORES_PATH, "w") as file:
    json.dump(scores, file, indent=4)
