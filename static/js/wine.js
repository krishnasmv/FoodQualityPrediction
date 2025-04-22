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
            const predResponse = await fetch('/api/predict_wine', {
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
                let qualityText = 'High';
                
                // Wine quality is typically rated on a scale of 0-10
                const quality = predResult.prediction;
                
                if (quality === 'bad' || quality === 'Low') {
                    alertClass = 'alert-danger';
                    qualityClass = 'quality-low';
                    qualityText = 'Low';
                } else if (quality === 'average' || quality === 'Medium') {
                    alertClass = 'alert-warning';
                    qualityClass = 'quality-medium';
                    qualityText = 'Medium';
                } else if (quality === 'good' || quality === 'High') {
                    alertClass = 'alert-success';
                    qualityClass = 'quality-high';
                    qualityText = 'High';
                } else {
                    alertClass = 'alert-secondary';
                    qualityClass = 'quality-unknown';
                    qualityText = quality;
                }
                
                output.className = `alert ${alertClass}`;
                output.innerHTML = `Predicted Quality: <span class="${qualityClass}">${qualityText}</span>`;
                
                // Store the form data for later use
                window.wineData = data;
                
                // Create custom visualizations
                createVisualizations(data, quality);
                
                // Show the View More button
                viewMoreContainer.style.display = 'block';
                viewMoreContainer.style.opacity = '0';
                viewMoreContainer.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    viewMoreContainer.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    viewMoreContainer.style.opacity = '1';
                    viewMoreContainer.style.transform = 'translateY(0)';
                }, 300);
                
                // Display logs from backend
                if (predResult.logs) {
                    const logsContainer = document.getElementById('predictionLogs');
                    if (!logsContainer) {
                        const newLogsDiv = document.createElement('div');
                        newLogsDiv.id = 'predictionLogs';
                        newLogsDiv.style.whiteSpace = 'pre-wrap';
                        newLogsDiv.style.backgroundColor = '#f8f9fa';
                        newLogsDiv.style.border = '1px solid #ddd';
                        newLogsDiv.style.padding = '10px';
                        newLogsDiv.style.marginTop = '15px';
                        newLogsDiv.style.maxHeight = '200px';
                        newLogsDiv.style.overflowY = 'auto';
                        resultDiv.appendChild(newLogsDiv);
                    }
                    document.getElementById('predictionLogs').textContent = predResult.logs;
                }
                
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
            submitButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search me-2" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg> Predict Quality';
        }
    });
});

// Function to create all visualizations
function createVisualizations(data, predictedQuality) {
    // Create gauge charts
    createGaugeCharts(data);
    
    // Create radar chart
    createRadarChart(data);
    
    // Create comparison chart
    createComparisonChart(data, predictedQuality);
    
    // Generate recommendations
    generateRecommendations(data, predictedQuality);
}

