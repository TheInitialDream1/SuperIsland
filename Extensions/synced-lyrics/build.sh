#!/bin/sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

npx --yes esbuild@0.25.9 "$script_dir/bundle-entry.js" \
  --bundle \
  --format=iife \
  --platform=browser \
  --target=safari15 \
  --legal-comments=eof \
  --outfile="$script_dir/bundle.js"
