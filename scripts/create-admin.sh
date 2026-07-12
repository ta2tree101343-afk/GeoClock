#!/usr/bin/env bash
#
# Cognito Admin グループのユーザーを 1 人作成する。
# Geofence の作成・変更などの管理操作が可能になる。
#
# Usage:
#   ./scripts/create-admin.sh <email> <temporary-password> <given-name>
#
# Example:
#   ./scripts/create-admin.sh admin@example.com 'AdminTemp1!' 管理者
#
set -euo pipefail

if [ $# -lt 3 ]; then
  echo "Usage: $0 <email> <temporary-password> <given-name>" >&2
  exit 1
fi

EMAIL="$1"
TEMP_PASSWORD="$2"
GIVEN_NAME="$3"

USER_POOL_ID="ap-northeast-1_DZGT4Wh4k"

echo "Creating Cognito user: $EMAIL"
aws cognito-idp admin-create-user \
  --user-pool-id "$USER_POOL_ID" \
  --username "$EMAIL" \
  --user-attributes \
    Name=email,Value="$EMAIL" \
    Name=email_verified,Value=true \
    Name=given_name,Value="$GIVEN_NAME" \
  --temporary-password "$TEMP_PASSWORD" \
  --message-action SUPPRESS

echo "Adding to Admin group..."
aws cognito-idp admin-add-user-to-group \
  --user-pool-id "$USER_POOL_ID" \
  --username "$EMAIL" \
  --group-name Admin

echo "Done. Initial login required to change password."
