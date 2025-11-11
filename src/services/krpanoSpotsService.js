// Servicio para cargar spots dinámicamente en Krpano desde Firebase
// EXACTO como en fundo-refugia
import { getAllLotes } from './firestoreServiceNew.js';
import { getDisplayId } from './spotsXmlParser.js';

// Cache global de lotes
let spotsData = null;

// Mapeo de escena a vista
const sceneToVista = {
  'scene_e1': 'vista1',
  'scene_e2': 'vista2', 
  'scene_e3': 'vista3',
  'scene_e4': 'vista4'
};

// Estilos por estado - usando los estilos de hotspots-actions.xml
const getSpotStyle = (estado) => {
  switch(estado) {
    case 'disponible': return 'hs_pro_disponible';
    case 'vendido': return 'hs_pro_vendido';
    case 'reservado': return 'hs_pro_reservado';
    default: return 'hs_pro_disponible'; // Por defecto disponible
  }
};

// Función para cargar datos desde Firebase - EXACTO como fundo-refugia
const cargarSpotsData = async () => {
  if (!spotsData) {
    console.log('📦 Cargando spots desde Firebase...');
    try {
      spotsData = await getAllLotes();
      console.log(`✅ ${spotsData.length} spots cargados desde Firebase`);
    } catch (error) {
      console.error('❌ Error cargando spots:', error);
      spotsData = [];
    }
  } else {
    console.log(`📋 Usando cache: ${spotsData.length} spots disponibles`);
  }
  return spotsData;
};

