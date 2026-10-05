#!/usr/bin/env bash
set -euo pipefail

about_file="_pages/about.md"
scss_file="_sass/layout/_homepage_refresh.scss"
main_scss="assets/css/main.scss"

required_sections=(
  "## About Me"
  "## Open Source Focus"
  "## Open Source Roles & Recognition"
  "## MUSA Ecosystem"
  "## Currently Exploring"
  "## Contact"
  "## 中文简介"
)

for section in "${required_sections[@]}"; do
  if ! grep -Fxq "$section" "$about_file"; then
    echo "Missing homepage section: $section" >&2
    exit 1
  fi
done

homepage_refresh_class="class[[:space:]]*=[[:space:]]*\"([^\"]*[[:space:]])?homepage-refresh([[:space:]][^\"]*)?\"|class[[:space:]]*=[[:space:]]*'([^']*[[:space:]])?homepage-refresh([[:space:]][^']*)?'"

if ! grep -Eq "$homepage_refresh_class" "$about_file"; then
  echo "Missing homepage wrapper class token: homepage-refresh" >&2
  exit 1
fi

for text in \
  "Kubernetes" \
  "Aibrix" \
  "Kubernetes Contributor Award 2025" \
  "Volcano" \
  "Koordinator" \
  "descheduler" \
  "scheduler-plugins" \
  "LLM inference" \
  "MUSA" \
  "fake-gpu-musa" \
  "musa-learning-notes"; do
  if ! grep -Fq "$text" "$about_file"; then
    echo "Missing required homepage content: $text" >&2
    exit 1
  fi
done

for forbidden_text in \
  "## News" \
  "500x300.png" \
  "paper-box" \
  "Mashang Consumer Finance" \
  "AI Agent"; do
  if grep -Fq "$forbidden_text" "$about_file"; then
    echo "Unexpected homepage content: $forbidden_text" >&2
    exit 1
  fi
done

if ! awk '
  function active_sass_line(input, line, start, end) {
    line = input

    while (1) {
      if (in_block_comment) {
        end = index(line, "*/")
        if (!end) {
          return ""
        }
        line = substr(line, end + 2)
        in_block_comment = 0
      }

      start = index(line, "/*")
      if (!start) {
        break
      }

      end = index(substr(line, start + 2), "*/")
      if (!end) {
        in_block_comment = 1
        line = substr(line, 1, start - 1)
        break
      }

      line = substr(line, 1, start - 1) substr(line, start + end + 3)
    }

    sub(/[[:space:]]*\/\/.*/, "", line)
    return line
  }

  {
    line = active_sass_line($0)
  }

  line ~ /^[[:space:]]*@import([[:space:]]|$)/ {
    in_import = 1
  }

  in_import && line ~ /"layout\/homepage_refresh"/ {
    found = 1
  }

  in_import && line ~ /;/ {
    in_import = 0
  }

  END {
    exit found ? 0 : 1
  }
' "$main_scss"; then
  echo "assets/css/main.scss does not import layout/homepage_refresh" >&2
  exit 1
fi

selector_patterns=(
  '.homepage-intro|^[[:space:]]*\.homepage-refresh[[:space:]]+\.homepage-intro([[:space:],>{]|$)'
  '.topic-list|^[[:space:]]*\.homepage-refresh[[:space:]]+\.topic-list([[:space:],>{]|$)'
  '.anchor:before|^[[:space:]]*\.homepage-refresh[[:space:]]+\.anchor:before([[:space:],>{]|$)'
)

for selector_entry in "${selector_patterns[@]}"; do
  selector="${selector_entry%%|*}"
  selector_pattern="${selector_entry#*|}"
  if ! awk -v selector_pattern="$selector_pattern" '
    function active_sass_line(input, line, start, end) {
      line = input

      while (1) {
        if (in_block_comment) {
          end = index(line, "*/")
          if (!end) {
            return ""
          }
          line = substr(line, end + 2)
          in_block_comment = 0
        }

        start = index(line, "/*")
        if (!start) {
          break
        }

        end = index(substr(line, start + 2), "*/")
        if (!end) {
          in_block_comment = 1
          line = substr(line, 1, start - 1)
          break
        }

        line = substr(line, 1, start - 1) substr(line, start + end + 3)
      }

      sub(/[[:space:]]*\/\/.*/, "", line)
      return line
    }

    {
      line = active_sass_line($0)
    }

    line ~ selector_pattern {
      found = 1
    }

    END {
      exit found ? 0 : 1
    }
  ' "$scss_file"; then
    echo "Missing homepage style selector: $selector" >&2
    exit 1
  fi
done
