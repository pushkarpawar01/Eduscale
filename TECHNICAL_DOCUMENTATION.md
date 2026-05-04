# Eduscale LMS — Comprehensive Technical Documentation

## 1. Project Overview
**Eduscale** is a highly scalable, production-ready Learning Management System (LMS) built with the MERN stack (MongoDB, Express, React, Node.js). 

The primary objective of the architecture is to handle "Exam Season" traffic spikes seamlessly with zero downtime. This is achieved through stateless authentication, aggressive Redis caching, asynchronous non-blocking logging, Docker containerization, dynamic Nginx load balancing, and automated CPU-based scaling.

---

## 2. Technology Stack
*   **Frontend**: React.js, Vite, TailwindCSS, Axios
*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB Atlas (Cloud)
*   **Cache & Session Store**: Upstash Redis (Cloud)
*   **Containerization**: Docker, Docker Compose
*   **Web Server & Reverse Proxy**: Nginx (Alpine)
*   **Process Manager**: PM2 (for Auto-Scaler daemon)
*   **Cloud Provider**: AWS EC2 (Ubuntu 24.04/22.04 LTS)

---

## 3. Architectural Evolution (Phases)

### Phase 1-3: Core Application
The foundation of the LMS. Implements role-based access (Student, Admin, Instructor), Course creation, Video/Content delivery, Razorpay payment gateway integration, and basic Analytics.

### Phase 4: Scalability Implementation
To prevent the backend from bottlenecking during high traffic, three major architectural shifts were made:

1.  **Stateless Authentication with Revocation**: 
    Removed stateful server sessions. JWTs (JSON Web Tokens) are used. To allow instant logout/revocation across distributed servers without database hits, a **JTI (JWT ID) Blacklist** was implemented in Redis. 
2.  **Cache-Aside Pattern (Redis)**: 
    Heavy endpoints (like fetching all courses or enrollments) check Redis first. If a Cache MISS occurs, data is fetched from MongoDB, sent to the user, and simultaneously cached in Redis for subsequent requests. Designed with "fail-open" logic: if Redis crashes, the system gracefully degrades to direct MongoDB queries without throwing 500 errors.
3.  **In-Process Asynchronous Logging**: 
    Database logging was removed from the API response cycle. A custom queue using `setImmediate` defers log writing until *after* the HTTP response is sent, guaranteeing zero-latency logging.

### Phase 5: Docker Containerization
The system was containerized to ensure identical execution environments across local development and AWS production.

*   **Backend Dockerfile**: Uses `node:20-alpine` (for a 5MB base OS). Leverages Docker Layer Caching by copying `package.json` and running `npm ci --only=production` before copying source code.
*   **Frontend Dockerfile (Multi-Stage)**: 
    *   *Stage 1*: Node builds the Vite React app into static HTML/CSS/JS (`/dist`).
    *   *Stage 2*: Copies *only* the `/dist` folder into a lightweight `nginx:alpine` image. Node.js is entirely removed from the final frontend image, reducing size to ~25MB and eliminating vulnerabilities.
*   **Frontend Nginx Config**: Proxies `/api/*` requests to the backend, serves SPA routes via `try_files /index.html` to prevent 404s on refresh, and applies 1-year browser cache headers to static assets.

### Phase 6: Load Balancing & Auto-Scaling
To support multiple backend instances processing requests simultaneously:

*   **Nginx Load Balancer**: A dedicated `loadbalancer` Docker service was placed between the frontend and backend. It uses Docker's internal DNS resolver (`127.0.0.11`) to dynamically discover backend IP addresses. If scaled from 2 to 10 instances, Nginx immediately begins Round-Robin distribution without requiring a restart.
*   **Auto-Scaler Daemon (`scripts/autoscale.js`)**: A custom Node.js script that polls `docker stats` every 30 seconds. 
    *   *Scale Up*: If average CPU across all backend containers exceeds 70%.
    *   *Scale Down*: If average CPU drops below 30%.
    *   Executes `docker-compose up --scale backend=N` automatically.

---

## 4. Complete AWS EC2 Deployment Guide

This section covers deploying the Phase 5/6 architecture to a raw AWS EC2 Linux instance.

