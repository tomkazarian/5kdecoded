# Dynastride.com - Deployment Guide
## Garmin 5K Analyzer Platform by Anthony Mallory

**Version**: 1.0.0
**Last Updated**: November 2025
**Platform**: Node.js Express Application

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Requirements](#environment-requirements)
3. [Deployment Options](#deployment-options)
4. [Configuration](#configuration)
5. [Production Setup](#production-setup)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)
8. [Rollback Procedures](#rollback-procedures)

---

## Pre-Deployment Checklist

### Code Readiness

- [x] All source files in correct directories
- [x] Dependencies installed (`npm install`)
- [x] Critical bugs fixed (FitParser import)
- [x] Server starts successfully
- [x] All API endpoints tested
- [ ] Test suite created (recommended before production)
- [ ] Security audit completed

### Documentation

- [x] Technical README
- [x] User guide
- [x] Integration report
- [x] Deployment guide (this document)
- [x] API documentation
- [ ] Operations manual (create post-deployment)

### Configuration

- [ ] Environment variables defined
- [ ] Domain name registered
- [ ] SSL certificate obtained
- [ ] DNS configured
- [ ] Monitoring tools selected
- [ ] Backup strategy defined

---

## Environment Requirements

### Server Specifications

**Minimum Requirements**:
- **CPU**: 1 core
- **RAM**: 512 MB
- **Storage**: 100 MB (application) + 1 GB (logs/temp)
- **Network**: 10 Mbps

**Recommended for Production**:
- **CPU**: 2 cores
- **RAM**: 1 GB
- **Storage**: 5 GB
- **Network**: 100 Mbps
- **Backup**: Daily automated backups

### Software Requirements

- **Node.js**: 18.0.0 or higher (LTS recommended)
- **npm**: 8.0.0 or higher (comes with Node.js)
- **Git**: For deployment from repository
- **Process Manager**: PM2 or systemd
- **Reverse Proxy**: Nginx or Apache (recommended)
- **SSL/TLS**: Let's Encrypt or commercial certificate

### Operating Systems

**Supported**:
- Ubuntu 20.04 LTS or higher
- Debian 11 or higher
- CentOS 8 or higher
- Amazon Linux 2
- macOS 12 or higher (development)

**Not Recommended**:
- Windows Server (limited testing)
- Older Linux distributions (security concerns)

---

## Deployment Options

### Option 1: Vercel (Fastest - Recommended for MVP)

**Best For**: Quick deployment, serverless architecture, automatic scaling

**Pros**:
- Zero-configuration deployment
- Automatic HTTPS
- Global CDN
- Easy rollbacks
- Free tier available

**Cons**:
- File upload size limits
- Serverless cold starts
- Less control over infrastructure

#### Vercel Deployment Steps

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Configure Project**:
Create `vercel.json` in project root:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "src/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "src/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

4. **Deploy**:
```bash
cd /workspaces/5kdecoded/app
vercel --prod
```

5. **Configure Custom Domain** (optional):
```bash
vercel domains add dynastride.com
```

#### Estimated Time: 10 minutes
#### Cost: $0-20/month

---

### Option 2: DigitalOcean Droplet (Most Control)

**Best For**: Full control, predictable pricing, traditional hosting

**Pros**:
- Complete infrastructure control
- No serverless limitations
- Persistent connections
- Predictable costs

**Cons**:
- Manual configuration required
- Responsible for security updates
- Need to manage scaling

#### DigitalOcean Deployment Steps

##### 1. Create Droplet

```bash
# Via DigitalOcean CLI (doctl)
doctl compute droplet create dynastride-app \
  --image ubuntu-20-04-x64 \
  --size s-1vcpu-1gb \
  --region sfo3 \
  --ssh-keys YOUR_SSH_KEY_ID
```

Or use the web interface:
- **Image**: Ubuntu 20.04 LTS
- **Plan**: Basic ($6/month for 1GB RAM)
- **Region**: San Francisco (or nearest to users)
- **SSH Keys**: Add your public key

##### 2. Initial Server Setup

SSH into your droplet:
```bash
ssh root@YOUR_DROPLET_IP
```

Update system:
```bash
apt update && apt upgrade -y
```

Create application user:
```bash
adduser dynastride
usermod -aG sudo dynastride
```

##### 3. Install Node.js

```bash
# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 8.x.x
```

##### 4. Install and Configure Nginx

```bash
# Install Nginx
apt install -y nginx

# Create configuration
nano /etc/nginx/sites-available/dynastride
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name dynastride.com www.dynastride.com;

    # File upload size limit
    client_max_body_size 10M;

    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable configuration:
```bash
ln -s /etc/nginx/sites-available/dynastride /etc/nginx/sites-enabled/
nginx -t  # Test configuration
systemctl restart nginx
```

##### 5. Install SSL Certificate

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Obtain certificate
certbot --nginx -d dynastride.com -d www.dynastride.com

# Auto-renewal (already configured by certbot)
systemctl status certbot.timer
```

##### 6. Deploy Application

```bash
# Switch to app user
su - dynastride

# Clone repository
git clone https://github.com/YOUR_USERNAME/5kdecoded.git
cd 5kdecoded/app

# Install dependencies
npm install --production

# Test application
npm start
# Verify at http://localhost:3000, then Ctrl+C to stop
```

##### 7. Configure PM2 Process Manager

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start application
pm2 start src/index.js --name dynastride-app

# Configure startup script
pm2 startup systemd
# Follow the command it outputs

# Save PM2 configuration
pm2 save

# Monitor application
pm2 status
pm2 logs dynastride-app
```

##### 8. Configure Firewall

```bash
# Install and configure UFW
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

#### Estimated Time: 45-60 minutes
#### Cost: $6/month (Basic Droplet)

---

### Option 3: AWS EC2 (Enterprise Scale)

**Best For**: Enterprise needs, auto-scaling, AWS ecosystem integration

**Pros**:
- Integration with AWS services
- Advanced auto-scaling
- Load balancing
- Enterprise support

**Cons**:
- More complex setup
- Higher learning curve
- Variable costs

#### AWS EC2 Deployment Steps

##### 1. Launch EC2 Instance

```bash
# Via AWS CLI
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \  # Ubuntu 20.04 LTS
  --instance-type t3.micro \
  --key-name your-key-pair \
  --security-group-ids sg-xxxxxxxx \
  --subnet-id subnet-xxxxxxxx \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=Dynastride-App}]'
```

Or use AWS Console:
- **AMI**: Ubuntu Server 20.04 LTS
- **Instance Type**: t3.micro (1 GB RAM)
- **Storage**: 8 GB gp3
- **Security Group**: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS)

##### 2. Elastic IP (Optional but Recommended)

```bash
# Allocate Elastic IP
aws ec2 allocate-address --domain vpc

# Associate with instance
aws ec2 associate-address \
  --instance-id i-xxxxxxxxx \
  --allocation-id eipalloc-xxxxxxxxx
```

##### 3. Follow DigitalOcean Steps 2-8

The setup is identical to DigitalOcean once the instance is running.

##### 4. Optional: Application Load Balancer

For high-availability deployments:
```bash
# Create target group
aws elbv2 create-target-group \
  --name dynastride-targets \
  --protocol HTTP \
  --port 80 \
  --vpc-id vpc-xxxxxxxx

# Create load balancer
aws elbv2 create-load-balancer \
  --name dynastride-lb \
  --subnets subnet-xxxxxxxx subnet-yyyyyyyy \
  --security-groups sg-xxxxxxxx
```

#### Estimated Time: 60-90 minutes
#### Cost: $10-30/month (t3.micro + EBS)

---

### Option 4: Docker Container (Portable)

**Best For**: Containerized environments, easy local development, portability

#### Create Dockerfile

Create `/workspaces/5kdecoded/app/Dockerfile`:
```dockerfile
# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run application
CMD ["node", "src/index.js"]
```

Create `.dockerignore`:
```
node_modules
npm-debug.log
.git
.gitignore
README.md
docs
tests
.env
```

#### Build and Run

```bash
# Build image
docker build -t dynastride-app:1.0.0 .

# Run container
docker run -d \
  --name dynastride \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  dynastride-app:1.0.0

# Check logs
docker logs -f dynastride
```

#### Deploy to Cloud Container Services

**AWS ECS**:
```bash
# Push to ECR
aws ecr create-repository --repository-name dynastride-app
docker tag dynastride-app:1.0.0 YOUR_AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/dynastride-app:1.0.0
docker push YOUR_AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/dynastride-app:1.0.0

# Create ECS service (via console or CLI)
```

**Google Cloud Run**:
```bash
# Deploy directly
gcloud run deploy dynastride-app \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Estimated Time: 30-45 minutes
#### Cost: Varies by platform

---

## Configuration

### Environment Variables

Create `.env` file in `/workspaces/5kdecoded/app/`:

```bash
# Application
NODE_ENV=production
PORT=3000

# File Upload
MAX_FILE_SIZE=10485760    # 10MB in bytes

# CORS (if needed)
ALLOWED_ORIGINS=https://dynastride.com,https://www.dynastride.com

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/dynastride/app.log

# Analytics (optional)
GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX-X
PLAUSIBLE_DOMAIN=dynastride.com

# Error Tracking (optional)
SENTRY_DSN=https://xxx@sentry.io/xxx

# Rate Limiting
RATE_LIMIT_WINDOW=15    # minutes
RATE_LIMIT_MAX=100      # requests per window
```

### Loading Environment Variables

Update `src/index.js` to load `.env`:

```javascript
// Add at top of file
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3000;
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;
```

Install dotenv:
```bash
npm install dotenv
```

### Security Configuration

#### Add Rate Limiting

```bash
npm install express-rate-limit
```

Add to `src/index.js`:
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

app.use('/api/', limiter);
```

#### Add Security Headers

```bash
npm install helmet
```

Add to `src/index.js`:
```javascript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
      scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));
```

#### Configure CORS

```bash
npm install cors
```

Add to `src/index.js`:
```javascript
import cors from 'cors';

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

---

## Production Setup

### DNS Configuration

Point your domain to your server:

**For VPS/EC2**:
```
Type: A
Name: @
Value: YOUR_SERVER_IP
TTL: 3600

Type: A
Name: www
Value: YOUR_SERVER_IP
TTL: 3600
```

**For Vercel**:
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 3600
```

### SSL/TLS Certificate

**Let's Encrypt (Free)**:
```bash
certbot --nginx -d dynastride.com -d www.dynastride.com --agree-tos --email coach@dynastride.com
```

**Commercial Certificate**:
1. Generate CSR:
```bash
openssl req -new -newkey rsa:2048 -nodes -keyout dynastride.key -out dynastride.csr
```

2. Purchase certificate from CA

3. Install certificate:
```bash
# Copy certificate files
cp dynastride.crt /etc/ssl/certs/
cp dynastride.key /etc/ssl/private/
cp ca-bundle.crt /etc/ssl/certs/

# Update Nginx configuration
# ssl_certificate /etc/ssl/certs/dynastride.crt;
# ssl_certificate_key /etc/ssl/private/dynastride.key;
```

### Firewall Configuration

```bash
# DigitalOcean Firewall
# Allow: SSH (22), HTTP (80), HTTPS (443)
# Deny: All other inbound

# AWS Security Groups
# Inbound Rules:
# SSH: 22, Source: Your IP
# HTTP: 80, Source: 0.0.0.0/0
# HTTPS: 443, Source: 0.0.0.0/0
# Outbound: All traffic
```

---

## Monitoring and Maintenance

### Application Monitoring

#### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# Application logs
pm2 logs dynastride-app

# CPU and memory usage
pm2 status
```

#### System Monitoring

```bash
# Install monitoring tools
apt install -y htop iotop nethogs

# Check system resources
htop
df -h
free -h
```

### Log Management

#### Configure Log Rotation

Create `/etc/logrotate.d/dynastride`:
```
/var/log/dynastride/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    create 0640 dynastride dynastride
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

Test:
```bash
logrotate -f /etc/logrotate.d/dynastride
```

### Automated Backups

#### Application Code

```bash
# Create backup script
cat > /usr/local/bin/backup-dynastride.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/dynastride"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
cd /home/dynastride/5kdecoded
tar -czf $BACKUP_DIR/dynastride_$DATE.tar.gz app/
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
EOF

chmod +x /usr/local/bin/backup-dynastride.sh

# Schedule daily backups
crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-dynastride.sh
```

#### Database (if implemented later)

```bash
# PostgreSQL backup
pg_dump -U dynastride dynastride_db > /backups/db_$(date +%Y%m%d).sql
```

### Performance Monitoring

#### Install Monitoring Tools

**New Relic** (Application Performance Monitoring):
```bash
npm install newrelic
# Configure with license key
```

**Prometheus + Grafana** (System Metrics):
```bash
# Install Node Exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.3.1/node_exporter-1.3.1.linux-amd64.tar.gz
tar xvfz node_exporter-1.3.1.linux-amd64.tar.gz
sudo mv node_exporter-1.3.1.linux-amd64/node_exporter /usr/local/bin/
```

### Uptime Monitoring

**Options**:
- **UptimeRobot** (free tier available)
- **Pingdom** (commercial)
- **StatusCake** (free tier available)

Configuration:
- Monitor: `https://dynastride.com/api/health`
- Frequency: Every 5 minutes
- Alert: Email/SMS on downtime

### Error Tracking

#### Sentry Integration

```bash
npm install @sentry/node
```

Add to `src/index.js`:
```javascript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Error handling middleware
app.use(Sentry.Handlers.errorHandler());
```

---

## Troubleshooting

### Common Issues

#### Application Won't Start

**Symptoms**: PM2 shows app as "errored" or "stopped"

**Diagnosis**:
```bash
pm2 logs dynastride-app --lines 50
```

**Solutions**:
- Check Node.js version: `node --version` (must be 18+)
- Verify dependencies: `npm install`
- Check port availability: `netstat -tlnp | grep 3000`
- Review environment variables: `pm2 env 0`

#### File Uploads Failing

**Symptoms**: 413 Payload Too Large or timeout errors

**Solutions**:
```nginx
# Increase Nginx upload limit
# In /etc/nginx/sites-available/dynastride
client_max_body_size 10M;

# Reload Nginx
systemctl reload nginx
```

#### High Memory Usage

**Symptoms**: Application crashes, PM2 restarts frequently

**Diagnosis**:
```bash
pm2 monit  # Check memory usage
free -h    # Check system memory
```

**Solutions**:
- Increase server RAM
- Enable PM2 memory limit:
```bash
pm2 start src/index.js --name dynastride-app --max-memory-restart 300M
```

#### SSL Certificate Errors

**Symptoms**: "Your connection is not private" warnings

**Solutions**:
```bash
# Check certificate expiry
certbot certificates

# Renew if needed
certbot renew --force-renewal

# Verify Nginx configuration
nginx -t
systemctl reload nginx
```

### Performance Issues

#### Slow Response Times

**Diagnosis**:
```bash
# Check application logs
pm2 logs dynastride-app

# Monitor real-time performance
pm2 monit

# Check Nginx access logs
tail -f /var/log/nginx/access.log
```

**Solutions**:
- Enable caching in Nginx
- Optimize Chart.js rendering
- Add CDN for static assets
- Scale horizontally with load balancer

#### Database Connection Issues (future)

**When database is added**:
```bash
# Check PostgreSQL status
systemctl status postgresql

# Verify connection
psql -U dynastride -d dynastride_db -c "SELECT 1"

# Check connection pool
# In application logs
```

---

## Rollback Procedures

### Emergency Rollback

If deployment causes critical issues:

#### PM2 Rollback

```bash
# Stop current application
pm2 stop dynastride-app

# Restore from backup
cd /home/dynastride
rm -rf 5kdecoded-current
tar -xzf /backups/dynastride/dynastride_YYYYMMDD_HHMMSS.tar.gz
mv 5kdecoded 5kdecoded-current

# Restart application
cd 5kdecoded-current/app
pm2 restart dynastride-app
```

#### Git Rollback

```bash
# View commit history
cd /home/dynastride/5kdecoded
git log --oneline

# Rollback to specific commit
git checkout COMMIT_HASH

# Install dependencies
cd app
npm install

# Restart application
pm2 restart dynastride-app
```

#### Vercel Rollback

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback DEPLOYMENT_URL
```

### Gradual Rollback

For controlled rollback with monitoring:

1. **Monitor Error Rate**: Check Sentry/logs for errors
2. **Redirect Traffic**: Use load balancer to shift traffic
3. **Verify Old Version**: Ensure backup is functioning
4. **Complete Rollback**: Redirect 100% traffic to old version
5. **Investigate Issue**: Debug in staging environment

---

## Post-Deployment Checklist

- [ ] Application accessible at domain
- [ ] HTTPS working correctly
- [ ] File upload tested with real FIT file
- [ ] Sample data analysis working
- [ ] All pages loading correctly
- [ ] Mobile responsiveness verified
- [ ] API endpoints responding
- [ ] Error logging configured
- [ ] Monitoring alerts set up
- [ ] Backup script scheduled
- [ ] SSL auto-renewal confirmed
- [ ] Firewall rules verified
- [ ] PM2 startup script configured
- [ ] DNS propagation complete (check with `dig dynastride.com`)
- [ ] Performance benchmarks met
- [ ] Security headers in place

---

## Maintenance Schedule

### Daily
- [ ] Check application logs for errors
- [ ] Monitor uptime alerts
- [ ] Review user feedback

### Weekly
- [ ] Check disk space usage
- [ ] Review access logs for anomalies
- [ ] Verify backup success
- [ ] Check SSL certificate expiry (90 days)

### Monthly
- [ ] Update Node.js dependencies (`npm update`)
- [ ] Review performance metrics
- [ ] Optimize database (if added)
- [ ] Security audit
- [ ] Review and rotate logs

### Quarterly
- [ ] Major dependency updates (`npm outdated`)
- [ ] Security penetration testing
- [ ] Disaster recovery drill
- [ ] Performance optimization review
- [ ] Documentation updates

---

## Support Contacts

**Application Owner**: Anthony Mallory
- **Email**: coach@dynastride.com
- **Website**: https://dynastride.com

**Technical Support**:
- **GitHub Issues**: https://github.com/YOUR_USERNAME/5kdecoded/issues
- **Deployment Issues**: Check this guide first
- **Emergency**: Contact server provider support

---

## Additional Resources

- **Node.js Docs**: https://nodejs.org/docs
- **Express.js Guide**: https://expressjs.com/
- **PM2 Documentation**: https://pm2.keymetrics.io/
- **Nginx Configuration**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/getting-started/
- **DigitalOcean Tutorials**: https://www.digitalocean.com/community/tutorials
- **AWS Documentation**: https://docs.aws.amazon.com/

---

**Deployment Guide Version**: 1.0.0
**Last Updated**: November 2025
**Next Review**: February 2026
