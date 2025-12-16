/**
 * Nobles Properties - Main JavaScript
 * نوبلز العقارية - جافاسكريبت الرئيسي
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavbar();
    initAnimations();
    initCounters();
    initSmoothScroll();
});

/**
 * Navbar functionality
 */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    
    // Change navbar background on scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Close mobile menu on link click
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navbarCollapse.classList.contains('show')) {
                const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                if (bsCollapse) {
                    bsCollapse.hide();
                }
            }
        });
    });
}

/**
 * Scroll animations
 */
function initAnimations() {
    const animatedElements = document.querySelectorAll('.project-card, .stat-card, .card-section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(el => {
        el.classList.add('animate-element');
        observer.observe(el);
    });
}

/**
 * Counter animation for stats
 */
function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.count);
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    }, {
        threshold: 0.5
    });
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

/**
 * Animate counter from 0 to target
 */
function animateCounter(element, target) {
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            element.textContent = target + (element.textContent.includes('+') ? '+' : '');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

/**
 * Format number with commas (Arabic style)
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Format currency (Jordanian Dinar)
 */
function formatCurrency(amount) {
    return formatNumber(amount) + ' د.أ';
}

/**
 * Show loading spinner
 */
function showLoading(container) {
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.innerHTML = '<i class="fas fa-spinner fa-spin fa-3x"></i>';
    container.appendChild(spinner);
}

/**
 * Hide loading spinner
 */
function hideLoading(container) {
    const spinner = container.querySelector('.loading-spinner');
    if (spinner) {
        spinner.remove();
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Fetch data from API
 */
async function fetchData(endpoint) {
    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        showToast('حدث خطأ في تحميل البيانات', 'error');
        return null;
    }
}

/**
 * Export element to PDF using html2pdf
 */
function exportToPDF(element, filename) {
    const opt = {
        margin: [10, 10, 10, 10],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true,
            logging: false
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait' 
        },
        pagebreak: { 
            mode: ['avoid-all', 'css', 'legacy'] 
        }
    };
    
    // Add loading state
    showToast('جاري إنشاء ملف PDF...', 'info');
    
    html2pdf().set(opt).from(element).save().then(() => {
        showToast('تم تصدير الملف بنجاح', 'success');
    }).catch(err => {
        console.error('PDF export error:', err);
        showToast('حدث خطأ في تصدير الملف', 'error');
    });
}

/**
 * Print current page
 */
function printPage() {
    window.print();
}

// Add CSS for animations and toast notifications
const style = document.createElement('style');
style.textContent = `
    .animate-element {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .animate-element.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .loading-spinner {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 40px;
        color: var(--primary-color);
    }
    
    .toast-notification {
        position: fixed;
        bottom: 20px;
        left: 20px;
        padding: 15px 25px;
        background: #333;
        color: white;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 9999;
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    
    .toast-notification.show {
        transform: translateY(0);
        opacity: 1;
    }
    
    .toast-success {
        background: #28a745;
    }
    
    .toast-error {
        background: #dc3545;
    }
    
    .toast-info {
        background: #17a2b8;
    }
    
    .navbar.scrolled {
        background: rgba(26, 26, 26, 0.98) !important;
        box-shadow: 0 2px 20px rgba(0,0,0,0.3);
    }
`;
document.head.appendChild(style);