// Función principal generar_spots - EXACTO como fundo-refugia
window.generar_spots = async (desde, hasta) => {
  console.log(`🚀 === GENERAR SPOTS ${desde}-${hasta} ===`);
  
  if (!window.krpano) {
    console.error('❌ Krpano no disponible');
    return;
  }

  try {
    // Cargar datos de Firebase
    console.log('📂 Cargando datos desde Firebase...');
    const spots = await cargarSpotsData();
    console.log(`📊 Spots cargados: ${spots ? spots.length : 0}`);
    
    // Obtener escena actual
    const currentScene = window.krpano.get('xml.scene');
    const vista = sceneToVista[currentScene];
    
    console.log(`�️ Escena actual: ${currentScene} -> Vista: ${vista}`);
    
    if (!vista) {
      console.warn(`❌ Vista no encontrada para escena: ${currentScene}`);
      return;
    }

    // Filtrar spots por rango y vista
    const spotsParaGenerar = spots.filter(spot => {
      const numero = parseInt(spot.numero);
      const tieneVista = spot.krpano && spot.krpano[vista];
      
      // Para lotes numerados, verificar rango
      if (!isNaN(numero)) {
        const enRango = numero >= desde && numero <= hasta;
        return tieneVista && enRango;
      } 
      // Para lotes alfanuméricos, incluir si tiene la vista correcta
      else {
        return tieneVista && spot.vista === vista;
      }
    });

    console.log(`📍 Generando ${spotsParaGenerar.length} spots para ${vista} (${desde}-${hasta})`);

    // Verificar hotspots existentes antes
    const hotspotsBefore = window.krpano.get('hotspot.count') || 0;
    console.log(`🔍 Hotspots existentes antes: ${hotspotsBefore}`);

    // Generar cada spot con delay
    spotsParaGenerar.forEach((spot, index) => {
      setTimeout(() => {
        const krpanoData = spot.krpano[vista];
        let style = getSpotStyle(spot.estado);
        const spotName = `spot_${spot.numero}`;
        
        try {
          // Obtener identificador de display correcto (ej: "M4" para lote 29)
          const displayId = getDisplayId(spot.numero);
          
          console.log(`🔧 Creando spot ${spot.numero}:`, {
            name: spotName,
            ath: krpanoData.ath,
            atv: krpanoData.atv,
            style: style,
            estado: spot.estado,
            displayId: displayId
          });
          
          // Verificar si el estilo existe
          const styleExists = window.krpano.get(`style[${style}].name`);
          if (!styleExists) {
            console.warn(`⚠️ Estilo ${style} no encontrado, usando hs_pro_disponible como fallback`);
            style = 'hs_pro_disponible'; // Fallback al estilo disponible
          } else {
            console.log(`✅ Estilo ${style} encontrado para estado "${spot.estado}"`);
          }
          
          // Crear hotspot
          window.krpano.call(`addhotspot(${spotName})`);
          window.krpano.call(`set(hotspot[${spotName}].ath, ${krpanoData.ath})`);
          window.krpano.call(`set(hotspot[${spotName}].atv, ${krpanoData.atv})`);
          
          // Usar el mismo método que en hotspots-actions.xml
          const loadStyleCommand = `hotspot[${spotName}].loadstyle(${style})`;
          console.log(`🎨 Aplicando estilo: ${loadStyleCommand}`);
          window.krpano.call(loadStyleCommand);
          
          window.krpano.call(`set(hotspot[${spotName}].handcursor, true)`);
          window.krpano.call(`set(hotspot[${spotName}].text, ${displayId})`);
          window.krpano.call(`set(hotspot[${spotName}].visible, true)`);
          window.krpano.call(`set(hotspot[${spotName}].enabled, true)`);
          
          // Eventos
          const precio = spot.precio || 'Consultar';
          
          window.krpano.call(`set(hotspot[${spotName}].onhover, showtext('Lote ${displayId} - ${spot.estado} - ${precio}'))`);
          window.krpano.call(`set(hotspot[${spotName}].onclick, js(mostrarFicha(${spot.numero})))`);
          
          // Verificar que se creó correctamente
          const creado = window.krpano.get(`hotspot[${spotName}].name`);
          if (creado) {
            console.log(`✅ Spot ${spot.numero} creado y verificado`);
          } else {
            console.error(`❌ Spot ${spot.numero} NO se creó correctamente`);
          }
          
        } catch (error) {
          console.error(`❌ Error generando spot ${spot.numero}:`, error);
        }
      }, index * 30);
    });

    // Verificar resultado final después de todos los delays
    setTimeout(() => {
      const hotspotsAfter = window.krpano.get('hotspot.count') || 0;
      console.log(`🎯 Verificación final: ${hotspotsAfter} hotspots totales después de generar ${spotsParaGenerar.length} spots`);
      
      // Listar hotspots creados
      for (let i = 0; i < hotspotsAfter; i++) {
        const hotspotName = window.krpano.get(`hotspot[${i}].name`);
        if (hotspotName && hotspotName.startsWith('spot_')) {
          const visible = window.krpano.get(`hotspot[${hotspotName}].visible`);
          const ath = window.krpano.get(`hotspot[${hotspotName}].ath`);
          const atv = window.krpano.get(`hotspot[${hotspotName}].atv`);
          console.log(`📍 ${hotspotName}: visible=${visible}, ath=${ath}, atv=${atv}`);
        }
      }
    }, spotsParaGenerar.length * 30 + 500);

  } catch (error) {
    console.error('❌ Error en generar_spots:', error);
  }
};

// Función auxiliar para serializar datos de Firebase para Redux
const serializarParaRedux = (objeto) => {
  if (!objeto) return objeto;
  
  const objetoSerializado = {};
  
  for (const [key, value] of Object.entries(objeto)) {
    if (value && typeof value === 'object') {
      // Convertir Timestamps de Firebase
      if (value.toDate && typeof value.toDate === 'function') {
        objetoSerializado[key] = value.toDate().toISOString();
      } 
      // Manejar otros objetos anidados
      else if (value.constructor === Object) {
        objetoSerializado[key] = serializarParaRedux(value);
      }
      // Mantener arrays y otros tipos serializables
      else if (Array.isArray(value)) {
        objetoSerializado[key] = value.map(item => 
          typeof item === 'object' ? serializarParaRedux(item) : item
        );
      }
      else {
        objetoSerializado[key] = value;
      }
    } else {
      objetoSerializado[key] = value;
    }
  }
  
  return objetoSerializado;
};

