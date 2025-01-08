#!/bin/bash

set -eu

PROJECT_DIR=$(dirname "${BASH_SOURCE}")
cd $PROJECT_DIR

export PATH=$PATH:$PROJECT_DIR/../../node_modules/.bin

export NODE_ENV="production"

export GNOMAD_API_URL=${GNOMAD_API_URL:-"http://52.90.164.180/api"}

WEBPACK_DEV_SERVER_ARGS=""
WEBPACK_DEV_SERVER_ARGS="--host=0.0.0.0 --port 8008 --watch-poll --disable-host-check"

webpack-dev-server --config=./config/webpack.config.client.js --hot $WEBPACK_DEV_SERVER_ARGS
