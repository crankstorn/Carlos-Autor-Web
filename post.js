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

    // Cambiamos el título de la página
    document.title = `${title} - Carlos Ramírez Hernández`;

    let imageHTML = '';
    if (image && image.fields && image.fields.file) {
      const imageUrl = 'https:' + image.fields.file.url;
      const imageAlt = image.fields.description || title;
      imageHTML = `<img src="${imageUrl}" alt="${imageAlt}" class="w-full h-auto object-cover rounded-md mb-8">`;
    }

    const postDate = new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

    // Aquí usamos el campo 'content' que antes no usábamos
    postContainer.innerHTML = `
      <div class="text-sm text-zinc-400 mb-2">
        <span class="font-semibold text-[--color-accent] uppercase tracking-wider">${category}</span>
        &middot; <span>${postDate}</span>
      </div>
      <h1 class="text-4xl lg:text-5xl font-serif mb-6">${title}</h1>
      ${imageHTML}
      <div class="prose prose-invert lg:prose-xl max-w-none text-zinc-300">
        ${content}
      </div>
    `;
  }

  loadPost();
});