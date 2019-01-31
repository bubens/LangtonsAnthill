#!/bin/bash

SCRIPTS="./src/util.ts ./src/fps.ts ./src/layer.ts ./src/langton.ts"

DEST="./rel"
FILE="langton.js"

if [ ! -d "$DEST" ];
  then
    mkdir $DEST;
  else
    rm $DEST/*;
fi

tsc --module amd --target "ES2016" --outFile "$DEST/$FILE" --strict --sourceMap $SCRIPTS &&
echo "DONE!"
