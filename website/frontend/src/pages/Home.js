import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 8, p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Bem-vindo!
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleLogout}
          sx={{ mt: 2 }}
        >
          Logout
        </Button>
      </Paper>
    </Container>
  );
};

export default Home;