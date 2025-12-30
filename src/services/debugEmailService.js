// Debug avanzado para la función sendFormEmail

import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

export const debugSendFormEmail = async (testData) => {
  console.log('🔍 Iniciando debug de sendFormEmail...');
  
  try {
    const sendFormEmail = httpsCallable(functions, 'sendFormEmail');
    
    // Datos mínimos para probar
    const minimalData = {
      nombre: testData.nombre || 'Test Debug',
      email: 'debug.test@gmail.com',
      asunto: testData.asunto || 'Test Debug Asunto',
      mensaje: testData.mensaje || 'Test de mensaje para debug'
    };
    
    console.log('📤 Enviando datos mínimos:', minimalData);
    
    const result = await sendFormEmail(minimalData);
    console.log('✅ Debug exitoso:', result.data);
    return result.data;
    
  } catch (error) {
    console.error('❌ Error en debug:', {
      message: error.message,
      code: error.code,
      details: error.details,
      stack: error.stack
    });
    
    // Probar con la función original para comparar
    console.log('🔄 Probando con función original...');
    try {
      const sendContactEmail = httpsCallable(functions, 'sendContactEmail');
      const originalData = {
        nombre: testData.nombre || 'Test Debug Original',
        email: 'debug.original@gmail.com',
        telefono: '',
        empresa: 'Debug Test',
        asunto: testData.asunto || 'Test Original',
        mensaje: testData.mensaje || 'Test mensaje original'
      };
      
      console.log('📤 Enviando a función original:', originalData);
      const originalResult = await sendContactEmail(originalData);
      console.log('✅ Función original exitosa:', originalResult.data);
      
      return {
        newFunction: false,
        originalFunction: true,
        error: error.message,
        originalResult: originalResult.data
      };
      
    } catch (originalError) {
      console.error('❌ Error también en función original:', originalError);
      throw new Error(`Ambas funciones fallaron: ${error.message} | ${originalError.message}`);
    }
  }
};

export default debugSendFormEmail;