### Step 4.1: AWS Infrastructure Setup
1.  Navigate to **AWS EC2 Console** -> **Launch Instance**.
2.  **OS**: Select **Ubuntu Server 24.04 LTS** (or 22.04 LTS).
3.  **Instance Type**: `t3.medium` (Recommended minimum: 2 vCPUs, 4GB RAM).
4.  **Network Settings (Security Group)**: Add inbound rules for:
    *   **SSH**: Port 22 (Source: Anywhere / Your IP)
    *   **HTTP**: Port 80 (Source: Anywhere 0.0.0.0/0)
    *   **HTTPS**: Port 443 (Source: Anywhere 0.0.0.0/0)
5.  Generate a Key Pair `.pem` file and Launch.

### Step 4.2: Connecting to the Server
Open your local terminal (Windows PowerShell / Mac Terminal):
```bash
# Set secure permissions on your key (Mac/Linux only)
chmod 400 your-key.pem

# SSH into the server
ssh -i "your-key.pem" ubuntu@<YOUR_EC2_PUBLIC_IP>
```

### Step 4.3: Automated Server Setup
Once inside the EC2 server, clone your code and run the automated setup script. This script installs Docker, Docker Compose, Node.js, and PM2.

```bash
# 1. Clone Repository
git clone https://github.com/YOUR_GITHUB_USERNAME/Eduscale.git
cd Eduscale

# 2. Run Setup Script
bash scripts/ec2-deploy.sh

# 3. Apply Docker Permissions (Required so you don't need 'sudo' for docker)
newgrp docker
```

### Step 4.4: Environment Variables Setup
You must configure the cloud database and secret keys.

```bash
nano .env
```
Paste your production values:
```env
MONGO_URI=mongodb+srv://<USER>:<PASS>@cluster0...
REDIS_URL=rediss://default:<PASS>@...upstash.io:6379
JWT_SECRET=your_super_secret_jwt_key
REFRESH_TOKEN_SECRET=your_refresh_secret
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=eu-north-1
AWS_S3_BUCKET_NAME=your_bucket_name
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```
*(Press `Ctrl+O`, `Enter` to save, then `Ctrl+X` to exit).*

### Step 4.5: Initial Build & Deployment
Build the Docker images from scratch and start the environment with 2 load-balanced backend instances:

```bash
# The -d flag runs it in the background (detached mode)
docker-compose up --build -d --scale backend=2
```

At this point, your LMS is live! Type your EC2 Public IP address into your browser to verify.

### Step 4.6: Enabling the Auto-Scaler Daemon
To ensure the server scales up automatically during traffic spikes, start the `autoscale.js` script using PM2 (Process Manager).

```bash
# Start the auto-scaler in watch mode
pm2 start scripts/autoscale.js --name eduscale-autoscaler -- --watch

# Save the PM2 state so it auto-starts if the EC2 server reboots
pm2 save
pm2 startup
```
To view the live ASCII dashboard of your CPU usage and scaling events:
```bash
pm2 logs eduscale-autoscaler
```

---

## 5. Maintenance & Useful Commands

### Pushing Code Updates (CI/CD Manual Flow)
When you push new code to GitHub, here is how you update the live AWS server with zero downtime:

```bash
# 1. Pull latest code
git pull origin main

# 2. Rebuild the specific image that changed without cache
# For backend changes:
docker-compose build --no-cache backend
# For frontend changes:
docker-compose build --no-cache frontend

# 3. Apply the changes gracefully (Restart containers)
docker-compose up -d --scale backend=2 --no-recreate
```

### Manual Scaling (Exam Mode)
If you know a major traffic event is coming and don't want to wait for CPU to trigger the auto-scaler:

```bash
# Instantly scale to 10 instances
docker-compose up -d --scale backend=10 --no-recreate
```

### Viewing Logs & Troubleshooting
```bash
# View backend API logs
docker-compose logs -f backend

# View frontend/Nginx routing logs
docker-compose logs -f frontend

# View Load Balancer logs
docker-compose logs -f loadbalancer

# Verify Load Balancer Distribution
# Run this multiple times; the "instance" value will rotate between containers
curl http://localhost:5000/health
```

### Complete Stack Teardown
If you need to stop all containers and remove networks:
```bash
docker-compose down
```

---
*Document generated for Eduscale Architecture V1.0*
