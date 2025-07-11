document.addEventListener('DOMContentLoaded', () => {
  const postContainer = document.getElementById('post-content');
  if (!postContainer) return;

  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const postSlug = pathParts[pathParts.length - 1];

  if (!postSlug || pathParts[0] !== 'blog') {
    postContainer.innerHTML = '<p class="text-center text-red-500">No se ha especificado ningún artículo.</p>';
    return;
  }

  async function loadPost() {
    try {
      const response = await fetch(`/.netlify/functions/get-posts?slug=${postSlug}`);
      if (!response.ok) throw new Error(`Error del servidor: ${response.statusText}`);

      const posts = await response.json();
      if (posts.length === 0) throw new Error('El artículo no fue encontrado.');

      displayPost(posts[0]);
    } catch (error) {
      console.error('Error al cargar el post:', error);
      postContainer.innerHTML = `<p class="text-center text-red-500">${error.message}</p>`;
    }
  }

  function displayPost(post) {
    const { title, date, content, category, image, slug } = post.fields;

    const postUrl = `https://carlosramirezhernandez.com/blog/${slug}`;
    const excerpt = content ? content.replace(/<[^>]*>/g, '').trim().substring(0, 155) + '...' : 'Lee este artículo.';

    let ogImageUrl = 'https://carlosramirezhernandez.com/assets/og-image-inicio.jpg';
    let ogImageWidth = '1200';
    let ogImageHeight = '630';
    let ogImageType = 'image/jpeg';

    if (image && image.fields && image.fields.file) {
      ogImageUrl = 'https:' + image.fields.file.url;
      if (image.fields.file.details && image.fields.file.details.image) {
          ogImageWidth = image.fields.file.details.image.width;
          ogImageHeight = image.fields.file.details.image.height;
      }
      if (image.fields.file.contentType) {
          ogImageType = image.fields.file.contentType;
      }
    }

    // Actualizamos las metaetiquetas del <head>
    document.title = `${title} - Carlos Ramírez Hernández`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', excerpt);

    // Open Graph (Facebook, etc.)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', postUrl);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', excerpt);
    document.querySelector('meta[property="og:image"]')?.setAttribute('content', ogImageUrl);
    document.querySelector('meta[property="og:image:width"]')?.setAttribute('content', ogImageWidth);
    document.querySelector('meta[property="og:image:height"]')?.setAttribute('content', ogImageHeight);
    document.querySelector('meta[property="og:image:type"]')?.setAttribute('content', ogImageType);

    // Actualizamos las etiquetas específicas de Twitter
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', excerpt);
    document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', ogImageUrl);


    // El resto del código para mostrar el post se mantiene igual
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
  }

  loadPost();
});
