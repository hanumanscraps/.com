document.addEventListener('DOMContentLoaded', () => {

    // --- State & Data Management ---
    const defaultPrices = [
        { id: 'iron', name: 'Iron', category: 'metal', price: 25, unit: 'kg', image: 'iron.png' },
        { id: 'steel', name: 'Steel', category: 'metal', price: 40, unit: 'kg', image: 'steel.png' },
        { id: 'copper', name: 'Copper', category: 'metal', price: 650, unit: 'kg', image: 'copper.png' },
        { id: 'plastic', name: 'Mixed Plastic', category: 'plastic', price: 15, unit: 'kg', image: 'plastic.png' },
        { id: 'paper', name: 'Paper/Cardboard', category: 'paper', price: 12, unit: 'kg', image: 'paper.png' },
        { id: 'ewaste', name: 'E-Waste (General)', category: 'ewaste', price: 150, unit: 'kg', image: 'ewaste.png' }
    ];

    const defaultMarketplace = [
        { id: 'mp1', title: 'Sorted Iron Scrap', price: 30, qty: '500kg', image: 'iron.png' },
        { id: 'mp2', title: 'Industrial Copper Wires', price: 680, qty: '50kg', image: 'copper.png' }
    ];

    let pricesData = JSON.parse(localStorage.getItem('hs_prices_v4')) || defaultPrices;
    let marketData = JSON.parse(localStorage.getItem('hs_market_v4')) || defaultMarketplace;
    let isAdmin = sessionStorage.getItem('hs_admin') === 'true';

    function saveData() {
        localStorage.setItem('hs_prices_v4', JSON.stringify(pricesData));
        localStorage.setItem('hs_market_v4', JSON.stringify(marketData));
    }

    // Ensure fallback images if missing or outdated SVG
    pricesData = pricesData.map(p => {
        if(!p.image || p.image === 'ewaste.svg') {
            const dp = defaultPrices.find(d => d.id === p.id);
            p.image = dp ? dp.image : 'iron.png';
        }
        return p;
    });
    saveData();

    // --- Theme Management ---
    const themeToggle = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;
    let currentTheme = localStorage.getItem('hs_theme') || 'dark';
    htmlEl.setAttribute('data-theme', currentTheme);
    updateThemeIcon();

    themeToggle.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        htmlEl.setAttribute('data-theme', currentTheme);
        localStorage.setItem('hs_theme', currentTheme);
        updateThemeIcon();
    });

    function updateThemeIcon() {
        themeToggle.innerHTML = currentTheme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
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
        pricesData.forEach(item => {
            // randomly assign trend for visual effect
            const trend = Math.random() > 0.5 ? '<i class="fa-solid fa-caret-up trend-up"></i>' : '<i class="fa-solid fa-caret-down trend-down"></i>';
            html += `<div class="ticker-item"><span>${item.name}:</span> ₹${item.price}/${item.unit} ${trend}</div>`;
        });
        // Duplicate for seamless loop
        tickerWrap.innerHTML = html + html;
    }
    renderTicker();

    // Pricing Grid & Filters
    const pricingGrid = document.getElementById('pricing-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    function renderPricing(filter = 'all') {
        pricingGrid.innerHTML = '';
        const filtered = filter === 'all' ? pricesData : pricesData.filter(p => p.category === filter);
        
        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = 'price-card glass-panel gsap-scale-in';
            // Simple inline style to bypass GSAP initial state if rendering after load
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';

            card.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="price-card-img">
                <div class="price-card-body">
                    <div class="price-card-category">${item.category}</div>
                    <h3>${item.name}</h3>
                    <div class="price-value">
                        <span class="price-currency">₹</span><span class="price-num-${item.id}">${item.price}</span><span class="price-unit">/${item.unit}</span>
                    </div>
                </div>
            `;
            pricingGrid.appendChild(card);
        });
    }
    renderPricing();

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderPricing(e.target.dataset.filter);
        });
    });

    // Marketplace Grid
    const marketGrid = document.getElementById('marketplace-grid');
    function renderMarketplace() {
        marketGrid.innerHTML = '';
        if (marketData.length === 0) {
            marketGrid.innerHTML = '<p class="text-muted">No items available currently.</p>';
            return;
        }
        marketData.forEach(item => {
            const subject = encodeURIComponent(`Inquiry About ${item.title}`);
            const body = encodeURIComponent(`Hello Hanuman Scraps,

I would like to inquire about the scrap material:

Product Name: ${item.title}
Quantity: ${item.qty}

Please share more details regarding pricing and availability.

Thank you.`);

            const card = document.createElement('div');
            card.className = 'mp-card glass-panel';
            card.innerHTML = `
                <img src="${item.image}" alt="${item.title}" class="mp-card-img">
                <div class="mp-card-body">
                    <h3>${item.title}</h3>
                    <div class="mp-qty">Qty: ${item.qty}</div>
                    <div class="mp-price">₹${item.price}</div>
                    <a href="mailto:hanumanscraps@gmail.com?subject=${subject}&body=${body}" class="btn btn-outline btn-block">Inquire Now</a>
                </div>
            `;
            marketGrid.appendChild(card);
        });
    }
    renderMarketplace();

    // Calculator
    const calcMaterial = document.getElementById('calc-material');
    const calcWeight = document.getElementById('calc-weight');
    const calcTotal = document.getElementById('calc-total');

    function populateCalcSelect() {
        calcMaterial.innerHTML = '<option value="" disabled selected>Select Material</option>';
        pricesData.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.price;
            opt.textContent = `${p.name} (₹${p.price}/${p.unit})`;
            calcMaterial.appendChild(opt);
        });
    }
    populateCalcSelect();

    function updateCalc() {
        const price = parseFloat(calcMaterial.value) || 0;
        const weight = parseFloat(calcWeight.value) || 0;
        calcTotal.innerText = (price * weight).toLocaleString();
    }
    calcMaterial.addEventListener('change', updateCalc);
    calcWeight.addEventListener('input', updateCalc);

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

    // --- Admin Dashboard Logic ---
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminDashBtn = document.getElementById('admin-dash-btn');
    const loginModal = document.getElementById('login-modal');
    const dashModal = document.getElementById('admin-dashboard-modal');
    
    // Auth UI Update
    function updateAuthUI() {
        if(isAdmin) {
            adminLoginBtn.classList.add('hidden');
            adminDashBtn.classList.remove('hidden');
            renderAdminDashboard();
        } else {
            adminLoginBtn.classList.remove('hidden');
            adminDashBtn.classList.add('hidden');
        }
    }
    updateAuthUI();

    // Login logic
    adminLoginBtn.addEventListener('click', () => loginModal.classList.remove('hidden'));
    document.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', () => loginModal.classList.add('hidden')));
    
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('admin-user').value;
        const pass = document.getElementById('admin-pass').value;
        if(user === 'admin' && pass === 'admin') {
            isAdmin = true;
            sessionStorage.setItem('hs_admin', 'true');
            loginModal.classList.add('hidden');
            updateAuthUI();
        } else {
            document.getElementById('login-error').classList.remove('hidden');
        }
    });

    // Dashboard Modal Logic
    adminDashBtn.addEventListener('click', () => dashModal.classList.remove('hidden'));
    document.querySelectorAll('.close-dash').forEach(btn => btn.addEventListener('click', () => dashModal.classList.add('hidden')));

    document.getElementById('admin-logout-btn').addEventListener('click', () => {
        isAdmin = false;
        sessionStorage.removeItem('hs_admin');
        dashModal.classList.add('hidden');
        updateAuthUI();
    });

    // Tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.add('hidden'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            e.target.classList.add('active');
            const targetId = e.target.dataset.tab;
            const targetTab = document.getElementById(targetId);
            targetTab.classList.remove('hidden');
            targetTab.classList.add('active');
        });
    });

    // Render Admin Lists
    function renderAdminDashboard() {
        // Prices List
        const priceList = document.getElementById('admin-price-list');
        priceList.innerHTML = '';
        pricesData.forEach((item, index) => {
            priceList.innerHTML += `
                <div class="admin-list-item">
                    <div class="item-info">
                        <img src="${item.image}" alt="">
                        <div>
                            <strong>${item.name}</strong>
                            <div class="text-muted" style="font-size:0.8rem">Current: ₹${item.price}</div>
                        </div>
                    </div>
                    <div class="item-actions">
                        ₹ <input type="number" id="admin-price-${item.id}" value="${item.price}" class="price-input-small">
                        <button class="btn btn-primary btn-sm" onclick="updatePrice('${item.id}')"><i class="fa-solid fa-save"></i></button>
                    </div>
                </div>
            `;
        });

        // Market List
        const adminMarketList = document.getElementById('admin-marketplace-list');
        adminMarketList.innerHTML = '';
        marketData.forEach(item => {
            adminMarketList.innerHTML += `
                <div class="admin-list-item">
                    <div class="item-info">
                        <img src="${item.image}" alt="">
                        <div>
                            <strong>${item.title}</strong>
                            <div class="text-muted" style="font-size:0.8rem">₹${item.price} | ${item.qty}</div>
                        </div>
                    </div>
                    <button class="btn btn-outline btn-sm" style="color:var(--primary);border-color:var(--primary)" onclick="deleteMarketItem('${item.id}')"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
        });
    }

    // Global func for updating price
    window.updatePrice = (id) => {
        const input = document.getElementById(`admin-price-${id}`);
        const newPrice = parseFloat(input.value);
        if(!isNaN(newPrice) && newPrice > 0) {
            const idx = pricesData.findIndex(p => p.id === id);
            if(idx > -1) {
                pricesData[idx].price = newPrice;
                saveData();
                renderPricing();
                populateCalcSelect();
                renderTicker();
                alert('Price updated successfully!');
            }
        }
    };

    // Add Marketplace Item with Image Base64
    document.getElementById('add-marketplace-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('mp-title').value;
        const price = document.getElementById('mp-price').value;
        const qty = document.getElementById('mp-qty').value;
        const fileInput = document.getElementById('mp-image');
        const file = fileInput.files[0];

        if(file) {
            // Check size < 500kb approx
            if(file.size > 500000) {
                alert("File is too large! Please upload an image smaller than 500KB to save in LocalStorage.");
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                const base64Img = event.target.result;
                const newItem = {
                    id: 'mp_' + Date.now(),
                    title,
                    price,
                    qty,
                    image: base64Img
                };
                marketData.push(newItem);
                saveData();
                renderAdminDashboard();
                renderMarketplace();
                document.getElementById('add-marketplace-form').reset();
            };
            reader.readAsDataURL(file);
        }
    });

    window.deleteMarketItem = (id) => {
        if(confirm('Are you sure you want to remove this item?')) {
            marketData = marketData.filter(item => item.id !== id);
            saveData();
            renderAdminDashboard();
            renderMarketplace();
        }
    };

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
