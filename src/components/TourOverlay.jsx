import React from 'react';
import { useDispatch } from 'react-redux';
import { 
  Fab, 
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { hideTour } from '../store/features/tour/tourSlice';

const TourOverlay = () => {
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false);

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  const handleGoToMain = () => {
    dispatch(hideTour());
    handleClose();
  };

  const actions = [
    { 
      icon: <HomeIcon />, 
      name: 'Ir a Inicio', 
      onClick: handleGoToMain 
    },
    { 
      icon: <InfoIcon />, 
      name: 'Información', 
      onClick: handleGoToMain 
    },
  ];

  return (
    <>
      {/* SpeedDial para navegación */}
      <SpeedDial
        ariaLabel="Menú de navegación"
        sx={{ 
          position: 'fixed', 
          top: 20, 
          left: 20, 
          zIndex: 1002,
          '& .MuiFab-primary': {
            backgroundColor: 'rgba(25, 118, 210, 0.9)',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 1)',
            },
          }
        }}
        icon={<SpeedDialIcon icon={<MenuIcon />} openIcon={<CloseIcon />} />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
        direction="down"
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.onClick}
            sx={{
              '& .MuiFab-primary': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#1976d2',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                },
              }
            }}
          />
        ))}
      </SpeedDial>

      {/* Botón de cierre alternativo */}
      <Fab
        color="secondary"
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 1002,
          backgroundColor: 'rgba(220, 0, 78, 0.9)',
          '&:hover': {
            backgroundColor: 'rgba(220, 0, 78, 1)',
          },
        }}
        onClick={handleGoToMain}
      >
        <CloseIcon />
      </Fab>
    </>
  );
};

export default TourOverlay;