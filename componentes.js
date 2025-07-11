// Fichero: componentes.js

// Función para cargar un componente HTML en un contenedor
async function loadComponent(url, placeholderId) {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) {
        // Si no hay placeholder en la página, no hacemos nada.
        return;
    }
    try {
        const response = await fetch(url);
        if (response.ok) {
            placeholder.innerHTML = await response.text();
        } else {
            placeholder.innerHTML = `<p class="text-red-500 text-center">Error al cargar componente desde ${url}</p>`;
            console.error('Error loading component:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching component:', error);
    }
}

// Cargar todos los componentes y luego inicializar los scripts
async function loadAllComponents() {
    // --- CORRECCIÓN CLAVE ---
    // Usamos rutas absolutas (empezando con /) para que funcionen
    // desde cualquier página, incluyendo /blog/un-post.
    await Promise.all([
        loadComponent('/header.html', 'header-placeholder'),
        loadComponent('/footer.html', 'footer-placeholder')
    ]);

    // Una vez que los componentes están en el DOM, inicializamos los scripts
    // que les dan vida (menú móvil, etc.).
    if (typeof initializePageScripts === 'function') {
        initializePageScripts();
    } else {
        console.error('La función initializePageScripts no está definida. Asegúrate de que scripts.js se carga correctamente.');
    }
}

// Ejecutamos la carga cuando el DOM inicial esté listo.
document.addEventListener('DOMContentLoaded', loadAllComponents);
