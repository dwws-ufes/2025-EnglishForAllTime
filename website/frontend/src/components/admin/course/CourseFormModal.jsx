import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Alert,
  Grid,
  IconButton,
  Box,
  Chip,
  Stack,
  Divider,
  Tooltip,
  LinearProgress,
  Card,
  CardContent,
  Avatar,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Close as CloseIcon, 
  School as SchoolIcon,
  Description as DescriptionIcon,
  TrendingUp as TrendingUpIcon,
  Image as ImageIcon,
  Preview as PreviewIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import axios from 'axios';

const CourseFormModal = ({ open, onClose, onCourseCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: '',
    thumbnailUrl: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  // Mover para um useMemo ou constante para evitar re-criação
  const difficulties = useMemo(() => [
    { 
      value: 'BEGINNER', 
      label: 'Iniciante',
      description: 'Para alunos que estão começando do zero',
      color: '#4caf50'
    },
    { 
      value: 'INTERMEDIATE', 
      label: 'Intermediário',
      description: 'Para alunos com conhecimento básico',
      color: '#ff9800'
    },
    { 
      value: 'ADVANCED', 
      label: 'Avançado',
      description: 'Para alunos com bom domínio do idioma',
      color: '#f44336'
    }
  ], []);

  const steps = useMemo(() => [
    {
      label: 'Informações Básicas',
      icon: <SchoolIcon />,
      description: 'Título e descrição do curso'
    },
    {
      label: 'Configurações',
      icon: <TrendingUpIcon />,
      description: 'Nível e imagem do curso'
    },
    {
      label: 'Revisão',
      icon: <PreviewIcon />,
      description: 'Confirme os dados antes de criar'
    }
  ], []);

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
    } else if (formData.title.length < 3) {
      newErrors.title = 'Título deve ter pelo menos 3 caracteres';
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

  // Usar useMemo para evitar recálculo constante
  const completionPercentage = useMemo(() => {
    let completed = 0;
    const totalFields = 4;
    
    if (formData.title.trim()) completed++;
    if (formData.description.trim()) completed++;
    if (formData.difficulty) completed++;
    if (formData.thumbnailUrl.trim()) completed++;
    
    return (completed / totalFields) * 100;
  }, [formData]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccessMessage('');

    try {
      const response = await axios.post('http://localhost:8080/api/courses', formData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setSuccessMessage('Curso criado com sucesso!');
      
      // Resetar formulário
      setFormData({
        title: '',
        description: '',
        difficulty: '',
        thumbnailUrl: ''
      });
      setActiveStep(0);

      if (onCourseCreated) {
        onCourseCreated(response.data);
      }

      setTimeout(() => {
        onClose();
        setSuccessMessage('');
      }, 2000);

    } catch (error) {
      console.error('Erro ao criar curso:', error);
      
      if (error.response?.status === 400) {
        setErrors({ submit: 'Dados inválidos. Verifique os campos e tente novamente.' });
      } else if (error.response?.status === 401) {
        setErrors({ submit: 'Você precisa estar logado para criar um curso.' });
      } else if (error.response?.status === 403) {
        setErrors({ submit: 'Você não tem permissão para criar cursos.' });
      } else if (error.code === 'ERR_NETWORK') {
        setErrors({ submit: 'Erro de conexão. Verifique se o servidor está rodando.' });
      } else {
        setErrors({ submit: 'Erro interno do servidor. Tente novamente mais tarde.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      difficulty: '',
      thumbnailUrl: ''
    });
    setErrors({});
    setSuccessMessage('');
    setActiveStep(0);
    onClose();
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
    setActiveStep(0);
  };

  // Função para criar o card de dificuldade
  const handleDifficultySelect = (value) => {
    handleChange({ target: { name: 'difficulty', value } });
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" color="primary">
                  Informações do Curso
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Título do Curso"
                value={formData.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title || 'Ex: Inglês Básico para Iniciantes'}
                fullWidth
                required
                variant="outlined"
                autoFocus
                InputProps={{
                  startAdornment: <SchoolIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="description"
                label="Descrição do Curso"
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description || 'Descreva o que os alunos aprenderão'}
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                placeholder="Curso focado em conversação básica, vocabulário essencial e gramática fundamental para quem está começando a aprender inglês..."
                InputProps={{
                  startAdornment: <DescriptionIcon sx={{ mr: 1, color: 'action.active', alignSelf: 'flex-start', mt: 1 }} />
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 1 }}>
                {formData.description.length}/1000 caracteres
              </Typography>
            </Grid>
          </Grid>
        );
      
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" color="primary">
                  Configurações do Curso
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Nível de Dificuldade *
                <Tooltip title="Escolha o nível que melhor representa o público-alvo do seu curso">
                  <HelpIcon sx={{ ml: 1, fontSize: 16, color: 'action.active' }} />
                </Tooltip>
              </Typography>
              
              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                {difficulties.map((option) => (
                  <Card 
                    key={option.value}
                    sx={{ 
                      cursor: 'pointer',
                      border: formData.difficulty === option.value ? 2 : 1,
                      borderColor: formData.difficulty === option.value ? option.color : 'divider',
                      flex: 1,
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 2
                      }
                    }}
                    onClick={() => handleDifficultySelect(option.value)}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: option.color, 
                          mx: 'auto', 
                          mb: 1,
                          width: 32,
                          height: 32
                        }}
                      >
                        <TrendingUpIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {option.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.description}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
              {errors.difficulty && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  {errors.difficulty}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="thumbnailUrl"
                label="URL da Imagem do Curso (opcional)"
                value={formData.thumbnailUrl}
                onChange={handleChange}
                error={!!errors.thumbnailUrl}
                helperText={errors.thumbnailUrl || 'Uma imagem atrativa ajuda a chamar atenção dos alunos'}
                fullWidth
                variant="outlined"
                placeholder="https://exemplo.com/imagem-do-curso.jpg"
                InputProps={{
                  startAdornment: <ImageIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
          </Grid>
        );
      
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PreviewIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" color="primary">
                  Revisão dos Dados
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Título do Curso
                      </Typography>
                      <Typography variant="body1">
                        {formData.title || 'Não informado'}
                      </Typography>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Descrição
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formData.description || 'Nenhuma descrição fornecida'}
                      </Typography>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Nível de Dificuldade
                      </Typography>
                      {formData.difficulty ? (
                        <Chip
                          label={difficulties.find(d => d.value === formData.difficulty)?.label}
                          sx={{
                            bgcolor: difficulties.find(d => d.value === formData.difficulty)?.color,
                            color: 'white'
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Não selecionado
                        </Typography>
                      )}
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Imagem do Curso
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formData.thumbnailUrl || 'Nenhuma imagem definida'}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
      
      default:
        return null;
    }
  };

  const canProceedToNext = () => {
    switch (activeStep) {
      case 0:
        return formData.title.trim() && formData.title.length >= 3;
      case 1:
        return formData.difficulty;
      case 2:
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { 
          minHeight: '700px',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Box>
          <Typography variant="h5" component="h2">
            Criar Novo Curso
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Preencha as informações para criar seu curso
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Barra de Progresso */}
      <Box sx={{ px: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Progresso do formulário
          </Typography>
          <Typography variant="caption" color="primary" fontWeight="bold">
            {Math.round(completionPercentage)}% completo
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={completionPercentage} 
          sx={{ height: 6, borderRadius: 3 }}
        />
      </Box>

      <DialogContent dividers sx={{ minHeight: '400px' }}>
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

        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Stepper lateral */}
          <Box sx={{ minWidth: 250 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step 
                  key={step.label}
                  onClick={() => setActiveStep(index)}
                  sx={{ cursor: 'pointer' }}
                >
                  <StepLabel 
                    icon={step.icon}
                    optional={
                      <Typography variant="caption">
                        {step.description}
                      </Typography>
                    }
                  >
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Conteúdo do formulário */}
          <Box sx={{ flex: 1 }}>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              {renderStepContent(activeStep)}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1, justifyContent: 'space-between' }}>
        <Button
          onClick={handleReset}
          disabled={loading}
          variant="outlined"
          color="error"
        >
          Limpar Tudo
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {activeStep > 0 && (
            <Button
              onClick={() => setActiveStep(activeStep - 1)}
              disabled={loading}
            >
              Voltar
            </Button>
          )}
          
          {activeStep < steps.length - 1 ? (
            <Button
              onClick={() => setActiveStep(activeStep + 1)}
              disabled={!canProceedToNext() || loading}
              variant="contained"
            >
              Próximo
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading || !validateForm()}
              variant="contained"
              startIcon={<SaveIcon />}
              size="large"
            >
              {loading ? 'Criando Curso...' : 'Criar Curso'}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default CourseFormModal;