#!/bin/bash
# QuickVisit Setup Script - Organizes flat files into proper folder structure
echo "Setting up QuickVisit project structure..."

mkdir -p quickvisit/backend/{config,routes,controllers,middleware,database}
mkdir -p quickvisit/frontend/{css,js}

# Backend files
mv backend-package.json quickvisit/backend/package.json
mv backend-server.js quickvisit/backend/server.js
mv backend-env.example.txt quickvisit/backend/.env.example
mv backend-config-db.js quickvisit/backend/config/db.js
mv backend-middleware-auth.js quickvisit/backend/middleware/auth.js
mv backend-routes-auth.js quickvisit/backend/routes/auth.js
mv backend-routes-destinations.js quickvisit/backend/routes/destinations.js
mv backend-routes-bookings.js quickvisit/backend/routes/bookings.js
mv backend-routes-payments.js quickvisit/backend/routes/payments.js
mv backend-routes-admin.js quickvisit/backend/routes/admin.js
mv backend-controllers-authController.js quickvisit/backend/controllers/authController.js
mv backend-controllers-destinationController.js quickvisit/backend/controllers/destinationController.js
mv backend-controllers-bookingController.js quickvisit/backend/controllers/bookingController.js
mv backend-controllers-paymentController.js quickvisit/backend/controllers/paymentController.js
mv backend-controllers-adminController.js quickvisit/backend/controllers/adminController.js
mv backend-database-schema.sql quickvisit/backend/database/schema.sql
mv backend-database-seed.sql quickvisit/backend/database/seed.sql

# Frontend files
mv frontend-index.html quickvisit/frontend/index.html
mv frontend-login.html quickvisit/frontend/login.html
mv frontend-tourist.html quickvisit/frontend/tourist.html
mv frontend-admin.html quickvisit/frontend/admin.html
mv frontend-css-style.css quickvisit/frontend/css/style.css
mv frontend-css-tourist.css quickvisit/frontend/css/tourist.css
mv frontend-css-admin.css quickvisit/frontend/css/admin.css
mv frontend-js-api.js quickvisit/frontend/js/api.js
mv frontend-js-auth.js quickvisit/frontend/js/auth.js
mv frontend-js-tourist.js quickvisit/frontend/js/tourist.js
mv frontend-js-admin.js quickvisit/frontend/js/admin.js

echo "Done! Project organized in 'quickvisit' folder."
echo "Next steps:"
echo "  1. cd quickvisit/backend"
echo "  2. npm install"
echo "  3. Setup PostgreSQL and configure .env"
echo "  4. npm start"
