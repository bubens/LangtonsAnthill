#!/bin/bash

UTIL_FILES="./src/util.ts"
CORE_FILES="./src/fps.ts ./src/layer.ts ./src/langton.ts"
GUI_FILES="./src/adjust.ts"

DEST="./rel"
UTIL="util.js"
CORE="langton.js"
GUI="adjust.js"

if [ ! -d "$DEST" ];
  then
    mkdir $DEST;
  else
    rm $DEST/*;
fi

tsc --module amd --target "ES2016" --outFile "$DEST/$UTIL" --strict --sourceMap $UTIL_FILES &&
echo "utils compiled" &&
#tsc --module amd --target "ES2016" --outFile "$DEST/$CORE" --strict --sourceMap $CORE_FILES &&
echo "core compiled" &&
tsc --module amd --target "ES2016" --outFile "$DEST/$GUI" --strict --sourceMap $GUI_FILES &&
echo "gui compiled" &&
echo "SUCCESS!"

