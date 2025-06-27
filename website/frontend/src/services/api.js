import axios from 'axios';
import { DEBUG } from '../util/debug';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use((config) => {
  if (DEBUG) {
    console.log('🚀 [API] Requisição saindo:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`
    });
  }
  
  // Só adicionar token se não for rota de login/register
  const isAuthRoute = config.url?.includes('/auth/login') || 
                     config.url?.includes('/auth/register');
  
  if (!isAuthRoute) {
    const token = localStorage.getItem('@EnglishForAllTime:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 [API] Token adicionado à requisição');
    } else {
      console.log('⚠️ [API] Nenhum token encontrado no localStorage');
    }
  } else {
    console.log('🔓 [API] Rota de auth - não enviando token');
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('✅ [API] Resposta recebida:', {
      status: response.status,
      url: response.config.url,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      dataLength: response.data?.length
    });
    return response;
  },
  async (error) => {
    console.error('❌ [API] Erro na resposta:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('@EnglishForAllTime:token');
      // Só redirecionar se não for rota de login
      if (!error.config?.url?.includes('/auth/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;