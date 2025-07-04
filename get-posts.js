// Ruta: netlify/functions/get-posts.js

const contentful = require('contentful');

exports.handler = async function(event) {
  const { CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN } = process.env;

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

    const response = await client.getEntries({
      content_type: 'blogPost',
      order: '-fields.date'
    });

    // ===================================================================
    // ===== LÍNEA DE DIAGNÓSTICO AÑADIDA =====
    // Esto imprimirá los datos directamente en el log de la función de Netlify.
    console.log('DATOS RECIBIDOS DESDE CONTENTFUL:', JSON.stringify(response.items, null, 2));
    // ===================================================================

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