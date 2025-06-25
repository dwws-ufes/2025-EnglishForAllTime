import React, { useState } from 'react';
import {
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
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
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  Add as AddIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CourseFormModal from '../components/admin/course/CourseFormModal';

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

const drawerWidth = 240;

function Home() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { user, signOut, isAdmin } = useAuth(); // Adicionar isAdmin
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Verificar se é admin
  const userIsAdmin = isAdmin();

  // Substituir as duas funções handleDrawerOpen e handleDrawerClose por uma única função toggle
  const handleDrawerToggle = () => {
    setOpen(!open); // Alterna entre true e false
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
    setSnackbarMessage(`Curso "${newCourse.title}" criado com sucesso!`);
    setSnackbarOpen(true);
    // Aqui você pode atualizar uma lista de cursos se necessário
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      onClick: () => navigate('/dashboard')
    },
    {
      text: 'Cursos',
      icon: <SchoolIcon />,
      onClick: () => navigate('/courses')
    },
  ];

  // Adicionar item de menu admin apenas para administradores
  if (userIsAdmin) {
    menuItems.push({
      text: 'Administração',
      icon: <AdminIcon />,
      onClick: () => navigate('/admin')
    });
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="abrir menu"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              English For All Time
            </Typography>
            
            {/* Mostrar chip de ADMIN se for administrador */}
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

        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          variant="persistent"
          anchor="left"
          open={open}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              padding: '8px',
            }}
          >
            <IconButton onClick={handleDrawerToggle}>
              <ChevronLeftIcon />
            </IconButton>
          </Box>
          <Divider />
          <List>
            {menuItems.map((item) => (
              <ListItem 
                key={item.text} 
                disablePadding 
                sx={{ display: 'block' }}
                onClick={item.onClick}
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: 'initial',
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: 3,
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>

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
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Configurações
          </MenuItem>
          <MenuItem onClick={handleLogoutClick}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
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

        {/* Modal de Criação de Curso - Renderizar apenas se for ADMIN */}
        {userIsAdmin && (
          <CourseFormModal
            open={courseModalOpen}
            onClose={handleCloseCourseModal}
            onCourseCreated={handleCourseCreated}
          />
        )}

        {/* Snackbar para notificações */}
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

        <Box component="main" sx={{ flexGrow: 1, p: 3, marginLeft: open ? `${drawerWidth}px` : 0, transition: 'margin 0.2s' }}>
          <Toolbar />
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
                  
                  {/* Botão "Criar Curso" apenas para ADMINs */}
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
                { title: 'Cursos Criados', value: '5', adminOnly: true },
                { title: userIsAdmin ? 'Usuários Ativos' : 'Cursos Concluídos', value: userIsAdmin ? '127' : '3' },
                { title: userIsAdmin ? 'Cursos Ativos' : 'Certificados', value: userIsAdmin ? '12' : '2' },
                { title: userIsAdmin ? 'Receita Total' : 'Horas Estudadas', value: userIsAdmin ? 'R$ 2.450' : '45h' },
              ].map((stat) => {
                // Não mostrar estatísticas específicas de admin para usuários comuns
                if (stat.adminOnly && !userIsAdmin) return null;
                
                return (
                  <Grid item xs={12} sm={6} md={3} key={stat.title}>
                    <Paper
                      sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        height: 140,
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4
                        }
                      }}
                    >
                      <Typography variant="h4" component="div">
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.title}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}

              {/* Seção de Cursos Recentes */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    {userIsAdmin ? 'Cursos Gerenciados' : 'Meus Cursos'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {userIsAdmin 
                      ? 'Aqui aparecerão os cursos que você criou e gerencia...'
                      : 'Aqui aparecerão os cursos em que você está matriculado...'
                    }
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Container>

          {/* Floating Action Button para criar curso apenas para ADMINs */}
          {userIsAdmin && (
            <Fab
              color="primary"
              aria-label="criar curso"
              onClick={handleOpenCourseModal}
              sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                display: { xs: 'flex', sm: 'none' } // Mostrar apenas em telas pequenas
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