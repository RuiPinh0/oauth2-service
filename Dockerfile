FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# Make entrypoint script executable
RUN chmod +x ./scripts/setup-localstack.sh

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]