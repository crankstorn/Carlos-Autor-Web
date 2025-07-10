// Ruta: netlify/functions/get-posts.js

// Importamos el cliente de Contentful
const contentful = require('contentful');

/**
 * Función auxiliar para generar un documento HTML completo para un post.
 * Esto es lo que se le entregará a los bots de redes sociales para que generen vistas previas correctas.
 * @param {object} postData - El objeto del post obtenido de Contentful.
 * @param {string} postUrl - La URL canónica completa del post.
 * @returns {string} - Una cadena de texto con el HTML completo.
 */
function generateHtmlForBot(postData, postUrl) {
  // Extraemos los campos del post de forma segura
  const { title, date, content: htmlContent, image, excerpt: rawExcerpt } = postData.fields;

  // Creamos una descripción. Usará el campo 'excerpt' si existe, si no, lo generará del contenido.
  // RECOMENDACIÓN: Añade un campo de texto simple llamado 'excerpt' a tu modelo de Blog en Contentful para tener control total.
  const description = rawExcerpt || (htmlContent ? htmlContent.substring(0, 250).replace(/<[^>]*>/g, '').trim().split(' ').slice(0, 25).join(' ') + '...' : 'Un artículo de Carlos Ramírez Hernández');

  // Comprobación segura para la URL de la imagen. Si no hay imagen en el post, usa una por defecto.
  let imageUrl = 'https://carlosramirezhernandez.com/assets/og-image-inicio.jpg'; // Imagen por defecto
  if (image && image.fields && image.fields.file && image.fields.file.url) {
    imageUrl = 'https:' + image.fields.file.url;
  }

  // Construimos el documento HTML completo que verá el bot
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - Carlos Ramírez Hernández</title>
      <meta name="description" content="${description}">

      <!-- Open Graph / Facebook / WhatsApp -->
      <meta property="og:title" content="${title}">
      <meta property="og:description" content="${description}">
      <meta property="og:image" content="${imageUrl}">
      <meta property="og:url" content="${postUrl}">
      <meta property="og:type" content="article">
      <meta property="article:published_time" content="${date}">
      <meta property="article:author" content="https://carlosramirezhernandez.com">

      <!-- Twitter Cards -->
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="${title}">
      <meta name="twitter:description" content="${description}">
      <meta name="twitter:image" content="${imageUrl}">
    </head>
    <body>
      <h1>${title}</h1>
      <img src="${imageUrl}" alt="${title}">
      <div>${htmlContent || ''}</div>
    </body>
    </html>
  `;
}

// --- Función principal de Netlify (Handler) ---
exports.handler = async function(event) {
  // Importamos 'marked' de forma dinámica, como requiere Netlify Functions
  const { marked } = await import('marked');

  // Obtenemos las variables de entorno de forma segura
  const { CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN } = process.env;

  // Detectamos si el visitante es un bot conocido
  const userAgent = event.headers['user-agent'] || '';
  const isBot = /facebookexternalhit|Twitterbot|WhatsApp|Pinterest|LinkedInBot|Discordbot/i.test(userAgent);
  const { slug } = event.queryStringParameters;

  // Comprobación de seguridad para las variables de entorno
  if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
    return {
      statusCode: 500,
      body: 'Error: Faltan las variables de configuración de Contentful en Netlify.'
    };
  }

  try {
    // Creamos el cliente de Contentful
    const client = contentful.createClient({
      space: CONTENTFUL_SPACE_ID,
      accessToken: CONTENTFUL_ACCESS_TOKEN,
    });

    // Opciones de la consulta a Contentful
    const queryOptions = {
      content_type: 'blogPost',
      order: '-fields.date'
    };

    // Si se pide un post específico, ajustamos la consulta
    if (slug) {
      queryOptions['fields.slug'] = slug;
      queryOptions.limit = 1;
    }

    // Hacemos la llamada a la API de Contentful
    const response = await client.getEntries(queryOptions);

    // Procesamos los items: convertimos el Markdown del campo 'content' a HTML
    const processedItems = response.items.map(item => {
      // Creamos una copia para no modificar el objeto original
      const newItem = { ...item };
      if (newItem.fields && newItem.fields.content) {
        newItem.fields.content = marked.parse(newItem.fields.content);
      }
      return newItem;
    });

    // --- LÓGICA CONDICIONAL ---
    // Si es un bot y está pidiendo un post específico que hemos encontrado...
    if (isBot && slug && processedItems.length > 0) {
      const postData = processedItems[0];
      const postUrl = `https://carlosramirezhernandez.com/post.html?slug=${slug}`;
      const htmlCompleto = generateHtmlForBot(postData, postUrl);

      // ...devolvemos el HTML pre-renderizado.
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body: htmlCompleto,
      };
    } else {
      // Para todos los demás casos (usuarios normales, lista de posts), devolvemos JSON.
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