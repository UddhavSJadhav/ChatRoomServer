FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=8080

EXPOSE 8080

CMD ["node", "--max-old-space-size=256", "index.js"]

#docker build -t chatroom .
#docker run --memory=256m --memory-swap=256m -p 5001:8080 chatroom
#here 5001 computers port and 8080 is containers port
#can add custom container name by adding -name flag
#docker run --memory=256m --memory-swap=256m -p 5001:8080 --name custom_cont chatroom
#to remove old container
#docker rm container_name