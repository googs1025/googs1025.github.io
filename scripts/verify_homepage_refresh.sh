#!/usr/bin/env bash
set -euo pipefail

about_file="_pages/about.md"
scss_file="_sass/layout/_homepage_refresh.scss"
main_scss="assets/css/main.scss"

required_sections=(
  "## About Me"
  "## Topics"
  "## News"
  "## Projects and Communities"
  "## Contact"
  "## Chinese"
)

for section in "${required_sections[@]}"; do
  if ! grep -Fq "$section" "$about_file"; then
    echo "Missing homepage section: $section" >&2
    exit 1
  fi
done

paper_box_count="$(grep -Fc "class='paper-box'" "$about_file")"
if [ "$paper_box_count" -lt 4 ]; then
  echo "Expected at least 4 paper-box project/community cards, found $paper_box_count" >&2
  exit 1
fi

for text in \
  "Kubernetes" \
  "Aibrix" \
  "Volcano" \
  "descheduler" \
  "scheduler-plugins" \
  "LLM inference"; do
  if ! grep -Fq "$text" "$about_file"; then
    echo "Missing required homepage content: $text" >&2
    exit 1
  fi
done

if ! grep -Eq '^[[:space:]]*"layout/homepage_refresh"[[:space:]]*,?[[:space:]]*;?[[:space:]]*$' "$main_scss"; then
  echo "assets/css/main.scss does not import layout/homepage_refresh" >&2
  exit 1
fi

for selector in \
  ".homepage-intro" \
  ".topic-list" \
  ".paper-box" \
  ".paper-box-image" \
  ".paper-box-text" \
  ".badge"; do
  if ! grep -Fq "$selector" "$scss_file"; then
    echo "Missing homepage style selector: $selector" >&2
    exit 1
  fi
done
