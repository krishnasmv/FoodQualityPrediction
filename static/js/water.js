document.addEventListener('DOMContentLoaded', function() {
    const predictionForm = document.getElementById('predictionForm');
    const viewMoreBtn = document.getElementById('view-more-btn');
    const viewMoreContainer = document.getElementById('view-more-container');
    
    // Add animation to form elements
    const formElements = document.querySelectorAll('.form-control, .form-select, .btn-primary');
    formElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100 + (index * 50));
    });
    
    // View More button click handler
    viewMoreBtn.addEventListener('click', function() {
        const visSection = document.getElementById('visualization-section');
        
        // Show visualization section with animation
        visSection.style.display = 'block';
        visSection.style.opacity = '0';
        visSection.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            visSection.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            visSection.style.opacity = '1';
            visSection.style.transform = 'translateY(0)';
            
            // Force Plotly to redraw charts after the section is visible
            window.dispatchEvent(new Event('resize'));
            
            // Scroll to visualization section
            visSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Add a second resize event after scrolling completes
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 500);
        }, 100);
    });
    
    predictionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        try {
            // Get prediction
            const predResponse = await fetch('/api/predict_water', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const predResult = await predResponse.json();
            
            // Update prediction result
            const resultDiv = document.getElementById('result');
            const output = document.getElementById('predictionOutput');
            
            resultDiv.style.display = 'block';
            
            if (predResult.status === 'success') {
                // Set appropriate alert color based on prediction
                let alertClass = 'alert-success';
                let qualityClass = 'quality-high';
                
                if (predResult.prediction === 0) {
                    alertClass = 'alert-danger';
                    qualityClass = 'quality-low';
                    predResult.prediction = 'Not Potable';
                } else {
                    predResult.prediction = 'Potable';
                }
                
                output.className = `alert ${alertClass}`;
                output.innerHTML = `Predicted Quality: <span class="${qualityClass}">${predResult.prediction}</span> (Confidence: ${(predResult.confidence * 100).toFixed(2)}%)`;
                
                // Store the form data for later use
                window.waterData = data;
                
                // Create custom visualizations
                createVisualizations(data);
                
                // Show the View More button
                viewMoreContainer.style.display = 'block';
                viewMoreContainer.style.opacity = '0';
                viewMoreContainer.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    viewMoreContainer.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    viewMoreContainer.style.opacity = '1';
                    viewMoreContainer.style.transform = 'translateY(0)';
                }, 300);
                
            } else {
                output.className = 'alert alert-danger';
                output.textContent = `Error: ${predResult.message}`;
            }
            
        } catch (error) {
            console.error('Error:', error);
            const resultDiv = document.getElementById('result');
            const output = document.getElementById('predictionOutput');
            
            resultDiv.style.display = 'block';
            output.className = 'alert alert-danger';
            output.textContent = `Error: An unexpected error occurred. Please try again.`;
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search me-2" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg> Predict Potability';
        }
    });
});

// Function to create all visualizations
function createVisualizations(data) {
    // Create gauge charts
    createGaugeCharts(data);
    
    // Create radar chart
    createRadarChart(data);
    
    // Create comparison chart
    createComparisonChart(data);
    
    // Generate recommendations
    generateRecommendations(data);
}

