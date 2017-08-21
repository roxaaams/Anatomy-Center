#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "=== Compiling Cordova Build"

cd $DIR
cd ../dist/cordova

if [ -e cordova ]; then
    echo "--- Cleaning up"
    rm -rf cordova
fi

cp -R ../../cordova cordova
cp -R ./* cordova/www
cp ../../cordova/www/index.html cordova/www/index.html

cd cordova
cordova emulate android
