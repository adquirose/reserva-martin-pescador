// Repoblación de base de datos leyendo desde archivos XML principales
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc 
} from 'firebase/firestore';
import { db, PROJECT_PATH, LOTES_COLLECTION } from '../config/firebase.js';
import { loadAllLotesFromXML } from './xmlMainParser.js';

/**
 * Extraer etapa desde la vista de krpano
 */
function extraerEtapaDesdeVista(vistaKey) {
  // vistaKey puede ser 'vista1', 'vista2', etc.
  const vistaNumber = vistaKey.replace('vista', '');
  return parseInt(vistaNumber) || 1;
}

/**
 * Asignar vista según número de lote (SINCRONIZADA con simpleSpotsLoader.js)
 */
function asignarVistaSegunNumero(numero) {
  const num = parseInt(numero);
  
  if (!isNaN(num)) {
    // Números 1-31 - CORREGIDO según spots.xml
    if ([1,2,3,4,5,6].includes(num)) return '1';
    if ([7,8,9,10,11].includes(num)) return '2';              // Sin 12
    if ([12,13,14,15,16].includes(num)) return '3';           // Con 12
    if ([17,18,19,20,21,22,23,24,25,26,27,28,29,30,31].includes(num)) return '4';
  }
  
  // Alfanuméricos por vista - CORREGIDO
  if (['J','K','L'].includes(numero)) return '1';
  if (['M1','M2'].includes(numero)) return '2';
  if (['M3','M4'].includes(numero)) return '3';
  if (['M','M5','M6','M7','M8'].includes(numero)) return '4';
  
  return '1'; // Default
}

/**
 * Limpiar colección existente
 */
export const limpiarColeccion = async () => {
  try {
    console.log('🗑️ Limpiando colección existente...');
    
    const lotesCollection = collection(db, PROJECT_PATH, LOTES_COLLECTION);
    const snapshot = await getDocs(lotesCollection);
    
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log(`✅ Eliminados ${snapshot.docs.length} documentos existentes`);
    return snapshot.docs.length;
    
  } catch (error) {
    console.error('❌ Error limpiando colección:', error);
    throw error;
  }
};

/**
 * Repoblar base de datos leyendo desde archivos XML principales
 */
export const repoblarBaseDatosFromXML = async () => {
  try {
    console.log('🚀 Iniciando repoblación desde archivos XML principales...');
    console.log('📂 Leyendo: /krpano/skin/data.xml y /krpano/skin/spots.xml');
    
    // 1. Cargar datos desde XML
    const { lotesArray, count } = await loadAllLotesFromXML();
    
    if (!lotesArray || lotesArray.length === 0) {
      throw new Error('No se encontraron lotes en los archivos XML');
    }
    
    console.log(`📊 Lotes encontrados en XML: ${count}`);
    
    // 2. Limpiar datos existentes
    const eliminados = await limpiarColeccion();
    
    // 3. Insertar lotes desde XML
    console.log(`📝 Insertando ${lotesArray.length} lotes en Firestore...`);
    
    const insertPromises = lotesArray.map(async (lote) => {
      // Determinar ID del lote
      const loteId = lote.id || lote.numero;
      
      try {
        // Validar campos obligatorios
        if (!loteId) {
          throw new Error('Falta ID/número de lote');
        }
        
        const docRef = doc(db, PROJECT_PATH, LOTES_COLLECTION, loteId);
        
        // Determinar vista y etapa del lote usando las funciones correctas
        const vistaCalculada = asignarVistaSegunNumero(loteId);
        const vistaKey = vistaCalculada.startsWith('vista') ? vistaCalculada : `vista${vistaCalculada}`;
        const etapaCalculada = extraerEtapaDesdeVista(vistaKey);
        
        console.log(`📍 Lote ${loteId}: asignado a ${vistaKey}, Etapa ${etapaCalculada}`);
        
        await setDoc(docRef, {
          numero: loteId,
          estado: lote.estado || 'disponible',
          precio: lote.precio || null,
          superficie: lote.superficieTotal || null,
          etapa: etapaCalculada,
          
          krpano: {
            [vistaKey]: {
              ath: lote.ath || lote.krpano?.[vistaKey]?.ath || null,
              atv: lote.atv || lote.krpano?.[vistaKey]?.atv || null,
              html: lote.html || lote.krpano?.html || loteId,
              name: lote.name || lote.krpano?.name || `ficha${loteId}`
            }
          }
        });
        
        console.log(`✅ Lote ${loteId} insertado correctamente`);
        return { numero: loteId, success: true };
        
      } catch (error) {
        console.error(`❌ Error insertando lote ${loteId}:`, error);
        return { numero: loteId, success: false, error: error.message };
      }
    });
    
    // 4. Esperar todas las inserciones
    const resultados = await Promise.all(insertPromises);
    
    // 5. Contar éxitos y errores
    const exitosos = resultados.filter(r => r.success);
    const errores = resultados.filter(r => !r.success);
    
    console.log(`🎉 Repoblación completada:`);
    console.log(`  ✅ Exitosos: ${exitosos.length}`);
    console.log(`  ❌ Errores: ${errores.length}`);
    console.log(`  🗑️ Eliminados: ${eliminados}`);
    
    if (errores.length > 0) {
      console.log('❌ Lotes con errores:', errores.map(e => e.numero));
    }
    
    return {
      success: errores.length === 0,
      insertados: exitosos.length,
      errores: errores.length,
      eliminados,
      total: lotesArray.length,
      lotesExitosos: exitosos.map(r => r.numero),
      lotesConError: errores.map(r => r.numero),
      detalles: resultados
    };
    
  } catch (error) {
    console.error('💥 Error en repoblación desde XML:', error);
    return {
      success: false,
      error: error.message,
      insertados: 0,
      errores: 0,
      eliminados: 0
    };
  }
};

