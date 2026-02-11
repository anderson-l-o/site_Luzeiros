# Instruções AI para Codebase Aventureiros

## Visão Geral do Projeto
**Aventureiros** é uma aplicação web full-stack de rastreamento de conquistas para um clube ("Clube dos Luzeiros"). Inclui autenticação de usuários com controle de acesso baseado em funções, gerenciamento de conquistas e dashboard administrativo.

**Stack**: Backend Node.js/Express, Frontend React/Vite, Banco de dados MySQL (ORM Sequelize), autenticação JWT, styled-components para UI.

## Arquitetura & Fluxo de Dados

### Estrutura Backend (`backend/src/`)
- **`server.js`**: Ponto de entrada da app Express; inicialização das rotas acontece aqui
- **`init.js`**: Lógica de retry da conexão ao banco (30 tentativas, 2s de atraso) e seeding na inicialização
- **`sequelize.js`**: Inicialização ORM e **definições de modelos inline** (User, AchievementType, Achievement, UserAchievement)
  - Modelos definidos como `sequelize.define()` neste arquivo único, não em arquivos separados
  - User possui roles: `member` | `admin`; timestamps rastreados automaticamente
- **`routes/`**: Endpoints RESTful (auth, users, achievements, achievement-types)
  - Cada arquivo de rota importa modelos diretamente de `sequelize.js`
  - **users.js**: CRUD completo de usuários com validação CPF, alteração de senha, proteção admin
- **`middlewares/auth.js`**: Verificação JWT (`requireAuth`) e validação de admin (`requireAdmin`)
- **`services/authService.js`**: Utilitários de hash de senha (bcryptjs) e criação de token JWT

### Estrutura Frontend (`frontend/src/`)
- **`App.jsx`**: Definições de rotas com wrapper `Protected` para controle de acesso baseado em funções (rotas admin-only)
- **`auth/context.jsx`**: AuthProvider + hook `useAuth()`; gerencia estado do usuário e login/register via API
- **`lib/api.js`**: Instância Axios com injeção automática de JWT no header Authorization
- **`pages/`**: Componentes de rotas de topo (Home, Login, Conquistas, Admin, CadastroUsuario, Perfil, ForgotPassword, ResetPassword)
- **`styles/`**: Tema styled-components + estilos de componentes (theme.js, GlobalStyles.jsx)

### Fluxos de Dados Críticos
1. **Fluxo de Auth**: Login (POST `/api/auth/login`) → backend retorna token + dados do usuário → frontend armazena ambos em localStorage → interceptor axios adiciona token Bearer automaticamente em todas as requisições
2. **Rotas Protegidas**: Componente `Protected` do frontend verifica `user` do contexto; middleware `requireAuth`/`requireAdmin` do backend valida JWT
3. **Inicialização BD**: Na inicialização do backend, `init.js` tenta conectar ao BD, sincroniza modelos, executa seeders (cria usuário admin + tipos de conquistas)

## Fluxos de Trabalho de Desenvolvimento

### Configuração Local Docker-Compose
```bash
# Do diretório raiz do projeto
docker-compose up --build
# Serviços iniciam automaticamente com hot-reload:
# - Frontend: http://localhost:3000 (Vite via :5173 internamente)
# - Backend: http://localhost:5000/api (nodemon watch)
# - MySQL: localhost:3306 (root/root)
# - API Docs: http://localhost:5000/api/docs (Swagger)
```
**Nota**: Variáveis de ambiente são injetadas em `docker-compose.yml`; frontend usa `VITE_API_URL`.

### Seeding do Banco de Dados
```bash
# No container backend ou localmente após npm install:
npm run seed:run
# Cria admin (admin@aventureiros.com / 123456) e tipos de conquista padrão
```

### Pontos de Debug
- **Erros de autenticação**: Verifique consistência de `process.env.JWT_SECRET` entre server.js e rotas
- **Falha de conexão ao BD**: Backend tenta 30× com 2s de atraso; verifique logs do container MySQL
- **Problemas de CORS**: server.js ativa `cors()` globalmente; verifique variável env `VITE_API_URL` do frontend
- **Docs Swagger**: Carregados de `backend/src/docs/swagger.yaml`; deve ser YAML válido

## Padrões & Convenções Principais

### Padrão de Definição de Modelos
Todos os modelos definidos inline em `sequelize.js` usando `sequelize.define()`:
```javascript
// Modelo User inclui: id (UUID), name, email, passwordHash, role, cpf, nickname, phone
// Timestamps automáticos (createdAt, updatedAt)
const User = sequelize.define("User", { ... }, { tableName: "users", timestamps: true });
```
- Adicionar novo modelo? Defina em `sequelize.js` e exporte
- Atualizar schema? Sequelize `{ alter: true }` em `init.js` faz migração automática; **sem arquivos de migration separados**

