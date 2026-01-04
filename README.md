# 🥗 Sistema de Dietas, Treinos e Acompanhamento Físico

Sistema web completo para gerenciamento de dietas, treinos e acompanhamento da evolução física do usuário.

## 📋 Funcionalidades

### 🍎 Gestão de Alimentos
- Cadastro de alimentos com informações nutricionais
- Macronutrientes: calorias, proteínas, carboidratos e gorduras
- Suporte para fibras, sódio e outros micronutrientes
- Busca e filtro de alimentos

### 🍽️ Refeições
- Montagem de refeições com múltiplos alimentos
- Cálculo automático de valores nutricionais
- Controle de porções

### 📅 Dietas
- Criação de planos alimentares semanais
- Organização por dias da semana
- Múltiplas refeições por dia com horários
- Ativação/desativação de dietas
- Exportação para PDF

### 💪 Exercícios
- Catálogo de exercícios por grupo muscular
- Instruções de execução
- Links para vídeos demonstrativos
- Equipamentos necessários

### 🏋️ Treinos
- Montagem de programas de treino
- Configuração de séries, repetições e descanso
- Diferentes tipos: hipertrofia, força, cardio, etc.
- Exportação para PDF

### 📊 Medidas Corporais
- Registro de peso e composição corporal
- Circunferências (peito, cintura, braços, coxas, etc.)
- Gráficos de evolução
- Estatísticas comparativas

### 📸 Fotos de Progresso
- Upload de fotos por tipo (frente, costas, laterais)
- Galeria organizada por data
- Relatório de progresso em PDF

## 🛠️ Tecnologias

### Backend
- **NestJS** - Framework Node.js
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação
- **Puppeteer** - Geração de PDFs

### Frontend
- **Next.js 14** - Framework React
- **TailwindCSS** - Estilização
- **Recharts** - Gráficos
- **React Hook Form** - Formulários
- **Zustand** - Gerenciamento de estado
- **Axios** - Requisições HTTP

### Infraestrutura
- **Docker** - Containerização
- **Docker Compose** - Orquestração

## 🚀 Instalação

### Pré-requisitos
- Node.js 20+
- Docker e Docker Compose (opcional)
- PostgreSQL (se não usar Docker)

### Usando Docker (Recomendado)

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd dieta
```

2. Copie o arquivo de variáveis de ambiente:
```bash
cp .env.example .env
```

3. Inicie os containers:
```bash
# Desenvolvimento
docker-compose -f docker-compose.dev.yml up -d

# Produção
docker-compose up -d
```

4. Acesse:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Instalação Manual

1. Clone e instale as dependências:
```bash
git clone <url-do-repositorio>
cd dieta
npm install
```

2. Configure o banco de dados PostgreSQL e atualize o `.env`:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/dieta?schema=public"
JWT_SECRET="sua-chave-secreta-aqui"
```

3. Execute as migrações:
```bash
cd apps/backend
npx prisma migrate dev
npx prisma db seed
```

4. Inicie o backend:
```bash
cd apps/backend
npm run start:dev
```

5. Em outro terminal, inicie o frontend:
```bash
cd apps/frontend
npm run dev
```

## 📁 Estrutura do Projeto

```
dieta/
├── apps/
│   ├── backend/           # API NestJS
│   │   ├── prisma/        # Schema e migrações
│   │   └── src/
│   │       ├── auth/      # Autenticação JWT
│   │       ├── users/     # Gestão de usuários
│   │       ├── foods/     # Alimentos
│   │       ├── meals/     # Refeições
│   │       ├── diets/     # Dietas
│   │       ├── exercises/ # Exercícios
│   │       ├── trainings/ # Treinos
│   │       ├── body-measurements/ # Medidas
│   │       ├── progress-images/   # Fotos
│   │       └── pdf/       # Geração de PDFs
│   │
│   └── frontend/          # App Next.js
│       └── src/
│           ├── app/       # Páginas (App Router)
│           ├── lib/       # Utilitários e API client
│           └── store/     # Estado global (Zustand)
│
├── docker-compose.yml     # Docker produção
├── docker-compose.dev.yml # Docker desenvolvimento
└── package.json           # Workspaces config
```

## 🔐 Autenticação

O sistema usa JWT para autenticação. Endpoints protegidos requerem o header:
```
Authorization: Bearer <token>
```

### Endpoints de Auth
- `POST /auth/register` - Cadastro
- `POST /auth/login` - Login
- `GET /auth/profile` - Perfil do usuário

## 📄 API Endpoints

### Alimentos
- `GET /foods` - Listar alimentos
- `POST /foods` - Criar alimento
- `GET /foods/:id` - Buscar por ID
- `PATCH /foods/:id` - Atualizar
- `DELETE /foods/:id` - Excluir

### Refeições
- `GET /meals` - Listar refeições
- `POST /meals` - Criar refeição
- `GET /meals/:id` - Buscar por ID
- `PATCH /meals/:id` - Atualizar
- `DELETE /meals/:id` - Excluir

### Dietas
- `GET /diets` - Listar dietas
- `POST /diets` - Criar dieta
- `GET /diets/:id` - Buscar por ID
- `PATCH /diets/:id` - Atualizar
- `DELETE /diets/:id` - Excluir

### Exercícios
- `GET /exercises` - Listar exercícios
- `POST /exercises` - Criar exercício
- `GET /exercises/:id` - Buscar por ID
- `PATCH /exercises/:id` - Atualizar
- `DELETE /exercises/:id` - Excluir

### Treinos
- `GET /trainings` - Listar treinos
- `POST /trainings` - Criar treino
- `GET /trainings/:id` - Buscar por ID
- `PATCH /trainings/:id` - Atualizar
- `DELETE /trainings/:id` - Excluir

### Medidas Corporais
- `GET /body-measurements` - Listar medidas
- `POST /body-measurements` - Registrar medida
- `GET /body-measurements/stats` - Estatísticas
- `GET /body-measurements/:id` - Buscar por ID
- `PATCH /body-measurements/:id` - Atualizar
- `DELETE /body-measurements/:id` - Excluir

### Fotos de Progresso
- `GET /progress-images` - Listar fotos
- `POST /progress-images` - Upload de foto
- `DELETE /progress-images/:id` - Excluir foto

### PDFs
- `GET /pdf/diet/:id` - PDF da dieta
- `GET /pdf/training/:id` - PDF do treino
- `GET /pdf/progress` - Relatório de progresso

## 🎨 Telas do Sistema

1. **Landing Page** - Apresentação do sistema
2. **Login/Registro** - Autenticação de usuários
3. **Dashboard** - Visão geral com estatísticas
4. **Alimentos** - CRUD de alimentos
5. **Refeições** - Composição de refeições
6. **Dietas** - Planos alimentares semanais
7. **Exercícios** - Catálogo de exercícios
8. **Treinos** - Programas de treino
9. **Medidas** - Registro e gráficos de evolução
10. **Progresso** - Galeria de fotos
11. **Configurações** - Perfil e conta

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia todos os apps
npm run dev:backend      # Apenas backend
npm run dev:frontend     # Apenas frontend

# Build
npm run build            # Build de produção
npm run build:backend    # Build backend
npm run build:frontend   # Build frontend

# Database
npm run db:migrate       # Executar migrações
npm run db:seed          # Popular banco
npm run db:studio        # Prisma Studio
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Desenvolvido com ❤️ para ajudar você a alcançar seus objetivos de saúde e fitness.
