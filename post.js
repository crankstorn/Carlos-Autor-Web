// Basado en tu archivo original que funcionaba.
// Versión con diagnóstico para encontrar el punto de fallo.

document.addEventListener('DOMContentLoaded', () => {
  const postContainer = document.getElementById('post-content');
  if (!postContainer) {
    console.error("Error Crítico: El contenedor #post-content no existe en el HTML.");
    return;
  }
  console.log("[Paso 1 de 5] Contenedor #post-content encontrado.");

  // --- CAMBIO CLAVE ---
  // En lugar de leer "?slug=...", leemos el final de la ruta "/blog/mi-slug".
  const pathParts = window.location.pathname.split('/').filter(Boolean); // Elimina partes vacías
  const postSlug = pathParts[pathParts.length - 1];
  console.log(`[Paso 2 de 5] La URL es "${window.location.pathname}". Slug extraído: "${postSlug}".`);

  if (!postSlug || pathParts[0] !== 'blog') {
    postContainer.innerHTML = '<p class="text-center text-red-500">No se ha especificado un artículo válido.</p>';
    console.error(`Error: El slug o la ruta no son válidos. Parts: ${pathParts}`);
    return;
  }
  console.log("[Paso 3 de 5] El slug es válido. Procediendo a cargar el post.");

  async function loadPost() {
    try {
      const fetchURL = `/.netlify/functions/get-posts?slug=${postSlug}`;
      console.log(`[Paso 4 de 5] Intentando hacer fetch a la URL: ${fetchURL}`);
      const response = await fetch(fetchURL);

      console.log(`[Paso 5 de 5] Respuesta recibida del servidor. Status: ${response.status}`);
      if (!response.ok) {
        throw new Error(`El servidor respondió con un error: ${response.status} ${response.statusText}`);
      }

      const posts = await response.json();
      console.log("Datos JSON recibidos:", posts);

      if (posts.length === 0) {
        throw new Error('La API funcionó, pero no devolvió ningún artículo para este slug.');
      }

      console.log("Post encontrado. Llamando a displayPost...");
      displayPost(posts[0]);

    } catch (error) {
      console.error('Error final al cargar el post:', error);
      postContainer.innerHTML = `<p class="text-center text-red-500">Error: ${error.message}. Revisa la consola para más detalles.</p>`;
    }
  }

  function displayPost(post) {
    console.log(`Renderizando el post: "${post.fields.title}"`);
    const { title, date, content, category, image, slug } = post.fields;

    // Aseguramos que la URL canónica y para compartir sea la nueva URL limpia.
    const postUrl = `https://carlosramirezhernandez.com/blog/${slug}`;
    const excerpt = content ? content.replace(/<[^>]*>/g, '').trim().substring(0, 155) + '...' : 'Lee este artículo.';
    let ogImageUrl = 'https://carlosramirezhernandez.com/assets/og-image-inicio.jpg';
    if (image && image.fields && image.fields.file) {
      ogImageUrl = 'https:' + image.fields.file.url;
    }

    // Actualizamos las metaetiquetas del <head> para el SEO y las redes sociales.
    document.title = `${title} - Carlos Ramírez Hernández`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', excerpt);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', postUrl);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', excerpt);
    document.querySelector('meta[property="og:image"]')?.setAttribute('content', ogImageUrl);

    let imageHTML = '';
    if (image && image.fields && image.fields.file) {
      const imageUrl = 'https:' + image.fields.file.url;
      const imageAlt = image.fields.description || title;
      imageHTML = `<img src="${imageUrl}" alt="${imageAlt}" class="w-full h-auto object-cover rounded-md mb-8">`;
    }

    const postDate = new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    const categoryLinksHTML = (Array.isArray(category) ? category : [category].filter(Boolean))
      .map(cat => `<a href="/blog.html?category=${encodeURIComponent(cat)}" class="text-[--color-accent] hover:underline">${cat}</a>`)
      .join(', ');

    postContainer.innerHTML = `
      <h1 class="text-4xl lg:text-5xl font-serif text-center mb-4">${title}</h1>
      <div class="text-sm text-zinc-400 text-center mb-8">
        <span>${postDate}</span>
      </div>
      ${imageHTML}
      <div class="prose lg:prose-xl max-w-none text-zinc-700 space-y-6 leading-relaxed">
        ${content || ''}
      </div>
      <hr class="my-8 w-20 mx-auto border-t border-zinc-500">
      <div class="text-center text-sm text-zinc-500">
        Publicado en ${categoryLinksHTML} el ${postDate}.
      </div>
    `;
    console.log("Renderizado completado con éxito.");
  }

  loadPost();
});
