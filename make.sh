#!/bin/bash

CORE_FILES="./src/random.ts ./src/coords.ts ./src/gradient.ts ./src/fps.ts ./src/layer.ts ./src/langton.ts"
GUI_FILES="./src/adjust.ts"

DEST="./rel"
CORE="langton.js"
GUI="adjust.js"

if [ ! -d "$DEST" ];
  then
    mkdir $DEST;
  else
    rm $DEST/*;
fi

tsc --module amd --target "ES2016" --outFile "$DEST/$CORE" --strict --sourceMap $CORE_FILES &&
echo "core compiled" &&
tsc --module amd --target "ES2016" --outFile "$DEST/$GUI" --strict --sourceMap $GUI_FILES &&
echo "gui compiled" &&
echo "SUCCESS!"

