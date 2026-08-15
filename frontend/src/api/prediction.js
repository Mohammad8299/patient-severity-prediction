const BASE_URL = 'http://127.0.0.1:8000';

export async function getKnnPrediction(formData) {
    const response = await fetch(`${BASE_URL}/predict/knn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    });
    if (!response.ok) throw new Error('KNN Prediction failed');
    return await response.json();
}

export async function getBayesPrediction(formData) {
    const response = await fetch(`${BASE_URL}/predict/bayes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    });
    if (!response.ok) throw new Error('Bayes Prediction failed');
    return await response.json();
}

export async function getKnnScores() {
    const response = await fetch(`${BASE_URL}/scores/knn`);
    if (!response.ok) throw new Error('Failed to fetch KNN scores');
    return await response.json();
}

export async function getBayesScores() {
    const response = await fetch(`${BASE_URL}/scores/bayes`);
    if (!response.ok) throw new Error('Failed to fetch Bayes scores');
    return await response.json();
}
