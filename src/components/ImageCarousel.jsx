import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardMedia,
  IconButton,
  LinearProgress,
  Typography
} from '@mui/material';
import {
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  PhotoCamera as PhotoIcon
} from '@mui/icons-material';
// import { imageService } from '../services/imageService'; // ⚠️ TEMPORAL: Deshabilitado

const ImageCarousel = ({ loteId, images: imageUrls = [], height = 250 }) => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImagesEffect = async () => {
      setLoading(true);
      
      if (imageUrls && imageUrls.length > 0) {
        console.log(`📷 Cargando ${imageUrls.length} imágenes de Cloudinary para lote:`, loteId);
        
        // Convertir URLs a formato esperado por el carousel
        const imageData = imageUrls.map((url, index) => ({
          url: url,
          name: `imagen_${index + 1}`,
          alt: `Lote ${loteId} - Imagen ${index + 1}`
        }));
        
        setImages(imageData);
        setCurrentIndex(0);
      } else {
        console.log('📷 No hay imágenes disponibles para lote:', loteId);
        setImages([]);
      }
      
      setLoading(false);
    };

    loadImagesEffect();
  }, [loteId, imageUrls]);

  // Función loadImages removida - lógica movida a useEffect

  const handlePrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  if (loading) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  if (images.length === 0) {
    return (
      <Box 
        sx={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: 'grey.100',
          color: 'grey.500'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <PhotoIcon sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="body2">
            No hay imágenes disponibles
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', height }}>
      <Card sx={{ height: '100%' }}>
        <CardMedia
          component="img"
          height="100%"
          image={images[currentIndex].url}
          alt={`Lote ${loteId} - Imagen ${currentIndex + 1}`}
          sx={{ objectFit: 'cover' }}
        />
      </Card>

      {/* Controles de navegación */}
      {images.length > 1 && (
        <>
          <IconButton
            onClick={handlePrevious}
            sx={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)'
              }
            }}
          >
            <PrevIcon />
          </IconButton>

          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)'
              }
            }}
          >
            <NextIcon />
          </IconButton>

          {/* Indicadores */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 1
            }}
          >
            {images.map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentIndex(index)}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: index === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export default ImageCarousel;