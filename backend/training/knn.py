import pandas as pd
import numpy as np
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from pathlib import Path
import joblib
import os

from app.config import KNN_MODEL_PATH

BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DIR = BASE_DIR / 'data'/'processed'
MODEL_DIR = BASE_DIR / 'models'

os.makedirs(MODEL_DIR, exist_ok=True)

data_file = PROCESSED_DIR / 'cleaned_hospital_data.xlsx'
df = pd.read_excel(data_file)

target_cols = ['Condition_Mild', 'Condition_Medium', 'Condition_Severe']

X = df.drop(columns=target_cols)
y = df[target_cols].idxmax(axis=1).map({
    'Condition_Mild': 0,
    'Condition_Medium': 1,
    'Condition_Severe': 2
})

k_range = range(1, 31)
k_scores = []
best_k = 5
best_score = 0

for k in k_range:
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('knn', KNeighborsClassifier(n_neighbors=k))
    ])
    
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scores = cross_val_score(pipeline, X, y, cv=cv, scoring='accuracy')
    mean_score = scores.mean()
    k_scores.append(mean_score)
    
    if mean_score > best_score:
        best_score = mean_score
        best_k = k

pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('knn', KNeighborsClassifier(n_neighbors=best_k))
])

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_val_score(pipeline, X, y, cv=cv, scoring='accuracy')

pipeline.fit(X, y)


joblib.dump(pipeline, KNN_MODEL_PATH)