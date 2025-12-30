// Versión de respaldo usando la función original que sabemos que funciona

/**
 * Función de respaldo usando sendContactEmail original via HTTP
 */
export const enviarConsultaLoteRespaldo = async (loteData) => {
  try {
    const url = 'https://sendcontactemail-6al5a3ncoq-uc.a.run.app';
    
    const emailData = {
      nombre: loteData.nombre,
      email: 'cliente.respaldo@gmail.com',
      telefono: loteData.telefono || '',
      empresa: `Consulta Lote ${loteData.lote} - Martin Pescador`,
      asunto: `Consulta sobre Lote ${loteData.lote}`,
      mensaje: `
        Nueva consulta desde el tour virtual:
        
        Lote de interés: ${loteData.lote}
        Nombre: ${loteData.nombre}
        Teléfono: ${loteData.telefono}
        RUT: ${loteData.rut}
        Fecha de consulta: ${new Date().toLocaleString('es-CL')}
        
        El cliente está interesado en obtener más información sobre este lote.
      `.trim()
    };
    
    console.log('📤 [RESPALDO HTTP] Enviando a:', url);
    console.log('📤 [RESPALDO HTTP] Datos:', emailData);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log('✅ [RESPALDO HTTP] Email enviado exitosamente:', result);
    return result;
  } catch (error) {
    console.error('❌ [RESPALDO HTTP] Error enviando email:', error);
    throw error;
  }
};

export default enviarConsultaLoteRespaldo;