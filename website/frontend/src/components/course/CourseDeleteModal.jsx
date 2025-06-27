import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    IconButton,
    Typography,
    Alert,
    CircularProgress,
    Fade
} from '@mui/material';
import {
    Close as CloseIcon,
    Delete as DeleteIcon,
    Cancel as CancelIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import api from '../../services/api';

const CourseDeleteModal = ({ open, onClose, course, onCourseDeleted }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        if (!course) return;

        setLoading(true);
        setError('');

        try {
            console.log('🗑️ Excluindo curso:', course.id);

            await api.delete(`/courses/${course.id}`);

            console.log('✅ Curso excluído com sucesso:', course.id);

            // Chamar callback para atualizar a lista
            if (onCourseDeleted) {
                onCourseDeleted(course.id);
            }

            onClose();
        } catch (err) {
            console.error('❌ Erro ao excluir curso:', err);

            let errorMessage = 'Erro ao excluir o curso. Tente novamente.';

            if (err.response?.status === 403) {
                errorMessage = 'Você não tem permissão para excluir este curso.';
            } else if (err.response?.status === 404) {
                errorMessage = 'Curso não encontrado.';
            } else if (err.response?.status === 409) {
                errorMessage = 'Não é possível excluir este curso pois há alunos matriculados.';
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setError('');
        onClose();
    };

    // Reset erro quando o modal abrir
    React.useEffect(() => {
        if (open) {
            setError('');
        }
    }, [open]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    minHeight: 200
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
                    background: 'linear-gradient(45deg, #f44336 30%, #ff6b6b 90%)',
                    color: 'white'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon />
                    <Box>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                            Confirmar Exclusão
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                            Esta ação não pode ser desfeita
                        </Typography>
                    </Box>
                </Box>
                <IconButton
                    onClick={handleCancel}
                    sx={{ color: 'white' }}
                    disabled={loading}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 3, pb: 2 }}>
                <Fade in={open}>
                    <Box>
                        {/* Exibir erro se houver */}
                        {error && (
                            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {/* Mensagem de confirmação */}
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <WarningIcon
                                sx={{
                                    fontSize: 64,
                                    color: 'warning.main',
                                    mb: 2
                                }}
                            />

                            <Typography variant="h6" gutterBottom>
                                Tem certeza que deseja excluir este curso?
                            </Typography>

                            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                <strong>{course?.title || course?.nome || 'Curso sem nome'}</strong>
                            </Typography>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Esta ação irá remover permanentemente o curso e todas as suas informações do sistema.
                            </Typography>

                            {/* Informações do curso */}
                            <Box
                                sx={{
                                    mt: 2,
                                    p: 2,
                                    bgcolor: 'error.light',
                                    borderRadius: 2,
                                    border: 1,
                                    borderColor: 'error.main',
                                    opacity: 0.8
                                }}
                            >
                                <Typography variant="subtitle2" gutterBottom color="error.dark">
                                    Dados que serão perdidos:
                                </Typography>
                                <Typography variant="body2" color="error.dark">
                                    • Título: {course?.title || course?.nome || 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="error.dark">
                                    • Dificuldade: {course?.difficulty || 'N/A'}
                                </Typography>
                                {course?.description && (
                                    <Typography variant="body2" color="error.dark">
                                        • Descrição: {course.description.substring(0, 50)}...
                                    </Typography>
                                )}
                                {course?.createdBy && (
                                    <Typography variant="body2" color="error.dark">
                                        • Criado por: {course.createdBy}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Fade>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button
                    onClick={handleCancel}
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    disabled={loading}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        minWidth: 120
                    }}
                >
                    Cancelar
                </Button>

                <Button
                    onClick={handleDelete}
                    variant="contained"
                    color="error"
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
                    disabled={loading}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        minWidth: 120,
                        fontWeight: 'bold'
                    }}
                >
                    {loading ? 'Excluindo...' : 'Excluir'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CourseDeleteModal;