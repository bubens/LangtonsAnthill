#!/bin/bash

SOURCE_TS="./src/"
SOURCE_HTML="./html/index.html";
SOURCE_CSS="./style/style.css";

TMP_FOLDER="./tmp_$(date +%s)";

RELEASE_FOLDER="./rel";

echo "Begin building app...";

echo "\nStep 0: Prepare build process..."
# Create tmp-directory
if [ ! -d $TMP_FOLDER ]; then
    echo "making tmp-folder..."
    mkdir -v $TMP_FOLDER
fi

if [ ! -d $RELEASE_FOLDER ]; then
    echo "making release-folder (rel/)..."
    mkdir $RELEASE_FOLDER
else
    echo "cleaning up release-folder (rel/*)..."
    rm $RELEASE_FOLDER/*
fi

# compile
echo "\nStep 1: Copying html & css..." &&
cp -v $SOURCE_HTML $RELEASE_FOLDER &&
cp -v $SOURCE_CSS $RELEASE_FOLDER &&
echo "\nStep 2: Compiling TS..." &&
tsc --module commonjs --target "ES2016" --outDir $TMP_FOLDER $SOURCE_TS/* &&
echo "done..." &&
echo "\nStep 3: Bundling up modules..." &&
browserify -o $TMP_FOLDER/app.js $TMP_FOLDER/main.js &&
echo "done..." &&
echo "\nStep 4: Copying code..."
cp -v $TMP_FOLDER/app.js $RELEASE_FOLDER &&
echo "Done building app\n"

echo "Cleaning up..." &&
rm -r $TMP_FOLDER &&
echo "Success"


