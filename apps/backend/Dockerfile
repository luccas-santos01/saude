FROM node:18-alpine

# Instalar dependências do Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Definir variável de ambiente para Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm install

# Gerar cliente Prisma
RUN npx prisma generate

# Copiar código fonte
COPY . .

# Build
RUN npm run build

# Criar diretórios
RUN mkdir -p uploads generated-pdfs

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
