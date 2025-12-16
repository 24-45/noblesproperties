/**
 * Nobles Properties - Charts JavaScript
 * نوبلز العقارية - الرسوم البيانية
 */

// Chart.js default configuration for Arabic
Chart.defaults.font.family = 'Tajawal, sans-serif';
Chart.defaults.plugins.legend.labels.font = { family: 'Tajawal' };
Chart.defaults.plugins.tooltip.titleFont = { family: 'Tajawal' };
Chart.defaults.plugins.tooltip.bodyFont = { family: 'Tajawal' };

// Color palette
const chartColors = {
    primary: '#dc1f27',
    primaryLight: 'rgba(220, 31, 39, 0.1)',
    secondary: '#00502F',
    success: '#28a745',
    warning: '#ffc107',
    info: '#17a2b8',
    gray: '#6c757d',
    dark: '#1a1a1a'
};

/**
 * Initialize progress chart for project detail page
 */
function initProgressChart(monthlyData) {
    const ctx = document.getElementById('progressChart');
    if (!ctx) return;
    
    const labels = monthlyData.map(item => item.month);
    const data = monthlyData.map(item => item.progress);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'نسبة الإنجاز',
                data: data,
                borderColor: chartColors.primary,
                backgroundColor: chartColors.primaryLight,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: chartColors.primary,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: chartColors.dark,
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `نسبة الإنجاز: ${context.raw}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

/**
 * Create units distribution chart
 */
function createUnitsChart(canvasId, soldUnits, availableUnits) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['وحدات مباعة', 'وحدات متاحة'],
            datasets: [{
                data: [soldUnits, availableUnits],
                backgroundColor: [chartColors.primary, chartColors.success],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: chartColors.dark,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${context.label}: ${context.raw} وحدة (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Create financial distribution chart
 */
function createFinancialChart(canvasId, financialData) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['تكلفة الأرض', 'تكلفة البناء', 'التسويق', 'تكاليف أخرى'],
            datasets: [{
                data: [
                    financialData.land_cost,
                    financialData.construction_cost,
                    financialData.marketing_cost,
                    financialData.other_costs
                ],
                backgroundColor: [
                    chartColors.primary,
                    chartColors.warning,
                    chartColors.info,
                    chartColors.gray
                ],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: chartColors.dark,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const value = context.raw.toLocaleString('ar-JO');
                            return `${context.label}: ${value} د.أ`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Create projects overview bar chart
 */
function createProjectsOverviewChart(canvasId, projectsData) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    const labels = projectsData.map(p => p.name);
    const completionData = projectsData.map(p => p.completion_percentage);
    const salesData = projectsData.map(p => {
        if (p.total_units > 0) {
            return (p.sold_units / p.total_units * 100).toFixed(1);
        }
        return 0;
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'نسبة الإنجاز',
                    data: completionData,
                    backgroundColor: chartColors.primary,
                    borderRadius: 4
                },
                {
                    label: 'نسبة المبيعات',
                    data: salesData,
                    backgroundColor: chartColors.success,
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'rect'
                    }
                },
                tooltip: {
                    backgroundColor: chartColors.dark,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

/**
 * Create monthly sales chart
 */
function createMonthlySalesChart(canvasId, salesData) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    const labels = salesData.map(item => item.month);
    const units = salesData.map(item => item.units_sold);
    const revenue = salesData.map(item => item.revenue);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'الوحدات المباعة',
                    data: units,
                    backgroundColor: chartColors.primary,
                    borderRadius: 4,
                    yAxisID: 'y'
                },
                {
                    label: 'الإيرادات (ألف د.أ)',
                    data: revenue,
                    type: 'line',
                    borderColor: chartColors.success,
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    pointBackgroundColor: chartColors.success,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'الوحدات'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'الإيرادات (ألف د.أ)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

/**
 * Create project phases timeline chart
 */
function createPhasesChart(canvasId, phasesData) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    const labels = phasesData.map(p => p.name);
    const progress = phasesData.map(p => p.progress);
    const colors = phasesData.map(p => {
        if (p.progress >= 100) return chartColors.success;
        if (p.progress >= 50) return chartColors.warning;
        return chartColors.primary;
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'نسبة الإنجاز',
                data: progress,
                backgroundColor: colors,
                borderRadius: 4,
                barThickness: 30
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `الإنجاز: ${context.raw}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Fetch and create project chart from API
 */
async function loadProjectChart(projectSlug, chartType, canvasId) {
    try {
        const response = await fetch(`/api/project/${projectSlug}/stats`);
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const data = await response.json();
        
        switch (chartType) {
            case 'progress':
                if (data.monthly_progress && data.monthly_progress.length > 0) {
                    initProgressChart(data.monthly_progress);
                }
                break;
            case 'units':
                createUnitsChart(canvasId, data.sold_units, data.available_units);
                break;
            case 'financial':
                if (data.financial_data) {
                    createFinancialChart(canvasId, data.financial_data);
                }
                break;
        }
    } catch (error) {
        console.error('Error loading chart:', error);
    }
}

// Export functions for use in templates
window.initProgressChart = initProgressChart;
window.createUnitsChart = createUnitsChart;
window.createFinancialChart = createFinancialChart;
window.createProjectsOverviewChart = createProjectsOverviewChart;
window.createMonthlySalesChart = createMonthlySalesChart;
window.createPhasesChart = createPhasesChart;
window.loadProjectChart = loadProjectChart;
