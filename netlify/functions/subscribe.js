// netlify/functions/subscribe.js

// Importa la herramienta 'fetch' para que la función pueda usarla.
const fetch = require('node-fetch');

exports.handler = async function(event) {
  // Solo aceptamos peticiones POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // ===== INICIO: CÓDIGO DE DEPURACIÓN =====
    // Imprimimos en los logs de Netlify el cuerpo del evento para ver qué llega.
    console.log('Cuerpo del evento recibido:', event.body);
    // ===== FIN: CÓDIGO DE DEPURACIÓN =====

    const { email, groupId } = JSON.parse(event.body);
    const apiKey = process.env.MAILERLITE_API_KEY;

    // ===== INICIO: CÓDIGO DE DEPURACIÓN =====
    // Imprimimos las variables después de procesarlas.
    console.log('Email extraído:', email);
    console.log('Group ID extraído:', groupId);
    // ===== FIN: CÓDIGO DE DEPURACIÓN =====

    if (!email || !groupId) {
      console.error('Error: Email o Group ID faltantes.');
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
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || 'Error en la suscripción.';
      console.error('Error de MailerLite:', errorMessage);
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
