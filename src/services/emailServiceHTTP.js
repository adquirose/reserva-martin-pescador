// Versión HTTP directa de la nueva función sendFormEmail

/**
 * Enviar email usando sendFormEmail via HTTP directamente
 */
export const enviarFormEmailHTTP = async (emailData) => {
  try {
    const url = 'https://us-central1-lanube360-29882.cloudfunctions.net/sendFormEmail';
    
    console.log('📤 [HTTP] Enviando a sendFormEmail:', url);
    console.log('📤 [HTTP] Datos:', emailData);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ [HTTP] Respuesta de error:', {
        status: response.status,
        statusText: response.statusText,
        result
      });
      throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log('✅ [HTTP] Email enviado exitosamente:', result);
    return result;
  } catch (error) {
    console.error('❌ [HTTP] Error enviando email:', error);
    throw error;
  }
};

/**
 * Función simplificada para consultas de lote usando HTTP directo con sendFormEmail
 */
export const enviarConsultaLoteHTTP = async (loteData, destinatarios = ['vhernandez@hfo.cl', 'huillinco@grupomartinpescador.cl']) => {
  
  // Template personalizado con solo los campos necesarios
  const templatePersonalizado = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1976d2; color: white; padding: 20px; text-align: center;">
        <h1>Nueva consulta de lote</h1>
        <p>Reserva Martin Pescador</p>
      </div>
      <div style="padding: 20px; background: #f9f9f9;">
        <h2>Información del contacto:</h2>
        <p><strong>Nombre:</strong> {{nombre}}</p>
        <p><strong>Teléfono:</strong> <a href="tel:{{telefono}}">{{telefono}}</a></p>
        <p><strong>RUT:</strong> {{rut}}</p>
        <p><strong>Estado Cliente:</strong> {{estado_cliente}}</p>
        <p><strong>Precio Lote:</strong> {{precio_lote}}</p>
        <p><strong>Superficie:</strong> {{superficie}}</p>
        <hr>
        <p style="background: white; padding: 15px; border-radius: 5px;">{{mensaje}}</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          Enviado desde el tour virtual el {{fecha}}
        </p>
      </div>
    </div>
  `;

  const emailData = {
    nombre: loteData.nombre,
    email: 'info@martinpescador.cl',
    telefono: loteData.telefono || '',
    rut: loteData.rut || '',
    empresa: 'Proyecto Martin Pescador',
    asunto: `Consulta sobre Lote ${loteData.lote}`,
    mensaje: `
      Nueva consulta desde el tour virtual Martin Pescador:
      
      Lote de interés: ${loteData.lote}
      Nombre: ${loteData.nombre}
      Teléfono: ${loteData.telefono}
      RUT: ${loteData.rut}
      Fecha de consulta: ${loteData.fecha || new Date().toLocaleString('es-CL')}
      
      El cliente está interesado en obtener más información sobre este lote.
    `.trim(),
    destinatarios: Array.isArray(destinatarios) ? destinatarios : [destinatarios],
    prefijo_asunto: '[Reserva Martin Pescador]',
    campos_adicionales: {
      estado_cliente: 'Lead Nuevo',
      precio_lote: loteData.precio || 'Por consultar',
      superficie: loteData.superficie || 'Por consultar'
    },
    template_personalizado: templatePersonalizado
  };

  return await enviarFormEmailHTTP(emailData);
};

export default enviarConsultaLoteHTTP;