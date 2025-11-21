#!/bin/bash

# Script de test pour vérifier le scénario complet d'un match amical EN LIGNE :
# - Création du match par un créateur (player1)
# - Join du créateur sur son propre match
# - Join d'un second joueur

echo "🧪 Test des matchs amicaux EN LIGNE (create + join créateur + join second joueur)"
echo "==========================================================================="
echo ""

# 1) Nettoyer les matchs existants
echo "1️⃣ Nettoyage des matchs existants..."
docker exec postgreSQL psql -U postgres -d gameService -c "DELETE FROM friendly_matches;" > /dev/null 2>&1
echo "✅ Matchs nettoyés"
echo ""

# 2) Création d'un match en ligne
echo "2️⃣ Création d'un match amical EN LIGNE..."
CREATE_RESPONSE=$(
  curl -k -s -X POST "https://localhost:8443/api/friendly/create" \
    -H "Origin: http://localhost:3000" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d '{"player1_id": 1001, "speed": "2", "scoreMax": "5", "timeBefore": "3", "isOnline": true}'
)

echo "📥 Réponse création:"
echo "$CREATE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CREATE_RESPONSE"
echo ""

MATCH_ID=$(
  echo "$CREATE_RESPONSE" | python3 -c 'import sys, json; data = json.load(sys.stdin); print(data.get("matchId", "ERROR"))' 2>/dev/null
)
PLAYER1_DB_ID=$(
  echo "$CREATE_RESPONSE" | python3 -c 'import sys, json; data = json.load(sys.stdin); m = data.get("match", {}); p1 = m.get("player1", {}); print(p1.get("id", "ERROR"))' 2>/dev/null
)

if [ "$MATCH_ID" = "ERROR" ] || [ -z "$MATCH_ID" ]; then
  echo "❌ Erreur lors de la création du match (pas de matchId)"
  exit 1
fi

if [ "$PLAYER1_DB_ID" = "ERROR" ] || [ -z "$PLAYER1_DB_ID" ]; then
  echo "❌ Erreur lors de la création du match (pas de player1.id dans la réponse)"
  exit 1
fi

echo "✅ Match en ligne créé avec l'ID: $MATCH_ID (player1 DB ID: $PLAYER1_DB_ID)"
echo ""

sleep 1

# 3) Join du créateur sur son propre match
echo "3️⃣ Join du créateur sur son propre match (player2_id = player1 DB ID)..."
CREATOR_JOIN_RESPONSE=$(
  curl -k -s -X POST "https://localhost:8443/api/friendly/$MATCH_ID/join" \
    -H "Origin: http://localhost:3000" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "{\"player2_id\": $PLAYER1_DB_ID}"
)

echo "📥 Réponse join créateur:"
echo "$CREATOR_JOIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CREATOR_JOIN_RESPONSE"
echo ""

CREATOR_JOIN_SUCCESS=$(
  echo "$CREATOR_JOIN_RESPONSE" | python3 -c 'import sys, json; data = json.load(sys.stdin); print(data.get("success", False))' 2>/dev/null
)

if [ "$CREATOR_JOIN_SUCCESS" != "True" ] && [ "$CREATOR_JOIN_SUCCESS" != "true" ]; then
  echo "❌ Le join du créateur a échoué"
  exit 1
fi

echo "✅ Join créateur OK"
echo ""

sleep 1

# 4) Join d'un second joueur
echo "4️⃣ Join d'un SECOND joueur sur le match..."
SECOND_PLAYER_ID=2002
SECOND_JOIN_RESPONSE=$(
  curl -k -s -X POST "https://localhost:8443/api/friendly/$MATCH_ID/join" \
    -H "Origin: http://localhost:3000" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "{\"player2_id\": $SECOND_PLAYER_ID}"
)

echo "📥 Réponse join second joueur:"
echo "$SECOND_JOIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$SECOND_JOIN_RESPONSE"
echo ""

SECOND_JOIN_SUCCESS=$(
  echo "$SECOND_JOIN_RESPONSE" | python3 -c 'import sys, json; data = json.load(sys.stdin); print(data.get("success", False))' 2>/dev/null
)
SECOND_JOIN_MSG=$(
  echo "$SECOND_JOIN_RESPONSE" | python3 -c 'import sys, json; data = json.load(sys.stdin); print(data.get("message", ""))' 2>/dev/null
)

if [ "$SECOND_JOIN_SUCCESS" != "True" ] && [ "$SECOND_JOIN_SUCCESS" != "true" ]; then
  echo "❌ Le join du second joueur a échoué (message: $SECOND_JOIN_MSG)"
  exit 1
fi

SECOND_JOIN_MATCH_STATUS=$(
  echo "$SECOND_JOIN_RESPONSE" | python3 -c 'import sys, json; data = json.load(sys.stdin); m = data.get("match", {}); print(m.get("status", "UNKNOWN"))' 2>/dev/null
)
SECOND_JOIN_PLAYER2ID=$(
  echo "$SECOND_JOIN_RESPONSE" | python3 -c 'import sys, json; data = json.load(sys.stdin); m = data.get("match", {}); print(m.get("player2Id", "NULL"))' 2>/dev/null
)

echo "✅ Join second joueur OK (status: $SECOND_JOIN_MATCH_STATUS, player2Id: $SECOND_JOIN_PLAYER2ID)"
echo ""

echo "✅✅✅ Test EN LIGNE (create + join créateur + join second joueur) RÉUSSI ✅✅✅"
echo ""

