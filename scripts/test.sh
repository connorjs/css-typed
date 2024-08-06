#!/usr/bin/env bash
set -eo pipefail # Removed `-u` which failed on macos for `options`
IFS=$' ' # We want space splitting for this script

# $1 is the input name, relative to `fixtures`. Required.
input=$1

# $2 is the config file name, relative to `fixtures/config`. Defaults to $1.yaml.
config=${2:-$1.yaml}

# $3 is the options. Defaults to "".
read -r -a options <<< "${3:-}"

# $4 is the output name, relative to `fixtures`. Defaults to $1.
output=${4:-$1}

# $5 is the path prefix for output. Defaults to "".
prefix=${5:-}

# `sandbox` is where we installed css-typed.
# Create fresh tmp directory under it each time (under for npx usage).
TEST_DIR=sandbox/tmp
rm -rf $TEST_DIR
mkdir -p $TEST_DIR

cp fixtures/${input}.css $TEST_DIR/test.css
cp fixtures/${output}.d.css.ts $TEST_DIR/expected.d.css.ts

if [ -f fixtures/config/${config} ]; then
	mkdir -p $TEST_DIR/.config
	cp fixtures/config/${config} $TEST_DIR/.config/${config}
fi

pushd $TEST_DIR > /dev/null || exit

set -x # Print the css-typed command exactly as executed

# shellcheck disable=SC2068
npx css-typed ${options[@]}

{ set +x; } 2>/dev/null # Turn off command printing, and do not print set +X

# Use `diff` to compare the files.
# Use `-I '//.*'` to ignore the first line (comment) which has generated path and timestamp.
diff --color=always --strip-trailing-cr -uI "//.*" expected.d.css.ts ${prefix}test.d.css.ts
