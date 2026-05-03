#!/bin/bash
# =================================================================
# Eduscale EC2 Deployment Script (Ubuntu 22.04 / 24.04)
# =================================================================
# Run this script on your fresh EC2 instance to install all dependencies,
# clone your repository, and start the Dockerized stack and Auto-Scaler.

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting Eduscale EC2 Setup..."

# 1. Update system and install basic dependencies
echo "📦 Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y git curl unzip

# 2. Install Docker & Docker Compose
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker ubuntu
    rm get-docker.sh
    echo "✅ Docker installed."
else
    echo "✅ Docker already installed."
fi

echo "🐳 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed."
else
    echo "✅ Docker Compose already installed."
fi

# 3. Install Node.js (Required for the Auto-Scaler script)
echo "🟢 Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo "✅ Node.js installed."
else
    echo "✅ Node.js already installed."
fi

# 4. Install PM2 (Process Manager for keeping Auto-Scaler alive)
echo "⚙️ Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    echo "✅ PM2 installed."
else
    echo "✅ PM2 already installed."
fi

# 5. Setup Instructions
echo ""
echo "================================================================="
echo "🎉 EC2 Server Environment is Ready!"
echo "================================================================="
echo "Next Steps to deploy Eduscale:"
echo ""
echo "1. Clone your repository:"
echo "   git clone https://github.com/YOUR_GITHUB_USERNAME/Eduscale.git"
echo "   cd Eduscale"
echo ""
echo "2. Create your .env file with your Atlas, Upstash, and AWS keys:"
echo "   nano .env"
echo ""
echo "3. Start the Docker containers (Phase 5):"
echo "   docker-compose up --build -d"
echo ""
echo "4. Start the Auto-Scaler in the background (Phase 6):"
echo "   pm2 start scripts/autoscale.js --name eduscale-autoscaler -- --watch"
echo "   pm2 save"
echo "   pm2 startup"
echo "================================================================="
echo "Note: You may need to log out and log back in for Docker permissions to apply."
