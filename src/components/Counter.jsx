import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  ButtonGroup 
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { increment, decrement, incrementByAmount } from '../store/features/counter/counterSlice';

function Counter() {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <Card sx={{ maxWidth: 400, margin: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h4" component="h2" gutterBottom align="center">
          Contador Redux
        </Typography>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Typography variant="h2" color="primary">
            {count}
          </Typography>
          <ButtonGroup variant="contained" aria-label="counter buttons">
            <Button 
              onClick={() => dispatch(decrement())}
              startIcon={<Remove />}
            >
              Decrementar
            </Button>
            <Button 
              onClick={() => dispatch(increment())}
              startIcon={<Add />}
            >
              Incrementar
            </Button>
          </ButtonGroup>
          <Button 
            variant="outlined" 
            onClick={() => dispatch(incrementByAmount(5))}
          >
            +5
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default Counter;