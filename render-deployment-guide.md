# Render Deployment Guide - Hostel Grievance Portal

## Overview
Deploy your Hostel Grievance Portal on Render with two services:
- **Backend Service** (Node.js + MySQL)
- **Frontend Service** (Static HTML/CSS/JS)

---

## 1. Backend Deployment (Node.js Service)

### Service Settings
```
Service Type: Web Service
Name: hgp-backend
Environment: Node
Region: Choose nearest to your users
Branch: main
Root Directory: backend
Build Command: npm install
Start Command: node server.js
```

### Environment Variables
```bash
# Database Configuration
DB_HOST=your-render-mysql-host
DB_USER=your-db-username
DB_PASSWORD=your-db-password
DB_NAME=hostel_grievance_portal

# Server Configuration
PORT=5001
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-for-production

# CORS Configuration
CLIENT_URL=https://your-frontend-url.onrender.com
```

### render.yaml (Backend)
```yaml
services:
  - type: web
    name: hgp-backend
    env: node
    repo: https://github.com/yourusername/your-repo
    rootDir: backend
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5001
      - key: DB_HOST
        sync: false
      - key: DB_USER
        sync: false
      - key: DB_PASSWORD
        sync: false
      - key: DB_NAME
        value: hostel_grievance_portal
      - key: JWT_SECRET
        sync: false
      - key: CLIENT_URL
        sync: false
```

---

## 2. Frontend Deployment (Static Site)

### Service Settings
```
Service Type: Static Site
Name: hgp-frontend
Environment: Static
Region: Same as backend
Branch: main
Root Directory: frontend
Build Command: echo "No build needed"
Publish Directory: .
```

### Environment Variables
```bash
# No environment variables needed for static site
```

### render.yaml (Frontend)
```yaml
services:
  - type: web
    name: hgp-frontend
    env: static
    repo: https://github.com/yourusername/your-repo
    rootDir: frontend
    buildCommand: echo "No build needed"
    staticPublishDir: .
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

---

## 3. Database Setup (Render MySQL)

### Create MySQL Database
```
Service Type: Database
Name: hgp-mysql
Database Type: MySQL
Version: 8
User: hgp_user
Password: [Generate secure password]
```

### Import Database Schema
```sql
-- Run this in Render MySQL dashboard after creation

CREATE DATABASE IF NOT EXISTS hostel_grievance_portal;
USE hostel_grievance_portal;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    room_no VARCHAR(50),
    role ENUM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complaints table
CREATE TABLE complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('Electricity', 'Water', 'Mess', 'Cleanliness', 'Internet', 'Other') NOT NULL,
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    status ENUM('Pending', 'In Progress', 'Resolved') DEFAULT 'Pending',
    admin_remark TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert default admin user
INSERT INTO users (name, email, password, role) VALUES 
('Admin', 'admin@hgp.com', '$2b$10$YourHashedPasswordHere', 'admin');
```

---

## 4. Frontend Configuration Updates

### Update API_BASE in frontend files

#### frontend/js/env.js
```javascript
window.ENV.API_BASE_URL = 'https://your-backend-url.onrender.com';
```

#### frontend/js/auth.js
```javascript
const API_BASE = window.API_BASE || 'https://your-backend-url.onrender.com';
```

#### Update logout redirect URLs
```javascript
const redirects = [
    'https://your-frontend-url.onrender.com/index.html',  // Production
    'http://localhost:5500/index.html',  // Development
    'index.html'  // Fallback
];
```

---

## 5. Complete render.yaml Configuration

Create `render.yaml` in project root:

```yaml
services:
  # Backend Service
  - type: web
    name: hgp-backend
    env: node
    repo: https://github.com/yourusername/your-repo
    rootDir: backend
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5001
      - key: DB_HOST
        fromDatabase:
          name: hgp-mysql
          property: host
      - key: DB_USER
        fromDatabase:
          name: hgp-mysql
          property: user
      - key: DB_PASSWORD
        fromDatabase:
          name: hgp-mysql
          property: password
      - key: DB_NAME
        value: hostel_grievance_portal
      - key: JWT_SECRET
        generateValue: true
      - key: CLIENT_URL
        value: https://your-frontend-url.onrender.com

  # Frontend Service
  - type: web
    name: hgp-frontend
    env: static
    repo: https://github.com/yourusername/your-repo
    rootDir: frontend
    buildCommand: echo "No build needed"
    staticPublishDir: .
    routes:
      - type: rewrite
        source: /*
        destination: /index.html

  # Database
  - type: pserv
    name: hgp-mysql
    env: mysql
    plan: free
    ipAllowList: []
    databases:
      - name: hostel_grievance_portal
        user: hgp_user
```

---

## 6. Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Configure for Render deployment"
git push origin main
```

### Step 2: Create Render Services
1. Go to [render.com](https://render.com)
2. Connect your GitHub repository
3. Create the services using the configurations above
4. Wait for deployment to complete

### Step 3: Configure Environment Variables
1. Copy database connection details from Render MySQL dashboard
2. Update backend environment variables
3. Update frontend API_BASE with your backend URL

### Step 4: Test Deployment
1. Visit your frontend URL
2. Test registration and login
3. Test image upload functionality
4. Test admin dashboard

---

## 7. Production Optimizations

### Backend Optimizations
```javascript
// backend/server.js - Add these for production
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enable compression
const compression = require('compression');
app.use(compression());

// Security headers
const helmet = require('helmet');
app.use(helmet());
```

### Frontend Optimizations
```html
<!-- Add to frontend/index.html -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
```

---

## 8. Troubleshooting

### Common Issues

#### 1. Database Connection Failed
- Check database credentials in environment variables
- Verify database is created and schema imported
- Check firewall rules

#### 2. CORS Errors
- Update CLIENT_URL environment variable
- Verify frontend URL in CORS configuration

#### 3. Image Upload Issues
- Ensure uploads directory exists
- Check file permissions
- Verify image URL construction

#### 4. 404 Errors
- Check static site routing configuration
- Verify file paths in frontend

### Debug Commands
```bash
# Check backend logs
render logs hgp-backend

# Check frontend deployment
render logs hgp-frontend

# Restart services
render restart hgp-backend
render restart hgp-frontend
```

---

## 9. URLs After Deployment

```
Backend: https://hgp-backend.onrender.com
Frontend: https://hgp-frontend.onrender.com
Database: Available in Render dashboard
```

## 10. Cost Estimate (Free Tier)

- **Backend**: Free tier (750 hours/month)
- **Frontend**: Free static hosting
- **Database**: Free MySQL (90 days, then $7/month)
- **Total**: $0-7/month depending on database usage

---

## 11. Post-Deployment Checklist

- [ ] Test user registration
- [ ] Test admin login
- [ ] Test complaint submission
- [ ] Test image upload and display
- [ ] Test logout functionality
- [ ] Verify email notifications (if configured)
- [ ] Check mobile responsiveness
- [ ] Test with different browsers
- [ ] Monitor error logs
- [ ] Set up monitoring alerts
