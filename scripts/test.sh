#!/usr/bin/env bash

# $1 is the input name, relative to `fixtures`. Required.
input=$1

# $2 is the standard (before) options. Use an array. Defaults to ().
beforeOpts=${2:-()}

# $3 is the output name, relative to `fixtures`. Defaults to $1.
output=$2

# $4 is the after options. Use an array. Defaults to ().
afterOpts=${4:-()}

# $5 is the path prefix for output. Defaults to "".
prefix=${5:-}

# Run from $RUNNER_TEMP for auto-cleanup.
cp fixtures/${input}.css $RUNNER_TEMP/test.css
cp fixtures/${output}.d.css.ts $RUNNER_TEMP/expected.d.css.ts
pushd $RUNNER_TEMP > /dev/null || exit

# `./dist/main.js` is executing local `css-typed` as if installed (same as `bin`).
# But it is `$GITHUB_WORKSPACE/dist/main.js` b/c we `cd $RUNNER_TEMP`.
echo "css-typed ${beforeOpts} \"*.css\" ${afterOpts}"
# shellcheck disable=SC2068
$GITHUB_WORKSPACE/dist/main.js ${beforeOpts[@]} \"*.css\" ${afterOpts[@]}

# Use `diff` to compare the files.
# Use `-I '//.*'` to ignore the first line (comment) which has generated path and timestamp.
diff --color=auto --strip-trailing-cr -uI '//.*' expected.d.css.ts ${prefix}test.d.css.ts
