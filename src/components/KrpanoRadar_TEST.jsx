import React from 'react';
import { IconButton } from '@mui/material';
import { Radar as RadarIcon } from '@mui/icons-material';

const KrpanoRadar = () => {
  // Test BASICO - verificar diferentes métodos de llamada
  const testKrpanoMethods = () => {
    console.log("🔥 REACT: TEST BÁSICO - Probando diferentes sintaxis de llamada");
    
    if (!window.krpano) {
      console.error("❌ REACT: window.krpano NO EXISTE");
      return;
    }
    
    console.log("✅ REACT: window.krpano existe");
    console.log("🔍 REACT: Métodos disponibles en krpano:", Object.keys(window.krpano));
    
    try {
      // MÉTODO 1: trace() directo con parámetros separados
      console.log("\n🧪 MÉTODO 1: trace() con parámetros separados");
      const result1 = window.krpano.call('trace', '🧪 TEST 1: trace con parámetros separados');
      console.log("✅ Resultado 1:", result1);
      
      // MÉTODO 2: trace() como string completo  
      console.log("\n🧪 MÉTODO 2: trace() como string completo");
      const result2 = window.krpano.call('trace("🧪 TEST 2: trace como string completo")');
      console.log("✅ Resultado 2:", result2);
      
      // MÉTODO 3: showlog() para asegurar que el log esté abierto
      console.log("\n🧪 MÉTODO 3: Forzar showlog()");
      const result3 = window.krpano.call('showlog(true)');
      console.log("✅ Resultado 3:", result3);
      
      // MÉTODO 4: Esperar y luego probar nuestra acción personalizada
      setTimeout(() => {
        console.log("\n🧪 MÉTODO 4: Acción personalizada test_logging");
        
        // Primero verificar que existe
        const actionExists = window.krpano.get('action[test_logging]');
        console.log("🔍 ¿Existe action[test_logging]?", actionExists !== null);
        
        if (actionExists) {
          console.log("📄 Contenido de test_logging:", actionExists.content || "Sin contenido");
          
          // Intentar ejecutarla
          console.log("🚀 Ejecutando test_logging...");
          const result4 = window.krpano.call('test_logging');
          console.log("✅ Resultado 4:", result4);
        } else {
          console.error("❌ La acción test_logging NO EXISTE en Krpano");
        }
        
      }, 1000);
      
    } catch (error) {
      console.error("❌ REACT: Error en test básico:", error);
      console.error("Error completo:", error.stack);
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