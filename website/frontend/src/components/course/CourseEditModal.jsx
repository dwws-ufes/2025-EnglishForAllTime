
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    IconButton,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Fade
} from '@mui/material';
import {
    Close as CloseIcon,
    Save as SaveIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import api from '../../services/api';

const CourseEditModal = ({ open, onClose, course, onCourseUpdated }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Resetar formulário quando o modal abrir/fechar ou curso mudar
    useEffect(() => {
        if (course && open) {
            setFormData({
                title: course.title || course.nome || '',
                description: course.description || course.descricao || '',
                difficulty: course.difficulty || ''
            });
            setError('');
        } else if (!open) {
            setFormData({
                title: '',
                description: '',
                difficulty: ''
            });
            setError('');
        }
    }, [course, open]);

    const handleInputChange = (field) => (event) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
        // Limpar erro quando usuário começar a digitar
        if (error) setError('');
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            setError('O título é obrigatório');
            return false;
        }
        if (!formData.description.trim()) {
            setError('A descrição é obrigatória');
            return false;
        }
        if (!formData.difficulty) {
            setError('A dificuldade é obrigatória');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            console.log('🔄 Editando curso:', course.id, formData);

            const response = await api.put(`/courses/${course.id}`, {
                title: formData.title.trim(),
                description: formData.description.trim(),
                difficulty: formData.difficulty
            });

            console.log('✅ Curso editado com sucesso:', response.data);

            // Chamar callback com os dados atualizados
            if (onCourseUpdated) {
                onCourseUpdated(response.data);
            }

            onClose();
        } catch (err) {
            console.error('❌ Erro ao editar curso:', err);

            let errorMessage = 'Erro ao salvar as alterações. Tente novamente.';

            if (err.response?.status === 403) {
                errorMessage = 'Você não tem permissão para editar este curso.';
            } else if (err.response?.status === 404) {
                errorMessage = 'Curso não encontrado.';
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        onClose();
    };

    const difficultyOptions = [
        { value: 'BEGINNER', label: 'Iniciante' },
        { value: 'INTERMEDIATE', label: 'Intermediário' },
        { value: 'ADVANCED', label: 'Avançado' }
    ];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    minHeight: 400
                }
            }}
        >
            {/* Header do Modal */}
            <DialogTitle
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pb: 1,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    color: 'white'
                }}
            >
                <Box>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                        Editar Curso
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                        Modifique as informações do curso
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{ color: 'white' }}
                    disabled={loading}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
                <Fade in={open}>
                    <Box>
                        {/* Exibir erro se houver */}
                        {error && (
                            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {/* Formulário */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Campo Título */}
                            <TextField
                                label="Título do Curso"
                                value={formData.title}
                                onChange={handleInputChange('title')}
                                fullWidth
                                required
                                disabled={loading}
                                variant="outlined"
                                placeholder="Digite o título do curso"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2
                                    }
                                }}
                                helperText="Máximo 100 caracteres"
                                inputProps={{ maxLength: 100 }}
                            />

                            {/* Campo Descrição */}
                            <TextField
                                label="Descrição"
                                value={formData.description}
                                onChange={handleInputChange('description')}
                                fullWidth
                                required
                                disabled={loading}
                                variant="outlined"
                                multiline
                                rows={4}
                                placeholder="Descreva o conteúdo e objetivos do curso"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2
                                    }
                                }}
                                helperText="Máximo 500 caracteres"
                                inputProps={{ maxLength: 500 }}
                            />

                            {/* Campo Dificuldade */}
                            <FormControl fullWidth required disabled={loading}>
                                <InputLabel>Dificuldade</InputLabel>
                                <Select
                                    value={formData.difficulty}
                                    onChange={handleInputChange('difficulty')}
                                    label="Dificuldade"
                                    sx={{
                                        borderRadius: 2
                                    }}
                                >
                                    {difficultyOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Informações do curso (apenas visualização) */}
                            <Box
                                sx={{
                                    mt: 2,
                                    p: 2,
                                    bgcolor: 'action.hover',
                                    borderRadius: 2,
                                    border: 1,
                                    borderColor: 'divider'
                                }}
                            >
                                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                                    Informações do Curso:
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>ID:</strong> {course?.id}
                                </Typography>
                                {course?.createdBy && (
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Criado por:</strong> {course.createdBy}
                                    </Typography>
                                )}
                                {course?.createdAt && (
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Data de criação:</strong> {new Date(course.createdAt).toLocaleDateString('pt-BR')}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Fade>
            </DialogContent>

            {/* Footer do Modal */}
            <DialogActions sx={{ p: 3, pt: 1 }}>
                <Button
                    onClick={handleCancel}
                    disabled={loading}
                    startIcon={<CancelIcon />}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 'bold'
                    }}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 'bold',
                        minWidth: 120
                    }}
                >
                    {loading ? 'Salvando...' : 'Salvar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CourseEditModal;