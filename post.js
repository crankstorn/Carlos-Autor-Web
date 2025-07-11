document.addEventListener('DOMContentLoaded', () => {
  const postContainer = document.getElementById('post-content');
  if (!postContainer) return;

  // --- OBTENEMOS EL SLUG DE LA NUEVA URL LIMPIA ---
  // De "/blog/bienvenidos-al-viaje", extraemos "bienvenidos-al-viaje".
  // Esto funciona gracias a la regla de reescritura en netlify.toml.
  const pathParts = window.location.pathname.split('/');
  const postSlug = pathParts.pop() || pathParts.pop(); // Maneja trailing slash

  if (!postSlug) {
    postContainer.innerHTML = '<p class="text-center text-red-500">No se ha especificado ningún artículo.</p>';
    return;
  }

  // Carga los datos del post específico usando el slug.
  async function loadPost() {
    try {
      // Llamamos a nuestra función/API para obtener los datos del post.
      const response = await fetch(`/.netlify/functions/get-posts?slug=${postSlug}`);
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.statusText}`);
      }
      const posts = await response.json();

      if (posts.length === 0) {
        throw new Error('El artículo no fue encontrado.');
      }

      displayPost(posts[0]);

    } catch (error) {
      console.error('Error al cargar el post:', error);
      postContainer.innerHTML = `<p class="text-center text-red-500">${error.message}</p>`;
    }
  }

  // Pinta el contenido del post en la página y actualiza las metaetiquetas.
  function displayPost(post) {
    const { title, date, content, category, image } = post.fields;

    // **CORRECCIÓN CLAVE**: La URL canónica y para compartir es la URL limpia.
    const postUrl = `https://carlosramirezhernandez.com/blog/${postSlug}`;

    // Genera un extracto para las metaetiquetas.
    const excerpt = content ? content.replace(/<[^>]*>/g, '').trim().split(' ').slice(0, 25).join(' ') + '...' : 'Lee este artículo en el blog de Carlos Ramírez Hernández.';
    let ogImageUrl = 'https://carlosramirezhernandez.com/assets/og-image-inicio.jpg';

    if (image && image.fields && image.fields.file) {
      ogImageUrl = 'https:' + image.fields.file.url;
    }

    // Actualiza dinámicamente las etiquetas del <head>.
    // Esto es para el usuario. Los bots recibirán esto pre-renderizado por Netlify.
    document.title = `${title} - Carlos Ramírez Hernández`;
    document.querySelector('meta[name="description"]').setAttribute('content', excerpt);
    document.querySelector('link[rel="canonical"]').setAttribute('href', postUrl);
    document.querySelector('meta[property="og:title"]').setAttribute('content', title);
    document.querySelector('meta[property="og:url"]').setAttribute('content', postUrl);
    document.querySelector('meta[property="og:description"]').setAttribute('content', excerpt);
    document.querySelector('meta[property="og:image"]').setAttribute('content', ogImageUrl);

    let imageHTML = '';
    if (image && image.fields && image.fields.file) {
      const imageUrl = 'https:' + image.fields.file.url;
      const imageAlt = image.fields.description || title;
      imageHTML = `<img src="${imageUrl}" alt="${imageAlt}" class="w-full h-auto object-cover rounded-md mb-8">`;
    }

    const postDate = new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    const separatorHTML = '<hr class="my-8 w-20 mx-auto border-t border-zinc-500">';
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
