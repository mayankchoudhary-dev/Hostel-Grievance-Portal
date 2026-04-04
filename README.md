# 🏠 Hostel Grievance Portal

A full-stack web application for hostel students to submit complaints and admins/wardens to manage them.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS (Vanilla), JavaScript |
| Backend | Node.js + Express |
| Database | MySQL |
| Auth | JWT + bcrypt |
| Real-time | Socket.io |
| File Upload | Multer |
| Email | Nodemailer (Gmail) |
| Charts | Chart.js |

---

## 📁 Project Structure

```
HGP_AntiG/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── complaintController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── complaintRoutes.js
│   │   └── adminRoutes.js
│   ├── uploads/
│   ├── schema.sql
│   ├── server.js
│   ├── .env
│   └── package.json
└── frontend/
    ├── index.html             # Login
    ├── register.html
    ├── student-dashboard.html
    ├── admin-dashboard.html
    ├── css/style.css
    └── js/
        ├── auth.js
        ├── student.js
        └── admin.js
```

---

## ⚙️ Prerequisites

- **Node.js** v16+ → [nodejs.org](https://nodejs.org)
- **MySQL** 8.0+ → [mysql.com](https://dev.mysql.com/downloads/)
- A browser (Chrome or Edge recommended)

---

## 🛠️ Setup Instructions

### 1. Clone / open the project

```bash
cd "C:\Users\Mayank choudhary\Desktop\HGP_AntiG"
```

### 2. Set up the MySQL database

Open MySQL Workbench or MySQL command line and run:

```sql
source backend/schema.sql;
```

This creates the `hostel_grievance` database, `users` and `complaints` tables, and inserts a default admin seed.

### 3. Configure environment variables

Open `backend/.env` and fill in your values:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=hostel_grievance
JWT_SECRET=any_long_random_string
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://127.0.0.1:5500
```

> **Email setup**: In Gmail → Manage your Google Account → Security → 2-Step Verification (on) → App Passwords → generate a 16-character password. Use it as `EMAIL_PASS`.

### 4. Install backend dependencies

```bash
cd backend
npm install
```

### 5. Start the backend server

```bash
npm start
```

You should see:
```
✅ MySQL connected successfully
🚀 Server running on http://localhost:5000
```

### 6. Open the frontend

**Option A — VS Code Live Server** (recommended):
Right-click `frontend/index.html` → "Open with Live Server"

**Option B — npx serve**:
```bash
npx serve frontend
```
Then open `http://localhost:3000`

**Option C — Direct file**:
Double-click `frontend/index.html` (Note: file:// protocol may have CORS issues)

---

## 👤 Default Admin Account

After running `schema.sql`, manually insert a proper admin:

```sql
USE hostel_grievance;
-- Register via the API first as a student, then promote:
UPDATE users SET role = 'admin' WHERE email = 'admin@hostel.com';
```

Or use the **register page** to create any account, then manually update the role in MySQL.

---

## 🔑 API Endpoints Summary

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/register` | Public |
| POST | `/api/login` | Public |

### Student
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/complaints` | Student |
| GET | `/api/complaints/my` | Student |
| PUT | `/api/complaints/:id` | Student (own) |
| DELETE | `/api/complaints/:id` | Student (own) |

### Admin
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/admin/complaints` | Admin |
| PUT | `/api/admin/complaints/:id/status` | Admin |
| PUT | `/api/admin/complaints/:id/remark` | Admin |
| DELETE | `/api/admin/complaints/:id` | Admin |
| GET | `/api/admin/analytics` | Admin |

---

## ✨ Features

- 🔐 JWT auth with bcrypt password hashing
- 📋 Submit complaints with optional image upload (max 5 MB)
- 🏷️ Color-coded status badges (Pending / In Progress / Resolved)
- 🔍 Search and multi-filter for complaints
- 📄 Pagination (10 per page)
- 💬 Admin remarks with email notification on resolve
- 📊 Analytics charts (doughnut + bar via Chart.js)
- 🔴 Real-time updates via Socket.io
- 🌙 Dark / Light mode toggle
- 📱 Fully responsive mobile UI

---

## 🔒 Security

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens expire after 7 days
- All admin routes protected by role middleware
- Multer validates file type and size
- SQL queries use parameterized statements (no injection)
- Input validated server-side using express-validator

---

## 📝 License

MIT — open source, free to use.
