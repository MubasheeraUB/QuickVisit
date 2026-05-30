@echo off
REM QuickVisit Setup Script - Organizes flat files into proper folder structure
echo Setting up QuickVisit project structure...

mkdir quickvisit 2>nul
mkdir quickvisit\backend 2>nul
mkdir quickvisit\backend\config 2>nul
mkdir quickvisit\backend\routes 2>nul
mkdir quickvisit\backend\controllers 2>nul
mkdir quickvisit\backend\middleware 2>nul
mkdir quickvisit\backend\database 2>nul
mkdir quickvisit\frontend 2>nul
mkdir quickvisit\frontend\css 2>nul
mkdir quickvisit\frontend\js 2>nul

REM Backend files
move /Y backend-package.json quickvisit\backend\package.json >nul
move /Y backend-server.js quickvisit\backend\server.js >nul
move /Y backend-env.example.txt quickvisit\backend\.env.example >nul
move /Y backend-config-db.js quickvisit\backend\config\db.js >nul
move /Y backend-middleware-auth.js quickvisit\backend\middleware\auth.js >nul
move /Y backend-routes-auth.js quickvisit\backend\routes\auth.js >nul
move /Y backend-routes-destinations.js quickvisit\backend\routes\destinations.js >nul
move /Y backend-routes-bookings.js quickvisit\backend\routes\bookings.js >nul
move /Y backend-routes-payments.js quickvisit\backend\routes\payments.js >nul
move /Y backend-routes-admin.js quickvisit\backend\routes\admin.js >nul
move /Y backend-controllers-authController.js quickvisit\backend\controllers\authController.js >nul
move /Y backend-controllers-destinationController.js quickvisit\backend\controllers\destinationController.js >nul
move /Y backend-controllers-bookingController.js quickvisit\backend\controllers\bookingController.js >nul
move /Y backend-controllers-paymentController.js quickvisit\backend\controllers\paymentController.js >nul
move /Y backend-controllers-adminController.js quickvisit\backend\controllers\adminController.js >nul
move /Y backend-database-schema.sql quickvisit\backend\database\schema.sql >nul
move /Y backend-database-seed.sql quickvisit\backend\database\seed.sql >nul

REM Frontend files
move /Y frontend-index.html quickvisit\frontend\index.html >nul
move /Y frontend-login.html quickvisit\frontend\login.html >nul
move /Y frontend-tourist.html quickvisit\frontend\tourist.html >nul
move /Y frontend-admin.html quickvisit\frontend\admin.html >nul
move /Y frontend-css-style.css quickvisit\frontend\css\style.css >nul
move /Y frontend-css-tourist.css quickvisit\frontend\css\tourist.css >nul
move /Y frontend-css-admin.css quickvisit\frontend\css\admin.css >nul
move /Y frontend-js-api.js quickvisit\frontend\js\api.js >nul
move /Y frontend-js-auth.js quickvisit\frontend\js\auth.js >nul
move /Y frontend-js-tourist.js quickvisit\frontend\js\tourist.js >nul
move /Y frontend-js-admin.js quickvisit\frontend\js\admin.js >nul

echo Done! Project organized in 'quickvisit' folder.
echo Next steps:
echo   1. cd quickvisit\backend
echo   2. npm install
echo   3. Setup PostgreSQL and configure .env
echo   4. npm start
pause