// Function to create gauge charts
function createGaugeCharts(data) {
    // Alcohol Gauge
    const alcoholValue = parseFloat(data.alcohol);
    const alcoholGauge = {
        type: 'indicator',
        mode: 'gauge+number',
        value: alcoholValue,
        title: { text: 'Alcohol (% vol.)', font: { size: 24 } },
        gauge: {
            axis: { range: [8, 15], tickwidth: 1, tickcolor: "darkblue" },
            bar: { color: "#3498db" },
            bgcolor: "white",
            borderwidth: 2,
            bordercolor: "gray",
            steps: [
                { range: [8, 10], color: "#e74c3c" },
                { range: [10, 12], color: "#f39c12" },
                { range: [12, 15], color: "#2ecc71" }
            ],
            threshold: {
                line: { color: "red", width: 4 },
                thickness: 0.75,
                value: alcoholValue
            }
        }
    };
    
    // Acidity Gauge (Fixed Acidity)
    const acidityValue = parseFloat(data.fixed_acidity);
    const acidityGauge = {
        type: 'indicator',
        mode: 'gauge+number',
        value: acidityValue,
        title: { text: 'Fixed Acidity (g/L)', font: { size: 24 } },
        gauge: {
            axis: { range: [3, 15], tickwidth: 1, tickcolor: "darkblue" },
            bar: { color: "#e74c3c" },
            bgcolor: "white",
            borderwidth: 2,
            bordercolor: "gray",
            steps: [
                { range: [3, 6], color: "#e74c3c" },
                { range: [6, 9], color: "#2ecc71" },
                { range: [9, 15], color: "#f39c12" }
            ],
            threshold: {
                line: { color: "red", width: 4 },
                thickness: 0.75,
                value: acidityValue
            }
        }
    };
    
    // Sulfur Dioxide Gauge
    const sulfurValue = parseFloat(data.total_sulfur_dioxide);
    const sulfurGauge = {
        type: 'indicator',
        mode: 'gauge+number',
        value: sulfurValue,
        title: { text: 'Total SO₂ (mg/L)', font: { size: 24 } },
        gauge: {
            axis: { range: [0, 300], tickwidth: 1, tickcolor: "darkblue" },
            bar: { color: "#9b59b6" },
            bgcolor: "white",
            borderwidth: 2,
            bordercolor: "gray",
            steps: [
                { range: [0, 50], color: "#e74c3c" },
                { range: [50, 150], color: "#2ecc71" },
                { range: [150, 300], color: "#f39c12" }
            ],
            threshold: {
                line: { color: "red", width: 4 },
                thickness: 0.75,
                value: sulfurValue
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
    
    Plotly.newPlot('alcohol-gauge', [alcoholGauge], gaugeLayout, config);
    Plotly.newPlot('acidity-gauge', [acidityGauge], gaugeLayout, config);
    Plotly.newPlot('sulfur-gauge', [sulfurGauge], gaugeLayout, config);
    
    // Force a window resize event to make sure Plotly adjusts the charts
    window.dispatchEvent(new Event('resize'));
}

// Function to create radar chart
function createRadarChart(data) {
    const radarData = [{
        type: 'scatterpolar',
        r: [
            (parseFloat(data.fixed_acidity) - 3) / 12 * 100,
            (1.5 - parseFloat(data.volatile_acidity)) / 1.5 * 100, // Lower is better
            parseFloat(data.citric_acid) / 1 * 100,
            parseFloat(data.residual_sugar) / 20 * 100,
            (0.5 - parseFloat(data.chlorides)) / 0.5 * 100, // Lower is better
            parseFloat(data.free_sulfur_dioxide) / 100 * 100,
            (300 - parseFloat(data.total_sulfur_dioxide)) / 300 * 100, // Lower is better
            (1.1 - parseFloat(data.density)) / 0.2 * 100, // Lower is better
            (parseFloat(data.ph) - 2.5) / 2 * 100,
            parseFloat(data.sulphates) / 2 * 100,
            (parseFloat(data.alcohol) - 8) / 7 * 100
        ],
        theta: [
            'Fixed Acidity', 
            'Low Volatile Acidity', 
            'Citric Acid', 
            'Residual Sugar', 
            'Low Chlorides', 
            'Free SO₂', 
            'Low Total SO₂', 
            'Low Density', 
            'pH', 
            'Sulphates', 
            'Alcohol'
        ],
        fill: 'toself',
        name: 'Wine Quality Factors',
        line: {
            color: '#8e44ad'
        },
        fillcolor: 'rgba(142, 68, 173, 0.5)'
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
        title: 'Wine Quality Factors',
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
function createComparisonChart(data, predictedQuality) {
    const comparisonData = [
        {
            x: ['Alcohol', 'Fixed Acidity', 'Volatile Acidity', 'Sulphates'],
            y: [
                parseFloat(data.alcohol), 
                parseFloat(data.fixed_acidity), 
                parseFloat(data.volatile_acidity), 
                parseFloat(data.sulphates)
            ],
            type: 'bar',
            name: 'Your Sample',
            marker: {
                color: '#8e44ad'
            }
        },
        {
            x: ['Alcohol', 'Fixed Acidity', 'Volatile Acidity', 'Sulphates'],
            y: [12, 7.5, 0.4, 0.8], // Ideal values for high-quality wine
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

function generateRecommendations(data, predictedQuality) {
    const recommendationsDiv = document.getElementById('recommendations');
    let recommendations = [];
    
    // Alcohol recommendations
    const alcohol = parseFloat(data.alcohol);
    if (alcohol < 11) {
        recommendations.push(`<li><strong>Alcohol Content (Current: ${alcohol}% vol.):</strong> Higher alcohol content (11-13%) is often associated with better quality wines. Consider longer fermentation or using grapes with higher sugar content.</li>`);
    }
    
    // Fixed acidity recommendations
    const fixedAcidity = parseFloat(data.fixed_acidity);
    if (fixedAcidity < 6 || fixedAcidity > 9) {
        recommendations.push(`<li><strong>Fixed Acidity (Current: ${fixedAcidity} g/L):</strong> Optimal fixed acidity for quality wine is between 6-9 g/L. ${fixedAcidity < 6 ? 'Consider adding tartaric acid during production.' : 'Consider reducing acidity through malolactic fermentation.'}</li>`);
    }
    
    // Volatile acidity recommendations
    const volatileAcidity = parseFloat(data.volatile_acidity);
    if (volatileAcidity > 0.5) {
        recommendations.push(`<li><strong>Volatile Acidity (Current: ${volatileAcidity} g/L):</strong> High volatile acidity can give wine a vinegar taste. Keep below 0.5 g/L by ensuring proper sanitation during fermentation and limiting oxygen exposure.</li>`);
    }
    
    // Residual sugar recommendations
    const residualSugar = parseFloat(data.residual_sugar);
    if (residualSugar > 10) {
        recommendations.push(`<li><strong>Residual Sugar (Current: ${residualSugar} g/L):</strong> High residual sugar may mask other flavors. For dry wines, aim for 2-4 g/L by allowing complete fermentation.</li>`);
    }
    
    // Chlorides recommendations
    const chlorides = parseFloat(data.chlorides);
    if (chlorides > 0.1) {
        recommendations.push(`<li><strong>Chlorides (Current: ${chlorides} g/L):</strong> High chloride levels can make wine taste salty. Aim for levels below 0.1 g/L by using quality water and careful grape selection.</li>`);
    }
    
    // Sulfur dioxide recommendations
    const totalSO2 = parseFloat(data.total_sulfur_dioxide);
    if (totalSO2 > 150) {
        recommendations.push(`<li><strong>Total Sulfur Dioxide (Current: ${totalSO2} mg/L):</strong> High SO₂ levels can affect aroma and taste. Keep below 150 mg/L while ensuring adequate preservation.</li>`);
    }
    
    // pH recommendations
    const pH = parseFloat(data.ph);
    if (pH < 3.0 || pH > 3.6) {
        recommendations.push(`<li><strong>pH (Current: ${pH}):</strong> Optimal pH for quality wine is between 3.0-3.6. ${pH < 3.0 ? 'Consider malolactic fermentation to reduce acidity.' : 'Consider adding tartaric acid to increase acidity.'}</li>`);
    }
    
    // Sulphates recommendations
    const sulphates = parseFloat(data.sulphates);
    if (sulphates < 0.6) {
        recommendations.push(`<li><strong>Sulphates (Current: ${sulphates} g/L):</strong> Adequate sulphates (0.6-0.8 g/L) help preserve wine and prevent oxidation. Consider adding potassium metabisulfite during production.</li>`);
    }
    
    // Display recommendations with animation
    if (recommendations.length > 0) {
        recommendationsDiv.innerHTML = `
            <p>Based on your wine sample analysis, here are some recommendations to improve quality:</p>
            <ul class="recommendation-list">
                ${recommendations.join('')}
            </ul>
        `;
    } else {
        recommendationsDiv.innerHTML = `
            <p class="text-success">Your wine sample meets all high-quality standards! Continue maintaining these excellent conditions.</p>
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