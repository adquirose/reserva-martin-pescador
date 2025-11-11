// Componente React para manejar spots de Krpano automáticamente
import React, { useEffect, useRef } from 'react';
import useKrpanoSpots from '../hooks/useKrpanoSpotsReact.js';

const KrpanoSpotsManager = () => {
  const {
    spots,
    loading,
    error,
    loadSpots,
    generateSpotsForVista,
    autoGenerateForCurrentScene,
    cleanExistingSpots
  } = useKrpanoSpots();
  
  const intervalRef = useRef(null);
  const currentSceneRef = useRef(null);

  // Función para monitorear cambios de escena
  const monitorSceneChanges = async () => {
    if (!window.krpano) return;
    
    const currentScene = window.krpano.get('xml.scene');
    
    // Si la escena cambió, regenerar spots
    if (currentScene && currentScene !== currentSceneRef.current) {
      console.log(`🎬 Cambio de escena detectado: ${currentSceneRef.current} → ${currentScene}`);
      currentSceneRef.current = currentScene;
      
      // Esperar un poco para que la escena se cargue completamente
      setTimeout(async () => {
        try {
          await autoGenerateForCurrentScene();
        } catch (err) {
          console.error('❌ Error generando spots automáticamente:', err);
        }
      }, 500);
    }
  };

  // Funciones expuestas globalmente para debugging y control manual
  useEffect(() => {
    // Exponer funciones al objeto window para uso en consola
    window.krpano_react_spots = {
      loadSpots,
      generateSpotsForVista,
      autoGenerateForCurrentScene,
      cleanExistingSpots,
      getCurrentSpots: () => spots,
      regenerateCurrentScene: async () => {
        console.log('🔄 Regenerando spots para escena actual...');
        return await autoGenerateForCurrentScene();
      }
    };
    
    return () => {
      // Limpiar cuando se desmonte el componente
      if (window.krpano_react_spots) {
        delete window.krpano_react_spots;
      }
    };
  }, [spots, loadSpots, generateSpotsForVista, autoGenerateForCurrentScene, cleanExistingSpots]);

  // Iniciar monitoreo cuando Krpano esté disponible
  useEffect(() => {
    const startMonitoring = () => {
      if (window.krpano) {
        console.log('🎬 Iniciando monitoreo de escenas de Krpano...');
        
        // Generar spots para la escena actual al iniciar
        setTimeout(async () => {
          try {
            await autoGenerateForCurrentScene();
          } catch (err) {
            console.error('❌ Error en generación inicial:', err);
          }
        }, 1000);
        
        // Monitorear cambios cada 2 segundos
        intervalRef.current = setInterval(monitorSceneChanges, 2000);
      } else {
        console.log('⏳ Esperando que Krpano esté disponible...');
        setTimeout(startMonitoring, 1000);
      }
    };

    startMonitoring();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoGenerateForCurrentScene]);

  // Manejar errores
  useEffect(() => {
    if (error) {
      console.error('❌ Error en KrpanoSpotsManager:', error);
    }
  }, [error]);

  // Este componente no renderiza nada visible
  return (
    <div style={{ display: 'none' }}>
      <div data-testid="krpano-spots-manager">
        {loading && <span>Loading spots...</span>}
        {error && <span>Error: {error}</span>}
        <span>Spots loaded: {spots.length}</span>
      </div>
    </div>
  );
};

export default KrpanoSpotsManager;