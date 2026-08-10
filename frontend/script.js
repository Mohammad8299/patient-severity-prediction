document.addEventListener('DOMContentLoaded', () => {
    const healthForm = document.getElementById('healthForm');
    const connResultBox = document.getElementById('connResult');
    const bayesResultBox = document.getElementById('bayesResult');
    const postAnalysisArea = document.getElementById('postAnalysisArea');

    function updateResultDisplay(element, status, text) {
        element.classList.remove('status-strong', 'status-medium', 'status-weak');
        element.innerHTML = `<span>${text}</span>`;

        if (status === 'strong') {
            element.classList.add('status-strong');
        } else if (status === 'medium') {
            element.classList.add('status-medium');
        } else if (status === 'weak') {
            element.classList.add('status-weak');
        }
    }


    healthForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // ۲. نمایش کل مجموعه (نتایج + راهنما) به صورت یکجا
        postAnalysisArea.style.display = 'grid';

        // ۳. نمایش حالت در حال پردازش (بسیار مهم: چون بخش نتایج تازه ظاهر شده است)
        connResultBox.innerHTML = "در حال پردازش...";
        connResultBox.className = "result-box"; 
        bayesResultBox.innerHTML = "در حال پردازش...";
        bayesResultBox.className = "result-box";
      
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
        };

        try {
            // شبیه‌سازی درخواست به API
            const [connResponse, bayesResponse] = await Promise.allSettled([
                fetch('/api/predict-cnn', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                }),
                fetch('/api/predict-bayes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                })
            ]);

            // مدیریت پاسخ CNN
            if (connResponse.status === 'fulfilled' && connResponse.value.ok) {
                const data = await connResponse.value.json();
                updateResultDisplay(connResultBox, data.status, data.message);
            } else {
                // در صورت نبود API واقعی، نتیجه شبیه‌سازی شده را نمایش می‌دهد
                simulateResult(connResultBox, 'strong', 'وضعیت: پایدار (CNN)');
            }

            // مدیریت پاسخ Bayes
            if (bayesResponse.status === 'fulfilled' && bayesResponse.value.ok) {
                const data = await bayesResponse.value.json();
                updateResultDisplay(bayesResultBox, data.status, data.message);
            } else {
                simulateResult(bayesResultBox, 'medium', 'وضعیت: نیاز به بررسی (Bayes)');
            }

        } catch (error) {
            console.erro("Error:", error);
            connResultBox.innerHTML = "خطا در اتصال";
            bayesResultBox.innerHTML = "خطا در اتصال";
        }
    });

    function simulateResult(element, status, text) {
        setTimeout(() => {
            updateResultDisplay(element, status, text);
        }, 1200);
    }
});
