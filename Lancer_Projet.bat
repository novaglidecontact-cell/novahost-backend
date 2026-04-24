@echo off
title NovaHost - Demarrage Global
echo ==========================================
echo    DEMARRAGE DE NOVAHOST (Client + Serveur)
echo ==========================================

:: Lancement du Serveur dans une nouvelle fenetre
echo [1/2] Lancement du Serveur...
start "NovaHost SERVER" cmd /k "cd server && node index.js"

:: Attente de 2 secondes pour laisser le serveur respirer
timeout /t 2 /nobreak > nul

:: Lancement du Client dans une nouvelle fenetre
echo [2/2] Lancement du Client...
start "NovaHost CLIENT" cmd /k "cd client && npm run dev"

echo.
echo ==========================================
echo    TOUT EST LANCE ! 
echo    - Serveur sur le port 5001
echo    - Client sur le port 5173
echo ==========================================
pause
