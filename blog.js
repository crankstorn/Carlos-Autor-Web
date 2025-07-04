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

      if (posts.length === 0) {
        postsContainer.innerHTML = '<p class="text-center text-zinc-400">Aún no hay artículos publicados.</p>';
        return;
      }

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
        const { title, slug, category, date, content } = post.fields;

        let displayContent;
        let readMoreLink = '';
        // 1. CENTRADO: Añadimos la clase 'text-center' para centrar el texto del contenido.
        let contentWrapperClass = 'text-zinc-700 leading-relaxed text-center';

        if (index === 0) {
          displayContent = content;
        } else {
          displayContent = content;
          contentWrapperClass += ' truncated-content';
          readMoreLink = `<a href="post.html?slug=${slug || '#'}" class="font-semibold text-[--color-accent] hover:underline">Leer más &rarr;</a>`;
        }

        const postDate = date ? new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : "Fecha no disponible";

        const postElement = document.createElement('article');
        // 2. ESPACIADO: Reducimos el padding vertical del artículo para que sea más compacto.
        postElement.className = 'py-4';

        postElement.innerHTML = `
          <div class="text-sm text-zinc-500 mb-2 text-center">
            <span class="font-semibold text-[--color-accent] uppercase tracking-wider">${category}</span>
            <span>&middot; ${postDate}</span>
          </div>
          <h2 class="text-3xl font-serif mb-4 text-center">
            <a href="post.html?slug=${slug || '#'}" class="hover:text-[--color-accent] transition-colors">${title}</a>
          </h2>

          <div class="${contentWrapperClass}">
              ${displayContent}
          </div>

          <div class="mt-4 text-center">
              ${readMoreLink}
          </div>
        `;

        postsContainer.appendChild(postElement);

        // Añadimos el separador después de cada post, excepto el último.
        if (index < posts.length - 1) {
            const separator = document.createElement('hr');
            // 3. SEPARADOR: Más corto (w-20), centrado (mx-auto), más oscuro (border-zinc-300) y con más margen vertical (my-12).
            separator.className = 'my-12 mx-auto w-20 border-t border-zinc-300';
            postsContainer.appendChild(separator);
        }
      });
  }

  function displayCategories(posts) {
      if (!categoriesContainer) return;

      const allCategories = [...new Set(posts.map(p => p.fields.category).filter(Boolean))];

      categoriesContainer.innerHTML = '<a href="/blog.html" class="hover:text-[--color-accent] transition-colors">Todo</a>';

      allCategories.forEach(cat => {
          categoriesContainer.innerHTML += ` <span class="text-zinc-500">/</span> <a href="#" class="hover:text-[--color-accent] transition-colors">${cat}</a>`;
      });
  }

  loadBlogPosts();
});
