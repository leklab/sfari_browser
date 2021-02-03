#!/bin/bash

set -eu

PROJECT_DIR=$(dirname "${BASH_SOURCE}")
cd $PROJECT_DIR

export PATH=$PATH:$PROJECT_DIR/../../node_modules/.bin

rm -rf dist

#export NODE_ENV="production"
#export GA_TRACKING_ID="UA-149585832-1"
#export GNOMAD_API_URL=${GNOMAD_API_URL:-"http://genomes.sfari.org:8007"}
export GNOMAD_API_URL=${GNOMAD_API_URL:-"http://54.91.148.17/api"}

export NODE_ENV=${NODE_ENV:-"production"}
#export GNOMAD_API_URL=${GNOMAD_API_URL:-"/api"}

webpack --config=./config/webpack.config.client.js

webpack --config=./config/webpack.config.server.js
