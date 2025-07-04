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
        postElement.className = 'py-4';

        // --- INICIO DE LA REESTRUCTURACIÓN ---
        postElement.innerHTML = `
          <h2 class="text-4xl font-serif mb-2 text-center">
            <a href="post.html?slug=${slug || '#'}" class="hover:text-[--color-accent] transition-colors">${title}</a>
          </h2>

          <div class="text-sm text-zinc-400 mb-6 text-center uppercase tracking-wider">
            <span>${postDate}</span>
          </div>

          <div class="${contentWrapperClass}">
              ${displayContent}
          </div>

          <div class="mt-6 text-center text-sm">
            ${readMoreLink}
            <!-- Añadimos un separador si hay enlace "Leer más" -->
            ${readMoreLink ? `<span class="text-zinc-400 mx-2">|</span>` : ''}
            <span class="text-zinc-500">Publicado en <span class="font-semibold text-zinc-600 uppercase tracking-wider">${category}</span></span>
          </div>
        `;
        // --- FIN DE LA REESTRUCTURACIÓN ---

        postsContainer.appendChild(postElement);

        if (index < posts.length - 1) {
            const separator = document.createElement('hr');
            separator.className = 'my-4 mx-auto w-20 border-t border-zinc-500';
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
