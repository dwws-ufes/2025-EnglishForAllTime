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

  // Rotas que NÃO precisam de autenticação (públicas)
  const isPublicRoute = config.url?.includes('/auth/login') ||
      config.url?.includes('/auth/register') ||
      config.url?.includes('/dictionary/');  // Todas as rotas do dicionário são públicas

  if (!isPublicRoute) {
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

        // Só redirecionar se não for rota pública
        const isPublicRoute = error.config?.url?.includes('/auth/') ||
            error.config?.url?.includes('/dictionary/');

        if (!isPublicRoute) {
          console.log('🔄 [API] Redirecionando para login devido ao 401');
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
);

export default api;

// Função principal do dicionário
export const getWordDetails = async (word) => {
  try {
    if (DEBUG) {
      console.log('🔍 [DICTIONARY] Iniciando busca para palavra:', word);
    }

    if (!word || !word.trim()) {
      throw new Error('Palavra não pode estar vazia');
    }

    // Endpoint correto baseado no DictionaryController
    const response = await api.get(`/semantic/word/${encodeURIComponent(word.trim())}`);

    if (DEBUG) {
      console.log('✅ [DICTIONARY] WordDetailsDTO recebido:', response.data);
    }

    return response.data;
  } catch (error) {
    if (DEBUG) {
      console.error('❌ [DICTIONARY] Erro na busca:', {
        word,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
    }

    // Tratamento específico de erros baseado no backend Spring Boot
    if (error.response?.status === 404) {
      throw new Error(`Palavra "${word}" não encontrada no dicionário`);
    } else if (error.response?.status === 400) {
      throw new Error('Palavra inválida. Verifique a ortografia');
    } else if (error.response?.status === 500) {
      throw new Error('Erro interno do servidor. Tente novamente');
    } else if (error.response?.status === 503) {
      throw new Error('Serviço indisponível. Tente novamente mais tarde');
    } else if (error.response?.status === 403) {
      throw new Error('Acesso negado ao serviço de dicionário');
    } else {
      throw new Error(error.response?.data?.message || 'Erro ao buscar palavra no dicionário');
    }
  }
};

// Função para salvar palavras favoritas (requer autenticação)
export const saveWordToFavorites = async (wordData) => {
  try {
    if (DEBUG) {
      console.log('💾 [DICTIONARY] Salvando palavra nos favoritos:', wordData);
    }

    const response = await api.post('/dictionary/save', wordData);

    if (DEBUG) {
      console.log('✅ [DICTIONARY] Palavra salva com sucesso');
    }

    return response.data;
  } catch (error) {
    if (DEBUG) {
      console.error('❌ [DICTIONARY] Erro ao salvar palavra:', error);
    }
    throw error;
  }
};

// Função para buscar palavras salvas (requer autenticação)
export const getSavedWords = async () => {
  try {
    if (DEBUG) {
      console.log('📚 [DICTIONARY] Buscando palavras salvas');
    }

    const response = await api.get('/dictionary/saved');

    if (DEBUG) {
      console.log('✅ [DICTIONARY] Palavras salvas recebidas:', response.data);
    }

    return response.data;
  } catch (error) {
    if (DEBUG) {
      console.error('❌ [DICTIONARY] Erro ao buscar palavras salvas:', error);
    }
    throw error;
  }
};

// Manter compatibilidade com código existente
export const searchWord = getWordDetails;

// API do dicionário com todas as funcionalidades
export const dictionaryApi = {
  // Busca pública (sem autenticação)
  getWordDetails,
  searchWord: getWordDetails,

  // Funcionalidades que requerem autenticação
  saveWordToFavorites,
  getSavedWords,

  // Futuras funcionalidades
  searchByCategory: async (category) => {
    const response = await api.get(`/dictionary/category/${category}`);
    return response.data;
  },

  getWordHistory: async () => {
    const response = await api.get('/dictionary/history');
    return response.data;
  },

  deleteFromFavorites: async (wordId) => {
    const response = await api.delete(`/dictionary/saved/${wordId}`);
    return response.data;
  }
};

// Exportações adicionais para outras funcionalidades da aplicação
export const courseApi = {
  getCourses: async () => {
    const response = await api.get('/courses');
    return response.data;
  },

  createCourse: async (courseData) => {
    const response = await api.post('/courses', courseData);
    return response.data;
  },

  updateCourse: async (id, courseData) => {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data;
  },

  deleteCourse: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  }
};

export const authApi = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};