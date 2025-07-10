// Ruta: netlify/functions/get-posts.js

// Ruta: netlify/functions/get-posts.js

const contentful = require('contentful');

// --- NUEVA: Función para generar el HTML para los bots ---
function generateHtmlForBot(postData, postUrl) {
  // Extraemos los campos del post
  const { title, date, content, image } = postData.fields;

  // Creamos un extracto para las descripciones (155 caracteres, sin HTML)
  const excerpt = content.substring(0, 250).replace(/<[^>]*>/g, '').trim().split(' ').slice(0, 25).join(' ') + '...';

  // Obtenemos la URL de la imagen del post o usamos una por defecto
  const imageUrl = image ? 'https:' + image.fields.file.url : 'https://carlosramirezhernandez.com/assets/og-image-inicio.jpg'; // <-- RECUERDA PONER UNA IMAGEN POR DEFECTO

  // Construimos el documento HTML completo como un string
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - Carlos Ramírez Hernández</title>
      <meta name="description" content="${excerpt}">

      <meta property="og:title" content="${title}">
      <meta property="og:description" content="${excerpt}">
      <meta property="og:image" content="${imageUrl}">
      <meta property="og:url" content="${postUrl}">
      <meta property="og:type" content="article">
      <meta property="article:published_time" content="${date}">
      <meta property="article:author" content="https://carlosramirezhernandez.com">

      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="${title}">
      <meta name="twitter:description" content="${excerpt}">
      <meta name="twitter:image" content="${imageUrl}">
    </head>
    <body>
      <h1>${title}</h1>
      <img src="${imageUrl}" alt="${title}">
      <div>${content}</div>
    </body>
    </html>
  `;
}

// --- Tu función handler principal, ahora modificada ---
exports.handler = async function(event) {
  const { marked } = await import('marked');
  const { CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN } = process.env;

  // --- NUEVO: Detección de Bots ---
  const userAgent = event.headers['user-agent'] || '';
  const isBot = /facebookexternalhit|Twitterbot|WhatsApp|Pinterest|LinkedInBot|Discordbot/i.test(userAgent);
  const { slug } = event.queryStringParameters;

  if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
    return {
      statusCode: 500,
      body: 'Error: Faltan las variables de configuración de Contentful en Netlify.'
    };
  }

  try {
    const client = contentful.createClient({
      space: CONTENTFUL_SPACE_ID,
      accessToken: CONTENTFUL_ACCESS_TOKEN,
    });

    const queryOptions = {
      content_type: 'blogPost',
      order: '-fields.date'
    };

    if (slug) {
      queryOptions['fields.slug'] = slug;
      queryOptions.limit = 1;
    }

    const response = await client.getEntries(queryOptions);

    const processedItems = response.items.map(item => {
      if (item.fields.content) {
        item.fields.content = marked.parse(item.fields.content);
      }
      return item;
    });

    // --- NUEVO: Lógica condicional para devolver HTML o JSON ---
    // Si es un bot y está pidiendo un post específico (hay un slug)
    if (isBot && slug && processedItems.length > 0) {
      const postData = processedItems[0];
      const postUrl = `https://carlosramirezhernandez.com/post.html?slug=${slug}`; // Construimos la URL canónica
      const htmlCompleto = generateHtmlForBot(postData, postUrl);

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body: htmlCompleto,
      };
    } else {
      // Si es un usuario normal o está pidiendo la lista de posts, devolvemos JSON
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedItems),
      };
    }

  } catch (error) {
    console.error('ERROR EN LA FUNCIÓN:', error);
    return {
      statusCode: 500,
      body: `Error al obtener los datos de Contentful: ${error.message}`
    };
  }
};