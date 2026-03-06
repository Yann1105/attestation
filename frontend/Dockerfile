# Build stage
FROM node:18-alpine as build

# Install dependencies required for canvas package
RUN apk add --no-cache \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev \
    pixman-dev \
    pkgconfig \
    python3 \
    make \
    g++

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code and env file
COPY . .

# Create .env file with build-time variables
RUN echo "VITE_API_URL=http://localhost:3002/api" > .env && \
    echo "VITE_APP_NAME=BIMADES Attestations" >> .env && \
    echo "VITE_APP_VERSION=1.0.0" >> .env

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
