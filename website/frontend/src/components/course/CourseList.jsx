import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    Chip,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    InputAdornment,
    Tooltip,
    Avatar,
    Fade,
    Zoom,
    Snackbar,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import {
    Search as SearchIcon,
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    BookmarkBorder as BookmarkIcon,
    AccessTime as TimeIcon,
    Person as PersonIcon,
    School as SchoolIcon,
    TrendingUp as TrendingUpIcon,
    Assignment as AssignmentIcon,
    Star as StarIcon,
    Sort as SortIcon,
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import CourseEditModal from './CourseEditModal';
import CourseDeleteModal from './CourseDeleteModal';

const CourseList = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [viewMode, setViewMode] = useState('cards');
    
    // Estados de ordenação
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');

    // Estados do modal de edição
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    
    // Estados do modal de exclusão
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);
    
    // Estados de notificação
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    
    const { isAdmin } = useAuth();
    const userIsAdmin = isAdmin();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await api.get('/courses');
            setCourses(response.data);
            console.log('Cursos carregados do backend:', response.data);
        } catch (err) {
            setError('Erro ao carregar cursos: ' + err.message);
            console.error('Erro ao buscar cursos:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handlers para o modal de edição
    const handleEditClick = (course) => {
        console.log('📝 Abrindo editor para curso:', course);
        setSelectedCourse(course);
        setEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setEditModalOpen(false);
        setSelectedCourse(null);
    };

    const handleCourseUpdated = (updatedCourse) => {
        console.log('✅ Curso atualizado:', updatedCourse);
        
        // Atualizar a lista de cursos
        setCourses(prevCourses => 
            prevCourses.map(course => 
                course.id === updatedCourse.id ? updatedCourse : course
            )
        );
        
        showSnackbar('Curso atualizado com sucesso!', 'success');
    };

    // Handlers para o modal de exclusão
    const handleDeleteClick = (course) => {
        console.log('🗑️ Preparando exclusão do curso:', course);
        setCourseToDelete(course);
        setDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setDeleteModalOpen(false);
        setCourseToDelete(null);
    };

    const handleCourseDeleted = (deletedCourseId) => {
        console.log('✅ Curso excluído:', deletedCourseId);
        
        // Remover curso da lista
        setCourses(prevCourses => 
            prevCourses.filter(course => course.id !== deletedCourseId)
        );
        
        showSnackbar('Curso excluído com sucesso!', 'success');
    };

    // Função para mostrar notificações
    const showSnackbar = (message, severity = 'success') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    // Filtrar cursos baseado no termo de busca
    const filteredCourses = courses.filter(course =>
        (course.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.difficulty || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Ordenar cursos
    const sortedCourses = [...filteredCourses].sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        // Ordenação especial para dificuldade
        if (sortBy === 'difficulty') {
            const difficultyOrder = { 'BEGINNER': 1, 'INTERMEDIATE': 2, 'ADVANCED': 3 };
            aValue = difficultyOrder[aValue?.toUpperCase()] || 999;
            bValue = difficultyOrder[bValue?.toUpperCase()] || 999;
        }

        if (sortDirection === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
    });

    // Paginação
    const paginatedCourses = sortedCourses.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'beginner':
                return 'success';
            case 'intermediate':
                return 'warning';
            case 'advanced':
                return 'error';
            default:
                return 'default';
        }
    };

    const getDifficultyIcon = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'beginner':
                return <StarIcon fontSize="small" />;
            case 'intermediate':
                return <TrendingUpIcon fontSize="small" />;
            case 'advanced':
                return <AssignmentIcon fontSize="small" />;
            default:
                return <SchoolIcon fontSize="small" />;
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 400, justifyContent: 'center' }}>
                <CircularProgress size={60} thickness={4} />
                <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                    Carregando cursos...
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    Aguarde enquanto buscamos os melhores cursos para você
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert 
                severity="error" 
                sx={{ 
                    mb: 2,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                        fontSize: '2rem'
                    }
                }}
            >
                <Typography variant="h6" component="div">
                    Ops! Algo deu errado
                </Typography>
                {error}
            </Alert>
        );
    }

    const renderCards = () => (
        <Grid container spacing={3}>
            {paginatedCourses.map((course, index) => (
                <Grid item xs={12} sm={6} md={4} key={course.id}>
                    <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                        <Card 
                            sx={{ 
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.3s ease-in-out',
                                position: 'relative',
                                overflow: 'hidden',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: (theme) => theme.shadows[8],
                                    '&::before': {
                                        opacity: 1,
                                    }
                                },
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '4px',
                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                    opacity: 0.7,
                                    transition: 'opacity 0.3s ease-in-out'
                                }
                            }}
                        >
                            <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                                {/* Header do Card */}
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                                    <Avatar 
                                        sx={{ 
                                            bgcolor: 'primary.main',
                                            width: 48,
                                            height: 48,
                                            mr: 2
                                        }}
                                    >
                                        <SchoolIcon />
                                    </Avatar>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        {course.difficulty && (
                                            <Chip
                                                icon={getDifficultyIcon(course.difficulty)}
                                                label={course.difficulty}
                                                size="small"
                                                color={getDifficultyColor(course.difficulty)}
                                                variant="outlined"
                                            />
                                        )}
                                    </Box>
                                </Box>

                                {/* Título */}
                                <Typography 
                                    variant="h6" 
                                    component="div" 
                                    gutterBottom
                                    sx={{ 
                                        fontWeight: 'bold',
                                        lineHeight: 1.2,
                                        mb: 1,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {course.title || course.nome || 'Curso sem nome'}
                                </Typography>

                                {/* Descrição */}
                                {(course.description || course.descricao) && (
                                    <Typography 
                                        variant="body2" 
                                        color="text.secondary"
                                        sx={{ 
                                            mb: 2,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            lineHeight: 1.4
                                        }}
                                    >
                                        {course.description || course.descricao}
                                    </Typography>
                                )}

                                {/* Informações extras */}
                                <Box sx={{ mt: 'auto' }}>
                                    {(course.duration || course.cargaHoraria) && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <TimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                                            <Typography variant="caption" color="text.secondary">
                                                {course.duration ? `${course.duration} min` : `${course.cargaHoraria}h`}
                                            </Typography>
                                        </Box>
                                    )}
                                    
                                    {course.createdBy && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <PersonIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                                            <Typography variant="caption" color="text.secondary">
                                                Por: {course.createdBy}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </CardContent>

                            <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'space-between' }}>
                                <Box>
                                    <Tooltip title="Visualizar curso">
                                        <IconButton size="small" color="primary">
                                            <VisibilityIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Adicionar aos favoritos">
                                        <IconButton size="small">
                                            <BookmarkIcon />
                                        </IconButton>
                                    </Tooltip>
                                    {userIsAdmin && (
                                        <>
                                            <Tooltip title="Editar curso">
                                                <IconButton 
                                                    size="small" 
                                                    color="info"
                                                    onClick={() => handleEditClick(course)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Excluir curso">
                                                <IconButton 
                                                    size="small" 
                                                    color="error"
                                                    onClick={() => handleDeleteClick(course)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </>
                                    )}
                                </Box>
                                
                                <Button 
                                    variant="contained" 
                                    size="small"
                                    sx={{ 
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Acessar
                                </Button>
                            </CardActions>
                        </Card>
                    </Zoom>
                </Grid>
            ))}
        </Grid>
    );

    const renderTable = () => (
        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                            Curso
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                            Dificuldade
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                            Duração
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                            Criado por
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }} align="center">
                            Ações
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {paginatedCourses.map((course, index) => (
                        <Fade in={true} key={course.id} style={{ transitionDelay: `${index * 50}ms` }}>
                            <TableRow 
                                hover
                                sx={{ 
                                    '&:hover': { 
                                        bgcolor: 'action.hover',
                                        transform: 'scale(1.01)',
                                        transition: 'all 0.2s ease-in-out'
                                    }
                                }}
                            >
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                            <SchoolIcon />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                {course.title || course.nome || 'Curso sem nome'}
                                            </Typography>
                                            {(course.description || course.descricao) && (
                                                <Typography 
                                                    variant="caption" 
                                                    color="text.secondary"
                                                    sx={{ 
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    {course.description || course.descricao}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    {course.difficulty && (
                                        <Chip
                                            icon={getDifficultyIcon(course.difficulty)}
                                            label={course.difficulty}
                                            size="small"
                                            color={getDifficultyColor(course.difficulty)}
                                            variant="outlined"
                                        />
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <TimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                                        <Typography variant="body2">
                                            {course.duration ? `${course.duration} min` : course.cargaHoraria ? `${course.cargaHoraria}h` : 'N/A'}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <PersonIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                                        <Typography variant="body2">
                                            {course.createdBy || 'N/A'}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                        <Tooltip title="Visualizar">
                                            <IconButton size="small" color="primary">
                                                <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Favoritar">
                                            <IconButton size="small">
                                                <BookmarkIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        {userIsAdmin && (
                                            <>
                                                <Tooltip title="Editar">
                                                    <IconButton 
                                                        size="small" 
                                                        color="info"
                                                        onClick={() => handleEditClick(course)}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Excluir">
                                                    <IconButton 
                                                        size="small" 
                                                        color="error"
                                                        onClick={() => handleDeleteClick(course)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        </Fade>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    return (
        <Box>
            {/* Header da seção */}
            <Box sx={{ mb: 4 }}>
                <Typography 
                    variant="h4" 
                    component="h1" 
                    gutterBottom
                    sx={{ 
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        display: 'inline-block'
                    }}
                >
                    Catálogo de Cursos
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {courses.length === 0
                        ? 'Nenhum curso encontrado no sistema.'
                        : `Explore nossa coleção de ${courses.length} curso(s) disponível(is)`
                    }
                </Typography>

                {/* Controles de busca e visualização */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                    <TextField
                        placeholder="Buscar cursos..."
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ 
                            minWidth: 300,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2
                            }
                        }}
                    />
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant={viewMode === 'cards' ? 'contained' : 'outlined'}
                            onClick={() => setViewMode('cards')}
                            sx={{ borderRadius: 2 }}
                        >
                            Cards
                        </Button>
                        <Button
                            variant={viewMode === 'table' ? 'contained' : 'outlined'}
                            onClick={() => setViewMode('table')}
                            sx={{ borderRadius: 2 }}
                        >
                            Tabela
                        </Button>
                    </Box>
                </Box>

                {/* Controles de ordenação */}
                <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SortIcon fontSize="small" />
                            <Typography variant="body2" color="text.secondary">
                                Ordenar por:
                            </Typography>
                        </Box>

                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Campo</InputLabel>
                            <Select
                                value={sortBy}
                                label="Campo"
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <MenuItem value="title">Título</MenuItem>
                                <MenuItem value="difficulty">Dificuldade</MenuItem>
                            </Select>
                        </FormControl>

                        <ToggleButtonGroup
                            value={sortDirection}
                            exclusive
                            onChange={(e, newDirection) => {
                                if (newDirection !== null) {
                                    setSortDirection(newDirection);
                                }
                            }}
                            size="small"
                        >
                            <ToggleButton value="asc" aria-label="crescente">
                                <Tooltip title="Crescente">
                                    <ArrowUpwardIcon fontSize="small" />
                                </Tooltip>
                            </ToggleButton>
                            <ToggleButton value="desc" aria-label="decrescente">
                                <Tooltip title="Decrescente">
                                    <ArrowDownwardIcon fontSize="small" />
                                </Tooltip>
                            </ToggleButton>
                        </ToggleButtonGroup>

                        <Typography variant="caption" color="text.secondary">
                            {filteredCourses.length} curso(s) encontrado(s)
                        </Typography>
                    </Box>
                </Paper>
            </Box>

            {/* Conteúdo */}
            {filteredCourses.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                    <SchoolIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                        {searchTerm ? 'Nenhum curso encontrado' : 'Nenhum curso cadastrado'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {searchTerm 
                            ? `Não encontramos cursos que correspondam a "${searchTerm}"`
                            : 'Os cursos aparecerão aqui quando forem criados no sistema.'
                        }
                    </Typography>
                </Paper>
            ) : (
                <>
                    {viewMode === 'cards' ? renderCards() : renderTable()}
                    
                    {/* Paginação */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <TablePagination
                            component="div"
                            count={filteredCourses.length}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            labelRowsPerPage="Cursos por página:"
                            labelDisplayedRows={({ from, to, count }) => 
                                `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                            }
                            sx={{
                                '& .MuiTablePagination-toolbar': {
                                    borderRadius: 2,
                                    bgcolor: 'background.paper'
                                }
                            }}
                        />
                    </Box>
                </>
            )}

            {/* Modal de Edição */}
            <CourseEditModal
                open={editModalOpen}
                onClose={handleCloseEditModal}
                course={selectedCourse}
                onCourseUpdated={handleCourseUpdated}
            />

            {/* Modal de Exclusão */}
            <CourseDeleteModal
                open={deleteModalOpen}
                onClose={handleCloseDeleteModal}
                course={courseToDelete}
                onCourseDeleted={handleCourseDeleted}
            />

            {/* Snackbar para notificações */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CourseList;
