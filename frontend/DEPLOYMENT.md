# ARC Main Website Deployment Guide

## Prerequisites

- Node.js 18+ installed on the server
- Git installed and configured
- Nginx or Apache web server
- PM2 (optional, for process management)
- SSL certificates (for HTTPS)

## Initial Server Setup

1. **Clone the repository:**
   ```bash
   cd /var/www
   git clone https://github.com/OneTechnology2023/ARC.git arc-website
   cd arc-website
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   nano .env
   ```

3. **Make deployment scripts executable:**
   ```bash
   chmod +x deploy.sh deploy-simple.sh
   ```

## Deployment Methods

### Method 1: Using the Full Deployment Script

The `deploy.sh` script includes:
- Automatic backups
- Build verification
- Permission setting
- Nginx reload
- Error handling

Run it with:
```bash
./deploy.sh
```

### Method 2: Using the Simple Deployment Script

For a basic deployment without extras:
```bash
./deploy-simple.sh
```

### Method 3: Manual Deployment

1. **Pull latest changes:**
   ```bash
   git pull origin frontend-master
   ```

2. **Install dependencies:**
   ```bash
   npm ci
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Set permissions:**
   ```bash
   chmod -R 755 build/
   ```

## Web Server Configuration

### Nginx

1. **Copy the example configuration:**
   ```bash
   sudo cp nginx.conf.example /etc/nginx/sites-available/arc-website
   ```

2. **Edit the configuration:**
   ```bash
   sudo nano /etc/nginx/sites-available/arc-website
   # Update server_name and paths
   ```

3. **Enable the site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/arc-website /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Apache

Create a `.htaccess` file in the build directory:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

## SSL Setup (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Process Management with PM2 (Optional)

If you're running a Node.js backend:

1. **Install PM2:**
   ```bash
   npm install -g pm2
   ```

2. **Create ecosystem file:**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'arc-website',
       script: 'server.js',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   };
   ```

3. **Start the application:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

## Environment Variables

Ensure these are set in your `.env` file:
- `REACT_APP_API_BASE_URL` - Your API endpoint
- `REACT_APP_GOOGLE_MAP_KEY` - Google Maps API key
- Other API keys and configuration

## Troubleshooting

### Build Folder Not Found
- Check if `npm run build` completed successfully
- Ensure you have enough disk space
- Check Node.js version compatibility

### Permission Denied Errors
```bash
sudo chown -R www-data:www-data /var/www/arc-website
```

### Nginx 403 Forbidden
- Check file permissions
- Ensure `index.html` exists in the build folder
- Verify Nginx user has read access

### Page Refresh Returns 404
- Ensure your web server is configured for SPA routing
- Check the try_files directive in Nginx
- For Apache, ensure mod_rewrite is enabled

## Rollback Procedure

If deployment fails, restore from backup:
```bash
cd /var/www/arc-website
tar -xzf backups/backup_[TIMESTAMP].tar.gz -C /
```

## Monitoring

- Check Nginx logs: `/var/log/nginx/arc-website.error.log`
- Monitor with PM2: `pm2 monit`
- Set up health checks and alerts

## Security Checklist

- [ ] Environment variables are not exposed
- [ ] SSL certificates are valid
- [ ] Security headers are configured
- [ ] File permissions are restrictive
- [ ] Backups are automated
- [ ] Error pages don't expose sensitive info
