import React from 'react';
import { IconButton } from '@mui/material';
import { Radar as RadarIcon } from '@mui/icons-material';

const KrpanoRadar = () => {
  // Test VISUAL SIMPLE - cambios que se puedan VER inmediatamente
  const testKrpanoMethods = () => {
    console.log("🔥 REACT: TEST VISUAL SIMPLE - Probando cambios visibles");
    
    if (!window.krpano) {
      console.error("❌ REACT: window.krpano NO EXISTE");
      return;
    }
    
    console.log("✅ REACT: window.krpano existe y tiene métodos:", Object.keys(window.krpano));
    
    try {
      // TEST 1: Cambiar visibilidad del mapa - EFECTO INMEDIATO
      console.log("\n👁️ TEST 1: Ocultando/mostrando mapa...");
      const mapVisible = window.krpano.get('layer[mapcontainer].visible');
      console.log("🔍 Mapa visible actualmente:", mapVisible);
      
      // Ocultar mapa por 2 segundos
      console.log("🔄 Ocultando mapa...");
      window.krpano.set('layer[mapcontainer].visible', false);
      
      setTimeout(() => {
        console.log("🔄 Mostrando mapa...");
        window.krpano.set('layer[mapcontainer].visible', true);
      }, 2000);
      
      // TEST 2: Cambiar escala - EFECTO VISUAL INMEDIATO
      setTimeout(() => {
        console.log("\n📏 TEST 2: Cambiando escala...");
        console.log("🔄 Escalando mapa a 1.5x...");
        window.krpano.set('layer[mapcontainer].scale', 1.5);
        
        setTimeout(() => {
          console.log("🔄 Restaurando escala...");
          window.krpano.set('layer[mapcontainer].scale', 1.0);
        }, 2000);
      }, 3000);
      
      // TEST 3: Cambiar color de fondo - EFECTO VISUAL INMEDIATO
      setTimeout(() => {
        console.log("\n🎨 TEST 3: Cambiando color de fondo...");
        console.log("🔄 Fondo rojo...");
        window.krpano.set('layer[mapcontainer].bgcolor', '0xFF0000');
        window.krpano.set('layer[mapcontainer].bgalpha', '1.0');
        
        setTimeout(() => {
          console.log("🔄 Restaurando fondo...");
          window.krpano.set('layer[mapcontainer].bgcolor', '0x000000');
          window.krpano.set('layer[mapcontainer].bgalpha', '0.6');
        }, 2000);
      }, 6000);
      
      // TEST 4: Probar acciones custom
      setTimeout(() => {
        console.log("\n🎯 TEST 4: Probando acciones personalizadas...");
        
        const minExists = window.krpano.get('action[min_planta]') !== null;
        const toggleExists = window.krpano.get('action[toggle_radar_react]') !== null;
        
        console.log("🔍 min_planta existe:", minExists);
        console.log("🔍 toggle_radar_react existe:", toggleExists);
        
        if (minExists) {
          console.log("🚀 Ejecutando min_planta...");
          window.krpano.call('min_planta');
          
          setTimeout(() => {
            console.log("🚀 Ejecutando max_planta...");
            window.krpano.call('max_planta');
          }, 3000);
        }
        
      }, 9000);
      
      // TEST 5: Intentar mostrar log de Krpano
      setTimeout(() => {
        console.log("\n📋 TEST 5: Intentando mostrar log de Krpano...");
        window.krpano.set('debugmode', true);
        window.krpano.call('showlog(true)');
        window.krpano.call('showlog', 'true');
        window.krpano.call('showlog');
        
        // Intentar trace directo
        window.krpano.call('trace("🧪 ESTE ES UN TRACE DIRECTO DESDE REACT")');
        console.log("✅ Comandos de log enviados");
      }, 12000);
      
    } catch (error) {
      console.error("❌ REACT: Error en test visual:", error);
    }
  };

  return (
    <IconButton 
      onClick={testKrpanoMethods}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: 'red',
        border: '3px solid yellow',
        color: 'white',
        zIndex: 9999
      }}
      size="large"
    >
      <RadarIcon />
    </IconButton>
  );
};

export default KrpanoRadar;