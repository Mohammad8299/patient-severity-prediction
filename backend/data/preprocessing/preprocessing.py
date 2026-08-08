import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from scipy import stats
from pathlib import Path

current_file_path = Path(__file__).resolve()
project_root = current_file_path.parent.parent

dataset_path = project_root / 'data_set' / 'Hospital_Patient_Condition_Dataset.xlsx'
processed_data_path = project_root / 'processed' / 'cleaned_hospital_data.xlsx'
processed_data_path.parent.mkdir(parents=True, exist_ok=True)

data_frame = pd.read_excel(str(dataset_path), sheet_name='Hospital_Data')

duplicates = data_frame.duplicated().sum()
if duplicates > 0:
    data_frame = data_frame.drop_duplicates()

numeric_cols = data_frame.select_dtypes(include=[np.number]).columns.tolist()
if 'PatientCondition' in numeric_cols:
    numeric_cols.remove('PatientCondition')

categorical_cols = data_frame.select_dtypes(include=['object']).columns.tolist()

outlier_info = {}
for col in numeric_cols:
    Q1 = data_frame[col].quantile(0.25)
    Q3 = data_frame[col].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    outliers = data_frame[(data_frame[col] < lower_bound) | (data_frame[col] > upper_bound)]
    outlier_count = len(outliers)
    outlier_info[col] = {
        'Q1': Q1,
        'Q3': Q3,
        'IQR': IQR,
        'lower_bound': lower_bound,
        'upper_bound': upper_bound,
        'outlier_count': outlier_count,
        'outlier_percentage': (outlier_count / len(data_frame)) * 100
    }

df_cleaned = data_frame.copy()
for col in numeric_cols:
    Q1 = df_cleaned[col].quantile(0.25)
    Q3 = df_cleaned[col].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    df_cleaned[col] = df_cleaned[col].clip(lower=lower_bound, upper=upper_bound)

for col in numeric_cols:
    if df_cleaned[col].isnull().sum() > 0:
        median_val = df_cleaned[col].median()
        df_cleaned[col].fillna(median_val, inplace=True)

for col in categorical_cols:
    if col != 'PatientCondition':
        if df_cleaned[col].isnull().sum() > 0:
            mode_val = df_cleaned[col].mode()[0]
            df_cleaned[col].fillna(mode_val, inplace=True)

if df_cleaned['PatientCondition'].isnull().sum() > 0:
    mode_val = df_cleaned['PatientCondition'].mode()[0]
    df_cleaned['PatientCondition'].fillna(mode_val, inplace=True)

class_mapping_df = pd.read_excel(str(dataset_path), sheet_name='Classes')

condition_mapping = dict(zip(class_mapping_df['Class'], class_mapping_df['PatientCondition']))

df_cleaned['PatientCondition_Encoded'] = df_cleaned['PatientCondition'].map(condition_mapping)

if df_cleaned['PatientCondition_Encoded'].isnull().sum() > 0:
    df_cleaned = df_cleaned.dropna(subset=['PatientCondition_Encoded'])

if 'PatientCondition' in df_cleaned.columns:
    df_cleaned = df_cleaned.drop(columns=['PatientCondition'])

df_cleaned['PatientCondition_Encoded'] = df_cleaned['PatientCondition_Encoded'].astype('category')

class_names = {
    0: 'Mild',
    1: 'Medium', 
    2: 'Severe'
}

one_hot_encoded = pd.get_dummies(df_cleaned['PatientCondition_Encoded'], prefix='Condition', dtype=int)

rename_dict = {}
for col in one_hot_encoded.columns:
    class_code = int(col.split('_')[1])
    new_name = f"Condition_{class_names[class_code]}"
    rename_dict[col] = new_name

one_hot_encoded = one_hot_encoded.rename(columns=rename_dict)

df_cleaned = df_cleaned.drop(columns=['PatientCondition_Encoded'])
df_cleaned = pd.concat([df_cleaned, one_hot_encoded], axis=1)

df_final = df_cleaned.copy()
df_final.to_excel(processed_data_path, index=False)