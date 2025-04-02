document.getElementById("predictionForm").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const formData = new FormData(e.target);
    const payload = {};
    for (const [key, value] of formData.entries()) {
      payload[key] = parseFloat(value);
    }
  
    // Simulated "prediction result"
    const dummyResult = {
      quality: Math.random() * 10,
      freshness: Math.random() * 10,
      contamination_risk: Math.random() * 5
    };
  
    updateChart(dummyResult);
  });
  
  let chartInstance = null;
  
  function updateChart(data) {
    const ctx = document.getElementById("predictionChart").getContext("2d");
  
    if (chartInstance) chartInstance.destroy();
  
    chartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(data),
        datasets: [{
          label: "Prediction Output",
          data: Object.values(data),
          backgroundColor: [
            "rgba(75, 192, 192, 0.6)",
            "rgba(255, 205, 86, 0.6)",
            "rgba(255, 99, 132, 0.6)"
          ],
          borderColor: [
            "rgba(75, 192, 192, 1)",
            "rgba(255, 205, 86, 1)",
            "rgba(255, 99, 132, 1)"
          ],
          borderWidth: 1,
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  