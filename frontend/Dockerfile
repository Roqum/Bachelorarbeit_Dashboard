FROM node:18.12

WORKDIR /app

EXPOSE 3000

COPY package.json ./ 
COPY .env ./
RUN npm install 

COPY . ./
CMD ["npm","start"]