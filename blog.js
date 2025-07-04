document.addEventListener('DOMContentLoaded', () => {
  const postsContainer = document.getElementById('posts');
  const categoriesContainer = document.getElementById('categories');

  if (!postsContainer) {
    return;
  }

  async function loadBlogPosts() {
    postsContainer.innerHTML = '<p class="text-center text-zinc-400">Cargando artículos...</p>';

    try {
      const response = await fetch('/.netlify/functions/get-posts');
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.statusText}`);
      }
      const posts = await response.json();

      console.log('Datos recibidos de Contentful:', posts);

      if (posts.length === 0) {
        postsContainer.innerHTML = '<p class="text-center text-zinc-400">Aún no hay artículos publicados.</p>';
        return;
      }

      // ===== CORRECCIÓN 1: Se ha eliminado el bloque try...catch duplicado que estaba aquí =====
      // Ahora se llama directamente a las funciones para mostrar el contenido.
      displayPosts(posts);
      displayCategories(posts);

    } catch (error) {
      console.error('Error al cargar el blog:', error);
      postsContainer.innerHTML = '<p class="text-center text-red-500">No se pudieron cargar los artículos. Inténtalo de nuevo más tarde.</p>';
    }
  }

function displayPosts(posts) {
    postsContainer.innerHTML = ''; // Limpiar el contenedor

    posts.forEach((post, index) => {
      const { title, slug, category, summary, date, content, image } = post.fields;

      // --- INICIO DE LA NUEVA LÓGICA ---

      let displayContent;
      let readMoreLink = ''; // Por defecto, no hay enlace "Leer más"

      // Si es el primer post (el más reciente), muestra el contenido completo.
      if (index === 0) {
        displayContent = content; // Usamos el campo de contenido principal
      }
      // Para todos los demás posts, muestra un extracto.
      else {
        // Creamos un extracto de los primeros 400 caracteres del contenido.
        displayContent = content.substring(0, 400) + ' [...]';
        // Y añadimos el enlace "Leer más".
        readMoreLink = `<a href="post.html?slug=${slug || '#'}" class="font-semibold text-[--color-accent] hover:underline">Leer más &rarr;</a>`;
      }

      // --- FIN DE LA NUEVA LÓGICA ---

      const postDate = date ? new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : "Fecha no disponible";

      const postElement = document.createElement('article');
      // Eliminamos las clases de la tarjeta (sombra, fondo, padding, etc.)
      postElement.className = 'py-8';

      postElement.innerHTML = `
        <div class="text-sm text-zinc-500 mb-2">
          <span class="font-semibold text-[--color-accent] uppercase tracking-wider">${category}</span>
          <span>&middot; ${postDate}</span>
        </div>
        <h2 class="text-3xl font-serif mb-4">
          <a href="post.html?slug=${slug || '#'}" class="hover:text-[--color-accent] transition-colors">${title}</a>
        </h2>

        <div class="text-zinc-700 space-y-4 leading-relaxed">
            ${displayContent}
        </div>

        <div class="mt-4">
            ${readMoreLink}
        </div>
      `;

      postsContainer.appendChild(postElement);

      // Añadimos un separador después de cada post, excepto el último.
      if (index < posts.length - 1) {
          const separator = document.createElement('hr');
          separator.className = 'my-6 border-t border-zinc-200'; // Estilo de la línea
          postsContainer.appendChild(separator);
      }
    });
}

  function displayCategories(posts) {
      if (!categoriesContainer) return;

      // ===== CORRECCIÓN 2: Se usa el ID de campo correcto "category" en lugar de "categoria" =====
      const allCategories = [...new Set(posts.map(p => p.fields.category).filter(Boolean))];

      categoriesContainer.innerHTML = '<a href="/blog.html" class="hover:text-[--color-accent] transition-colors">Todo</a>';

      allCategories.forEach(cat => {
          categoriesContainer.innerHTML += ` <span class="text-zinc-500">/</span> <a href="#" class="hover:text-[--color-accent] transition-colors">${cat}</a>`;
      });
  }

  loadBlogPosts();
});
