// Ruta: netlify/functions/get-posts.js

// Solo requerimos 'contentful' al principio, que sí usa el sistema antiguo.
const contentful = require('contentful');

// La función principal se mantiene igual.
exports.handler = async function(event) {
  // --- INICIO DE LA CORRECCIÓN ---
  // Importamos 'marked' de forma dinámica dentro de la función asíncrona.
  // Esto es compatible con los ES Modules.
  const { marked } = await import('marked');
  // --- FIN DE LA CORRECCIÓN ---

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

    // El resto del código funciona igual, porque 'marked' ya está cargado.
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
