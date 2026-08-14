import { CnnPrediction } from './api/prediction'
import './style.css'
import Chart from 'chart.js/auto'


const healthForm = document.getElementById('healthForm')
const connResultBox = document.getElementById('connResult')
const bayesResultBox = document.getElementById('bayesResult')
const postAnalysisArea = document.getElementById('postAnalysisArea')


function updateResultDisplay(element, status, text) {
    element.classList.remove('status-severe', 'status-medium', 'status-mild')
    element.innerHTML = `<span>${text}</span>`

    if (status === 'severe') {
        element.classList.add('status-severe')
    } else if (status === 'medium') {
        element.classList.add('status-medium')
    } else if (status === 'mild') {
        element.classList.add('status-mild')
    }
}

let myRadarChart; 

function drawRadarChart(knn, bayes) {
    const ctx = document.getElementById('radarChart').getContext('2d');
    
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
    e.preventDefault()

    postAnalysisArea.style.display = 'grid'

    connResultBox.innerHTML = 'در حال پردازش...'
    connResultBox.className = 'result-box'
    bayesResultBox.innerHTML = 'در حال پردازش...'
    bayesResultBox.className = 'result-box'

    const formData = {
        Age: parseFloat(document.getElementById('Age').value),
        Temperature: parseFloat(document.getElementById('Temperature').value),
        BloodPressure: parseFloat(document.getElementById('BloodPressure').value),
        HeartRate: parseFloat(document.getElementById('HeartRate').value),
        OxygenLevel: parseFloat(document.getElementById('OxygenLevel').value),
        SymptomCount: parseInt(document.getElementById('SymptomCount').value),
        DaysWithSymptoms: parseInt(document.getElementById('DaysWithSymptoms').value),
        PreviousDiseases: parseInt(document.getElementById('PreviousDiseases').value),
        MeditationCount: parseInt(document.getElementById('MeditationCount').value),
        TestScore: parseInt(document.getElementById('TestScore').value),
    }
    CnnPrediction
    
    try {
        const [connResponse, bayesResponse] = await Promise.allSettled([
            fetch('http://127.0.0.1:8000/predict/knn', {
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
                    "medication_count" : formData.MeditationCount, 
                    "test_score" : formData.TestScore, 
                }),
                
            }),
            fetch('http://127.0.0.1:8000/predict/bayes', {
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
                    "medication_count" : formData.MeditationCount, 
                    "test_score" : formData.TestScore, 
                }),
            }),
        ])

       

       
    

        let knnMetrics = null
        let bayesMetrics = null



        if (connResponse.status === 'fulfilled' && connResponse.value.ok) {
            const data = await connResponse.value.json()
            updateResultDisplay(connResultBox, data.status, data.message)
            if (data.metrics) {
                knnMetrics = data.metrics;
            } else {
                const scoreRes = await fetch('http://127.0.0.1:8000/scores/knn');
                knnMetrics = await scoreRes.json();
            }

        }
        if (bayesResponse.status === 'fulfilled' && bayesResponse.value.ok) {
            const data = await bayesResponse.value.json()
            updateResultDisplay(bayesResultBox, data.status, data.message)
            if (data.metrics) {
                bayesMetrics = data.metrics;
            } else {
                const scoreRes = await fetch('http://127.0.0.1:8000/scores/bayes');
                bayesMetrics = await scoreRes.json();
            }
        }
        
        if (knnMetrics && bayesMetrics) {
            drawRadarChart(knnMetrics, bayesMetrics)
        }
    } catch (error) {
        console.error('Error:', error)
        connResultBox.innerHTML = 'خطا در اتصال'
        bayesResultBox.innerHTML = 'خطا در اتصال'
    }
})

function simulateResult(element, status, text) {
    setTimeout(() => {
        updateResultDisplay(element, status, text)
    }, 1200)
}
