import { CnnPrediction } from './api/prediction';
import './style.css';
import Chart from 'chart.js/auto';

const healthForm = document.getElementById('healthForm');
const connResultBox = document.getElementById('connResult'); 
const bayesResultBox = document.getElementById('bayesResult'); 
const postAnalysisArea = document.getElementById('postAnalysisArea');

function updateResultDisplay(element, status, text) {
    if (!element) return; 
    element.classList.remove('status-severe', 'status-medium', 'status-mild');
    element.innerHTML = `<span>${text}</span>`;
    if (status === 'severe') {
        element.classList.add('status-severe');
    } else if (status === 'medium') {
        element.classList.add('status-medium');
    } else if (status === 'mild') {
        element.classList.add('status-mild');
    }
}

let myRadarChart;

function drawRadarChart(knn, bayes) {
    const canvasElement = document.getElementById('radarChart');
    if (!canvasElement) {
        console.error("Canvas element with ID 'radarChart' not found.");
        return;
    }
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
                    ticks: {
                        stepSize: 0.1,
                        precision: 2,
                        callback: function(value) { return value.toFixed(1); }
                    },
                    grid: {
                        circular: true
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            }
        }
    });
}

healthForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    postAnalysisArea.style.display = 'grid'; 

    connResultBox.innerHTML = 'در حال پردازش...';
    connResultBox.className = 'result-box'; 
    bayesResultBox.innerHTML = 'در حال پردازش...';
    bayesResultBox.className = 'result-box'; 
    
    const formData = {
        Age: parseFloat(document.getElementById('Age').value),
        Temperature: parseFloat(document.getElementById('Temperature').value),
        BloodPressure: parseFloat(document.getElementById('BloodPressure').value),
        HeartRate: parseFloat(document.getElementById('HeartRate').value),
        OxygenLevel: parseFloat(document.getElementById('OxygenLevel').value),
        SymptomCount: parseInt(document.getElementById('SymptomCount').value),
        DaysWithSymptoms: parseInt(document.getElementById('DaysWithSymptoms').value),
        PreviousDiseases: parseInt(document.getElementById('PreviousDiseases').value),
        MedicationCount: parseInt(document.getElementById('MedicationCount').value),
        TestScore: parseInt(document.getElementById('TestScore').value),
    }
    
    CnnPrediction
    const predictKnnRequest = fetch('http://127.0.0.1:8000/predict/knn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "age" : formData.Age, 
            "temperature" : formData.Temperature,
            "blood_pressure" : formData.BloodPressure,
            "heart_rate" : formData.HeartRate,
            "oxygen_level" : formData.OxygenLevel,
            "symptom_count" : formData.SymptomCount,
            "days_with_symptom" : formData.DaysWithSymptoms,
            "previous_diseases" : formData.PreviousDiseases, 
            "medication_count" : formData.MedicationCount, 
            "test_score" : formData.TestScore, 
        })
    });

    const predictBayesRequest = fetch('http://127.0.0.1:8000/predict/bayes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "age" : formData.Age, 
            "temperature" : formData.Temperature,
            "blood_pressure" : formData.BloodPressure,
            "heart_rate" : formData.HeartRate,
            "oxygen_level" : formData.OxygenLevel,
            "symptom_count" : formData.SymptomCount,
            "days_with_symptom" : formData.DaysWithSymptoms,
            "previous_diseases" : formData.PreviousDiseases, 
            "medication_count" : formData.MedicationCount, 
            "test_score" : formData.TestScore,
        })
    });

    const getKnnScoresRequest = fetch('http://127.0.0.1:8000/scores/knn');
    const getBayesScoresRequest = fetch('http://127.0.0.1:8000/scores/bayes');

    

    Promise.allSettled([predictKnnRequest, predictBayesRequest, getKnnScoresRequest, getBayesScoresRequest])
    .then(async (results) => {
        if (results[0].status === 'fulfilled' && results[0].value.ok) {
            const data = await results[0].value.json();
            updateResultDisplay(connResultBox, data.status, data.message);
        } else if (results[0].status === 'rejected') {
            console.error('KNN Prediction Request Failed:', results[0].reason);
            connResultBox.innerHTML = 'خطا در KNN';
        } else { 
             connResultBox.innerHTML = 'خطا در سرور KNN';
        }

        if (results[1].status === 'fulfilled' && results[1].value.ok) {
            const data = await results[1].value.json();
            updateResultDisplay(bayesResultBox, data.status, data.message);
        } else if (results[1].status === 'rejected') {
            console.error('Bayes Prediction Request Failed:', results[1].reason);
            bayesResultBox.innerHTML = 'خطا در Bayes';
        } else { 
            bayesResultBox.innerHTML = 'خطا در سرور Bayes';
        }

        if (results[2].status === 'fulfilled' && results[3].status === 'fulfilled' && results[2].value.ok && results[3].value.ok) {
            const knnMetrics = await results[2].value.json();
            const bayesMetrics = await results[3].value.json();
            drawRadarChart(knnMetrics, bayesMetrics);
        } else {
            console.error('Failed to fetch scores for radar chart.');
            if (results[2].status === 'rejected' || results[2].value.ok === false) {
                console.error('KNN Scores Fetch Error:', results[2].reason || results[2].value.statusText);
            }
             if (results[3].status === 'rejected' || results[3].value.ok === false) {
                console.error('Bayes Scores Fetch Error:', results[3].reason || results[3].value.statusText);
            }
        }
    })
    .catch(err => {
        console.error('An unexpected error occurred during batch requests:', err);
        connResultBox.innerHTML = 'خطای کلی';
        bayesResultBox.innerHTML = 'خطای کلی';
    });
});

