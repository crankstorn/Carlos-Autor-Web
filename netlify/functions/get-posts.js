// Ruta: netlify/functions/get-posts.js

const contentful = require('contentful');

exports.handler = async function(event) {
  // Importamos 'marked' de forma dinámica. Esto es crucial.
  const { marked } = await import('marked');

  const { CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN } = process.env;
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

    // --- LA TRADUCCIÓN OCURRE AQUÍ ---
    // Este bloque convierte el Markdown de Contently a HTML.
    const processedItems = response.items.map(item => {
      if (item.fields.content) {
        item.fields.content = marked.parse(item.fields.content);
      }
      return item;
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(processedItems),
    };

  } catch (error) {
    console.error('ERROR EN LA FUNCIÓN:', error);
    return {
      statusCode: 500,
      body: `Error al obtener los datos de Contentful: ${error.message}`
    };
  }
};
