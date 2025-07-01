# English For All Time - Sistema de Cursos de Inglês

Sistema web para ensino de inglês, desenvolvido com Spring Boot (backend) e React (frontend).

## Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- **Java 21** ou superior
- **Node.js 18** ou superior
- **PostgreSQL 14** ou superior
- **Maven 3.8** ou superior (ou use o wrapper incluído)
- **Git**

## Arquitetura do Sistema

```
website/
├── backend/          # API REST Spring Boot
│   ├── src/
│   ├── pom.xml
│   └── mvnw
└── frontend/         # Interface React
    ├── src/
    ├── package.json
    └── public/
```

## Configuração e Implantação

### 1. Clonando o Repositório

```bash
git clone https://github.com/dwws-ufes/2025-EnglishForAllTime.git
cd website
```

### 2. Configuração do Banco de Dados

#### Instalação do PostgreSQL

1. Baixe e instale o PostgreSQL em: https://www.postgresql.org/download/
2. Durante a instalação, defina uma senha para o usuário `postgres`

#### Criação do Banco de Dados

```sql
-- Conecte-se ao PostgreSQL como superusuário
CREATE DATABASE englishforalltime;
CREATE USER labes WITH PASSWORD 'labes';
GRANT ALL PRIVILEGES ON DATABASE englishforalltime TO labes;
```

### 3. Configuração do Backend (Spring Boot)

#### Navegue para a pasta do backend

```bash
cd backend
```

#### Configure as variáveis de ambiente (opcional)

```bash
# Windows (PowerShell)
$env:JWT_SECRET="seu-secret-jwt-aqui-deve-ser-muito-seguro"

# Linux/Mac
export JWT_SECRET="seu-secret-jwt-aqui-deve-ser-muito-seguro"
```

#### Configuração do `application.properties`

O arquivo já está configurado com as seguintes configurações padrão:

- **Porta:** 8080
- **Banco:** PostgreSQL (localhost:5432/englishforalltime)
- **Usuário:** labes
- **Senha:** labes

#### Compilação e execução

```bash
# Maven instalado
mvn clean install
mvn spring-boot:run
```

O backend estará disponível em: `http://localhost:8080`

### 4. Configuração do Frontend (React)

#### Navegue para a pasta do frontend

```bash
cd ../frontend
```

#### Instale as dependências

```bash
npm install
```

#### Configure a URL da API (se necessário)

O frontend está configurado para conectar com o backend em `http://localhost:8080/api`.

#### Execute o frontend

```bash
npm start
```

O frontend estará disponível em: `http://localhost:3000`

## Tecnologias Principais

### Backend

- **Spring Boot 3.5.0** - Framework principal
- **Spring Security** - Autenticação e autorização
- **Spring Data JPA** - Persistência de dados
- **PostgreSQL** - Banco de dados
- **JWT (Auth0)** - Tokens de autenticação
- **Lombok** - Redução de boilerplate
- **Java 21** - Linguagem

### Frontend

- **React 19.1.0** - Interface de usuário
- **Material-UI 7.1.2** - Componentes visuais
- **React Router 7.6.2** - Roteamento
- **Axios 1.10.0** - Cliente HTTP
- **React Testing Library** - Testes

## Funcionalidades

- Autenticação de usuários (login/registro)
- Gerenciamento de cursos
- Controle de acesso por roles (USER/ADMIN)
- Interface responsiva
- API RESTful
- Persistência de dados

## Scripts de Desenvolvimento

### Backend

```bash
# Executar aplicação
mvn spring-boot:run
```

### Frontend

```bash
# Modo desenvolvimento
npm start
```

## Segurança

- As senhas são criptografadas com BCrypt
- Autenticação baseada em JWT
- CORS configurado para desenvolvimento
- Validação de entrada de dados
- Controle de acesso baseado em roles

## Troubleshooting

### Problemas Comuns

**1. Erro de conexão com banco de dados**

- Verifique se o PostgreSQL está rodando
- Confirme as credenciais em `application.properties`
- Certifique-se de que o banco `englishforalltime` existe

**2. CORS errors no frontend**

- Verifique se o backend está rodando na porta 8080
- Confirme a configuração de CORS no Spring Boot

**3. Erro de dependências no frontend**

- Delete `node_modules` e `package-lock.json`
- Execute `npm install` novamente

**4. Problemas com JWT**

- Configure a variável de ambiente `JWT_SECRET`
- Verifique se o token não expirou

## Suporte

Para questões técnicas ou problemas de implantação, consulte:

1. Logs do backend: console da aplicação Spring Boot
2. Logs do frontend: console do navegador (F12)
3. Logs do banco: logs do PostgreSQL

## Notas de Versão

- **v0.0.1** - Versão inicial com autenticação, CRUD de cursos e funcionalidade não CRUD de Sort de cursos.

---