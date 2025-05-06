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

// Function to create bullet charts (replacing gauge charts)
function createGaugeCharts(data) {
    // Define ideal values
    const idealValues = {
        'ph': 7.0,
        'turbidity': 1.0,
        'solids': 500
    };
    
    // pH Bullet Chart
    const phValue = parseFloat(data.ph);
    const phBullet = createBulletChart(
        phValue, 
        idealValues.ph, 
        [0, 14], 
        [
            { min: 0, max: 6.5, color: "#e74c3c" },  // Poor (red)
            { min: 6.5, max: 8.5, color: "#2ecc71" }, // Good (green)
            { min: 8.5, max: 14, color: "#f39c12" }  // Warning (orange)
        ],
        'pH Level'
    );
    
    // Turbidity Bullet Chart
    const turbidityValue = parseFloat(data.turbidity);
    const turbidityBullet = createBulletChart(
        turbidityValue, 
        idealValues.turbidity, 
        [0, 10], 
        [
            { min: 0, max: 1, color: "#2ecc71" },  // Good (green)
            { min: 1, max: 5, color: "#f39c12" },  // Warning (orange)
            { min: 5, max: 10, color: "#e74c3c" }  // Poor (red)
        ],
        'Turbidity (NTU)'
    );
    
    // Solids Bullet Chart
    const solidsValue = parseFloat(data.solids);
    const solidsBullet = createBulletChart(
        solidsValue, 
        idealValues.solids, 
        [0, 60000], 
        [
            { min: 0, max: 500, color: "#2ecc71" },    // Good (green)
            { min: 500, max: 1500, color: "#f39c12" }, // Warning (orange)
            { min: 1500, max: 60000, color: "#e74c3c" } // Poor (red)
        ],
        'Solids (ppm)'
    );
    
    // Create layout with proper sizing and margins
    const bulletLayout = {
        autosize: true,
        height: 150,
        margin: { t: 50, r: 30, l: 100, b: 30 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { color: "#2c3e50", family: "Roboto" }
    };
    
    // Render the bullet charts with responsive config
    const config = {
        responsive: true,
        displayModeBar: false // Hide the modebar for cleaner look
    };
    
    Plotly.newPlot('ph-gauge', phBullet.data, bulletLayout, config);
    Plotly.newPlot('turbidity-gauge', turbidityBullet.data, bulletLayout, config);
    Plotly.newPlot('solids-gauge', solidsBullet.data, bulletLayout, config);
    
    // Force a window resize event to make sure Plotly adjusts the charts
    window.dispatchEvent(new Event('resize'));
}

// Helper function to create a bullet chart
function createBulletChart(value, idealValue, range, zones, title) {
    const data = [];
    
    // Add colored zones
    for (const zone of zones) {
        data.push({
            type: 'bar',
            orientation: 'h',
            y: [title],
            x: [zone.max - zone.min],
            base: zone.min,
            marker: {
                color: zone.color,
                opacity: 0.5
            },
            width: 0.5,
            showlegend: false,
            hoverinfo: 'none'
        });
    }
    
    // Add ideal value marker
    data.push({
        type: 'scatter',
        x: [idealValue],
        y: [title],
        mode: 'markers',
        marker: {
            symbol: 'line-ns',
            color: 'black',
            size: 16,
            line: { width: 2 }
        },
        name: 'Ideal Value',
        hovertemplate: 'Ideal: %{x:.1f}<extra></extra>'
    });
    
    // Add actual value marker
    data.push({
        type: 'scatter',
        x: [value],
        y: [title],
        mode: 'markers',
        marker: {
            color: '#3498db',
            size: 12,
            line: { width: 1, color: 'white' }
        },
        name: 'Current Value',
        hovertemplate: 'Current: %{x:.1f}<extra></extra>'
    });
    
    // Add annotation for current value
    const layout = {
        annotations: [{
            x: value,
            y: title,
            text: value.toFixed(1),
            showarrow: true,
            arrowhead: 0,
            ax: 0,
            ay: -30,
            font: { size: 12, color: "#2c3e50" }
        }],
        xaxis: {
            range: range,
            showgrid: true,
            gridcolor: 'rgba(0,0,0,0.1)'
        },
        yaxis: {
            showticklabels: false
        },
        showlegend: true,
        legend: {
            orientation: 'h',
            yanchor: 'bottom',
            y: 1.02,
            xanchor: 'right',
            x: 1
        }
    };
    
    return { data, layout };
}

// Function to create parallel coordinates plot (replacing radar chart)
function createRadarChart(data) {
    // Define ideal values
    const idealValues = {
        'ph': 7.0,
        'hardness': 150,
        'solids': 500,
        'chloramines': 4.0,
        'sulfate': 250,
        'conductivity': 800,
        'organic_carbon': 2.0,
        'trihalomethanes': 80,
        'turbidity': 1.0
    };
    
    // Define ranges for each parameter
    const ranges = {
        'ph': [0, 14],
        'hardness': [0, 500],
        'solids': [0, 60000],
        'chloramines': [0, 15],
        'sulfate': [0, 500],
        'conductivity': [0, 1000],
        'organic_carbon': [0, 30],
        'trihalomethanes': [0, 150],
        'turbidity': [0, 10]
    };
    
    // Create dimensions array for parallel coordinates
    const dimensions = [
        {
            label: 'pH',
            values: [parseFloat(data.ph), idealValues.ph],
            range: ranges.ph,
            tickvals: [0, 6.5, 7, 8.5, 14],
            ticktext: ['0 (Poor)', '6.5 (Good)', '7 (Good)', '8.5 (Good)', '14 (Poor)']
        },
        {
            label: 'Hardness',
            values: [parseFloat(data.hardness), idealValues.hardness],
            range: ranges.hardness,
            tickvals: [0, 150, 300, 500],
            ticktext: ['0 (Poor)', '150 (Good)', '300 (Warning)', '500 (Poor)']
        },
        {
            label: 'Solids (ppm)',
            values: [parseFloat(data.solids), idealValues.solids],
            range: ranges.solids,
            tickvals: [0, 500, 1500, 60000],
            ticktext: ['0 (Poor)', '500 (Good)', '1500 (Warning)', '60000 (Poor)']
        },
        {
            label: 'Chloramines',
            values: [parseFloat(data.chloramines), idealValues.chloramines],
            range: ranges.chloramines,
            tickvals: [0, 4, 15],
            ticktext: ['0 (Good)', '4 (Good)', '15 (Poor)']
        },
        {
            label: 'Sulfate',
            values: [parseFloat(data.sulfate), idealValues.sulfate],
            range: ranges.sulfate,
            tickvals: [0, 250, 500],
            ticktext: ['0 (Good)', '250 (Good)', '500 (Poor)']
        },
        {
            label: 'Conductivity',
            values: [parseFloat(data.conductivity), idealValues.conductivity],
            range: ranges.conductivity,
            tickvals: [0, 800, 1000],
            ticktext: ['0 (Good)', '800 (Good)', '1000 (Poor)']
        },
        {
            label: 'Organic Carbon',
            values: [parseFloat(data.organic_carbon), idealValues.organic_carbon],
            range: ranges.organic_carbon,
            tickvals: [0, 2, 30],
            ticktext: ['0 (Good)', '2 (Good)', '30 (Poor)']
        },
        {
            label: 'Trihalomethanes',
            values: [parseFloat(data.trihalomethanes), idealValues.trihalomethanes],
            range: ranges.trihalomethanes,
            tickvals: [0, 80, 150],
            ticktext: ['0 (Good)', '80 (Good)', '150 (Poor)']
        },
        {
            label: 'Turbidity',
            values: [parseFloat(data.turbidity), idealValues.turbidity],
            range: ranges.turbidity,
            tickvals: [0, 1, 5, 10],
            ticktext: ['0 (Good)', '1 (Good)', '5 (Warning)', '10 (Poor)']
        }
    ];
    
    // Create parallel coordinates plot
    const parallelData = [{
        type: 'parcoords',
        line: {
            color: [0, 1],
            colorscale: [[0, '#3498db'], [1, '#2ecc71']],
            showscale: true,
            colorbar: {
                title: 'Sample',
                tickvals: [0, 1],
                ticktext: ['Current', 'Ideal']
            }
        },
        dimensions: dimensions
    }];
    
    const parallelLayout = {
        title: 'Water Quality Factors Comparison',
        height: 500,
        margin: { l: 80, r: 80, t: 80, b: 40 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { color: "#2c3e50", family: "Roboto" }
    };
    
    const config = {
        responsive: true,
        displayModeBar: false
    };
    
    Plotly.newPlot('radar-chart', parallelData, parallelLayout, config);
}

// Function to create diverging bar chart (replacing comparison chart)
function createComparisonChart(data) {
    // Define ideal values
    const idealValues = {
        'ph': 7.0,
        'turbidity': 1.0,
        'hardness': 150
    };
    
    // Calculate differences from ideal values
    const params = ['pH', 'Turbidity', 'Hardness'];
    const currentValues = [
        parseFloat(data.ph),
        parseFloat(data.turbidity),
        parseFloat(data.hardness)
    ];
    const idealValuesArray = [
        idealValues.ph,
        idealValues.turbidity,
        idealValues.hardness
    ];
    
    // Calculate differences
    const differences = currentValues.map((val, i) => val - idealValuesArray[i]);
    
    // Determine colors based on difference magnitude
    const colors = differences.map(diff => {
        const absDiff = Math.abs(diff);
        const threshold = Math.abs(idealValuesArray[0]) * 0.1; // 10% of ideal value as threshold
        
        if (absDiff < threshold * 0.5) {
            return "#2ecc71"; // Good (green)
        } else if (absDiff < threshold) {
            return "#f39c12"; // Warning (orange)
        } else {
            return "#e74c3c"; // Poor (red)
        }
    });
    
    // Create hover text
    const hoverText = differences.map((diff, i) => {
        return `Parameter: ${params[i]}<br>` +
               `Current: ${currentValues[i].toFixed(1)}<br>` +
               `Ideal: ${idealValuesArray[i].toFixed(1)}<br>` +
               `Difference: ${diff > 0 ? '+' : ''}${diff.toFixed(1)}`;
    });
    
    // Create diverging bar chart
    const divergingData = [{
        type: 'bar',
        x: params,
        y: differences,
        marker: {
            color: colors
        },
        text: hoverText,
        hoverinfo: 'text'
    }];
    
    // Add zero line and annotations
    const divergingLayout = {
        title: 'Difference from Ideal Values',
        height: 400,
        margin: { t: 80, r: 30, l: 50, b: 50 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: "#2c3e50", family: "Roboto" },
        xaxis: {
            title: null,
            showgrid: false
        },
        yaxis: {
            title: 'Difference from Ideal',
            zeroline: true,
            zerolinecolor: 'black',
            zerolinewidth: 2,
            gridcolor: 'rgba(0,0,0,0.1)'
        },
        shapes: [{
            type: 'line',
            x0: -0.5,
            x1: params.length - 0.5,
            y0: 0,
            y1: 0,
            line: {
                color: 'black',
                width: 2,
                dash: 'dot'
            }
        }],
        annotations: differences.map((diff, i) => ({
            x: params[i],
            y: diff,
            text: diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1),
            showarrow: true,
            arrowhead: 0,
            ax: 0,
            ay: diff > 0 ? -20 : 20
        }))
    };
    
    const config = {
        responsive: true,
        displayModeBar: false
    };
    
    Plotly.newPlot('comparison-chart', divergingData, divergingLayout, config);
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
