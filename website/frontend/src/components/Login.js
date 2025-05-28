import {
  Avatar, Box, Checkbox, Container, FormControlLabel, Paper,
  TextField, Typography, Button, Grid, Link
} from "@mui/material";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await axios.post('/login', new URLSearchParams({
        username: email, // Spring Security espera "username", mesmo sendo email
        password: password
      }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        withCredentials: true // para manter a sessão
      });

      navigate('/home');
    } catch (error) {
      alert("Login falhou");
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
        <Box component='form' onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            placeholder="Coloque o email"
            fullWidth
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            placeholder="Coloque a senha"
            fullWidth
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Lembrar de mim"
            sx={{ mt: 1 }}
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 1 }}>
            Entrar
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