// Función para mostrar ficha - Conectada con Redux
window.mostrarFicha = (numeroLote) => {
  console.log(`📋 Mostrar ficha del lote ${numeroLote}`);
  
  if (spotsData) {
    const lote = spotsData.find(s => s.numero == numeroLote);
    if (lote) {
      console.log('📄 Datos del lote:', lote);
      
      // Preparar información completa del lote
      const infoBase = {
        ...lote,
        superficie: lote.superficie || lote.superficieLote || null, // Prioridad: superficie > superficieLote
        precio: lote.precio || null, // Mantener null si no hay precio definido
        descripcion: lote.descripcion || `Lote ${lote.html || lote.numero} ubicado en la Etapa ${lote.etapa || 1} del proyecto Martin Pescador.`
      };
      
      // Serializar para Redux (convertir Timestamps y otros objetos no serializables)
      const infoCompleta = serializarParaRedux(infoBase);
      
      // Disparar acción Redux para mostrar la ficha
      if (window.store) {
        const { mostrarFicha } = window.fichaActions || {};
        if (mostrarFicha) {
          window.store.dispatch(mostrarFicha(infoCompleta));
          console.log('✅ Ficha desplegada via Redux');
        } else {
          console.warn('⚠️ fichaActions no disponibles, usando fallback');
          // Fallback: usar evento personalizado
          window.dispatchEvent(new CustomEvent('mostrarFichaLote', { 
            detail: infoCompleta 
          }));
        }
      } else {
        console.warn('⚠️ Store no disponible, usando evento personalizado');
        // Fallback: usar evento personalizado
        window.dispatchEvent(new CustomEvent('mostrarFichaLote', { 
          detail: infoCompleta 
        }));
      }
      
      console.log('🏡 Información completa:', infoCompleta);
    } else {
      console.error(`❌ Lote ${numeroLote} no encontrado en spotsData`);
    }
  } else {
    console.error('❌ spotsData no está cargado');
  }
};

// Registrar funciones cuando se inicialice Krpano
export const registerKrpanoSpotLoader = () => {
  if (typeof window !== 'undefined') {
    console.log('🔧 Registrando funciones globales de spots...');
    
    // Pre-cargar datos
    cargarSpotsData().then(() => {
      console.log('✅ Datos de spots precargados');
    }).catch(error => {
      console.error('❌ Error precargando datos:', error);
    });
  }
};

// Funciones de compatibilidad para componentes React
export const cargarTodosLosSpots = async (escena) => {
  console.log(`🎯 cargarTodosLosSpots para ${escena}`);
  if (window.generar_spots) {
    // Cargar todos los spots de la escena
    await window.generar_spots(1, 50);
  }
};

