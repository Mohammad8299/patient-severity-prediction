import { CnnPrediction } from './api/prediction';
import './style.css';
import Chart from 'chart.js/auto';

const healthForm = document.getElementById('healthForm');
const connResultBox = document.getElementById('connResult'); 
const bayesResultBox = document.getElementById('bayesResult'); 
const postAnalysisArea = document.getElementById('postAnalysisArea');

function updateResultDisplay(element, rawData) {
    if (!element) return;

    const data = rawData.data ?? rawData;

    const status = data.severity ?? data.status ?? 'medium';

    let displayMessage = data.message ?? data.prediction;
    
    if (!displayMessage) {
        if (status === 'severe') {
            displayMessage = 'وضعیت: شدید';
        } else if (status === 'medium') {
            displayMessage = 'وضعیت: متوسط';
        } else if (status === 'mild') {
            displayMessage = 'وضعیت: خفیف';
        } else {
            displayMessage = 'نتیجه‌ای دریافت نشد';
        }
    }

    element.classList.remove('status-severe', 'status-medium', 'status-mild');

    element.innerHTML = `<span>${displayMessage}</span>`;

    if (status === 'severe') {
        element.classList.add('status-severe');
    } else if (status === 'medium') {
        element.classList.add('status-medium');
    } else if (status === 'mild') {
        element.classList.add('status-mild');
    } else {
        element.classList.add('status-medium');
    }
}

let myRadarChart;

function drawRadarChart(knn, bayes) {
    const canvasElement = document.getElementById('radarChart');
    if (!canvasElement) return;
    const ctx = canvasElement.getContext('2d');

    if (myRadarChart) {
        myRadarChart.destroy();
    }

    myRadarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Accuracy', 'Precision', 'Recall', 'F1'],
            datasets: [{
                label: 'KNN',
                data: [knn.accuracy, knn.precision, knn.recall, knn.f1],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2
            }, {
                label: 'Bayes',
                data: [bayes.accuracy, bayes.precision, bayes.recall, bayes.f1],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                r: {
                    beginAtZero: true,
                    max: 1,
                    ticks: { stepSize: 0.2 }
                }
            }
        }
    });
}

healthForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    postAnalysisArea.style.display = 'block'; 

    connResultBox.innerHTML = 'در حال پردازش...';
    connResultBox.className = 'result-box'; 
    bayesResultBox.innerHTML = 'در حال پردازش...';
    bayesResultBox.className = 'result-box'; 

    const formData = {
        age: parseFloat(document.getElementById('Age').value),
        temperature: parseFloat(document.getElementById('Temperature').value),
        blood_pressure: parseFloat(document.getElementById('BloodPressure').value),
        heart_rate: parseFloat(document.getElementById('HeartRate').value),
        oxygen_level: parseFloat(document.getElementById('OxygenLevel').value),
        symptom_count: parseInt(document.getElementById('SymptomCount').value),
        days_with_symptom: parseInt(document.getElementById('DaysWithSymptoms').value),
        previous_diseases: parseInt(document.getElementById('PreviousDiseases').value),
        medication_count: parseInt(document.getElementById('MedicationCount').value), 
        test_score: parseInt(document.getElementById('TestScore').value),
    };

    const predictKnnRequest = fetch('http://127.0.0.1:8000/predict/knn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    });

    const predictBayesRequest = fetch('http://127.0.0.1:8000/predict/bayes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    });

    const getKnnScoresRequest = fetch('http://127.0.0.1:8000/scores/knn');
    const getBayesScoresRequest = fetch('http://127.0.0.1:8000/scores/bayes');

    try {
        const results = await Promise.allSettled([
            predictKnnRequest, 
            predictBayesRequest, 
            getKnnScoresRequest, 
            getBayesScoresRequest
        ]);

        if (results[0].status === 'fulfilled' && results[0].value.ok) {
            const resJson = await results[0].value.json();
            updateResultDisplay(connResultBox, resJson);
        } else {
            connResultBox.innerHTML = 'خطا در دریافت نتیجه KNN';
        }

        if (results[1].status === 'fulfilled' && results[1].value.ok) {
            const resJson = await results[1].value.json();
            updateResultDisplay(bayesResultBox, resJson);
        } else {
            bayesResultBox.innerHTML = 'خطا در دریافت نتیجه Bayes';
        }

        if (results[2].status === 'fulfilled' && results[2].value.ok && 
            results[3].status === 'fulfilled' && results[3].value.ok) {
            const knnMetrics = await results[2].value.json();
            const bayesMetrics = await results[3].value.json();
            drawRadarChart(knnMetrics, bayesMetrics);
        }

    } catch (err) {
        console.error("Error processing results:", err);
        connResultBox.innerHTML = 'خطای سیستمی';
        bayesResultBox.innerHTML = 'خطای سیستمی';
    }
});
