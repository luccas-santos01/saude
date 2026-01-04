# 🚀 Guia de Deploy - Projeto Saúde

## Pré-requisitos na VPS
- Docker e Docker Compose instalados
- Nginx configurado com HTTPS
- Acesso SSH à VPS

---

## 📦 Passo 1: Enviar arquivos para a VPS

### Opção A: Via Git (Recomendado)
```bash
# Na VPS, clone o repositório
cd /opt
git clone SEU_REPOSITORIO saude
cd saude
```

### Opção B: Via SCP
```bash
# No seu computador local
scp -r ./* usuario@luccasdev.com.br:/opt/saude/
```

---

## ⚙️ Passo 2: Configurar variáveis de ambiente

```bash
# Na VPS
cd /opt/saude

# Copiar arquivo de exemplo
cp .env.production .env

# Editar com suas senhas
nano .env
```

### Gerar senhas seguras:
```bash
# Gerar JWT_SECRET
openssl rand -base64 64

# Gerar POSTGRES_PASSWORD
openssl rand -base64 32
```

### Exemplo de .env preenchido:
```env
POSTGRES_USER=saude_user
POSTGRES_PASSWORD=minha_senha_super_segura_123
POSTGRES_DB=saude_db
JWT_SECRET=seu_jwt_secret_gerado_aqui
NEXT_PUBLIC_API_URL=https://www.luccasdev.com.br/saude/api
CORS_ORIGIN=https://www.luccasdev.com.br
```

---

## 🌐 Passo 3: Configurar Nginx

```bash
# Editar configuração do seu site
sudo nano /etc/nginx/sites-available/luccasdev.com.br
```

### Adicionar dentro do bloco `server { }`:
```nginx
    # ===========================================
    # PROJETO SAÚDE - Frontend e API
    # ===========================================
    
    # Frontend Next.js
    location /saude {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Arquivos estáticos do Next.js
    location /saude/_next {
        proxy_pass http://127.0.0.1:3100/saude/_next;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # API Backend
    location /saude/api {
        rewrite ^/saude/api(.*)$ /api$1 break;
        proxy_pass http://127.0.0.1:3101;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 10M;
    }
```

### Testar e recarregar Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🐳 Passo 4: Fazer o Deploy

```bash
cd /opt/saude

# Dar permissão ao script
chmod +x deploy.sh

# Executar deploy
./deploy.sh
```

### Ou manualmente:
```bash
# Build e start
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 👤 Passo 5: Criar usuário admin

```bash
# Rodar seed para criar admin
docker exec -it saude_backend npx prisma db seed
```

**Credenciais padrão:**
- Email: `admin@dieta.com`
- Senha: `admin123`

⚠️ **IMPORTANTE:** Troque a senha após o primeiro login!

---

## 🔧 Comandos Úteis

### Ver logs
```bash
# Todos os serviços
docker-compose -f docker-compose.prod.yml logs -f

# Apenas backend
docker logs -f saude_backend

# Apenas frontend
docker logs -f saude_frontend
```

### Reiniciar serviços
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Parar tudo
```bash
docker-compose -f docker-compose.prod.yml down
```

### Ver status
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Acessar container
```bash
# Backend
docker exec -it saude_backend sh

# Banco de dados
docker exec -it saude_postgres psql -U saude_user -d saude_db
```

### Atualizar projeto
```bash
cd /opt/saude
git pull origin main
./deploy.sh
```

---

## 🔍 Troubleshooting

### Erro de conexão com banco
```bash
# Verificar se postgres está rodando
docker logs saude_postgres

# Testar conexão
docker exec -it saude_backend npx prisma db push
```

### Erro 502 Bad Gateway
```bash
# Verificar se containers estão rodando
docker-compose -f docker-compose.prod.yml ps

# Verificar portas
netstat -tlnp | grep -E '3100|3101'
```

### Frontend não carrega
```bash
# Rebuild do frontend
docker-compose -f docker-compose.prod.yml build frontend --no-cache
docker-compose -f docker-compose.prod.yml up -d frontend
```

### Resetar banco de dados
```bash
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
docker exec -it saude_backend npx prisma db seed
```

---

## 📁 Estrutura de Portas

| Serviço      | Porta Interna | Porta Externa |
|--------------|---------------|---------------|
| Frontend     | 3000          | 3100          |
| Backend      | 3001          | 3101          |
| PostgreSQL   | 5432          | (apenas rede interna) |

---

## ✅ Checklist de Deploy

- [ ] Arquivos enviados para VPS
- [ ] .env configurado com senhas fortes
- [ ] Nginx configurado e recarregado
- [ ] Docker Compose rodando
- [ ] Seed executado (usuário admin criado)
- [ ] Acesso funcionando em https://www.luccasdev.com.br/saude
- [ ] Senha do admin alterada

---

**URL Final:** https://www.luccasdev.com.br/saude
