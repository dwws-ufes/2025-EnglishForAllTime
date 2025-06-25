import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import axios from 'axios';

const CourseForm = ({ onCourseCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: '',
    thumbnailUrl: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const difficulties = [
    { value: 'BEGINNER', label: 'Iniciante' },
    { value: 'INTERMEDIATE', label: 'Intermediário' },
    { value: 'ADVANCED', label: 'Avançado' }
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpar erro do campo quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.difficulty) {
      newErrors.difficulty = 'Nível de dificuldade é obrigatório';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Descrição deve ter no máximo 1000 caracteres';
    }

    if (formData.thumbnailUrl && !isValidUrl(formData.thumbnailUrl)) {
      newErrors.thumbnailUrl = 'URL da imagem deve ser válida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccessMessage('');

    try {
      const response = await axios.post('/api/courses', formData);
      
      setSuccessMessage('Curso criado com sucesso!');
      
      // Resetar formulário
      setFormData({
        title: '',
        description: '',
        difficulty: '',
        thumbnailUrl: ''
      });

      // Callback para componente pai se fornecido
      if (onCourseCreated) {
        onCourseCreated(response.data);
      }

    } catch (error) {
      console.error('Erro ao criar curso:', error);
      
      if (error.response?.status === 400) {
        setErrors({ submit: 'Dados inválidos. Verifique os campos e tente novamente.' });
      } else if (error.response?.status === 401) {
        setErrors({ submit: 'Você precisa estar logado para criar um curso.' });
      } else {
        setErrors({ submit: 'Erro interno do servidor. Tente novamente mais tarde.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      description: '',
      difficulty: '',
      thumbnailUrl: ''
    });
    setErrors({});
    setSuccessMessage('');
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Criar Novo Curso
        </Typography>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.submit}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Título do Curso"
                value={formData.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="description"
                label="Descrição"
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description || `${formData.description.length}/1000 caracteres`}
                fullWidth
                multiline
                rows={4}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.difficulty}>
                <InputLabel>Nível de Dificuldade</InputLabel>
                <Select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  label="Nível de Dificuldade"
                >
                  {difficulties.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.difficulty && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                    {errors.difficulty}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="thumbnailUrl"
                label="URL da Imagem (opcional)"
                value={formData.thumbnailUrl}
                onChange={handleChange}
                error={!!errors.thumbnailUrl}
                helperText={errors.thumbnailUrl}
                fullWidth
                variant="outlined"
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Limpar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Criar Curso'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CourseForm;