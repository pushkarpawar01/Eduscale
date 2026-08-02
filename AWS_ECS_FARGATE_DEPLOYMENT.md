# AWS ECS / Fargate Deployment Guide & Architecture

This document provides the complete, step-by-step manual deployment guide for hosting the containerized Eduscale LMS on AWS Elastic Container Service (ECS) using serverless Fargate compute, including Load Balancing, Service Auto Scaling, and all known troubleshooting steps.

---

## 1. System Architecture

```
Internet (User Browser)
         │
         ▼
 Internet Gateway (eduscale-igw)
         │
         ▼
 Application Load Balancer (eduscale-alb) ← eduscale-alb-sg (Port 80, 443)
         │
         ├─── Rule 1: Path = /api/*  ──────────► eduscale-backend-tg (Port 5000)
         │                                              │
         │                                    ┌─────────┴──────────┐
         │                                    │                    │
         │                               Backend Task 1      Backend Task 2
         │                               (Fargate, 0.5vCPU)  (Fargate, 0.5vCPU)
         │
         └─── Default Rule ────────────────► eduscale-frontend-tg (Port 80)
                                                       │
                                              Frontend Task 1
                                              (Fargate, 0.25vCPU)
                                              Nginx serving React build

VPC: eduscale-vpc (10.0.0.0/16)
├── Subnet: eduscale-public-1 (10.0.1.0/24) — ap-south-1a
└── Subnet: eduscale-public-2 (10.0.2.0/24) — ap-south-1b

ECR Registry:
├── eduscale-backend  (Node.js/Express image)
└── eduscale-frontend (Nginx + React build image)
```

---

## Phase 1: Push Docker Images to AWS ECR

**ECR** is AWS's private Docker image registry (like Docker Hub, but private and inside AWS).

### Step 1.1 — Create ECR Repositories
1. Go to **AWS Console → Elastic Container Registry (ECR) → Create Repository**.
2. Create **two repositories** (both **Private**):
   - `eduscale-backend`
   - `eduscale-frontend`

### Step 1.2 — Fix Docker Desktop Credential Helper (Windows only)
On Windows, Docker Desktop uses its own credential manager that blocks ECR auth via pipes.

1. Open the Docker config file:
   ```powershell
   notepad "$env:USERPROFILE\.docker\config.json"
   ```
2. Find the line `"credsStore": "desktop"` and change it to `"credsStore": ""`.
3. Save and restart Docker Desktop.

> ⚠️ If the pipe `|` method still fails, use the PowerShell variable method below instead.

### Step 1.3 — Authenticate Docker with ECR
```powershell
# Use variable assignment to bypass pipe conflict on Windows
$ECR_PASSWORD = aws ecr get-login-password --region ap-south-1
docker login --username AWS --password "$ECR_PASSWORD" 211374268121.dkr.ecr.ap-south-1.amazonaws.com
```
You should see `Login Succeeded`.

### Step 1.4 — Build, Tag, and Push Backend Image
```powershell
cd C:\Users\user\OneDrive\Desktop\Eduscale\server
docker build -t eduscale-backend .
docker tag eduscale-backend:latest 211374268121.dkr.ecr.ap-south-1.amazonaws.com/eduscale-backend:latest
docker push 211374268121.dkr.ecr.ap-south-1.amazonaws.com/eduscale-backend:latest
```

### Step 1.5 — Build, Tag, and Push Frontend Image

> ⚠️ **Critical:** Before building the frontend image for AWS ECS, ensure `client/nginx.conf` does NOT have the `/api/` proxy block pointing to `http://loadbalancer:8080`. That was for Docker Compose only. In AWS, the ALB handles all routing. Remove that block if present.

```powershell
cd C:\Users\user\OneDrive\Desktop\Eduscale\client
docker build -t eduscale-frontend .
docker tag eduscale-frontend:latest 211374268121.dkr.ecr.ap-south-1.amazonaws.com/eduscale-frontend:latest
docker push 211374268121.dkr.ecr.ap-south-1.amazonaws.com/eduscale-frontend:latest
```

