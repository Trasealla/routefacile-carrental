# Troubleshooting 502 Bad Gateway Error

## Common Causes and Solutions

### 1. If Using Docker

**Problem:** Dockerfile is trying to run `npm run start` which starts a development server that doesn't work in production.

**Solution:** Use the updated Dockerfile that serves static files with nginx:
```bash
docker build -t arc-frontend .
docker run -d -p 80:80 arc-frontend
```

### 2. If Using Nginx Directly (No Docker)

**Problem:** Nginx is configured to proxy to a backend server that isn't running, or the build directory path is incorrect.

**Check these:**

1. **Verify build directory exists:**
   ```bash
   ls -la /var/www/arc-website/build
   # Should show index.html and other files
   ```

2. **Check nginx configuration:**
   ```bash
   sudo nginx -t
   # Should show "syntax is ok"
   ```

3. **Verify nginx is pointing to the correct directory:**
   ```bash
   sudo cat /etc/nginx/sites-available/arc-website | grep root
   # Should show: root /var/www/arc-website/build;
   ```

4. **Check nginx error logs:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

5. **Check if nginx is running:**
   ```bash
   sudo systemctl status nginx
   ```

### 3. If Nginx is Proxying to a Backend

**Problem:** Nginx configuration has a `proxy_pass` directive pointing to a server that isn't running.

**Solution:** For a React static site, you should NOT use `proxy_pass`. Instead, use `root` and `try_files`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    root /var/www/arc-website/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 4. File Permissions

**Problem:** Nginx doesn't have permission to read the files.

**Solution:**
```bash
sudo chown -R www-data:www-data /var/www/arc-website/build
sudo chmod -R 755 /var/www/arc-website/build
```

### 5. Build Failed

**Problem:** The build didn't complete successfully.

**Solution:**
```bash
# Check if build directory exists and has content
ls -la build/

# Rebuild if needed
npm run build

# Verify build output
ls -la build/static/
```

### 6. Port Conflicts

**Problem:** Another service is using port 80.

**Solution:**
```bash
# Check what's using port 80
sudo lsof -i :80
# or
sudo netstat -tulpn | grep :80

# Stop conflicting service or change nginx port
```

### 7. SELinux Issues (CentOS/RHEL)

**Problem:** SELinux is blocking nginx from accessing files.

**Solution:**
```bash
# Check SELinux status
getenforce

# If Enforcing, set context
sudo chcon -R -t httpd_sys_content_t /var/www/arc-website/build
```

## Quick Diagnostic Commands

```bash
# 1. Check nginx status
sudo systemctl status nginx

# 2. Test nginx configuration
sudo nginx -t

# 3. Check nginx error logs
sudo tail -50 /var/log/nginx/error.log

# 4. Check if build files exist
ls -la /var/www/arc-website/build/

# 5. Check nginx configuration
sudo cat /etc/nginx/sites-available/arc-website

# 6. Check file permissions
ls -la /var/www/arc-website/build/index.html

# 7. Restart nginx
sudo systemctl restart nginx
```

## Step-by-Step Fix

1. **Stop nginx:**
   ```bash
   sudo systemctl stop nginx
   ```

2. **Verify build exists:**
   ```bash
   cd /var/www/arc-website
   ls -la build/index.html
   ```

3. **Update nginx config** (if needed):
   ```bash
   sudo nano /etc/nginx/sites-available/arc-website
   # Ensure it uses 'root' not 'proxy_pass'
   ```

4. **Test configuration:**
   ```bash
   sudo nginx -t
   ```

5. **Fix permissions:**
   ```bash
   sudo chown -R www-data:www-data /var/www/arc-website/build
   ```

6. **Start nginx:**
   ```bash
   sudo systemctl start nginx
   ```

7. **Check status:**
   ```bash
   sudo systemctl status nginx
   curl http://localhost
   ```


