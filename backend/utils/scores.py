from typing import Any, Literal
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    balanced_accuracy_score,
    matthews_corrcoef,
    cohen_kappa_score,
    jaccard_score,
)


def get_model_scores(
    model: Any,
    X,
    Y,
    average: (
        Literal["micro", "macro", "samples", "weighted", "binary"] | None | None
    ) = None,
):
    predicted_Y = model.predict(X)

    return {
        "accuracy": accuracy_score(
            Y,
            predicted_Y,
        ),
        "precision": precision_score(Y, predicted_Y, zero_division=0, average=average),
        "recall": recall_score(Y, predicted_Y, zero_division=0, average=average),
        "f1": f1_score(Y, predicted_Y, zero_division=0, average=average),
        "balanced_accuracy": balanced_accuracy_score(
            Y,
            predicted_Y,
        ),
        "matthews_corrcoef": matthews_corrcoef(
            Y,
            predicted_Y,
        ),
        "cohen_kappa": cohen_kappa_score(
            Y,
            predicted_Y,
        ),
        "jaccard": jaccard_score(Y, predicted_Y, zero_division=0, average=average),
    }
