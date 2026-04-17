// /* ===================================================================
//    Cielo — Scroll-Based Frame Animation & Interactions
//    =================================================================== */

// (function () {
//     'use strict';

//     /* ----------------------------------------------------------
//        1. Frame Animation Setup
//     ---------------------------------------------------------- */
//     const TOTAL_FRAMES = 300;
//     const canvas = document.getElementById('heroCanvas');
//     const ctx = canvas.getContext('2d');
//     const heroContainer = document.querySelector('.hero-scroll-container');
//     const progressBar = document.getElementById('heroProgressBar');
//     const heroContent = document.querySelector('.hero-content');
//     const scrollHint = document.querySelector('.hero-scroll-hint');

//     const frames = [];
//     let loadedCount = 0;
//     let currentFrame = 0;       // smoothly interpolated (float)
//     let targetFrame = 0;        // exact frame from scroll position
//     let lastDrawnFrame = -1;    // last integer frame drawn to canvas
//     const LERP_SPEED = 0.08;    // smoothing factor (lower = smoother/slower)

//     // Build frame path
//     function framePath(index) {
//         const num = String(index + 1).padStart(3, '0');
//         return `frames/ezgif-frame-${num}.png`;
//     }

//     // Pre-load all frames
//     function preloadFrames() {
//         return new Promise((resolve) => {
//             for (let i = 0; i < TOTAL_FRAMES; i++) {
//                 const img = new Image();
//                 img.src = framePath(i);
//                 img.onload = img.onerror = () => {
//                     loadedCount++;
//                     if (loadedCount === TOTAL_FRAMES) {
//                         resolve();
//                     }
//                 };
//                 frames[i] = img;
//             }
//         });
//     }

//     // Resize canvas to window
//     function resizeCanvas() {
//         canvas.width = window.innerWidth;
//         canvas.height = window.innerHeight;
//         drawFrame(Math.round(currentFrame));
//     }

//     // Draw a specific frame - cover the canvas while preserving aspect ratio
//     function drawFrame(index) {
//         if (index === lastDrawnFrame) return;
//         if (!frames[index] || !frames[index].complete || frames[index].naturalWidth === 0) return;

//         const img = frames[index];
//         const cw = canvas.width;
//         const ch = canvas.height;
//         const iw = img.naturalWidth;
//         const ih = img.naturalHeight;

//         // "Cover" behavior
//         const scale = Math.max(cw / iw, ch / ih);
//         const dw = iw * scale;
//         const dh = ih * scale;
//         const dx = (cw - dw) / 2;
//         const dy = (ch - dh) / 2;

//         ctx.clearRect(0, 0, cw, ch);
//         ctx.drawImage(img, dx, dy, dw, dh);
//         lastDrawnFrame = index;
//     }

//     /* ----------------------------------------------------------
//        2. Smooth Render Loop (lerp-based)
//     ---------------------------------------------------------- */
//     function renderLoop() {
//         // Smoothly interpolate toward target frame
//         const diff = targetFrame - currentFrame;
//         if (Math.abs(diff) > 0.1) {
//             currentFrame += diff * LERP_SPEED;
//         } else {
//             currentFrame = targetFrame;
//         }

//         const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(currentFrame)));
//         drawFrame(frameIndex);

//         requestAnimationFrame(renderLoop);
//     }

//     /* ----------------------------------------------------------
//        2b. Scroll Handler (sets target, doesn't draw directly)
//     ---------------------------------------------------------- */
//     function onScroll() {
//         const rect = heroContainer.getBoundingClientRect();
//         const scrollableHeight = heroContainer.offsetHeight - window.innerHeight;
//         const scrolled = -rect.top;
//         const progress = Math.max(0, Math.min(1, scrolled / scrollableHeight));

//         // Set target frame — the render loop will smoothly animate to it
//         targetFrame = Math.min(TOTAL_FRAMES - 1, progress * (TOTAL_FRAMES - 1));

