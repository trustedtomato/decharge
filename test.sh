#/usr/bin/env bash

# This test script is used for the test GH Action.
# Useful for fully checking if your code is working.

pnpm install

cd packages/protester
npm run build
cd ../..

cd packages/decharge
npm run build
npm run test
cd ../..

cd examples/project-website
npm run build
cd ../..

cd examples/blog
npm run build
