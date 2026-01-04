#!/bin/bash
# ============================================
# Script de Deploy - Projeto Saúde
# VPS: www.luccasdev.com.br/saude
# ============================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}   Deploy do Projeto Saúde                 ${NC}"
echo -e "${GREEN}============================================${NC}"

# Diretório do projeto
PROJECT_DIR="/home/deploy/saude"

# Criar diretório se não existir
echo -e "${YELLOW}[1/7] Criando diretório do projeto...${NC}"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Copiar arquivos necessários do repo (assumindo que você está rodando do repo clonado)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo -e "${YELLOW}[2/7] Copiando arquivos de configuração...${NC}"
cp "$SCRIPT_DIR/docker-compose.prod.yml" $PROJECT_DIR/docker-compose.yml

# Verificar se .env existe, se não, criar
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo -e "${YELLOW}[3/7] Criando arquivo .env...${NC}"
    
    # Gerar senhas seguras
    POSTGRES_PASS=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)
    JWT_SEC=$(openssl rand -base64 64 | tr -dc 'a-zA-Z0-9' | head -c 64)
    
    cat > $PROJECT_DIR/.env << EOF
# ============================================
# AMBIENTE DE PRODUÇÃO - SAÚDE
# ============================================
# Gerado automaticamente em $(date)

# PostgreSQL
POSTGRES_USER=saude_user
POSTGRES_PASSWORD=${POSTGRES_PASS}
POSTGRES_DB=saude_db

# JWT Secret
JWT_SECRET=${JWT_SEC}

# URLs
NEXT_PUBLIC_API_URL=https://www.luccasdev.com.br/saude/api
CORS_ORIGIN=https://www.luccasdev.com.br
EOF
    
    echo -e "${GREEN}   ✓ Arquivo .env criado com senhas seguras${NC}"
    echo -e "${YELLOW}   IMPORTANTE: Guarde essas credenciais!${NC}"
    echo ""
    cat $PROJECT_DIR/.env
    echo ""
else
    echo -e "${GREEN}[3/7] Arquivo .env já existe, mantendo configuração atual${NC}"
fi

# Pull das imagens mais recentes
echo -e "${YELLOW}[4/7] Baixando imagens do Docker Hub...${NC}"
docker pull luccxmsantos/dieta-backend:latest
docker pull luccxmsantos/dieta-frontend:latest

# Parar containers existentes (se houver)
echo -e "${YELLOW}[5/7] Iniciando containers...${NC}"
cd $PROJECT_DIR
docker-compose down 2>/dev/null || true
docker-compose up -d

# Aguardar banco ficar pronto
echo -e "${YELLOW}[6/7] Aguardando banco de dados...${NC}"
sleep 10

# Rodar migrations e seed
echo -e "${YELLOW}[7/7] Executando migrations e seed...${NC}"
docker-compose exec -T backend npx prisma migrate deploy
docker-compose exec -T backend npx prisma db seed || echo "Seed já executado ou falhou (não crítico)"

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}   Deploy concluído com sucesso! ✓         ${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "Próximos passos:"
echo -e "1. Configure o Nginx copiando o conteúdo de ${YELLOW}nginx-saude.conf${NC}"
echo -e "   para dentro do seu server block em:"
echo -e "   ${YELLOW}/etc/nginx/sites-available/luccasdev.com.br${NC}"
echo ""
echo -e "2. Teste a configuração do Nginx:"
echo -e "   ${YELLOW}sudo nginx -t${NC}"
echo ""
echo -e "3. Recarregue o Nginx:"
echo -e "   ${YELLOW}sudo systemctl reload nginx${NC}"
echo ""
echo -e "4. Acesse: ${GREEN}https://www.luccasdev.com.br/saude${NC}"
echo ""
echo -e "Credenciais do admin padrão:"
echo -e "   Email: ${YELLOW}admin@dieta.com${NC}"
echo -e "   Senha: ${YELLOW}admin123${NC}"
echo ""