//         // Update progress bar
//         progressBar.style.width = (progress * 100) + '%';

//         // Fade hero content as user scrolls
//         const contentFade = Math.max(0, 1 - progress * 3);
//         heroContent.style.opacity = contentFade;
//         heroContent.style.transform = `translateY(${progress * 60}px)`;

//         // Hide scroll hint
//         if (scrollHint) {
//             scrollHint.style.opacity = Math.max(0, 1 - progress * 8);
//         }
//     }

//     /* ----------------------------------------------------------
//        3. Reveal Animations (Intersection Observer)
//     ---------------------------------------------------------- */
//     function setupRevealAnimations() {
//         const reveals = document.querySelectorAll('.reveal');
//         const observer = new IntersectionObserver((entries) => {
//             entries.forEach((entry) => {
//                 if (entry.isIntersecting) {
//                     entry.target.classList.add('visible');
//                     observer.unobserve(entry.target);
//                 }
//             });
//         }, {
//             threshold: 0.15,
//             rootMargin: '0px 0px -40px 0px'
//         });

//         reveals.forEach((el) => observer.observe(el));
//     }

//     /* ----------------------------------------------------------
//        4. Navbar
//     ---------------------------------------------------------- */
//     function setupNavbar() {
//         const navbar = document.getElementById('navbar');
//         const toggle = document.getElementById('navToggle');
//         const links = document.getElementById('navLinks');

//         // Scroll class
//         window.addEventListener('scroll', () => {
//             navbar.classList.toggle('scrolled', window.scrollY > 60);
//         }, { passive: true });

//         // Mobile toggle
//         toggle.addEventListener('click', () => {
//             toggle.classList.toggle('active');
//             links.classList.toggle('active');
//         });

//         // Close on link click
//         links.querySelectorAll('a').forEach((a) => {
//             a.addEventListener('click', () => {
//                 toggle.classList.remove('active');
//                 links.classList.remove('active');
//             });
//         });
//     }

//     /* ----------------------------------------------------------
//        5. Smooth Scroll for Nav Links
//     ---------------------------------------------------------- */
//     function setupSmoothScroll() {
//         document.querySelectorAll('a[href^="#"]').forEach((link) => {
//             link.addEventListener('click', (e) => {
//                 const href = link.getAttribute('href');
//                 if (!href || href === '#') return;
//                 e.preventDefault();
//                 const target = document.querySelector(href);
//                 if (target) {
//                     const offset = 80;
//                     const top = target.getBoundingClientRect().top + window.scrollY - offset;
//                     window.scrollTo({ top, behavior: 'smooth' });
//                 }
//             });
//         });
//     }

//     /* ----------------------------------------------------------
//        6. Loading Screen
//     ---------------------------------------------------------- */
//     function createLoadingScreen() {
//         const overlay = document.createElement('div');
//         overlay.className = 'loading-overlay';
//         overlay.innerHTML = `
//             <div class="loading-spinner"></div>
//             <div class="loading-text">Loading experience...</div>
//         `;
//         document.body.prepend(overlay);
//         return overlay;
//     }

//     /* ----------------------------------------------------------
//        Menu Flipbook (StPageFlip)
//     ---------------------------------------------------------- */
//     function setupFlipbook() {
//         const flipbookEl = document.getElementById('flipbook');
//         if (!flipbookEl || typeof St === 'undefined') return;

//         const pageFlip = new St.PageFlip(flipbookEl, {
//             width: 380,
//             height: 540,
//             size: 'fixed',
//             maxShadowOpacity: 0.5,
//             showCover: true,
//             mobileScrollSupport: false,
//             flippingTime: 1000,
//             useMouseEvents: true,
//             swipeDistance: 30,
//             showPageCorners: true,
//             disableFlipByClick: false
//         });

//         pageFlip.loadFromHTML(document.querySelectorAll('.menu-page'));

