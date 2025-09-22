# Usar Node para o backend
FROM node:18

# Definir diretório de trabalho
WORKDIR /usr/src/app

# Copiar package.json e package-lock.json do backend
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o restante dos arquivos do backend

RUN npm install -g nodemon
# Expor a porta do backend (altere se necessário)
EXPOSE 5000

# Rodar a aplicação
CMD ["npm", "run", "dev"]