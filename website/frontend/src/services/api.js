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
          dataLength: Array.isArray(response.data) ? response.data.length : 'not array',
          hasData: !!response.data,
          dataKeys: response.data && typeof response.data === 'object' ? Object.keys(response.data) : 'not object'
        });
        console.log('📄 [API] Dados completos recebidos:', response.data);
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

// Função principal do dicionário - CORRIGIDA para usar a rota correta
export const getWordDetails = async (word) => {
  try {
    if (DEBUG) {
      console.log('🔍 [DICTIONARY] Iniciando busca para palavra:', word);
    }

    if (!word || !word.trim()) {
      throw new Error('Palavra não pode estar vazia');
    }

    // CORRIGIDO: Usando a rota correta do DictionaryController (/api/dictionary/{word})
    const response = await api.get(`/dictionary/${encodeURIComponent(word.trim())}`);

    if (DEBUG) {
      console.log('✅ [DICTIONARY] Resposta completa recebida:', {
        status: response.status,
        data: response.data,
        dataType: typeof response.data,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : 'no data'
      });
    }

    // Verificar se os dados foram recebidos corretamente
    if (!response.data) {
      throw new Error('Nenhum dado foi retornado pela API');
    }

    return response.data;
  } catch (error) {
    if (DEBUG) {
      console.error('❌ [DICTIONARY] Erro na busca:', {
        word,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
        responseReceived: !!error.response
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

// Nova função para usar o endpoint de aninhamento do SemanticController
export const getWordDetailsWithNesting = async (word) => {
  try {
    if (DEBUG) {
      console.log('🔗 [SEMANTIC] Iniciando busca com aninhamento para palavra:', word);
    }

    if (!word || !word.trim()) {
      throw new Error('Palavra não pode estar vazia');
    }

    // Usando o novo endpoint de aninhamento
    const response = await api.get(`/semantic/word/${encodeURIComponent(word.trim())}/nested`);

    if (DEBUG) {
      console.log('✅ [SEMANTIC] NestedWordDetailsDTO recebido:', response.data);
    }

    return response.data;
  } catch (error) {
    if (DEBUG) {
      console.error('❌ [SEMANTIC] Erro na busca com aninhamento:', {
        word,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
    }

    if (error.response?.status === 404) {
      throw new Error(`Palavra "${word}" não encontrada no dicionário`);
    } else {
      throw new Error(error.response?.data?.message || 'Erro ao buscar palavra com aninhamento');
    }
  }
};

// NOVA FUNCIONALIDADE: Rede Semântica de Palavras
export const getSemanticNetwork = async (word) => {
  try {
    if (DEBUG) {
      console.log('🌐 [SEMANTIC NETWORK] Iniciando busca pela rede semântica da palavra:', word);
    }

    if (!word || !word.trim()) {
      throw new Error('Palavra não pode estar vazia');
    }

    const response = await api.get(`/semantic/semantic-network/${encodeURIComponent(word.trim())}`);

    if (DEBUG) {
      console.log('✅ [SEMANTIC NETWORK] Rede semântica recebida:', response.data);
    }

    return response.data;
  } catch (error) {
    if (DEBUG) {
      console.error('❌ [SEMANTIC NETWORK] Erro na busca pela rede semântica:', {
        word,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
    }

    if (error.response?.status === 404) {
      throw new Error(`Rede semântica para a palavra "${word}" não encontrada`);
    } else {
      throw new Error(error.response?.data?.message || 'Erro ao buscar rede semântica');
    }
  }
};

// REMOVIDO: Funções de favoritos que não existem no backend
// Estas funções foram comentadas até serem implementadas no backend:
/*
export const saveWordToFavorites = async (wordData) => {
  // TODO: Implementar no backend primeiro
};

export const getSavedWords = async () => {
  // TODO: Implementar no backend primeiro
};
*/

// Manter compatibilidade com código existente
export const searchWord = getWordDetails;

// API do dicionário com funcionalidades disponíveis
export const dictionaryApi = {
  // Busca pública (sem autenticação) - rota corrigida
  getWordDetails,
  searchWord: getWordDetails,

  // Nova funcionalidade de aninhamento
  getWordDetailsWithNesting,

  // FUTURAS funcionalidades (precisam ser implementadas no backend):
  /*
  saveWordToFavorites,
  getSavedWords,
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
  */
};

// Exportações para outras funcionalidades da aplicação (estas estão corretas)
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
