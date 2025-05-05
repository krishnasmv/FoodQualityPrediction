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
                
                if (quality <= 4) {
                    alertClass = 'alert-danger';
                    qualityClass = 'quality-low';
                    qualityText = 'Low';
                } else if (quality <= 6) {
                    alertClass = 'alert-warning';
                    qualityClass = 'quality-medium';
                    qualityText = 'Medium';
                }
                
                output.className = `alert ${alertClass}`;
                output.innerHTML = `Predicted Quality: <span class="${qualityClass}">${qualityText}</span> (Score: ${quality}/10, Confidence: ${(predResult.confidence * 100).toFixed(2)}%)`;
                
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

// Function to create bullet charts (replacing gauge charts)
function createGaugeCharts(data) {
    // Define ideal values
    const idealValues = {
        'alcohol': 12.0,
        'fixed_acidity': 7.5,
        'total_sulfur_dioxide': 100
    };
    
    // Alcohol Bullet Chart
    const alcoholValue = parseFloat(data.alcohol);
    const alcoholBullet = createBulletChart(
        alcoholValue, 
        idealValues.alcohol, 
        [8, 15], 
        [
            { min: 8, max: 10, color: "#e74c3c" },   // Poor (red)
            { min: 10, max: 12, color: "#f39c12" },  // Warning (orange)
            { min: 12, max: 15, color: "#2ecc71" }   // Good (green)
        ],
        'Alcohol (% vol.)'
    );
    
    // Acidity Bullet Chart
    const acidityValue = parseFloat(data.fixed_acidity);
    const acidityBullet = createBulletChart(
        acidityValue, 
        idealValues.fixed_acidity, 
        [3, 15], 
        [
            { min: 3, max: 6, color: "#e74c3c" },  // Poor (red)
            { min: 6, max: 9, color: "#2ecc71" },  // Good (green)
            { min: 9, max: 15, color: "#f39c12" }  // Warning (orange)
        ],
        'Fixed Acidity (g/L)'
    );
    
    // Sulfur Dioxide Bullet Chart
    const sulfurValue = parseFloat(data.total_sulfur_dioxide);
    const sulfurBullet = createBulletChart(
        sulfurValue, 
        idealValues.total_sulfur_dioxide, 
        [0, 300], 
        [
            { min: 0, max: 50, color: "#e74c3c" },    // Poor (red)
            { min: 50, max: 150, color: "#2ecc71" },  // Good (green)
            { min: 150, max: 300, color: "#f39c12" }  // Warning (orange)
        ],
        'Total SO₂ (mg/L)'
    );
    
    // Create layout with proper sizing and margins
    const bulletLayout = {
        autosize: true,
        height: 150,
        margin: { t: 50, r: 30, l: 120, b: 30 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { color: "#2c3e50", family: "Roboto" }
    };
    
    // Render the bullet charts with responsive config
    const config = {
        responsive: true,
        displayModeBar: false // Hide the modebar for cleaner look
    };
    
    Plotly.newPlot('alcohol-gauge', alcoholBullet.data, bulletLayout, config);
    Plotly.newPlot('acidity-gauge', acidityBullet.data, bulletLayout, config);
    Plotly.newPlot('sulfur-gauge', sulfurBullet.data, bulletLayout, config);
    
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
            color: '#8e44ad',
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
        'fixed_acidity': 7.5,
        'volatile_acidity': 0.4,
        'citric_acid': 0.5,
        'residual_sugar': 2.5,
        'chlorides': 0.05,
        'free_sulfur_dioxide': 30,
        'total_sulfur_dioxide': 100,
        'density': 0.995,
        'ph': 3.3,
        'sulphates': 0.8,
        'alcohol': 12.0
    };
    
    // Define ranges for each parameter
    const ranges = {
        'fixed_acidity': [3, 15],
        'volatile_acidity': [0, 1.5],
        'citric_acid': [0, 1],
        'residual_sugar': [0, 20],
        'chlorides': [0, 0.5],
        'free_sulfur_dioxide': [0, 100],
        'total_sulfur_dioxide': [0, 300],
        'density': [0.9, 1.1],
        'ph': [2.5, 4.5],
        'sulphates': [0, 2],
        'alcohol': [8, 15]
    };
    
    // Create dimensions array for parallel coordinates
    const dimensions = [
        {
            label: 'Fixed Acidity (g/L)',
            values: [parseFloat(data.fixed_acidity), idealValues.fixed_acidity],
            range: ranges.fixed_acidity,
            tickvals: [3, 6, 7.5, 9, 15],
            ticktext: ['3 (Poor)', '6 (Good)', '7.5 (Ideal)', '9 (Good)', '15 (Poor)']
        },
        {
            label: 'Volatile Acidity (g/L)',
            values: [parseFloat(data.volatile_acidity), idealValues.volatile_acidity],
            range: ranges.volatile_acidity,
            tickvals: [0, 0.4, 0.7, 1.5],
            ticktext: ['0 (Good)', '0.4 (Ideal)', '0.7 (Warning)', '1.5 (Poor)']
        },
        {
            label: 'Citric Acid (g/L)',
            values: [parseFloat(data.citric_acid), idealValues.citric_acid],
            range: ranges.citric_acid,
            tickvals: [0, 0.5, 1],
            ticktext: ['0 (Poor)', '0.5 (Ideal)', '1 (Good)']
        },
        {
            label: 'Residual Sugar (g/L)',
            values: [parseFloat(data.residual_sugar), idealValues.residual_sugar],
            range: ranges.residual_sugar,
            tickvals: [0, 2.5, 10, 20],
            ticktext: ['0 (Poor)', '2.5 (Ideal)', '10 (Warning)', '20 (Poor)']
        },
        {
            label: 'Chlorides (g/L)',
            values: [parseFloat(data.chlorides), idealValues.chlorides],
            range: ranges.chlorides,
            tickvals: [0, 0.05, 0.1, 0.5],
            ticktext: ['0 (Good)', '0.05 (Ideal)', '0.1 (Warning)', '0.5 (Poor)']
        },
        {
            label: 'Free SO₂ (mg/L)',
            values: [parseFloat(data.free_sulfur_dioxide), idealValues.free_sulfur_dioxide],
            range: ranges.free_sulfur_dioxide,
            tickvals: [0, 30, 60, 100],
            ticktext: ['0 (Poor)', '30 (Ideal)', '60 (Good)', '100 (Warning)']
        },
        {
            label: 'Total SO₂ (mg/L)',
            values: [parseFloat(data.total_sulfur_dioxide), idealValues.total_sulfur_dioxide],
            range: ranges.total_sulfur_dioxide,
            tickvals: [0, 50, 100, 150, 300],
            ticktext: ['0 (Poor)', '50 (Poor)', '100 (Ideal)', '150 (Good)', '300 (Poor)']
        },
        {
            label: 'Density (g/cm³)',
            values: [parseFloat(data.density), idealValues.density],
            range: ranges.density,
            tickvals: [0.9, 0.995, 1.1],
            ticktext: ['0.9 (Good)', '0.995 (Ideal)', '1.1 (Poor)']
        },
        {
            label: 'pH',
            values: [parseFloat(data.ph), idealValues.ph],
            range: ranges.ph,
            tickvals: [2.5, 3.0, 3.3, 3.6, 4.5],
            ticktext: ['2.5 (Poor)', '3.0 (Good)', '3.3 (Ideal)', '3.6 (Good)', '4.5 (Poor)']
        },
        {
            label: 'Sulphates (g/L)',
            values: [parseFloat(data.sulphates), idealValues.sulphates],
            range: ranges.sulphates,
            tickvals: [0, 0.6, 0.8, 1.2, 2],
            ticktext: ['0 (Poor)', '0.6 (Good)', '0.8 (Ideal)', '1.2 (Good)', '2 (Warning)']
        },
        {
            label: 'Alcohol (% vol.)',
            values: [parseFloat(data.alcohol), idealValues.alcohol],
            range: ranges.alcohol,
            tickvals: [8, 10, 12, 15],
            ticktext: ['8 (Poor)', '10 (Warning)', '12 (Ideal)', '15 (Good)']
        }
    ];
    
    // Create parallel coordinates plot
    const parallelData = [{
        type: 'parcoords',
        line: {
            color: [0, 1],
            colorscale: [[0, '#8e44ad'], [1, '#2ecc71']],
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
        title: 'Wine Quality Factors Comparison',
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
function createComparisonChart(data, predictedQuality) {
    // Define ideal values
    const idealValues = {
        'alcohol': 12.0,
        'fixed_acidity': 7.5,
        'volatile_acidity': 0.4,
        'sulphates': 0.8
    };
    
    // Calculate differences from ideal values
    const params = ['Alcohol', 'Fixed Acidity', 'Volatile Acidity', 'Sulphates'];
    const currentValues = [
        parseFloat(data.alcohol),
        parseFloat(data.fixed_acidity),
        parseFloat(data.volatile_acidity),
        parseFloat(data.sulphates)
    ];
    const idealValuesArray = [
        idealValues.alcohol,
        idealValues.fixed_acidity,
        idealValues.volatile_acidity,
        idealValues.sulphates
    ];
    
    // Calculate differences
    const differences = currentValues.map((val, i) => {
        // For volatile acidity, lower is better, so invert the difference
        if (params[i] === 'Volatile Acidity') {
            return idealValuesArray[i] - val;
        }
        return val - idealValuesArray[i];
    });
    
    // Determine colors based on difference magnitude
    const colors = differences.map((diff, i) => {
        const absDiff = Math.abs(diff);
        const threshold = Math.abs(idealValuesArray[i]) * 0.1; // 10% of ideal value as threshold
        
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
        let diffText;
        if (params[i] === 'Volatile Acidity') {
            // For volatile acidity, explain that lower is better
            diffText = diff > 0 ? 
                `${Math.abs(diff).toFixed(2)} lower than ideal (good)` : 
                `${Math.abs(diff).toFixed(2)} higher than ideal (bad)`;
        } else {
            diffText = `${diff > 0 ? '+' : ''}${diff.toFixed(2)} from ideal`;
        }
        
        return `Parameter: ${params[i]}<br>` +
               `Current: ${currentValues[i].toFixed(2)}<br>` +
               `Ideal: ${idealValuesArray[i].toFixed(2)}<br>` +
               `Difference: ${diffText}`;
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