---

## Phase 2: VPC & Networking

### Step 2.1 — Create VPC
1. Go to **AWS Console → VPC → Create VPC**.
2. Settings:
   - **Resources to create:** VPC only
   - **Name tag:** `eduscale-vpc`
   - **IPv4 CIDR:** `10.0.0.0/16`
   - **Tenancy:** Default
3. Click **Create VPC**.

### Step 2.2 — Create 2 Subnets
You need 2 subnets in 2 different Availability Zones (mandatory for ALB).

1. Go to **VPC → Subnets → Create subnet**.
2. Select `eduscale-vpc`.
3. **Subnet 1:**
   - **Name:** `eduscale-public-1`
   - **Availability Zone:** `ap-south-1a`
   - **CIDR:** `10.0.1.0/24`
4. Click **Add new subnet** (on the same page). **Subnet 2:**
   - **Name:** `eduscale-public-2`
   - **Availability Zone:** `ap-south-1b`
   - **CIDR:** `10.0.2.0/24`
5. Click **Create subnet**.
6. For **each** subnet: select it → **Actions → Edit subnet settings → Enable auto-assign public IPv4 address → Save**.

### Step 2.3 — Create Internet Gateway
1. Go to **VPC → Internet gateways → Create internet gateway**.
2. **Name tag:** `eduscale-igw`.
3. Click **Create**.
4. Click **Actions → Attach to VPC** → select `eduscale-vpc`.
5. Status should now show **Attached**.

### Step 2.4 — Configure Route Table
1. Go to **VPC → Route tables** → find the route table for `eduscale-vpc`.
2. **Routes tab → Edit routes → Add route:**
   - **Destination:** `0.0.0.0/0`
   - **Target:** Internet Gateway → `eduscale-igw`
   - Click Save.
3. **Subnet associations tab → Edit subnet associations:**
   - Check both `eduscale-public-1` and `eduscale-public-2`.
   - Click Save.

---

## Phase 3: Security Groups

Security Groups are AWS firewalls. The key rule: containers should only accept traffic from the ALB, never directly from the internet.

### Step 3.1 — ALB Security Group
1. Go to **EC2 → Security Groups → Create security group**.
2. **Name:** `eduscale-alb-sg`, **VPC:** `eduscale-vpc`
3. **Inbound rules:**
   - HTTP (Port `80`) from `0.0.0.0/0`
   - HTTPS (Port `443`) from `0.0.0.0/0`
4. Click **Create security group**.

### Step 3.2 — ECS Tasks Security Group
1. Click **Create security group**.
2. **Name:** `eduscale-ecs-sg`, **VPC:** `eduscale-vpc`
3. **Inbound rules:**
   - Custom TCP Port `80` → Source: **select `eduscale-alb-sg`** (not an IP — select the group itself)
   - Custom TCP Port `5000` → Source: **select `eduscale-alb-sg`**
4. Click **Create security group**.

---

## Phase 4: IAM Role for ECS

This role allows your containers to pull images from ECR and write logs to CloudWatch.

1. Go to **IAM → Roles → Create role**.
2. **Trusted entity type:** AWS service.
3. **Use case:** Elastic Container Service → **Elastic Container Service Task**.
4. Click **Next**.
5. Search for and select: `AmazonECSTaskExecutionRolePolicy`.
6. Click **Next**.
7. **Role name:** `eduscale-ecs-task-role`.
8. Click **Create role**.

---

## Phase 5: Application Load Balancer

### Step 5.1 — Create Target Groups
Target Groups are logical pools that the ALB routes traffic into.

1. Go to **EC2 → Target Groups → Create target group**.
2. **Frontend Target Group:**
   - **Target type:** IP addresses ← (required for Fargate)
   - **Name:** `eduscale-frontend-tg`
   - **Protocol:** HTTP, **Port:** `80`
   - **VPC:** `eduscale-vpc`
   - **Health check path:** `/`
   - Skip registering targets → **Create target group**.

