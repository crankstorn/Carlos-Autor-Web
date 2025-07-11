document.addEventListener('DOMContentLoaded', () => {
  const postsContainer = document.getElementById('posts');
  const categoriesContainer = document.getElementById('categories');

  if (!postsContainer) {
    return;
  }

  // Función para convertir saltos de línea a párrafos HTML
  function convertNewlinesToParagraphs(text) {
    if (!text) return '';
    let htmlContent = text.split('\n\n')
                          .map(paragraph => `<p>${paragraph}</p>`)
                          .join('');
    htmlContent = htmlContent.replace(/\n/g, '<br>');
    return htmlContent;
  }

  async function loadBlogPosts() {
    postsContainer.innerHTML = '<p class="text-center text-zinc-400">Cargando artículos...</p>';

    // Lógica para filtrar por categoría desde la URL
    const params = new URLSearchParams(window.location.search);
    const categoryFilter = params.get('category');

    try {
      const response = await fetch('/.netlify/functions/get-posts');
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.statusText}`);
      }
      let allPosts = await response.json();
      let postsToDisplay = allPosts;

      // Si hay un filtro de categoría, se aplica aquí
      if (categoryFilter) {
        postsToDisplay = allPosts.filter(post => post.fields.category === categoryFilter);
      }

      if (postsToDisplay.length === 0) {
        postsContainer.innerHTML = '<p class="text-center text-zinc-400">No hay artículos para esta categoría.</p>';
      } else {
        displayPosts(postsToDisplay);
      }

      displayCategories(allPosts);

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

        // El primer post se muestra completo, los demás con un extracto
        if (index === 0) {
          displayContent = convertNewlinesToParagraphs(content);
        } else {
          const wordLimit = 55;
          const words = (content || '').split(/\s+/);
          let truncatedContent = content;

          if (words.length > wordLimit) {
            truncatedContent = words.slice(0, wordLimit).join(' ') + ' [...]';
          }
          displayContent = convertNewlinesToParagraphs(truncatedContent);

          // ***** CORRECCIÓN CLAVE *****
          // El enlace "Leer más" ahora usa la URL limpia.
          readMoreLink = `<a href="/blog/${slug}" class="font-semibold text-[--color-accent] hover:underline">Leer más</a>`;
        }

        const postDate = date ? new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : "Fecha no disponible";

        const postElement = document.createElement('article');
        postElement.className = 'py-2';

        postElement.innerHTML = `
          <h2 class="text-4xl font-serif mb-2 text-center">
            <!-- ***** CORRECCIÓN CLAVE ***** -->
            <!-- El enlace del título ahora usa la URL limpia. -->
            <a href="/blog/${slug}" class="hover:text-[--color-accent] transition-colors">${title}</a>
          </h2>

          <div class="text-sm text-zinc-400 mb-6 text-center uppercase tracking-wider">
            <span>${postDate}</span>
          </div>

          <div class="prose max-w-none text-zinc-700 leading-relaxed text-center">
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
            separator.className = 'my-1 mx-auto w-20 border-t border-zinc-500';
            postsContainer.appendChild(separator);
        }
      });
  }

  function displayCategories(allPosts) {
      if (!categoriesContainer) return;

      const allCategories = [...new Set(allPosts.map(p => p.fields.category).filter(Boolean))];

      let categoriesHTML = '<a href="/blog.html" class="hover:text-[--color-accent] transition-colors">Todo</a>';
      allCategories.forEach(cat => {
          categoriesHTML += ` <span class="text-zinc-500">/</span> <a href="/blog.html?category=${encodeURIComponent(cat)}" class="hover:text-[--color-accent] transition-colors">${cat}</a>`;
      });
      categoriesContainer.innerHTML = categoriesHTML;

      const params = new URLSearchParams(window.location.search);
      const categoryFilter = params.get('category');

      if (categoryFilter) {
          const activeLink = document.querySelector(`a[href="/blog.html?category=${encodeURIComponent(categoryFilter)}"]`);
          if (activeLink) activeLink.classList.add('font-bold', 'text-[--color-accent]');
      } else {
          const allLink = document.querySelector('a[href="/blog.html"]');
          if (allLink) allLink.classList.add('font-bold', 'text-[--color-accent]');
      }
  }

  loadBlogPosts();
});
