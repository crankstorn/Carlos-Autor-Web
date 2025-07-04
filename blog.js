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

    posts.forEach(post => {
      // Accede directamente a post.fields, que contiene todos tus datos.
      const { title, slug, category, summary, date, image } = post.fields;

      let imageHTML = '';
      if (image && image.fields && image.fields.file) {
        const imageUrl = 'https:' + image.fields.file.url;
        const imageAlt = image.fields.description || title || "Imagen del post";
        imageHTML = `
          <a href="post.html?slug=${slug || '#'}">
              <img src="${imageUrl}" alt="${imageAlt}" class="w-full h-64 object-cover rounded-md mb-6">
          </a>
        `;
      }

      // Usa los valores, con un respaldo por si alguno es nulo.
      const postTitle = title || "Título no disponible";
      const postCategory = category || "General";
      const postSummary = summary || "";
      const postDate = date ? new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : "Fecha no disponible";

      const postElement = document.createElement('article');
      postElement.className = 'bg-white/5 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300';

      postElement.innerHTML = `
        ${imageHTML}
        <div class="text-sm text-zinc-400 mb-2">
          <span class="font-semibold text-[--color-accent] uppercase tracking-wider">${postCategory}</span>
          <span>&middot; ${postDate}</span>
        </div>
        <h2 class="text-3xl font-serif mb-3">
          <a href="post.html?slug=${slug || '#'}" class="hover:text-[--color-accent] transition-colors">${postTitle}</a>
        </h2>
        <p class="text-zinc-400 mb-6">${postSummary}</p>
        <a href="post.html?slug=${slug || '#'}" class="font-semibold text-[--color-accent] hover:underline">Leer más &rarr;</a>
      `;
      postsContainer.appendChild(postElement);
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