//         const prevBtn = document.getElementById('flipPrev');
//         const nextBtn = document.getElementById('flipNext');
//         const pageInfo = document.getElementById('flipPageInfo');

//         function updatePageInfo() {
//             const current = pageFlip.getCurrentPageIndex() + 1;
//             const total = pageFlip.getPageCount();
//             if (pageInfo) pageInfo.textContent = current + ' / ' + total;
//         }

//         if (prevBtn) prevBtn.addEventListener('click', () => pageFlip.flipPrev());
//         if (nextBtn) nextBtn.addEventListener('click', () => pageFlip.flipNext());
//         pageFlip.on('flip', updatePageInfo);
//         updatePageInfo();
//     }

//     /* ----------------------------------------------------------
//        7. Init
//     ---------------------------------------------------------- */
//     async function init() {
//         const loader = createLoadingScreen();

//         // Setup canvas
//         resizeCanvas();
//         window.addEventListener('resize', resizeCanvas);

//         // Load frames
//         await preloadFrames();

//         // Draw first frame and start smooth render loop
//         drawFrame(0);
//         renderLoop();

//         // Remove loader
//         loader.classList.add('hidden');
//         setTimeout(() => loader.remove(), 600);

//         // Setup scroll listener
//         window.addEventListener('scroll', onScroll, { passive: true });
//         onScroll(); // Initial call

//         // Setup other features
//         setupRevealAnimations();
//         setupNavbar();
//         setupSmoothScroll();
//         setupFlipbook();
//         setupReservation();
//     }

//     /* ----------------------------------------------------------
//        Reservation Modal & EmailJS
//     ---------------------------------------------------------- */
//     function setupReservation() {
//         const modal = document.getElementById('reservationModal');
//         const openBtn = document.getElementById('reserveBtn');
//         const closeBtn = document.getElementById('modalClose');
//         const form = document.getElementById('reservationForm');
//         const submitBtn = document.getElementById('formSubmit');
//         const successEl = document.getElementById('modalSuccess');
//         const errorEl = document.getElementById('modalError');
//         const successCloseBtn = document.getElementById('successCloseBtn');
//         const errorRetryBtn = document.getElementById('errorRetryBtn');

//         if (!modal || !openBtn) return;

//         // Set min date to today
//         const dateInput = document.getElementById('resDate');
//         if (dateInput) {
//             const today = new Date().toISOString().split('T')[0];
//             dateInput.setAttribute('min', today);
//         }

//         // ═══════════ EmailJS Config ═══════════
//         const EMAILJS_PUBLIC_KEY = 'V7a1G-fJ-i4uwK2Qr';
//         const EMAILJS_SERVICE_ID = 'service_z2nduaw';
//         const EMAILJS_OWNER_TEMPLATE = 'template_93kbf0m';
//         const EMAILJS_CUSTOMER_TEMPLATE = 'template_hs4lrz5';

//         // Initialize EmailJS
//         if (typeof emailjs !== 'undefined') {
//             emailjs.init(EMAILJS_PUBLIC_KEY);
//         }

//         // Open modal
//         openBtn.addEventListener('click', (e) => {
//             e.preventDefault();
//             modal.classList.add('active');
//             document.body.style.overflow = 'hidden';
//         });

//         // Close modal
//         function closeModal() {
//             modal.classList.remove('active');
//             document.body.style.overflow = '';
//         }

//         closeBtn.addEventListener('click', closeModal);
//         modal.addEventListener('click', (e) => {
//             if (e.target === modal) closeModal();
//         });
//         document.addEventListener('keydown', (e) => {
//             if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
//         });

//         // Success/Error close buttons
//         if (successCloseBtn) successCloseBtn.addEventListener('click', closeModal);
//         if (errorRetryBtn) {
//             errorRetryBtn.addEventListener('click', () => {
//                 errorEl.style.display = 'none';
//                 form.style.display = 'flex';
//             });
//         }

