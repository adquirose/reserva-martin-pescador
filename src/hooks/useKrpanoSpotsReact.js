// Hook para generar spots directamente desde React
import { useState, useEffect, useCallback } from 'react';
import { getAllLotes } from '../services/firestoreServiceNew.js';
import { getDisplayId } from '../services/spotsXmlParser.js';

// Mapeo de escena a vista
const sceneToVista = {
  'scene_e1': 'vista1',
  'scene_e2': 'vista2', 
  'scene_e3': 'vista3',
  'scene_e4': 'vista4'
};

// Estilos por estado
const getSpotStyle = (estado) => {
  switch(estado) {
    case 'disponible': return 'hs_pro_disponible';
    case 'vendido': return 'hs_pro_vendido';
    case 'reservado': return 'hs_pro_reservado';
    default: return 'hs_pro_disponible';
  }
};

export const useKrpanoSpots = () => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar spots desde Firebase
  const loadSpots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const spotsData = await getAllLotes();
      setSpots(spotsData);
      console.log(`✅ ${spotsData.length} spots cargados desde Firebase`);
      return spotsData;
    } catch (err) {
      console.error('❌ Error cargando spots:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Generar spots para una vista específica
  const generateSpotsForVista = useCallback(async (vista) => {
    if (!window.krpano) {
      throw new Error('Krpano no está disponible');
    }

    console.log(`🚀 Generando spots para ${vista}...`);
    
    // Asegurar que tenemos los datos
    const currentSpots = spots.length > 0 ? spots : await loadSpots();
    
    // Filtrar spots para la vista específica
    let spotsParaVista = currentSpots.filter(spot => {
      const tieneVista = spot.krpano && spot.krpano[vista];
      const esVista = spot.vista === vista;
      return tieneVista || esVista;
    });

    // 🔧 PARCHE TEMPORAL: Asegurar que vista4 incluya todos los spots correctos
    if (vista === 'vista4') {
      const numerosVista4 = ['17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '30', '31'];
      const spotsFaltantes = currentSpots.filter(spot => 
        numerosVista4.includes(spot.numero) && !spotsParaVista.some(s => s.numero === spot.numero)
      );
      spotsParaVista = [...spotsParaVista, ...spotsFaltantes];
      console.log(`🔧 Agregados ${spotsFaltantes.length} spots faltantes a vista4:`, spotsFaltantes.map(s => s.numero));
    }

    console.log(`📍 ${spotsParaVista.length} spots para generar en ${vista}`);
    console.log(`📋 Números: ${spotsParaVista.map(s => s.numero).join(', ')}`);

    // Limpiar spots existentes de esta vista primero
    cleanExistingSpots();

    // Generar cada spot
    const results = [];
    for (const [index, spot] of spotsParaVista.entries()) {
      try {
        const result = await createSingleSpot(spot, vista, index * 50); // 50ms delay
        results.push(result);
      } catch (spotError) {
        console.error(`❌ Error creando spot ${spot.numero}:`, spotError);
        results.push({ numero: spot.numero, success: false, error: spotError.message });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`🎯 Generación completa: ${successful} éxitos, ${failed} fallos`);
    
    return {
      total: spotsParaVista.length,
      successful,
      failed,
      results
    };
  }, [spots, loadSpots]);

  // Crear un spot individual
  const createSingleSpot = useCallback((spot, vista, delay = 0) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          let krpanoData = spot.krpano[vista];
          
          // 🔧 PARCHE TEMPORAL: Coordenadas hardcodeadas para spots faltantes en vista4
          const displayId = getDisplayId(spot.numero);
          if ((!krpanoData || !krpanoData.ath || !krpanoData.atv) && vista === 'vista4') {
            const coordenadasFaltantes = {
              'M5': { ath: 45.844, atv: 34.744 },
              'M6': { ath: -11.168, atv: 52.328 },
              'M7': { ath: -70.993, atv: 30.066 },
              'M8': { ath: -85.432, atv: 17.259 },
              '23': { ath: -136.373, atv: 63.669 },
              '24': { ath: -118.009, atv: 50.658 },
              '25': { ath: -107.679, atv: 38.632 },
              '26': { ath: -104.802, atv: 29.997 },
              '27': { ath: -103.665, atv: 23.946 },
              '28': { ath: -102.371, atv: 19.187 }
            };
            
            if (coordenadasFaltantes[displayId]) {
              krpanoData = coordenadasFaltantes[displayId];
              console.log(`🔧 Aplicando coordenadas de emergencia para ${displayId}:`, krpanoData);
            }
          }
          
          if (!krpanoData || !krpanoData.ath || !krpanoData.atv) {
            throw new Error(`Datos de krpano faltantes para vista ${vista}`);
          }

          const style = getSpotStyle(spot.estado);
          const spotName = `spot_${spot.numero}`;
          
          console.log(`🔧 Creando spot ${spot.numero}:`, {
            name: spotName,
            ath: krpanoData.ath,
            atv: krpanoData.atv,
            style,
            displayId
          });

          // Crear hotspot en Krpano
          window.krpano.call(`
            addhotspot(${spotName});
            set(hotspot[${spotName}].ath, ${krpanoData.ath});
            set(hotspot[${spotName}].atv, ${krpanoData.atv});
            set(hotspot[${spotName}].text, ${displayId});
            set(hotspot[${spotName}].onclick, 'mostrar_ficha(${spot.numero})');
          `);
          
          // Aplicar estilo
          const styleExists = window.krpano.get(`style[${style}].name`);
          if (styleExists) {
            window.krpano.call(`hotspot[${spotName}].loadstyle(${style})`);
          } else {
            console.warn(`⚠️ Estilo ${style} no encontrado para spot ${spot.numero}`);
            window.krpano.call(`hotspot[${spotName}].loadstyle(hs_pro_disponible)`);
          }
          
          // Verificar que se creó correctamente
          const spotExists = window.krpano.get(`hotspot[${spotName}].name`);
          if (spotExists) {
            console.log(`✅ Spot ${spot.numero} creado correctamente`);
            resolve({ numero: spot.numero, success: true });
          } else {
            throw new Error('Spot no se creó en Krpano');
          }
          
        } catch (error) {
          console.error(`❌ Error creando spot ${spot.numero}:`, error);
          resolve({ numero: spot.numero, success: false, error: error.message });
        }
      }, delay);
    });
  }, []);

  // Limpiar spots existentes
  const cleanExistingSpots = useCallback(() => {
    if (!window.krpano) return;
    
    console.log('🧹 Limpiando spots existentes...');
    
    // Obtener número de hotspots
    const hotspotCount = window.krpano.get('hotspot.count') || 0;
    
    // Eliminar spots que comienzan con 'spot_'
    for (let i = hotspotCount - 1; i >= 0; i--) {
      const hotspotName = window.krpano.get(`hotspot[${i}].name`);
      if (hotspotName && hotspotName.startsWith('spot_')) {
        window.krpano.call(`removehotspot(${hotspotName})`);
      }
    }
    
    console.log('✅ Spots anteriores eliminados');
  }, []);

  // Generar spots automáticamente cuando cambie la escena
  const autoGenerateForCurrentScene = useCallback(async () => {
    if (!window.krpano) return;
    
    const currentScene = window.krpano.get('xml.scene');
    const vista = sceneToVista[currentScene];
    
    if (vista) {
      console.log(`🎬 Escena detectada: ${currentScene} -> ${vista}`);
      return await generateSpotsForVista(vista);
    } else {
      console.warn(`❓ Vista no reconocida para escena: ${currentScene}`);
    }
  }, [generateSpotsForVista]);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadSpots();
  }, [loadSpots]);

  return {
    spots,
    loading,
    error,
    loadSpots,
    generateSpotsForVista,
    autoGenerateForCurrentScene,
    cleanExistingSpots,
    createSingleSpot
  };
};

export default useKrpanoSpots;