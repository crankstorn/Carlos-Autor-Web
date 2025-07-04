// Ruta: netlify/functions/get-posts.js

// Requerimos las dos librerías necesarias:
// 'contentful' para conectar con el API de Contentful.
// 'marked' para convertir el texto Markdown a HTML.
const contentful = require('contentful');
const { marked } = require('marked');

// Esta es la función principal que Netlify ejecutará.
exports.handler = async function(event) {
  // Obtenemos las credenciales de las variables de entorno de Netlify.
  const { CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN } = process.env;

  // Extraemos el 'slug' de la URL si es que viene.
  // Ejemplo: /.netlify/functions/get-posts?slug=mi-primer-post
  const { slug } = event.queryStringParameters;

  // Verificación de seguridad: si faltan las credenciales, detenemos la ejecución.
  if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
    return {
      statusCode: 500,
      body: 'Error: Faltan las variables de configuración de Contentful en Netlify.'
    };
  }

  try {
    // Creamos el cliente de Contentful para poder hacer peticiones.
    const client = contentful.createClient({
      space: CONTENTFUL_SPACE_ID,
      accessToken: CONTENTFUL_ACCESS_TOKEN,
    });

    // Preparamos el objeto de consulta base.
    // Siempre pedimos el tipo de contenido 'blogPost' y lo ordenamos por fecha descendente.
    const queryOptions = {
      content_type: 'blogPost',
      order: '-fields.date'
    };

    // Si la URL incluye un 'slug', modificamos la consulta para que busque
    // solo la entrada que coincida con ese slug.
    if (slug) {
      queryOptions['fields.slug'] = slug;
      queryOptions.limit = 1; // Solo esperamos un resultado.
    }

    // Ejecutamos la consulta para obtener las entradas de Contentful.
    const response = await client.getEntries(queryOptions);

    // --- PROCESAMIENTO DEL CONTENIDO ---
    // Recorremos cada uno de los posts que hemos recibido.
    const processedItems = response.items.map(item => {
      // Si el post tiene un campo 'content'...
      if (item.fields.content) {
        // ...lo convertimos de Markdown a HTML.
        item.fields.content = marked.parse(item.fields.content);
      }
      // Devolvemos el post con el contenido ya procesado.
      return item;
    });

    // Devolvemos una respuesta exitosa (código 200) con los posts
    // ya procesados en formato JSON.
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(processedItems),
    };

  } catch (error) {
    // Si algo sale mal durante el proceso, lo capturamos aquí.
    console.error('ERROR EN LA FUNCIÓN:', error);
    return {
      statusCode: 500,
      body: `Error al obtener los datos de Contentful: ${error.message}`
    };
  }
};
