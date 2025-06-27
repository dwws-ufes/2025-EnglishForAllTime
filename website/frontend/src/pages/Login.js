import React, { useState } from 'react';
import {
  Container,
  Paper,
  Avatar,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Link,
  FormControlLabel,
  Checkbox,
  Alert
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔑 Tentando fazer login...');
      
      // Fazer login
      const loginResponse = await api.post('/auth/login', {
        login: email,
        password: password
      });

      console.log('✅ Login bem-sucedido:', loginResponse.data);
      const { token } = loginResponse.data;

      // Definir o token no localStorage temporariamente para fazer a chamada /auth/me
      localStorage.setItem('@EnglishForAllTime:token', token);
      
      try {
        // Buscar informações do usuário
        console.log('👤 Buscando informações do usuário...');
        const userResponse = await api.get('/auth/me');
        console.log('👤 Informações do usuário:', userResponse.data);
        
        const userInfo = {
          email: userResponse.data.login,
          name: userResponse.data.login.split('@')[0] || 'Usuário',
          role: userResponse.data.role
        };

        // Fazer signIn com token e informações do usuário
        await signIn(token, userInfo);
        
        console.log('🚀 Redirecionando para /home...');
        navigate('/home');
        
      } catch (userError) {
        console.warn('⚠️ Erro ao buscar perfil do usuário:', userError);
        // Se falhar ao buscar o perfil, ainda assim fazer login
        await signIn(token, { 
          email: email, 
          name: email.split('@')[0] || 'Usuário',
          role: 'USER' 
        });
      }
      console.log('🚀 Redirecionando para /home...');
      navigate('/home');

    } catch (err) {
      console.error('❌ Erro no login:', err);
      localStorage.removeItem('@EnglishForAllTime:token'); // Limpar token em caso de erro
      
      let errorMessage = 'Ocorreu um erro ao fazer login. Tente novamente.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Email ou senha incorretos.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={10} sx={{ marginTop: 8, padding: 2 }}>
        <Avatar sx={{ mx: "auto", bgcolor: "secondary.main", textAlign: "center", mb: 1 }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component='h1' variant='h5' sx={{ textAlign: "center" }}>
          Entrar
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component='form' onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            placeholder="Coloque o email"
            fullWidth
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
            disabled={loading}
            type="email"
          />
          <TextField
            placeholder="Coloque a senha"
            fullWidth
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Lembrar de mim"
            sx={{ mt: 1 }}
            disabled={loading}
          />
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            sx={{ mt: 1 }}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </Box>
        <Grid container justifyContent='space-between' sx={{ mt: 1 }}>
          <Grid item>
            <Link component={RouterLink} to="/forgot">
              Esqueci minha senha
            </Link>
          </Grid>
          <Link component={RouterLink} to="/register">
            Registre-se
          </Link>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Login;