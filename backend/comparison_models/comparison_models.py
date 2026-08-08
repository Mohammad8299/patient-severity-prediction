import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report
)
import joblib
import os
from pathlib import Path
import sys
from datetime import datetime

plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['Tahoma', 'DejaVu Sans', 'Arial']
plt.rcParams['axes.unicode_minus'] = False

def specificity_score(y_true, y_pred, average='macro'):
    cm = confusion_matrix(y_true, y_pred)
    n_classes = cm.shape[0]
    
    specificities = []
    for i in range(n_classes):
        tn = np.sum(cm) - np.sum(cm[i, :]) - np.sum(cm[:, i]) + cm[i, i]
        fp = np.sum(cm[:, i]) - cm[i, i]
        spec = tn / (tn + fp) if (tn + fp) > 0 else 0
        specificities.append(spec)
    
    if average == 'macro':
        return np.mean(specificities)
    elif average == 'weighted':
        class_counts = np.sum(cm, axis=1)
        weights = class_counts / np.sum(class_counts)
        return np.sum(np.array(specificities) * weights)
    else:
        return np.sum([cm[i, i] for i in range(n_classes)]) / np.sum(cm)

BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DIR = BASE_DIR / 'data' / 'processed'
MODEL_DIR = BASE_DIR / 'models'
RESULTS_DIR = BASE_DIR / 'comparison_models' / 'results'

os.makedirs(RESULTS_DIR, exist_ok=True)

models_found = []
if MODEL_DIR.exists():
    for pkl_file in MODEL_DIR.rglob('*.pkl'):
        file_name = pkl_file.name.lower()
        
        if 'knn' in file_name:
            models_found.append(('KNN', pkl_file))
        elif 'naive' in file_name or 'bayes' in file_name:
            models_found.append(('Naive Bayes', pkl_file))

data_file = PROCESSED_DIR / 'cleaned_hospital_data.xlsx'
df = pd.read_excel(data_file)

target_cols = ['Condition_Mild', 'Condition_Medium', 'Condition_Severe']

X = df.drop(columns=target_cols)
y = df[target_cols].idxmax(axis=1).map({
    'Condition_Mild': 0,
    'Condition_Medium': 1,
    'Condition_Severe': 2
})

results = []
models = {}

for name, path in models_found:
    try:
        model = joblib.load(path)
        models[name] = model
    except Exception as e:
        continue
    
    y_pred = model.predict(X)
    
    accuracy = accuracy_score(y, y_pred)
    
    precision_macro = precision_score(y, y_pred, average='macro')
    recall_macro = recall_score(y, y_pred, average='macro')
    f1_macro = f1_score(y, y_pred, average='macro')
    specificity_macro = specificity_score(y, y_pred, average='macro')
    
    precision_weighted = precision_score(y, y_pred, average='weighted')
    recall_weighted = recall_score(y, y_pred, average='weighted')
    f1_weighted = f1_score(y, y_pred, average='weighted')
    specificity_weighted = specificity_score(y, y_pred, average='weighted')
    
    cm = confusion_matrix(y, y_pred)
    report = classification_report(y, y_pred, output_dict=True)
    
    results.append({
        'Model': name,
        'Accuracy': accuracy,
        'Precision (Macro)': precision_macro,
        'Recall (Macro)': recall_macro,
        'F1-Score (Macro)': f1_macro,
        'Specificity (Macro)': specificity_macro,
        'Precision (Weighted)': precision_weighted,
        'Recall (Weighted)': recall_weighted,
        'F1-Score (Weighted)': f1_weighted,
        'Specificity (Weighted)': specificity_weighted,
        'Confusion Matrix': cm,
        'Classification Report': report
    })
    
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=['Mild (0)', 'Medium (1)', 'Severe (2)'],
                yticklabels=['Mild (0)', 'Medium (1)', 'Severe (2)'],
                annot_kws={'size': 16})
    plt.title(f'Confusion Matrix - {name}', fontsize=14, fontweight='bold')
    plt.xlabel('Predicted', fontsize=12)
    plt.ylabel('Actual', fontsize=12)
    plt.tight_layout()
    
    cm_image_path = RESULTS_DIR / f'confusion_matrix_{name.replace(" ", "_")}.png'
    plt.savefig(cm_image_path, dpi=300, bbox_inches='tight')
    plt.close()

