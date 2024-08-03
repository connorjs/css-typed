#!/usr/bin/env bash
set -ex

# $1 is the input name, relative to `fixtures`. Required.
input=$1

# $2 is the config file name, relative to `fixtures/config`. Defaults to $1.yaml.
config=${2:-$1.yaml}

# $3 is the options. Defaults to "".
IFS=" " read -r -a options <<< "${3:-}"

# $4 is the output name, relative to `fixtures`. Defaults to $1.
output=${4:-$1}

# $5 is the path prefix for output. Defaults to "".
prefix=${5:-}

# Run from $RUNNER_TEMP for auto-cleanup.
cp fixtures/${input}.css $RUNNER_TEMP/test.css
cp fixtures/${output}.d.css.ts $RUNNER_TEMP/expected.d.css.ts

rm -rf "${RUNNER_TEMP:?}/.config"
mkdir -p $RUNNER_TEMP/.config
cp fixtures/config/${config} $RUNNER_TEMP/.config/${config} 2> /dev/null

pushd $RUNNER_TEMP > /dev/null || exit

# `./dist/main.js` is executing local `css-typed` as if installed (same as `bin`).
# But it is `$GITHUB_WORKSPACE/dist/main.js` b/c we `cd $RUNNER_TEMP`.
echo "css-typed ${options[*]}"
# shellcheck disable=SC2068
$GITHUB_WORKSPACE/dist/main.js ${options[@]}

# Use `diff` to compare the files.
# Use `-I '//.*'` to ignore the first line (comment) which has generated path and timestamp.
diff --color=always --strip-trailing-cr -uI "//.*" expected.d.css.ts ${prefix}test.d.css.ts
