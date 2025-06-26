import React, { useState, useEffect } from 'react';
import {
    Grid,
    Box,
    Typography,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Stack,
    Skeleton,
    Alert,
    Button,
    Paper,
    ToggleButton,
    ToggleButtonGroup,
    Slider,
    Collapse
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    ViewModule as GridViewIcon,
    ViewList as ListViewIcon,
    Sort as SortIcon,
    Clear as ClearIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import CourseCard from './CourseCard';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const CourseGrid = ({
                        courses: propCourses,
                        loading: propLoading,
                        onCourseEnroll,
                        onCourseBookmark,
                        onCourseShare,
                        onCourseEdit,
                        onCourseDelete,
                        onCourseView
                    }) => {
    const [courses, setCourses] = useState(propCourses || []);
    const [loading, setLoading] = useState(propLoading || false);
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [ratingRange, setRatingRange] = useState([0, 5]);

    const { isAdmin } = useAuth();
    const userIsAdmin = isAdmin();

    // Buscar cursos se não foram passados como prop
    useEffect(() => {
        if (!propCourses) {
            fetchCourses();
        } else {
            setCourses(propCourses);
        }
    }, [propCourses]);

    const fetchCourses = async () => {
        try {
            console.log('🚀 [COURSEGRID] Iniciando fetchCourses...');
            setLoading(true);

            // ✅ Agora sem /api (pois já está no baseURL)
            const response = await api.get('/courses');

            console.log('✅ [COURSEGRID] Response recebido:', response.data);

            if (Array.isArray(response.data)) {
                setCourses(response.data);
                console.log('🎯 [COURSEGRID] Cursos salvos no state!');
            }

        } catch (error) {
            console.error('❌ [COURSEGRID] Erro:', error);
        } finally {
            setLoading(false);
        }
    };


    // Filtrar e ordenar cursos
    const filteredAndSortedCourses = React.useMemo(() => {
        let filtered = courses.filter(course => {
            const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesDifficulty = !difficultyFilter || course.difficulty === difficultyFilter;

            return matchesSearch && matchesDifficulty;
        });

        // Ordenação
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'difficulty':
                    const difficultyOrder = { 'BEGINNER': 1, 'INTERMEDIATE': 2, 'ADVANCED': 3 };
                    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
                default:
                    return 0;
            }
        });

        return filtered;
    }, [courses, searchTerm, difficultyFilter, sortBy]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setDifficultyFilter('');
        setSortBy('newest');
        setRatingRange([0, 5]);
    };

    const getDifficultyStats = () => {
        const stats = courses.reduce((acc, course) => {
            acc[course.difficulty] = (acc[course.difficulty] || 0) + 1;
            return acc;
        }, {});
        return stats;
    };

    const difficultyStats = getDifficultyStats();

    const renderSkeletons = () => (
        <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item}>
                    <Paper elevation={1} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                        <Skeleton variant="rectangular" height={200} />
                        <Box sx={{ p: 3 }}>
                            <Skeleton variant="text" sx={{ fontSize: '1.25rem', mb: 1 }} />
                            <Skeleton variant="text" height={60} />
                            <Skeleton variant="text" width="60%" />
                        </Box>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );

    if (loading) {
        return (
            <Box>
                <Typography variant="h4" gutterBottom>
                    Carregando cursos...
                </Typography>
                {renderSkeletons()}
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom fontWeight="bold">
                    {userIsAdmin ? 'Gerenciar Cursos' : 'Catálogo de Cursos'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {userIsAdmin
                        ? 'Gerencie todos os cursos da plataforma'
                        : 'Descubra novos conhecimentos e desenvolva suas habilidades'
                    }
                </Typography>
            </Box>

            {/* Filters Bar */}
            <Paper
                elevation={1}
                sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(144, 202, 249, 0.1) 0%, rgba(244, 143, 177, 0.1) 100%)'
                }}
            >
                <Grid container spacing={2} alignItems="center">
                    {/* Search */}
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            placeholder="Buscar cursos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                }
                            }}
                        />
                    </Grid>

                    {/* Difficulty Filter */}
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Dificuldade</InputLabel>
                            <Select
                                value={difficultyFilter}
                                label="Dificuldade"
                                onChange={(e) => setDifficultyFilter(e.target.value)}
                                sx={{ borderRadius: 2 }}
                            >
                                <MenuItem value="">Todas</MenuItem>
                                <MenuItem value="BEGINNER">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        Iniciante
                                        {difficultyStats.BEGINNER && (
                                            <Chip size="small" label={difficultyStats.BEGINNER} />
                                        )}
                                    </Box>
                                </MenuItem>
                                <MenuItem value="INTERMEDIATE">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        Intermediário
                                        {difficultyStats.INTERMEDIATE && (
                                            <Chip size="small" label={difficultyStats.INTERMEDIATE} />
                                        )}
                                    </Box>
                                </MenuItem>
                                <MenuItem value="ADVANCED">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        Avançado
                                        {difficultyStats.ADVANCED && (
                                            <Chip size="small" label={difficultyStats.ADVANCED} />
                                        )}
                                    </Box>
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Sort */}
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Ordenar</InputLabel>
                            <Select
                                value={sortBy}
                                label="Ordenar"
                                onChange={(e) => setSortBy(e.target.value)}
                                sx={{ borderRadius: 2 }}
                            >
                                <MenuItem value="newest">Mais recentes</MenuItem>
                                <MenuItem value="oldest">Mais antigos</MenuItem>
                                <MenuItem value="title">Título A-Z</MenuItem>
                                <MenuItem value="difficulty">Dificuldade</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* View Mode */}
                    <Grid item xs={12} sm={6} md={2}>
                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={(e, newMode) => newMode && setViewMode(newMode)}
                            fullWidth
                        >
                            <ToggleButton value="grid" aria-label="grid view">
                                <GridViewIcon />
                            </ToggleButton>
                            <ToggleButton value="list" aria-label="list view">
                                <ListViewIcon />
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Grid>

                    {/* Actions */}
                    <Grid item xs={12} sm={6} md={2}>
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="outlined"
                                startIcon={<FilterIcon />}
                                onClick={() => setShowFilters(!showFilters)}
                                sx={{ borderRadius: 2 }}
                            >
                                {showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </Button>

                            <Button
                                variant="outlined"
                                startIcon={<ClearIcon />}
                                onClick={handleClearFilters}
                                sx={{ borderRadius: 2 }}
                            >
                                Limpar
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>

                {/* Advanced Filters */}
                <Collapse in={showFilters}>
                    <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography gutterBottom>Avaliação</Typography>
                                <Slider
                                    value={ratingRange}
                                    onChange={(e, newValue) => setRatingRange(newValue)}
                                    valueLabelDisplay="auto"
                                    step={0.1}
                                    marks
                                    min={0}
                                    max={5}
                                    sx={{ mt: 2 }}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </Collapse>
            </Paper>

            {/* Results Summary */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body1" color="text.secondary">
                    {filteredAndSortedCourses.length} curso(s) encontrado(s)
                </Typography>

                {(searchTerm || difficultyFilter) && (
                    <Stack direction="row" spacing={1}>
                        {searchTerm && (
                            <Chip
                                label={`Busca: "${searchTerm}"`}
                                onDelete={() => setSearchTerm('')}
                                size="small"
                                variant="outlined"
                            />
                        )}
                        {difficultyFilter && (
                            <Chip
                                label={`Dificuldade: ${difficultyFilter}`}
                                onDelete={() => setDifficultyFilter('')}
                                size="small"
                                variant="outlined"
                            />
                        )}
                    </Stack>
                )}
            </Box>

            {/* Course Grid */}
            {filteredAndSortedCourses.length === 0 ? (
                <Alert
                    severity="info"
                    sx={{
                        borderRadius: 3,
                        '& .MuiAlert-message': { width: '100%', textAlign: 'center' }
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        Nenhum curso encontrado
                    </Typography>
                    <Typography variant="body2">
                        Tente ajustar os filtros ou criar um novo curso.
                    </Typography>
                </Alert>
            ) : (
                <Grid container spacing={3}>
                    {filteredAndSortedCourses.map((course) => (
                        <Grid
                            item
                            xs={12}
                            sm={viewMode === 'grid' ? 6 : 12}
                            md={viewMode === 'grid' ? 4 : 12}
                            lg={viewMode === 'grid' ? 3 : 12}
                            key={course.id}
                        >
                            <CourseCard
                                course={course}
                                onEnroll={onCourseEnroll}
                                onBookmark={onCourseBookmark}
                                onShare={onCourseShare}
                                onEdit={onCourseEdit}
                                onDelete={onCourseDelete}
                                onView={onCourseView}
                                isBookmarked={false} // Implementar lógica de favoritos
                                enrollmentProgress={Math.floor(Math.random() * 100)} // Dados fictícios
                                isEnrolled={Math.random() > 0.7} // Dados fictícios
                            />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default CourseGrid;