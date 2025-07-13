// Fichero: scripts.js

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

    // Inicializar todos los modales que puedan existir
    initModal('easter-egg-trigger', 'secret-modal-overlay', 'close-secret-modal-btn', 'secret-modal');
    initModal('open-stores-modal-btn', 'other-stores-modal-overlay', 'close-stores-modal-btn', 'other-stores-modal');


    // --- MENÚ MÓVIL ---
    const openMenuBtn = document.getElementById('open-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('overlay');

    // Nos aseguramos de que todos los elementos existen antes de añadir los listeners
    if (openMenuBtn && closeMenuBtn && mobileMenu && overlay) {

        const openMobileMenu = () => {
            mobileMenu.classList.remove('translate-x-full'); // Muestra el menú
            overlay.classList.remove('hidden');             // Muestra el fondo oscuro
            document.body.style.overflow = 'hidden';        // Evita el scroll de la página
        };

        const closeMobileMenu = () => {
            mobileMenu.classList.add('translate-x-full'); // Oculta el menú
            overlay.classList.add('hidden');              // Oculta el fondo oscuro
            document.body.style.overflow = '';            // Restaura el scroll
        };

        // Eventos para abrir y cerrar
        openMenuBtn.addEventListener('click', openMobileMenu);
        closeMenuBtn.addEventListener('click', closeMobileMenu);
        overlay.addEventListener('click', closeMobileMenu); // Cierra el menú al hacer clic en el fondo

        // Opcional: Cierra el menú si se presiona la tecla "Escape"
        document.addEventListener('keydown', (e) => {
            if (e.key === "Escape" && !mobileMenu.classList.contains('translate-x-full')) {
                closeMobileMenu();
            }
        });
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

// --- LÓGICA DE NAVEGACIÓN ACTIVA (CORREGIDA Y SEGURA) ---
    const navLinks = document.querySelectorAll('#main-nav a, #mobile-menu a');
    if (navLinks.length > 0) {

        // Esta función se asegura de que todas las rutas se comparen de la misma manera.
        const normalizePath = (path) => {
            let normalized = path
                .replace(/\/$/, '')       // 1. Elimina la barra final (ej: /autor/ -> /autor)
                .replace(/\.html$/, '');  // 2. Elimina la extensión .html (ej: /autor.html -> /autor)

            // 3. Trata la página de inicio ('/index') como la raíz ('')
            if (normalized === '/index') {
                normalized = '';
            }
            return normalized;
        };

        const currentPath = normalizePath(window.location.pathname);

        navLinks.forEach(link => {
            // Usamos try/catch como medida de seguridad por si un 'href' no es una URL válida.
            try {
                const linkPath = normalizePath(new URL(link.href).pathname);

                // Comprobamos si el enlace debe estar activo
                if (linkPath === currentPath) {
                    link.classList.add('nav-active');
                    link.setAttribute('aria-current', 'page');
                } else {
                    // Es buena práctica asegurarse de que no se quede activa si no corresponde.
                    link.classList.remove('nav-active');
                    link.removeAttribute('aria-current');
                }
            } catch (error) {
                console.error('Enlace con formato no válido en la navegación:', link.href);
            }
        });
    }
    // --- CARGAR ÚLTIMAS NOTICIAS EN LA PÁGINA DE INICIO ---
    const newsContainer = document.getElementById('news-list-container');
    if (newsContainer) {

        const formatNewsDate = (isoDate) => {
        if (!isoDate) return '';
        const date = new Date(isoDate);
        const timeZone = 'UTC'; // Usar UTC para evitar errores de un día por la zona horaria.

        // --- Opción 1: Formato de texto en español (11 de julio de 2025) ---
        // Esta es la opción activa por defecto.
        const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone };
        return new Intl.DateTimeFormat('es-ES', options).format(date);

        // --- Opción 2: Formato numérico (11/07/2025) ---
        // Si prefieres esta, borra el '//' del inicio de la línea de abajo y ponlo en la de arriba.
        // return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone }).format(date);
        };

        const loadLatestNews = async () => {
            try {
                const response = await fetch('/.netlify/functions/get-posts');
                if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);

                const allPosts = await response.json();
                const latestPosts = allPosts.slice(0, 5);

                if (latestPosts.length === 0) {
                    newsContainer.innerHTML = '<p class="text-center text-zinc-500">No hay noticias disponibles.</p>';
                    return;
                }

                newsContainer.innerHTML = '';
                latestPosts.forEach(post => {
                    const { title, slug, date } = post.fields;
                    const formattedDate = formatNewsDate(date);

                    const newsItem = document.createElement('div');
                    newsItem.className = 'flex items-center gap-6';
                    newsItem.innerHTML = `
                        <div class="w-1/3 md:w-1/4 text-sm text-zinc-500 uppercase tracking-wider font-sans">
                            ${formattedDate}
                        </div>
                        <div class="w-2/3 md:w-3/4 text-xl">
                            <a href="/blog/${slug}" class="text-zinc-800 hover:text-[--color-accent] transition-colors duration-300">
                                ${title}
                            </a>
                        </div>
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
}