FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install curl (for healthcheck)
RUN apk add --no-cache curl

# Install Node dependencies
RUN npm install

# Copy source code
COPY . .

# Expose Vite port
EXPOSE 3000

# Start Vite development server
CMD ["npm", "run", "dev", "--", "--host"]