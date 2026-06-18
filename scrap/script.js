document.addEventListener('DOMContentLoaded', () => {

    // --- State & Data Management ---
    const scrapItems = [
        { id: 'iron', name: 'Iron', category: 'major scrap', image: 'iron.png' },
        { id: 'copper', name: 'Copper', category: 'major scrap', image: 'copper.png' },
        { id: 'brass', name: 'Brass', category: 'major scrap', image: 'brass.png' },
        { id: 'chamber', name: 'Chamber', category: 'major scrap', image: 'chamber.png' },
        { id: 'aluminium', name: 'Aluminium', category: 'major scrap', image: 'aluminium.png' },
        { id: 'steel', name: 'Steel', category: 'major scrap', image: 'steel.png' }
    ];

    // --- Theme Management ---
    const themeToggle = document.getElementById('theme-toggle');
    const themePicker = document.querySelector('.theme-picker');
    const themeOptions = document.querySelectorAll('.theme-option');
    const htmlEl = document.documentElement;
    const themeIcons = {
        dark: 'fa-moon',
        light: 'fa-sun',
        cyberpunk: 'fa-bolt',
        ocean: 'fa-water',
        sunrise: 'fa-cloud-sun',
        nova: 'fa-star'
    };
    const validThemes = Object.keys(themeIcons);
    let currentTheme = localStorage.getItem('hs_theme') || 'light';
    if(!validThemes.includes(currentTheme)) currentTheme = 'light';
    applyTheme(currentTheme);

    themeToggle.addEventListener('click', () => {
        const isOpen = themePicker.classList.toggle('open');
        themeToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            applyTheme(option.dataset.themeChoice);
            themePicker.classList.remove('open');
            themeToggle.setAttribute('aria-expanded', 'false');
        });
    });

    document.addEventListener('click', (event) => {
        if(!themePicker.contains(event.target)) {
            themePicker.classList.remove('open');
            themeToggle.setAttribute('aria-expanded', 'false');
        }
    });

    document.addEventListener('keydown', (event) => {
        if(event.key === 'Escape') {
            themePicker.classList.remove('open');
            themeToggle.setAttribute('aria-expanded', 'false');
        }
    });

    function applyTheme(theme) {
        currentTheme = validThemes.includes(theme) ? theme : 'light';
        htmlEl.setAttribute('data-theme', currentTheme);
        localStorage.setItem('hs_theme', currentTheme);
        updateThemeIcon();
        updateThemeMenu();
    }

    function updateThemeIcon() {
        themeToggle.innerHTML = `<i class="fa-solid ${themeIcons[currentTheme]}"></i>`;
    }

    function updateThemeMenu() {
        themeOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.themeChoice === currentTheme);
        });
    }

    // --- Loading Screen ---
    setTimeout(() => {
        const loader = document.getElementById('loader');
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 500);
        
        // Init GSAP after loader is gone
        initGSAP();
        initSwiper();
        animateNumbers();
    }, 1000); // Artificial delay for premium feel

    // --- UI Rendering ---
    
    // Ticker
    const tickerWrap = document.getElementById('market-ticker');
    function renderTicker() {
        let html = '';
        scrapItems.forEach(item => {
            html += `<div class="ticker-item"><span>${item.name}</span> ${item.category}</div>`;
        });
        // Duplicate for seamless loop
        tickerWrap.innerHTML = html + html;
    }
    renderTicker();

    // Pricing Grid & Filters
    const pricingGrid = document.getElementById('pricing-grid');
    function renderPricing() {
        pricingGrid.innerHTML = '';
        
        scrapItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'material-card glass-panel gsap-scale-in';
            // Simple inline style to bypass GSAP initial state if rendering after load
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';

            card.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="material-card-img">
                <div class="material-card-body">
                    <div class="material-card-category">${item.category}</div>
                    <h3>${item.name}</h3>
                </div>
            `;
            pricingGrid.appendChild(card);
        });
    }
    renderPricing();

    // Booking Form
    const bookingForm = document.getElementById('booking-form');
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('book-name').value;
        const phone = document.getElementById('book-phone').value;
        const address = document.getElementById('book-address').value;
        const date = document.getElementById('book-date').value;
        const weight = document.getElementById('book-est-weight').value || 'Not specified';

        const msg = `*New Pickup Request*\n\n*Name:* ${name}\n*Phone:* ${phone}\n*Address:* ${address}\n*Date:* ${date}\n*Est. Weight:* ${weight} kg\n\n_Sent via Hanuman Scraps Website_`;
        const waUrl = `https://wa.me/919014016066?text=${encodeURIComponent(msg)}`;
        window.open(waUrl, '_blank');
        bookingForm.reset();
    });

    // --- Third-Party Inits ---

    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if(window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });

    // Mobile Menu
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = hamburger.querySelector('i');
        icon.className = navLinks.classList.contains('active') ? 'fa-solid fa-times' : 'fa-solid fa-bars';
    });
    navLinks.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.querySelector('i').className = 'fa-solid fa-bars';
    }));

    // Swiper
    function initSwiper() {
        if(typeof Swiper !== 'undefined') {
            new Swiper('.testimonial-swiper', {
                slidesPerView: 1,
                spaceBetween: 30,
                pagination: { el: '.swiper-pagination', clickable: true },
                breakpoints: {
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 }
                }
            });
        }
    }

    // GSAP Animations
    function initGSAP() {
        if(typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);

            // Hero shapes floating
            gsap.to('.s1', { y: -30, x: 20, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" });
            gsap.to('.s2', { y: 40, x: -20, duration: 5, repeat: -1, yoyo: true, ease: "sine.inOut" });

            // Fade Ups
            gsap.utils.toArray('.gsap-fade-up').forEach(elem => {
                gsap.to(elem, {
                    scrollTrigger: { trigger: elem, start: "top 85%" },
                    y: 0, opacity: 1, duration: 0.8, ease: "power3.out"
                });
            });

            // Fade Left/Right
            gsap.utils.toArray('.gsap-fade-left').forEach(elem => {
                gsap.to(elem, {
                    scrollTrigger: { trigger: elem, start: "top 85%" },
                    x: 0, opacity: 1, duration: 0.8, ease: "power3.out"
                });
            });
            gsap.utils.toArray('.gsap-fade-right').forEach(elem => {
                gsap.to(elem, {
                    scrollTrigger: { trigger: elem, start: "top 85%" },
                    x: 0, opacity: 1, duration: 0.8, ease: "power3.out"
                });
            });

            // Staggered Scale In
            gsap.utils.toArray('.gsap-scale-in').forEach(elem => {
                gsap.to(elem, {
                    scrollTrigger: { trigger: elem, start: "top 90%" },
                    scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)"
                });
            });
        }
    }

    // Number Counter Animation
    function animateNumbers() {
        const nums = document.querySelectorAll('.stat-num');
        nums.forEach(num => {
            const target = parseInt(num.getAttribute('data-target'));
            let current = 0;
            const inc = target / 50; // speed
            const updateCounter = () => {
                current += inc;
                if(current < target) {
                    num.innerText = Math.ceil(current).toLocaleString();
                    setTimeout(updateCounter, 30);
                } else {
                    num.innerText = target.toLocaleString();
                }
            };
            // Use IntersectionObserver to trigger once visible
            const obs = new IntersectionObserver((entries) => {
                if(entries[0].isIntersecting) {
                    updateCounter();
                    obs.disconnect();
                }
            });
            obs.observe(num);
        });
    }

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(i => i.classList.remove('active'));
            if(!isActive) item.classList.add('active');
        });
    });

});
