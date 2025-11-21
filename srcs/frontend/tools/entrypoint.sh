#!/bin/sh
set -e
echo "starting frontend entrypoint script"
# set max old space size to 4GB
export NODE_OPTIONS="--max-old-space-size=4096"
npm install --no-cache

# Met à jour la base de données des navigateurs (utile pour autoprefixer, etc.).
# Si ça échoue ce n'est pas bloquant, donc on ignore les erreurs.
npx update-browserslist-db@latest || true

echo "starting frontend dev server on port 3000"
# Lance le serveur de dev React (create-react-app).
# Il sera ensuite atteint via le proxy Nginx sur https://localhost:8443.
npm start
