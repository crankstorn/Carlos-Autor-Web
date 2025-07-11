document.addEventListener('DOMContentLoaded', () => {
  // 1. Identificamos el contenedor donde irá el contenido del post.
  const postContainer = document.getElementById('post-content');

  // 2. Verificación CRÍTICA: Si este contenedor no existe en post.html, el script se detiene.
  if (!postContainer) {
    console.error('Error Fatal: No se encontró el elemento con id="post-content" en el archivo post.html. No se puede cargar el artículo.');
    return;
  }

  // 3. Extraemos el "slug" (identificador del post) de la URL de forma segura.
  const pathParts = window.location.pathname.split('/').filter(part => part.length > 0);
  const postSlug = pathParts[pathParts.length - 1];

  if (!postSlug || pathParts[0] !== 'blog') {
    postContainer.innerHTML = '<p class="text-center text-red-500">URL inválida. No se pudo encontrar el artículo.</p>';
    console.error('No se pudo extraer un slug válido de la URL o la ruta no comienza con /blog/.');
    return;
  }

  // 4. Función principal para cargar y mostrar el post.
  async function loadPost() {
    console.log(`[DIAGNÓSTICO] Iniciando carga para el slug: "${postSlug}"`);
    postContainer.innerHTML = '<p class="text-center text-zinc-400">Cargando artículo...</p>';

    try {
      const fetchURL = `/.netlify/functions/get-posts?slug=${postSlug}`;
      console.log(`[DIAGNÓSTICO] Realizando fetch a: ${fetchURL}`);

      const response = await fetch(fetchURL);
      console.log('[DIAGNÓSTICO] Respuesta del fetch recibida.', response);

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }

      console.log('[DIAGNÓSTICO] Parseando respuesta como JSON...');
      const posts = await response.json();
      console.log('[DIAGNÓSTICO] Datos JSON recibidos:', posts);

      if (!posts || posts.length === 0) {
        throw new Error(`El artículo con el identificador "${postSlug}" no fue encontrado en la respuesta de la API.`);
      }

      console.log('[DIAGNÓSTICO] Post encontrado. Llamando a displayPost...');
      displayPost(posts[0]);

    } catch (error) {
      console.error('[DIAGNÓSTICO] Ocurrió un error en el bloque try/catch:', error);
      postContainer.innerHTML = `<p class="text-center text-red-500">Hubo un problema al cargar el artículo. Por favor, revisa la consola para más detalles. Error: ${error.message}</p>`;
    }
  }

  // 5. Función que construye el HTML del post y actualiza la página.
  function displayPost(post) {
    console.log(`[DIAGNÓSTICO] Mostrando el post titulado: "${post.fields.title}"`);
    const { title, date, content, category, image, slug } = post.fields;
    const postUrl = `https://carlosramirezhernandez.com/blog/${slug}`;
    const excerpt = content ? content.replace(/<[^>]*>/g, '').trim().substring(0, 155) + '...' : 'Lee este artículo en el blog de Carlos Ramírez Hernández.';
    let ogImageUrl = 'https://carlosramirezhernandez.com/assets/og-image-inicio.jpg';
    if (image && image.fields && image.fields.file) {
      ogImageUrl = 'https:' + image.fields.file.url;
    }

    document.title = `${title} - Carlos Ramírez Hernández`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', excerpt);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', postUrl);
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
    const categoryArray = Array.isArray(category) ? category : [category].filter(Boolean);
    const categoryLinksHTML = categoryArray.map(cat =>
        `<a href="/blog.html?category=${encodeURIComponent(cat)}" class="text-[--color-accent] hover:underline">${cat}</a>`
    ).join(', ');

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
    console.log('[DIAGNÓSTICO] Renderizado del post completado.');
  }

  // 6. Ejecutamos la función principal para que todo comience.
  loadPost();
});
