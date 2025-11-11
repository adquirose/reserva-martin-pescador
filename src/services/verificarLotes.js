// Script para verificar lotes faltantes y completar la base de datos

// Lotes que deberían existir según data.xml
const lotesEsperados = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 
  17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31
];

// Función para verificar lotes faltantes
export const verificarLotesFaltantes = async () => {
  try {
    console.log('🔍 Verificando lotes faltantes...');
    
    // Obtener lotes existentes en Firebase
    const { getAllLotes } = await import('./firestoreServiceNew.js');
    const lotesExistentes = await getAllLotes();
    
    const numerosExistentes = lotesExistentes.map(lote => parseInt(lote.numero));
    const lotesFaltantes = lotesEsperados.filter(num => !numerosExistentes.includes(num));
    
    console.log(`📊 Estadísticas:
    - Total esperado: ${lotesEsperados.length}
    - Total existentes: ${numerosExistentes.length}
    - Faltantes: ${lotesFaltantes.length}
    `);
    
    if (lotesFaltantes.length > 0) {
      console.log('❌ Lotes faltantes:', lotesFaltantes);
      
      // Agrupar por vista/etapa para facilitar diagnóstico
      const faltantesPorVista = {
        vista1: lotesFaltantes.filter(n => [1,2,3,4,5,6,23,24,25].includes(n)),
        vista2: lotesFaltantes.filter(n => [7,8,9,10,11,26,27].includes(n)),
        vista3: lotesFaltantes.filter(n => [12,13,14,15,16,28,29].includes(n)),
        vista4: lotesFaltantes.filter(n => [17,18,19,20,21,22,30,31].includes(n))
      };
      
      Object.entries(faltantesPorVista).forEach(([vista, lotes]) => {
        if (lotes.length > 0) {
          console.log(`📍 ${vista}: Faltan lotes ${lotes.join(', ')}`);
        }
      });
    } else {
      console.log('✅ Todos los lotes están presentes');
    }
    
    return {
      esperados: lotesEsperados.length,
      existentes: numerosExistentes.length,
      faltantes: lotesFaltantes,
      lotesExistentes: numerosExistentes.sort((a,b) => a-b)
    };
    
  } catch (error) {
    console.error('❌ Error verificando lotes:', error);
    throw error;
  }
};

// Lotes que definitivamente faltan en el archivo repoblarDB.js
const lotesFaltantesEnArchivo = {
  "18": {
    numero: "18",
    estado: "disponible",
    html: "18", 
    etapa: 4,
    krpano: {
      vista4: { ath: 90.637, atv: 38.446 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  }
};

// Función para agregar lotes faltantes manualmente
export const agregarLotesFaltantes = async () => {
  try {
    console.log('🔧 Agregando lotes faltantes...');
    
    const { createLote } = await import('./firestoreServiceNew.js');
    
    for (const [numero, loteData] of Object.entries(lotesFaltantesEnArchivo)) {
      try {
        await createLote(loteData);
        console.log(`✅ Lote ${numero} agregado correctamente`);
      } catch (error) {
        console.error(`❌ Error agregando lote ${numero}:`, error);
      }
    }
    
    console.log('🎉 Proceso de agregado completado');
    
    // Verificar resultado
    return await verificarLotesFaltantes();
    
  } catch (error) {
    console.error('❌ Error en proceso de agregado:', error);
    throw error;
  }
};

// Función para repoblar solo los lotes faltantes
export const completarLotesFaltantes = async () => {
  try {
    console.log('🔄 Completando lotes faltantes...');
    
    const verificacion = await verificarLotesFaltantes();
    
    if (verificacion.faltantes.length === 0) {
      console.log('✅ No hay lotes faltantes');
      return verificacion;
    }
    
    // Usar datos del XML para completar
    const { loadSpotsXML } = await import('./spotsXmlParser.js');
    const spotsXMLData = await loadSpotsXML();
    
    const { createLote } = await import('./firestoreServiceNew.js');
    
    for (const numeroFaltante of verificacion.faltantes) {
      const numeroStr = numeroFaltante.toString();
      const spotXML = spotsXMLData[numeroStr];
      
      if (spotXML) {
        try {
          await createLote(spotXML);
          console.log(`✅ Lote ${numeroFaltante} agregado desde XML`);
        } catch (error) {
          console.error(`❌ Error agregando lote ${numeroFaltante}:`, error);
        }
      } else {
        console.warn(`⚠️ No se encontraron datos XML para lote ${numeroFaltante}`);
      }
    }
    
    // Verificación final
    const verificacionFinal = await verificarLotesFaltantes();
    console.log('🎉 Proceso completado');
    
    return verificacionFinal;
    
  } catch (error) {
    console.error('❌ Error completando lotes:', error);
    throw error;
  }
};

export default {
  verificarLotesFaltantes,
  agregarLotesFaltantes,
  completarLotesFaltantes
};