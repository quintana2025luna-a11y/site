#!/bin/sh
# Double-click on macOS/Linux: starts the local preview (needs Node.js) and opens the site.
cd "$(dirname "$0")"
(sleep 1; (open http://localhost:4173/ || xdg-open http://localhost:4173/) >/dev/null 2>&1) &
node tools/serve.mjs
