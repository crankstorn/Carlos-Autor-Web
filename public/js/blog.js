// Ruta del archivo: public/js/blog.js

document.addEventListener('DOMContentLoaded', () => {
  const postsContainer = document.getElementById('posts');
  const categoriesContainer = document.getElementById('categories');

  // Si no estamos en la página del blog, no hacemos nada.
  if (!postsContainer) {
    return;
  }

  async function loadBlogPosts() {
    postsContainer.innerHTML = '<p class="text-center text-zinc-400">Cargando artículos...</p>';

    try {
      // 1. Llamamos a nuestra función de Netlify
      const response = await fetch('/.netlify/functions/get-posts');

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.statusText}`);
      }

      const posts = await response.json();

      if (posts.length === 0) {
        postsContainer.innerHTML = '<p class="text-center text-zinc-400">Aún no hay artículos publicados.</p>';
        return;
      }

      // 2. Si todo va bien, mostramos los posts y las categorías
      displayPosts(posts);
      displayCategories(posts);

    } catch (error) {
      console.error('Error al cargar el blog:', error);
      postsContainer.innerHTML = '<p class="text-center text-red-500">No se pudieron cargar los artículos. Inténtalo de nuevo más tarde.</p>';
    }
  }

  function displayPosts(posts) {
    postsContainer.innerHTML = ''; // Limpiar el mensaje de "Cargando..."

    posts.forEach(post => {
      const fields = post.fields;
      // Obtenemos la URL de la imagen de portada de forma segura
      const imageUrl = fields.imagenDePortada?.fields.file.url || 'https://placehold.co/800x400/1A202C/FDFBF7?text=CR';

      const postElement = document.createElement('article');
      // Usamos las clases de Tailwind que ya tienes en tu web
      postElement.className = 'bg-white/5 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300';

      // 3. Creamos el HTML para cada artículo
      postElement.innerHTML = `
        <a href="post.html?slug=${fields.slug}">
            <img src="${imageUrl}" alt="Imagen de portada para ${fields.titulo}" class="w-full h-64 object-cover rounded-md mb-6">
        </a>
        <div class="text-sm text-zinc-400 mb-2">
          <span class="font-semibold text-[--color-accent] uppercase tracking-wider">${fields.categoria}</span> &middot;
          <span>${new Date(fields.fechaDePublicacion).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <h2 class="text-3xl font-serif mb-3">
          <a href="post.html?slug=${fields.slug}" class="hover:text-[--color-accent] transition-colors">${fields.titulo}</a>
        </h2>
        <p class="text-zinc-400 mb-6">${fields.resumen}</p>
        <a href="post.html?slug=${fields.slug}" class="font-semibold text-[--color-accent] hover:underline">Leer más &rarr;</a>
      `;
      postsContainer.appendChild(postElement);
    });
  }

  function displayCategories(posts) {
      if (!categoriesContainer) return;

      // Usamos un Set para obtener categorías únicas sin repetición
      const allCategories = [...new Set(posts.map(p => p.fields.categoria).filter(Boolean))];

      categoriesContainer.innerHTML = '<a href="/blog.html" class="hover:text-[--color-accent] transition-colors">Todo</a>';

      allCategories.forEach(cat => {
          // Nota: Por ahora, los enlaces de categoría no filtran. Es el siguiente paso.
          categoriesContainer.innerHTML += ` <span class="text-zinc-500">/</span> <a href="#" class="hover:text-[--color-accent] transition-colors">${cat}</a>`;
      });
  }

  loadBlogPosts();
});