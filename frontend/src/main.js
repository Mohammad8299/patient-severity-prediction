import './style.css'

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

    try {
        const [connResponse, bayesResponse] = await Promise.allSettled([
            fetch('/api/predict-cnn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            }),
            fetch('/api/predict-bayes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            }),
        ])

        if (connResponse.status === 'fulfilled' && connResponse.value.ok) {
            const data = await connResponse.value.json()
            updateResultDisplay(connResultBox, data.status, data.message)
        } else {
            simulateResult(connResultBox, 'mild', 'وضعیت: پایدار (CNN)')
        }

        if (bayesResponse.status === 'fulfilled' && bayesResponse.value.ok) {
            const data = await bayesResponse.value.json()
            updateResultDisplay(bayesResultBox, data.status, data.message)
        } else {
            simulateResult(bayesResultBox, 'medium', 'وضعیت: نیاز به بررسی (Bayes)')
        }
    } catch (error) {
        console.erro('Error:', error)
        connResultBox.innerHTML = 'خطا در اتصال'
        bayesResultBox.innerHTML = 'خطا در اتصال'
    }
})

function simulateResult(element, status, text) {
    setTimeout(() => {
        updateResultDisplay(element, status, text)
    }, 1200)
}