// Exponer funciones de migración globalmente para debugging
if (typeof window !== 'undefined') {
  // Función para migrar datos desde la consola
  window.migrar_datos_html = async () => {
    const { migrateLotesWithHtmlIds, verifyDataConsistency } = await import('./dataMigration.js');
    console.log('🔄 Iniciando migración...');
    const result = await migrateLotesWithHtmlIds();
    console.log('✅ Migración completada:', result);
    return result;
  };

  // Función para verificar consistencia
  window.verificar_consistencia = async () => {
    const { verifyDataConsistency } = await import('./dataMigration.js');
    console.log('🔍 Verificando consistencia...');
    const result = await verifyDataConsistency();
    console.log('📋 Resultado:', result);
    return result;
  };

  // Funciones de repoblación de base de datos
  window.repoblar_base_datos = async () => {
    const { repoblarBaseDatos, verificarIntegridad } = await import('./repoblarDB.js');
    console.log('🔄 Iniciando repoblación completa (datos hardcodeados)...');
    const result = await repoblarBaseDatos();
    console.log('📋 Resultado repoblación:', result);
    
    if (result.success) {
      console.log('🔍 Verificando integridad...');
      const integridad = await verificarIntegridad();
      console.log('📊 Integridad:', integridad);
      
      // Limpiar cache y recargar datos
      window.spotsData = null;
      await cargarSpotsData();
      console.log('🔄 Cache limpiado y datos recargados');
    }
    
    return result;
  };

  // NUEVA FUNCIÓN: Repoblar desde archivos XML principales
  window.repoblar_desde_xml = async () => {
    const { repoblarCompletoFromXML } = await import('./repoblarFromXML.js');
    console.log('📂 Iniciando repoblación desde archivos XML principales...');
    console.log('📋 Fuente: /krpano/skin/data.xml + /krpano/skin/spots.xml');
    
    const result = await repoblarCompletoFromXML();
    console.log('📊 Resultado repoblación XML:', result);
    
    if (result.exito_total) {
      // Limpiar cache y recargar datos
      window.spotsData = null;
      await cargarSpotsData();
      console.log('🔄 Cache limpiado y datos recargados desde XML');
    }
    
    return result;
  };

  // NUEVA FUNCIÓN: Verificar datos XML
  window.verificar_datos_xml = async () => {
    const { loadAllLotesFromXML } = await import('./xmlMainParser.js');
    console.log('📂 Verificando archivos XML principales...');
    
    try {
      const { lotesArray, count } = await loadAllLotesFromXML();
      console.log(`📊 Lotes encontrados en XML: ${count}`);
      console.log(`📋 Números: ${lotesArray.map(l => l.numero).sort((a,b) => parseInt(a) - parseInt(b)).join(', ')}`);
      
      return {
        success: true,
        count,
        numeros: lotesArray.map(l => l.numero).sort((a,b) => parseInt(a) - parseInt(b))
      };
    } catch (error) {
      console.error('❌ Error verificando XML:', error);
      return { success: false, error: error.message };
    }
  };

  // NUEVA FUNCIÓN: Proceso completo simple
  window.proceso_completo_simple = async () => {
    console.log('🚀 Iniciando proceso completo simple...');
    
    try {
      // 1. Repoblar desde XML
      console.log('📂 Paso 1: Repoblando base de datos desde XML...');
      const resultRepoblar = await window.repoblar_desde_xml();
      
      if (!resultRepoblar.exito_total) {
        console.warn('⚠️ Repoblación tuvo errores, continuando de todas formas...');
      }
      
      // 2. Cargar y pintar spots si krpano está disponible
      if (window.krpano) {
        console.log('🎯 Paso 2: Cargando spots en krpano...');
        
        const { cargarYPintarSpots } = await import('./simpleSpotsLoader.js');
        const resultSpots = await cargarYPintarSpots();
        
        console.log('✅ Proceso completo finalizado:', {
          repoblacion: resultRepoblar,
          spots: resultSpots
        });
        
        return {
          success: true,
          repoblacion: resultRepoblar,
          spots: resultSpots,
          message: 'Base de datos repoblada y spots cargados exitosamente'
        };
      } else {
        console.log('⚠️ krpano no está disponible, solo se completó la repoblación');
        return {
          success: true,
          repoblacion: resultRepoblar,
          spots: null,
          message: 'Base de datos repoblada. Spots se cargarán automáticamente al iniciar el tour.'
        };
      }
      
    } catch (error) {
      console.error('❌ Error en proceso completo:', error);
      return {
        success: false,
        error: error.message,
        message: 'Error ejecutando el proceso completo'
      };
    }
  };

  // NUEVA FUNCIÓN: Verificar campos capturados del XML
  window.verificar_campos_xml = async () => {
    const { loadAllLotesFromXML } = await import('./xmlMainParser.js');
    console.log('🔍 Verificando campos capturados del XML...');
    
    try {
      const { lotesArray } = await loadAllLotesFromXML();
      
      // Mostrar ejemplo de los primeros 3 lotes
      console.log('📋 Muestra de lotes capturados:');
      lotesArray.slice(0, 3).forEach(lote => {
        console.log(`\n📍 Lote ${lote.numero}:`);
        console.log(`  Estado: ${lote.estado}`);
        console.log(`  Superficie: ${lote.superficieTotal}${lote.unidadSuperficie || 'm²'}`);
        console.log(`  Metros orilla: ${lote.superficieTransito || 'N/A'}`);
        console.log(`  Precio: ${lote.precio || 'Consultar'}`);
        console.log(`  Descripción: ${(lote.descripcion || '').substring(0, 100)}...`);
        console.log(`  Vista: ${lote.vista}`);
        console.log(`  Coordenadas: (${lote.ath}, ${lote.atv})`);
      });
      
      // Resumen por campos
      const resumen = {
        total: lotesArray.length,
        conSuperficie: lotesArray.filter(l => l.superficieTotal).length,
        conOrilla: lotesArray.filter(l => l.superficieTransito).length,
        conPrecio: lotesArray.filter(l => l.precio).length,
        conDescripcion: lotesArray.filter(l => l.descripcion).length,
        conCoordenadas: lotesArray.filter(l => l.ath && l.atv).length,
        porVista: {
          vista1: lotesArray.filter(l => l.vista === 'vista1').length,
          vista2: lotesArray.filter(l => l.vista === 'vista2').length,
          vista3: lotesArray.filter(l => l.vista === 'vista3').length,
          vista4: lotesArray.filter(l => l.vista === 'vista4').length
        }
      };
      
      console.log('\n📊 Resumen de campos capturados:');
      console.table(resumen);
      
      return { lotesArray, resumen };
      
    } catch (error) {
      console.error('❌ Error verificando campos XML:', error);
      return { success: false, error: error.message };
    }
  };

  // Función para forzar recarga de datos
  window.recargar_spots_data = async () => {
    console.log('🔄 Forzando recarga de datos...');
    window.spotsData = null;
    await cargarSpotsData();
    console.log('✅ Datos recargados');
    return window.spotsData ? window.spotsData.length : 0;
  };

  // Función para verificar lotes faltantes
  window.verificar_lotes_faltantes = async () => {
    const { verificarLotesFaltantes } = await import('./verificarLotes.js');
    console.log('🔍 Verificando lotes faltantes...');
    const result = await verificarLotesFaltantes();
    console.log('📋 Resultado verificación:', result);
    return result;
  };

  // Función para completar lotes faltantes
  window.completar_lotes_faltantes = async () => {
    const { completarLotesFaltantes } = await import('./verificarLotes.js');
    console.log('🔧 Completando lotes faltantes...');
    const result = await completarLotesFaltantes();
    console.log('🎉 Lotes completados:', result);
    return result;
  };

  // Función para contar lotes totales
  window.contar_lotes_esperados = () => {
    console.log('📊 Lotes esperados: 31 (números 1-31)');
    console.log('📍 Distribución por vista:');
    console.log('  Vista 1: 1,2,3,4,5,6,23,24,25 (9 lotes)');
    console.log('  Vista 2: 7,8,9,10,11,26,27 (7 lotes)');
    console.log('  Vista 3: 12,13,14,15,16,28,29 (7 lotes)');
    console.log('  Vista 4: 17,18,19,20,21,22,30,31 (8 lotes)');
    return 31;
  };

  // Función para forzar recarga de datos
  window.recargar_spots_data = async () => {
    console.log('🔄 Forzando recarga de datos...');
    spotsData = null; // Limpiar cache local
    const datos = await cargarSpotsData();
    window.spotsData = datos; // Hacer accesible globalmente
    console.log(`📊 Datos recargados: ${datos ? datos.length : 0} spots`);
    return datos;
  };

  window.verificar_integridad_db = async () => {
    const { verificarIntegridad } = await import('./repoblarDB.js');
    console.log('🔍 Verificando integridad de la base de datos...');
    const result = await verificarIntegridad();
    console.log('📊 Resultado:', result);
    return result;
  };

  // Función para actualizar precios específicos (usar solo cuando sea necesario)
  window.actualizar_precio_lote = async (numeroLote, precio) => {
    try {
      console.log(`💰 Actualizando precio del lote ${numeroLote} a ${precio || 'null'}`);
      
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db, PROJECT_PATH, LOTES_COLLECTION } = await import('../config/firebase.js');
      
      const docRef = doc(db, PROJECT_PATH, LOTES_COLLECTION, numeroLote.toString());
      await updateDoc(docRef, { 
        precio: precio,
        fechaActualizacion: new Date()
      });
      
      console.log(`✅ Precio del lote ${numeroLote} actualizado`);
      
      // Limpiar cache para recargar datos
      window.spotsData = null;
      
      return { success: true };
    } catch (error) {
      console.error(`❌ Error actualizando precio del lote ${numeroLote}:`, error);
      return { success: false, error: error.message };
    }
  };

  // Función para verificar estilos disponibles
  window.verificar_estilos = () => {
    if (!window.krpano) {
      console.error('❌ Krpano no está disponible');
      return;
    }

    const estilos = ['hs_pro_disponible', 'hs_pro_vendido', 'hs_pro_reservado'];
    console.log('🎨 Verificando estilos disponibles:');
    
    estilos.forEach(estilo => {
      const exists = window.krpano.get(`style[${estilo}].name`);
      const bgcolor = window.krpano.get(`style[${estilo}].bgcolor`);
      console.log(`  ${estilo}: ${exists ? '✅ Existe' : '❌ No existe'} ${bgcolor ? `(color: ${bgcolor})` : ''}`);
    });

    // Mostrar todos los hotspots actuales
    const hotspotCount = window.krpano.get('hotspot.count') || 0;
    console.log(`📍 Hotspots actuales: ${hotspotCount}`);
    
    for (let i = 0; i < hotspotCount; i++) {
      const name = window.krpano.get(`hotspot[${i}].name`);
      if (name && name.startsWith('spot_')) {
        const style = window.krpano.get(`hotspot[${name}].style`);
        const visible = window.krpano.get(`hotspot[${name}].visible`);
        const text = window.krpano.get(`hotspot[${name}].text`);
        console.log(`  ${name}: style="${style}", visible=${visible}, text="${text}"`);
      }
    }
  };

  // Importar funciones de manejo de estados
  import('./estadosManager.js');

  // Función para verificar estados de lotes
  window.verificar_estados_lotes = async () => {
    console.log('🔍 Verificando estados de lotes...');
    
    if (!spotsData) {
      console.log('⏳ Cargando datos de lotes...');
      await cargarSpotsData();
    }

    if (spotsData) {
      console.log(`📋 Total de lotes: ${spotsData.length}`);
      
      // Hacer accesible globalmente para debugging
      window.spotsData = spotsData;
      
      const estadosCuenta = {};
      const ejemplos = { disponible: [], vendido: [], reservado: [] };
      
      spotsData.forEach(lote => {
        const estado = lote.estado || 'sin-estado';
        estadosCuenta[estado] = (estadosCuenta[estado] || 0) + 1;
        
        if (ejemplos[estado] && ejemplos[estado].length < 3) {
          ejemplos[estado].push(`${lote.numero} (${getDisplayId(lote.numero)})`);
        }
      });
      
      console.log('📊 Distribución de estados:');
      Object.entries(estadosCuenta).forEach(([estado, cantidad]) => {
        const estilo = estado === 'sin-estado' ? 'N/A' : getSpotStyle(estado);
        console.log(`  ${estado}: ${cantidad} lotes -> estilo: ${estilo}`);
        if (ejemplos[estado] && ejemplos[estado].length > 0) {
          console.log(`    Ejemplos: ${ejemplos[estado].join(', ')}`);
        }
      });
      
      return { estadosCuenta, total: spotsData.length };
    } else {
      console.error('❌ No se pudieron cargar los datos de lotes');
      return null;
    }
  };
  
  // NUEVA FUNCIÓN: Debugging específico para vista 4
  window.debug_vista4 = async () => {
    console.log('🔍 === DEBUG VISTA 4 ===');
    
    // 1. Cargar datos si no están cargados
    if (!spotsData) {
      console.log('⏳ Cargando datos...');
      await cargarSpotsData();
      window.spotsData = spotsData;
    }
    
    // 2. Verificar escena actual
    const currentScene = window.krpano?.get('xml.scene');
    const vista = sceneToVista[currentScene];
    console.log(`🎬 Escena actual: ${currentScene} -> Vista: ${vista}`);
    
    // 3. Filtrar lotes para vista 4
    const lotesVista4 = spotsData?.filter(spot => {
      const tieneVista = spot.krpano && spot.krpano.vista4;
      const esVista4 = spot.vista === 'vista4';
      return tieneVista || esVista4;
    });
    
    console.log(`📍 Lotes en vista 4: ${lotesVista4?.length || 0}`);
    console.log(`📋 Números:`, lotesVista4?.map(s => s.numero));
    
    // 4. Verificar estructura krpano de cada lote
    lotesVista4?.forEach(lote => {
      console.log(`🔧 Lote ${lote.numero}:`, {
        vista: lote.vista,
        krpano: lote.krpano,
        estado: lote.estado
      });
    });
    
    // 5. Verificar hotspots actuales
    const hotspotCount = window.krpano?.get('hotspot.count') || 0;
    console.log(`📍 Hotspots actuales: ${hotspotCount}`);
    
    return {
      scene: currentScene,
      vista: vista,
      lotesVista4: lotesVista4?.length || 0,
      hotspots: hotspotCount,
      numeros: lotesVista4?.map(s => s.numero) || []
    };
  };
}

export default {
  registerKrpanoSpotLoader,
  cargarTodosLosSpots
};