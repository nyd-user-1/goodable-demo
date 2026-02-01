#!/bin/bash
# Re-sync all existing bills to fix sponsor/vote people_id linkage.
# Runs in batches of 50, picking up where it left off.
# Usage: ./scripts/resync-bills.sh [starting_offset]

SUPABASE_URL="https://kwyjohornlgujoqypyvu.supabase.co/functions/v1/nys-legislation-search"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3eWpvaG9ybmxndWpvcXlweXZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MTAyODcsImV4cCI6MjA2NzE4NjI4N30.nPewQZse07MkYAK5W9wCEwYhnndHkA8pKmedgHkvD9M"
SESSION_YEAR=2025
BATCH_SIZE=50
OFFSET=${1:-0}

echo "=== Bill Resync Script ==="
echo "Starting at offset: $OFFSET"
echo "Batch size: $BATCH_SIZE"
echo ""

while true; do
  echo "[$(date '+%H:%M:%S')] Processing batch at offset $OFFSET..."

  RESPONSE=$(curl -s -X POST "$SUPABASE_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ANON_KEY" \
    -H "apikey: $ANON_KEY" \
    -d "{\"action\":\"resync\",\"sessionYear\":$SESSION_YEAR,\"batchSize\":$BATCH_SIZE,\"offset\":$OFFSET}")

  # Parse response
  SUCCESS=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('success',''))" 2>/dev/null)
  PROCESSED=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('processed',0))" 2>/dev/null)
  SUCCEEDED=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('succeeded',0))" 2>/dev/null)
  ERRORS=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors',0))" 2>/dev/null)
  DURATION=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('duration','?'))" 2>/dev/null)
  NEXT_OFFSET=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('nextOffset','null'))" 2>/dev/null)
  TOTAL=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('totalBills',0))" 2>/dev/null)
  HAS_MORE=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('hasMore',False))" 2>/dev/null)

  if [ "$SUCCESS" != "True" ]; then
    echo "ERROR: Request failed. Response:"
    echo "$RESPONSE"
    echo ""
    echo "To resume, run: ./scripts/resync-bills.sh $OFFSET"
    exit 1
  fi

  PERCENT=$(( (OFFSET + PROCESSED) * 100 / TOTAL ))
  echo "  ✓ Processed: $PROCESSED | Succeeded: $SUCCEEDED | Errors: $ERRORS | Duration: $DURATION"
  echo "  Progress: $((OFFSET + PROCESSED)) / $TOTAL ($PERCENT%)"

  if [ "$HAS_MORE" != "True" ] || [ "$NEXT_OFFSET" = "null" ] || [ "$NEXT_OFFSET" = "None" ]; then
    echo ""
    echo "=== Resync complete! ==="
    echo "Total bills processed through offset $((OFFSET + PROCESSED)) of $TOTAL"
    exit 0
  fi

  OFFSET=$NEXT_OFFSET

  # Brief pause between batches to be nice to the API
  sleep 2
done
