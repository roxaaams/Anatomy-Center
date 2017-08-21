#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd $DIR
cd ../

TARGETS="web electron"
for TARGET in $TARGETS; do
    echo "=== BUILDING $TARGET"
    NODE_ENV=${1:-production} NODE_TARGET=$TARGET WEBPACK_ENV=${2:-dist} WEBPACK_NO_DOCS=${3:-true} node_modules/.bin/webpack
    if [ -e "./bin/build.$TARGET.sh" ]; then
        echo "--- RUNNING ADDITIONAL BUILD"
        ./bin/build.$TARGET.sh
    fi
done
