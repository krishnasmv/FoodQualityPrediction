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
                let qualityClass = 'quality-high';
                
                if (predResult.prediction.toLowerCase() === 'low') {
                    alertClass = 'alert-danger';
                    qualityClass = 'quality-low';
                } else if (predResult.prediction.toLowerCase() === 'medium') {
                    alertClass = 'alert-warning';
                    qualityClass = 'quality-medium';
                }
                
                output.className = `alert ${alertClass}`;
                output.innerHTML = `Predicted Quality: <span class="${qualityClass}">${predResult.prediction.toUpperCase()}</span> (Confidence: ${(predResult.confidence * 100).toFixed(2)}%)`;
                
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
    // Create bullet charts (replacing gauge charts)
    createGaugeCharts(data);
    
    // Create parallel coordinates plot (replacing radar chart)
    createRadarChart(data);
    
    // Create diverging bar chart (replacing comparison chart)
    createComparisonChart(data);
    
    // Generate recommendations
    generateRecommendations(data);
}

// Function to create bullet charts (replacing gauge charts)
function createGaugeCharts(data) {
    // Define ideal values
    const idealValues = {
        'pH': 6.8,
        'temperature': 37.0,
        'colour': 253.0
    };
    
    // pH Bullet Chart
    const phValue = parseFloat(data.pH);
    const phBullet = createBulletChart(
        phValue, 
        idealValues.pH, 
        [3, 9.5], 
        [
            { min: 3, max: 6.5, color: "#e74c3c" },  // Poor (red)
            { min: 6.5, max: 7, color: "#2ecc71" },  // Good (green)
            { min: 7, max: 9.5, color: "#f39c12" }   // Warning (orange)
        ],
        'pH Level'
    );
    
    // Temperature Bullet Chart
    const tempValue = parseFloat(data.temperature);
    const tempBullet = createBulletChart(
        tempValue, 
        idealValues.temperature, 
        [34, 90], 
        [
            { min: 34, max: 40, color: "#2ecc71" },  // Good (green)
            { min: 40, max: 60, color: "#f39c12" },  // Warning (orange)
            { min: 60, max: 90, color: "#e74c3c" }   // Poor (red)
        ],
        'Temperature (°C)'
    );
    
    // Color Bullet Chart
    const colorValue = parseFloat(data.colour);
    const colorBullet = createBulletChart(
        colorValue, 
        idealValues.colour, 
        [240, 255], 
        [
            { min: 240, max: 245, color: "#e74c3c" },  // Poor (red)
            { min: 245, max: 250, color: "#f39c12" },  // Warning (orange)
            { min: 250, max: 255, color: "#2ecc71" }   // Good (green)
        ],
        'Color Value'
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
    Plotly.newPlot('temperature-gauge', tempBullet.data, bulletLayout, config);
    Plotly.newPlot('color-gauge', colorBullet.data, bulletLayout, config);
    
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
        'pH': 6.8,
        'temperature': 37.0,
        'colour': 253.0,
        'taste': 1,
        'odor': 1,
        'fat': 1,
        'turbidity': 0
    };
    
    // Define ranges for each parameter
    const ranges = {
        'pH': [3, 9.5],
        'temperature': [34, 90],
        'colour': [240, 255],
        'taste': [0, 1],
        'odor': [0, 1],
        'fat': [0, 1],
        'turbidity': [0, 1]
    };
    
    // Create dimensions array for parallel coordinates
    const dimensions = [
        {
            label: 'pH',
            values: [parseFloat(data.pH), idealValues.pH],
            range: ranges.pH,
            tickvals: [3, 6.5, 7, 9.5],
            ticktext: ['3 (Poor)', '6.5 (Good)', '7 (Good)', '9.5 (Poor)']
        },
        {
            label: 'Temperature (°C)',
            values: [parseFloat(data.temperature), idealValues.temperature],
            range: ranges.temperature,
            tickvals: [34, 40, 60, 90],
            ticktext: ['34 (Good)', '40 (Good)', '60 (Warning)', '90 (Poor)']
        },
        {
            label: 'Color Value',
            values: [parseFloat(data.colour), idealValues.colour],
            range: ranges.colour,
            tickvals: [240, 245, 250, 255],
            ticktext: ['240 (Poor)', '245 (Poor)', '250 (Warning)', '255 (Good)']
        },
        {
            label: 'Taste',
            values: [parseInt(data.taste), idealValues.taste],
            range: ranges.taste,
            tickvals: [0, 1],
            ticktext: ['Bad', 'Good']
        },
        {
            label: 'Odor',
            values: [parseInt(data.odor), idealValues.odor],
            range: ranges.odor,
            tickvals: [0, 1],
            ticktext: ['Bad', 'Good']
        },
        {
            label: 'Fat Content',
            values: [parseInt(data.fat), idealValues.fat],
            range: ranges.fat,
            tickvals: [0, 1],
            ticktext: ['Low', 'Good']
        },
        {
            label: 'Turbidity',
            values: [parseInt(data.turbidity), idealValues.turbidity],
            range: ranges.turbidity,
            tickvals: [0, 1],
            ticktext: ['Good', 'Bad']
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
        title: 'Milk Quality Factors Comparison',
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
        'pH': 6.8,
        'temperature': 37.0,
        'colour': 253.0
    };
    
    // Calculate differences from ideal values
    const params = ['pH', 'Temperature', 'Color'];
    const currentValues = [
        parseFloat(data.pH),
        parseFloat(data.temperature),
        parseFloat(data.colour)
    ];
    const idealValuesArray = [
        idealValues.pH,
        idealValues.temperature,
        idealValues.colour
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