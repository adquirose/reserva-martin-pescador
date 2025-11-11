// 🔧 SCRIPT DIRECTO PARA COMPLETAR LOTES FALTANTES
// Ejecutar en la consola del navegador en http://localhost:5173

console.log('🚀 === SCRIPT DE COMPLETADO DE LOTES ===');

// Función principal que ejecuta todo el proceso
async function completarLotesCompleto() {
  try {
    console.log('🔍 Paso 1: Verificando estado actual...');
    
    // 1. Verificar lotes faltantes
    if (typeof window.verificar_lotes_faltantes === 'function') {
      const verificacion = await window.verificar_lotes_faltantes();
      console.log('📊 Resultados de verificación:', verificacion);
      
      if (verificacion.faltantes.length === 0) {
        console.log('✅ ¡Todos los lotes ya están presentes!');
        console.log(`📈 Total en DB: ${verificacion.existentes}/${verificacion.esperados}`);
        return verificacion;
      }
      
      console.log(`❌ Faltan ${verificacion.faltantes.length} lotes:`, verificacion.faltantes);
      
    } else {
      console.error('❌ Función verificar_lotes_faltantes no disponible');
      console.log('💡 Asegúrate de estar en la página principal y que haya cargado completamente');
      return;
    }
    
    console.log('🔧 Paso 2: Completando lotes faltantes...');
    
    // 2. Completar lotes faltantes
    if (typeof window.completar_lotes_faltantes === 'function') {
      const completado = await window.completar_lotes_faltantes();
      console.log('✅ Resultado del completado:', completado);
      
      if (completado.faltantes.length === 0) {
        console.log('🎉 ¡Todos los lotes completados exitosamente!');
        console.log(`📈 Total final: ${completado.existentes}/${completado.esperados}`);
      } else {
        console.log(`⚠️ Aún faltan ${completado.faltantes.length} lotes:`, completado.faltantes);
      }
      
      return completado;
      
    } else {
      console.error('❌ Función completar_lotes_faltantes no disponible');
      return;
    }
    
  } catch (error) {
    console.error('💥 Error en el proceso:', error);
    
    // Intentar repoblación completa como respaldo
    console.log('🔄 Intentando repoblación completa como respaldo...');
    if (typeof window.repoblar_base_datos === 'function') {
      const repoblacion = await window.repoblar_base_datos();
      console.log('📋 Resultado repoblación completa:', repoblacion);
      return repoblacion;
    }
    
    throw error;
  }
}

// Función para mostrar estadísticas actuales
async function mostrarEstadisticas() {
  try {
    console.log('📊 === ESTADÍSTICAS ACTUALES ===');
    
    // Mostrar conteo esperado
    if (typeof window.contar_lotes_esperados === 'function') {
      window.contar_lotes_esperados();
    }
    
    // Verificar estado actual
    if (typeof window.verificar_lotes_faltantes === 'function') {
      const verificacion = await window.verificar_lotes_faltantes();
      return verificacion;
    }
    
  } catch (error) {
    console.error('❌ Error mostrando estadísticas:', error);
  }
}

// Función para repoblación completa (plan B)
async function repoblarCompleto() {
  try {
    console.log('🔄 === REPOBLACIÓN COMPLETA ===');
    console.log('⚠️ Esto eliminará todos los lotes existentes y los volverá a crear');
    
    if (typeof window.repoblar_base_datos === 'function') {
      const resultado = await window.repoblar_base_datos();
      console.log('✅ Repoblación completa finalizada:', resultado);
      
      // Verificar resultado
      await mostrarEstadisticas();
      
      return resultado;
    } else {
      console.error('❌ Función repoblar_base_datos no disponible');
    }
    
  } catch (error) {
    console.error('💥 Error en repoblación completa:', error);
    throw error;
  }
}

// Exponer funciones globalmente
window.completarLotesCompleto = completarLotesCompleto;
window.mostrarEstadisticas = mostrarEstadisticas;
window.repoblarCompleto = repoblarCompleto;

console.log(`
🎯 === FUNCIONES DISPONIBLES ===

1. completarLotesCompleto() 
   → Verifica y completa solo los lotes faltantes (RECOMENDADO)

2. mostrarEstadisticas()
   → Muestra estado actual sin modificar nada

3. repoblarCompleto()
   → Borra todo y vuelve a crear (solo si falla la opción 1)

📋 === PARA EJECUTAR ===
Copia este script en la consola, luego ejecuta:

await completarLotesCompleto()
`);

// Auto-ejecutar estadísticas al cargar
setTimeout(() => {
  console.log('🔍 Mostrando estadísticas iniciales...');
  mostrarEstadisticas();
}, 1000);