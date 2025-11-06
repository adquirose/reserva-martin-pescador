import React from 'react';
import { IconButton } from '@mui/material';
import { Radar as RadarIcon } from '@mui/icons-material';

const KrpanoRadar = () => {
  // Test COMPLETO de Krpano - verificar acciones y forzar logs
  const testKrpanoActions = () => {
    console.log("🧪 REACT: Iniciando test completo de Krpano");
    
    if (!window.krpano) {
      console.error("❌ REACT: window.krpano no existe");
      return;
    }
    
    console.log("✅ REACT: Krpano disponible, verificando acciones...");
    
    try {
      // Test 1: Verificar si las acciones existen
      console.log("🔍 REACT: Verificando si las acciones están definidas...");
      
      // Verificar si action.test_logging existe
      const hasTestLogging = window.krpano.get("action[test_logging]");
      console.log("🧪 REACT: action[test_logging] existe:", hasTestLogging !== null);
      
      // Verificar si action.toggle_radar_react existe  
      const hasToggleRadar = window.krpano.get("action[toggle_radar_react]");
      console.log("📡 REACT: action[toggle_radar_react] existe:", hasToggleRadar !== null);
      
      // Verificar si action.min_planta existe
      const hasMinPlanta = window.krpano.get("action[min_planta]");
      console.log("🔽 REACT: action[min_planta] existe:", hasMinPlanta !== null);
      
      // Test 2: Forzar showlog y debugmode
      console.log("🔧 REACT: Activando logs forzadamente...");
      window.krpano.call("set(krpano.debugmode, true)");
      window.krpano.call("showlog(true)");
      
      // Test 3: Ejecutar una acción simple primero
      console.log("📝 REACT: Ejecutando trace directo...");
      window.krpano.call("trace('🚀 REACT: Test directo desde React funcionando!')");
      
      // Test 4: Ahora ejecutar las acciones
      setTimeout(() => {
        console.log("🧪 REACT: Ejecutando test_logging...");
        const result1 = window.krpano.call("test_logging");
        console.log("🧪 REACT: test_logging resultado:", result1);
        
        setTimeout(() => {
          console.log("� REACT: Ejecutando toggle_radar_react...");
          const result2 = window.krpano.call("toggle_radar_react");
          console.log("� REACT: toggle_radar_react resultado:", result2);
        }, 300);
      }, 300);
      
    } catch (error) {
      console.error("❌ REACT: Error en test completo:", error);
    }
  };

  return (
    <IconButton
      onClick={testKrpanoActions}
      title="Test Radar Krpano"
      sx={{
        width: 40,
        height: 40,
        backgroundColor: 'rgba(0,0,0,0.7)',
        border: '1px solid white',
        borderRadius: 1,
        color: 'white',
        '&:hover': {
          backgroundColor: 'rgba(0,0,0,0.8)',
          transform: 'scale(1.05)',
        },
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <RadarIcon />
    </IconButton>
  );
};

export default KrpanoRadar;