if len(results) < 2:
    sys.exit(1)

results_df = pd.DataFrame(results)
display_cols = ['Model', 'Accuracy', 
                'Precision (Macro)', 'Recall (Macro)', 'F1-Score (Macro)', 'Specificity (Macro)',
                'Precision (Weighted)', 'Recall (Weighted)', 'F1-Score (Weighted)', 'Specificity (Weighted)']
results_display = results_df[display_cols].copy()
results_display = results_display.round(4)
results_display = results_display.sort_values('F1-Score (Weighted)', ascending=False)

results_table_path = RESULTS_DIR / 'model_comparison.csv'
results_display.to_csv(results_table_path, index=False)

fig, axes = plt.subplots(2, 5, figsize=(22, 10))
metrics = ['Accuracy', 
           'Precision (Macro)', 'Recall (Macro)', 'F1-Score (Macro)', 'Specificity (Macro)',
           'Precision (Weighted)', 'Recall (Weighted)', 'F1-Score (Weighted)', 'Specificity (Weighted)']
colors = ['#2E86AB', '#A23B72', '#F18F01']
model_names = results_display['Model'].tolist()

for idx, metric in enumerate(metrics):
    row = idx // 5
    col = idx % 5
    ax = axes[row, col]
    
    values = results_display[metric].values
    bars = ax.bar(model_names, values, color=colors[:len(values)], alpha=0.8, width=0.5)
    ax.set_ylim([0, 1.1])
    ax.set_title(metric, fontsize=13, fontweight='bold')
    ax.set_ylabel('Score', fontsize=11)
    ax.grid(axis='y', alpha=0.3)
    ax.set_xticklabels(model_names, rotation=0, fontsize=10)
    
    for bar, val in zip(bars, values):
        ax.text(bar.get_x() + bar.get_width()/2, val + 0.02, 
                f'{val:.4f}', ha='center', va='bottom', fontweight='bold', fontsize=10)

plt.suptitle('Comparison of KNN and Naive Bayes Models Performance for Patient Condition Prediction', 
             fontsize=16, fontweight='bold')
plt.tight_layout()

comparison_plot_path = RESULTS_DIR / 'model_comparison.png'
plt.savefig(comparison_plot_path, dpi=300, bbox_inches='tight')
plt.close()

for idx, row in results_df.iterrows():
    model_name = row['Model']
    report = row['Classification Report']

    classes = ['0', '1', '2']
    class_names = ['Mild', 'Medium', 'Severe']
    
    precision_list = []
    recall_list = []
    f1_list = []
    specificity_list = []
    
    cm = row['Confusion Matrix']
    for i, cls in enumerate(classes):
        if cls in report:
            precision_list.append(report[cls]['precision'])
            recall_list.append(report[cls]['recall'])
            f1_list.append(report[cls]['f1-score'])
            
            tn = np.sum(cm) - np.sum(cm[i, :]) - np.sum(cm[:, i]) + cm[i, i]
            fp = np.sum(cm[:, i]) - cm[i, i]
            spec = tn / (tn + fp) if (tn + fp) > 0 else 0
            specificity_list.append(spec)
    
    fig, ax = plt.subplots(figsize=(12, 6))
    x = np.arange(len(class_names))
    width = 0.2
    
    bars1 = ax.bar(x - 1.5*width, precision_list, width, label='Precision', color='#2E86AB', alpha=0.8)
    bars2 = ax.bar(x - 0.5*width, recall_list, width, label='Recall', color='#A23B72', alpha=0.8)
    bars3 = ax.bar(x + 0.5*width, f1_list, width, label='F1-Score', color='#F18F01', alpha=0.8)
    bars4 = ax.bar(x + 1.5*width, specificity_list, width, label='Specificity', color='#4CAF50', alpha=0.8)
    
    ax.set_xlabel('Classes', fontsize=12)
    ax.set_ylabel('Score', fontsize=12)
    ax.set_title(f'Performance per Class - {model_name}', fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(class_names, fontsize=11)
    ax.legend(fontsize=11)
    ax.set_ylim([0, 1.1])
    ax.grid(axis='y', alpha=0.3)
    
    for bars in [bars1, bars2, bars3, bars4]:
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2, height + 0.01,
                    f'{height:.3f}', ha='center', va='bottom', fontsize=8)
    
    plt.tight_layout()
    class_plot_path = RESULTS_DIR / f'class_performance_{model_name.replace(" ", "_")}.png'
    plt.savefig(class_plot_path, dpi=300, bbox_inches='tight')
    plt.close()

