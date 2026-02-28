#!/bin/bash

# Redirect overlandn.com/tires → GitHub Pages
# Add to nginx config:

cat << 'EOF'

Add to your nginx config:

    location /tires {
        return 301 https://realsystem.github.io/tires$request_uri;
    }

Then: sudo systemctl reload nginx

EOF
