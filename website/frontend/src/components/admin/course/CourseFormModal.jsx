import React, { useState, useCallback } from 'react';
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
  Tabs,
  Tab
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
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
  const [activeTab, setActiveTab] = useState(0);

  const difficulties = [
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
  ];

  const handleChange = useCallback((event) => {
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
  }, [errors]);

  const validateForm = useCallback(() => {
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

    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const validateAndSetErrors = useCallback(() => {
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
  }, [formData]);

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const getCompletionPercentage = useCallback(() => {
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

    if (!validateAndSetErrors()) {
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
      setActiveTab(0);

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
    setActiveTab(0);
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
    setActiveTab(0);
  };

  const handleDifficultySelect = useCallback((value) => {
    setFormData(prev => ({
      ...prev,
      difficulty: value
    }));

    if (errors.difficulty) {
      setErrors(prev => ({
        ...prev,
        difficulty: ''
      }));
    }
  }, [errors.difficulty]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderBasicInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" color="primary">
            Informações Básicas do Curso
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
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 1 }}>
          {formData.description.length}/1000 caracteres
        </Typography>
      </Grid>
    </Grid>
  );

  const renderSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" color="primary">
            Configurações do Curso
          </Typography>
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Nível de Dificuldade *
            <Tooltip title="Escolha o nível que melhor representa o público-alvo do seu curso">
              <HelpIcon sx={{ ml: 1, fontSize: 16, color: 'action.active' }} />
            </Tooltip>
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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
                    width: 40,
                    height: 40
                  }}
                >
                  <TrendingUpIcon />
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
        />
      </Grid>
    </Grid>
  );

  const renderReview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PreviewIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" color="primary">
            Revisão dos Dados
          </Typography>
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle1" color="primary" gutterBottom fontWeight="bold">
                  Título do Curso
                </Typography>
                <Typography variant="body1">
                  {formData.title || 'Não informado'}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" color="primary" gutterBottom fontWeight="bold">
                  Descrição
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formData.description || 'Nenhuma descrição fornecida'}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" color="primary" gutterBottom fontWeight="bold">
                  Nível de Dificuldade
                </Typography>
                {formData.difficulty ? (
                  <Chip
                    label={difficulties.find(d => d.value === formData.difficulty)?.label}
                    sx={{
                      bgcolor: difficulties.find(d => d.value === formData.difficulty)?.color,
                      color: 'white',
                      fontWeight: 'bold'
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
                <Typography variant="subtitle1" color="primary" gutterBottom fontWeight="bold">
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderBasicInfo();
      case 1:
        return renderSettings();
      case 2:
        return renderReview();
      default:
        return renderBasicInfo();
    }
  };

  const canProceedToNext = () => {
    switch (activeTab) {
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
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '600px',
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
            {Math.round(getCompletionPercentage())}% completo
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={getCompletionPercentage()}
          sx={{ height: 6, borderRadius: 3 }}
        />
      </Box>

      {/* Tabs para navegação */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ px: 3 }}
        >
          <Tab
            icon={<SchoolIcon />}
            label="Informações"
            iconPosition="start"
          />
          <Tab
            icon={<TrendingUpIcon />}
            label="Configurações"
            iconPosition="start"
          />
          <Tab
            icon={<PreviewIcon />}
            label="Revisão"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      <DialogContent dividers sx={{ minHeight: '400px', p: 3 }}>
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        {errors.submit && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.submit}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          {renderTabContent()}
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
          {activeTab > 0 && (
            <Button
              onClick={() => setActiveTab(activeTab - 1)}
              disabled={loading}
            >
              Voltar
            </Button>
          )}

          {activeTab < 2 ? (
            <Button
              onClick={() => setActiveTab(activeTab + 1)}
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