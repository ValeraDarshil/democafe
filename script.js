/* ===================================================================
   Cielo — Scroll-Based Frame Animation & Interactions
   =================================================================== */

(function () {
    'use strict';

    /* ----------------------------------------------------------
       1. Frame Animation Setup
    ---------------------------------------------------------- */
    const TOTAL_FRAMES = 300;
    const canvas = document.getElementById('heroCanvas');
    const ctx = canvas.getContext('2d');
    const heroContainer = document.querySelector('.hero-scroll-container');
    const progressBar = document.getElementById('heroProgressBar');
    const heroContent = document.querySelector('.hero-content');
    const scrollHint = document.querySelector('.hero-scroll-hint');

    const frames = [];
    let loadedCount = 0;
    let currentFrame = 0;       // smoothly interpolated (float)
    let targetFrame = 0;        // exact frame from scroll position
    let lastDrawnFrame = -1;    // last integer frame drawn to canvas
    const LERP_SPEED = 0.08;    // smoothing factor (lower = smoother/slower)

    // Build frame path
    function framePath(index) {
        const num = String(index + 1).padStart(3, '0');
        return `frames/ezgif-frame-${num}.png`;
    }

    // Pre-load all frames
    function preloadFrames() {
        return new Promise((resolve) => {
            for (let i = 0; i < TOTAL_FRAMES; i++) {
                const img = new Image();
                img.src = framePath(i);
                img.onload = img.onerror = () => {
                    loadedCount++;
                    if (loadedCount === TOTAL_FRAMES) {
                        resolve();
                    }
                };
                frames[i] = img;
            }
        });
    }

    // Resize canvas to window
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawFrame(Math.round(currentFrame));
    }

    // Draw a specific frame - cover the canvas while preserving aspect ratio
    function drawFrame(index) {
        if (index === lastDrawnFrame) return;
        if (!frames[index] || !frames[index].complete || frames[index].naturalWidth === 0) return;

        const img = frames[index];
        const cw = canvas.width;
        const ch = canvas.height;
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;

        // "Cover" behavior
        const scale = Math.max(cw / iw, ch / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        const dx = (cw - dw) / 2;
        const dy = (ch - dh) / 2;

        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(img, dx, dy, dw, dh);
        lastDrawnFrame = index;
    }

    /* ----------------------------------------------------------
       2. Smooth Render Loop (lerp-based)
    ---------------------------------------------------------- */
    function renderLoop() {
        // Smoothly interpolate toward target frame
        const diff = targetFrame - currentFrame;
        if (Math.abs(diff) > 0.1) {
            currentFrame += diff * LERP_SPEED;
        } else {
            currentFrame = targetFrame;
        }

        const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(currentFrame)));
        drawFrame(frameIndex);

        requestAnimationFrame(renderLoop);
    }

    /* ----------------------------------------------------------
       2b. Scroll Handler (sets target, doesn't draw directly)
    ---------------------------------------------------------- */
    function onScroll() {
        const rect = heroContainer.getBoundingClientRect();
        const scrollableHeight = heroContainer.offsetHeight - window.innerHeight;
        const scrolled = -rect.top;
        const progress = Math.max(0, Math.min(1, scrolled / scrollableHeight));

        // Set target frame — the render loop will smoothly animate to it
        targetFrame = Math.min(TOTAL_FRAMES - 1, progress * (TOTAL_FRAMES - 1));

        // Update progress bar
        progressBar.style.width = (progress * 100) + '%';

        // Fade hero content as user scrolls
        const contentFade = Math.max(0, 1 - progress * 3);
        heroContent.style.opacity = contentFade;
        heroContent.style.transform = `translateY(${progress * 60}px)`;

        // Hide scroll hint
        if (scrollHint) {
            scrollHint.style.opacity = Math.max(0, 1 - progress * 8);
        }
    }

    /* ----------------------------------------------------------
       3. Reveal Animations (Intersection Observer)
    ---------------------------------------------------------- */
    function setupRevealAnimations() {
        const reveals = document.querySelectorAll('.reveal');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px'
        });

        reveals.forEach((el) => observer.observe(el));
    }

    /* ----------------------------------------------------------
       4. Navbar
    ---------------------------------------------------------- */
    function setupNavbar() {
        const navbar = document.getElementById('navbar');
        const toggle = document.getElementById('navToggle');
        const links = document.getElementById('navLinks');

        // Scroll class
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 60);
        }, { passive: true });

        // Mobile toggle
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            links.classList.toggle('active');
        });

        // Close on link click
        links.querySelectorAll('a').forEach((a) => {
            a.addEventListener('click', () => {
                toggle.classList.remove('active');
                links.classList.remove('active');
            });
        });
    }

    /* ----------------------------------------------------------
       5. Smooth Scroll for Nav Links
    ---------------------------------------------------------- */
    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (!href || href === '#') return;
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offset = 80;
                    const top = target.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            });
        });
    }

    /* ----------------------------------------------------------
       6. Loading Screen
    ---------------------------------------------------------- */
    function createLoadingScreen() {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">Loading experience...</div>
        `;
        document.body.prepend(overlay);
        return overlay;
    }

    /* ----------------------------------------------------------
       Menu Flipbook (StPageFlip)
    ---------------------------------------------------------- */
    function setupFlipbook() {
        const flipbookEl = document.getElementById('flipbook');
        if (!flipbookEl || typeof St === 'undefined') return;

        const pageFlip = new St.PageFlip(flipbookEl, {
            width: 380,
            height: 540,
            size: 'fixed',
            maxShadowOpacity: 0.5,
            showCover: true,
            mobileScrollSupport: false,
            flippingTime: 1000,
            useMouseEvents: true,
            swipeDistance: 30,
            showPageCorners: true,
            disableFlipByClick: false
        });

        pageFlip.loadFromHTML(document.querySelectorAll('.menu-page'));

        const prevBtn = document.getElementById('flipPrev');
        const nextBtn = document.getElementById('flipNext');
        const pageInfo = document.getElementById('flipPageInfo');

        function updatePageInfo() {
            const current = pageFlip.getCurrentPageIndex() + 1;
            const total = pageFlip.getPageCount();
            if (pageInfo) pageInfo.textContent = current + ' / ' + total;
        }

        if (prevBtn) prevBtn.addEventListener('click', () => pageFlip.flipPrev());
        if (nextBtn) nextBtn.addEventListener('click', () => pageFlip.flipNext());
        pageFlip.on('flip', updatePageInfo);
        updatePageInfo();
    }

    /* ----------------------------------------------------------
       7. Init
    ---------------------------------------------------------- */
    async function init() {
        const loader = createLoadingScreen();

        // Setup canvas
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Load frames
        await preloadFrames();

        // Draw first frame and start smooth render loop
        drawFrame(0);
        renderLoop();

        // Remove loader
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 600);

        // Setup scroll listener
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // Initial call

        // Setup other features
        setupRevealAnimations();
        setupNavbar();
        setupSmoothScroll();
        setupFlipbook();
        setupReservation();
    }

    /* ----------------------------------------------------------
       Reservation Modal & EmailJS
    ---------------------------------------------------------- */
    function setupReservation() {
        const modal = document.getElementById('reservationModal');
        const openBtn = document.getElementById('reserveBtn');
        const closeBtn = document.getElementById('modalClose');
        const form = document.getElementById('reservationForm');
        const submitBtn = document.getElementById('formSubmit');
        const successEl = document.getElementById('modalSuccess');
        const errorEl = document.getElementById('modalError');
        const successCloseBtn = document.getElementById('successCloseBtn');
        const errorRetryBtn = document.getElementById('errorRetryBtn');

        if (!modal || !openBtn) return;

        // Set min date to today
        const dateInput = document.getElementById('resDate');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.setAttribute('min', today);
        }

        // ═══════════ EmailJS Config ═══════════
        const EMAILJS_PUBLIC_KEY = 'V7a1G-fJ-i4uwK2Qr';
        const EMAILJS_SERVICE_ID = 'service_z2nduaw';
        const EMAILJS_OWNER_TEMPLATE = 'template_93kbf0m';
        const EMAILJS_CUSTOMER_TEMPLATE = 'template_hs4lrz5';

        // Initialize EmailJS
        if (typeof emailjs !== 'undefined') {
            emailjs.init(EMAILJS_PUBLIC_KEY);
        }

        // Open modal
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        // Close modal
        function closeModal() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }

        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
        });

        // Success/Error close buttons
        if (successCloseBtn) successCloseBtn.addEventListener('click', closeModal);
        if (errorRetryBtn) {
            errorRetryBtn.addEventListener('click', () => {
                errorEl.style.display = 'none';
                form.style.display = 'flex';
            });
        }

        // Reset modal content on close transition end
        modal.addEventListener('transitionend', () => {
            if (!modal.classList.contains('active')) {
                form.style.display = 'flex';
                form.reset();
                successEl.style.display = 'none';
                errorEl.style.display = 'none';
                submitBtn.classList.remove('loading');
            }
        });

        // Form submit
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                name: document.getElementById('resName').value.trim(),
                email: document.getElementById('resEmail').value.trim(),
                phone: document.getElementById('resPhone').value.trim(),
                guests: document.getElementById('resGuests').value,
                date: document.getElementById('resDate').value,
                time: document.getElementById('resTime').value,
                message: document.getElementById('resMessage').value.trim() || 'None'
            };

            // Format date nicely
            const dateObj = new Date(data.date + 'T00:00:00');
            data.formatted_date = dateObj.toLocaleDateString('en-IN', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });

            // Format time to 12h
            const [h, m] = data.time.split(':');
            const ampm = parseInt(h) >= 12 ? 'PM' : 'AM';
            data.formatted_time = ((parseInt(h) % 12) || 12) + ':' + m + ' ' + ampm;

            submitBtn.classList.add('loading');

            try {
                if (typeof emailjs === 'undefined') {
                    throw new Error('EmailJS library not loaded');
                }

                // Send owner notification
                console.log('Sending owner email...');
                await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_OWNER_TEMPLATE, data);
                console.log('Owner email sent ✓');

                // Send customer confirmation
                console.log('Sending customer email to:', data.email);
                await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_CUSTOMER_TEMPLATE, data);
                console.log('Customer email sent ✓');

                // Show success
                form.style.display = 'none';
                successEl.style.display = 'block';
            } catch (err) {
                console.error('EmailJS Error:', err);
                console.error('Error details:', JSON.stringify(err));
                form.style.display = 'none';
                errorEl.style.display = 'block';
            } finally {
                submitBtn.classList.remove('loading');
            }
        });
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
