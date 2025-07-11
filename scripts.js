document.addEventListener('DOMContentLoaded', () => {

    // --- MANEJO DE LA NEWSLETTER ---
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
                const email = document.getElementById('newsletter-email').value;
                const MAILERLITE_GROUP_ID = '158756233196602950';
                const FUNCTION_URL = '/.netlify/functions/subscribe';

                feedbackDiv.textContent = 'Procesando...';
                feedbackDiv.className = 'mt-4 text-sm h-5 text-gray-400';
                submitButton.disabled = true;

                try {
                    const response = await fetch(FUNCTION_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, groupId: MAILERLITE_GROUP_ID }),
                    });
                    if (response.ok) {
                        feedbackDiv.textContent = '¡Gracias por suscribirte!';
                        feedbackDiv.className = 'mt-4 text-sm h-5 text-green-400';
                        e.target.reset();
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
            overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
            document.addEventListener('keydown', (e) => { if (e.key === "Escape" && !overlay.classList.contains('hidden')) closeModal(); });
        }
    };
    initModal('easter-egg-trigger', 'secret-modal-overlay', 'close-secret-modal-btn', 'secret-modal');
    initModal('open-stores-modal-btn', 'other-stores-modal-overlay', 'close-stores-modal-btn', 'other-stores-modal');

    // --- MENÚ MÓVIL ---
    const menu = document.getElementById('mobile-menu');
    const openBtn = document.getElementById('open-menu-btn');
    const closeBtn = document.getElementById('close-menu-btn');
    const overlay = document.getElementById('overlay');
    if (menu && openBtn && closeBtn && overlay) {
        const openMenu = () => {
            menu.classList.add('is-open');
            overlay.classList.add('is-visible');
            document.body.classList.add('menu-open');
        };
        const closeMenu = () => {
            menu.classList.remove('is-open');
            overlay.classList.remove('is-visible');
            document.body.classList.remove('menu-open');
        };
        openBtn.addEventListener('click', openMenu);
        closeBtn.addEventListener('click', closeMenu);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeMenu(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu(); });
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
                if (entry.isIntersecting) entry.target.classList.add('is-visible');
            });
        }, { rootMargin: '0px 0px -100px 0px' });
        fadeInSections.forEach(section => observer.observe(section));
    }

    // --- BOTÓN "VOLVER ARRIBA" ---
    const backToTopBtn = document.getElementById('back-to-top-btn');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => backToTopBtn.classList.toggle('show', window.scrollY > 300));
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- LÓGICA DE NAVEGACIÓN ACTIVA ---
    const navLinks = document.querySelectorAll('#main-nav a, #mobile-menu a');
    const currentPath = window.location.pathname.replace(/\/$/, '');
    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname.replace(/\/$/, '').replace('.html', '');
        if (currentPath.startsWith('/blog') && linkPath === '/blog') {
            link.classList.add('nav-active');
            link.setAttribute('aria-current', 'page');
        } else if (linkPath === currentPath || (currentPath === '' && linkPath === '/index')) {
            link.classList.add('nav-active');
            link.setAttribute('aria-current', 'page');
        }
    });

    // ==========================================================
    // ===== NUEVO: Cargar Últimas Noticias en la Página de Inicio =====
    // ==========================================================
    const newsContainer = document.getElementById('news-list-container');
    if (newsContainer) {
        const loadLatestNews = async () => {
            try {
                // 1. Llama a la función de Netlify para obtener los posts
                const response = await fetch('/.netlify/functions/get-posts');
                if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);

                // 2. Coge solo los 5 más recientes
                const allPosts = await response.json();
                const latestPosts = allPosts.slice(0, 5);

                if (latestPosts.length === 0) {
                    newsContainer.innerHTML = '<p class="text-center text-zinc-500">No hay noticias disponibles.</p>';
                    return;
                }

                // 3. Limpia el contenedor y muestra los títulos
                newsContainer.innerHTML = ''; // Limpia el mensaje "Cargando..."
                latestPosts.forEach(post => {
                    const { title, slug } = post.fields;
                    const newsItem = document.createElement('div');
                    newsItem.className = 'text-center border-b border-gray-200 pb-4'; // Estilo para cada noticia
                    newsItem.innerHTML = `
                        <a href="/blog/${slug}" class="text-xl text-zinc-800 hover:text-[--color-accent] transition-colors duration-300">
                            ${title}
                        </a>
                    `;
                    newsContainer.appendChild(newsItem);
                });

            } catch (error) {
                console.error('Error al cargar las últimas noticias:', error);
                newsContainer.innerHTML = '<p class="text-center text-red-500">No se pudieron cargar las noticias.</p>';
            }
        };

        loadLatestNews();
    }
});