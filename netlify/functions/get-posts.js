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
      // CORRECCIÓN 1: El ID de tu modelo es "blogPost"
      content_type: 'blogPost',
      // CORRECCIÓN 2: El ID de tu campo de fecha es "date"
      order: '-fields.date'
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response.items),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: `Error al obtener los datos de Contentful: ${error.message}`
    };
  }
};