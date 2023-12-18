@echo off & setlocal enableDelayedExpansion
chcp 65001 >nul

if not exist "..\node_modules" (
  start cmd /k "cd %~dp0 && npm install && exit"
  timeout /t 5 >nul
  goto :main
)

:main
cls
echo Escolha uma opção:
echo    1. Sou um usuário leigo.
echo    2. Sou um usuário avançado.
echo.

set /p escolha=Digite o número da opção: 
if !escolha! equ 1 (
    call :leigo
) else if !escolha! equ 2 (
    call :avancado
) else (
    cls
    echo Opção inválida. Digite 1 ou 2.
    pause >nul
    goto main
)
goto :eof

:leigo
cls
if not exist "%HOMEPATH%\token_clear.json" (
  set /p token=Token: 
  set /p id=ID pra apagar: 
  node . -t !token! -i !id!
  goto :eof
) else (
  set /p id=ID pra apagar: 
  node . -i !id!
  goto :eof
)
goto :eof

:avancado
start cmd /k "cd %~dp0 && node index.js" && exit
goto :eof
