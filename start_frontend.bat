@echo off
echo ========================================
echo    Kiyim-Kechak Frontend ishga tushirish
echo ========================================
echo.

echo 1. Node.js va npm tekshirilmoqda...
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js o'rnatilmaganiga ishonch hosil qiling!
    pause
    exit /b 1
)

echo 2. Dependencies o'rnatilmoqda...
npm install

echo 3. Frontend ishga tushirilmoqda...
echo.
echo ==========================================
echo   Frontend muvaffaqiyatli ishga tushdi!
echo   URL: http://localhost:3000
echo   
echo   Backend ishlab turganiga ishonch hosil qiling:
echo   http://localhost:8000/api/
echo ==========================================
echo.

npm start

pause
