#!/usr/bin/env bash
# Adds @category <cat> after @component <name> in each component doc comment.
# Idempotent: skips files that already have @category.
set -euo pipefail

cd "$(dirname "$0")/.."

# Component → category map
declare -A CAT=(
  [x-stepper]=forms        [x-rating]=forms          [x-color-picker]=forms
  [dual-range]=forms       [x-pagination]=forms      [scroll-select]=forms
  [tag-input]=forms        [searchable-select]=forms [drop-uploader]=forms
  [highlighted-input]=forms [input-enhanced]=forms   [drag-list]=forms
  [order-list]=forms       [step-form]=forms         [field-when]=forms
  [form-enhance]=forms     [fullscreen-select]=forms [date-picker]=forms
  [date-range-picker]=forms [mini-calendar]=forms

  [x-progress]=data        [progress-circle]=data    [stat-counter]=data
  [x-viewport]=data        [data-grid]=data          [x-export]=data
  [spark-line]=data        [x-countdown]=data        [x-inspector]=data

  [gradient-text]=text     [hero-text]=text          [text-morph]=text
  [text-rotator]=text      [overlap-text]=text       [rolling-number]=text
  [dot-display]=text

  [rainbow-button]=buttons [hold-button]=buttons     [toast-console]=buttons
  [theme-switch]=buttons

  [x-tree-view]=layout     [x-timeline]=layout       [x-splitter]=layout
  [shadow-container]=layout [foot-note]=layout       [x-code-block]=layout
  [show-when]=layout       [fullscreen-menu]=layout  [live-reload]=layout
  [scroll-to-top]=layout   [hover-scroll]=layout     [lazy-load]=layout
  [preload-links]=layout

  [x-tilt]=3d              [layered-tilt]=3d         [image-compare]=3d
  [x-map]=3d               [sound-click]=3d          [sound-hover]=3d
  [x-signature]=3d         [x-cropper]=3d

  [sticky-sidebar]=content [server-action]=content   [html-load]=content
  [json-editor]=content    [date-time]=content       [x-markdown]=content
  [lorem-ipsum]=content    [virtual-list]=content    [sse-connect]=content
)

count=0
skipped=0
for name in "${!CAT[@]}"; do
  file="components/$name.html"
  [ -f "$file" ] || { echo "MISSING: $file"; continue; }
  if grep -q "@category" "$file"; then
    skipped=$((skipped+1))
    continue
  fi
  cat="${CAT[$name]}"
  # Insert "@category <cat>" on its own line right after "@component <name>"
  # The doc comment uses "@component name" followed by newline + "@description"
  # We use a portable sed: match "@component <word>" and append a line.
  sed -i -E "/^  @component /a\\  @category $cat" "$file"
  count=$((count+1))
done

echo "Added @category to $count files ($skipped already had it)."
