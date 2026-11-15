#!/bin/bash
echo "🔧 Setting up browsers..."

# Install Chrome
if ! command -v google-chrome-stable &> /dev/null; then
    echo "Installing Google Chrome..."
    wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
    sudo apt install -y ./google-chrome-stable_current_amd64.deb
    rm -f google-chrome-stable_current_amd64.deb
fi

# Install Edge
if ! command -v microsoft-edge-stable &> /dev/null; then
    echo "Installing Microsoft Edge..."
    curl -s https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
    sudo install -o root -g root -m 644 microsoft.gpg /usr/share/keyrings/microsoft-archive-keyring.gpg
    sudo sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft-archive-keyring.gpg] https://packages.microsoft.com/repos/edge stable main" > /etc/apt/sources.list.d/microsoft-edge.list'
    sudo apt update -y
    sudo apt install -y microsoft-edge-stable
    rm -f microsoft.gpg
fi

echo "✅ Browsers installed successfully!"
