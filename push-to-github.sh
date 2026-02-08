#!/bin/bash

# Script to push code to GitHub with authentication

echo "Pushing code to GitHub..."
echo ""

# Check if using SSH or HTTPS
REMOTE_URL=$(git remote get-url origin)

if [[ $REMOTE_URL == *"git@github.com"* ]]; then
    echo "Using SSH authentication..."
    echo ""
    echo "If you see 'Permission denied', you need to add your SSH key to GitHub:"
    echo "1. Copy your public key:"
    echo "   cat ~/.ssh/id_ed25519.pub"
    echo ""
    echo "2. Go to: https://github.com/settings/keys"
    echo "3. Click 'New SSH key' and paste your public key"
    echo ""
    git push -u origin main
else
    echo "Using HTTPS authentication..."
    echo ""
    echo "You'll need a Personal Access Token (PAT):"
    echo "1. Go to: https://github.com/settings/tokens"
    echo "2. Generate a new token with 'repo' permissions"
    echo "3. Use your GitHub username and the token as password"
    echo ""
    git push -u origin main
fi
