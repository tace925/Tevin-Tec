// ===== TEVIN'S TECH - COMPLETE JAVASCRIPT =====
// This one JS file handles ALL functionality for every page
// Version: 1.1 (Updated March 2026)

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // ===== 1. MOBILE MENU TOGGLE =====
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
        });
        
        // Close mobile menu when clicking a link
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                mobileNav.classList.remove('active');
            });
        });
    }
    
    // ===== 2. THEME TOGGLE (Dark/Light Mode) - FIXED =====
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    
    // Apply saved theme or default to light
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
    } else {
        body.classList.add('light-mode');
    }
    
    // Toggle theme function
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            if (body.classList.contains('light-mode')) {
                body.classList.remove('light-mode');
                body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                body.classList.remove('dark-mode');
                body.classList.add('light-mode');
                localStorage.setItem('theme', 'light');
            }
        });
    }
    
    // ===== 3. SMOOTH SCROLLING for anchor links =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // ===== 4. ACTIVE PAGE HIGHLIGHT =====
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Desktop nav
    document.querySelectorAll('.desktop-nav a').forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });
    
    // Mobile nav
    document.querySelectorAll('.mobile-nav a').forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });
    
    // ===== 5. FAQ ACCORDION =====
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const toggle = item.querySelector('.faq-toggle');
        
        if (question && answer && toggle) {
            question.addEventListener('click', function() {
                // Toggle this answer
                answer.classList.toggle('active');
                
                // Change toggle symbol
                if (answer.classList.contains('active')) {
                    toggle.textContent = '−';
                } else {
                    toggle.textContent = '+';
                }
            });
        }
    });
    
    // ===== 6. FORM VALIDATION =====
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            const name = this.querySelector('input[name="name"]');
            const email = this.querySelector('input[name="email"]');
            const message = this.querySelector('textarea[name="message"]');
            
            let isValid = true;
            let errorMessage = '';
            
            if (!name || !name.value.trim()) {
                isValid = false;
                errorMessage = 'Please enter your name';
            } else if (!email || !email.value.trim()) {
                isValid = false;
                errorMessage = 'Please enter your email';
            } else if (!isValidEmail(email.value.trim())) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            } else if (!message || !message.value.trim()) {
                isValid = false;
                errorMessage = 'Please enter your message';
            }
            
            if (!isValid) {
                e.preventDefault();
                showNotification(errorMessage, 'error');
            }
        });
    }
    
    // Email validation helper
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // ===== 7. NOTIFICATION SYSTEM =====
    function showNotification(message, type) {
        // Remove any existing notification container
        let notificationContainer = document.querySelector('.notification-container');
        
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.className = 'notification-container';
            notificationContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
            `;
            document.body.appendChild(notificationContainer);
        }
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            background: ${type === 'error' ? '#E53E3E' : '#6B46C1'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 50px;
            margin-bottom: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
            font-family: 'Inter', sans-serif;
        `;
        notification.textContent = message;
        
        notificationContainer.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }
    
    // ===== 8. SCROLL TO TOP BUTTON =====
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '↑';
    scrollBtn.className = 'scroll-top';
    scrollBtn.setAttribute('aria-label', 'Scroll to top');
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--accent, #6B46C1);
        color: white;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        transition: all 0.3s;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(scrollBtn);
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            scrollBtn.style.display = 'flex';
        } else {
            scrollBtn.style.display = 'none';
        }
    });
    
    scrollBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    scrollBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
    });
    
    scrollBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
    
    // ===== 9. DYNAMIC YEAR IN FOOTER =====
    const copyrightElements = document.querySelectorAll('.copyright');
    const currentYear = new Date().getFullYear();
    
    copyrightElements.forEach(el => {
        if (el) {
            el.innerHTML = el.innerHTML.replace('2026', currentYear);
        }
    });
    
    // ===== 10. INTERSECTION OBSERVER FOR ANIMATIONS =====
    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const sectionObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observe various elements
        const elementsToObserve = document.querySelectorAll(
            '.work-card, .service-card, .testimonial-card, .badge-item, ' +
            '.value-card, .stat-card, .why-item, .process-step, ' +
            '.portfolio-item, .team-member, .faq-item'
        );
        
        elementsToObserve.forEach(el => {
            if (el) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                sectionObserver.observe(el);
            }
        });
    }
    
    // ===== 11. PLACEHOLDER CLICK HANDLERS =====
    document.querySelectorAll('.portfolio-item.placeholder').forEach(el => {
        if (el) {
            el.addEventListener('click', function(e) {
                if (!e.target.closest('a')) {
                    e.preventDefault();
                    showNotification('✨ New project coming soon!', 'info');
                }
            });
        }
    });
    
    // ===== 12. ADD ANIMATION STYLES =====
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(100%);
                opacity: 1;
            }
            to {
                transform: translateX(0);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // ===== 13. FORM FIELD FOCUS EFFECTS =====
    document.querySelectorAll('input, textarea, select').forEach(field => {
        field.addEventListener('focus', function() {
            this.style.borderColor = 'var(--accent)';
            this.style.outline = 'none';
        });
        
        field.addEventListener('blur', function() {
            this.style.borderColor = 'var(--border)';
        });
    });
    
    // ===== 14. CONSOLE MESSAGE (Developer Credit) =====
    console.log('%c🚀 Tevin\'s Tech', 'font-size: 20px; font-weight: bold; color: #6B46C1;');
    console.log('%cWebsite crafted by Tevin Mulinge', 'font-size: 14px; color: #FFB347;');
    console.log('%chttps://github.com/tace925', 'font-size: 12px; color: #718096;');
    
    // ===== 15. TOUCH DEVICE DETECTION =====
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
        document.body.classList.add('touch-device');
    }
    
    // ===== 16. ACTIVE STATE FOR MOBILE MENU =====
    if (mobileNav) {
        mobileNav.querySelectorAll('a').forEach(link => {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage) {
                link.classList.add('active');
            }
        });
    }
    
    // ===== 17. EXTERNAL LINK HANDLER =====
    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        link.addEventListener('click', function(e) {
            // Optional: track external link clicks
            console.log('External link clicked:', this.href);
        });
    });
    
    // ===== 18. FINAL INITIALIZATION LOG =====
    console.log('✅ All systems ready');
    
    // ===== 19. LOAD CMS DATA =====
    loadCMSData();
});

