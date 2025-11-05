// Configuración de debug para Krpano
window.KRPANO_DEBUG = true;

// Función para verificar si Krpano está disponible
window.checkKrpanoAvailability = () => {
  console.log('Checking Krpano availability...');
  console.log('embedpano exists:', typeof window.embedpano !== 'undefined');
  console.log('Script loaded:', !!document.querySelector('script[src*="tour.js"]'));
  
  // Verificar archivos necesarios
  const files = ['/krpano/tour.js', '/krpano/tour.xml', '/krpano/tour.swf'];
  files.forEach(file => {
    fetch(file, { method: 'HEAD' })
      .then(response => {
        console.log(`${file}: ${response.ok ? 'OK' : 'NOT FOUND'}`);
      })
      .catch(err => {
        console.log(`${file}: ERROR - ${err.message}`);
      });
  });
};

// Ejecutar verificación al cargar
if (typeof window !== 'undefined') {
  setTimeout(() => {
    window.checkKrpanoAvailability();
  }, 1000);
}