// Function to create gauge charts
function createGaugeCharts(data) {
    // pH Gauge
    const phValue = parseFloat(data.ph);
    const phGauge = {
        type: 'indicator',
        mode: 'gauge+number',
        value: phValue,
        title: { text: 'pH Level', font: { size: 24 } },
        gauge: {
            axis: { range: [0, 14], tickwidth: 1, tickcolor: "darkblue" },
            bar: { color: "#3498db" },
            bgcolor: "white",
            borderwidth: 2,
            bordercolor: "gray",
            steps: [
                { range: [0, 6.5], color: "#e74c3c" },
                { range: [6.5, 8.5], color: "#2ecc71" },
                { range: [8.5, 14], color: "#e67e22" }
            ],
            threshold: {
                line: { color: "red", width: 4 },
                thickness: 0.75,
                value: phValue
            }
        }
    };
    
    // Turbidity Gauge
    const turbidityValue = parseFloat(data.turbidity);
    const turbidityGauge = {
        type: 'indicator',
        mode: 'gauge+number',
        value: turbidityValue,
        title: { text: 'Turbidity (NTU)', font: { size: 24 } },
        gauge: {
            axis: { range: [0, 10], tickwidth: 1, tickcolor: "darkblue" },
            bar: { color: "#e74c3c" },
            bgcolor: "white",
            borderwidth: 2,
            bordercolor: "gray",
            steps: [
                { range: [0, 1], color: "#2ecc71" },
                { range: [1, 5], color: "#f39c12" },
                { range: [5, 10], color: "#e74c3c" }
            ],
            threshold: {
                line: { color: "red", width: 4 },
                thickness: 0.75,
                value: turbidityValue
            }
        }
    };
    
    // Solids Gauge
    const solidsValue = parseFloat(data.solids);
    const solidsGauge = {
        type: 'indicator',
        mode: 'gauge+number',
        value: solidsValue,
        title: { text: 'Solids (ppm)', font: { size: 24 } },
        gauge: {
            axis: { range: [0, 60000], tickwidth: 1, tickcolor: "darkblue" },
            bar: { color: "#9b59b6" },
            bgcolor: "white",
            borderwidth: 2,
            bordercolor: "gray",
            steps: [
                { range: [0, 500], color: "#2ecc71" },
                { range: [500, 1500], color: "#f39c12" },
                { range: [1500, 60000], color: "#e74c3c" }
            ],
            threshold: {
                line: { color: "red", width: 4 },
                thickness: 0.75,
                value: solidsValue
            }
        }
    };
    
    // Create layout with proper sizing and margins
    const gaugeLayout = {
        autosize: true,
        height: 300,
        margin: { t: 60, r: 30, l: 30, b: 30 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { color: "#2c3e50", family: "Roboto" }
    };
    
    // Render the gauges with responsive config
    const config = {
        responsive: true,
        displayModeBar: false // Hide the modebar for cleaner look
    };
    
    Plotly.newPlot('ph-gauge', [phGauge], gaugeLayout, config);
    Plotly.newPlot('turbidity-gauge', [turbidityGauge], gaugeLayout, config);
    Plotly.newPlot('solids-gauge', [solidsGauge], gaugeLayout, config);
    
    // Force a window resize event to make sure Plotly adjusts the charts
    window.dispatchEvent(new Event('resize'));
}

// Function to create radar chart
function createRadarChart(data) {
    const radarData = [{
        type: 'scatterpolar',
        r: [
            parseFloat(data.ph) / 14 * 100,
            parseFloat(data.hardness) / 500 * 100,
            parseFloat(data.solids) / 60000 * 100,
            parseFloat(data.chloramines) / 15 * 100,
            parseFloat(data.sulfate) / 500 * 100,
            parseFloat(data.conductivity) / 1000 * 100,
            parseFloat(data.organic_carbon) / 30 * 100,
            parseFloat(data.trihalomethanes) / 150 * 100,
            (10 - parseFloat(data.turbidity)) / 10 * 100 // Inverted so lower is better
        ],
        theta: ['pH', 'Hardness', 'Solids', 'Chloramines', 'Sulfate', 'Conductivity', 'Organic Carbon', 'Trihalomethanes', 'Clarity'],
        fill: 'toself',
        name: 'Water Quality Factors',
        line: {
            color: '#3498db'
        },
        fillcolor: 'rgba(52, 152, 219, 0.5)'
    }];
    
    const radarLayout = {
        autosize: true,
        height: 400,
        polar: {
            radialaxis: {
                visible: true,
                range: [0, 100]
            }
        },
        title: 'Water Quality Factors',
        showlegend: false,
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { color: "#2c3e50", family: "Roboto" }
    };
    
    const config = {
        responsive: true,
        displayModeBar: false
    };
    
    Plotly.newPlot('radar-chart', radarData, radarLayout, config);
}

// Function to create comparison chart
function createComparisonChart(data) {
    const comparisonData = [
        {
            x: ['pH', 'Turbidity', 'Hardness'],
            y: [parseFloat(data.ph), parseFloat(data.turbidity), parseFloat(data.hardness)],
            type: 'bar',
            name: 'Your Sample',
            marker: {
                color: '#3498db'
            }
        },
        {
            x: ['pH', 'Turbidity', 'Hardness'],
            y: [7.0, 1.0, 150],
            type: 'bar',
            name: 'Ideal Values',
            marker: {
                color: '#2ecc71'
            }
        }
    ];
    
    const comparisonLayout = {
        autosize: true,
        height: 400,
        title: 'Your Sample vs. Ideal Values',
        barmode: 'group',
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: "#2c3e50", family: "Roboto" }
    };
    
    const config = {
        responsive: true,
        displayModeBar: false
    };
    
    Plotly.newPlot('comparison-chart', comparisonData, comparisonLayout, config);
}

