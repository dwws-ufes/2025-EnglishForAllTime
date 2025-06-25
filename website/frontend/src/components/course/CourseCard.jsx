import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Chip,
    Avatar,
    IconButton,
    Button,
    LinearProgress,
    Tooltip,
    Stack,
    Divider,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    PlayArrow as PlayIcon,
    Bookmark as BookmarkIcon,
    BookmarkBorder as BookmarkBorderIcon,
    Share as ShareIcon,
    MoreVert as MoreVertIcon,
    Schedule as ScheduleIcon,
    Star as StarIcon,
    People as PeopleIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const CourseCard = ({
                        course,
                        onBookmark,
                        onShare,
                        onEdit,
                        onDelete,
                        onView,
                        isBookmarked = false,
                        enrollmentProgress = 0,
                        isEnrolled = false
                    }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [imageError, setImageError] = useState(false);
    const { isAdmin } = useAuth();

    const userIsAdmin = isAdmin();

    const handleMenuClick = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleBookmarkToggle = (event) => {
        event.stopPropagation();
        onBookmark?.(course.id);
    };

    const handleShare = (event) => {
        event.stopPropagation();
        onShare?.(course);
    };

    const handleCardClick = () => {
        onView?.(course);
    };

    const getDifficultyConfig = (difficulty) => {
        const configs = {
            'BEGINNER': {
                label: 'Iniciante',
                color: '#4caf50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)'
            },
            'INTERMEDIATE': {
                label: 'Intermediário',
                color: '#ff9800',
                backgroundColor: 'rgba(255, 152, 0, 0.1)'
            },
            'ADVANCED': {
                label: 'Avançado',
                color: '#f44336',
                backgroundColor: 'rgba(244, 67, 54, 0.1)'
            }
        };
        return configs[difficulty] || configs['BEGINNER'];
    };

    const difficultyConfig = getDifficultyConfig(course.difficulty);

    const formatDate = (dateString) => {
        if (!dateString) return 'Data não disponível';
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getDefaultImage = () => {
        const colors = ['#3f51b5', '#e91e63', '#ff9800', '#4caf50', '#2196f3', '#9c27b0'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dy=".3em">
          ${course.title.charAt(0).toUpperCase()}
        </text>
      </svg>
    `)}`;
    };

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                    '& .course-overlay': {
                        opacity: 1
                    },
                    '& .course-image': {
                        transform: 'scale(1.05)'
                    }
                }
            }}
            onClick={handleCardClick}
        >
            {/* Image Section */}
            <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                <CardMedia
                    component="img"
                    height="200"
                    image={imageError || !course.thumbnailUrl ? getDefaultImage() : course.thumbnailUrl}
                    alt={course.title}
                    className="course-image"
                    onError={() => setImageError(true)}
                    sx={{
                        transition: 'transform 0.3s ease',
                        objectFit: 'cover'
                    }}
                />

                {/* Overlay with actions */}
                <Box
                    className="course-overlay"
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(45deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                    }}
                >
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<PlayIcon />}
                        sx={{
                            borderRadius: 3,
                            px: 3,
                            py: 1.5,
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            background: 'rgba(255,255,255,0.95)',
                            color: 'primary.main',
                            '&:hover': {
                                background: 'rgba(255,255,255,1)',
                                transform: 'scale(1.05)'
                            }
                        }}
                    >
                        {isEnrolled ? 'Continuar' : 'Começar'}
                    </Button>
                </Box>

                {/* Top badges */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        right: 12,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                    }}
                >
                    <Chip
                        label={difficultyConfig.label}
                        size="small"
                        sx={{
                            backgroundColor: difficultyConfig.backgroundColor,
                            color: difficultyConfig.color,
                            fontWeight: 'bold',
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${difficultyConfig.color}`
                        }}
                    />

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={isBookmarked ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}>
                            <IconButton
                                size="small"
                                onClick={handleBookmarkToggle}
                                sx={{
                                    backgroundColor: 'rgba(255,255,255,0.9)',
                                    backdropFilter: 'blur(10px)',
                                    '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                                }}
                            >
                                {isBookmarked ? (
                                    <BookmarkIcon color="primary" />
                                ) : (
                                    <BookmarkBorderIcon />
                                )}
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Compartilhar">
                            <IconButton
                                size="small"
                                onClick={handleShare}
                                sx={{
                                    backgroundColor: 'rgba(255,255,255,0.9)',
                                    backdropFilter: 'blur(10px)',
                                    '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                                }}
                            >
                                <ShareIcon />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Mais opções">
                            <IconButton
                                size="small"
                                onClick={handleMenuClick}
                                sx={{
                                    backgroundColor: 'rgba(255,255,255,0.9)',
                                    backdropFilter: 'blur(10px)',
                                    '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                                }}
                            >
                                <MoreVertIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* Progress bar for enrolled courses */}
                {isEnrolled && (
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            px: 2,
                            pb: 1
                        }}
                    >
                        <LinearProgress
                            variant="determinate"
                            value={enrollmentProgress}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: 'rgba(255,255,255,0.3)',
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 3,
                                    background: 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)'
                                }
                            }}
                        />
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'white',
                                fontWeight: 'bold',
                                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                                fontSize: '0.75rem'
                            }}
                        >
                            {enrollmentProgress}% concluído
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Content Section */}
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    sx={{
                        fontWeight: 'bold',
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minHeight: '2.6em'
                    }}
                >
                    {course.title}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 1.5,
                        minHeight: '4.5em',
                        mb: 2
                    }}
                >
                    {course.description || 'Curso completo e detalhado para você dominar o assunto.'}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Course Stats */}
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PeopleIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                            {Math.floor(Math.random() * 500) + 50} alunos
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ScheduleIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                            {Math.floor(Math.random() * 8) + 2}h
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <StarIcon fontSize="small" sx={{ color: '#ffc107' }} />
                        <Typography variant="caption" color="text.secondary">
                            {(Math.random() * 2 + 3).toFixed(1)}
                        </Typography>
                    </Box>
                </Stack>

                {/* Creator Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                        sx={{
                            width: 32,
                            height: 32,
                            bgcolor: 'primary.main',
                            fontSize: '0.875rem'
                        }}
                    >
                        {course.createdBy?.login?.charAt(0).toUpperCase() || 'A'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                            {course.createdBy?.login?.split('@')[0] || 'Admin'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Criado em {formatDate(course.createdAt)}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>

            {/* Menu de opções */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={(e) => e.stopPropagation()}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={() => { onView?.(course); handleMenuClose(); }}>
                    <ListItemIcon>
                        <ViewIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Ver detalhes</ListItemText>
                </MenuItem>

                {userIsAdmin && (
                    <>
                        <MenuItem onClick={() => { onEdit?.(course); handleMenuClose(); }}>
                            <ListItemIcon>
                                <EditIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Editar curso</ListItemText>
                        </MenuItem>

                        <MenuItem
                            onClick={() => { onDelete?.(course); handleMenuClose(); }}
                            sx={{ color: 'error.main' }}
                        >
                            <ListItemIcon>
                                <DeleteIcon fontSize="small" color="error" />
                            </ListItemIcon>
                            <ListItemText>Excluir curso</ListItemText>
                        </MenuItem>
                    </>
                )}
            </Menu>
        </Card>
    );
};

export default CourseCard;