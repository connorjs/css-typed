#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# $1 is the input name, relative to `fixtures`. Required.
# $2 is the standard (before) options. Defaults to "".
# $3 is the output name, relative to `fixtures`. Defaults to $1.
# $4 is the after options. Defaults to "".
# $5 is the path prefix for output. Defaults to "".

# Run from $RUNNER_TEMP for auto-cleanup.
cp fixtures/"$1".css "$RUNNER_TEMP"/test.css
cp fixtures/"${3:-$1}".d.css.ts "$RUNNER_TEMP"/expected.d.css.ts
pushd "$RUNNER_TEMP" > /dev/null || exit

# `./dist/main.js` is executing local `css-typed` as if installed (same as `bin`).
# But it is `$GITHUB_WORKSPACE/dist/main.js` b/c we `cd $RUNNER_TEMP`.
args="${2:-} \"*.css\" ${4:-}"
echo "css-typed $args"
eval "$GITHUB_WORKSPACE/dist/main.js $args"

# Use `diff` to compare the files.
# Use `-I '//.*'` to ignore the first line (comment) which has generated path and timestamp.
diff --color=auto --strip-trailing-cr -uI '//.*' expected.d.css.ts "${5:-}"test.d.css.ts
