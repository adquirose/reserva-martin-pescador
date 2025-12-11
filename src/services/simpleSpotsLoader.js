// Cargador simple de spots desde Firestore a krpano
import { collection, getDocs } from 'firebase/firestore';
import { db, PROJECT_PATH, LOTES_COLLECTION } from '../config/firebase.js';

// Cache global de lotes completos
let lotesCompletos = [];

/**
 * Cargar spots desde Firestore y pintarlos directamente en krpano
 * CON VERIFICACIÓN DE ESCENA para evitar bugs en producción
 */
export const cargarYPintarSpots = async () => {
  try {
    console.log('🎯 Cargando spots desde Firestore...');
    
    // 1. VERIFICAR que krpano esté listo y la escena inicializada
    const krpano = window.krpano;
    if (!krpano) {
      console.error('❌ Krpano no disponible');
      return { success: false, message: 'Krpano no disponible' };
    }
    
    // 2. Esperar a que la escena esté completamente cargada
    let intentos = 0;
    let escenaActual = null;
    while (intentos < 10) {
      escenaActual = krpano.get('xml.scene');
      if (escenaActual && escenaActual !== 'null' && escenaActual !== '') {
        break;
      }
      console.log(`⏳ Esperando escena... intento ${intentos + 1}`);
      await new Promise(resolve => setTimeout(resolve, 200));
      intentos++;
    }
    
    if (!escenaActual || escenaActual === 'null') {
      console.error('❌ No se pudo obtener la escena actual después de 2 segundos');
      return { success: false, message: 'Escena no disponible' };
    }
    
    console.log(`🎬 Escena confirmada: ${escenaActual}`);
    
    // 3. Cargar todos los lotes desde Firestore
    const lotesCollection = collection(db, PROJECT_PATH, LOTES_COLLECTION);
    const snapshot = await getDocs(lotesCollection);
    
    if (snapshot.empty) {
      console.warn('⚠️ No hay lotes en Firestore. Usar RepoblarDB para cargar datos desde XML.');
      return { success: false, message: 'No hay datos en Firestore' };
    }
    
    const lotes = snapshot.docs.map(doc => ({
      numero: doc.id,  // El documento usa numero como id
      id: doc.id,      // Compatibilidad
      ...doc.data()
    }));
    
    // Guardar lotes en cache global para acceso en spotClicked
    lotesCompletos = lotes;
    
    console.log(`📊 Lotes cargados desde Firestore: ${lotes.length}`);
    
    // 4. Determinar vista actual usando la escena ya verificada
    const vista = obtenerVistaDeEscena(escenaActual);
    console.log(`👁️ Vista actual: ${vista}`);
    
    // 4. Filtrar lotes para esta vista
    const lotesVista = lotes.filter(lote => {
      const loteId = lote.numero || lote.id;
      
      // Determinar vista basándose SOLO en el número del lote
      const vistaCalculada = asignarVistaSegunNumero(loteId);
      const vistaComparar = vistaCalculada.startsWith('vista') ? vistaCalculada : `vista${vistaCalculada}`;
      
      // Verificar que tenga coordenadas para esta vista
      const tieneCoords = lote.krpano?.[vistaComparar]?.ath !== null && lote.krpano?.[vistaComparar]?.atv !== null;
      
      console.log(`🔍 Lote ${loteId}: vista=${vistaComparar}, actual=${vista}, coords=${tieneCoords}`);
      
      return vistaComparar === vista && tieneCoords;
    });
    
    console.log(`🎯 Lotes para vista ${vista}: ${lotesVista.length}`);
    console.log(`📋 IDs: ${lotesVista.map(l => l.id || l.numero).sort((a,b) => {
      const numA = parseInt(a) || 999;
      const numB = parseInt(b) || 999;
      return numA - numB;
    }).join(', ')}`);
    
    // Mostrar resumen de estados
    const estadosResumen = lotesVista.reduce((acc, lote) => {
      const estado = lote.estado || 'disponible';
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});
    console.log(`📊 Estados en vista ${vista}:`, estadosResumen);
    
    // 5. Verificar que los estilos estén disponibles
    const estilosDisponibles = verificarEstilosHotspots();
    if (!estilosDisponibles) {
      console.warn('⚠️ Algunos estilos de hotspots no están disponibles. Los spots pueden no verse correctamente.');
    }
    
    // 6. Limpiar spots existentes
    limpiarSpotsExistentes();
    
    // 7. Pintar spots en krpano
    let spotsCreados = 0;
    
    for (const lote of lotesVista) {
      const spotCreado = crearSpotEnKrpano(lote);
      if (spotCreado) {
        spotsCreados++;
      }
    }
    
    console.log(`✅ Spots creados en krpano: ${spotsCreados}/${lotesVista.length}`);
    
    return {
      success: true,
      vista,
      totalLotes: lotes.length,
      lotesVista: lotesVista.length,
      spotsCreados,
      lotes: lotesVista.map(l => l.id || l.numero)
    };
    
  } catch (error) {
    console.error('❌ Error cargando spots desde Firestore:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Determinar vista actual basada en la escena de krpano
 */
function obtenerVistaDeEscena(scene) {
  if (!scene) return 'vista1';
  
  console.log(`🎬 Analizando escena: ${scene}`);
  
  // Mapeo directo por nombre de escena
  if (scene.includes('e1') || scene.includes('scene_1')) return 'vista1';
  if (scene.includes('e2') || scene.includes('scene_2')) return 'vista2';
  if (scene.includes('e3') || scene.includes('scene_3')) return 'vista3';
  if (scene.includes('e4') || scene.includes('scene_4')) return 'vista4';
  
  // Fallback: extraer número
  const sceneNumber = scene.replace(/[^0-9]/g, '');
  const num = parseInt(sceneNumber) || 1;
  
  if (num === 1) return 'vista1';
  if (num === 2) return 'vista2'; 
  if (num === 3) return 'vista3';
  if (num === 4) return 'vista4';
  
  return 'vista1'; // Default
}

/**
 * Asignar vista según número de lote (para lotes sin vista asignada)
 */
function asignarVistaSegunNumero(numero) {
  const num = parseInt(numero);
  
  if (!isNaN(num)) {
    // Números 1-31 - CORREGIDO según spots.xml
    if ([1,2,3,4,5,6].includes(num)) return 'vista1';
    if ([7,8,9,10,11].includes(num)) return 'vista2';              // Sin 12
    if ([12,13,14,15,16].includes(num)) return 'vista3';           // Con 12
    if ([17,18,19,20,21,22,23,24,25,26,27,28,29,30,31].includes(num)) return 'vista4';
  }
  
  // Alfanuméricos por vista - CORREGIDO
  if (['J','K','L'].includes(numero)) return 'vista1';
  if (['M1','M2'].includes(numero)) return 'vista2';
  if (['M3','M4'].includes(numero)) return 'vista3';
  if (['M','M5','M6','M7','M8'].includes(numero)) return 'vista4';
  
  return 'vista1'; // Default
}

/**
 * Verificar que los estilos de hotspots estén disponibles
 */
function verificarEstilosHotspots() {
  const krpano = window.krpano;
  if (!krpano) return false;
  
  try {
    const estilos = ['hs_pro_disponible', 'hs_pro_vendido', 'hs_pro_reservado'];
    const estilosDisponibles = [];
    
    estilos.forEach(estilo => {
      try {
        const style = krpano.get(`style[${estilo}]`);
        if (style) {
          estilosDisponibles.push(estilo);
        }
      } catch {
        // Estilo no disponible
      }
    });
    
    console.log(`🎨 Estilos de hotspots disponibles: ${estilosDisponibles.join(', ')}`);
    
    if (estilosDisponibles.length === 0) {
      console.warn('⚠️ No se encontraron estilos de hotspots. Verifica que hotspots-actions.xml esté cargado.');
      return false;
    }
    
    return estilosDisponibles.length === estilos.length;
    
  } catch (error) {
    console.error('❌ Error verificando estilos:', error);
    return false;
  }
}

/**
 * Limpiar todos los spots existentes en krpano
 */
function limpiarSpotsExistentes() {
  const krpano = window.krpano;
  if (!krpano) return;
  
  try {
    // Buscar todos los hotspots que empiecen con 'spot_'
    const hotspots = krpano.get('hotspot');
    if (hotspots) {
      Object.keys(hotspots).forEach(hotspotName => {
        if (hotspotName.startsWith('spot_')) {
          krpano.call(`removehotspot(${hotspotName})`);
        }
      });
    }
    
    console.log('🧹 Spots existentes limpiados');
  } catch (error) {
    console.warn('⚠️ Error limpiando spots:', error.message);
  }
}

/**
 * Crear un spot individual en krpano con estilo según estado
 */
function crearSpotEnKrpano(lote) {
  const krpano = window.krpano;
  if (!krpano) return false;
  
  try {
    const loteId = lote.numero || lote.id;  // Compatibilidad
    const spotName = `spot_${loteId}`;
    const estado = lote.estado || 'disponible';
    
    // Determinar vista actual desde krpano
    const currentScene = krpano.get('xml.scene');
    const vistaActual = obtenerVistaDeEscena(currentScene);
    const coordsVista = lote.krpano?.[vistaActual];
    
    // Verificar que existen coordenadas para esta vista
    if (!coordsVista || coordsVista.ath === null || coordsVista.atv === null) {
      console.log(`⚠️ Lote ${loteId}: No tiene coordenadas para ${vistaActual}`);
      return false;
    }
    
    // Obtener coordenadas desde la vista específica
    let ath = coordsVista.ath;
    let atv = coordsVista.atv;
    
    // HTML display (número del lote para mostrar en el spot)
    const htmlDisplay = coordsVista?.html || lote.html || loteId;
    
    // Coordenadas de respaldo por número
    if (!ath || !atv) {
      const coords = obtenerCoordenadasRespaldo(loteId);
      ath = coords.ath;
      atv = coords.atv;
    }
    
    // Determinar estilo según estado
    let estilo = 'hs_pro_disponible'; // Default
    switch(estado.toLowerCase()) {
      case 'vendido':
      case 'vendida':
        estilo = 'hs_pro_vendido';
        break;
      case 'reservado':
      case 'reservada':
        estilo = 'hs_pro_reservado';
        break;
      case 'disponible':
      default:
        estilo = 'hs_pro_disponible';
        break;
    }
    
    // Crear hotspot en krpano usando loadstyle
    krpano.call(`
      addhotspot(${spotName});
      set(hotspot[${spotName}].ath, ${ath});
      set(hotspot[${spotName}].atv, ${atv});
      hotspot[${spotName}].loadstyle(${estilo});
      set(hotspot[${spotName}].html, "${htmlDisplay}");
      set(hotspot[${spotName}].onclick, js("window.spotClicked('${loteId}')"));
    `);
    
    console.log(`✅ Spot creado: ${spotName} (${ath}, ${atv}) estado: ${estado} estilo: ${estilo}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error creando spot ${lote.numero || lote.id}:`, error);
    return false;
  }
}

/**
 * Coordenadas de respaldo para lotes sin coordenadas
 */
function obtenerCoordenadasRespaldo(numero) {
  // Coordenadas básicas por defecto (se pueden ajustar)
  const defaultCoords = {
    1: { ath: -120, atv: 0 }, 2: { ath: -100, atv: 0 }, 3: { ath: -80, atv: 0 },
    4: { ath: -60, atv: 0 }, 5: { ath: -40, atv: 0 }, 6: { ath: -20, atv: 0 },
    7: { ath: 0, atv: 0 }, 8: { ath: 20, atv: 0 }, 9: { ath: 40, atv: 0 },
    10: { ath: 60, atv: 0 }, 11: { ath: 80, atv: 0 }, 12: { ath: 100, atv: 0 },
    13: { ath: 120, atv: 0 }, 14: { ath: 140, atv: 0 }, 15: { ath: 160, atv: 0 },
    16: { ath: 180, atv: 0 }, 17: { ath: -160, atv: 0 }, 18: { ath: -140, atv: 0 },
    19: { ath: -120, atv: 0 }, 20: { ath: -100, atv: 0 }, 21: { ath: -80, atv: 0 },
    22: { ath: -60, atv: 0 }, 23: { ath: -40, atv: 0 }, 24: { ath: -20, atv: 0 },
    25: { ath: 0, atv: 0 }, 26: { ath: 20, atv: 0 }, 27: { ath: 40, atv: 0 },
    28: { ath: 60, atv: 0 }, 29: { ath: 80, atv: 0 }, 30: { ath: 100, atv: 0 },
    31: { ath: 120, atv: 0 }, 
    'M5': { ath: 140, atv: 0 }, 'M6': { ath: 160, atv: 0 },
    'M7': { ath: 180, atv: 0 }, 'M8': { ath: -160, atv: 0 }
  };
  
  return defaultCoords[numero] || { ath: 0, atv: 0 };
}

/**
 * Handler para clicks en spots
 */
window.spotClicked = (id) => {
  console.log(`🎯 Spot clickeado: ${id}`);
  
  // Buscar el lote completo en el cache
  const loteCompleto = lotesCompletos.find(lote => 
    lote.numero == id || lote.id == id
  );
  
  if (loteCompleto) {
    console.log(`📋 Lote completo encontrado:`, loteCompleto);
    
    // Mostrar ficha del lote usando Redux store
    if (window.store && window.fichaActions) {
      try {
        window.store.dispatch(window.fichaActions.mostrarFicha(loteCompleto));
        console.log(`📋 Ficha del lote ${id} mostrada`);
      } catch (error) {
        console.error(`❌ Error mostrando ficha del lote ${id}:`, error);
      }
    } else {
      // Fallback usando evento personalizado
      window.dispatchEvent(new CustomEvent('mostrarFichaLote', {
        detail: loteCompleto
      }));
    }
  } else {
    console.warn(`⚠️ Lote ${id} no encontrado en cache, usando datos básicos`);
    
    // Mostrar ficha del lote usando Redux store con datos básicos
    if (window.store && window.fichaActions) {
      try {
        // Crear objeto lote simple para la ficha
        const lote = { id: id, numero: id }; // Compatibilidad con ambos campos
        window.store.dispatch(window.fichaActions.mostrarFicha(lote));
        console.log(`📋 Ficha del lote ${id} mostrada (datos básicos)`);
      } catch (error) {
        console.error(`❌ Error mostrando ficha del lote ${id}:`, error);
      }
    } else {
      // Fallback usando evento personalizado
      window.dispatchEvent(new CustomEvent('mostrarFichaLote', {
        detail: { id: id, numero: id }
      }));
    }
  }
};

/**
 * Función para monitorear cambios de escena y recargar spots automáticamente
 */
export const iniciarMonitoreoEscena = () => {
  const krpano = window.krpano;
  if (!krpano) {
    console.warn('⚠️ krpano no disponible para monitoreo');
    return;
  }
  
  // Detectar cambios de escena
  let escenaAnterior = krpano.get('xml.scene');
  
  setInterval(() => {
    const escenaActual = krpano.get('xml.scene');
    if (escenaActual !== escenaAnterior) {
      console.log(`🎬 Cambio de escena: ${escenaAnterior} → ${escenaActual}`);
      escenaAnterior = escenaActual;
      
      // Recargar spots para la nueva escena
      setTimeout(() => {
        cargarYPintarSpots();
      }, 500); // Pequeño delay para que krpano complete la transición
    }
  }, 1000);
  
  console.log('🔄 Monitoreo de escena iniciado');
};

/**
 * Función simple para inicializar el sistema de spots
 */
export const inicializarSpotsSimple = async () => {
  console.log('🚀 Inicializando sistema simple de spots...');
  
  // 1. Cargar y pintar spots iniciales
  const result = await cargarYPintarSpots();
  
  // 2. Configurar listener para cambios automáticos de escena
  if (result.success) {
    console.log('🎧 Configurando auto-recarga de spots...');
    configurarListenerEscenas();
    iniciarMonitoreoEscena();
  }
  
  return result;
};

// Exponer funciones globalmente para debugging
window.cargarYPintarSpots = cargarYPintarSpots;
window.inicializarSpotsSimple = inicializarSpotsSimple;
window.verificarEstilosHotspots = verificarEstilosHotspots;
window.configurarListenerEscenas = configurarListenerEscenas;

// Función de debug para ver estructura de lotes
window.verEstructuraLote = async (numero) => {
  try {
    const lotesCollection = collection(db, PROJECT_PATH, LOTES_COLLECTION);
    const snapshot = await getDocs(lotesCollection);
    
    const lote = snapshot.docs.find(doc => doc.id === numero);
    if (lote) {
      const data = lote.data();
      console.log(`🔍 Estructura del lote ${numero}:`, JSON.stringify(data, null, 2));
      return data;
    } else {
      console.log(`❌ Lote ${numero} no encontrado`);
      return null;
    }
  } catch (error) {
    console.error('❌ Error obteniendo lote:', error);
    return null;
  }
};

// Función para crear spots de prueba con diferentes estados
window.crearSpotsEstadosPrueba = async () => {
  const krpano = window.krpano;
  if (!krpano) {
    console.error('❌ krpano no disponible');
    return;
  }
  
  console.log('🧪 Creando spots de prueba para diferentes estados...');
  
  // Limpiar spots existentes
  limpiarSpotsExistentes();
  
  // Crear spots de prueba
  const spotsPrueba = [
    { id: 'prueba_disponible', estado: 'disponible', ath: 0, atv: 0 },
    { id: 'prueba_vendido', estado: 'vendido', ath: 30, atv: 0 },
    { id: 'prueba_reservado', estado: 'reservado', ath: 60, atv: 0 }
  ];
  
  spotsPrueba.forEach(spot => {
    crearSpotEnKrpano(spot);
  });
  
  console.log('✅ Spots de prueba creados. Verifica los diferentes estilos.');
};

/**
 * Configurar listener para cambios automáticos de escena
 * Recarga spots cuando el usuario cambia de vista en el tour
 */
export const configurarListenerEscenas = () => {
  const krpano = window.krpano;
  if (!krpano) {
    console.warn('⚠️ krpano no disponible para configurar listener');
    return false;
  }
  
  console.log('🎧 Configurando listener para cambios de escena...');
  
  try {
    // Configurar onloadcomplete para detectar cambios de escena
    krpano.call(`
      set(events[onLoadCompleteSpots].name, onLoadCompleteSpots);
      set(events[onLoadCompleteSpots].keep, true);
      set(events[onLoadCompleteSpots].onloadcomplete, 
        js(
          if(krpano, 
            js(
              console.log('🔄 Escena cambiada, recargando spots...');
              setTimeout(function() {
                if(window.recargarSpotsActuales) {
                  window.recargarSpotsActuales();
                }
              }, 500);
            )
          )
        )
      );
    `);
    
    // Función global para recargar spots
    window.recargarSpotsActuales = async () => {
      try {
        console.log('🔄 Recargando spots para nueva escena...');
        await cargarYPintarSpots();
      } catch (error) {
        console.error('❌ Error recargando spots:', error);
      }
    };
    
    console.log('✅ Listener de escenas configurado correctamente');
    return true;
    
  } catch (error) {
    console.error('❌ Error configurando listener de escenas:', error);
    return false;
  }
};