best_model = results_display.iloc[0]
second_model = results_display.iloc[1] if len(results_display) > 1 else None

diff_f1 = best_model['F1-Score (Weighted)'] - second_model['F1-Score (Weighted)'] if second_model is not None else 0
diff_acc = best_model['Accuracy'] - second_model['Accuracy'] if second_model is not None else 0
diff_precision = best_model['Precision (Weighted)'] - second_model['Precision (Weighted)'] if second_model is not None else 0
diff_recall = best_model['Recall (Weighted)'] - second_model['Recall (Weighted)'] if second_model is not None else 0
diff_specificity = best_model['Specificity (Weighted)'] - second_model['Specificity (Weighted)'] if second_model is not None else 0

report_path = RESULTS_DIR / 'final_report.txt'
with open(report_path, 'w', encoding='utf-8') as f:
    f.write("="*80 + "\n")
    f.write("FINAL REPORT: COMPARISON OF KNN AND NAIVE BAYES MODELS\n")
    f.write("="*80 + "\n\n")
    
    f.write(f"Execution Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    f.write(f"Total Records: {len(df)}\n")
    f.write(f"Total Features: {len(X.columns)}\n")
    f.write(f"Target Variable: Patient Condition\n")
    f.write(f"Class Distribution:\n")
    
    class_names = {0: 'Mild', 1: 'Medium', 2: 'Severe'}
    for cls in sorted(y.unique()):
        count = (y == cls).sum()
        percentage = (count / len(y)) * 100
        f.write(f"   - {class_names[cls]} ({cls}): {count} ({percentage:.1f}%)\n")
    
    f.write("\n" + "="*80 + "\n")
    f.write("MODEL RESULTS:\n")
    f.write("="*80 + "\n\n")
    f.write(results_display.to_string(index=False) + "\n\n")
    
    f.write("="*80 + "\n")
    f.write("EXPLANATION OF MACRO VS WEIGHTED AVERAGE:\n")
    f.write("="*80 + "\n\n")
    f.write("MACRO AVERAGE:\n")
    f.write("   - Calculated by averaging the metric for each class equally\n")
    f.write("   - Gives equal weight to all classes, regardless of sample count\n")
    f.write("   - Useful when all classes are equally important\n")
    f.write("   - If classes are imbalanced, this can be misleading\n\n")
    
    f.write("WEIGHTED AVERAGE:\n")
    f.write("   - Calculated by weighted average of the metric for each class\n")
    f.write("   - Weight of each class equals the number of samples in that class\n")
    f.write("   - Gives more weight to classes with more samples\n")
    f.write("   - More suitable for imbalanced data\n")
    f.write("   - Represents the actual performance of the model on the entire dataset\n\n")
    
    f.write("EXAMPLE:\n")
    f.write("   If Mild class has 100 samples and Severe class has 10 samples:\n")
    f.write("   - Macro: Both classes get equal weight (50%)\n")
    f.write("   - Weighted: Mild gets 90% weight, Severe gets 10% weight\n\n")
    
    f.write("="*80 + "\n")
    f.write("CONCLUSION:\n")
    f.write("="*80 + "\n\n")
    
    f.write(f"Best Model: {best_model['Model']}\n")
    f.write(f"   - Accuracy            : {best_model['Accuracy']:.4f}\n")
    f.write(f"   - Precision (Macro)   : {best_model['Precision (Macro)']:.4f}\n")
    f.write(f"   - Recall (Macro)      : {best_model['Recall (Macro)']:.4f}\n")
    f.write(f"   - F1-Score (Macro)    : {best_model['F1-Score (Macro)']:.4f}\n")
    f.write(f"   - Specificity (Macro) : {best_model['Specificity (Macro)']:.4f}\n")
    f.write(f"   - Precision (Weighted): {best_model['Precision (Weighted)']:.4f}\n")
    f.write(f"   - Recall (Weighted)   : {best_model['Recall (Weighted)']:.4f}\n")
    f.write(f"   - F1-Score (Weighted) : {best_model['F1-Score (Weighted)']:.4f}\n")
    f.write(f"   - Specificity (Weighted): {best_model['Specificity (Weighted)']:.4f}\n\n")
    
    if second_model is not None:
        f.write(f"Second Model: {second_model['Model']}\n")
        f.write(f"   - Accuracy            : {second_model['Accuracy']:.4f}\n")
        f.write(f"   - Precision (Macro)   : {second_model['Precision (Macro)']:.4f}\n")
        f.write(f"   - Recall (Macro)      : {second_model['Recall (Macro)']:.4f}\n")
        f.write(f"   - F1-Score (Macro)    : {second_model['F1-Score (Macro)']:.4f}\n")
        f.write(f"   - Specificity (Macro) : {second_model['Specificity (Macro)']:.4f}\n")
        f.write(f"   - Precision (Weighted): {second_model['Precision (Weighted)']:.4f}\n")
        f.write(f"   - Recall (Weighted)   : {second_model['Recall (Weighted)']:.4f}\n")
        f.write(f"   - F1-Score (Weighted) : {second_model['F1-Score (Weighted)']:.4f}\n")
        f.write(f"   - Specificity (Weighted): {second_model['Specificity (Weighted)']:.4f}\n\n")
        
        f.write(f"Performance Difference ({best_model['Model']} better):\n")
        f.write(f"   - F1-Score (Weighted) : +{diff_f1:.4f} ({diff_f1*100:.2f}%)\n")
        f.write(f"   - Accuracy            : +{diff_acc:.4f} ({diff_acc*100:.2f}%)\n")
        f.write(f"   - Precision (Weighted): +{diff_precision:.4f} ({diff_precision*100:.2f}%)\n")
        f.write(f"   - Recall (Weighted)   : +{diff_recall:.4f} ({diff_recall*100:.2f}%)\n")
        f.write(f"   - Specificity (Weighted): +{diff_specificity:.4f} ({diff_specificity*100:.2f}%)\n\n")
    
    f.write("ANALYSIS:\n")
    if best_model['Model'] == 'KNN':
        f.write("   KNN is more suitable for this data because:\n")
        f.write("   - Can detect complex non-linear patterns in patient features\n")
        f.write("   - The number of features is appropriate for KNN\n")
        f.write("   - No assumption about data distribution is required\n")
        f.write("   - Better at handling multi-class classification\n")
    else:
        f.write("   Naive Bayes is more suitable for this data because:\n")
        f.write("   - Feature independence assumption is approximately valid\n")
        f.write("   - High speed and robust to outliers\n")
        f.write("   - Good for categorical features\n")
        f.write("   - Handles multi-class classification well\n")
    
    f.write("\nFINAL RESULT:\n")
    if diff_f1 > 0.02:
        f.write(f"   {best_model['Model']} model is significantly better for Patient Condition prediction.\n")
    elif diff_f1 > 0.01:
        f.write(f"   {best_model['Model']} model is slightly better.\n")
    else:
        f.write(f"   Both models perform similarly, but {best_model['Model']} is marginally better.\n")
    
    f.write("\n" + "="*80 + "\n")
    f.write("Report successfully generated.\n")
    f.write("All results saved in 'comparison_models/results/' directory.\n")
    f.write("="*80 + "\n")