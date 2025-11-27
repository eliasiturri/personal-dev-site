# Dev Site Docker Setup

This folder contains the Docker configuration to run my personal dev site application with Nginx as a reverse proxy.

## Architecture

- **app**: Node.js application container running on port 3000 (internal)
- **nginx**: Nginx reverse proxy exposing ports 80 (HTTP) and 443 (HTTPS)
- **node_modules volume**: Named volume to persist dependencies and prevent overwriting

## Key Features

- **Hot code updates**: Code changes in the parent directory are immediately reflected without rebuilding any container
- **Persistent dependencies**: `node_modules` is stored in a Docker volume, not overwritten by host mount
- **Easy dependency updates**: When you add packages to `package.json`, rebuild with `docker compose up --build`
- **Automatic SSL**: Certbot container handles Let's Encrypt certificate provisioning and renewal

## Usage

### First-time setup

1. **Start containers with initial HTTP-only config**:
```bash
cd docker
docker compose up -d
```

2. **Set your own domain name(s) for nginx**:

- Edit `nginx-initial.conf` and `nginx.conf` to replace `example.dev` and `www.example.dev` with your actual domain and subdomain.

3. **Obtain SSL certificate** 

(Ensure DNS points to your server, and add the right e-mail addres and domain/subdomains. You will also need to ensure that the certbot container is not starting using the renewal mode entrypoint)


```bash
docker compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d example.dev \
  -d www.example.dev
```

### After adding dependencies

```bash
cd docker
docker compose up --build
```

### Normal startup (code changes only)

```bash
cd docker
docker compose up -d
```

### Restart after code changes

```bash
docker compose restart app
```

### Rebuild only the app (after package.json changes)

```bash
docker compose up --build app
```

### Port conflicts
If port 80/443 are in use, modify the ports in `docker-compose.yml`:

```yaml
ports:
  - "8080:80"
  - "8443:443"
```
