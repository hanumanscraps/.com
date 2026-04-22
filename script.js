document.addEventListener('DOMContentLoaded', () => {
    
    // --- Data & State Management ---
    const defaultPrices = [
        { id: 'iron', name: 'Iron', price: 25, unit: 'kg', image: 'iron.png' },
        { id: 'steel', name: 'Steel', price: 40, unit: 'kg', image: 'steel.png' },
        { id: 'copper', name: 'Copper', price: 650, unit: 'kg', image: 'copper.png' },
        { id: 'plastic', name: 'Plastic', price: 15, unit: 'kg', image: 'plastic.png' },
        { id: 'paper', name: 'Paper/Cardboard', price: 12, unit: 'kg', image: 'paper.png' },
        { id: 'ewaste', name: 'E-Waste', price: 150, unit: 'kg', image: 'ewaste.svg' }
    ];

    let scrapData = JSON.parse(localStorage.getItem('hanumanScrapPrices_v3'));
    if (!scrapData) {
        scrapData = defaultPrices;
        localStorage.setItem('hanumanScrapPrices_v3', JSON.stringify(scrapData));
    }

    let isAdmin = sessionStorage.getItem('isAdmin') === 'true';

    // --- DOM Elements ---
    const pricingGrid = document.getElementById('pricing-grid');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    const navbar = document.getElementById('navbar');
    
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    const adminStatusIndicator = document.getElementById('admin-status-indicator');
    const loginModalOverlay = document.getElementById('login-modal-overlay');
    const closeModalBtn = document.getElementById('close-modal');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');

    // --- Rendering Logic ---
    function renderPricingCards() {
        pricingGrid.innerHTML = '';
        
        // Ensure localstorage defaults have images if they were saved previously without them
        const dataToRender = scrapData.map(item => {
            if(!item.image) {
                item.image = defaultPrices.find(d => d.id === item.id)?.image || '';
            }
            return item;
        });

        const marqueeTrack1 = document.createElement('div');
        marqueeTrack1.className = 'marquee-content';
        const marqueeTrack2 = document.createElement('div');
        marqueeTrack2.className = 'marquee-content';
        marqueeTrack2.setAttribute('aria-hidden', 'true');

        const buildCard = (item, trackIndex) => {
            const card = document.createElement('div');
            card.className = 'price-card glass-card';
            
            let adminHTML = '';
            if (isAdmin) {
                adminHTML = `
                    <div class="edit-form">
                        <input type="number" id="input-${item.id}-${trackIndex}" value="${item.price}" min="0" step="1">
                        <button class="btn btn-sm btn-primary" onclick="window.savePrice('${item.id}', ${trackIndex})">
                            <i class="fa-solid fa-save"></i>
                        </button>
                    </div>
                `;
            }

            card.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="card-image">
                <div class="card-details">
                    <h3>${item.name}</h3>
                    <div class="price-info">
                        <span class="currency">₹</span><span class="price-display-${item.id}">${item.price}</span><span class="unit">/${item.unit}</span>
                    </div>
                </div>
                ${adminHTML}
            `;
            return card;
        };

        dataToRender.forEach((item) => {
            marqueeTrack1.appendChild(buildCard(item, 1));
            marqueeTrack2.appendChild(buildCard(item, 2));
        });

        pricingGrid.appendChild(marqueeTrack1);
        pricingGrid.appendChild(marqueeTrack2);
    }

    // Global function for inline onclick handler
    window.savePrice = (id, index) => {
        const input = document.getElementById(`input-${id}-${index}`);
        const newPrice = parseFloat(input.value);
        
        if (isNaN(newPrice) || newPrice < 0) {
            alert('Please enter a valid positive number');
            return;
        }

        const itemIndex = scrapData.findIndex(item => item.id === id);
        if (itemIndex > -1) {
            scrapData[itemIndex].price = newPrice;
            localStorage.setItem('hanumanScrapPrices', JSON.stringify(scrapData));
            
            // Visual feedback - update all displays for this item in the marquee
            const priceDisplays = document.querySelectorAll(`.price-display-${id}`);
            priceDisplays.forEach(display => {
                display.innerText = newPrice;
                display.style.color = 'var(--primary)';
                setTimeout(() => { display.style.color = ''; }, 1000);
            });
            // Update the corresponding inputs as well to keep them in sync
            const allInputs = document.querySelectorAll(`[id^='input-${id}-']`);
            allInputs.forEach(inp => { inp.value = newPrice; });
        }
    };

    // --- Auth Logic ---
    function updateAuthUI() {
        if (isAdmin) {
            adminLoginBtn.classList.add('hidden');
            adminLogoutBtn.classList.remove('hidden');
            adminStatusIndicator.classList.remove('hidden');
        } else {
            adminLoginBtn.classList.remove('hidden');
            adminLogoutBtn.classList.add('hidden');
            adminStatusIndicator.classList.add('hidden');
        }
        renderPricingCards();
    }

    adminLoginBtn.addEventListener('click', () => {
        loginModalOverlay.classList.remove('hidden');
        loginError.classList.add('hidden');
        document.getElementById('password').value = '';
        setTimeout(() => document.getElementById('password').focus(), 100);
    });

    closeModalBtn.addEventListener('click', () => {
        loginModalOverlay.classList.add('hidden');
    });

    loginModalOverlay.addEventListener('click', (e) => {
        if (e.target === loginModalOverlay) {
            loginModalOverlay.classList.add('hidden');
        }
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pwd = document.getElementById('password').value;
        if (pwd === 'admin') {
            isAdmin = true;
            sessionStorage.setItem('isAdmin', 'true');
            loginModalOverlay.classList.add('hidden');
            updateAuthUI();
        } else {
            loginError.classList.remove('hidden');
        }
    });

    adminLogoutBtn.addEventListener('click', () => {
        isAdmin = false;
        sessionStorage.removeItem('isAdmin');
        updateAuthUI();
    });

    // --- Interactions & UI Updates ---
    
    // Hamburger Menu
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = hamburger.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.className = 'fa-solid fa-times';
        } else {
            icon.className = 'fa-solid fa-bars';
        }
    });

    // Close mobile menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.querySelector('i').className = 'fa-solid fa-bars';
        });
    });

    // Sticky Navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Contact Form
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = 'Sending...';
        btn.disabled = true;
        
        // Simulate network request
        setTimeout(() => {
            contactForm.reset();
            formFeedback.classList.remove('hidden');
            btn.innerText = originalText;
            btn.disabled = false;
            
            setTimeout(() => {
                formFeedback.classList.add('hidden');
            }, 3000);
        }, 1000);
    });

    // Set Copyright Year
    document.getElementById('year').innerText = new Date().getFullYear();

    // Scroll Animations (Intersection Observer)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once visible if you only want it to animate once
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-up, .fade-in-left, .fade-in-right, .scale-in');
    animatedElements.forEach(el => observer.observe(el));

    // --- Init ---
    updateAuthUI(); // Will render cards initially

});
