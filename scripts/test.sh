#!/usr/bin/env bash
set -eo pipefail # Removed `-u` which failed on macos for `options`
IFS=$' ' # We want space splitting for this script

# $1 is the subcommand to run
subcommand=$1

# $2 is the input name, relative to `fixtures`. Required.
input=$2

# $3 is the config file name, relative to `fixtures/config`. Defaults to $2.yaml.
config=${3:-$2.yaml}

# $4 is the options. Defaults to "".
read -r -a options <<< "${4:-}"

# $5 is the output name, relative to `fixtures`. Defaults to $1.
output=${5:-$2}

# $6 is the path prefix for output. Defaults to "".
prefix=${6:-}

# Run from $RUNNER_TEMP for auto-cleanup.
cp fixtures/${input}.css $RUNNER_TEMP/test.css
cp fixtures/${output}.d.css.ts $RUNNER_TEMP/expected.d.css.ts

rm -rf "${RUNNER_TEMP:?}/.config"
if [ -f fixtures/config/${config} ]; then
	mkdir -p $RUNNER_TEMP/.config
	cp fixtures/config/${config} $RUNNER_TEMP/.config/${config}
fi

pushd $RUNNER_TEMP > /dev/null || exit

# `./dist/main.js` is executing local `css-typed` as if installed (same as `bin`).
# But it is `$GITHUB_WORKSPACE/dist/main.js` b/c we `cd $RUNNER_TEMP`.
echo "css-typed ${subcommand}" "${options[@]}"
# shellcheck disable=SC2068
$GITHUB_WORKSPACE/dist/main.js ${subcommand} ${options[@]}

# Use `diff` to compare the files.
# Use `-I '//.*'` to ignore the first line (comment) which has generated path and timestamp.
diff --color=always --strip-trailing-cr -uI "//.*" expected.d.css.ts ${prefix}test.d.css.ts
