// Script para repoblar la base de datos de Firestore
// Ejecutar en la consola del navegador en http://localhost:5173

console.log('🚀 Iniciando script de repoblación de base de datos...');

// Función para repoblar la base de datos
async function repoblarBaseDatos() {
  try {
    console.log('🔄 Iniciando repoblación completa de la base de datos...');
    
    // Verificar que las funciones estén disponibles
    if (typeof window.repoblar_base_datos !== 'function') {
      console.error('❌ La función repoblar_base_datos no está disponible');
      console.log('💡 Asegúrate de estar en la página principal y que haya cargado completamente');
      return;
    }
    
    // Ejecutar repoblación
    const resultado = await window.repoblar_base_datos();
    console.log('✅ Repoblación completada:', resultado);
    
    // Verificar integridad
    console.log('🔍 Verificando integridad de los datos...');
    if (typeof window.verificar_integridad === 'function') {
      const verificacion = await window.verificar_integridad();
      console.log('📋 Verificación de integridad:', verificacion);
    }
    
    return resultado;
    
  } catch (error) {
    console.error('❌ Error durante la repoblación:', error);
    throw error;
  }
}

// Función para verificar el estado actual
async function verificarEstadoActual() {
  try {
    console.log('🔍 Verificando estado actual de la base de datos...');
    
    if (typeof window.verificar_consistencia === 'function') {
      const consistencia = await window.verificar_consistencia();
      console.log('📊 Estado de consistencia:', consistencia);
    }
    
    if (typeof window.verificar_estados_lotes === 'function') {
      const estados = await window.verificar_estados_lotes();
      console.log('🏠 Estado de los lotes:', estados);
    }
    
  } catch (error) {
    console.error('❌ Error verificando estado:', error);
  }
}

// Función para limpiar base de datos antes de repoblar
async function limpiarBaseDatos() {
  try {
    console.log('🧹 Limpiando base de datos...');
    
    if (typeof window.limpiar_base_datos === 'function') {
      const resultado = await window.limpiar_base_datos();
      console.log('✅ Base de datos limpiada:', resultado);
      return resultado;
    } else {
      console.warn('⚠️ Función limpiar_base_datos no disponible');
    }
    
  } catch (error) {
    console.error('❌ Error limpiando base de datos:', error);
    throw error;
  }
}

// Función completa de repoblación
async function repoblarCompleto() {
  try {
    console.log('🚀 === REPOBLACIÓN COMPLETA INICIADA ===');
    
    // 1. Verificar estado inicial
    await verificarEstadoActual();
    
    // 2. Repoblar
    const resultado = await repoblarBaseDatos();
    
    // 3. Verificar resultado final
    await verificarEstadoActual();
    
    console.log('🎉 === REPOBLACIÓN COMPLETA FINALIZADA ===');
    return resultado;
    
  } catch (error) {
    console.error('💥 === ERROR EN REPOBLACIÓN COMPLETA ===', error);
    throw error;
  }
}

// Exponer funciones globalmente para fácil acceso
window.repoblarCompleto = repoblarCompleto;
window.repoblarBaseDatos = repoblarBaseDatos;
window.verificarEstadoActual = verificarEstadoActual;
window.limpiarBaseDatos = limpiarBaseDatos;

console.log(`
🎯 FUNCIONES DISPONIBLES:
- repoblarCompleto() : Repoblación completa con verificaciones
- repoblarBaseDatos() : Solo repoblación
- verificarEstadoActual() : Verificar estado de la DB
- limpiarBaseDatos() : Limpiar antes de repoblar

📋 PARA EJECUTAR:
1. Copia y pega este script en la consola
2. Ejecuta: repoblarCompleto()
`);

export { repoblarCompleto, repoblarBaseDatos, verificarEstadoActual, limpiarBaseDatos };