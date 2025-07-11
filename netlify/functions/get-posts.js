// Ruta: netlify/functions/get-posts.js

const contentful = require('contentful');
// Importamos 'marked' para convertir Markdown a HTML.
// Usamos import() dinámico como es requerido en Netlify Functions.
const { marked } = require('marked');

// --- Función principal de Netlify (Handler) ---
// Esta función ahora actúa como un simple endpoint de API.
exports.handler = async function(event) {
  // Obtenemos las variables de entorno de forma segura.
  const { CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN } = process.env;

  // Obtenemos el 'slug' de los parámetros de la URL.
  const { slug } = event.queryStringParameters;

  // Comprobación de seguridad para las variables de entorno.
  if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Faltan las variables de configuración de Contentful en Netlify.' })
    };
  }

  try {
    // Creamos el cliente de Contentful.
    const client = contentful.createClient({
      space: CONTENTFUL_SPACE_ID,
      accessToken: CONTENTFUL_ACCESS_TOKEN,
    });

    // Opciones de la consulta a Contentful.
    const queryOptions = {
      content_type: 'blogPost', // Asegúrate que este es el ID de tu Content Type.
      order: '-fields.date'
    };

    // Si la petición incluye un slug, filtramos para obtener un único post.
    if (slug) {
      queryOptions['fields.slug'] = slug;
      queryOptions.limit = 1;
    }

    // Hacemos la llamada a la API de Contentful.
    const response = await client.getEntries(queryOptions);

    // Procesamos los items: convertimos el campo 'content' de Markdown a HTML.
    const processedItems = response.items.map(item => {
      const newItem = { ...item };
      if (newItem.fields && newItem.fields.content) {
        // Usamos marked para la conversión.
        newItem.fields.content = marked.parse(newItem.fields.content);
      }
      return newItem;
    });

    // Siempre devolvemos los datos en formato JSON.
    // Netlify se encargará de pre-renderizar la página para los bots.
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(processedItems),
    };

  } catch (error) {
    console.error('ERROR EN LA FUNCIÓN:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Error al obtener los datos de Contentful: ${error.message}` })
    };
  }
};