### Padrão de Rotas
Rotas desestrutu ram modelos de `sequelize.js` e usam handlers async:
```javascript
import { User, Achievement } from "../sequelize.js";
router.get("/:id", async (req, res) => {
  const record = await User.findByPk(req.params.id);
  res.json(record);
});
```

### Padrão JWT & Auth
- **Criação de token**: `createToken(user, secret, expiresIn="8h")` retorna JWT assinado com id, name, email, role
- **Verificação**: Middleware `requireAuth` extrai token Bearer, verifica, define `req.user`
- **Validação admin**: Middleware `requireAdmin` garante `req.user.role === "admin"`
- Use ambos os middlewares em endpoints protegidos: `router.post("/", requireAuth, requireAdmin, handler)`

### Padrão API Frontend
- Todas as requisições via instância axios compartilhada `api` (injeta JWT automaticamente)
- Falhas de API NÃO são envolvidas em try-catch por padrão; **deixe componente tratar erros ou use .catch()**
- Exemplo: `api.post("/auth/login", {...}).catch(err => setError(err.response.data.error))`

### Padrão de Estilos
- **Styled-components** com tema centralizado (`styles/theme.js`)
- Estilos de componentes em `styles/components/` como arquivos .js (Button.js, Card.js, etc.)
- Use cores do tema via padrão `${props => props.theme.primaryColor}`

### Padrão de Perfil de Usuário
- **Página de Perfil**: Componente `Perfil.jsx` com abas para dados pessoais e alteração de senha
- **Validação Frontend**: Confirmação de senha, mínimo 8 caracteres, campos obrigatórios
- **Proteção**: Apenas usuários logados podem acessar seu próprio perfil
- **Endpoints**: PUT `/users/:id` (atualizar perfil), PUT `/users/:id/password` (alterar senha)
- **Validação Backend**: CPF único, senha atual obrigatória para alteração, sanitização de dados

## Comandos Essenciais

| Tarefa | Comando |
|--------|---------|
| Iniciar todos os serviços | `docker-compose up --build` (do diretório raiz) |
| Apenas backend (local) | `cd backend && npm install && npm run dev` |
| Apenas frontend (local) | `cd frontend && npm install && npm run dev` |
| Seed do banco de dados | `npm run seed:run` (no backend) |
| Build do frontend | `cd frontend && npm run build` |
| Ver API docs | http://localhost:5000/api/docs (Swagger) |

## Armadilhas Comuns & Dicas

1. **JWT Secret**: Deve corresponder ao `process.env.JWT_SECRET` entre server.js e todos os arquivos de rota; Docker usa `change_this_secret` por padrão (inseguro para produção)
2. **Exportação de Modelos Sequelize**: Sempre verifique que modelos são exportados de `sequelize.js`; rotas não funcionarão se imports falharem silenciosamente
3. **Handlers de Rotas Async**: Todas as rotas backend usam `async`; sempre `await` operações de BD ou use `.catch()` para cadeias de promise
4. **Verificações de Auth Frontend**: Componente `Protected` verifica localStorage na montagem; **recarregue a página para pegar mudanças de auth**
5. **CORS & Portas**: Frontend Vite roda em 5173 internamente mas mapeia para 3000 no Docker; API backend é sempre :5000/api
6. **Lógica de Retry do BD**: Backend tenta 30× antes de falhar; logs de inicialização mostram mensagens "DB connect attempt X failed"—normal durante inicialização Docker
7. **Erros de Seeding**: Se o seeding falha (ex: admin já existe), a app continua; verifique `backend/seeders/seed-admin-and-types.js` para tratamento de duplicatas

## Mapa de Referência de Arquivos

- **Core de BD & Auth**: `backend/src/sequelize.js`, `backend/src/services/authService.js`
- **Handlers de Rotas**: `backend/src/routes/{auth,users,achievements,achievementTypes}.js`
- **Estado Frontend**: `frontend/src/auth/context.jsx`, `frontend/src/lib/api.js`
- **UI Protegida**: `frontend/src/App.jsx` (wrapper Protected), `frontend/src/pages/{Admin,CadastroUsuario,Perfil}.jsx`
- **Padrões de Estilos**: `frontend/src/styles/theme.js`, `frontend/src/styles/GlobalStyles.jsx`
- **Config Docker**: `docker-compose.yml` (serviços & variáveis env)
- **Seeds**: `backend/seeders/seed-admin-and-types.js`, `run-seeders.js`
