// netlify/functions/subscribe.js

// Importa la herramienta 'fetch' para que la función pueda usarla.
const fetch = require('node-fetch');

exports.handler = async function(event) {
  // Solo aceptamos peticiones POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { email, groupId } = JSON.parse(event.body);
    const apiKey = process.env.MAILERLITE_API_KEY;

    if (!email || !groupId) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Email y Group ID son requeridos.' }) };
    }

    const mailerliteUrl = 'https://connect.mailerlite.com/api/subscribers';

    const response = await fetch(mailerliteUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        email: email,
        groups: [groupId],
        // Puedes añadir más campos si los necesitas
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Si MailerLite da un error (ej: email ya suscrito), lo pasamos al frontend
      // El error de MailerLite suele estar en data.error.message
      const errorMessage = data.message || 'Error en la suscripción.';
      return { statusCode: response.status, body: JSON.stringify({ message: errorMessage }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: '¡Suscripción exitosa!' })
    };

  } catch (error) {
    console.error('Error en la función de Netlify:', error);
    return { statusCode: 500, body: JSON.stringify({ message: `Error interno del servidor: ${error.message}` }) };
  }
};
