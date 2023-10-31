@echo off
if exist "node_modules" (
  start cmd /k "cd %~dp0 && node discord-multi-tool.js"
) else (
  npm i
  start cmd /k "cd %~dp0 && node discord-multi-tool.js"
)
