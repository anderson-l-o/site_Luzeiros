# Instruções AI para Codebase Aventureiros - Parte 2 (Sprint 1 Completa)

**Data:** 10 de Fevereiro de 2026  
**Status:** Sprint 1 CONCLUÍDA ✅  
**Commits:** 2b232e9 (latest)

---

## 📊 Revisão Completa do Projeto

### Progresso da Sprint 1

#### ✅ Item 1: Sistema de Autenticação (Completo)
- **Login/Register** — Funcional com validações
- **Recuperação de Senha** — ForgotPassword + ResetPassword implementados
- **Logout Seguro** — Limpeza de localStorage e contexto
- **Persistência de Sessão** — JWT armazenado em localStorage + interceptor axios
- **Arquivos:** 
  - Backend: `backend/src/routes/auth.js`, `backend/src/services/authService.js`
  - Frontend: `frontend/src/pages/Login.jsx`, `frontend/src/pages/ForgotPassword.jsx`, `frontend/src/pages/ResetPassword.jsx`
  - Auth Context: `frontend/src/auth/context.jsx`

#### ✅ Item 2: Gerenciamento de Usuários (Completo)
- **Cadastro de Usuários** — Admin pode registrar usuários (CadastroUsuario.jsx)
- **Edição de Perfil** — Usuários podem editar dados (name, email, nickname, phone, cpf)
- **Alteração de Senha** — Aba dedicada com validação de senha atual
- **Validação de CPF** — Implementada no backend (services/authService.js) com máscara no frontend
- **Arquivos:**
  - Backend: `backend/src/routes/users.js` (PUT /:id, PUT /:id/password)
  - Frontend: `frontend/src/pages/Perfil.jsx`, `frontend/src/pages/CadastroUsuario.jsx`
  - Validação: masks/CPF e regra de autenticação no middleware

#### ✅ Item 3: Sistema de Conquistas (Completo)
- **Registro de Conquistas** — POST /achievements com validação de data
- **Edição de Conquistas** — PUT /achievements/:id com permissões (owner ou admin)
- **Exclusão de Conquistas** — DELETE /achievements/:id com permissões
- **Validações de Data** — Backend + Frontend rejeitam datas futuras
- **Toasts Globais** — Sistema de feedback com ToastProvider e hook useToast
- **Estados de Loading** — Botão desabilitado enquanto salva, texto "Salvando..."
- **Testes Automatizados** — Passaram via test_achievements.js
- **Arquivos:**
  - Backend: `backend/src/routes/achievements.js`, `backend/src/routes/achievementTypes.js`
  - Frontend: `frontend/src/pages/Conquistas.jsx`
  - Toast: `frontend/src/components/ToastContext.jsx`
  - Testes: `backend/src/test_achievements.js`

#### ✅ Item 4: Dashboard/Home (Completo)
- **Estatísticas Gerais** — Total usuários, total conquistas, média por usuário
- **Conquistas Recentes** — Últimas 5 com nome do usuário e data
- **Ranking Top 10** — Classificação por pontuação total (sum de points)
- **Tela de Boas-vindas** — Exibida quando não logado
- **Dashboard** — Exibido quando logado com stats em tempo real
- **Responsivo** — Grid de cards e tabela estilizados
- **Arquivos:**
  - Backend: `backend/src/routes/stats.js` (GET /, GET /recent, GET /ranking)
  - Frontend: `frontend/src/pages/Home.jsx`
  - Estilos inline em Home.jsx (padrão do projeto)

---

## 🏗️ Arquitetura Atual

### Backend (`backend/src/`)

**Modelos Sequelize (inline em `sequelize.js`):**
- `User` — id (UUID), name, email, passwordHash, role, cpf, nickname, phone, resetToken, resetExpires, lastLogin, isActive, timestamps
- `AchievementType` — id (UUID), name, description, points, active, timestamps
- `Achievement` — id (UUID), userId (FK), achievementTypeId (FK), dateAchieved (DATEONLY), notes, timestamps

