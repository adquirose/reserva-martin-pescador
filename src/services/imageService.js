import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  listAll 
} from 'firebase/storage';
import { storage } from '../config/firebase';

class ImageService {
  constructor() {
    this.storage = storage;
  }

  // Subir imagen para un lote específico
  async uploadLoteImage(loteId, imageFile, imageIndex) {
    try {
      // Validar archivo
      if (!imageFile || !imageFile.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen');
      }

      // Validar tamaño (máximo 5MB)
      if (imageFile.size > 5 * 1024 * 1024) {
        throw new Error('La imagen debe ser menor a 5MB');
      }

      // Crear referencia con nombre único
      const timestamp = Date.now();
      const fileName = `${loteId}_${imageIndex}_${timestamp}.jpg`;
      const imageRef = ref(this.storage, `lotes/${loteId}/${fileName}`);

      // Subir archivo
      const snapshot = await uploadBytes(imageRef, imageFile);
      
      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        success: true,
        url: downloadURL,
        fileName: fileName,
        path: snapshot.ref.fullPath
      };

    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code) || error.message
      };
    }
  }

  // Obtener todas las imágenes de un lote
  async getLoteImages(loteId) {
    try {
      const loteRef = ref(this.storage, `lotes/${loteId}`);
      const result = await listAll(loteRef);
      
      const images = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return {
            name: itemRef.name,
            url: url,
            path: itemRef.fullPath
          };
        })
      );

      // Ordenar por nombre (que incluye el índice)
      images.sort((a, b) => a.name.localeCompare(b.name));

      return {
        success: true,
        images: images
      };

    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code) || error.message,
        images: []
      };
    }
  }

  // Eliminar una imagen específica
  async deleteImage(imagePath) {
    try {
      const imageRef = ref(this.storage, imagePath);
      await deleteObject(imageRef);
      
      return {
        success: true,
        message: 'Imagen eliminada correctamente'
      };

    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code) || error.message
      };
    }
  }

  // Eliminar todas las imágenes de un lote
  async deleteAllLoteImages(loteId) {
    try {
      const result = await this.getLoteImages(loteId);
      
      if (!result.success) {
        return result;
      }

      // Eliminar cada imagen
      const deletePromises = result.images.map(image => 
        this.deleteImage(image.path)
      );

      await Promise.all(deletePromises);

      return {
        success: true,
        message: `${result.images.length} imágenes eliminadas correctamente`
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Redimensionar imagen antes de subir (opcional)
  async resizeImage(file, maxWidth = 1200, maxHeight = 800, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo proporción
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a blob
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // Validar y preparar archivo para subida
  async prepareImageForUpload(file, resize = true) {
    try {
      let processedFile = file;

      // Redimensionar si es necesario
      if (resize && file.size > 1 * 1024 * 1024) { // > 1MB
        processedFile = await this.resizeImage(file);
      }

      return {
        success: true,
        file: processedFile,
        originalSize: file.size,
        processedSize: processedFile.size
      };

    } catch {
      return {
        success: false,
        error: 'Error al procesar la imagen'
      };
    }
  }

  // Mensajes de error en español
  getErrorMessage(errorCode) {
    const errorMessages = {
      'storage/unauthorized': 'No tiene permisos para subir imágenes',
      'storage/canceled': 'Subida cancelada',
      'storage/unknown': 'Error desconocido al subir imagen',
      'storage/object-not-found': 'Imagen no encontrada',
      'storage/quota-exceeded': 'Cuota de almacenamiento excedida',
      'storage/unauthenticated': 'Debe estar autenticado para subir imágenes',
      'storage/retry-limit-exceeded': 'Demasiados intentos, intente más tarde'
    };
    
    return errorMessages[errorCode] || 'Error de almacenamiento';
  }
}

export const imageService = new ImageService();