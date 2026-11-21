#!/usr/bin/env bash
export CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
FLAGS="--headless --no-sandbox --disable-gpu"
PAGES=(
  "home http://localhost:3000/"
  "article http://localhost:3000/article/arabic-ai-frontier-sdaia-allam-architecture-tokenization-benchmarks"
  "category http://localhost:3000/category/ai-deep-tech"
  "latest http://localhost:3000/latest"
)

mkdir -p /tmp/lh-reports

for item in "${PAGES[@]}"; do
  NAME=$(echo $item | awk '{print $1}')
  URL=$(echo $item | awk '{print $2}')
  echo ">>> Auditing $NAME at $URL ..."
  npx -y lighthouse "$URL" \
    --chrome-flags="$FLAGS" \
    --no-enable-error-reporting \
    --output=json \
    --output-path="/tmp/lh-reports/$NAME.json" \
    --only-categories=performance,accessibility,best-practices,seo \
    --quiet
done

echo ">>> All Lighthouse audits finished."

