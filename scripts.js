// Fichero: scripts.js (Versión final corregida)

function initializePageScripts() {

    // --- MANEJO DE LA NEWSLETTER CON NETLIFY Y RGPD ---
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        const submitButton = document.getElementById('newsletter-submit-btn');
        const consentCheckbox = document.getElementById('gdpr-consent');
        const feedbackDiv = document.getElementById('newsletter-feedback');

        if (submitButton && consentCheckbox) {
            submitButton.disabled = true;
            consentCheckbox.addEventListener('change', () => {
                submitButton.disabled = !consentCheckbox.checked;
            });

            newsletterForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                if (!consentCheckbox.checked) return;

                const emailInput = document.getElementById('newsletter-email');
                const email = emailInput.value;

                const MAILERLITE_GROUP_ID = '158756233196602950';
                const FUNCTION_URL = '/.netlify/functions/subscribe';

                feedbackDiv.textContent = 'Procesando...';
                feedbackDiv.className = 'mt-4 text-sm h-5 text-gray-400';
                submitButton.disabled = true;

                try {
                    const response = await fetch(FUNCTION_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: email,
                            groupId: MAILERLITE_GROUP_ID
                        }),
                    });

                    if (response.ok) {
                        const form = e.target;
                        feedbackDiv.textContent = '¡Gracias por suscribirte!';
                        feedbackDiv.className = 'mt-4 text-sm h-5 text-green-400';
                        form.reset();
                        consentCheckbox.checked = false;
                        submitButton.disabled = true;
                    } else {
                        const errorData = await response.json();
                        feedbackDiv.textContent = errorData.message || 'El email es inválido o ya está suscrito.';
                        feedbackDiv.className = 'mt-4 text-sm h-5 text-red-400';
                        submitButton.disabled = false;
                    }
                } catch (error) {
                    feedbackDiv.textContent = 'Ocurrió un error. Inténtalo de nuevo.';
                    feedbackDiv.className = 'mt-4 text-sm h-5 text-red-400';
                    console.error('Error en la suscripción:', error);
                    submitButton.disabled = false;
                }
            });
        }
    }

    // --- INICIALIZADOR DE MODALES ---
    const initModal = (triggerBtnId, overlayId, closeBtnId, modalId) => {
        const triggerBtn = document.getElementById(triggerBtnId);
        const overlay = document.getElementById(overlayId);
        const closeBtn = document.getElementById(closeBtnId);
        const modal = document.getElementById(modalId);

        if (triggerBtn && overlay && closeBtn && modal) {
            const openModal = () => {
                overlay.classList.remove('hidden');
                setTimeout(() => {
                    overlay.classList.add('opacity-100');
                    modal.classList.add('show');
                }, 10);
            };

            const closeModal = () => {
                overlay.classList.remove('opacity-100');
                modal.classList.remove('show');
                setTimeout(() => overlay.classList.add('hidden'), 300);
            };

            triggerBtn.addEventListener('click', openModal);
            closeBtn.addEventListener('click', closeModal);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeModal();
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === "Escape" && !overlay.classList.contains('hidden')) {
                    closeModal();
                }
            });
        }
    };

    initModal('easter-egg-trigger', 'secret-modal-overlay', 'close-secret-modal-btn', 'secret-modal');
    initModal('open-stores-modal-btn', 'other-stores-modal-overlay', 'close-stores-modal-btn', 'other-stores-modal');


    // --- MENÚ MÓVIL ---
const menu = document.getElementById('mobile-menu');
const openBtn = document.getElementById('open-menu-btn');
const closeBtn = document.getElementById('close-menu-btn');
const overlay = document.getElementById('overlay');
const body = document.body;

// Asegurarnos de que todos los elementos existen antes de añadir listeners
if (menu && openBtn && closeBtn && overlay) {
    const openMenu = () => {
        menu.classList.add('is-open');
        overlay.classList.add('is-visible');
        body.classList.add('menu-open');
    };

    const closeMenu = () => {
        menu.classList.remove('is-open');
        overlay.classList.remove('is-visible');
        body.classList.remove('menu-open');
    };

    openBtn.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
}

    // --- AÑO ACTUAL EN EL FOOTER ---
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- ANIMACIÓN DE ENTRADA (FADE-IN) ---
    const fadeInSections = document.querySelectorAll('.fade-in-section');
    if (fadeInSections.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { rootMargin: '0px 0px -100px 0px' });
        fadeInSections.forEach(section => observer.observe(section));
    }

    // --- BOTÓN "VOLVER ARRIBA" ---
    const backToTopBtn = document.getElementById('back-to-top-btn');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- LÓGICA DE NAVEGACIÓN ACTIVA ---
    const navLinks = document.querySelectorAll('#main-nav a, #mobile-menu a');
    const currentPath = window.location.pathname.replace(/\/$/, '');
    if (navLinks.length > 0) {
        navLinks.forEach(link => {
            // Usamos new URL para obtener la ruta de forma segura, incluso con URLs completas
            const linkPath = new URL(link.href).pathname.replace(/\/$/, '');

            // Comparamos la ruta actual con la del enlace.
            // El segundo caso es para la página de inicio, que puede ser / o /index.html
            if (linkPath === currentPath || (currentPath === '' && (linkPath.endsWith('/index.html') || linkPath === '/'))) {
                link.classList.add('nav-active');
                link.setAttribute('aria-current', 'page');
            }
        });
    }
}
