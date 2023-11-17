@echo off
if exist "..\node_modules" (
  start cmd /k "cd %~dp0 && node index.js"
) else (
  npm i
  start cmd /k "cd %~dp0 && node index.js"
)