function generateRecommendations(data) {
    const recommendationsDiv = document.getElementById('recommendations');
    let recommendations = [];
    
    // pH recommendations
    const pH = parseFloat(data.ph);
    if (pH < 6.5 || pH > 8.5) {
        recommendations.push(`<li><strong>pH Level (Current: ${pH}):</strong> Optimal pH for potable water is between 6.5-8.5. ${pH < 6.5 ? 'Your sample is too acidic.' : 'Your sample is too alkaline.'}</li>`);
    }
    
    // Turbidity recommendations
    const turbidity = parseFloat(data.turbidity);
    if (turbidity > 1) {
        recommendations.push(`<li><strong>Turbidity (Current: ${turbidity} NTU):</strong> For drinking water, turbidity should be below 1 NTU. Consider filtration or clarification methods.</li>`);
    }
    
    // Solids recommendations
    const solids = parseFloat(data.solids);
    if (solids > 500) {
        recommendations.push(`<li><strong>Total Dissolved Solids (Current: ${solids} ppm):</strong> High TDS levels can affect taste and indicate contamination. Consider reverse osmosis or distillation.</li>`);
    }
    
    // Chloramines recommendations
    const chloramines = parseFloat(data.chloramines);
    if (chloramines > 4) {
        recommendations.push(`<li><strong>Chloramines (Current: ${chloramines} ppm):</strong> Levels above 4 ppm may cause health issues. Consider activated carbon filtration.</li>`);
    }
    
    // Sulfate recommendations
    const sulfate = parseFloat(data.sulfate);
    if (sulfate > 250) {
        recommendations.push(`<li><strong>Sulfate (Current: ${sulfate} mg/L):</strong> High sulfate can cause a bitter taste and laxative effects. Consider ion exchange or reverse osmosis.</li>`);
    }
    
    // Conductivity recommendations
    const conductivity = parseFloat(data.conductivity);
    if (conductivity > 800) {
        recommendations.push(`<li><strong>Conductivity (Current: ${conductivity} μS/cm):</strong> High conductivity indicates elevated mineral content. Consider demineralization treatments.</li>`);
    }
    
    // Organic Carbon recommendations
    const organicCarbon = parseFloat(data.organic_carbon);
    if (organicCarbon > 2) {
        recommendations.push(`<li><strong>Organic Carbon (Current: ${organicCarbon} ppm):</strong> Elevated levels may support microbial growth. Consider activated carbon filtration or advanced oxidation.</li>`);
    }
    
    // Trihalomethanes recommendations
    const trihalomethanes = parseFloat(data.trihalomethanes);
    if (trihalomethanes > 80) {
        recommendations.push(`<li><strong>Trihalomethanes (Current: ${trihalomethanes} μg/L):</strong> Levels above 80 μg/L exceed regulatory limits. Consider activated carbon filtration or aeration.</li>`);
    }
    
    // Display recommendations with animation
    if (recommendations.length > 0) {
        recommendationsDiv.innerHTML = `
            <p>Based on your water sample analysis, here are some recommendations to improve quality:</p>
            <ul class="recommendation-list">
                ${recommendations.join('')}
            </ul>
        `;
    } else {
        recommendationsDiv.innerHTML = `
            <p class="text-success">Your water sample meets all potability standards! Continue maintaining these excellent conditions.</p>
        `;
    }
    
    // Animate recommendations
    const recItems = document.querySelectorAll('.recommendation-list li');
    recItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, 300 + (index * 100));
    });
}