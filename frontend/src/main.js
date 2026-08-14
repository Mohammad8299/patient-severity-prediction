import { CnnPrediction } from './api/prediction'
import './style.css'
import Chart from 'chart.js/auto'


const healthForm = document.getElementById('healthForm')
const connResultBox = document.getElementById('connResult')
const bayesResultBox = document.getElementById('bayesResult')
const postAnalysisArea = document.getElementById('postAnalysisArea')

let radarChart = null

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

function drawRadarChart(knnMetrics, bayesMetrics) {
    const canvas = document.getElementById('radarChart')
    if (!canvas) return

    if (radarChart) radarChart.destroy() 

    radarChart = new Chart(canvas, {
        type: 'radar',
        data: {
            labels: ['Accuracy', 'Average', 'Recall', 'F1-Score'],
            datasets: [
                {
                    label: 'مدل KNN',
                    data: [
                        knnMetrics.accuracy,
                        knnMetrics.precision,
                        knnMetrics.recall,
                        knnMetrics.f1
                    ],
                    fill: true,
                    backgroundColor: 'rgba(254, 71, 38, 0.83)',
                    borderColor: '#2563eb',
                    pointBackgroundColor: '#2563eb',
                    borderWidth: 2
                },
                {
                    label: 'مدل Bayes',
                    data: [
                        bayesMetrics.accuracy,
                        bayesMetrics.precision,
                        bayesMetrics.recall,
                        bayesMetrics.f1
                    ],
                    fill: true,
                    backgroundColor: 'rgba(255, 146, 21, 0.78)',
                    borderColor: '#ef4444',
                    pointBackgroundColor: '#ef4444',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    min: 0,
                    max: 1,      
                    ticks: { stepSize: 0.2 }
                }
            }
        }
    })
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
            knnMetrics = data.metrics || data       
        } else {
            simulateResult(connResultBox, 'mild', 'وضعیت: خفیف(KNN)')
        }

        if (bayesResponse.status === 'fulfilled' && bayesResponse.value.ok) {
            const data = await bayesResponse.value.json()
            updateResultDisplay(bayesResultBox, data.status, data.message)
            bayesMetrics = data.metrics || data     
        } else {
            simulateResult(bayesResultBox, 'medium', 'وضعیت: متوسط(Bayes)')
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