**Rotas REST:**
- `POST /auth/login` — Autenticação com JWT
- `POST /auth/register` — Registro de novo usuário
- `POST /auth/forgot-password` — Envio de token reset
- `POST /auth/reset-password` — Reset de senha com token
- `GET /auth/me` — Usuário logado (requer JWT)
- `GET /users` — Listar usuários (admin)
- `POST /users` — Criar usuário (admin)
- `GET /users/:id` — Detalhes do usuário
- `PUT /users/:id` — Atualizar perfil (owner ou admin)
- `PUT /users/:id/password` — Alterar senha
- `GET /achievement-types` — Listar tipos de conquistas
- `POST /achievement-types` — Criar tipo (admin)
- `GET /achievements` — Listar conquistas (com filtro por userId)
- `POST /achievements` — Criar conquista (validação de data)
- `PUT /achievements/:id` — Atualizar conquista (permissões)
- `DELETE /achievements/:id` — Deletar conquista (permissões)
- `GET /stats` — Estatísticas gerais
- `GET /stats/recent` — Últimas 5 conquistas
- `GET /stats/ranking` — Ranking com sum de pontos

**Middlewares:**
- `requireAuth` — Verifica JWT e carrega usuário em req.user
- `requireAdmin` — Valida role === 'admin'

**Serviços:**
- `authService.js` — hashPassword, comparePassword, createToken, validatePassword, validateCPF

### Frontend (`frontend/src/`)

**Páginas (Routes):**
- `/` — Home (boas-vindas ou dashboard)
- `/login` — Login/Register
- `/forgot-password` — Recuperação de senha
- `/reset-password` — Reset com token
- `/conquistas` — Listar, criar, editar, deletar conquistas
- `/perfil` — Editar perfil e alteração de senha
- `/cadastro-usuario` — Cadastro de usuário (admin)
- `/admin` — Página admin (protegida)

**Componentes:**
- `ToastContext.jsx` — Provider global com hook useToast()
- `Navbar.jsx` — Navegação com links baseados em role
- `LogoAventureiro.jsx`, `LogoClube.jsx` — Logos SVG

**Estilos Reutilizáveis (`styles/components/`):**
- `Section.js` — Container wrapper
- `Card.js` — Card com border e padding
- `Button.js` — Botão estilizado
- `Input.js` + `InputWrapper.js` + `Label.js` — Form inputs com labels flutuantes
- `Typography.js` — Title, Subtitle
- `ErrorMessage.js` — Mensagens de erro
- `List.js`, `ListItem.js` — Listas
- `CustomSelect.jsx` — Select customizado

**Context:**
- `AuthProvider` + `useAuth()` — Gerencia user, login, register, logout

**API:**
- `lib/api.js` — Axios instance com interceptor JWT Bearer

---

## 🔧 Principais Técnicas & Padrões

### Backend
1. **Modelos Inline** — Todos em `sequelize.js` (sem arquivos separados)
2. **Async/Await** — Todas as rotas usam async
3. **Validações Robustas** — Validação de CPF, datas, permissões
4. **Rate Limiting** — NÃO implementado (TODO Sprint 2)
5. **Sanitização** — NÃO implementado (TODO Sprint 2)
6. **Testes** — Script ESM manual (`test_achievements.js`)

### Frontend
1. **Styled-components** — Padrão: componentes reutilizáveis em `styles/components/`, estilos específicos de página inline
2. **Floating Labels** — Padrão InputWrapper + Label com focus state
3. **Toast System** — Global via Context, não usando alerts
4. **Loading States** — Botões desabilitados + texto "Salvando..."
5. **Protected Routes** — Wrapper `<Protected>` no App.jsx
6. **Error Handling** — .catch() em Promise chains

---

## 📁 Estrutura de Arquivos (Atual)

