// Componente para subir y gestionar imágenes de lotes
import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Alert,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { processAndUploadImages, deleteImageFromCloudinary } from '../services/cloudinaryService';
import { updateDoc, doc } from 'firebase/firestore';
import { db, PROJECT_PATH, LOTES_COLLECTION } from '../config/firebase';

const LoteImageUploader = ({ loteId, currentImages = [], onImagesUpdated }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const fileInputRef = useRef();

  // Manejar selección de archivos
  const handleFileSelect = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Crear previews
      const previews = Array.from(files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      }));
      setPreviewImages(previews);
      setError(null);
      setSuccess(false);
    }
  };

  // Limpiar previews
  const clearPreviews = () => {
    previewImages.forEach(img => URL.revokeObjectURL(img.preview));
    setPreviewImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Subir imágenes
  const handleUpload = async () => {
    if (previewImages.length === 0) {
      setError('Selecciona al menos una imagen');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(false);
    setUploadProgress([]);
    setShowProgressDialog(true);

    try {
      const files = previewImages.map(img => img.file);
      
      // Procesar y subir imágenes con callback de progreso
      const urls = await processAndUploadImages(files, loteId, (progress) => {
        setUploadProgress(prev => {
          const newProgress = [...prev];
          const existingIndex = newProgress.findIndex(p => p.fileName === progress.fileName);
          
          if (existingIndex >= 0) {
            newProgress[existingIndex] = progress;
          } else {
            newProgress.push(progress);
          }
          
          return newProgress;
        });
      });

      // Combinar URLs existentes con las nuevas
      const allImages = [...currentImages, ...urls];

      // Actualizar documento en Firebase
      const loteRef = doc(db, PROJECT_PATH, LOTES_COLLECTION, loteId);
      await updateDoc(loteRef, {
        imagenes: allImages,
        updatedAt: new Date()
      });

      console.log(`✅ ${urls.length} imágenes guardadas en Firebase para lote ${loteId}`);

      // Notificar al componente padre
      if (onImagesUpdated) {
        onImagesUpdated(allImages);
      }

      setSuccess(true);
      clearPreviews();
      
      // Cerrar diálogo después de un momento
      setTimeout(() => {
        setShowProgressDialog(false);
      }, 2000);

    } catch (error) {
      console.error('❌ Error subiendo imágenes:', error);
      setError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Eliminar imagen existente (de Firebase y Cloudinary)
  const handleDeleteExistingImage = async (imageUrl, index) => {
    try {
      console.log(`🗑️ Eliminando imagen: ${imageUrl}`);
      
      let cloudinaryDeleted = false;
      
      // 1. Intentar eliminar de Cloudinary (puede fallar con unsigned presets)
      try {
        cloudinaryDeleted = await deleteImageFromCloudinary(imageUrl);
        if (cloudinaryDeleted) {
          console.log('✅ Imagen eliminada de Cloudinary');
        } else {
          console.warn('⚠️ No se pudo eliminar de Cloudinary (normal con unsigned preset)');
        }
      } catch (cloudinaryError) {
        console.warn('⚠️ Error eliminando de Cloudinary (continuando):', cloudinaryError);
      }
      
      // 2. Eliminar de la lista local (siempre funciona)
      const newImages = currentImages.filter((_, i) => i !== index);
      
      // 3. Actualizar en Firebase
      const loteRef = doc(db, PROJECT_PATH, LOTES_COLLECTION, loteId);
      await updateDoc(loteRef, {
        imagenes: newImages,
        updatedAt: new Date()
      });

      // 4. Notificar al componente padre
      if (onImagesUpdated) {
        onImagesUpdated(newImages);
      }

      // 5. Mostrar mensaje apropiado
      if (cloudinaryDeleted) {
        console.log('✅ Imagen eliminada completamente (Firebase + Cloudinary)');
        setSuccess('Imagen eliminada completamente');
      } else {
        console.log('⚠️ Imagen eliminada de Firebase (Cloudinary requiere configuración adicional)');
        setSuccess('Imagen eliminada de la lista (permanece en Cloudinary)');
      }

    } catch (error) {
      console.error('❌ Error eliminando imagen:', error);
      setError(`Error eliminando imagen: ${error.message}`);
    }
  };

  return (
    <Box>
      <Card sx={{ border: '2px dashed', borderColor: 'primary.main', borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
              📸 Imágenes del Lote {loteId}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Acepta imágenes hasta 12MB - Se optimizan automáticamente
            </Typography>
          </Box>

          {/* Imágenes actuales */}
          {currentImages.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Imágenes actuales ({currentImages.length})
              </Typography>
              <Grid container spacing={2}>
                {currentImages.map((imageUrl, index) => (
                  <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Box sx={{ position: 'relative' }}>
                      <img
                        src={imageUrl}
                        alt={`Lote ${loteId} - ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '150px',
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                        }}
                        onClick={() => handleDeleteExistingImage(imageUrl, index)}
                      >
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Selector de archivos */}
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Button
              variant="contained"
              size="large"
              startIcon={<UploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              sx={{ 
                minHeight: 56,
                px: 4,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: 3
              }}
            >
              📁 Seleccionar Imágenes
            </Button>
            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
              Formatos soportados: JPG, PNG, WebP • Máximo: 5MB de entrada • Salida: 200KB
            </Typography>
          </Box>

          {/* Preview de imágenes seleccionadas */}
          {previewImages.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Imágenes seleccionadas ({previewImages.length})
              </Typography>
              <Grid container spacing={2}>
                {previewImages.map((img, index) => (
                  <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Box>
                      <img
                        src={img.preview}
                        alt={img.name}
                        style={{
                          width: '100%',
                          height: '120px',
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                      <Typography variant="caption" display="block">
                        {img.name} ({(img.size / 1024 / 1024).toFixed(1)} MB)
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleUpload}
                  disabled={isUploading}
                  startIcon={<UploadIcon />}
                >
                  {isUploading ? 'Subiendo...' : 'Subir Imágenes'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={clearPreviews}
                  disabled={isUploading}
                >
                  Cancelar
                </Button>
              </Box>
            </Box>
          )}

          {/* Mensajes de estado */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              ¡Imágenes subidas exitosamente!
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Dialog de progreso */}
      <Dialog 
        open={showProgressDialog} 
        onClose={() => !isUploading && setShowProgressDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Subiendo Imágenes</DialogTitle>
        <DialogContent>
          <List>
            {uploadProgress.map((progress, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {progress.status === 'optimizing' && <RefreshIcon color="info" />}
                  {progress.status === 'uploading' && <UploadIcon color="info" />}
                  {progress.status === 'completed' && <CheckIcon color="success" />}
                  {progress.status === 'error' && <ErrorIcon color="error" />}
                </ListItemIcon>
                <ListItemText primary={progress.fileName} />
                <Box sx={{ ml: 1 }}>
                  <Chip
                    label={progress.status === 'optimizing' ? 'Optimizando' :
                           progress.status === 'uploading' ? 'Subiendo' :
                           progress.status === 'completed' ? 'Completado' : 'Error'}
                    size="small"
                    color={
                      progress.status === 'completed' ? 'success' :
                      progress.status === 'error' ? 'error' : 'info'
                    }
                  />
                  {progress.error && (
                    <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>
                      {progress.error}
                    </Typography>
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
          
          {isUploading && (
            <LinearProgress sx={{ mt: 2 }} />
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowProgressDialog(false)}
            disabled={isUploading}
          >
            {isUploading ? 'Subiendo...' : 'Cerrar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoteImageUploader;