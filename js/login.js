/* =============================================================
   PulseOS — Login Page JavaScript
   FIFA World Cup 2026™ AI Operating System
   Handles: role selection, form submission, particles,
   password toggle, entrance animations
   ============================================================= */

(function () {
    'use strict';

    /* ==========================================================
       1. DOM ELEMENT REFERENCES
       ========================================================== */

    const roleCards = document.querySelectorAll('.login-role-card');
    const loginForm = document.getElementById('loginForm');
    const loginButton = document.getElementById('loginButton');
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('passwordToggle');
    const particleCanvas = document.getElementById('particleCanvas');

    /* ==========================================================
       2. STATE — Track the currently selected role
       ========================================================== */

    let selectedRole = 'operations'; // Default: Operations Manager

    /* ==========================================================
       3. ROLE CARD SELECTION
       Click to select a role, update visual state, persist choice
       ========================================================== */

    /**
     * Sets the active role card and updates all visual states.
     * @param {string} role - The data-role value to select
     */
    function selectRole(role) {
        selectedRole = role;

        // Update all cards — remove 'selected' from all, add to target
        roleCards.forEach(function (card) {
            const cardRole = card.getAttribute('data-role');
            if (cardRole === role) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });

        // Persist selected role to localStorage for the dashboard
        localStorage.setItem('pulseos_selectedRole', role);
    }

    // Attach click listeners to every role card
    roleCards.forEach(function (card) {
        card.addEventListener('click', function () {
            const role = this.getAttribute('data-role');
            selectRole(role);
        });

        // Keyboard accessibility — Enter/Space to select
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const role = this.getAttribute('data-role');
                selectRole(role);
            }
        });
    });

    // Initialize with default role selection
    selectRole(selectedRole);

    /* ==========================================================
       4. FORM SUBMISSION
       Show loading spinner for 1.5 seconds, then redirect
       ========================================================== */

    const mfaOverlay = document.getElementById('mfaOverlay');
    const ssoOverlay = document.getElementById('ssoOverlay');
    const verifyMfaBtn = document.getElementById('verifyMfaBtn');
    const ssoProviderName = document.getElementById('ssoProviderName');

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Prevent double-submission
        if (loginButton.classList.contains('loading')) return;

        // Ensure email and password aren't empty (HTML required handles this, but just in case)
        const emailInput = document.getElementById('email');
        if (!emailInput.value) return;

        // Store user info in localStorage for the dashboard
        localStorage.setItem('pulseos_userEmail', emailInput.value);
        localStorage.setItem('pulseos_selectedRole', selectedRole);
        localStorage.setItem('pulseos_loginTime', new Date().toISOString());

        // Show MFA overlay instead of logging in directly
        mfaOverlay.classList.remove('hidden');

        // Auto-focus the first MFA input
        setTimeout(() => {
            const firstMfa = document.querySelector('.mfa-input');
            if (firstMfa) firstMfa.focus();
        }, 100);
    });

    // Handle MFA auto-advance
    const mfaInputs = document.querySelectorAll('.mfa-input');
    mfaInputs.forEach((input, index) => {
        input.addEventListener('input', function() {
            if (this.value.length === 1 && index < mfaInputs.length - 1) {
                mfaInputs[index + 1].focus();
            }
        });
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !this.value && index > 0) {
                mfaInputs[index - 1].focus();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                verifyMfaBtn.click();
            }
        });
    });

    // Handle MFA Verification Button
    if (verifyMfaBtn) {
        verifyMfaBtn.addEventListener('click', function() {
            if (verifyMfaBtn.classList.contains('loading')) return;
            verifyMfaBtn.classList.add('loading');

            // Simulate verification delay
            setTimeout(function () {
                window.location.href = 'dashboard.html';
            }, 1200);
        });
    }

    // Handle SSO Buttons
    const ssoButtons = document.querySelectorAll('.login-sso__btn');
    ssoButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const provider = this.getAttribute('data-provider') || 'Enterprise SSO';
            
            // Set localStorage for SSO user
            localStorage.setItem('pulseos_userEmail', 'sso_user@' + provider.toLowerCase() + '.com');
            localStorage.setItem('pulseos_selectedRole', selectedRole);
            localStorage.setItem('pulseos_loginTime', new Date().toISOString());

            // Update overlay text
            if (ssoProviderName) {
                ssoProviderName.textContent = 'Authenticating with ' + provider;
            }

            // Show SSO overlay
            ssoOverlay.classList.remove('hidden');

            // Simulate SSO handshake delay
            setTimeout(function () {
                window.location.href = 'dashboard.html';
            }, 2500);
        });
    });

    /* ==========================================================
       5. PASSWORD VISIBILITY TOGGLE
       Toggle between password and text input types
       ========================================================== */

    let passwordVisible = false;

    passwordToggle.addEventListener('click', function () {
        passwordVisible = !passwordVisible;

        if (passwordVisible) {
            passwordInput.type = 'text';
            passwordToggle.textContent = '🙈';
            passwordToggle.setAttribute('aria-label', 'Hide password');
        } else {
            passwordInput.type = 'password';
            passwordToggle.textContent = '👁️';
            passwordToggle.setAttribute('aria-label', 'Show password');
        }
    });

    /* ==========================================================
       6. PARTICLE CANVAS ANIMATION
       Renders 25 floating dots on the left panel background
       ========================================================== */

    /**
     * Initializes and runs the particle animation system.
     * Creates small floating dots that drift gently across
     * the left panel, adding visual depth and life.
     */
    function initParticles() {
        if (!particleCanvas) return;

        const ctx = particleCanvas.getContext('2d');
        if (!ctx) return;

        const PARTICLE_COUNT = 25;
        let particles = [];
        let animationId = null;
        let canvasWidth = 0;
        let canvasHeight = 0;

        /**
         * Represents a single particle dot.
         */
        class Particle {
            constructor() {
                this.reset(true);
            }

            /**
             * Initializes or resets particle properties.
             * @param {boolean} randomizePosition - If true, scatter across canvas
             */
            reset(randomizePosition) {
                this.x = randomizePosition
                    ? Math.random() * canvasWidth
                    : Math.random() * canvasWidth;
                this.y = randomizePosition
                    ? Math.random() * canvasHeight
                    : Math.random() * canvasHeight;

                // Size: small dots between 1.5px and 4px
                this.radius = Math.random() * 2.5 + 1.5;

                // Velocity: very slow drift
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.3;

                // Opacity: semi-transparent
                this.baseOpacity = Math.random() * 0.35 + 0.08;
                this.opacity = this.baseOpacity;

                // Color: choose between blue, cyan, purple, and white
                const colors = [
                    '59, 130, 246',   // Blue #3b82f6
                    '6, 182, 212',    // Cyan #06b6d4
                    '139, 92, 246',   // Purple #8b5cf6
                    '255, 255, 255',  // White
                    '16, 185, 129'    // Green #10b981
                ];
                this.color = colors[Math.floor(Math.random() * colors.length)];

                // Pulsing phase — each dot pulses at its own rate
                this.pulseSpeed = Math.random() * 0.02 + 0.005;
                this.pulsePhase = Math.random() * Math.PI * 2;
            }

            /**
             * Updates particle position and opacity each frame.
             */
            update() {
                // Move
                this.x += this.vx;
                this.y += this.vy;

                // Pulse opacity
                this.pulsePhase += this.pulseSpeed;
                this.opacity = this.baseOpacity + Math.sin(this.pulsePhase) * 0.12;

                // Wrap around edges
                if (this.x < -10) this.x = canvasWidth + 10;
                if (this.x > canvasWidth + 10) this.x = -10;
                if (this.y < -10) this.y = canvasHeight + 10;
                if (this.y > canvasHeight + 10) this.y = -10;
            }

            /**
             * Draws the particle on the canvas.
             */
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + this.color + ', ' + Math.max(0, this.opacity) + ')';
                ctx.fill();

                // Subtle glow around larger particles
                if (this.radius > 2.5) {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(' + this.color + ', ' + Math.max(0, this.opacity * 0.15) + ')';
                    ctx.fill();
                }
            }
        }

        /**
         * Draws faint connecting lines between nearby particles.
         */
        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        const lineOpacity = (1 - distance / 150) * 0.06;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = 'rgba(59, 130, 246, ' + lineOpacity + ')';
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        /**
         * Resizes the canvas to match its container.
         * IMPORTANT: always reset the transform before scaling to avoid
         * compounding the DPR scale on every resize event.
         */
        function resizeCanvas() {
            const container = particleCanvas.parentElement;
            canvasWidth = container.offsetWidth;
            canvasHeight = container.offsetHeight;

            // Set canvas resolution (account for device pixel ratio for sharpness)
            const dpr = window.devicePixelRatio || 1;
            particleCanvas.width = canvasWidth * dpr;
            particleCanvas.height = canvasHeight * dpr;
            particleCanvas.style.width = canvasWidth + 'px';
            particleCanvas.style.height = canvasHeight + 'px';

            // Reset transform BEFORE scaling to prevent compounding on every resize
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);

            // Re-scatter particles so they fill the new canvas dimensions
            if (particles.length > 0) {
                particles.forEach(function (p) { p.reset(true); });
            }
        }

        /**
         * Creates all particle instances.
         */
        function createParticles() {
            particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push(new Particle());
            }
        }

        /**
         * Main animation loop — clears, updates, draws all particles.
         */
        function animate() {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);

            // Update and draw each particle
            particles.forEach(function (p) {
                p.update();
                p.draw();
            });

            // Draw faint connecting lines
            drawConnections();

            // Continue the loop
            animationId = requestAnimationFrame(animate);
        }

        // Initialize
        resizeCanvas();
        createParticles();
        animate();

        // Handle window resize — recalculate canvas dimensions
        window.addEventListener('resize', function () {
            resizeCanvas();
        });
    }

    // Start particle system
    initParticles();

    /* ==========================================================
       7. SMOOTH SCROLL PREVENTION
       Ensure no jump when clicking anchor links
       ========================================================== */

    document.querySelectorAll('a[href="#"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
        });
    });

    /* ==========================================================
       8. INPUT FOCUS EFFECTS
       Add subtle glow to parent wrapper on focus
       ========================================================== */

    document.querySelectorAll('.login-field__input').forEach(function (input) {
        input.addEventListener('focus', function () {
            this.closest('.login-field__input-wrap').classList.add('focused');
        });
        input.addEventListener('blur', function () {
            this.closest('.login-field__input-wrap').classList.remove('focused');
        });
    });

    /* ==========================================================
       9. CONSOLE BRANDING
       Show PulseOS branding message in the dev console
       ========================================================== */

    console.log(
        '%c⚡ PulseOS v3.0 %c Login Module Loaded ',
        'background: linear-gradient(135deg, #3b82f6, #06b6d4); color: white; font-weight: bold; padding: 6px 12px; border-radius: 4px 0 0 4px; font-size: 13px;',
        'background: #1e293b; color: #94a3b8; padding: 6px 12px; border-radius: 0 4px 4px 0; font-size: 13px;'
    );

    /* ==========================================================
       7. REQUEST ACCESS OVERLAY
       Handles opening, submitting, and closing the access request modal
       ========================================================== */
    const requestAccessLink = document.querySelector('.login-signup__link');
    const requestAccessOverlay = document.getElementById('requestAccessOverlay');
    const cancelRequestBtn = document.getElementById('cancelRequestBtn');
    const requestAccessForm = document.getElementById('requestAccessForm');
    const submitRequestBtn = document.getElementById('submitRequestBtn');
    const requestAccessSuccess = document.getElementById('requestAccessSuccess');
    const closeRequestSuccessBtn = document.getElementById('closeRequestSuccessBtn');

    if (requestAccessLink && requestAccessOverlay) {
        // Open modal
        requestAccessLink.addEventListener('click', function(e) {
            e.preventDefault();
            requestAccessOverlay.classList.remove('hidden');
            // Reset state if opened again
            requestAccessForm.style.display = 'flex';
            requestAccessSuccess.style.display = 'none';
            requestAccessForm.reset();
            submitRequestBtn.classList.remove('loading');
        });

        // Close via Cancel button
        cancelRequestBtn.addEventListener('click', function() {
            requestAccessOverlay.classList.add('hidden');
        });

        // Submit form
        requestAccessForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (submitRequestBtn.classList.contains('loading')) return;
            
            // Capture details
            const reqEmail = document.getElementById('requestEmail');
            const reqName = document.getElementById('requestName');
            
            if (reqEmail && reqEmail.value) {
                // Store temporarily or pre-fill the login form
                const mainEmailInput = document.getElementById('email');
                if (mainEmailInput) {
                    mainEmailInput.value = reqEmail.value;
                }
                // Save to localStorage for immediate dashboard entry
                localStorage.setItem('pulseos_userEmail', reqEmail.value);
                if (reqName && reqName.value) {
                    localStorage.setItem('pulseos_userName', reqName.value);
                }
                localStorage.setItem('pulseos_selectedRole', selectedRole);
                localStorage.setItem('pulseos_loginTime', new Date().toISOString());
            }

            submitRequestBtn.classList.add('loading');

            // Simulate API request delay
            setTimeout(() => {
                requestAccessForm.style.display = 'none';
                requestAccessSuccess.style.display = 'block';
            }, 1500);
        });

        // Redirect to dashboard after success
        closeRequestSuccessBtn.addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });
    }

})();
