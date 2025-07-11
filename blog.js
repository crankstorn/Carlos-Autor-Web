document.addEventListener('DOMContentLoaded', () => {
  const postsContainer = document.getElementById('posts');
  const categoriesContainer = document.getElementById('categories');

  if (!postsContainer) {
    return;
  }

  // Función para convertir el contenido de Contentful (que puede tener saltos de línea) a HTML.
  function formatContent(text) {
    if (!text) return '';
    // Reemplaza múltiples saltos de línea con cierres y aperturas de párrafos.
    let htmlContent = text.split(/\n\s*\n/).map(paragraph => `<p>${paragraph.trim()}</p>`).join('');
    // Reemplaza saltos de línea individuales con <br>.
    htmlContent = htmlContent.replace(/(?<!>)(\n)(?!<)/g, '<br>');
    return htmlContent;
  }


  async function loadBlogPosts() {
    postsContainer.innerHTML = '<p class="text-center text-zinc-400">Cargando artículos...</p>';

    const params = new URLSearchParams(window.location.search);
    const categoryFilter = params.get('category');

    try {
      // La llamada a la función no cambia.
      const response = await fetch('/.netlify/functions/get-posts');
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.statusText}`);
      }
      let allPosts = await response.json();
      let postsToDisplay = allPosts;

      if (categoryFilter) {
        postsToDisplay = allPosts.filter(post => {
            if (!post.fields.category) return false;
            // Maneja tanto si 'category' es un array como si es un string.
            return Array.isArray(post.fields.category)
                ? post.fields.category.includes(categoryFilter)
                : post.fields.category === categoryFilter;
        });
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
      postsContainer.innerHTML = '';

      posts.forEach((post, index) => {
        const { title, slug, category, date, content } = post.fields;

        let displayContent;
        let readMoreLink = '';

        // El primer post se muestra completo.
        if (index === 0) {
          displayContent = formatContent(content);
        } else {
          const wordLimit = 55;
          const words = (content || '').split(/\s+/);
          let truncatedContent = content;

          if (words.length > wordLimit) {
            truncatedContent = words.slice(0, wordLimit).join(' ') + ' [...]';
          }
          displayContent = formatContent(truncatedContent);

          // **CORRECCIÓN CLAVE VERIFICADA**: El enlace "Leer más" usa la URL limpia.
          readMoreLink = `<a href="/blog/${slug}" class="font-semibold text-[--color-accent] hover:underline">Leer más</a>`;
        }

        const postDate = date ? new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : "Fecha no disponible";

        const categoryArray = Array.isArray(category) ? category : [category].filter(Boolean);
        const categoryLinks = categoryArray.map(cat => `<a href="/blog.html?category=${encodeURIComponent(cat)}" class="text-[--color-accent] hover:underline uppercase tracking-wider">${cat}</a>`).join(', ');

        const postElement = document.createElement('article');
        postElement.className = 'py-2';

        postElement.innerHTML = `
          <h2 class="text-4xl font-serif mb-2 text-center">
            <!-- **CORRECCIÓN CLAVE VERIFICADA**: El enlace del título usa la URL limpia. -->
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
            ${readMoreLink && categoryLinks ? `<span class="text-zinc-400 mx-2">|</span>` : ''}
            ${categoryLinks ? `<span class="text-zinc-500">Publicado en ${categoryLinks}</span>` : ''}
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

      const allCategories = [...new Set(allPosts.flatMap(p => p.fields.category).filter(Boolean))];

      let categoriesHTML = '<a href="/blog.html" class="hover:text-[--color-accent] transition-colors">Todo</a>';
      allCategories.forEach(cat => {
          categoriesHTML += ` <span class="text-zinc-500">/</span> <a href="/blog.html?category=${encodeURIComponent(cat)}" class="hover:text-[--color-accent] transition-colors">${cat}</a>`;
      });
      categoriesContainer.innerHTML = categoriesHTML;

      const params = new URLSearchParams(window.location.search);
      const categoryFilter = params.get('category');

      document.querySelectorAll('#categories a').forEach(link => link.classList.remove('font-bold', 'text-[--color-accent]'));

      let activeLink;
      if (categoryFilter) {
          activeLink = document.querySelector(`#categories a[href="/blog.html?category=${encodeURIComponent(categoryFilter)}"]`);
      } else {
          activeLink = document.querySelector('#categories a[href="/blog.html"]');
      }

      if (activeLink) {
        activeLink.classList.add('font-bold', 'text-[--color-accent]');
      }
  }

  loadBlogPosts();
});
