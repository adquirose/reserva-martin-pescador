import React from 'react';
import { IconButton } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const KrpanoLayerFinder = () => {
  // DESCUBRIR LAYERS REALES DE KRPANO
  const findKrpanoLayers = () => {
    console.log("🔍🔍🔍 BUSCANDO LAYERS REALES DE KRPANO 🔍🔍🔍");
    
    if (!window.krpano) {
      console.error("❌ window.krpano NO DISPONIBLE");
      return;
    }
    
    try {
      // Método 1: Listar todos los layers
      console.log("\n📋 MÉTODO 1: Buscando layers...");
      const layerNames = window.krpano.get('layer.count');
      console.log("🔢 Número total de layers:", layerNames);
      
      // Método 2: Intentar acceder a layer por índice
      console.log("\n📋 MÉTODO 2: Listando layers por índice...");
      for (let i = 0; i < 20; i++) {
        try {
          const layerName = window.krpano.get(`layer[${i}].name`);
          const layerVisible = window.krpano.get(`layer[${i}].visible`);
          const layerType = window.krpano.get(`layer[${i}].type`);
          
          if (layerName) {
            console.log(`📌 Layer ${i}: name="${layerName}", visible=${layerVisible}, type=${layerType}`);
          }
        } catch (e) {
          // Silencio, layer no existe
        }
      }
      
      // Método 3: Buscar layers específicos del mapa
      console.log("\n📋 MÉTODO 3: Buscando layers de mapa específicos...");
      const mapRelatedNames = [
        'mapcontainer', 'map', 'mapa', 'minimap', 'radar', 'planta',
        'floor', 'level', 'navigation', 'nav', 'controls', 'ui',
        'overlay', 'skin', 'interface', 'menu', 'btn'
      ];
      
      mapRelatedNames.forEach(name => {
        try {
          const exists = window.krpano.get(`layer[${name}]`);
          if (exists !== null) {
            const visible = window.krpano.get(`layer[${name}].visible`);
            const type = window.krpano.get(`layer[${name}].type`);
            console.log(`✅ ENCONTRADO layer[${name}]: visible=${visible}, type=${type}`);
          }
        } catch (e) {
          // Layer no existe
        }
      });
      
      // Método 4: Listar todos los objetos disponibles
      console.log("\n📋 MÉTODO 4: Explorando estructura completa...");
      console.log("🔍 Layers disponibles:", window.krpano.get('layer'));
      
      // Método 5: Intentar cambiar algo más básico (el fondo general)
      console.log("\n🎨 MÉTODO 5: Probando cambio de fondo general...");
      const originalBg = window.krpano.get('bgcolor');
      console.log("🎨 Color de fondo original:", originalBg);
      
      console.log("🔴 Cambiando a rojo por 3 segundos...");
      window.krpano.set('bgcolor', '0xFF0000');
      
      setTimeout(() => {
        console.log("⚫ Restaurando color original...");
        window.krpano.set('bgcolor', originalBg);
      }, 3000);
      
      // Método 6: Probar el comando de log nativo
      console.log("\n📋 MÉTODO 6: Probando log nativo de Krpano...");
      window.krpano.call('showlog(true)');
      window.krpano.call('trace("🧪 TEST DESDE REACT - ¿Se ve este mensaje en Krpano?")');
      
    } catch (error) {
      console.error("❌ ERROR explorando Krpano:", error);
    }
  };

  return (
    <IconButton 
      onClick={findKrpanoLayers}
      style={{
        position: 'fixed',
        top: '20px',
        right: '140px', // Otra posición diferente
        backgroundColor: 'green',
        border: '3px solid yellow',
        color: 'white',
        zIndex: 9999
      }}
      size="large"
    >
      <SearchIcon />
    </IconButton>
  );
};

export default KrpanoLayerFinder;