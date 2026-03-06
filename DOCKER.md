# Docker Setup Guide

This guide will help you deploy the attestation project using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed

## Quick Start

1. **Create environment file:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration.

2. **Build and start containers:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3002
   - Database: localhost:5432

## Services

### Frontend
- **Build**: Multi-stage build using Node.js 18 Alpine for building, Nginx Alpine for serving
- **Port**: 80 (mapped to 5173 on host)
- **Technology**: React + Vite, served by Nginx

### Backend
- **Build**: Node.js 18 Alpine with native dependencies for canvas package
- **Port**: 3002
- **Technology**: Express.js + TypeScript

### Database
- **Image**: PostgreSQL 15 Alpine
- **Port**: 5432
- **Persistence**: Docker volume `db_data`

## Commands

### Start all services:
```bash
docker-compose up
```

### Start in detached mode:
```bash
docker-compose up -d
```

### Stop all services:
```bash
docker-compose down
```

### Rebuild images:
```bash
docker-compose build
```

### View logs:
```bash
docker-compose logs -f
```

### Access a specific service:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

## Volumes

- `db_data`: PostgreSQL data persistence
- `uploads_data`: Backend uploads directory

## Troubleshooting

### Canvas Package Issues
If you encounter issues with the `canvas` package during build, ensure the Dockerfile includes all required system dependencies (cairo, pango, jpeg, etc.).

### Database Connection
The backend waits for the database to be ready. If connection issues persist:
1. Check database credentials in `.env`
2. Ensure the database service is running: `docker-compose ps`
3. Check database logs: `docker-compose logs db`

### Port Conflicts
If ports 5173, 3002, or 5432 are already in use:
1. Stop conflicting services
2. Or modify the port mappings in `docker-compose.yml`

## Production Considerations

For production deployment:
1. Use stronger database credentials
2. Set `NODE_ENV=production`
3. Configure proper SSL/TLS certificates
4. Use secrets management for sensitive data
5. Set up proper backup strategy for database volumes
