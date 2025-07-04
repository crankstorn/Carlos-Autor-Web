document.addEventListener('DOMContentLoaded', () => {
  const postsContainer = document.getElementById('posts');
  const categoriesContainer = document.getElementById('categories');

  if (!postsContainer) {
    return;
  }

  async function loadBlogPosts() {
    // MENSAJE DE CARGA RESTAURADO
    postsContainer.innerHTML = '<p class="text-center text-zinc-400">Cargando artículos...</p>';

    try {
      const response = await fetch('/.netlify/functions/get-posts');
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.statusText}`);
      }
      const posts = await response.json();
    
      // ESTA LÍNEA ES LA QUE NECESITAMOS AÑADIR
      console.log('Datos recibidos de Contentful:', posts);

      if (posts.length === 0) {
        postsContainer.innerHTML = '<p class="text-center text-zinc-400">Aún no hay artículos publicados.</p>';
        return;
      }
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
      // MENSAJE DE ERROR RESTAURADO
      postsContainer.innerHTML = '<p class="text-center text-red-500">No se pudieron cargar los artículos. Inténtalo de nuevo más tarde.</p>';
    }
  }

function displayPosts(posts) {
    postsContainer.innerHTML = ''; // Limpiar el mensaje de "Cargando..."

    posts.forEach(post => {
      const fields = post.fields;

      // CORRECCIÓN: El campo de imagen es "image"
      const imageUrl = fields.image?.fields.file.url || 'https://placehold.co/800x400/1A202C/FDFBF7?text=CR';

      const postElement = document.createElement('article');
      postElement.className = 'bg-white/5 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300';

      postElement.innerHTML = `
        <a href="post.html?slug=${fields.slug}">
            <img src="${imageUrl}" alt="Imagen de portada para ${fields.title}" class="w-full h-64 object-cover rounded-md mb-6">
        </a>
        <div class="text-sm text-zinc-400 mb-2">
          <span class="font-semibold text-[--color-accent] uppercase tracking-wider">${fields.category}</span> &middot;
          <span>${new Date(fields.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <h2 class="text-3xl font-serif mb-3">
          <a href="post.html?slug=${fields.slug}" class="hover:text-[--color-accent] transition-colors">${fields.title}</a>
        </h2>
        <p class="text-zinc-400 mb-6">${fields.summary}</p>
        <a href="post.html?slug=${fields.slug}" class="font-semibold text-[--color-accent] hover:underline">Leer más &rarr;</a>
      `;
      postsContainer.appendChild(postElement);
    });
}

  function displayCategories(posts) {
      if (!categoriesContainer) return;

      const allCategories = [...new Set(posts.map(p => p.fields.categoria).filter(Boolean))];

      categoriesContainer.innerHTML = '<a href="/blog.html" class="hover:text-[--color-accent] transition-colors">Todo</a>';

      allCategories.forEach(cat => {
          categoriesContainer.innerHTML += ` <span class="text-zinc-500">/</span> <a href="#" class="hover:text-[--color-accent] transition-colors">${cat}</a>`;
      });
  }

  loadBlogPosts();
});