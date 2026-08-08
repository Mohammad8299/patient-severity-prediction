import pandas as pd
import numpy as np
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.naive_bayes import GaussianNB
from sklearn.pipeline import Pipeline
from pathlib import Path
import joblib
import os

BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DIR = BASE_DIR / 'data' /'processed'
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

pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('nb', GaussianNB())
])

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_val_score(pipeline, X, y, cv=cv, scoring='accuracy')

pipeline.fit(X, y)

model_path = MODEL_DIR / 'naive_bayes_hospital_model.pkl'
joblib.dump(pipeline, model_path)