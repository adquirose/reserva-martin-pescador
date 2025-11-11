// Script simple para ejecutar el repoblado con nueva estructura
console.log('🎯 Iniciando proceso de repoblado...\n');

async function ejecutarProceso() {
  try {
    // Importar variables de entorno manualmente
    process.env.VITE_FIREBASE_API_KEY = "AIzaSyCwrJoObNXrMSfM_JuBxTdBELGqaJPH1xA";
    process.env.VITE_FIREBASE_AUTH_DOMAIN = "reserva-martin-pescador.firebaseapp.com";
    process.env.VITE_FIREBASE_PROJECT_ID = "reserva-martin-pescador";
    process.env.VITE_FIREBASE_STORAGE_BUCKET = "reserva-martin-pescador.firebasestorage.app";
    process.env.VITE_FIREBASE_MESSAGING_SENDER_ID = "85698298039";
    process.env.VITE_FIREBASE_APP_ID = "1:85698298039:web:41e2ea9a44b77b93ee6a70";

    // Importar módulo
    const { parseXMLCompleto, proceso_completo_simple } = await import('./src/services/repoblarFromXML.js');
    
    // 1. Verificar parseo XML
    console.log('📋 Paso 1: Parseando archivos XML...');
    const xmlData = await parseXMLCompleto();
    
    const lotes = Object.keys(xmlData.lotes);
    console.log(`✅ XML parseado: ${lotes.length} lotes encontrados`);
    console.log(`📍 Lotes: ${lotes.slice(0, 5).join(', ')}${lotes.length > 5 ? '...' : ''}`);
    
    // Mostrar estructura de un lote
    const sampleLote = xmlData.lotes[lotes[0]];
    console.log('\n📄 Estructura de lote de ejemplo:');
    console.log(`Lote ID: ${lotes[0]}`);
    console.log(`Estado: ${sampleLote.estado || 'N/A'}`);
    console.log(`Precio: ${sampleLote.precio || 'N/A'}`);
    console.log(`Superficie: ${sampleLote.superficieTotal || 'N/A'}`);
    console.log(`Coordenadas: ath=${sampleLote.ath}, atv=${sampleLote.atv}`);
    
    // 2. Ejecutar repoblado
    console.log('\n📊 Paso 2: Repoblando Firestore con nueva estructura...');
    console.log('Estructura de documento que se creará:');
    console.log({
      numero: "ID del lote",
      estado: "disponible/vendido/reservado", 
      precio: "precio extraído",
      superficie: "superficie en m²",
      krpano: {
        vista1: {
          ath: "coordenada horizontal",
          atv: "coordenada vertical",
          html: "ID del lote",
          name: "fichaX"
        }
      }
    });
    
    const resultado = await proceso_completo_simple();
    
    console.log('\n✅ PROCESO COMPLETADO EXITOSAMENTE');
    console.log('📊 Resultados:', resultado);
    
  } catch (error) {
    console.error('❌ Error en el proceso:', error.message);
    console.error('Stack:', error.stack);
  }
}

ejecutarProceso();