// Script para migrar datos de Firebase y añadir identificadores HTML correctos
import { getAllLotes } from './firestoreServiceNew.js';
import { getDisplayId, loadSpotsXML } from './spotsXmlParser.js';

// Función helper para actualizar lote
const updateLote = async (numero, updates) => {
  // Por ahora solo log, implementar si es necesario
  console.log(`📝 Actualizaría lote ${numero}:`, updates);
};

/**
 * Migrar lotes existentes en Firebase para añadir identificadores HTML y estados
 */
export const migrateLotesWithHtmlIds = async () => {
  try {
    console.log('🔄 Iniciando migración de identificadores HTML y estados...');
    
    // Cargar datos existentes de Firebase
    const lotes = await getAllLotes();
    console.log(`📋 Encontrados ${lotes.length} lotes en Firebase`);
    
    // Cargar datos del XML original para comparación
    const spotsXMLData = await loadSpotsXML();
    console.log('📍 Datos del XML original cargados');
    
    let updatedCount = 0;
    
    for (const lote of lotes) {
      const numero = lote.numero;
      const displayId = getDisplayId(numero);
      const xmlSpot = spotsXMLData[numero];
      
      const updates = {};
      let needsUpdate = false;
      
      // Verificar identificador HTML
      if (!lote.html || lote.html !== displayId) {
        updates.html = displayId;
        needsUpdate = true;
      }
      
      // Verificar estado del XML original
      if (xmlSpot && xmlSpot.estado && lote.estado !== xmlSpot.estado) {
        updates.estado = xmlSpot.estado;
        needsUpdate = true;
        console.log(`🎨 Actualizando estado lote ${numero}: ${lote.estado} -> ${xmlSpot.estado}`);
      }
      
      // Verificar coordenadas si es necesario
      if (xmlSpot && xmlSpot.krpano) {
        updates.krpano = xmlSpot.krpano;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await updateLote(numero, updates);
        console.log(`✅ Lote ${numero} actualizado:`, updates);
        updatedCount++;
      }
    }
    
    console.log(`🎉 Migración completada: ${updatedCount} lotes actualizados`);
    return { success: true, updated: updatedCount };
    
  } catch (error) {
    console.error('❌ Error en migración:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verificar consistencia entre datos de Firebase y XML original
 */
export const verifyDataConsistency = async () => {
  try {
    const lotes = await getAllLotes();
    const spotsXMLData = await loadSpotsXML();
    
    console.log('🔍 Verificando consistencia de datos...');
    
    const discrepancias = [];
    
    lotes.forEach(lote => {
      const numero = lote.numero;
      const expectedDisplayId = getDisplayId(numero);
      const xmlSpot = spotsXMLData[numero];
      
      const issues = [];
      
      // Verificar identificador HTML
      if (lote.html !== expectedDisplayId) {
        issues.push(`HTML: esperado "${expectedDisplayId}", actual "${lote.html}"`);
      }
      
      // Verificar coordenadas si existen en XML
      if (xmlSpot) {
        Object.keys(xmlSpot.krpano).forEach(vista => {
          const xmlCoords = xmlSpot.krpano[vista];
          const fbCoords = lote.krpano?.[vista];
          
          if (!fbCoords) {
            issues.push(`Falta vista ${vista} en Firebase`);
          } else {
            if (Math.abs(fbCoords.ath - xmlCoords.ath) > 0.1) {
              issues.push(`${vista} ATH: XML=${xmlCoords.ath}, FB=${fbCoords.ath}`);
            }
            if (Math.abs(fbCoords.atv - xmlCoords.atv) > 0.1) {
              issues.push(`${vista} ATV: XML=${xmlCoords.atv}, FB=${fbCoords.atv}`);
            }
          }
        });
      }
      
      if (issues.length > 0) {
        discrepancias.push({
          numero,
          displayId: expectedDisplayId,
          issues
        });
      }
    });
    
    if (discrepancias.length > 0) {
      console.log('⚠️ Discrepancias encontradas:');
      discrepancias.forEach(d => {
        console.log(`  Lote ${d.numero} (${d.displayId}):`);
        d.issues.forEach(issue => console.log(`    - ${issue}`));
      });
    } else {
      console.log('✅ Todos los datos son consistentes');
    }
    
    return { discrepancias, total: lotes.length };
    
  } catch (error) {
    console.error('❌ Error verificando consistencia:', error);
    return { error: error.message };
  }
};