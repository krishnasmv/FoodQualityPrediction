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
            const predResponse = await fetch('/api/predict', {
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
                let qualityClass = 'quality-good';
                
                if (predResult.prediction.toLowerCase() === 'bad') {
                    alertClass = 'alert-danger';
                    qualityClass = 'quality-bad';
                } else if (predResult.prediction.toLowerCase() === 'medium') {
                    alertClass = 'alert-warning';
                    qualityClass = 'quality-medium';
                }
                
                output.className = `alert ${alertClass}`;
                output.innerHTML = `Predicted Quality: <span class="${qualityClass}">${predResult.prediction.toUpperCase()}</span> `;
                
                // Store the form data for later use
                window.milkData = data;
                
                // Create custom visualizations instead of using the API response
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
            submitButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search me-2" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg> Predict Quality';
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
    const phValue = parseFloat(data.pH);
    const phGauge = {
        type: 'indicator',
        mode: 'gauge+number',
        value: phValue,
        title: { text: 'pH Level', font: { size: 24 } },
        gauge: {
            axis: { range: [3, 9.5], tickwidth: 1, tickcolor: "darkblue" },
            bar: { color: "#3498db" },
            bgcolor: "white",
            borderwidth: 2,
            bordercolor: "gray",
            steps: [
                { range: [3, 6.5], color: "#e74c3c" },
                { range: [6.5, 7], color: "#2ecc71" },
                { range: [7, 9.5], color: "#e67e22" }
            ],
            threshold: {
                line: { color: "red", width: 4 },
                thickness: 0.75,
                value: phValue
            }
        }
    };
    
    // Temperature Gauge
    const tempValue = parseFloat(data.temperature);
    const tempGauge = {
        type: 'indicator',
        mode: 'gauge+number',
        value: tempValue,
        title: { text: 'Temperature (°C)', font: { size: 24 } },
        gauge: {
            axis: { range: [34, 90], tickwidth: 1, tickcolor: "darkblue" },
            bar: { color: "#e74c3c" },
            bgcolor: "white",
            borderwidth: 2,
            bordercolor: "gray",
            steps: [
                { range: [34, 40], color: "#2ecc71" },
                { range: [40, 60], color: "#f39c12" },
                { range: [60, 90], color: "#e74c3c" }
            ],
            threshold: {
                line: { color: "red", width: 4 },
                thickness: 0.75,
                value: tempValue
            }
        }
    };
    
    // Color Gauge
    const colorValue = parseFloat(data.colour);
    const colorGauge = {
        type: 'indicator',
        mode: 'gauge+number',
        value: colorValue,
        title: { text: 'Color Value', font: { size: 24 } },
        gauge: {
            axis: { range: [240, 255], tickwidth: 1, tickcolor: "darkblue" },
            bar: { color: "#9b59b6" },
            bgcolor: "white",
            borderwidth: 2,
            bordercolor: "gray",
            steps: [
                { range: [240, 245], color: "#e74c3c" },
                { range: [245, 250], color: "#f39c12" },
                { range: [250, 255], color: "#2ecc71" }
            ],
            threshold: {
                line: { color: "red", width: 4 },
                thickness: 0.75,
                value: colorValue
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
    Plotly.newPlot('temperature-gauge', [tempGauge], gaugeLayout, config);
    Plotly.newPlot('color-gauge', [colorGauge], gaugeLayout, config);
    
    // Force a window resize event to make sure Plotly adjusts the charts
    window.dispatchEvent(new Event('resize'));
}

// Function to create radar chart
function createRadarChart(data) {
    const radarData = [{
        type: 'scatterpolar',
        r: [
            parseFloat(data.pH) / 9.5 * 100,
            parseFloat(data.temperature) / 90 * 100,
            data.taste === '1' ? 100 : 0,
            data.odor === '1' ? 100 : 0,
            data.fat === '1' ? 100 : 0,
            data.turbidity === '1' ? 0 : 100,
            (parseFloat(data.colour) - 240) / 15 * 100
        ],
        theta: ['pH', 'Temperature', 'Taste', 'Odor', 'Fat Content', 'Turbidity', 'Color'],
        fill: 'toself',
        name: 'Milk Quality Factors',
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
        title: 'Milk Quality Factors',
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
            x: ['pH', 'Temperature', 'Color'],
            y: [parseFloat(data.pH), parseFloat(data.temperature), parseFloat(data.colour)],
            type: 'bar',
            name: 'Your Sample',
            marker: {
                color: '#3498db'
            }
        },
        {
            x: ['pH', 'Temperature', 'Color'],
            y: [6.8, 37, 253],
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

function generateRecommendations(data, prediction) {
    const recommendationsDiv = document.getElementById('recommendations');
    let recommendations = [];
    
    // pH recommendations
    const pH = parseFloat(data.pH);
    if (pH < 6.5 || pH > 7.0) {
        recommendations.push(`<li><strong>pH Level (Current: ${pH}):</strong> Optimal pH for high-quality milk is between 6.5-7.0. ${pH < 6.5 ? 'Your sample is too acidic.' : 'Your sample is too alkaline.'}</li>`);
    }
    
    // Temperature recommendations
    const temp = parseFloat(data.temperature);
    if (temp > 40) {
        recommendations.push(`<li><strong>Temperature (Current: ${temp}°C):</strong> High-quality milk should be stored at temperatures below 40°C. Consider cooling your milk sample.</li>`);
    }
    
    // Taste recommendations
    if (data.taste === '0') {
        recommendations.push(`<li><strong>Taste:</strong> Poor taste indicates potential spoilage or contamination. Check for freshness and proper storage conditions.</li>`);
    }
    
    // Odor recommendations
    if (data.odor === '0') {
        recommendations.push(`<li><strong>Odor:</strong> Unpleasant odor suggests bacterial growth or chemical contamination. Ensure proper hygiene during collection and storage.</li>`);
    }
    
    // Fat recommendations
    if (data.fat === '0') {
        recommendations.push(`<li><strong>Fat Content:</strong> Low fat content may indicate dilution or poor nutrition of the source animal. Check feeding practices or potential adulteration.</li>`);
    }
    
    // Turbidity recommendations
    if (data.turbidity === '1') {
        recommendations.push(`<li><strong>Turbidity:</strong> High turbidity suggests presence of impurities. Improve filtration and handling procedures.</li>`);
    }
    
    // Color recommendations
    const color = parseFloat(data.colour);
    if (color < 250) {
        recommendations.push(`<li><strong>Color (Current: ${color}):</strong> Optimal color value for high-quality milk is closer to 255. Lower values may indicate contamination or spoilage.</li>`);
    }
    
    // Display recommendations with animation
    if (recommendations.length > 0) {
        recommendationsDiv.innerHTML = `
            <p>Based on your milk sample analysis, here are some recommendations to improve quality:</p>
            <ul class="recommendation-list">
                ${recommendations.join('')}
            </ul>
        `;
    } else {
        recommendationsDiv.innerHTML = `
            <p class="text-success">Your milk sample meets all high-quality standards! Continue maintaining these excellent conditions.</p>
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