import React, { useState } from 'react';
import {
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Paper,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Fab,
  Snackbar,
  Alert as MuiAlert,
  Chip,
  Tab,
  Tabs,
  IconButton,
  CircularProgress,
  TextField,
  Alert,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Badge,
  Tooltip
} from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  TrendingUp as TrendingUpIcon,
  LibraryBooks as LibraryBooksIcon,
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Settings,
  Search as SearchIcon,
  MenuBook as DictionaryIcon,
  Hub as NetworkIcon,
  Language as LanguageIcon,
  AccountTree as TreeIcon,
  Psychology as PsychologyIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import CourseFormModal from '../components/course/CourseFormModal';
import CourseList from '../components/course/CourseList';
import { getWordDetails, getSemanticNetwork } from '../services/api';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

function Home() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  // Estados do dicionário
  const [searchTerm, setSearchTerm] = useState('');
  const [wordDetails, setWordDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // NOVA FUNCIONALIDADE: Estados da Rede Semântica
  const [semanticSearchTerm, setSemanticSearchTerm] = useState('');
  const [semanticNetwork, setSemanticNetwork] = useState(null);
  const [isSemanticLoading, setIsSemanticLoading] = useState(false);
  const [semanticError, setSemanticError] = useState(null);

  const { user, signOut, isAdmin, loading } = useAuth();

  // Aguardar carregamento dos dados do usuário
  if (loading) {
    return (
        <ThemeProvider theme={darkTheme}>
          <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="100vh"
          >
            <CircularProgress size={60} />
          </Box>
        </ThemeProvider>
    );
  }

  const userIsAdmin = isAdmin();

  console.log('🏠 [HOME] Estado do usuário:', {
    user: user?.email,
    role: user?.role,
    isAdmin: userIsAdmin,
    loading
  });

  // Funções do dicionário
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getWordDetails(searchTerm);
      setWordDetails(data);
    } catch (err) {
      setError(err.message || 'Erro ao buscar a palavra');
      setWordDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearDictionary = () => {
    setSearchTerm('');
    setWordDetails(null);
    setError(null);
  };

  // NOVA FUNCIONALIDADE: Funções da Rede Semântica
  const handleSemanticSearch = async () => {
    if (!semanticSearchTerm.trim()) return;

    setIsSemanticLoading(true);
    setSemanticError(null);

    try {
      const data = await getSemanticNetwork(semanticSearchTerm);
      setSemanticNetwork(data);
    } catch (err) {
      setSemanticError(err.message || 'Erro ao buscar rede semântica');
      setSemanticNetwork(null);
    } finally {
      setIsSemanticLoading(false);
    }
  };

  const handleSemanticKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSemanticSearch();
    }
  };

  const handleClearSemanticNetwork = () => {
    setSemanticSearchTerm('');
    setSemanticNetwork(null);
    setSemanticError(null);
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleClose();
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    signOut();
    setLogoutDialogOpen(false);
  };

  const handleOpenCourseModal = () => {
    if (!userIsAdmin) {
      setSnackbarMessage('Apenas administradores podem criar cursos.');
      setSnackbarOpen(true);
      return;
    }
    setCourseModalOpen(true);
  };

  const handleCloseCourseModal = () => {
    setCourseModalOpen(false);
  };

  const handleCourseCreated = (newCourse) => {
    console.log('Novo curso criado:', newCourse);
    setSnackbarMessage(`Curso "${newCourse.title || newCourse.nome}" criado com sucesso!`);
    setSnackbarOpen(true);
    setActiveTab(1);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Renderização do dicionário
  const renderDictionary = () => (
      <Container maxWidth="md">
        <Box sx={{ py: 2 }}>
          <Typography variant="h4" component="h2" gutterBottom align="center">
            📚 Dicionário Inglês
          </Typography>

          <Typography variant="subtitle1" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Pesquise qualquer palavra em inglês e obtenha definições, traduções e exemplos
          </Typography>

          {/* Campo de busca */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Digite uma palavra em inglês..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
              />
              <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={isLoading || !searchTerm.trim()}
                  startIcon={isLoading ? <CircularProgress size={20} /> : <SearchIcon />}
                  sx={{ minWidth: 120 }}
              >
                {isLoading ? 'Buscando...' : 'Buscar'}
              </Button>
              {(wordDetails || error) && (
                  <Button
                      variant="outlined"
                      onClick={handleClearDictionary}
                      disabled={isLoading}
                  >
                    Limpar
                  </Button>
              )}
            </Box>
          </Paper>

          {/* Loading */}
          {isLoading && (
              <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 4 }}>
                <CircularProgress sx={{ mr: 2 }} />
                <Typography>Buscando palavra...</Typography>
              </Box>
          )}

          {/* Erro */}
          {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
          )}

          {/* Resultados */}
          {wordDetails && !isLoading && (
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h4" component="h3" gutterBottom color="primary">
                  {wordDetails.word}
                </Typography>

                {wordDetails.phonetic && (
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                      📢 {wordDetails.phonetic}
                    </Typography>
                )}

                <Divider sx={{ my: 3 }} />

                {/* Definições */}
                {wordDetails.meanings && wordDetails.meanings.map((meaning, index) => (
                    <Box key={index} sx={{ mb: 4 }}>
                      <Typography variant="h6" color="secondary" gutterBottom>
                        🔤 {meaning.partOfSpeech}
                      </Typography>

                      {meaning.definitions && meaning.definitions.map((def, defIndex) => (
                          <Box key={defIndex} sx={{ ml: 2, mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                              <strong>{defIndex + 1}.</strong> {def.definition}
                            </Typography>

                            {def.example && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontStyle: 'italic', mt: 1, ml: 2 }}
                                >
                                  💡 Exemplo: "{def.example}"
                                </Typography>
                            )}

                            {def.synonyms && def.synonyms.length > 0 && (
                                <Typography variant="body2" color="primary" sx={{ ml: 2, mt: 1 }}>
                                  🔗 Sinônimos: {def.synonyms.join(', ')}
                                </Typography>
                            )}
                          </Box>
                      ))}
                    </Box>
                ))}

                {/* Traduções ou informações adicionais */}
                {wordDetails.translation && (
                    <Box sx={{ mt: 3, p: 3, bgcolor: 'primary.dark', borderRadius: 2 }}>
                      <Typography variant="h6" gutterBottom color="primary.contrastText">
                        🌍 Tradução:
                      </Typography>
                      <Typography variant="body1" color="primary.contrastText">
                        {wordDetails.translation}
                      </Typography>
                    </Box>
                )}
              </Paper>
          )}

          {/* Mensagem inicial */}
          {!wordDetails && !error && !isLoading && (
              <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  🔍 Digite uma palavra para começar
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Use o campo de busca acima para pesquisar qualquer palavra em inglês.<br/>
                  Você receberá definições detalhadas, exemplos e traduções.
                </Typography>
              </Paper>
          )}
        </Box>
      </Container>
  );

  const renderDashboard = () => (
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                }}
            >
              <Avatar sx={{ width: 56, height: 56 }}>
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h1">
                  Bem-vindo(a), {user?.name || 'Professor(a)'}!
                </Typography>
                <Typography variant="subtitle1">
                  {userIsAdmin
                      ? 'Painel de Administração - Gerencie conteúdo e usuários'
                      : 'Continue aprendendo e evoluindo seu inglês'
                  }
                </Typography>
              </Box>

              {userIsAdmin && (
                  <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<AddIcon />}
                      onClick={handleOpenCourseModal}
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.3)'
                        }
                      }}
                  >
                    Criar Curso
                  </Button>
              )}
            </Paper>
          </Grid>

          {[
            { title: 'Cursos Criados', value: '5', adminOnly: true, icon: <LibraryBooksIcon /> },
            {
              title: userIsAdmin ? 'Usuários Ativos' : 'Cursos Concluídos',
              value: userIsAdmin ? '127' : '3',
              icon: <TrendingUpIcon />
            },
            {
              title: userIsAdmin ? 'Cursos Ativos' : 'Certificados',
              value: userIsAdmin ? '12' : '2',
              icon: <SchoolIcon />
            },
            {
              title: userIsAdmin ? 'Receita Total' : 'Horas Estudadas',
              value: userIsAdmin ? 'R$ 2.450' : '45h',
              icon: <DashboardIcon />
            },
          ].map((stat) => {
            if (stat.adminOnly && !userIsAdmin) return null;

            return (
                <Grid item xs={12} sm={6} md={3} key={stat.title}>
                  <Paper
                      sx={{
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        height: 140,
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
                        }
                      }}
                  >
                    <Box sx={{ position: 'absolute', top: 16, right: 16, opacity: 0.1 }}>
                      {stat.icon}
                    </Box>
                    <Typography variant="h3" component="div" fontWeight="bold" color="primary">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      {stat.title}
                    </Typography>
                  </Paper>
                </Grid>
            );
          })}

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {userIsAdmin ? 'Cursos Gerenciados' : 'Meus Cursos'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {userIsAdmin
                        ? 'Aqui aparecerão os cursos que você criou e gerencia...'
                        : 'Aqui aparecerão os cursos em que você está matriculado...'
                    }
                  </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<SchoolIcon />}
                    onClick={() => setActiveTab(1)}
                >
                  Ver Todos
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
  );

  // NOVA FUNCIONALIDADE: Renderização da Rede Semântica
  const renderSemanticNetwork = () => (
      <Container maxWidth="lg">
        <Box sx={{ py: 2 }}>
          <Typography variant="h4" component="h2" gutterBottom align="center">
            🕸️ Rede Semântica de Palavras
          </Typography>

          <Typography variant="subtitle1" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Explore conexões linguísticas, etimologia e relações semânticas entre palavras usando dados interligados
          </Typography>

          {/* Campo de busca */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Digite uma palavra para explorar sua rede semântica..."
                  value={semanticSearchTerm}
                  onChange={(e) => setSemanticSearchTerm(e.target.value)}
                  onKeyPress={handleSemanticKeyPress}
                  disabled={isSemanticLoading}
              />
              <Button
                  variant="contained"
                  onClick={handleSemanticSearch}
                  disabled={isSemanticLoading || !semanticSearchTerm.trim()}
                  startIcon={isSemanticLoading ? <CircularProgress size={20} /> : <NetworkIcon />}
                  sx={{ minWidth: 140 }}
              >
                {isSemanticLoading ? 'Analisando...' : 'Explorar Rede'}
              </Button>
              {(semanticNetwork || semanticError) && (
                  <Button
                      variant="outlined"
                      onClick={handleClearSemanticNetwork}
                      disabled={isSemanticLoading}
                  >
                    Limpar
                  </Button>
              )}
            </Box>
          </Paper>

          {/* Loading */}
          {isSemanticLoading && (
              <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 4 }}>
                <CircularProgress sx={{ mr: 2 }} />
                <Typography>Construindo rede semântica...</Typography>
              </Box>
          )}

          {/* Erro */}
          {semanticError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {semanticError}
              </Alert>
          )}

          {/* Resultados da Rede Semântica */}
          {semanticNetwork && !isSemanticLoading && (
              <Grid container spacing={3}>
                {/* Palavra Principal */}
                <Grid item xs={12}>
                  <Paper elevation={3} sx={{ p: 3, bgcolor: 'primary.dark', color: 'primary.contrastText' }}>
                    <Typography variant="h3" component="h3" gutterBottom align="center">
                      🎯 {semanticNetwork.word}
                    </Typography>
                    <Typography variant="h6" align="center" sx={{ opacity: 0.9 }}>
                      Análise Semântica Completa
                    </Typography>
                  </Paper>
                </Grid>

                {/* Etimologia */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardHeader
                        avatar={<TimelineIcon color="primary" />}
                        title="Etimologia"
                        subheader="Origem e evolução histórica"
                    />
                    <CardContent>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {semanticNetwork.etymology}
                      </Typography>

                      {semanticNetwork.origin && (
                          <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              🏛️ Origem Linguística:
                            </Typography>
                            <Typography variant="body2">
                              <strong>Língua:</strong> {semanticNetwork.origin.language}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Forma Original:</strong> {semanticNetwork.origin.originalForm}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Significado:</strong> {semanticNetwork.origin.meaning}
                            </Typography>
                          </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Família de Palavras */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardHeader
                        avatar={<TreeIcon color="secondary" />}
                        title="Família de Palavras"
                        subheader="Palavras morfologicamente relacionadas"
                    />
                    <CardContent>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {semanticNetwork.wordFamily}
                      </Typography>

                      <Box sx={{ mt: 2 }}>
                        {semanticNetwork.wordFamily.split(', ').map((word, index) => (
                            <Chip
                                key={index}
                                label={word.trim()}
                                variant="outlined"
                                size="small"
                                sx={{ m: 0.5 }}
                                onClick={() => {
                                  setSemanticSearchTerm(word.trim());
                                  handleSemanticSearch();
                                }}
                            />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Sinônimos */}
                {semanticNetwork.synonyms && semanticNetwork.synonyms.length > 0 && (
                    <Grid item xs={12} md={4}>
                      <Card sx={{ height: '100%' }}>
                        <CardHeader
                            avatar={<Badge badgeContent={semanticNetwork.synonyms.length} color="primary">
                              <PsychologyIcon color="success" />
                            </Badge>}
                            title="Sinônimos"
                            subheader="Palavras com significados similares"
                        />
                        <CardContent>
                          <List dense>
                            {semanticNetwork.synonyms.map((syn, index) => (
                                <ListItem
                                    key={index}
                                    button
                                    onClick={() => {
                                      setSemanticSearchTerm(syn.word);
                                      handleSemanticSearch();
                                    }}
                                >
                                  <ListItemText
                                      primary={syn.word}
                                      secondary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Chip
                                              label={`${(syn.similarity * 100).toFixed(0)}% similar`}
                                              size="small"
                                              color="success"
                                              variant="outlined"
                                          />
                                        </Box>
                                      }
                                  />
                                </ListItem>
                            ))}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                )}

                {/* Antônimos */}
                {semanticNetwork.antonyms && semanticNetwork.antonyms.length > 0 && (
                    <Grid item xs={12} md={4}>
                      <Card sx={{ height: '100%' }}>
                        <CardHeader
                            avatar={<Badge badgeContent={semanticNetwork.antonyms.length} color="error">
                              <PsychologyIcon color="error" />
                            </Badge>}
                            title="Antônimos"
                            subheader="Palavras com significados opostos"
                        />
                        <CardContent>
                          <List dense>
                            {semanticNetwork.antonyms.map((ant, index) => (
                                <ListItem
                                    key={index}
                                    button
                                    onClick={() => {
                                      setSemanticSearchTerm(ant.word);
                                      handleSemanticSearch();
                                    }}
                                >
                                  <ListItemText
                                      primary={ant.word}
                                      secondary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Chip
                                              label={`${(ant.similarity * 100).toFixed(0)}% opposite`}
                                              size="small"
                                              color="error"
                                              variant="outlined"
                                          />
                                        </Box>
                                      }
                                  />
                                </ListItem>
                            ))}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                )}

                {/* Palavras Relacionadas */}
                {semanticNetwork.relatedWords && semanticNetwork.relatedWords.length > 0 && (
                    <Grid item xs={12} md={4}>
                      <Card sx={{ height: '100%' }}>
                        <CardHeader
                            avatar={<Badge badgeContent={semanticNetwork.relatedWords.length} color="info">
                              <NetworkIcon color="info" />
                            </Badge>}
                            title="Palavras Relacionadas"
                            subheader="Conexões semânticas e de domínio"
                        />
                        <CardContent>
                          <List dense>
                            {semanticNetwork.relatedWords.map((rel, index) => (
                                <ListItem
                                    key={index}
                                    button
                                    onClick={() => {
                                      setSemanticSearchTerm(rel.word);
                                      handleSemanticSearch();
                                    }}
                                >
                                  <ListItemText
                                      primary={rel.word}
                                      secondary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Chip
                                              label={rel.relation}
                                              size="small"
                                              color="info"
                                              variant="outlined"
                                          />
                                          <Chip
                                              label={`${(rel.similarity * 100).toFixed(0)}%`}
                                              size="small"
                                              variant="filled"
                                          />
                                        </Box>
                                      }
                                  />
                                </ListItem>
                            ))}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                )}

                {/* Cognatos */}
                {semanticNetwork.cognates && semanticNetwork.cognates.length > 0 && (
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardHeader
                            avatar={<LanguageIcon color="warning" />}
                            title="Cognatos"
                            subheader="Palavras relacionadas em outras línguas"
                        />
                        <CardContent>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {semanticNetwork.cognates.map((cognate, index) => (
                                <Tooltip key={index} title="Palavra relacionada em outra língua">
                                  <Chip
                                      label={cognate}
                                      color="warning"
                                      variant="outlined"
                                      size="medium"
                                  />
                                </Tooltip>
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                )}

                {/* Conexões Linguísticas */}
                {semanticNetwork.connections && semanticNetwork.connections.length > 0 && (
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardHeader
                            avatar={<LanguageIcon color="secondary" />}
                            title="Conexões Linguísticas"
                            subheader="Formas em diferentes idiomas"
                        />
                        <CardContent>
                          <List dense>
                            {semanticNetwork.connections.map((conn, index) => (
                                <ListItem key={index}>
                                  <ListItemText
                                      primary={`${conn.language}: ${conn.form}`}
                                      secondary={conn.meaning}
                                  />
                                </ListItem>
                            ))}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                )}
              </Grid>
          )}

          {/* Mensagem inicial */}
          {!semanticNetwork && !semanticError && !isSemanticLoading && (
              <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  🌐 Explore a rede semântica de uma palavra
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Digite uma palavra no campo acima para descobrir suas conexões linguísticas,<br/>
                  etimologia, família de palavras e relações semânticas usando dados interligados.
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                  {['computer', 'happy', 'democracy', 'telephone'].map((word) => (
                      <Button
                          key={word}
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setSemanticSearchTerm(word);
                            handleSemanticSearch();
                          }}
                      >
                        Explorar "{word}"
                      </Button>
                  ))}
                </Box>
              </Paper>
          )}
        </Box>
      </Container>
  );

  return (
      <ThemeProvider theme={darkTheme}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <CssBaseline />

          <AppBar position="fixed">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                English For All Time
              </Typography>

              {userIsAdmin && (
                  <Chip
                      icon={<AdminIcon />}
                      label="ADMIN"
                      size="small"
                      color="secondary"
                      sx={{ mr: 2, fontWeight: 'bold' }}
                  />
              )}

              <IconButton
                  color="inherit"
                  onClick={handleProfileClick}
                  aria-controls="profile-menu"
                  aria-haspopup="true"
              >
                <AccountCircleIcon />
              </IconButton>
            </Toolbar>
          </AppBar>

          <Menu
              id="profile-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem sx={{ pointerEvents: 'none' }}>
              <Typography variant="body2" color="text.secondary">
                {user?.email || 'Usuário'}
              </Typography>
              {userIsAdmin && (
                  <Chip
                      label="ADMIN"
                      size="small"
                      color="secondary"
                      sx={{ ml: 1, fontSize: '0.7rem' }}
                  />
              )}
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleClose}>
              <Settings fontSize="small" sx={{ mr: 1 }} />
              Configurações
            </MenuItem>
            <MenuItem onClick={handleLogoutClick}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Sair
            </MenuItem>
          </Menu>

          <Dialog
              open={logoutDialogOpen}
              onClose={() => setLogoutDialogOpen(false)}
          >
            <DialogTitle>Confirmar Saída</DialogTitle>
            <DialogContent>
              <Typography>
                Tem certeza que deseja sair do sistema?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                  onClick={() => setLogoutDialogOpen(false)}
                  color="primary"
              >
                Cancelar
              </Button>
              <Button
                  onClick={handleLogoutConfirm}
                  color="error"
                  variant="contained"
              >
                Sair
              </Button>
            </DialogActions>
          </Dialog>

          {userIsAdmin && (
              <CourseFormModal
                  open={courseModalOpen}
                  onClose={handleCloseCourseModal}
                  onCourseCreated={handleCourseCreated}
              />
          )}

          <Snackbar
              open={snackbarOpen}
              autoHideDuration={4000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <MuiAlert
                onClose={handleCloseSnackbar}
                severity={snackbarMessage.includes('Apenas') ? "warning" : "success"}
                sx={{ width: '100%' }}
            >
              {snackbarMessage}
            </MuiAlert>
          </Snackbar>

          <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab
                    icon={<DashboardIcon />}
                    label="Dashboard"
                    iconPosition="start"
                />
                <Tab
                    icon={<SchoolIcon />}
                    label="Catálogo de Cursos"
                    iconPosition="start"
                />
                <Tab
                    icon={<DictionaryIcon />}
                    label="Dicionário"
                    iconPosition="start"
                />
                <Tab
                    icon={<NetworkIcon />}
                    label="Rede Semântica"
                    iconPosition="start"
                />
              </Tabs>
            </Box>

            {activeTab === 0 && renderDashboard()}
            {activeTab === 1 && <CourseList />}
            {activeTab === 2 && renderDictionary()}
            {activeTab === 3 && renderSemanticNetwork()}

            {userIsAdmin && (
                <Fab
                    color="primary"
                    aria-label="criar curso"
                    onClick={handleOpenCourseModal}
                    sx={{
                      position: 'fixed',
                      bottom: 24,
                      right: 24,
                      display: { xs: 'flex', sm: 'none' }
                    }}
                >
                  <AddIcon />
                </Fab>
            )}
          </Box>
        </Box>
      </ThemeProvider>
  );
}

export default Home;
