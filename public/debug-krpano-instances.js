// Script de diagnóstico para verificar instancias de Krpano
console.log('🔍 DIAGNÓSTICO DE KRPANO - Iniciando verificación...');

// Función para verificar todas las posibles referencias
function diagnosticarKrpano() {
  console.log('📊 === DIAGNÓSTICO COMPLETO DE KRPANO ===');
  
  // 1. Verificar variables globales
  console.log('🌍 Variables globales:');
  console.log('  window.krpano:', window.krpano);
  console.log('  window.krpanoInstance:', window.krpanoInstance);
  console.log('  window.globalKrpano:', window.globalKrpano);
  console.log('  window.embedpano:', window.embedpano);
  
  // 2. Verificar embedpano instances
  if (window.embedpano && window.embedpano.instances) {
    console.log('📦 embedpano.instances:', window.embedpano.instances);
    Object.keys(window.embedpano.instances).forEach(key => {
      console.log(`  ${key}:`, window.embedpano.instances[key]);
    });
  }
  
  // 3. Verificar todas las variables que empiecen con 'krpano'
  console.log('🔍 Todas las variables que contienen "krpano":');
  Object.keys(window).filter(key => key.toLowerCase().includes('krpano')).forEach(key => {
    console.log(`  window.${key}:`, window[key]);
  });
  
  // 4. Buscar instancias en elementos DOM
  console.log('🏗️ Elementos DOM con krpano:');
  const containers = document.querySelectorAll('[id*="krpano"], [class*="krpano"]');
  containers.forEach(el => {
    console.log(`  ${el.tagName}#${el.id}.${el.className}:`, el);
  });
  
  // 5. Verificar si hay métodos call/set disponibles
  const candidates = [window.krpano, window.krpanoInstance, window.globalKrpano];
  candidates.forEach((candidate, index) => {
    const names = ['window.krpano', 'window.krpanoInstance', 'window.globalKrpano'];
    if (candidate) {
      console.log(`⚡ ${names[index]} métodos:`, {
        call: typeof candidate.call,
        set: typeof candidate.set,
        get: typeof candidate.get
      });
    }
  });
}

// Función para probar conexión con Krpano
function probarConexionKrpano() {
  console.log('🧪 === PRUEBAS DE CONEXIÓN ===');
  
  const candidates = [
    { name: 'window.krpano', instance: window.krpano },
    { name: 'window.krpanoInstance', instance: window.krpanoInstance },
    { name: 'window.globalKrpano', instance: window.globalKrpano }
  ];
  
  candidates.forEach(({ name, instance }) => {
    if (instance && typeof instance.call === 'function') {
      try {
        const result = instance.call('test_logging');
        console.log(`✅ ${name}.call('test_logging'):`, result);
      } catch (error) {
        console.log(`❌ ${name}.call() error:`, error);
      }
    } else {
      console.log(`❌ ${name}: no disponible o sin método call`);
    }
  });
}

// Exponer funciones globalmente para uso manual
window.diagnosticarKrpano = diagnosticarKrpano;
window.probarConexionKrpano = probarConexionKrpano;

// Ejecutar diagnóstico inicial después de un tiempo
setTimeout(() => {
  diagnosticarKrpano();
  probarConexionKrpano();
}, 2000);

// También ejecutar cuando se cargue embedpano
if (window.embedpano) {
  setTimeout(() => {
    console.log('🔄 Re-ejecutando diagnóstico después de embedpano...');
    diagnosticarKrpano();
    probarConexionKrpano();
  }, 5000);
}

console.log('🎯 Script de diagnóstico cargado. Puedes ejecutar manualmente:');
console.log('   diagnosticarKrpano()');
console.log('   probarConexionKrpano()');