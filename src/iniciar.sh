#!/bin/bash

if [ -d "../node_modules" ]; then
  gnome-terminal --working-directory="$(pwd)" -- bash -c "node index.js; exec bash"
else
  npm install
  gnome-terminal --working-directory="$(pwd)" -- bash -c "node index.js; exec bash"
fi
