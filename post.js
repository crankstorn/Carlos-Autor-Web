document.addEventListener('DOMContentLoaded', () => {
  const postContainer = document.getElementById('post-content');
  if (!postContainer) return;

  // 1. Obtener el slug de la URL
  const params = new URLSearchParams(window.location.search);
  const postSlug = params.get('slug');

  if (!postSlug) {
    postContainer.innerHTML = '<p class="text-center text-red-500">No se ha especificado ningún artículo.</p>';
    return;
  }

  // 2. Cargar los datos del post específico
  async function loadPost() {
    try {
      // Hacemos la petición a la misma función, pero ahora con el parámetro slug
      const response = await fetch(`/.netlify/functions/get-posts?slug=${postSlug}`);
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.statusText}`);
      }
      const posts = await response.json();

      if (posts.length === 0) {
        throw new Error('El artículo no fue encontrado.');
      }

      // El post que queremos es el primero (y único) del array
      displayPost(posts[0]);

    } catch (error) {
      console.error('Error al cargar el post:', error);
      postContainer.innerHTML = `<p class="text-center text-red-500">${error.message}</p>`;
    }
  }

  // 3. Mostrar el post en la página
  function displayPost(post) {
    const { title, date, content, category, image } = post.fields;

    document.title = `${title} - Carlos Ramírez Hernández`;

    let imageHTML = '';
    if (image && image.fields && image.fields.file) {
      const imageUrl = 'https:' + image.fields.file.url;
      const imageAlt = image.fields.description || title;
      imageHTML = `<img src="${imageUrl}" alt="${imageAlt}" class="w-full h-auto object-cover rounded-md mb-8">`;
    }

    const postDate = new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

    // --- Lógica para la sección final del post (sin cambios) ---
    const separatorHTML = '<hr class="my-8 w-24 mx-auto border-t border-zinc-300">';
    let categoryLinksHTML = '';

    if (category) {
      const categories = Array.isArray(category) ? category : [category];
      categoryLinksHTML = categories.map(cat =>
          `<a href="/blog.html?category=${encodeURIComponent(cat)}" class="text-[--color-accent] hover:underline">${cat}</a>`
      ).join(', ');
    }

    const postFooterHTML = `
      ${separatorHTML}
      <div class="text-center text-sm text-zinc-500">
        Publicado en ${categoryLinksHTML} el ${postDate}.
      </div>
    `;

    // --- Fin de la lógica para la sección final ---

    postContainer.innerHTML = `
      <h1 class="text-4xl lg:text-5xl font-serif text-center mb-4">${title}</h1>

      <div class="text-sm text-zinc-400 text-center mb-8">
        <span>${postDate}</span>
      </div>

      ${imageHTML}
      <div class="prose lg:prose-xl max-w-none text-zinc-700 space-y-6 leading-relaxed">
        ${content}
      </div>

      ${postFooterHTML}
    `;
  }

  loadPost();
});