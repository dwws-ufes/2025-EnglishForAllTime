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
  CircularProgress
} from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  TrendingUp as TrendingUpIcon,
  LibraryBooks as LibraryBooksIcon,
  Dashboard as DashboardIcon,
  School as SchoolIcon, Settings
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import CourseFormModal from '../components/course/CourseFormModal';
import CourseList from '../components/course/CourseList';

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
              </Tabs>
            </Box>

            {activeTab === 0 && renderDashboard()}
            {activeTab === 1 && <CourseList />}

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