//         // Reset modal content on close transition end
//         modal.addEventListener('transitionend', () => {
//             if (!modal.classList.contains('active')) {
//                 form.style.display = 'flex';
//                 form.reset();
//                 successEl.style.display = 'none';
//                 errorEl.style.display = 'none';
//                 submitBtn.classList.remove('loading');
//             }
//         });

//         // Form submit
//         form.addEventListener('submit', async (e) => {
//             e.preventDefault();

//             const data = {
//                 name: document.getElementById('resName').value.trim(),
//                 email: document.getElementById('resEmail').value.trim(),
//                 phone: document.getElementById('resPhone').value.trim(),
//                 guests: document.getElementById('resGuests').value,
//                 date: document.getElementById('resDate').value,
//                 time: document.getElementById('resTime').value,
//                 message: document.getElementById('resMessage').value.trim() || 'None'
//             };

//             // Format date nicely
//             const dateObj = new Date(data.date + 'T00:00:00');
//             data.formatted_date = dateObj.toLocaleDateString('en-IN', {
//                 weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
//             });

//             // Format time to 12h
//             const [h, m] = data.time.split(':');
//             const ampm = parseInt(h) >= 12 ? 'PM' : 'AM';
//             data.formatted_time = ((parseInt(h) % 12) || 12) + ':' + m + ' ' + ampm;

//             submitBtn.classList.add('loading');

//             try {
//                 if (typeof emailjs === 'undefined') {
//                     throw new Error('EmailJS library not loaded');
//                 }

//                 // Send owner notification
//                 console.log('Sending owner email...');
//                 await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_OWNER_TEMPLATE, data);
//                 console.log('Owner email sent ✓');

//                 // Send customer confirmation
//                 console.log('Sending customer email to:', data.email);
//                 await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_CUSTOMER_TEMPLATE, data);
//                 console.log('Customer email sent ✓');

//                 // Show success
//                 form.style.display = 'none';
//                 successEl.style.display = 'block';
//             } catch (err) {
//                 console.error('EmailJS Error:', err);
//                 console.error('Error details:', JSON.stringify(err));
//                 form.style.display = 'none';
//                 errorEl.style.display = 'block';
//             } finally {
//                 submitBtn.classList.remove('loading');
//             }
//         });
//     }

//     // Start
//     if (document.readyState === 'loading') {
//         document.addEventListener('DOMContentLoaded', init);
//     } else {
//         init();
//     }
// })();





// Mobiel ke liyeh yeh sirf testing hai baki upar wala perfectly working hai desktop ke liyeh
/* ===================================================================
   Cielo — Scroll-Based Frame Animation & Interactions
   =================================================================== */

