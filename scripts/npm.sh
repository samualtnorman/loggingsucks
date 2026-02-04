#!/bin/sh
set -ex
export TARGET=npm
export JSR_NAME=@sn/loggingsucks
rm -rf dist
./rolldown.config.js
scripts/emit-dts.sh
scripts/emit-package-json.js
scripts/eta.js < src/readme.md > dist/README.md
cp LICENSE dist
