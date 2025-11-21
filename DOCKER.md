# Docker Setup for E-Radio Frontend

This directory contains Docker configuration files for building and running the E-Radio frontend application.

## Files

- `Dockerfile` - Production multi-stage build
- `Dockerfile.dev` - Development build with hot-reload
- `docker-compose.yml` - Production Docker Compose configuration
- `docker-compose.dev.yml` - Development Docker Compose configuration
- `.dockerignore` - Files to exclude from Docker build context

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 20+ (for local development)

## Quick Start

### Production Build

```bash
# Build the image
docker build -t eradio-frontend .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8080 \
  eradio-frontend
```

### Using Docker Compose (Production)

```bash
# Create .env.production file with your environment variables
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.production

# Start the service
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the service
docker-compose down
```

### Development with Docker

```bash
# Start development container with hot-reload
docker-compose -f docker-compose.dev.yml up

# The app will be available at http://localhost:3000
# Changes to source code will trigger hot-reload
```

## Environment Variables

Create a `.env.production` file (for production) or `.env.local` (for development) with:

```env
NEXT_PUBLIC_API_URL=http://your-backend-url:8080
```

## Features

### Production Dockerfile

- **Multi-stage build** - Optimized image size
- **Security** - Runs as non-root user (nextjs:nodejs)
- **Standalone output** - Uses Next.js standalone output for minimal dependencies
- **Health checks** - Built-in health check endpoint
- **Layer caching** - Optimized for Docker layer caching
- **Alpine Linux** - Minimal base image for smaller size

### Development Dockerfile

- **Hot-reload** - Source code mounted as volume for instant updates
- **Fast startup** - Minimal setup for development
- **Volume mounts** - Excludes node_modules and .next for performance

## Image Size Optimization

The production image uses:
- Alpine Linux base (smaller than Debian)
- Multi-stage builds (only runtime dependencies in final image)
- Next.js standalone output (minimal Node.js runtime)
- Non-root user (security best practice)

## Security Best Practices

1. **Non-root user** - Container runs as `nextjs` user (UID 1001)
2. **Minimal base image** - Alpine Linux reduces attack surface
3. **No new privileges** - Security option prevents privilege escalation
4. **Read-only filesystem** - Can be enabled for additional security
5. **Resource limits** - CPU and memory limits in docker-compose.yml

## Troubleshooting

### Build fails with "Lockfile not found"

Ensure `package-lock.json` exists:
```bash
npm install
```

### Port already in use

Change the port in docker-compose.yml:
```yaml
ports:
  - "3001:3000"  # Use port 3001 on host
```

### Health check fails

The health check pings the root endpoint. If it fails:
1. Check container logs: `docker-compose logs frontend`
2. Verify the app is running: `docker-compose exec frontend ps aux`
3. Test manually: `docker-compose exec frontend wget -O- http://localhost:3000`

### Environment variables not loading

Ensure your `.env.production` file exists and is in the frontend directory:
```bash
ls -la .env.production
```

## Building for Different Architectures

### ARM64 (Apple Silicon)

The Dockerfile uses `node:20-alpine` which supports multi-arch. Build for ARM64:
```bash
docker buildx build --platform linux/arm64 -t eradio-frontend .
```

### AMD64 (Intel/AMD)

```bash
docker buildx build --platform linux/amd64 -t eradio-frontend .
```

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -t eradio-frontend .
      - name: Push to registry
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
          docker push eradio-frontend
```

## Performance Tips

1. **Use BuildKit** - Enable for faster builds:
   ```bash
   export DOCKER_BUILDKIT=1
   docker build -t eradio-frontend .
   ```

2. **Layer caching** - The Dockerfile is optimized for layer caching. Dependencies are cached separately from source code.

3. **Production builds** - Always use `npm run build` before building the Docker image for production.

## Monitoring

View container stats:
```bash
docker stats eradio-frontend
```

View logs:
```bash
docker-compose logs -f frontend
```

Check health status:
```bash
docker inspect --format='{{.State.Health.Status}}' eradio-frontend
```

