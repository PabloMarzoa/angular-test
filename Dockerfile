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
 
# Verify build output
RUN echo "=== Build output ===" && ls -la dist/angular-test/browser/
 
# Clean up node_modules to reduce layer size
RUN rm -rf node_modules
 
# Stage 2: Serve with Nginx
FROM nginx:alpine
 
# Remove default nginx html files
RUN rm -rf /usr/share/nginx/html/*
 
# Copy built app from builder stage - directly from browser folder
COPY --from=builder /app/dist/angular-test/browser/ /usr/share/nginx/html/
 
# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
 
# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html
 
# Verify files are in place
RUN echo "=== Files in /usr/share/nginx/html ===" && ls -la /usr/share/nginx/html/
 
# Expose port
EXPOSE 80
 
# Start Nginx
CMD ["nginx", "-g", "daemon off;"]