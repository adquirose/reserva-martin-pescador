import React from 'react';
import { IconButton } from '@mui/material';
import { Radar as RadarIcon } from '@mui/icons-material';

const KrpanoRadar = () => {
  // Test FORZADO - activar debug y logs explícitamente
  const testKrpanoMethods = () => {
    console.log("🔥 REACT: TEST FORZADO - Activando debug y logs");
    
    if (!window.krpano) {
      console.error("❌ REACT: window.krpano NO EXISTE");
      return;
    }
    
    console.log("✅ REACT: window.krpano existe");
    console.log("🔍 REACT: Métodos disponibles:", Object.keys(window.krpano));
    
    try {
      // PASO 1: Forzar configuración de debug
      console.log("\n🔧 PASO 1: Configurando debug mode...");
      window.krpano.set('debugmode', true);
      console.log("✅ debugmode activado");
      
      // PASO 2: Forzar apertura del log
      console.log("\n📋 PASO 2: Abriendo log window...");
      window.krpano.call('showlog(true)');
      window.krpano.call('showlog', true);
      console.log("✅ showlog ejecutado");
      
      // PASO 3: Test directo de trace con diferentes sintaxis
      console.log("\n🧪 PASO 3: Testing trace directo...");
      
      // Sintaxis 1: trace como función con string
      window.krpano.call('trace("🟢 TEST DIRECTO 1 - trace función")');
      
      // Sintaxis 2: trace con parámetros separados
      window.krpano.call('trace', '🟡 TEST DIRECTO 2 - trace parámetros');
      
      // Sintaxis 3: Multiple comandos en una línea
      window.krpano.call('trace("🔵 TEST DIRECTO 3 - múltiple"); showlog(true);');
      
      console.log("✅ Tests directos enviados");
      
      // PASO 4: Verificar y ejecutar nuestras acciones después de un delay
      setTimeout(() => {
        console.log("\n🎯 PASO 4: Probando nuestras acciones...");
        
        // Verificar existencia
        const testAction = window.krpano.get('action[test_logging]');
        console.log("🔍 test_logging existe:", testAction !== null);
        
        if (testAction) {
          console.log("� Contenido completo:", testAction.content);
          
          // Ejecutar con showlog forzado antes
          console.log("🚀 Ejecutando: showlog + test_logging");
          window.krpano.call('showlog(true); test_logging;');
          
          // También probar por separado
          setTimeout(() => {
            console.log("🚀 Ejecutando solo: test_logging");
            window.krpano.call('test_logging');
          }, 500);
        }
        
        // Probar toggle_radar_react también
        setTimeout(() => {
          console.log("🚀 Ejecutando: toggle_radar_react");
          window.krpano.call('showlog(true); toggle_radar_react;');
        }, 1000);
        
      }, 1500);
      
    } catch (error) {
      console.error("❌ REACT: Error en test forzado:", error);
    }
  };

  return (
    <IconButton
      onClick={testKrpanoMethods}
      title="Test Métodos Krpano"
      sx={{
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255,0,0,0.8)', // Rojo para distinguir
        border: '2px solid yellow',
        borderRadius: 1,
        color: 'white',
        '&:hover': {
          backgroundColor: 'rgba(255,0,0,1)',
          transform: 'scale(1.1)',
        },
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <RadarIcon />
    </IconButton>
  );
};

export default KrpanoRadar;