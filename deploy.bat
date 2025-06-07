@echo off
echo ========================================
echo   COLOR BLOCK JAM - DEPLOYMENT HELPER
echo ========================================
echo.
echo Your Flutter web app is built and ready for deployment!
echo.
echo Built files location: %cd%\build\web
echo.
echo QUICK DEPLOYMENT STEPS:
echo 1. Opening Netlify Drop in your browser...
echo 2. Drag and drop the 'web' folder to the page
echo 3. Get your live URL instantly!
echo.
echo Opening Netlify Drop...
start https://drop.netlify.com
echo.
echo Opening build folder...
start %cd%\build
echo.
echo INSTRUCTIONS:
echo - From the opened folder, drag the 'web' folder to the Netlify Drop page
echo - Your game will be live in seconds!
echo - Copy the URL you receive and share it!
echo.
pause 