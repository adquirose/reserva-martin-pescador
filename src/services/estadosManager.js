// Función para sincronizar estados desde spots.xml a Firebase
import { getAllLotes } from './firestoreServiceNew.js';
import { loadSpotsXML } from './spotsXmlParser.js';

// Estados según spots.xml
const estadosOriginales = {
  // VISTA 1
  1: 'vendido', 2: 'vendido', 3: 'vendido', 4: 'vendido', 5: 'vendido', 6: 'vendido',
  23: 'vendido', 24: 'vendido', 25: 'vendido',
  
  // VISTA 2  
  7: 'vendido', 8: 'vendido', 9: 'vendido', 10: 'vendido', 11: 'vendido',
  26: 'vendido', 27: 'vendido',
  
  // VISTA 3
  12: 'disponible', 13: 'disponible', 14: 'disponible', 15: 'disponible', 16: 'disponible',
  28: 'disponible', 29: 'disponible',
  
  // VISTA 4
  17: 'disponible', 19: 'disponible', 20: 'disponible', 21: 'disponible', 22: 'disponible',
  30: 'disponible', 31: 'disponible'
};

/**
 * Aplicar estados correctos desde spots.xml
 */
export const aplicarEstadosOriginales = () => {
  console.log('🔧 Aplicando estados originales del spots.xml...');
  
  // Por ahora solo actualizamos en memoria para testing
  // En producción esto se haría en Firebase
  
  if (window.spotsData) {
    let actualizados = 0;
    
    window.spotsData.forEach(lote => {
      const numeroInt = parseInt(lote.numero);
      const estadoOriginal = estadosOriginales[numeroInt];
      
      if (estadoOriginal && lote.estado !== estadoOriginal) {
        console.log(`📝 Lote ${lote.numero}: ${lote.estado} -> ${estadoOriginal}`);
        lote.estado = estadoOriginal;
        actualizados++;
      }
    });
    
    console.log(`✅ Estados actualizados: ${actualizados} lotes`);
    return { actualizados, total: window.spotsData.length };
  } else {
    console.error('❌ No hay datos cargados');
    return null;
  }
};

/**
 * Regenerar spots con estados correctos
 */
export const regenerarSpotsConEstados = () => {
  if (!window.krpano) {
    console.error('❌ Krpano no disponible');
    return;
  }

  console.log('🔄 Regenerando spots con estados correctos...');
  
  // Limpiar spots existentes
  const hotspotCount = window.krpano.get('hotspot.count') || 0;
  for (let i = hotspotCount - 1; i >= 0; i--) {
    const name = window.krpano.get(`hotspot[${i}].name`);
    if (name && name.startsWith('spot_')) {
      window.krpano.call(`removehotspot(${name})`);
    }
  }
  
  // Obtener escena actual
  const currentScene = window.krpano.get('xml.scene');
  console.log(`📍 Escena actual: ${currentScene}`);
  
  // Determinar rangos según escena
  const rangos = {
    'scene_e1': [[1,6], [23,25]],
    'scene_e2': [[7,11], [26,27]], 
    'scene_e3': [[12,16], [28,29]],
    'scene_e4': [[17,17], [19,22], [30,31]]
  };
  
  const rangoEscena = rangos[currentScene];
  if (rangoEscena && window.generar_spots) {
    rangoEscena.forEach(([desde, hasta], index) => {
      setTimeout(() => {
        window.generar_spots(desde, hasta);
      }, index * 200);
    });
  }
};

// Exportar funciones globalmente
if (typeof window !== 'undefined') {
  window.aplicar_estados_originales = aplicarEstadosOriginales;
  window.regenerar_spots_con_estados = regenerarSpotsConEstados;
}