// Script completo para repoblar la base de datos Martin Pescador
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc 
} from 'firebase/firestore';
import { db, PROJECT_PATH, LOTES_COLLECTION } from '../config/firebase.js';
import { getDisplayId } from './spotsXmlParser.js';

// Datos completos de lotes según spots.xml original
const lotesCompletos = {
  // VISTA 1 - Etapa 1
  "1": {
    numero: "1",
    estado: "vendido",
    html: "1",
    etapa: 1,
    krpano: {
      vista1: { ath: 28.916, atv: 35.798 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  },
  "2": {
    numero: "2", 
    estado: "vendido",
    html: "2",
    etapa: 1,
    krpano: {
      vista1: { ath: 27.125, atv: 55.297 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  },
  "3": {
    numero: "3",
    estado: "vendido", 
    html: "3",
    etapa: 1,
    krpano: {
      vista1: { ath: -120.248, atv: 68.913 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  },
  "4": {
    numero: "4",
    estado: "vendido",
    html: "4", 
    etapa: 1,
    krpano: {
      vista1: { ath: -135.452, atv: 33.403 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  },
  "5": {
    numero: "5",
    estado: "vendido",
    html: "5",
    etapa: 1, 
    krpano: {
      vista1: { ath: -137.427, atv: 22.095 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  },
  "6": {
    numero: "6",
    estado: "vendido",
    html: "6",
    etapa: 1,
    krpano: {
      vista1: { ath: -137.531, atv: 14.409 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  },
  "23": {
    numero: "23",
    estado: "vendido",
    html: "J", 
    etapa: 1,
    krpano: {
      vista1: { ath: -14.599, atv: 20.573 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  },
  "24": {
    numero: "24",
    estado: "vendido",
    html: "K",
    etapa: 1,
    krpano: {
      vista1: { ath: -50.823, atv: 26.752 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  },
  "25": {
    numero: "25", 
    estado: "vendido",
    html: "L",
    etapa: 1,
    krpano: {
      vista1: { ath: -106.888, atv: 12.256 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  },

  // VISTA 2 - Etapa 2
  "7": {
    numero: "7",
    estado: "vendido",
    html: "7",
    etapa: 2,
    krpano: {
      vista2: { ath: 40.358, atv: 72.961 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  },
  "8": {
    numero: "8",
    estado: "vendido",
    html: "8",
    etapa: 2,
    krpano: {
      vista2: { ath: 85.018, atv: 73.506 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  },
  "9": {
    numero: "9",
    estado: "vendido",
    html: "9",
    etapa: 2,
    krpano: {
      vista2: { ath: 119.940, atv: 68.194 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  },
  "10": {
    numero: "10",
    estado: "vendido",
    html: "10",
    etapa: 2,
    krpano: {
      vista2: { ath: 140.277, atv: 57.559 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  },
  "11": {
    numero: "11",
    estado: "vendido", 
    html: "11",
    etapa: 2,
    krpano: {
      vista2: { ath: 146.658, atv: 47.294 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  },
  "26": {
    numero: "26",
    estado: "vendido",
    html: "M1",
    etapa: 2,
    krpano: {
      vista2: { ath: -129.902, atv: 47.102 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  },
  "27": {
    numero: "27",
    estado: "vendido",
    html: "M2", 
    etapa: 2,
    krpano: {
      vista2: { ath: -163.899, atv: 33.271 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  },

  // VISTA 3 - Etapa 3
  "12": {
    numero: "12",
    estado: "disponible",
    html: "12",
    etapa: 3,
    krpano: {
      vista3: { ath: 96.040, atv: 67.228 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  },
  "13": {
    numero: "13",
    estado: "disponible",
    html: "13",
    etapa: 3,
    krpano: {
      vista3: { ath: 143.409, atv: 79.303 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  },
  "14": {
    numero: "14",
    estado: "disponible",
    html: "14",
    etapa: 3,
    krpano: {
      vista3: { ath: -136.213, atv: 71.415 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  },
  "15": {
    numero: "15",
    estado: "disponible",
    html: "15",
    etapa: 3,
    krpano: {
      vista3: { ath: -123.802, atv: 55.109 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  },
  "16": {
    numero: "16", 
    estado: "disponible",
    html: "16",
    etapa: 3,
    krpano: {
      vista3: { ath: -121.778, atv: 44.420 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  },
  "28": {
    numero: "28",
    estado: "disponible",
    html: "M3",
    etapa: 3,
    krpano: {
      vista3: { ath: -13.371, atv: 52.450 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  },
  "29": {
    numero: "29",
    estado: "disponible",
    html: "M4",
    etapa: 3,
    krpano: {
      vista3: { ath: -75.930, atv: 36.938 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  },

  // VISTA 4 - Etapa 4
  "17": {
    numero: "17",
    estado: "disponible",
    html: "17",
    etapa: 4,
    krpano: {
      vista4: { ath: 89.381, atv: 32.071 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  },
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
  },
  "19": {
    numero: "19",
    estado: "disponible",
    html: "19",
    etapa: 4,
    krpano: {
      vista4: { ath: 96.059, atv: 44.452 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  },
  "20": {
    numero: "20",
    estado: "disponible",
    html: "20",
    etapa: 4,
    krpano: {
      vista4: { ath: 105.982, atv: 53.599 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  },
  "21": {
    numero: "21",
    estado: "disponible",
    html: "21",
    etapa: 4,
    krpano: {
      vista4: { ath: 126.431, atv: 64.399 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  },
  "22": {
    numero: "22",
    estado: "disponible",
    html: "22",
    etapa: 4,
    krpano: {
      vista4: { ath: 165.319, atv: 71.868 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  },
  "30": {
    numero: "30",
    estado: "disponible",
    html: "M5",
    etapa: 4,
    krpano: {
      vista4: { ath: 45.844, atv: 34.744 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  },
  "31": {
    numero: "31",
    estado: "disponible",
    html: "M6",
    etapa: 4,
    krpano: {
      vista4: { ath: -11.168, atv: 52.328 }
    },
    precio: null,
    superficieTotal: null,
    superficieLote: null,
    superficieTransito: null
  }
};

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
 * Repoblar completamente la base de datos
 */
export const repoblarBaseDatos = async () => {
  try {
    console.log('🔄 Iniciando repoblación completa de la base de datos...');
    
    // 1. Limpiar datos existentes
    const eliminados = await limpiarColeccion();
    
    // 2. Insertar todos los lotes
    const lotes = Object.values(lotesCompletos);
    console.log(`📝 Insertando ${lotes.length} lotes...`);
    
    const insertPromises = lotes.map(lote => {
      const docRef = doc(db, PROJECT_PATH, LOTES_COLLECTION, lote.numero);
      return setDoc(docRef, {
        ...lote,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      });
    });
    
    await Promise.all(insertPromises);
    
    console.log('🎉 Repoblación completada exitosamente!');
    console.log(`📊 Resumen:`);
    console.log(`  - Eliminados: ${eliminados} lotes`);
    console.log(`  - Insertados: ${lotes.length} lotes`);
    
    // 3. Verificar distribución por estado
    const distribucion = {};
    lotes.forEach(lote => {
      distribucion[lote.estado] = (distribucion[lote.estado] || 0) + 1;
    });
    
    console.log(`  - Distribución:`);
    Object.entries(distribucion).forEach(([estado, cantidad]) => {
      console.log(`    ${estado}: ${cantidad} lotes`);
    });
    
    return {
      success: true,
      eliminados,
      insertados: lotes.length,
      distribucion
    };
    
  } catch (error) {
    console.error('❌ Error en repoblación:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verificar integridad de datos
 */
export const verificarIntegridad = async () => {
  try {
    console.log('🔍 Verificando integridad de datos...');
    
    const lotesCollection = collection(db, PROJECT_PATH, LOTES_COLLECTION);
    const snapshot = await getDocs(lotesCollection);
    const lotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const errores = [];
    const estadisticas = {
      total: lotes.length,
      conEstado: 0,
      conHtml: 0,
      conKrpano: 0,
      porEtapa: {}
    };
    
    lotes.forEach(lote => {
      // Verificar campos obligatorios
      if (!lote.numero) errores.push(`Lote sin número: ${lote.id}`);
      if (!lote.estado) errores.push(`Lote ${lote.numero} sin estado`);
      if (!lote.html) errores.push(`Lote ${lote.numero} sin identificador HTML`);
      if (!lote.krpano) errores.push(`Lote ${lote.numero} sin coordenadas Krpano`);
      if (!lote.etapa) errores.push(`Lote ${lote.numero} sin etapa`);
      
      // Estadísticas
      if (lote.estado) estadisticas.conEstado++;
      if (lote.html) estadisticas.conHtml++;
      if (lote.krpano) estadisticas.conKrpano++;
      if (lote.etapa) {
        estadisticas.porEtapa[lote.etapa] = (estadisticas.porEtapa[lote.etapa] || 0) + 1;
      }
    });
    
    console.log('📊 Estadísticas de integridad:');
    console.log(`  Total: ${estadisticas.total} lotes`);
    console.log(`  Con estado: ${estadisticas.conEstado}`);
    console.log(`  Con HTML: ${estadisticas.conHtml}`);
    console.log(`  Con Krpano: ${estadisticas.conKrpano}`);
    console.log(`  Por etapa:`, estadisticas.porEtapa);
    
    if (errores.length > 0) {
      console.log('⚠️ Errores encontrados:');
      errores.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('✅ Todos los datos son íntegros');
    }
    
    return { estadisticas, errores, valido: errores.length === 0 };
    
  } catch (error) {
    console.error('❌ Error verificando integridad:', error);
    return { error: error.message, valido: false };
  }
};