import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  Typography
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { collection, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { EmailService } from '../services/emailService';

// Función para validar RUT chileno
const validarRUT = (rut) => {
  if (!rut) return false;
  
  // Limpiar RUT: quitar puntos, guiones y convertir a mayúsculas
  const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
  
  // Verificar formato: debe tener al menos 8 caracteres y máximo 9
  if (rutLimpio.length < 8 || rutLimpio.length > 9) return false;
  
  // Separar número y dígito verificador
  const numero = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);
  
  // Verificar que el número sea numérico
  if (!/^\d+$/.test(numero)) return false;
  
  // Calcular dígito verificador
  let suma = 0;
  let multiplicador = 2;
  
  for (let i = numero.length - 1; i >= 0; i--) {
    suma += parseInt(numero.charAt(i)) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  
  const resto = suma % 11;
  const dvCalculado = resto < 2 ? resto : 11 - resto;
  const dvEsperado = dvCalculado === 10 ? 'K' : dvCalculado.toString();
  
  return dv === dvEsperado;
};

// Función para formatear RUT
const formatearRUT = (rut) => {
  // Limpiar RUT
  const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
  
  if (rutLimpio.length < 2) return rutLimpio;
  
  // Separar número y dígito verificador
  const numero = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);
  
  // Formatear con puntos
  const numeroFormateado = numero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${numeroFormateado}-${dv}`;
};

const FormularioContacto = ({ open, onClose, lote }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    rut: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleClose = (event) => {
    if (!loading) {
      // Prevenir propagación de eventos para evitar conflictos
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      setFormData({ nombre: '', telefono: '', rut: '' });
      setErrors({});
      setSuccess(false);
      onClose();
    }
  };

  const handleInputChange = (field, value) => {
    // Formatear RUT mientras se escribe
    if (field === 'rut') {
      value = formatearRUT(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando se modifica
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar teléfono
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.telefono)) {
      newErrors.telefono = 'Formato de teléfono inválido';
    }

    // Validar RUT
    if (!formData.rut.trim()) {
      newErrors.rut = 'El RUT es requerido';
    } else if (!validarRUT(formData.rut)) {
      newErrors.rut = 'RUT inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Preparar datos para Firestore
      const contactoData = {
        lote: lote?.numero || lote?.id,
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.trim(),
        rut: formData.rut,
        fecha: serverTimestamp(),
        estado: 'pendiente',
        emailEnviado: false
      };

      // Guardar en Firestore - usar estructura existente con subcolección contactos
      const contactosRef = collection(db, 'proyectos', 'martin-pescador', 'contactos');
      const docRef = await addDoc(contactosRef, contactoData);

      // Enviar emails usando sendFormEmail con destinatario dinámico
      try {
        console.log('Intentando enviar email para lote:', lote?.numero);
        console.log('Datos del formulario:', {
          lote: lote?.numero || lote?.id || 'Sin especificar',
          nombre: formData.nombre.trim(),
          telefono: formData.telefono.trim(),
          rut: formData.rut
        });
        
        // Usar función sendFormEmail con destinatario dinámico
        const { enviarConsultaLoteHTTP } = await import('../services/emailServiceHTTP');
        
        const loteData = {
          lote: lote?.numero || lote?.id || 'Sin especificar',
          nombre: formData.nombre.trim(),
          telefono: formData.telefono.trim(),
          rut: formData.rut,
          fecha: new Date().toLocaleString('es-CL'),
          precio: lote?.precio || 'Por consultar',
          superficie: lote?.superficie || lote?.area || 'Por consultar'
        };
        
        // Destinatarios de producción
        const destinatarios = ['vhernandez@hfo.cl', 'huillinco@grupomartinpescador.cl'];
        
        const emailResult = await enviarConsultaLoteHTTP(loteData, destinatarios);
        
        // Actualizar documento indicando que el email se envió
        await updateDoc(docRef, { 
          emailEnviado: true,
          emailResponse: emailResult,
          emailMethod: 'sendFormEmail-http',
          destinatarios: destinatarios
        });
        
        console.log('Email enviado exitosamente con sendFormEmail a:', destinatarios, emailResult);
      } catch (emailError) {
        console.error('Error detallado enviando emails:', {
          message: emailError.message,
          code: emailError.code,
          stack: emailError.stack,
          loteData: {
            lote: lote?.numero || lote?.id || 'Sin especificar',
            nombre: formData.nombre.trim(),
            telefono: formData.telefono.trim()
          }
        });
        // No fallar el proceso si el email falla, solo registrar
        // El contacto se guarda en Firestore independientemente
        await updateDoc(docRef, { 
          emailEnviado: false, 
          errorEmail: emailError.message,
          errorCode: emailError.code || 'unknown'
        });
      }

      setSuccess(true);
      
      // Cerrar después de 2 segundos
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      console.error('Error enviando consulta:', error);
      setErrors({ submit: 'Error al enviar la consulta. Intenta nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          onMouseDown: (e) => e.stopPropagation(),
          onClick: (e) => e.stopPropagation()
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="h6">¡Consulta enviada exitosamente!</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Nos contactaremos contigo pronto para brindarte más información sobre el Lote {lote?.numero}.
            </Typography>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        onMouseDown: (e) => e.stopPropagation(),
        onClick: (e) => e.stopPropagation()
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Más Información - Lote {lote?.numero}
        <IconButton onClick={handleClose} disabled={loading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Lote (no editable) */}
            <TextField
              label="Lote a consultar"
              value={`Lote ${lote?.numero || ''}`}
              disabled
              fullWidth
            />

            {/* Nombre */}
            <TextField
              label="Nombre completo *"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              error={!!errors.nombre}
              helperText={errors.nombre}
              fullWidth
              disabled={loading}
            />

            {/* Teléfono */}
            <TextField
              label="Teléfono *"
              value={formData.telefono}
              onChange={(e) => handleInputChange('telefono', e.target.value)}
              error={!!errors.telefono}
              helperText={errors.telefono}
              placeholder="+56 9 1234 5678"
              fullWidth
              disabled={loading}
            />

            {/* RUT */}
            <TextField
              label="RUT *"
              value={formData.rut}
              onChange={(e) => handleInputChange('rut', e.target.value)}
              error={!!errors.rut}
              helperText={errors.rut}
              placeholder="12.345.678-9"
              fullWidth
              disabled={loading}
            />

            {/* Error general */}
            {errors.submit && (
              <Alert severity="error">
                {errors.submit}
              </Alert>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleClose} 
            disabled={loading}
            color="inherit"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {loading ? 'Enviando...' : 'Enviar Consulta'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default FormularioContacto;