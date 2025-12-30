// Test rápido para debug del EmailService

import { EmailService } from './src/services/emailService.js';

const testBasico = async () => {
  console.log('🧪 Test básico del EmailService...');
  
  try {
    const loteData = {
      lote: '15',
      nombre: 'Juan Test',
      telefono: '+56912345678',
      rut: '12.345.678-9'
    };

    console.log('📤 Enviando datos:', loteData);
    
    const result = await EmailService.enviarConsultaLote(loteData);
    console.log('✅ Resultado exitoso:', result);
    
  } catch (error) {
    console.error('❌ Error en test:', {
      message: error.message,
      code: error.code,
      details: error.details || 'Sin detalles adicionales'
    });
  }
};

testBasico();