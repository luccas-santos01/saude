#!/bin/bash
# ============================================
# Script de Deploy - Projeto Saúde
# ============================================

set -e

echo "🚀 Iniciando deploy do projeto Saúde..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar se .env existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado!${NC}"
    echo "Copie o .env.production para .env e configure as variáveis:"
    echo "  cp .env.production .env"
    echo "  nano .env"
    exit 1
fi

# Pull das últimas alterações (se for git)
if [ -d .git ]; then
    echo -e "${GREEN}📥 Baixando últimas alterações...${NC}"
    git pull origin main
fi

# Parar containers antigos
echo -e "${GREEN}🛑 Parando containers existentes...${NC}"
docker-compose -f docker-compose.prod.yml down

# Build das imagens
echo -e "${GREEN}🔨 Construindo imagens Docker...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache

# Iniciar containers
echo -e "${GREEN}🚀 Iniciando containers...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Aguardar banco estar pronto
echo -e "${GREEN}⏳ Aguardando banco de dados...${NC}"
sleep 10

# Mostrar status
echo -e "${GREEN}📊 Status dos containers:${NC}"
docker-compose -f docker-compose.prod.yml ps

# Criar usuário admin (primeira vez)
echo ""
echo -e "${YELLOW}💡 Para criar o usuário admin (primeira vez), execute:${NC}"
echo "   docker exec -it saude_backend npx prisma db seed"

echo ""
echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo "🌐 Acesse: https://www.luccasdev.com.br/saude"
