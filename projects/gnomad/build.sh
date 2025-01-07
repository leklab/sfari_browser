#!/bin/bash

set -eu

PROJECT_DIR=$(dirname "${BASH_SOURCE}")
cd $PROJECT_DIR

export PATH=$PATH:$PROJECT_DIR/../../node_modules/.bin

rm -rf dist

export GNOMAD_API_URL=${GNOMAD_API_URL:-"https://genomes.sfari.org/api"}
export NODE_ENV=${NODE_ENV:-"production"}

webpack --config=./config/webpack.config.client.js
webpack --config=./config/webpack.config.server.js

curl http://www.leklab.org/wp-content/uploads/2020/04/SFARI.png --output ./dist/public/SFARI.png
