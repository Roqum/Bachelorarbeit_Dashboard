FROM node:18.12

WORKDIR /app

EXPOSE 3000

COPY package.json package-lock.json ./ 
COPY yarn.lock ./
RUN yarn install 

COPY . ./

CMD ["yarn","start"]