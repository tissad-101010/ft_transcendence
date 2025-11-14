#!/bin/sh
set -e
echo "starting frontend entrypoint script"
# set max old space size to 4GB
export NODE_OPTIONS="--max-old-space-size=4096"
npm install --no-cache
npx update-browserslist-db@latest
# npm run build
echo "frontend build finished"
echo "starting frontend dev server"
npm start dev
