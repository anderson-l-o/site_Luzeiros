# Usar Node para o frontend
FROM node:18

# Definir diretório de trabalho
WORKDIR /usr/src/app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

RUN npm install react-select

RUN npm install -g vite

# Expor a porta usada pelo app
EXPOSE 5173

# Rodar a aplicação
CMD ["npm", "run", "dev"]