(function () {
    'use strict';

    /* ----------------------------------------------------------
       0. Initialize Lenis Smooth Scroll
    ---------------------------------------------------------- */
    let lenis;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });
    }

    /* ----------------------------------------------------------
       1. Frame Animation Setup
    ---------------------------------------------------------- */
    const canvas = document.getElementById('heroCanvas');
    const ctx = canvas.getContext('2d');
    const heroContainer = document.querySelector('.hero-scroll-container');
    const progressBar = document.getElementById('heroProgressBar');
    const heroContent = document.querySelector('.hero-content');
    const scrollHint = document.querySelector('.hero-scroll-hint');

    // Detect mobile — width <= 768 OR touch device with width <= 1024
    const IS_MOBILE = (window.innerWidth <= 768) ||
                      ('ontouchstart' in window && window.innerWidth <= 1024);

    // Desktop has 300 frames in frames/, Mobile has 240 frames in frames-mobile/
    const TOTAL_FRAMES = IS_MOBILE ? 240 : 300;

    // Mobile gets frames-mobile/ (portrait 1080x1920)
    // Desktop gets frames/ (landscape 1280x720, lighter per frame)
    const FRAME_FOLDER = IS_MOBILE ? 'frames-mobile' : 'frames';

    const frames = [];
    let loadedCount = 0;
    let currentFrame = 0;       // smoothly interpolated (float)
    let targetFrame = 0;        // exact frame from scroll position
    let lastDrawnFrame = -1;    // last integer frame drawn to canvas
    const LERP_SPEED = 0.08;    // smoothing factor (lower = smoother/slower)

    // Build frame path — picks correct folder based on device
    function framePath(index) {
        const num = String(index + 1).padStart(3, '0');
        return `${FRAME_FOLDER}/ezgif-frame-${num}.png`;
    }

    /* ----------------------------------------------------------
       Progressive Loading (Original Proven Logic — Ultra Smooth)
       Phase 1: Load first 30 frames → remove loader → start animation
       Phase 2: Load remaining safely in background
    ---------------------------------------------------------- */
    function preloadFrames(onReady) {
        const INITIAL_BATCH = 30;
        let initialDone = false;

        return new Promise((resolveAll) => {
            let currentIndex = 0;
            const PARALLEL_DOWNLOADS = 6;

            function loadNext() {
                if (currentIndex >= TOTAL_FRAMES) return;
                const i = currentIndex++;
                const img = new Image();
                frames[i] = img;

                img.onload = img.onerror = () => {
                    loadedCount++;

                    // Phase 1 finished
                    if (!initialDone && loadedCount >= INITIAL_BATCH) {
                        initialDone = true;
                        onReady();
                    }

                    if (loadedCount === TOTAL_FRAMES) {
                        resolveAll();
                    } else {
                        loadNext();
                    }
                };

                img.src = framePath(i);
            }

            // Start worker pool
            for (let w = 0; w < PARALLEL_DOWNLOADS; w++) {
                loadNext();
            }
        });
    }

    // Resize canvas to window (with high DPR support)
    let lastClientWidth = 0;
    function resizeCanvas() {
        const lw = window.innerWidth;
        
        // Only ignore if it is mobile and scroll triggered vertical resize (URL bar hiding)
        if (IS_MOBILE && lastClientWidth === lw) return;
        lastClientWidth = lw;

        const dpr = window.devicePixelRatio || 1;
        const lh = window.innerHeight;

        canvas.width = lw * dpr;
        canvas.height = lh * dpr;
        canvas.style.width = lw + 'px';
        canvas.style.height = lh + 'px';

        lastDrawnFrame = -1; // force redraw on resize
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
       2. Smooth Render Loop (lerp-based + Lenis integration)
    ---------------------------------------------------------- */
    function renderLoop(time) {
        if (lenis) {
            lenis.raf(time);
        }

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
       6. Loading Screen with Premium Lottie Support
    ---------------------------------------------------------- */
    function createLoadingScreen() {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        
        // ----------------------------------------------------------------------
        // NOTE: Please place your downloaded .json file inside the main "Demo Cafe" 
        // folder and rename it to exactly "loader.json".
        // ----------------------------------------------------------------------
        overlay.innerHTML = `
            <lottie-player 
                class="lottie-loader"
                src="loader.json" 
                background="transparent" 
                speed="1" 
                loop 
                autoplay>
            </lottie-player>
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
       7. Init — Progressive loading strategy with Lottie sync
    ---------------------------------------------------------- */
    async function init() {
        const loader = createLoadingScreen();
        const player = loader.querySelector('lottie-player');

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        let framesReady = false;
        let animationReady = false;
        let isStarted = false; // Fix: Prevent multiple startup triggers!

        function startSite() {
            // Ensure we only start once, preventing exponential duplicates of renderLoop which causes severe lag
            if (framesReady && animationReady && !isStarted) {
                isStarted = true;
                drawFrame(0);
                requestAnimationFrame(renderLoop);

                loader.classList.add('hidden');
                setTimeout(() => loader.remove(), 600);

                window.addEventListener('scroll', onScroll, { passive: true });
                onScroll();

                setupRevealAnimations();
                setupNavbar();
                setupSmoothScroll();
                setupFlipbook();
                setupReservation();
                if (typeof setupMatchmaker === 'function') setupMatchmaker();
                if (typeof setupAudio === 'function') setupAudio();
            }
        }

        // Wait for at least one full animation loop to finish
        if (player) {
            player.addEventListener('loopComplete', () => {
                animationReady = true;
                startSite();
            });
            player.addEventListener('complete', () => {
                animationReady = true;
                startSite();
            });
            
            // Failsafe (in case the Lottie fails to load or parse, wait maximum 5s)
            setTimeout(() => {
                if (!animationReady) {
                    animationReady = true;
                    startSite();
                }
            }, 5000); 
        } else {
            animationReady = true;
        }

        // onReady fires after first 30 frames
        preloadFrames(() => {
            framesReady = true;
            startSite();
        });
        // Remaining 270 frames load silently in background
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

        // Initialize premium flatpickr dates
        flatpickr("#resDate", {
            minDate: "today",
            dateFormat: "Y-m-d",
            disableMobile: "true" // Keep premium dark picker even on mobile
        });
        
        flatpickr("#resTime", {
            enableTime: true,
            noCalendar: true,
            dateFormat: "H:i",
            time_24hr: false,
            disableMobile: "true"
        });

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

    /* ----------------------------------------------------------
       Beverage Matchmaker Logic
    ---------------------------------------------------------- */
    function setupMatchmaker() {
        const filters = document.querySelectorAll('.filter-btn');
        const cards = document.querySelectorAll('.match-card');
        const emptyState = document.getElementById('matchEmpty');

        if (!filters.length || !cards.length) return;

        let activeFilters = new Set();

        filters.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                
                // Toggle active state on button & set
                if (activeFilters.has(filter)) {
                    activeFilters.delete(filter);
                    btn.classList.remove('active');
                } else {
                    activeFilters.add(filter);
                    btn.classList.add('active');
                }
                
                updateGrid();
            });
        });

        function updateGrid() {
            let matchesFound = 0;

            if (activeFilters.size === 0) {
                // If nothing selected, hide everything and show prompt
                cards.forEach(card => card.classList.add('hidden'));
                emptyState.classList.remove('hidden');
                return;
            }

            emptyState.classList.add('hidden');

            cards.forEach(card => {
                const tags = card.dataset.tags.split(',');
                // Check if card has ALL selected filters (AND logic) or ANY (OR logic).
                // "Help Me Choose" usually works best if they select multiple, they want something that matches as many as possible, but let's use OR logic so it feels generous, OR strict AND logic.
                // Strict AND logic is more "customized". Let's do AND logic: card must have every active filter.
                let matchesAll = true;
                activeFilters.forEach(f => {
                    if (!tags.includes(f)) matchesAll = false;
                });

                if (matchesAll) {
                    card.classList.remove('hidden');
                    matchesFound++;
                } else {
                    card.classList.add('hidden');
                }
            });

            if (matchesFound === 0) {
                emptyState.innerHTML = '<p>Ah, a unique craving! Try removing a filter to see more options.</p>';
                emptyState.classList.remove('hidden');
            } else {
                emptyState.innerHTML = '<p>Select your mood traits above to discover your perfect cup!</p>';
            }
        }
    }

    /* ----------------------------------------------------------
       Ambient Audio Toggle Logic
    ---------------------------------------------------------- */
    function setupAudio() {
        const audio = document.getElementById('ambientAudio');
        const toggleBtn = document.getElementById('audioToggleBtn');

        if (!audio || !toggleBtn) return;

        toggleBtn.addEventListener('click', () => {
            if (audio.paused) {
                // Play audio
                audio.play().then(() => {
                    toggleBtn.classList.add('playing');
                }).catch(err => {
                    console.log('Audio playback prevented:', err);
                });
            } else {
                // Pause audio
                audio.pause();
                toggleBtn.classList.remove('playing');
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