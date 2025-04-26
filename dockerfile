FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install bcrypt --force
RUN npm install
COPY . . 
RUN npm run build
EXPOSE 3000
CMD [ "npm","run","start:prod" ]