3. **Backend Target Group** (repeat):
   - **Target type:** IP addresses
   - **Name:** `eduscale-backend-tg`
   - **Protocol:** HTTP, **Port:** `5000`
   - **VPC:** `eduscale-vpc`
   - **Health check path:** `/health` ← (uses the `/health` endpoint in server.js)
   - Skip registering targets → **Create target group**.

### Step 5.2 — Create the Application Load Balancer
1. Go to **EC2 → Load Balancers → Create load balancer → Application Load Balancer**.
2. **Name:** `eduscale-alb`, **Scheme:** Internet-facing, **IP type:** IPv4.
3. **Network mapping:** Select `eduscale-vpc` and check both public subnets.
4. **Security groups:** Remove the default, select only `eduscale-alb-sg`.
5. **Listeners:** Default action → Forward to `eduscale-frontend-tg`.
6. Click **Create load balancer**.

### Step 5.3 — Add API Routing Rule
1. Click on `eduscale-alb` → **Listeners and rules** tab → click the **Port 80** rule count.
2. Click **Add rule**.
3. **Condition type:** Path, **Match type:** Value matching, **Value:** `/api/*`.
4. **Action:** Forward to `eduscale-backend-tg`.
5. **Priority:** `1`.
6. Save.

> ⚠️ **Critical:** Verify that the **Default Rule** (the last row) forwards to `eduscale-frontend-tg`, NOT the backend. If the default rule points to the backend, all asset files (`/assets/*.js`) will be served by Express (which returns 404) instead of Nginx.

---

## Phase 6: ECS Cluster & Task Definitions

### Step 6.1 — Create ECS Cluster
1. Go to **ECS → Clusters → Create cluster**.
2. **Name:** `eduscale-cluster`.
3. **Infrastructure:** AWS Fargate (serverless).
4. Click **Create**.

### Step 6.2 — Create Backend Task Definition
1. Go to **ECS → Task definitions → Create new task definition**.
2. **Family:** `eduscale-backend-task`
3. **Infrastructure:** Fargate, Linux/X86_64.
4. **Task size:** 0.5 vCPU, 1 GB Memory.
5. **Task role:** `eduscale-ecs-task-role`
6. **Task execution role:** `eduscale-ecs-task-role`
7. **Container:**
   - **Name:** `backend-container`
   - **Image URI:** `211374268121.dkr.ecr.ap-south-1.amazonaws.com/eduscale-backend:latest`
   - **Port mappings:** Container port `5000`, Protocol TCP, App protocol HTTP.
8. **Environment variables** (add all of these):

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `MONGO_URI` | your MongoDB Atlas connection string |
   | `REDIS_URL` | your Upstash Redis URL |
   | `JWT_SECRET` | your JWT secret key |
   | `REFRESH_TOKEN_SECRET` | your refresh token secret |
   | `FRONTEND_URL` | `http://eduscale-alb-xxx.ap-south-1.elb.amazonaws.com` |
   | `AWS_ACCESS_KEY_ID` | your AWS key |
   | `AWS_SECRET_ACCESS_KEY` | your AWS secret |
   | `AWS_REGION` | `ap-south-1` |
   | `AWS_S3_BUCKET_NAME` | your S3 bucket name |
   | `EMAIL_SERVICE` | `gmail` |
   | `EMAIL_USER` | your email |
   | `EMAIL_PASS` | your app password |
   | `RAZORPAY_KEY_ID` | your Razorpay key |
   | `RAZORPAY_KEY_SECRET` | your Razorpay secret |

9. Click **Next** → **Create**.

### Step 6.3 — Create Frontend Task Definition
1. **Family:** `eduscale-frontend-task`
2. **Infrastructure:** Fargate, 0.25 vCPU, 0.5 GB Memory.
3. **Task execution role:** `eduscale-ecs-task-role`
4. **Container:**
   - **Name:** `frontend-container`
   - **Image URI:** `211374268121.dkr.ecr.ap-south-1.amazonaws.com/eduscale-frontend:latest`
   - **Port mappings:** Container port `80`.
