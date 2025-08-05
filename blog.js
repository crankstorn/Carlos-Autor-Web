document.addEventListener('DOMContentLoaded', () => {
  const postsContainer = document.getElementById('posts');
  const categoriesContainer = document.getElementById('categories');
  if (!postsContainer) return;

  function convertNewlinesToParagraphs(text) {
    if (!text) return '';
    let htmlContent = text.split('\n\n').map(p => `<p>${p}</p>`).join('');
    return htmlContent.replace(/\n/g, '<br>');
  }

  async function loadBlogPosts() {
    postsContainer.innerHTML = '<p class="text-center text-zinc-400">Cargando artículos...</p>';
    const params = new URLSearchParams(window.location.search);
    const categoryFilter = params.get('category');

    try {
      const response = await fetch('/.netlify/functions/get-posts');
      if (!response.ok) throw new Error(`Error del servidor: ${response.statusText}`);

      let allPosts = await response.json();
      let postsToDisplay = categoryFilter
        ? allPosts.filter(post => post.fields.category === categoryFilter)
        : allPosts;

      if (postsToDisplay.length === 0) {
        postsContainer.innerHTML = '<p class="text-center text-zinc-400">No hay artículos para esta categoría.</p>';
      } else {
        displayPosts(postsToDisplay);
      }
      displayCategories(allPosts);
    } catch (error) {
      console.error('Error al cargar el blog:', error);
      postsContainer.innerHTML = '<p class="text-center text-red-500">No se pudieron cargar los artículos.</p>';
    }
  }

  // -- CÓDIGO CORREGIDO Y ELEGANTE --
  function displayPosts(posts) {
    postsContainer.innerHTML = '';
    posts.forEach((post, index) => {
      const { title, slug, category, date, content } = post.fields;
      
      // El contenido (`content`) ya es HTML procesado por `marked` en el backend.
      // Simplemente lo usamos directamente. No necesitamos `convertNewlinesToParagraphs` aquí.
      const displayContent = content;
      let readMoreLink = '';

      // La lógica de truncado se elimina para no romper el HTML.
      // En su lugar, simplemente mostramos el enlace "Leer más" en todos los posts
      // excepto en el primero de la página principal (si no hay filtro).
      if (index > 0 || new URLSearchParams(window.location.search).get('category')) {
        readMoreLink = `<a href="/blog/${slug}" class="font-semibold text-[--color-accent] hover:underline">Leer más</a>`;
      }

      const postDate = date ? new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : "";

      const postElement = document.createElement('article');
      postElement.className = 'py-2';
      postElement.innerHTML = `
        <h2 class="text-4xl font-serif mb-2 text-center">
          <a href="/blog/${slug}" class="hover:text-[--color-accent] transition-colors">${title}</a>
        </h2>
        <div class="text-sm text-zinc-400 mb-6 text-center uppercase tracking-wider">
          <span>${postDate}</span>
        </div>
        
        <div class="prose max-w-none text-zinc-700 leading-relaxed">
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
        separator.className = 'my-12 mx-auto w-20 border-t border-zinc-500';
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

      const categoryFilter = new URLSearchParams(window.location.search).get('category');
      const activeLink = categoryFilter
        ? document.querySelector(`#categories a[href="/blog.html?category=${encodeURIComponent(categoryFilter)}"]`)
        : document.querySelector('#categories a[href="/blog.html"]');
      if (activeLink) activeLink.classList.add('font-bold', 'text-[--color-accent]');
  }

  loadBlogPosts();
});
