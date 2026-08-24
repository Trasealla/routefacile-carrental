# Fix Docker Compose Port Mapping

## Problem
The container serves on port 80, but docker-compose maps `3000->3030`, causing 502 Bad Gateway.

## Solution

### Step 1: Find the docker-compose.yml file
The file is likely in `~/ARC` directory, not `~/frontend`.

```bash
cd ~/ARC
ls -la docker-compose.yml
```

### Step 2: Check current configuration
```bash
cat docker-compose.yml | grep -A 15 "react-app"
```

### Step 3: Fix the port mapping

The react-app service should have:
```yaml
services:
  react-app:
    # ... other config ...
    ports:
      - "3000:80"  # NOT "3000:3030"
```

### Step 4: Edit the file
```bash
cd ~/ARC
nano docker-compose.yml
# or
vim docker-compose.yml
```

Look for the `react-app` service and change:
- FROM: `"3000:3030"` or `3000:3030`
- TO: `"3000:80"` or `3000:80`

### Step 5: Restart the service
```bash
cd ~/ARC
sudo docker-compose down react-app
sudo docker-compose up -d react-app

# Or if using newer docker compose syntax:
sudo docker compose down react-app
sudo docker compose up -d react-app
```

### Step 6: Verify
```bash
# Check container is running
sudo docker ps | grep react-app

# Test the endpoint
curl -I http://localhost:3000

# Check container logs
sudo docker logs arc-react-app-1 --tail 20
```

### Step 7: Check host nginx (if still getting 502)
If you're accessing via domain name, check host nginx config:
```bash
sudo cat /etc/nginx/sites-enabled/default | grep -A 10 "proxy_pass"
```

It should proxy to `http://localhost:3000` (or whatever port you mapped).


