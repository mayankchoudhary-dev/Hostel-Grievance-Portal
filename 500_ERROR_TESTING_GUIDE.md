# 🔍 500 ERROR - COMPREHENSIVE TESTING GUIDE

## **🚨 IMMEDIATE ACTIONS TO IDENTIFY 500 ERROR**

### **✅ STEP 1: Test Debug Endpoint**
```
GET https://hostel-grievance-portal.onrender.com/api/debug
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Debug information",
  "data": {
    "timestamp": "2026-04-08T...",
    "environment": "development",
    "database": "✅ Connected",
    "middleware": "Testing...",
    "auth": "Testing..."
  }
}
```

**If this returns 500, the issue is in the debug endpoint itself.**

### **✅ STEP 2: Test Health Endpoint**
```
GET https://hostel-grievance-portal.onrender.com/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Hostel Grievance Portal API is running 🚀"
}
```

### **✅ STEP 3: Test Login with Mock Credentials**
```
POST https://hostel-grievance-portal.onrender.com/api/login
Content-Type: application/json

{
  "email": "admin@hostel.com",
  "password": "admin123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "admin@hostel.com",
    "role": "admin",
    "name": "Admin"
  }
}
```

### **✅ STEP 4: Test Dashboard Endpoints**
```
GET https://hostel-grievance-portal.onrender.com/api/complaints/my
Authorization: Bearer YOUR_JWT_TOKEN
```

```
GET https://hostel-grievance-portal.onrender.com/api/admin/complaints
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## **🔍 DETAILED ERROR ANALYSIS**

### **Check Render Logs For:**
```
🚨 GLOBAL ERROR HANDLER:
💥 Error: [specific error message]
💥 Stack: [full stack trace]
💥 Request URL: /api/complaints/my
💥 Request Method: GET
💥 Request Headers: {...}
💥 Request Body: {...}
```

### **Common Error Patterns:**

#### **1. Database Connection Errors:**
```
ECONNREFUSED: Connection refused
ER_ACCESS_DENIED_ERROR: Wrong credentials
ER_BAD_DB_ERROR: Database not found
ENOTFOUND: Database host not found
```

#### **2. JWT/Middleware Errors:**
```
JsonWebTokenError: Invalid token
TokenExpiredError: Token expired
Error: jwt secret not defined
```

#### **3. SQL Query Errors:**
```
ER_NO_SUCH_TABLE: Table doesn't exist
ER_BAD_FIELD_ERROR: Column doesn't exist
ER_PARSE_ERROR: SQL syntax error
```

---

## **🛠️ QUICK FIXES TO TRY**

### **Fix 1: Database Connection**
```javascript
// In backend/.env
DB_HOST=your-render-db-host
DB_USER=your-render-db-user
DB_PASSWORD=your-render-db-password
DB_NAME=your-render-db-name
```

### **Fix 2: Environment Variables**
```javascript
// In Render dashboard, set these:
NODE_ENV=production
JWT_SECRET=your-secret-key-here
CLIENT_URL=https://hostelhgp.netlify.app
```

### **Fix 3: Middleware Order**
```javascript
// In server.js, ensure this order:
app.use(express.json());
app.use(cors());
app.use('/api', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
```

---

## **📋 TESTING CHECKLIST**

### **✅ Before Testing:**
- [ ] Deploy updated backend to Render
- [ ] Wait for deployment completion (2-3 minutes)
- [ ] Clear browser cache and localStorage
- [ ] Have JWT token ready for testing

### **✅ During Testing:**
- [ ] Check browser console for errors
- [ ] Monitor Render logs in real-time
- [ ] Test each endpoint individually
- [ ] Verify response formats

### **✅ After Testing:**
- [ ] Document exact error messages
- [ ] Identify failure point (middleware, database, controller)
- [ ] Apply specific fix
- [ ] Retest and confirm resolution

---

## **🎯 EXPECTED OUTCOMES**

### **If Database Issues:**
- Debug endpoint shows database connection failed
- Mock login works, dashboard shows sample data
- Clear error message about database configuration

### **If Middleware Issues:**
- Debug endpoint works, but dashboard endpoints fail
- Auth middleware errors in logs
- Token verification errors

### **If Controller Issues:**
- Debug and health endpoints work
- Dashboard endpoints fail with specific error
- Clear error message from controller

---

## **🚀 NEXT STEPS**

1. **Deploy changes** to Render
2. **Test debug endpoint** first
3. **Check Render logs** for detailed errors
4. **Test endpoints** in order: health → login → dashboard
5. **Document findings** and apply specific fix

**This systematic approach will identify the exact cause of your 500 errors!** 🔍
