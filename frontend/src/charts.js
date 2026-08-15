import Chart from 'chart.js/auto';

let myRadarChart; 

export function drawRadarChart(canvasId, knn, bayes) {
    const canvasElement = document.getElementById(canvasId);
    if (!canvasElement) {
        console.error(`Canvas element with id "${canvasId}" not found.`);
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
            responsive: true, 
            maintainAspectRatio: false, 
            scales: {
                r: {
                    beginAtZero: true, 
                    max: 1,           
                    ticks: {
                        stepSize: 0.1 
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top', 
                },
                title: {
                    display: true,
                    text: 'مقایسه مدل‌های KNN و Bayes' 
                }
            }
        }
    });
}
