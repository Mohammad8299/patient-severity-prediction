import pandas as pd
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.naive_bayes import GaussianNB
from sklearn.pipeline import Pipeline
import joblib
from backend.app.config import BAYES_MODEL_PATH, PROCESSED_DATA_DIR

data_file = PROCESSED_DATA_DIR/ 'cleaned_hospital_data.xlsx'
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

joblib.dump(pipeline, BAYES_MODEL_PATH)