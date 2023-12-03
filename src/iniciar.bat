@echo off
if exist "..\node_modules" (
  start cmd /k "cd %~dp0 && node index.js"
) else (
  npm install
  start cmd /k "cd %~dp0 && node index.js"
)