5. No environment variables needed (Vite baked them at build time).
6. Click **Next** → **Create**.

---

## Phase 7: ECS Services (Deploying Containers)

### Step 7.1 — Create Backend Service
1. Go to **ECS → Clusters → `eduscale-cluster`** → Services tab → **Create**.
2. **Compute:** Launch type → Fargate.
3. **Deployment configuration:**
   - Application type: **Service**
   - Family: `eduscale-backend-task` (latest revision)
   - Service name: `eduscale-backend-service`
   - Desired tasks: `2`
4. **Networking:**
   - VPC: `eduscale-vpc`
   - Subnets: both public subnets
   - Security group: `eduscale-ecs-sg`
   - Public IP: **Turn ON**
5. **Load balancing:**
   - Type: Application Load Balancer
   - Load balancer: `eduscale-alb`
   - Container: `backend-container 5000:5000`
   - Listener: **Use existing listener** → `80:HTTP`
   - Target group: **Use existing target group** → `eduscale-backend-tg` ← (critical!)
6. Click **Create**.

### Step 7.2 — Create Frontend Service
1. Click **Create** again in the cluster.
2. **Launch type:** Fargate.
3. **Family:** `eduscale-frontend-task`, Service name: `eduscale-frontend-service`, Desired tasks: `1`.
4. **Networking:** Both subnets, `eduscale-ecs-sg`, Public IP ON.
5. **Load balancing:**
   - Load balancer: `eduscale-alb`
   - Container: `frontend-container 80:80`
   - Listener: **Use existing listener** → `80:HTTP`
   - Target group: **Use existing target group** → `eduscale-frontend-tg`
6. Click **Create**.

### Step 7.3 — Verify Deployment
Wait 2-3 minutes, then verify:
1. Both services show **"Active"** status.
2. Go to **EC2 → Target Groups → `eduscale-backend-tg`** → Targets tab → you should see **2 healthy** targets.
3. Go to **EC2 → Target Groups → `eduscale-frontend-tg`** → Targets tab → you should see **1 healthy** target.
4. Copy the **ALB DNS name** and open it in your browser.

---

## Phase 8: ECS Service Auto Scaling

AWS ECS Auto Scaling uses CloudWatch to monitor CPU usage and automatically adds or removes Fargate tasks.

### How it Works
```
Traffic Spike
    │
    ▼
CloudWatch detects CPU > 70% across backend tasks
    │
    ▼
Application Auto Scaling policy triggers
    │
    ▼
ECS launches new Fargate tasks (pulls image from ECR)
    │
    ▼
New tasks pass /health check and register into eduscale-backend-tg
    │
    ▼
ALB distributes traffic across all running tasks
    │
    ▼
Traffic drops → cooldown period → ECS scales back in
```

### Step 8.1 — Enable Auto Scaling on Backend Service
1. Go to **ECS → Clusters → `eduscale-cluster`**.
2. Click **`eduscale-backend-service`** → **Update service**.
3. Scroll to **"Service auto scaling"** section.
4. Toggle **"Use service auto scaling"** ON.
5. Configure:

   | Setting | Value |
   |---|---|
   | **Minimum number of tasks** | `2` |
   | **Maximum number of tasks** | `10` |
   | **Policy type** | Target tracking |
   | **ECS service metric** | ECSServiceAverageCPUUtilization |
   | **Target value** | `70` |
   | **Scale-out cooldown period** | `60` seconds |
   | **Scale-in cooldown period** | `300` seconds |

6. Click **Update**.

### Auto Scaling vs Custom autoscale.js (Comparison)