// ===== 20. WINDOW LOAD EVENTS =====
window.addEventListener('load', function() {
    
    // Profile image fallback
    const profileImg = document.getElementById('profile-img');
    const profilePlaceholder = document.getElementById('profile-placeholder');
    
    if (profileImg && profilePlaceholder) {
        // Check if image loaded successfully
        profileImg.onerror = function() {
            profileImg.style.display = 'none';
            profilePlaceholder.style.display = 'flex';
        };
        
        // If image loads, hide placeholder
        profileImg.onload = function() {
            profileImg.style.display = 'block';
            profilePlaceholder.style.display = 'none';
        };
        
        // Trigger check in case image is already cached
        if (profileImg.complete) {
            if (profileImg.naturalHeight === 0) {
                profileImg.onerror();
            } else {
                profileImg.onload();
            }
        }
    }
    
    // Set body opacity to 1 after everything loads
    document.body.style.opacity = '1';
});

// ===== 21. ERROR HANDLING =====
window.addEventListener('error', function(e) {
    console.log('Error caught:', e.message);
});

// ===== 22. BROWSER BACK BUTTON HANDLING =====
window.addEventListener('popstate', function() {
    // Close mobile menu if open when using back button
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileNav && mobileNav.classList.contains('active')) {
        mobileNav.classList.remove('active');
    }
});

// ===== 23. CMS DATA FUNCTIONS =====
async function loadCMSData() {
    try {
        // Load projects
        const projectsResponse = await fetch('/_data/projects.json');
        if (projectsResponse.ok) {
            const projects = await projectsResponse.json();
            displayProjects(projects);
        }
        
        // Load testimonials
        const testimonialsResponse = await fetch('/_data/testimonials.json');
        if (testimonialsResponse.ok) {
            const testimonials = await testimonialsResponse.json();
            displayTestimonials(testimonials);
        }
        
        // Load settings
        const settingsResponse = await fetch('/_data/settings.json');
        if (settingsResponse.ok) {
            const settings = await settingsResponse.json();
            applySettings(settings);
        }
    } catch (error) {
        console.log('CMS data not loaded yet (using defaults)');
    }
}

function displayProjects(projects) {
    const projectsGrid = document.getElementById('projects-grid');
    if (!projectsGrid) return;
    
    projectsGrid.innerHTML = projects.filter(p => p.featured).slice(0, 3).map(project => `
        <div class="work-card">
            <div class="work-image">📊</div>
            <h3>${project.title}</h3>
            <p class="work-client">${project.client}</p>
            <p class="work-desc">${project.description.substring(0, 60)}...</p>
            <a href="portfolio.html" class="work-link">view project →</a>
        </div>
    `).join('');
}

function displayTestimonials(testimonials) {
    const testimonialsGrid = document.getElementById('testimonials-grid');
    if (!testimonialsGrid) return;
    
    testimonialsGrid.innerHTML = testimonials.slice(0, 3).map(t => `
        <div class="testimonial-card">
            <i class="fas fa-quote-left"></i>
            <p>"${t.quote}"</p>
            <div class="client">
                <strong>${t.client}</strong>
                <span>${t.title}</span>
            </div>
        </div>
    `).join('');
}

function applySettings(settings) {
    if (settings.site_title) {
        const titleEl = document.getElementById('site-title');
        if (titleEl) titleEl.textContent = settings.site_title;
    }
    if (settings.tagline) {
        const taglineEl = document.getElementById('footer-tagline');
        if (taglineEl) taglineEl.textContent = settings.tagline;
    }
}

// ===== 24. NETLIFY IDENTITY FOR ADMIN =====
if (window.netlifyIdentity) {
    window.netlifyIdentity.on('init', user => {
        if (!user) {
            window.netlifyIdentity.on('login', () => {
                document.location.href = '/admin/';
            });
        }
    });
}

// Add admin link to footer if user is logged in
function checkAdminAccess() {
    const adminLink = document.querySelector('.admin-link');
    if (adminLink && window.netlifyIdentity && window.netlifyIdentity.currentUser()) {
        adminLink.style.display = 'block';
    } else if (adminLink) {
        adminLink.style.display = 'none';
    }
}

// Check admin status periodically
if (window.netlifyIdentity) {
    setInterval(checkAdminAccess, 5000);
}