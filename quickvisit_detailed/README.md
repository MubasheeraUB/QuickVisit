# QuickVisit - Complete Source Code

This folder contains the complete source code for the QuickVisit Seamless Tourist Destination Ticketing System.

## File Naming Convention

Files use a flat naming scheme where dashes (`-`) represent folder separators:

| Flat filename | Maps to folder path |
|---|---|
| `backend-package.json` | `backend/package.json` |
| `backend-server.js` | `backend/server.js` |
| `backend-config-db.js` | `backend/config/db.js` |
| `backend-routes-auth.js` | `backend/routes/auth.js` |
| `backend-controllers-authController.js` | `backend/controllers/authController.js` |
| `backend-middleware-auth.js` | `backend/middleware/auth.js` |
| `backend-database-schema.sql` | `backend/database/schema.sql` |
| `frontend-index.html` | `frontend/index.html` |
| `frontend-css-style.css` | `frontend/css/style.css` |
| `frontend-js-api.js` | `frontend/js/api.js` |

## Quick Setup

### Option 1: Run the setup script

Open the outputs folder in a terminal and run:

**Windows:**
```cmd
setup.bat
```

**Mac/Linux:**
```bash
bash setup.sh
```

This will automatically organize all the flat files into the proper folder structure.

### Option 2: Manual organization

Create this folder structure and move files according to the table above:

```
quickvisit/
|-- backend/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- routes/
|   |-- database/
|   |-- package.json
|   |-- server.js
|   |-- .env.example
|-- frontend/
|   |-- css/
|   |-- js/
|   |-- index.html
|   |-- login.html
|   |-- tourist.html
|   |-- admin.html
```

## Running the Project

### Prerequisites
- Node.js v18+ ([download](https://nodejs.org))
- PostgreSQL v14+ ([download](https://www.postgresql.org))

### Step 1: Create the database

```sql
CREATE DATABASE quickvisit;
```

Load schema and sample data:
```bash
psql -U postgres -d quickvisit -f backend/database/schema.sql
psql -U postgres -d quickvisit -f backend/database/seed.sql
```

### Step 2: Start the backend

```bash
cd backend
npm install
copy .env.example .env       (Windows)
cp .env.example .env         (Mac/Linux)
```

Edit `.env` with your PostgreSQL password, then:
```bash
npm start
```

Backend runs on `http://localhost:5000`.

### Step 3: Open the frontend

Just double-click `frontend/index.html` or serve it:
```bash
cd frontend
npx http-server -p 3000
```

Open `http://localhost:3000`.

## Default Login Credentials

**Admin:**
- Email: admin@quickvisit.com
- Password: admin123

**Tourist:**
- Email: mubasheera2002@gmail.com
- Password: tourist123

## Author

Mubasheera U B | Enrollment 2251892676 | BCA (BCSP064) | JDT Islam Calicut
