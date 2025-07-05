document.addEventListener('DOMContentLoaded', () => {
  const postsContainer = document.getElementById('posts');
  const categoriesContainer = document.getElementById('categories');

  if (!postsContainer) {
    return;
  }

  async function loadBlogPosts() {
    postsContainer.innerHTML = '<p class="text-center text-zinc-400">Cargando artículos...</p>';

    // --- INICIO LÓGICA DE FILTRADO ---
    // Obtenemos la categoría de la URL, si existe.
    const params = new URLSearchParams(window.location.search);
    const categoryFilter = params.get('category');
    // --- FIN LÓGICA DE FILTRADO ---

    try {
      const response = await fetch('/.netlify/functions/get-posts');
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.statusText}`);
      }
      let posts = await response.json();

      // Si hay un filtro de categoría, aplicarlo.
      if (categoryFilter) {
        posts = posts.filter(post => post.fields.category === categoryFilter);
      }

      if (posts.length === 0) {
        postsContainer.innerHTML = '<p class="text-center text-zinc-400">No hay artículos para esta categoría.</p>';
        return;
      }

      // --- INICIO SEPARADOR TRISKEL ---
      // Comprueba si el separador ya existe para no duplicarlo al filtrar.
      if (!document.getElementById('triskel-separator')) {
        const triskelSeparator = document.createElement('div');
        triskelSeparator.id = 'triskel-separator';
        triskelSeparator.className = 'my-8 text-center'; // Margen y centrado
        triskelSeparator.innerHTML = `<img src="https://raw.githubusercontent.com/crankstorn/Carlos-Autor-Web/ade1a9db78c22724be5b2e963819b8086da1891a/Separador%20Triskel.svg" alt="Separador decorativo" class="mx-auto h-8 w-8">`;

        // Inserta el separador después del contenedor de categorías.
        if (categoriesContainer) {
          categoriesContainer.insertAdjacentElement('afterend', triskelSeparator);
        }
      }
      // --- FIN SEPARADOR TRISKEL ---

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
            ${readMoreLink ? `<span class="text-zinc-400 mx-2">|</span>` : ''}
            <span class="text-zinc-500">Publicado en
              <a href="/blog.html?category=${encodeURIComponent(category)}" class="text-[--color-accent] hover:underline uppercase tracking-wider">${category}</a>
            </span>
          </div>
        `;

        postsContainer.appendChild(postElement);

        if (index < posts.length - 1) {
            const separator = document.createElement('hr');
            // CAMBIO: Menos espacio entre posts (my-3)
            separator.className = 'my-3 mx-auto w-20 border-t border-zinc-400';
            postsContainer.appendChild(separator);
        }
      });
  }

  function displayCategories(posts) {
      if (!categoriesContainer) return;

      const allCategories = [...new Set(posts.map(p => p.fields.category).filter(Boolean))];

      categoriesContainer.innerHTML = '<a href="/blog.html" class="hover:text-[--color-accent] transition-colors">Todo</a>';

      allCategories.forEach(cat => {
          categoriesContainer.innerHTML += ` <span class="text-zinc-500">/</span> <a href="/blog.html?category=${encodeURIComponent(cat)}" class="hover:text-[--color-accent] transition-colors">${cat}</a>`;
      });
  }

  loadBlogPosts();
});
