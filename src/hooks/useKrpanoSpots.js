import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAllSpots, 
  selectSpots, 
  selectFirestoreLoading, 
  selectFirestoreError 
} from '../store/features/firestore/firestoreSlice';
import { loadAndExecuteSpots } from '../services/krpanoSpotsService';

/**
 * Hook personalizado para manejar la carga de spots en Krpano
 */
export const useKrpanoSpots = () => {
  const dispatch = useDispatch();
  const spots = useSelector(selectSpots);
  const loading = useSelector(selectFirestoreLoading);
  const error = useSelector(selectFirestoreError);

  // Cargar spots desde Firebase al montar el hook
  useEffect(() => {
    if (spots.length === 0 && !loading) {
      console.log('🔄 Cargando spots desde Firebase...');
      dispatch(fetchAllSpots());
    }
  }, [dispatch, spots.length, loading]);

  // Función para cargar spots en una escena específica de Krpano
  const loadSpotsInScene = useCallback(async (sceneName) => {
    try {
      console.log(`🎯 Cargando spots para escena: ${sceneName}`);
      const spotsCount = await loadAndExecuteSpots(sceneName);
      console.log(`✅ ${spotsCount} spots cargados en ${sceneName}`);
      return spotsCount;
    } catch (err) {
      console.error(`❌ Error cargando spots en ${sceneName}:`, err);
      throw err;
    }
  }, []);

  // Función para registrar el listener de cambios de escena en Krpano
  const registerSceneChangeListener = useCallback(() => {
    if (typeof window !== 'undefined' && window.krpano) {
      window.krpano.addEventListener('onloadcomplete', (sceneName) => {
        console.log(`📍 Escena cargada: ${sceneName}`);
        // Auto-cargar spots cuando cambie la escena
        if (sceneName && sceneName.startsWith('scene_e')) {
          loadSpotsInScene(sceneName);
        }
      });
      console.log('🔧 Listener de cambio de escena registrado');
    }
  }, [loadSpotsInScene]);

  return {
    spots,
    loading,
    error,
    loadSpotsInScene,
    registerSceneChangeListener,
    // Estadísticas útiles
    stats: {
      totalSpots: spots.length,
      availableSpots: spots.filter(spot => spot.estado === 'disponible').length,
      soldSpots: spots.filter(spot => spot.estado === 'vendido').length,
      reservedSpots: spots.filter(spot => spot.estado === 'reservado').length
    }
  };
};

export default useKrpanoSpots;