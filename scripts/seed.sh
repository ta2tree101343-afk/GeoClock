#!/usr/bin/env bash
#
# Seed test data into the Amplify sandbox DynamoDB tables.
#
# Prerequisites:
#   - AWS CLI configured for the sandbox account
#   - Cognito test user created (see PR #12 body)
#
# Usage:
#   ./scripts/seed.sh
#
set -euo pipefail

# Cognito sub of the test user (test@example.com)
WORKER_ID="87642ad8-7021-702b-3ca4-153152351de5"

# Table names from the current sandbox
GEOFENCE_TABLE="Geofence-bd3daudzljbktc6naxya6mwiuq-NONE"
WORKER_GEOFENCE_TABLE="WorkerGeofence-bd3daudzljbktc6naxya6mwiuq-NONE"

NOW=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

put_geofence() {
  local id=$1 name=$2 lat=$3 lng=$4 address=$5

  aws dynamodb put-item --table-name "$GEOFENCE_TABLE" --item "{
    \"id\":{\"S\":\"$id\"},
    \"name\":{\"S\":\"$name\"},
    \"latitude\":{\"N\":\"$lat\"},
    \"longitude\":{\"N\":\"$lng\"},
    \"radius\":{\"N\":\"100\"},
    \"address\":{\"S\":\"$address\"},
    \"createdBy\":{\"S\":\"$WORKER_ID\"},
    \"__typename\":{\"S\":\"Geofence\"},
    \"createdAt\":{\"S\":\"$NOW\"},
    \"updatedAt\":{\"S\":\"$NOW\"}
  }"
}

put_link() {
  local id=$1 geofence_id=$2

  aws dynamodb put-item --table-name "$WORKER_GEOFENCE_TABLE" --item "{
    \"id\":{\"S\":\"$id\"},
    \"workerId\":{\"S\":\"$WORKER_ID\"},
    \"geofenceId\":{\"S\":\"$geofence_id\"},
    \"assignedAt\":{\"S\":\"$NOW\"},
    \"__typename\":{\"S\":\"WorkerGeofence\"},
    \"createdAt\":{\"S\":\"$NOW\"},
    \"updatedAt\":{\"S\":\"$NOW\"}
  }"
}

echo "Seeding Geofences..."
put_geofence "geo-shinjuku-a"  "新宿現場A" "35.6895" "139.6917" "東京都新宿区西新宿"
put_geofence "geo-shibuya-b"   "渋谷現場B" "35.6595" "139.7005" "東京都渋谷区道玄坂"
put_geofence "geo-ikebukuro-c" "池袋現場C" "35.7295" "139.7109" "東京都豊島区南池袋"

echo "Seeding WorkerGeofence links..."
put_link "link-shinjuku"  "geo-shinjuku-a"
put_link "link-shibuya"   "geo-shibuya-b"
put_link "link-ikebukuro" "geo-ikebukuro-c"

echo "Done."
