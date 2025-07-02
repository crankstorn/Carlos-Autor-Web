// netlify/functions/subscribe.js

exports.handler = async function(event) {
  // Solo aceptamos peticiones POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { email, groupId } = JSON.parse(event.body);
    const apiKey = process.env.MAILERLITE_API_KEY;

    if (!email || !groupId) {
      return { statusCode: 400, body: 'Email y Group ID son requeridos.' };
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
      // Si MailerLite da un error, lo pasamos al frontend
      return { statusCode: response.status, body: JSON.stringify(data) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: '¡Suscripción exitosa!' })
    };

  } catch (error) {
    return { statusCode: 500, body: `Error interno del servidor: ${error.message}` };
  }
};