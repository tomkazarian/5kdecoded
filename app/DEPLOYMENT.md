# Deployment Guide

## Quick Start (Local Development)

```bash
cd app
npm install
npm start
```

Access at: http://localhost:3000

## Production Deployment

### Prerequisites
- Node.js 18+ installed
- 1GB RAM minimum
- 100MB disk space

### Environment Variables
```bash
# Optional: Change port (default: 3000)
export PORT=8080

# Optional: Set max file upload size (default: 10MB)
export MAX_FILE_SIZE=10485760
```

### Process Management

#### Using PM2
```bash
npm install -g pm2
pm2 start src/index.js --name garmin-analyzer
pm2 save
pm2 startup
```

#### Using systemd
Create `/etc/systemd/system/garmin-analyzer.service`:
```ini
[Unit]
Description=Garmin 5K Analyzer
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/garmin-analyzer/app
ExecStart=/usr/bin/node src/index.js
Restart=always
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable garmin-analyzer
sudo systemctl start garmin-analyzer
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src

EXPOSE 3000

CMD ["node", "src/index.js"]
```

Build and run:
```bash
docker build -t garmin-analyzer .
docker run -d -p 3000:3000 --name garmin-analyzer garmin-analyzer
```

### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
```

Run:
```bash
docker-compose up -d
```

## Cloud Platform Deployment

### Heroku
```bash
# Login
heroku login

# Create app
heroku create garmin-5k-analyzer

# Deploy
git push heroku main

# Open
heroku open
```

### AWS Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p node.js garmin-analyzer

# Create environment
eb create production

# Deploy
eb deploy
```

### Google Cloud Platform
```bash
# Create app.yaml
echo "runtime: nodejs18" > app.yaml

# Deploy
gcloud app deploy
```

### DigitalOcean App Platform
1. Connect GitHub repository
2. Select Node.js environment
3. Set build command: `npm install`
4. Set run command: `node src/index.js`
5. Deploy

## Monitoring

### Health Checks
```bash
# Basic health check
curl http://localhost:3000/api/health

# Expected response:
# {"status":"healthy","version":"1.0.0","supportedFormats":["FIT","TCX","GPX"]}
```

### Logging
```javascript
// Add to src/index.js for production logging
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Performance Monitoring
```bash
# Memory usage
pm2 monit

# CPU and memory stats
pm2 status
```

## Security Considerations

### 1. File Upload Security
- Max file size: 10MB (already configured)
- Allowed extensions validated
- Files processed in memory (not saved to disk)
- No code execution from uploaded files

### 2. Rate Limiting
Add to `src/index.js`:
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. HTTPS
Always use HTTPS in production:
- Let's Encrypt for free SSL certificates
- Configure in reverse proxy (Nginx/Apache)
- Redirect HTTP to HTTPS

### 4. CORS
Add to `src/index.js` if needed:
```javascript
import cors from 'cors';

app.use(cors({
  origin: 'https://your-domain.com'
}));
```

## Scaling

### Horizontal Scaling
Use PM2 cluster mode:
```bash
pm2 start src/index.js -i max
```

### Load Balancing
Configure Nginx upstream:
```nginx
upstream garmin_backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    location / {
        proxy_pass http://garmin_backend;
    }
}
```

## Backup and Recovery

### Configuration Backup
```bash
# Backup
tar -czf garmin-analyzer-backup.tar.gz app/

# Restore
tar -xzf garmin-analyzer-backup.tar.gz
```

### Database (if added)
Currently no database, but if persistence is added:
```bash
# Automated backups
0 2 * * * /usr/local/bin/backup-script.sh
```

## Maintenance

### Updates
```bash
# Update dependencies
npm update

# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### Logs Rotation
Configure logrotate:
```bash
/var/log/garmin-analyzer/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
}
```

## Troubleshooting

### App Won't Start
```bash
# Check logs
pm2 logs garmin-analyzer

# Check port availability
netstat -tuln | grep 3000

# Check Node.js version
node --version  # Should be 18+
```

### High Memory Usage
```bash
# Restart application
pm2 restart garmin-analyzer

# Increase memory limit
node --max-old-space-size=2048 src/index.js
```

### File Upload Fails
- Check file size limits
- Verify disk space
- Check permissions
- Review Nginx client_max_body_size

## Performance Optimization

### 1. Enable Compression
```javascript
import compression from 'compression';
app.use(compression());
```

### 2. Static File Caching
```javascript
app.use(express.static('frontend', {
  maxAge: '1d'
}));
```

### 3. Production Mode
```bash
NODE_ENV=production node src/index.js
```

## Cost Estimation

### Small Deployment (< 1000 users/month)
- DigitalOcean Droplet: $6/month
- CloudFlare CDN: Free
- Total: ~$6/month

### Medium Deployment (< 10,000 users/month)
- AWS EC2 t3.small: ~$15/month
- CloudFront: ~$5/month
- Total: ~$20/month

### Large Deployment (< 100,000 users/month)
- AWS EC2 t3.medium: ~$30/month
- Load Balancer: ~$18/month
- CloudFront: ~$20/month
- Total: ~$68/month

## Support

For deployment issues:
1. Check logs first
2. Review troubleshooting section
3. Verify all prerequisites
4. Test with sample data
5. Check firewall/security groups

---

**Deployment Status**: Ready for production
**Tested Platforms**: Local, Docker, Heroku
**Minimum Requirements**: Node 18+, 1GB RAM, 100MB disk