| Feature | Custom `autoscale.js` (Docker Compose) | AWS ECS Auto Scaling |
|---|---|---|
| **Who monitors** | Your Node.js script via PM2 | AWS CloudWatch (always-on) |
| **Response time** | ~30 seconds (polling interval) | ~60 seconds |
| **Reliability** | Depends on PM2 staying alive | AWS-managed, never crashes |
| **New instance startup** | Instant (Docker image cached) | ~60–90 seconds (Fargate cold start) |
| **Load balancing** | Custom Nginx upstream config | AWS ALB (fully automatic) |
| **Downscale protection** | Custom cooldown in script | Configurable cooldown periods |
| **Cost** | Runs on existing EC2 server | Free (CloudWatch metrics included) |

---

## Troubleshooting Guide

### Problem: 503 Service Temporarily Unavailable on `/api/*` calls
**Cause:** The backend target group has 0 registered targets — the backend ECS tasks are not running or are crashing.
**Fix:**
1. Go to **ECS → Clusters → `eduscale-cluster`** → click the backend service → **Events tab**.
2. Check if tasks are stuck in a crash loop.
3. Click on a stopped task → **Containers → View logs in CloudWatch** to see the exact error.
4. Most common cause: missing or incorrect environment variables in the Task Definition.

### Problem: Backend service registered to wrong target group
**Symptom:** ECS Events tab shows `registered 1 targets in target-group eduscale-frontend-tg` instead of `eduscale-backend-tg`.
**Fix:** Update the service → change the target group to `eduscale-backend-tg` → force new deployment.

### Problem: `/assets/*.js` returns 404 with `X-Powered-By: Express`
**Cause:** The ALB Default Rule is forwarding ALL traffic (including static assets) to the backend Express server.
**Fix:** Go to ALB → Listener Rules → edit the **Default Rule** → change it to forward to `eduscale-frontend-tg`.

### Problem: Frontend Nginx container crashes on Fargate startup
**Cause:** The `client/nginx.conf` still contains a proxy block pointing to `http://loadbalancer:8080` from the Docker Compose setup. This hostname does not exist in AWS.
**Fix:** Remove the `/api/` location block from `client/nginx.conf`, rebuild the frontend image, push to ECR, and force a new deployment.

### Problem: ECR Docker login returns 400 Bad Request
**Cause:** Docker Desktop's `"credsStore": "desktop"` in `config.json` conflicts with ECR authentication via pipes.
**Fix:**
1. Edit `$env:USERPROFILE\.docker\config.json` and set `"credsStore": ""`.
2. Use the PowerShell variable method:
   ```powershell
   $ECR_PASSWORD = aws ecr get-login-password --region ap-south-1
   docker login --username AWS --password "$ECR_PASSWORD" <ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com
   ```

---

## Pushing Code Updates (Re-deploying)

Whenever you push new code, follow these steps to update the running ECS services with zero downtime:

```powershell
# 1. Rebuild and push the updated image
$ECR_PASSWORD = aws ecr get-login-password --region ap-south-1
docker login --username AWS --password "$ECR_PASSWORD" 211374268121.dkr.ecr.ap-south-1.amazonaws.com

# For backend changes:
cd server
docker build -t eduscale-backend .
docker tag eduscale-backend:latest 211374268121.dkr.ecr.ap-south-1.amazonaws.com/eduscale-backend:latest
docker push 211374268121.dkr.ecr.ap-south-1.amazonaws.com/eduscale-backend:latest

# For frontend changes:
cd ../client
docker build -t eduscale-frontend .
docker tag eduscale-frontend:latest 211374268121.dkr.ecr.ap-south-1.amazonaws.com/eduscale-frontend:latest
docker push 211374268121.dkr.ecr.ap-south-1.amazonaws.com/eduscale-frontend:latest
```

```
# 2. Force new deployment in AWS Console:
ECS → Clusters → eduscale-cluster → select service → Update
→ Check "Force new deployment" → Update
```

ECS will perform a **rolling deployment** — it starts new tasks first, waits for them to pass the health check, then drains and stops the old ones. **Zero downtime.**

---

*Document generated for Eduscale Architecture — AWS ECS/Fargate Deployment V1.0*
