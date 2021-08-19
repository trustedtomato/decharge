#/usr/bin/env bash

# This test script is used for the test GH Action.
# Useful for fully checking if your code is working.

pnpm install

cd packages/protester
pnpm run build
cd ../..

cd packages/decharge
pnpm run build
pnpm run test
cd ../..

cd examples/project-website
pnpm run build
cd ../..

cd examples/blog
pnpm run build
