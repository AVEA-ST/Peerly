# Use Node 18 LTS
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Bundle app source
COPY . .

# Expose port
ENV PORT=5000
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
