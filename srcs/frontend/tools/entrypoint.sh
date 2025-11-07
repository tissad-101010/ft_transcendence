#!/bin/sh
set -e
echo "starting frontend entrypoint script"
npx update-browserslist-db@latest
# set max old space size to 4GB
export NODE_OPTIONS="--max-old-space-size=4096"
npm install --no-cache
npm run build
echo "frontend build finished"
echo "starting frontend dev server"
npm start dev
