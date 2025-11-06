import React from 'react';
import { IconButton } from '@mui/material';
import { Radar as RadarIcon } from '@mui/icons-material';

const KrpanoTestButton = () => {
  // COMPONENTE TOTALMENTE NUEVO - EVITANDO CACHE
  const testKrpanoDirecto = () => {
    console.log("🆕🆕🆕 NUEVO COMPONENTE - TEST KRPANO DIRECTO 🆕🆕🆕");
    
    if (!window.krpano) {
      console.error("❌ window.krpano NO DISPONIBLE");
      return;
    }
    
    console.log("✅ window.krpano EXISTE - métodos:", Object.keys(window.krpano));
    
    try {
      console.log("🎯 PROBANDO CAMBIOS VISUALES DIRECTOS...");
      
      // Test 1: Ocultar/mostrar mapa
      console.log("👁️ Ocultando mapa por 3 segundos...");
      window.krpano.set('layer[mapcontainer].visible', false);
      
      setTimeout(() => {
        console.log("👁️ Mostrando mapa...");
        window.krpano.set('layer[mapcontainer].visible', true);
        
        // Test 2: Cambiar escala
        setTimeout(() => {
          console.log("📏 Cambiando escala a 2x...");
          window.krpano.set('layer[mapcontainer].scale', 2.0);
          
          setTimeout(() => {
            console.log("📏 Restaurando escala...");
            window.krpano.set('layer[mapcontainer].scale', 1.0);
            
            // Test 3: Cambiar color
            setTimeout(() => {
              console.log("🎨 Cambiando a fondo rojo...");
              window.krpano.set('layer[mapcontainer].bgcolor', '0xFF0000');
              window.krpano.set('layer[mapcontainer].bgalpha', '1.0');
              
              setTimeout(() => {
                console.log("🎨 Restaurando color...");
                window.krpano.set('layer[mapcontainer].bgcolor', '0x000000');
                window.krpano.set('layer[mapcontainer].bgalpha', '0.6');
              }, 2000);
            }, 2000);
          }, 2000);
        }, 2000);
      }, 3000);
      
    } catch (error) {
      console.error("❌ ERROR en test:", error);
    }
  };

  return (
    <IconButton 
      onClick={testKrpanoDirecto}
      style={{
        position: 'fixed',
        top: '20px',
        right: '80px', // Diferente posición para distinguirlo
        backgroundColor: 'blue', // Diferente color
        border: '3px solid orange',
        color: 'white',
        zIndex: 9999
      }}
      size="large"
    >
      <RadarIcon />
    </IconButton>
  );
};

export default KrpanoTestButton;