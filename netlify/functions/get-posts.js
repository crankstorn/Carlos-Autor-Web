// Ruta del archivo: netlify/functions/get-posts.js

// Importamos la librería oficial de Contentful
const contentful = require('contentful');

exports.handler = async function(event) {
  // Obtenemos las claves secretas desde las variables de entorno de Netlify
  const { CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN } = process.env;

  // Una pequeña validación por si las variables no están configuradas
  if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
    return {
      statusCode: 500,
      body: 'Error: Faltan las variables de configuración de Contentful en Netlify.'
    };
  }

  try {
    // Creamos el cliente de Contentful con nuestras claves
    const client = contentful.createClient({
      space: CONTENTFUL_SPACE_ID,
      accessToken: CONTENTFUL_ACCESS_TOKEN,
    });

    // Hacemos la petición a Contentful para obtener las entradas del blog
    const response = await client.getEntries({
      // 'entradaDeBlog' es el ID de nuestro modelo de contenido
      content_type: 'entradaDeBlog',
      // Ordenamos los posts por fecha, del más nuevo al más viejo
      order: '-fields.fechaDePublicacion'
    });

    // Si todo va bien, devolvemos los posts en formato JSON
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response.items),
    };

  } catch (error) {
    // Si algo falla, devolvemos un error
    return {
      statusCode: 500,
      body: `Error al obtener los datos de Contentful: ${error.message}`
    };
  }
};