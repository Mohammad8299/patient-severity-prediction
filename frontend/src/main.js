import { drawRadarChart } from './charts.js';;
import './style.css';
import { 
    getKnnPrediction, 
    getBayesPrediction, 
    getKnnScores, 
    getBayesScores 
} from './api/prediction.js';

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
        if (status === 'severe') displayMessage = 'وضعیت: شدید';
        else if (status === 'medium') displayMessage = 'وضعیت: متوسط';
        else if (status === 'mild') displayMessage = 'وضعیت: خفیف';
        else displayMessage = 'نتیجه‌ای یافت نشد'; 
    }

    element.classList.remove('status-severe', 'status-medium', 'status-mild');

    element.innerHTML = `<span>${displayMessage}</span>`;

    if (status === 'severe') element.classList.add('status-severe');
    else if (status === 'medium') element.classList.add('status-medium');
    else if (status === 'mild') element.classList.add('status-mild');
    else element.classList.add('status-medium'); 
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

    try {
        const results = await Promise.allSettled([
            getKnnPrediction(formData), 
            getBayesPrediction(formData), 
            getKnnScores(), 
            getBayesScores()
        ]);

        if (results[0].status === 'fulfilled') {
            updateResultDisplay(connResultBox, results[0].value);
        } else {
            connResultBox.innerHTML = 'خطا در دریافت نتیجه KNN';
            console.error("KNN Prediction Error:", results[0].reason);
        }

        if (results[1].status === 'fulfilled') {
            updateResultDisplay(bayesResultBox, results[1].value);
        } else {
            bayesResultBox.innerHTML = 'خطای Bayes';
            console.error("Bayes Prediction Error:", results[1].reason);
        }

        if (results[2].status === 'fulfilled' && results[3].status === 'fulfilled') {
            drawRadarChart('radarChart', results[2].value, results[3].value);
        } else {
            console.error("Chart Data Unavailable. KNN Scores Status:", results[2].status, "Bayes Scores Status:", results[3].status);
        }

    } catch (err) {
        console.error("Critical Process Error:", err);
        connResultBox.innerHTML = 'خطای سیستمی';
        bayesResultBox.innerHTML = 'خطای سیستمی';
    }
});