```
site_Luzeiros/
├── .github/
│   ├── copilot-instructions.md (originais)
│   └── copilot-instructions_parte2.md (NOVO)
│
├── backend/
│   ├── src/
│   │   ├── init.js (retry DB, sync models, seeding)
│   │   ├── server.js (Express setup + rotas)
│   │   ├── sequelize.js (ORM + modelos inline)
│   │   ├── reset_admin_pw.js (utilitário)
│   │   ├── test_achievements.js (testes automatizados)
│   │   ├── middlewares/auth.js (JWT, requireAuth, requireAdmin)
│   │   ├── services/authService.js (hash, token, validação)
│   │   ├── routes/
│   │   │   ├── auth.js (login, register, forgot, reset)
│   │   │   ├── users.js (CRUD, password, dados pessoais)
│   │   │   ├── achievements.js (CRUD com validações)
│   │   │   ├── achievementTypes.js (tipos de conquistas)
│   │   │   └── stats.js (estatísticas, ranking, recentes)
│   │   └── docs/swagger.yaml (API docs)
│   ├── seeders/
│   │   ├── run-seeders.js
│   │   └── seed-admin-and-types.js
│   ├── Dockerfile
│   ├── package.json (ESM)
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx (rotas, Protected wrapper)
│   │   ├── main.jsx (ToastProvider wrapper)
│   │   ├── auth/context.jsx (AuthProvider, useAuth)
│   │   ├── lib/api.js (axios + JWT interceptor)
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── LogoAventureiro.jsx
│   │   │   ├── LogoClube.jsx
│   │   │   └── ToastContext.jsx (NEW)
│   │   ├── pages/
│   │   │   ├── Home.jsx (dashboard + welcome)
│   │   │   ├── Login.jsx (login/register)
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── Conquistas.jsx (CRUD achievements)
│   │   │   ├── Perfil.jsx (edit profile, change password)
│   │   │   ├── CadastroUsuario.jsx (admin create user)
│   │   │   └── Admin.jsx (admin dashboard)
│   │   ├── styles/
│   │   │   ├── theme.js (cores, fonts)
│   │   │   ├── GlobalStyles.jsx
│   │   │   ├── Titulo.jsx
│   │   │   └── components/
│   │   │       ├── Section.js
│   │   │       ├── Card.js
│   │   │       ├── Button.js
│   │   │       ├── Input.js
│   │   │       ├── Typography.js
│   │   │       ├── List.js
│   │   │       ├── ErrorMessage.js
│   │   │       ├── CustomSelect.jsx
│   │   │       └── index.js (exports)
│   │   └── assets/logo/
│   ├── Dockerfile
│   ├── vite.config.js
│   ├── package.json (React + Vite)
│   └── index.html
│
├── docker-compose.yml (db, backend, frontend)
├── PLANO_DESENVOLVIMENTO.md (5 sprints)
├── PLANO_DESENVOLVIMENTO_SUGESTOES.md
├── package.json (root)
└── README.md
```

---

## 🐛 Problemas Resolvidos em Sprint 1

1. **Admin Password Mismatch** — Criada script `reset_admin_pw.js` para sincronizar hash
2. **useToast Import Missing** — Adicionada importação em `Conquistas.jsx`
3. **Duplicated JSX** — Removida JSX duplicada em `Home.jsx`
4. **Dashboard.js Não-Padrão** — Movido estilos para inline em `Home.jsx`
5. **Botões não centralizados** — Ajustado flex-direction e alinhamento

---

## 🚀 Próximos Passos (Sprint 2)

### Sprint 2: Qualidade e Segurança (32h)

**Tarefa 1: Validações e Segurança (12h)**
- Implementar validações robustas no backend (6h)
  - Sanitização de inputs (sanitize-html, validator.js)
  - Validação de email, extensão, comprimento
  - Rate limiting (express-rate-limit)
- Adicionar sanitização de inputs (3h)
- Implementar rate limiting básico (3h)

**Tarefa 2: UX/UI Melhorias (10h)**
- Design responsivo completo (5h) — Media queries em componentes
- Estados de loading e feedback (3h) — Skeletons, spinners
- Mensagens de erro consistentes (2h) — Toast para todos os erros

**Tarefa 3: Testes e Qualidade (10h)**
- Testes unitários básicos (5h) — Jest + React Testing Library
- Testes de integração para API (5h) — Testar rotas, permissões, validações

