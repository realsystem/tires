#!/bin/bash

# Deploy to overlandn.com/tires
# Usage: ./deploy-overlandn.sh

set -e

echo "🔨 Building production bundle..."
npm run build

echo ""
echo "📦 Build complete! Files ready in ./dist/"
echo ""
echo "📤 To deploy to overlandn.com/tires:"
echo ""
echo "Option 1: Manual upload (SCP)"
echo "  scp -r dist/* your-user@your-server:/var/www/overlandn.com/tires/"
echo ""
echo "Option 2: Manual upload (rsync - recommended)"
echo "  rsync -avz --delete dist/ your-user@your-server:/var/www/overlandn.com/tires/"
echo ""
echo "Option 3: SFTP"
echo "  sftp your-user@your-server"
echo "  > put -r dist/* /var/www/overlandn.com/tires/"
echo ""
echo "📋 After upload, configure your web server:"
echo "  - See docs/CUSTOM_DOMAIN.md for nginx/apache configs"
echo ""
echo "🌐 Then visit: https://overlandn.com/tires/"
echo ""
echo "💡 For automated deployment, see docs/CUSTOM_DOMAIN.md Option 2"
echo ""
