// Ruta: netlify/functions/get-posts.js
const contentful = require('contentful');

exports.handler = async function(event) {
  const { CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN } = process.env;

  // Obtenemos el slug de los parámetros de la URL, si existe.
  const { slug } = event.queryStringParameters;

  if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
    return { statusCode: 500, body: 'Error: Faltan las variables de configuración de Contentful.' };
  }

  try {
    const client = contentful.createClient({
      space: CONTENTFUL_SPACE_ID,
      accessToken: CONTENTFUL_ACCESS_TOKEN,
    });

    // ===== LÓGICA MODIFICADA =====
    // Preparamos la consulta base
    const queryOptions = {
      content_type: 'blogPost',
      order: '-fields.date'
    };

    // Si nos han pasado un slug, lo añadimos a la consulta para filtrar
    if (slug) {
      queryOptions['fields.slug'] = slug;
      queryOptions.limit = 1; // Solo esperamos un resultado
    }

    const response = await client.getEntries(queryOptions);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response.items),
    };

  } catch (error) {
    console.error('ERROR EN LA FUNCIÓN:', error);
    return {
      statusCode: 500,
      body: `Error al obtener los datos de Contentful: ${error.message}`
    };
  }
};