---

## 📋 Checklist de Qualidade (DoD)

- ✅ Código limpo e bem estruturado
- ✅ Testes manuais passando
- ✅ UX/UI aprovado pelo usuário
- ✅ Commits bem documentados
- ✅ Sem erros no console do browser
- ✅ Sem erros no backend
- ⏳ Validações robustas (Sprint 2)
- ⏳ Testes automatizados (Sprint 2)

---

## 🔐 Fluxos Críticos

### Login Flow
1. `Login.jsx` POST `/auth/login` com email + password
2. Backend verifica senha com bcrypt
3. Retorna JWT token + user data
4. Frontend armazena em localStorage
5. `axios.interceptor` adiciona `Authorization: Bearer {token}` em todas as requisições
6. `requireAuth` middleware valida token em endpoints protegidos

### Achievement Creation Flow
1. User em `/conquistas` seleciona tipo + data + notas
2. Frontend valida: data não futura, campos obrigatórios
3. POST `/achievements` com userId, achievementTypeId, dateAchieved, notes
4. Backend valida novamente (data não futura)
5. Cria na DB com timestamps
6. Frontend mostra toast de sucesso
7. Recarrega lista via GET `/achievements?userId=...`

### Profile Update Flow
1. User em `/perfil` edita dados (name, phone, etc.)
2. PUT `/users/:id` com dados e token JWT
3. Backend valida CPF único (se alterado)
4. Atualiza BD
5. Frontend mostra toast de sucesso

---

## 🎯 Commits Sprint 1

| Hash | Mensagem |
|------|----------|
| `2b232e9` | Sprint 1: Botões da página Home centralizados e melhorias de UX |
| `a57cd45` | Sprint 1 - Item 4 (revisão): Dashboard/Home com estilos específicos da página |
| `4635044` | Sprint 1 - Item 4: Dashboard/Home com estatísticas, conquistas recentes e ranking |
| `1f89950` | Sprint 1: Perfil de usuário, edição de senhas, sistema de conquistas com validações de data e toasts globais |

---

## 💡 Dicas para Desenvolvimento Futuro

1. **Adicionar middlewares de erro** — Centralizar tratamento de erro no backend
2. **Implementar logging** — Winston ou Morgan para logs estruturados
3. **Adicionar paginação** — Para listas grandes (conquistas, usuários)
4. **Cache de dados** — Redis para stats e ranking
5. **Tests E2E** — Cypress ou Playwright para testar fluxos completos
6. **Mobile Responsiveness** — Revisar Conquistas em mobile (tabelas)
7. **Notificações Push** — Para lembretes de conquistas
8. **Importação em Massa** — Bulk upload de conquistas (CSV)
9. **Gráficos** — Usar Chart.js ou Recharts para dashboard
10. **Dark Mode** — Adicionar tema escuro

---

## 📚 Recursos & Dependências

### Backend
- **Express** — Web framework
- **Sequelize** — ORM MySQL
- **bcryptjs** — Password hashing
- **jsonwebtoken** — JWT tokens
- **Cors** — CORS handling
- **YAML** — Swagger docs
- **nodemon** — Dev hot-reload (dev)

### Frontend
- **React** — UI framework
- **Vite** — Build tool
- **React Router** — Client-side routing
- **Axios** — HTTP client
- **Styled-components** — CSS-in-JS
- **React Context** — State management

### DevOps
- **Docker** — Containerization
- **Docker Compose** — Multi-container orchestration
- **MySQL 8.0** — Database

---

## 🎉 Conclusão Sprint 1

Todas as 4 tarefas principais foram implementadas e testadas:
- ✅ Sistema de autenticação robusto
- ✅ Gerenciamento de usuários com validações
- ✅ CRUD de conquistas com permissões
- ✅ Dashboard com estatísticas e ranking

**Próximo:** Sprint 2 com foco em qualidade, segurança e testes automatizados.

---

**Mantido por:** GitHub Copilot  
**Última atualização:** 10 de Fevereiro de 2026
