import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

// Configuración de URLs de Cloud Functions
const CLOUD_FUNCTIONS = {
  // Función original para retrocompatibilidad
  sendContactEmail: 'sendContactEmail',
  // Nueva función flexible
  sendFormEmail: 'sendFormEmail'
};

/**
 * Servicio para enviar emails usando las Cloud Functions
 */
export class EmailService {
  
  /**
   * Envía un email usando la función original sendContactEmail
   * @param {Object} contactoData - Datos del contacto
   * @returns {Promise<boolean>}
   */
  static async enviarContactoOriginal(contactoData) {
    try {
      const sendContactEmail = httpsCallable(functions, CLOUD_FUNCTIONS.sendContactEmail);
      
      const emailData = {
        nombre: contactoData.nombre || '',
        email: 'info@martinpescador.cl',
        telefono: contactoData.telefono || '',
        empresa: `Consulta Lote ${contactoData.lote} - Martin Pescador`,
        asunto: `Consulta sobre Lote ${contactoData.lote}`,
        mensaje: contactoData.mensaje || `
          Nueva consulta desde el tour virtual:
          
          Lote de interés: ${contactoData.lote}
          Nombre: ${contactoData.nombre}
          Teléfono: ${contactoData.telefono}
          RUT: ${contactoData.rut}
        `.trim()
      };
      
      const result = await sendContactEmail(emailData);
      console.log('Email enviado exitosamente (función original):', result.data);
      return true;
    } catch (error) {
      console.error('Error enviando email (función original):', error);
      throw error;
    }
  }

  /**
   * Envía un email usando la nueva función sendFormEmail (más flexible)
   * @param {Object} options - Opciones del email
   * @returns {Promise<boolean>}
   */
  static async enviarFormulario(options) {
    try {
      const sendFormEmail = httpsCallable(functions, CLOUD_FUNCTIONS.sendFormEmail);
      
      const {
        contactoData,
        destinatarios = ['andrea@lanube360.cl'],
        prefijo_asunto = '[MARTIN PESCADOR]',
        campos_adicionales = {},
        template_personalizado = null
      } = options;

      // Validación básica antes del envío
      if (!contactoData.nombre || !contactoData.nombre.trim()) {
        throw new Error('Nombre es requerido');
      }
      
      if (!contactoData.asunto || !contactoData.asunto.trim()) {
        throw new Error('Asunto es requerido');
      }
      
      if (!contactoData.mensaje || !contactoData.mensaje.trim()) {
        throw new Error('Mensaje es requerido');
      }

      // Generar email válido si no se proporciona
      let emailValido = contactoData.email;
      if (!emailValido || !emailValido.includes('@')) {
        // Usar email de prueba válido
        emailValido = 'cliente.test@gmail.com';
      }
      
      const emailData = {
        nombre: contactoData.nombre.trim(),
        email: emailValido,
        telefono: contactoData.telefono || '',
        rut: contactoData.rut || '',
        empresa: contactoData.empresa || 'Proyecto Martin Pescador',
        asunto: contactoData.asunto.trim(),
        mensaje: contactoData.mensaje.trim(),
        destinatarios,
        prefijo_asunto,
        campos_adicionales: {
          proyecto: 'Proyecto Martin Pescador',
          tipo_consulta: 'Consulta de Lote',
          origen: 'Tour Virtual 360°',
          ...campos_adicionales
        },
        template_personalizado
      };
      
      console.log('📧 Datos a enviar a sendFormEmail:', {
        nombre: emailData.nombre,
        email: emailData.email,
        asunto: emailData.asunto,
        destinatarios: emailData.destinatarios,
        campos_adicionales: Object.keys(emailData.campos_adicionales)
      });
      
      const result = await sendFormEmail(emailData);
      console.log('✅ Email enviado exitosamente:', result.data);
      return result.data;
    } catch (error) {
      console.error('❌ Error detallado en enviarFormulario:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      throw new Error(`Error enviando email: ${error.message}`);
    }
  }

  /**
   * Envía consulta de lote específicamente para el proyecto Martin Pescador
   * @param {Object} loteData - Datos de la consulta del lote
   * @returns {Promise<Object>}
   */
  static async enviarConsultaLote(loteData) {
    const contactoData = {
      nombre: loteData.nombre,
      email: 'cliente.martinpescador@gmail.com', // Email válido para testing
      telefono: loteData.telefono,
      rut: loteData.rut,
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
      `.trim()
    };

    const campos_adicionales = {
      lote_interes: loteData.lote,
      estado_cliente: 'Lead Nuevo',
      precio_lote: loteData.precio || 'Por consultar',
      superficie: loteData.superficie || 'Por consultar'
    };

    return await this.enviarFormulario({
      contactoData,
      campos_adicionales,
      destinatarios: ['andrea@lanube360.cl'] // Un solo destinatario para testing
    });
  }

  /**
   * Envía una consulta general del proyecto
   * @param {Object} consultaData - Datos de la consulta general
   * @returns {Promise<Object>}
   */
  static async enviarConsultaGeneral(consultaData) {
    const contactoData = {
      nombre: consultaData.nombre,
      email: consultaData.email || 'consulta.martinpescador@gmail.com',
      telefono: consultaData.telefono,
      rut: consultaData.rut,
      empresa: 'Consulta General Martin Pescador',
      asunto: 'Consulta General del Proyecto',
      mensaje: consultaData.mensaje
    };

    const campos_adicionales = {
      tipo_consulta: 'Consulta General',
      interes_especifico: consultaData.interes || 'General'
    };

    return await this.enviarFormulario({
      contactoData,
      campos_adicionales,
      prefijo_asunto: '[CONSULTA GENERAL]',
      destinatarios: ['andrea@lanube360.cl'] // Solo un destinatario válido para testing
    });
  }
}

export default EmailService;