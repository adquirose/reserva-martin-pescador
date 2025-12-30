// Script de prueba para el EmailService del proyecto Martin Pescador

import { EmailService } from '../src/services/emailService.js';

const testEmailService = async () => {
  console.log('🧪 Iniciando pruebas del EmailService...\n');

  // Test 1: Consulta de lote específico
  console.log('📋 Test 1: Enviando consulta de lote específico...');
  try {
    const loteData = {
      lote: '15',
      nombre: 'Juan Pérez Test',
      telefono: '+56912345678',
      rut: '12.345.678-9',
      precio: '$85.000.000',
      superficie: '450 m²'
    };

    const result1 = await EmailService.enviarConsultaLote(loteData);
    console.log('✅ Test 1 exitoso:', result1);
  } catch (error) {
    console.error('❌ Test 1 falló:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Consulta general
  console.log('📋 Test 2: Enviando consulta general...');
  try {
    const consultaData = {
      nombre: 'María González Test',
      email: 'maria@ejemplo.com',
      telefono: '+56987654321',
      rut: '11.111.111-1',
      mensaje: 'Me interesa conocer más sobre el proyecto Martin Pescador. ¿Tienen disponibilidad para una visita?',
      interes: 'Visita al proyecto'
    };

    const result2 = await EmailService.enviarConsultaGeneral(consultaData);
    console.log('✅ Test 2 exitoso:', result2);
  } catch (error) {
    console.error('❌ Test 2 falló:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Formulario flexible personalizado
  console.log('📋 Test 3: Enviando formulario flexible personalizado...');
  try {
    const contactoData = {
      nombre: 'Carlos López VIP',
      email: 'carlos.vip@ejemplo.com',
      telefono: '+56955555555',
      rut: '22.222.222-2',
      empresa: 'Inversiones VIP Ltda.',
      asunto: 'Interés en múltiples lotes',
      mensaje: 'Estoy interesado en adquirir varios lotes para un proyecto de inversión.'
    };

    const template_vip = `
      <div style="border: 3px solid #gold; padding: 20px; background: linear-gradient(135deg, #fffef0, #f0f8ff);">
        <h1 style="color: #b8860b; text-align: center;">🏆 CLIENTE VIP - INVERSIÓN 🏆</h1>
        <div style="background: white; padding: 15px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; border-bottom: 2px solid #b8860b; padding-bottom: 10px;">Información del Cliente</h2>
          <p><strong>👤 Nombre:</strong> {{nombre}}</p>
          <p><strong>📧 Email:</strong> {{email}}</p>
          <p><strong>📱 Teléfono:</strong> {{telefono}}</p>
          <p><strong>🆔 RUT:</strong> {{rut}}</p>
          <p><strong>🏢 Empresa:</strong> {{empresa}}</p>
          <p><strong>🎯 Tipo de Cliente:</strong> {{tipo_cliente}}</p>
          <p><strong>💰 Presupuesto Estimado:</strong> {{presupuesto_estimado}}</p>
          
          <hr style="margin: 20px 0; border: 1px solid #b8860b;">
          
          <h3 style="color: #b8860b;">📝 Mensaje:</h3>
          <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #b8860b; margin: 10px 0;">
            {{mensaje}}
          </div>
          
          <div style="background: #e6f3ff; padding: 10px; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 0; font-size: 12px; color: #666;">
              🕐 Recibido el {{fecha}} | 🌐 Desde {{origen}}
            </p>
          </div>
        </div>
      </div>
    `;

    const result3 = await EmailService.enviarFormulario({
      contactoData,
      destinatarios: ['andrea@lanube360.cl', 'ventas@martinpescador.cl', 'gerencia@martinpescador.cl'],
      prefijo_asunto: '[VIP INVERSIÓN]',
      campos_adicionales: {
        tipo_cliente: 'VIP - Inversionista',
        presupuesto_estimado: 'Sobre $500M',
        prioridad: 'ALTA',
        requiere_seguimiento: 'Inmediato'
      },
      template_personalizado: template_vip
    });

    console.log('✅ Test 3 exitoso:', result3);
  } catch (error) {
    console.error('❌ Test 3 falló:', error);
  }

  console.log('\n🎉 Pruebas completadas!');
};

// Solo ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testEmailService();
}

export { testEmailService };