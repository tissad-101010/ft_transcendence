#!/bin/bash

# Script de test pour vérifier que les matchs amicaux fonctionnent correctement

echo "🧪 Test des matchs amicaux"
echo "=========================="
echo ""

# Nettoyer les matchs existants
echo "1️⃣ Nettoyage des matchs existants..."
docker exec postgreSQL psql -U postgres -d gameService -c "DELETE FROM friendly_matches;" > /dev/null 2>&1
echo "✅ Matchs nettoyés"
echo ""

# Créer un match
echo "2️⃣ Création d'un match amical..."
RESPONSE=$(curl -k -s -X POST "https://localhost:8443/api/friendly/create" \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"player1_id": 1, "speed": "2", "scoreMax": "7", "timeBefore": "5"}')

MATCH_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('matchId', 'ERROR'))" 2>/dev/null)

if [ "$MATCH_ID" = "ERROR" ] || [ -z "$MATCH_ID" ]; then
    echo "❌ Erreur lors de la création du match"
    echo "Réponse: $RESPONSE"
    exit 1
fi

echo "✅ Match créé avec l'ID: $MATCH_ID"
echo ""

# Attendre un peu pour que le match soit bien enregistré
sleep 1

# Vérifier dans la base de données
echo "3️⃣ Vérification dans la base de données..."
DB_CHECK=$(docker exec postgreSQL psql -U postgres -d gameService -t -c "SELECT COUNT(*) FROM friendly_matches WHERE id = $MATCH_ID AND status = 'waiting';" 2>&1 | tr -d ' \n')

if [ "$DB_CHECK" = "1" ]; then
    echo "✅ Match trouvé dans la base de données (statut: waiting)"
else
    echo "❌ Match non trouvé ou mauvais statut dans la base de données"
    exit 1
fi
echo ""

# Vérifier que l'API /api/friendly/list retourne le match
echo "4️⃣ Vérification de l'API /api/friendly/list..."
LIST_RESPONSE=$(curl -k -s -X GET "https://localhost:8443/api/friendly/list" \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json")

MATCH_COUNT=$(echo "$LIST_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); matches = data.get('matches', []); print(len(matches))" 2>/dev/null)

if [ "$MATCH_COUNT" = "1" ]; then
    echo "✅ L'API retourne bien 1 match"
    echo "📋 Détails du match:"
    echo "$LIST_RESPONSE" | python3 -m json.tool 2>/dev/null | grep -A 6 "idMatch"
else
    echo "❌ L'API ne retourne pas le match (trouvé: $MATCH_COUNT match(s))"
    echo "Réponse complète:"
    echo "$LIST_RESPONSE" | python3 -m json.tool 2>/dev/null
    exit 1
fi
echo ""

# Créer un deuxième match pour tester
echo "5️⃣ Création d'un deuxième match..."
RESPONSE2=$(curl -k -s -X POST "https://localhost:8443/api/friendly/create" \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"player1_id": 1, "speed": "3", "scoreMax": "10", "timeBefore": "3"}')

MATCH_ID2=$(echo "$RESPONSE2" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('matchId', 'ERROR'))" 2>/dev/null)

if [ "$MATCH_ID2" = "ERROR" ] || [ -z "$MATCH_ID2" ]; then
    echo "❌ Erreur lors de la création du deuxième match"
    exit 1
fi

echo "✅ Deuxième match créé avec l'ID: $MATCH_ID2"
echo ""

sleep 1

# Vérifier que l'API retourne maintenant 2 matchs
echo "6️⃣ Vérification que l'API retourne 2 matchs..."
LIST_RESPONSE2=$(curl -k -s -X GET "https://localhost:8443/api/friendly/list" \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json")

MATCH_COUNT2=$(echo "$LIST_RESPONSE2" | python3 -c "import sys, json; data = json.load(sys.stdin); matches = data.get('matches', []); print(len(matches))" 2>/dev/null)

if [ "$MATCH_COUNT2" = "2" ]; then
    echo "✅ L'API retourne bien 2 matchs"
else
    echo "❌ L'API ne retourne pas 2 matchs (trouvé: $MATCH_COUNT2 match(s))"
    exit 1
fi
echo ""

echo "✅✅✅ Tous les tests sont passés avec succès ! ✅✅✅"
echo ""
echo "📝 Résumé:"
echo "  - Création de matchs: ✅"
echo "  - Enregistrement en base de données: ✅"
echo "  - API /api/friendly/list: ✅"
echo "  - Affichage de plusieurs matchs: ✅"
echo ""
echo "💡 Pour tester dans le frontend:"
echo "  1. Ouvrez l'application dans le navigateur"
echo "  2. Allez dans 'Rejoindre'"
echo "  3. Vous devriez voir 2 matchs affichés"
echo ""