/**
 * Verificar integridad después de repoblación desde XML
 */
export const verificarIntegridadXML = async () => {
  try {
    console.log('🔍 Verificando integridad después de repoblación XML...');
    
    // 1. Contar documentos en Firestore
    const lotesCollection = collection(db, PROJECT_PATH, LOTES_COLLECTION);
    const snapshot = await getDocs(lotesCollection);
    const docsFirestore = snapshot.docs.length;
    
    // 2. Contar lotes en XML
    const { count: lotesXML } = await loadAllLotesFromXML();
    
    // 3. Verificar números específicos
    const docData = snapshot.docs.map(doc => ({
      id: doc.id,
      numero: doc.data().numero,
      source: doc.data().source
    }));
    
    // Separar lotes numerados de alfanuméricos
    const lotesNumericos = docData.filter(d => !isNaN(parseInt(d.numero))).map(d => parseInt(d.numero)).sort((a,b) => a-b);
    const lotesAlfanumericos = docData.filter(d => isNaN(parseInt(d.numero))).map(d => d.numero).sort();
    
    const numerosEsperados = Array.from({length: 31}, (_, i) => i + 1);
    const faltantesNumericos = numerosEsperados.filter(n => !lotesNumericos.includes(n));
    
    const resultado = {
      firestore: docsFirestore,
      xml: lotesXML,
      coinciden: docsFirestore === lotesXML,
      lotesNumericos: lotesNumericos,
      lotesAlfanumericos: lotesAlfanumericos,
      faltantesNumericos: faltantesNumericos,
      completoNumericos: faltantesNumericos.length === 0,
      totalCompleto: docsFirestore === lotesXML,
      fuente: docData[0]?.source || 'UNKNOWN'
    };
    
    console.log('📊 Resultado verificación:');
    console.log(`  📂 Lotes en XML: ${lotesXML}`);
    console.log(`  🔥 Lotes en Firestore: ${docsFirestore}`);
    console.log(`  ✅ Coinciden totales: ${resultado.coinciden ? 'SÍ' : 'NO'}`);
    console.log(`  🔢 Lotes numerados (1-31): ${lotesNumericos.length}/31 ${resultado.completoNumericos ? '✅' : '❌'}`);
    console.log(`  � Lotes alfanuméricos: ${lotesAlfanumericos.length} (${lotesAlfanumericos.join(', ')})`);
    console.log(`  🎯 Total completo: ${resultado.totalCompleto ? 'SÍ' : 'NO'}`);
    
    if (faltantesNumericos.length > 0) {
      console.log(`  ❌ Numerados faltantes: ${faltantesNumericos.join(', ')}`);
    }
    
    return resultado;
    
  } catch (error) {
    console.error('❌ Error verificando integridad:', error);
    return { error: error.message, completo: false };
  }
};

/**
 * Función principal de repoblación desde XML con verificación
 */
export const repoblarCompletoFromXML = async () => {
  try {
    console.log('🚀 === REPOBLACIÓN COMPLETA DESDE XML ===');
    
    // 1. Repoblar
    const repoblacion = await repoblarBaseDatosFromXML();
    console.log('📊 Resultado repoblación:', repoblacion);
    
    if (!repoblacion.success) {
      const errorMsg = repoblacion.error || 'Error desconocido en repoblación';
      throw new Error(`Error en repoblación: ${errorMsg}`);
    }
    
    // 2. Verificar
    console.log('🔍 Verificando resultado...');
    const verificacion = await verificarIntegridadXML();
    
    const resultado = {
      ...repoblacion,
      verificacion,
      exito_total: repoblacion.success && verificacion.totalCompleto && verificacion.completoNumericos
    };
    
    if (resultado.exito_total) {
      console.log('🎉 ¡REPOBLACIÓN EXITOSA! Base de datos completa desde XML');
      console.log(`✅ ${verificacion.lotesNumericos.length} lotes numerados (1-31)`);
      console.log(`✅ ${verificacion.lotesAlfanumericos.length} lotes alfanuméricos`);
      console.log(`✅ Total: ${verificacion.firestore} lotes`);
    } else {
      console.log('⚠️ Repoblación completada pero con advertencias');
      if (!verificacion.completoNumericos) {
        console.log(`❌ Faltan lotes numerados: ${verificacion.faltantesNumericos.join(', ')}`);
      }
    }
    
    return resultado;
    
  } catch (error) {
    console.error('💥 Error en repoblación completa:', error);
    return { 
      success: false, 
      error: error.message,
      exito_total: false
    };
  }
};

// Exportar funciones principales
export { repoblarBaseDatosFromXML as repoblarBaseDatos };
export { verificarIntegridadXML as verificarIntegridad };

export default {
  repoblarBaseDatosFromXML,
  repoblarCompletoFromXML,
  verificarIntegridadXML,
  limpiarColeccion
};