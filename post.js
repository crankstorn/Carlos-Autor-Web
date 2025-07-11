document.addEventListener('DOMContentLoaded', () => {
  // 1. Identificamos el contenedor donde irá el contenido del post.
  const postContainer = document.getElementById('post-content');

  // 2. Verificación CRÍTICA: Si este contenedor no existe en post.html, el script se detiene.
  if (!postContainer) {
    console.error('Error Fatal: No se encontró el elemento con id="post-content" en el archivo post.html. No se puede cargar el artículo.');
    return;
  }

  // 3. Extraemos el "slug" (identificador del post) de la URL de forma segura.
  // Por ejemplo, de "/blog/mi-post-genial", extrae "mi-post-genial".
  const pathParts = window.location.pathname.split('/').filter(part => part.length > 0);
  const postSlug = pathParts[pathParts.length - 1];

  // Si no se encuentra un slug, muestra un error.
  if (!postSlug || pathParts[0] !== 'blog') {
    postContainer.innerHTML = '<p class="text-center text-red-500">URL inválida. No se pudo encontrar el artículo.</p>';
    console.error('No se pudo extraer un slug válido de la URL o la ruta no comienza con /blog/.');
    return;
  }

  // 4. Función principal para cargar y mostrar el post.
  async function loadPost() {
    // Mostramos un mensaje de carga mientras se obtienen los datos.
    postContainer.innerHTML = '<p class="text-center text-zinc-400">Cargando artículo...</p>';
    try {
      // Llamamos a nuestra función de Netlify pasándole el slug.
      const response = await fetch(`/.netlify/functions/get-posts?slug=${postSlug}`);

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }

      const posts = await response.json();

      // Si la función no devuelve ningún post, mostramos un error.
      if (!posts || posts.length === 0) {
        throw new Error(`El artículo con el identificador "${postSlug}" no fue encontrado.`);
      }

      // Si todo va bien, llamamos a la función que pinta el post en pantalla.
      displayPost(posts[0]);

    } catch (error) {
      console.error('Error detallado al cargar el post:', error);
      postContainer.innerHTML = `<p class="text-center text-red-500">Hubo un problema al cargar el artículo. ${error.message}</p>`;
    }
  }

  // 5. Función que construye el HTML del post y actualiza la página.
  function displayPost(post) {
    const { title, date, content, category, image, slug } = post.fields;
    const postUrl = `https://carlosramirezhernandez.com/blog/${slug}`;
    const excerpt = content ? content.replace(/<[^>]*>/g, '').trim().substring(0, 155) + '...' : 'Lee este artículo en el blog de Carlos Ramírez Hernández.';
    let ogImageUrl = 'https://carlosramirezhernandez.com/assets/og-image-inicio.jpg';
    if (image && image.fields && image.fields.file) {
      ogImageUrl = 'https:' + image.fields.file.url;
    }

    // Actualiza las metaetiquetas para SEO y para compartir en redes sociales.
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

    // Pinta el contenido final en el contenedor.
    postContainer.innerHTML = `
      <h1 class="text-4xl lg:text-5xl font-serif text-center mb-4">${title}</h1>
      <div class="text-sm text-zinc-400 text-center mb-8">
        <span>${postDate}</span>
      </div>
      ${imageHTML}
      <div class="prose lg:prose-xl max-w-none text-zinc-700 space-y-6 leading-relaxed">
        ${content}
      </div>
      <hr class="my-8 w-20 mx-auto border-t border-zinc-500">
      <div class="text-center text-sm text-zinc-500">
        Publicado en ${categoryLinksHTML} el ${postDate}.
      </div>
    `;
  }

  // 6. Ejecutamos la función principal para que todo comience.
  loadPost();
});
