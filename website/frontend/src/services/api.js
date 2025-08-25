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
      config.url?.includes('/auth/register') ||
      config.url?.includes('/dictionary');  // Dictionary pode não precisar de auth

  if (!isAuthRoute) {
    const token = localStorage.getItem('@EnglishForAllTime:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (DEBUG) console.log('🔑 [API] Token adicionado à requisição');
    } else {
      if (DEBUG) console.log('⚠️ [API] Nenhum token encontrado no localStorage');
    }
  } else {
    if (DEBUG) console.log('🔓 [API] Rota pública - não enviando token');
  }

  return config;
});

api.interceptors.response.use(
    (response) => {
      if (DEBUG) {
        console.log('✅ [API] Resposta recebida:', {
          status: response.status,
          url: response.config.url,
          dataType: typeof response.data,
          isArray: Array.isArray(response.data),
          dataLength: response.data?.length
        });
      }
      return response;
    },
    async (error) => {
      if (DEBUG) {
        console.error('❌ [API] Erro na resposta:', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data
        });
      }

      if (error.response?.status === 401) {
        localStorage.removeItem('@EnglishForAllTime:token');
        // Só redirecionar se não for rota de login ou dictionary
        const isPublicRoute = error.config?.url?.includes('/auth/login') ||
            error.config?.url?.includes('/dictionary');
        if (!isPublicRoute) {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
);

export default api;

// Função principal do dicionário - alinhada com DictionaryController.java
export const getWordDetails = async (word) => {
  try {
    if (DEBUG) {
      console.log('🔍 [DICTIONARY] Iniciando busca para palavra:', word);
    }

    // Endpoint alinhado com DictionaryController
    const response = await api.get(`/dictionary/${encodeURIComponent(word.trim())}`);

    if (DEBUG) {
      console.log('✅ [DICTIONARY] WordDetailsDTO recebido:', response.data);
    }

    return response.data; // Retorna WordDetailsDTO
  } catch (error) {
    if (DEBUG) {
      console.error('❌ [DICTIONARY] Erro na busca:', error);
    }

    // Tratamento específico de erros baseado no backend Spring Boot
    if (error.response?.status === 404) {
      throw new Error('Palavra não encontrada no dicionário');
    } else if (error.response?.status === 400) {
      throw new Error('Palavra inválida. Verifique a ortografia');
    } else if (error.response?.status === 500) {
      throw new Error('Erro interno do servidor. Tente novamente');
    } else if (error.response?.status === 503) {
      throw new Error('Serviço indisponível. Tente novamente mais tarde');
    } else {
      throw new Error(error.response?.data?.message || 'Erro ao buscar palavra no dicionário');
    }
  }
};

// Manter compatibilidade com código existente
export const searchWord = getWordDetails;

// Exportações adicionais para futuras funcionalidades do dicionário
export const dictionaryApi = {
  getWordDetails,
  searchWord: getWordDetails,

  // Futuras funcionalidades baseadas no backend
  searchByCategory: async (category) => {
    const response = await api.get(`/dictionary/category/${category}`);
    return response.data;
  },

  getWordHistory: async () => {
    const response = await api.get('/dictionary/history');
    return response.data;
  }
};