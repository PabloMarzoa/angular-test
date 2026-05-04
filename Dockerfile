# Stage 1: Build Angular app
FROM node:20-alpine AS builder
 
WORKDIR /app
 
# Copy package files
COPY package*.json ./
 
# Install dependencies
RUN npm ci
 
# Copy source code
COPY . .
 
# Build for production
RUN npm run build -- --configuration production
 
# Debug: Listar lo que se generó
RUN echo "=== Contenido de dist/ ===" && ls -la dist/ && echo "=== Contenido de dist/angular-test ===" && ls -la dist/angular-test/
 
# Clean up node_modules to reduce layer size
RUN rm -rf node_modules
 
# Stage 2: Serve with Nginx
FROM nginx:alpine
 
# Copy built app from builder stage
COPY --from=builder /app/dist/angular-test /usr/share/nginx/html
 
# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
 
# Debug: Verificar que los archivos están en Nginx
RUN echo "=== Archivos en /usr/share/nginx/html ===" && ls -la /usr/share/nginx/html/
 
# Expose port
EXPOSE 80
 
# Start Nginx
CMD ["nginx", "-g", "daemon off;"]