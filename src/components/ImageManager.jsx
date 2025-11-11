import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardActions,
  IconButton,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoIcon,
  Visibility as PreviewIcon
} from '@mui/icons-material';
import { imageService } from '../services/imageService';

const ImageManager = ({ loteId, onImagesChange }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);

  // Cargar imágenes existentes
  useEffect(() => {
    const loadImagesEffect = async () => {
      setLoading(true);
      setError('');

      const result = await imageService.getLoteImages(loteId);
      
      if (result.success) {
        setImages(result.images);
        onImagesChange?.(result.images);
      } else {
        setError(result.error);
      }

      setLoading(false);
    };

    loadImagesEffect();
  }, [loteId, onImagesChange]);

  const loadImages = async () => {
    setLoading(true);
    setError('');

    const result = await imageService.getLoteImages(loteId);
    
    if (result.success) {
      setImages(result.images);
      onImagesChange?.(result.images);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;

    // Validar que no exceda 3 imágenes
    if (images.length + files.length > 3) {
      setError('Solo se permiten máximo 3 imágenes por lote');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageIndex = images.length + i + 1;

        // Preparar imagen
        const preparedResult = await imageService.prepareImageForUpload(file);
        
        if (!preparedResult.success) {
          throw new Error(preparedResult.error);
        }

        // Subir imagen
        const uploadResult = await imageService.uploadLoteImage(
          loteId, 
          preparedResult.file, 
          imageIndex
        );

        if (!uploadResult.success) {
          throw new Error(uploadResult.error);
        }
      }

      setSuccess(`${files.length} imagen(es) subida(s) correctamente`);
      await loadImages(); // Recargar lista

    } catch (err) {
      setError(err.message || 'Error al subir imágenes');
    } finally {
      setUploading(false);
      event.target.value = ''; // Limpiar input
    }
  };

  const handleDeleteImage = async () => {
    if (!imageToDelete) return;

    setLoading(true);
    
    const result = await imageService.deleteImage(imageToDelete.path);
    
    if (result.success) {
      setSuccess('Imagen eliminada correctamente');
      await loadImages();
    } else {
      setError(result.error);
    }

    setLoading(false);
    setDeleteDialogOpen(false);
    setImageToDelete(null);
  };

  const openDeleteDialog = (image) => {
    setImageToDelete(image);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setImageToDelete(null);
  };

  const openPreview = (image) => {
    setPreviewImage(image);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Imágenes del Lote
          </Typography>
          <Chip 
            label={`${images.length}/3`} 
            color={images.length >= 3 ? 'success' : 'primary'}
            variant="outlined"
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {(loading || uploading) && (
          <LinearProgress sx={{ mb: 2 }} />
        )}

        {/* Botón de subida */}
        <Box sx={{ mb: 3 }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="image-upload"
            multiple
            type="file"
            onChange={handleFileUpload}
            disabled={uploading || images.length >= 3}
          />
          <label htmlFor="image-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadIcon />}
              disabled={uploading || images.length >= 3}
              fullWidth
            >
              {uploading ? 'Subiendo...' : 'Subir Imágenes'}
            </Button>
          </label>
        </Box>

        {/* Grid de imágenes */}
        <Grid container spacing={2}>
          {images.map((image, index) => (
            <Grid size={{ xs: 12, sm: 4 }} key={image.name}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={image.url}
                  alt={`Lote ${loteId} - Imagen ${index + 1}`}
                  sx={{ objectFit: 'cover' }}
                />
                <CardActions>
                  <IconButton 
                    size="small" 
                    onClick={() => openPreview(image)}
                    color="primary"
                  >
                    <PreviewIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => openDeleteDialog(image)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}

          {/* Placeholders para imágenes faltantes */}
          {Array.from({ length: 3 - images.length }).map((_, index) => (
            <Grid size={{ xs: 12, sm: 4 }} key={`placeholder-${index}`}>
              <Card sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
                <PhotoIcon sx={{ fontSize: 48, color: 'grey.400' }} />
              </Card>
            </Grid>
          ))}
        </Grid>

        {images.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <PhotoIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No hay imágenes para este lote
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sube hasta 3 imágenes para mostrar en el tour
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Dialog de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Eliminar Imagen</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar esta imagen? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancelar</Button>
          <Button onClick={handleDeleteImage} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de preview */}
      <Dialog 
        open={Boolean(previewImage)} 
        onClose={closePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          {previewImage && (
            <img
              src={previewImage.url}
              alt="Preview"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closePreview}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImageManager;