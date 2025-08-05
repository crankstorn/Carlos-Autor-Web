document.addEventListener('DOMContentLoaded', () => {
  const postsContainer = document.getElementById('posts');
  const categoriesContainer = document.getElementById('categories');
  if (!postsContainer) return;

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

  function displayPosts(posts) {
    postsContainer.innerHTML = '';
    posts.forEach((post, index) => {
      const { title, slug, category, date, content } = post.fields;
      let displayContent;
      let readMoreLink = '';

      // ---------------------------------------------------------------------------------------
      // PASO 2: Simplificar la lógica de visualización de contenido.
      // Simplemente usamos el 'content' que ya es HTML.
      // La lógica de truncado se ha modificado para evitar romper el HTML.
      // ---------------------------------------------------------------------------------------

      // Si no es el primer post en la página principal (sin filtro), mostramos un resumen.
      if (index > 0 || new URLSearchParams(window.location.search).get('category')) {
          // Para el resumen, es mejor mostrar un texto introductorio y un enlace "Leer más".
          // La forma más segura de truncar HTML es compleja. Una solución simple es no truncar
          // o asegurarse de que Contentful provea un campo de "resumen" de texto plano.
          // Por ahora, para que funcione, vamos a mostrar el contenido completo en todos los casos
          // y siempre mostrar el enlace "Leer más" (excepto en el post principal).
          displayContent = content; // Usar el contenido HTML completo
          readMoreLink = `<a href="/blog/${slug}" class="font-semibold text-[--color-accent] hover:underline">Leer más...</a>`;
      } else {
          // Para el primer post en la página principal, muestra el contenido completo
          displayContent = content;
          // No mostramos "Leer más" porque ya está todo el contenido.
      }
      
      // Si estamos en la página de un post individual, el contenido ya es 'displayContent'
      // y no se necesitan más cambios aquí. Esta lógica es para la lista de posts.

      const postDate = date ? new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : "";

      const postElement = document.createElement('article');
      postElement.className = 'py-2';
      
      // Importante: .prose de Tailwind está diseñado para estilizar HTML generado,
      // lo cual es perfecto para nuestro contenido de Contentful.
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