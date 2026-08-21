#!/usr/bin/env bash
# CANDiY 건강검진 API 실제 응답 캡처 스크립트.
# 개인정보는 이 셸 안에서만 살고, 저장되는 fixture는 마스킹된다.
#
# 사용법:  bash scripts/probe-candiy.sh
set -euo pipefail

cd "$(dirname "$0")/.."
OUT_DIR="src/shared/api/__fixtures__"
RAW="/tmp/candiy-raw-$$.json"
trap 'rm -f "$RAW"' EXIT

API_KEY=$(grep -E '^\s*API_KEY' .env | head -1 | cut -d= -f2- | tr -d ' "'"'"'')
[ -n "$API_KEY" ] || { echo "❌ .env에 API_KEY가 없다"; exit 1; }

command -v jq >/dev/null || { echo "❌ jq 필요: brew install jq"; exit 1; }

echo "── 개인정보 입력 (저장 안 됨) ─────────────────"
read -r -p "실명            : " LEGAL_NAME
read -r -p "생년월일(YYYYMMDD): " BIRTHDATE
read -r -p "휴대폰(01012345678): " PHONE_NO
echo "통신사  0:SKT  1:KT  2:LGU+"
read -r -p "통신사 번호      : " TELECOM
read -r -p "조회 시작연도 [2015]: " START_DATE; START_DATE=${START_DATE:-2015}
read -r -p "조회 종료연도 [2026]: " END_DATE;   END_DATE=${END_DATE:-2026}

REQ_ID="probe-$(uuidgen 2>/dev/null || date +%s)"

# 1차/2차 공통 파라미터. loginTypeLevel 8 = 토스
BASE=$(jq -n \
  --arg id "$REQ_ID" --arg name "$LEGAL_NAME" --arg birth "$BIRTHDATE" \
  --arg phone "$PHONE_NO" --arg tel "$TELECOM" \
  --arg sd "$START_DATE" --arg ed "$END_DATE" \
  '{id:$id, loginTypeLevel:"8", legalName:$name, birthdate:$birth,
    phoneNo:$phone, telecom:$tel, startDate:$sd, endDate:$ed, inquiryType:"0"}')

call() {  # $1 = json body
  curl -s -w '\n%{http_code}' -X POST \
    -H "x-api-key: $API_KEY" -H 'Content-Type: application/json' \
    -d "$1" https://api.candiy.io/v1/nhis/checkup
}

echo
echo "── 1차 요청 ───────────────────────────────────"
RESP=$(call "$BASE")
CODE=$(tail -n1 <<<"$RESP"); BODY=$(sed '$d' <<<"$RESP")
echo "HTTP $CODE"; jq . <<<"$BODY" || echo "$BODY"

[ "$CODE" = "200" ] || { echo "❌ 1차 실패"; exit 1; }
MFI=$(jq -c '.data' <<<"$BODY")

echo
echo "📱 토스 앱에서 인증 완료하고 엔터 (제한 4분 30초)"
read -r

echo "── 2차 요청 ───────────────────────────────────"
SECOND=$(jq -c --argjson mfi "$MFI" '. + {isContinue:"1", multiFactorInfo:$mfi}' <<<"$BASE")
RESP=$(call "$SECOND")
CODE=$(tail -n1 <<<"$RESP"); BODY=$(sed '$d' <<<"$RESP")
echo "HTTP $CODE"
printf '%s' "$BODY" > "$RAW"

[ "$CODE" = "200" ] || { jq . <<<"$BODY" || echo "$BODY"; echo "❌ 2차 실패"; exit 1; }

mkdir -p "$OUT_DIR"

# 구조 요약 — 값 없이 형태만
echo
echo "── 응답 구조 ──────────────────────────────────"
jq '{
  status,
  data_keys: (.data | keys),
  overview_count: (.data.overviewList | length),
  result_count:   (.data.resultList   | length),
  reference_types:(.data.referenceList | map(.refType)),
  overview_keys:  (.data.overviewList[0] // {} | keys),
  result_keys:    (.data.resultList[0]   // {} | keys),
  caseType_types: (.data.resultList | map(.caseType | type) | unique),
  checkupTypes:   (.data.resultList | map(.checkupType) | unique),
  pdfData_len:    (.data.resultList[0].pdfData // "" | length)
}' "$RAW"

# 마스킹 fixture: 이름/PDF만 제거, 수치·기준은 설계에 필요하니 보존
jq '.data.patientName = "홍길동"
    | .data.resultList |= map(.pdfData = (if (.pdfData//"")=="" then "" else "<pdf>" end))' \
  "$RAW" > "$OUT_DIR/checkup-response.json"

echo
echo "✅ 저장: $OUT_DIR/checkup-response.json (이름·PDF 마스킹됨)"
echo "   기관명(organizationName)은 남아있다. 민감하면 직접 수정해라."
