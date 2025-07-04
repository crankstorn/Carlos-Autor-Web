// netlify/functions/subscribe.js

const fetch = require('node-fetch');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    let requestBody;

    // ===================================================================
    // ===== INICIO: CÓDIGO DEFENSIVO ====================================
    // ===================================================================
    // A veces, el cuerpo (body) ya viene como un objeto y no necesita
    // ser procesado. Otras veces, es un string. Este código maneja
    // ambas posibilidades para asegurar que siempre funcione.

    if (typeof event.body === 'string') {
      requestBody = JSON.parse(event.body);
    } else {
      requestBody = event.body; // Se asume que ya es un objeto
    }
    // ===================================================================
    // ===== FIN: CÓDIGO DEFENSIVO =======================================
    // ===================================================================

    const { email, groupId } = requestBody;
    const apiKey = process.env.MAILERLITE_API_KEY;

    if (!email || !groupId) {
      console.error('Error: Faltan Email o Group ID en el cuerpo de la petición.', requestBody);
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
      const errorMessage = data.message || (data.error ? data.error.message : 'Error en la suscripción.');
      console.error('Error de MailerLite:', errorMessage);
      return { statusCode: response.status, body: JSON.stringify({ message: errorMessage }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: '¡Suscripción exitosa!' })
    };

  } catch (error) {
    console.error('Error catastrófico en la función de Netlify:', error);
    return { statusCode: 500, body: JSON.stringify({ message: `Error interno del servidor: ${error.message}` }) };
  }
};
