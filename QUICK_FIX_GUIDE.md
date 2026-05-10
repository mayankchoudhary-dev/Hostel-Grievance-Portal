# 🚨 QUICK FIX GUIDE - Authentication Issues

Follow these steps EXACTLY to fix 401 Unauthorized errors:

## Step 1: Clear Storage
Open browser console (F12) and run:
```javascript
localStorage.clear();
```

## Step 2: Login Again (VERY IMPORTANT)
1. Go to login page: http://127.0.0.1:5500/index.html
2. Login with admin credentials
3. Wait for successful redirect to dashboard

## Step 3: Check Token Exists
In console, run:
```javascript
localStorage.getItem('token')
```
**Must NOT be null** - should show long token string starting with "eyJ"

## Step 4: Check Request Headers
1. Open Network tab (F12 > Network)
2. Make any API call (e.g., load dashboard)
3. Click on the request
4. Check Headers tab
5. **Should see:** `Authorization: Bearer eyJhbGciOi...`

---

## 🔧 ALTERNATIVE: Use Clear Storage Button

If you're on admin dashboard:
1. Click **"🗑️ Clear Storage"** button (red button)
2. Wait for redirect to login
3. Login again
4. Check token as above

---

## ✅ Expected Results

After following these steps:
- ✅ Token should be stored in localStorage
- ✅ Authorization header should be sent with requests
- ✅ No more 401 Unauthorized errors
- ✅ Admin dashboard data should load

---

## 🐛 If Still Not Working

1. **Check Backend Status:** Make sure backend is running on port 5000
   ```bash
   cd c:\Users\Mayank choudhary\Desktop\HGP_AntiG\backend
   npm start
   ```

2. **Test API Connection:** Click "⚡ Quick Test" button in admin dashboard

3. **Check Console Logs:** Look for any error messages in browser console

---

## 📝 Troubleshooting Checklist

- [ ] Backend server running on port 5000
- [ ] localStorage.clear() executed
- [ ] Fresh login completed
- [ ] Token exists in localStorage
- [ ] Authorization header present in requests
- [ ] No 401 errors in console

---

## 🎯 Final Verification

Run this in console to verify everything is working:
```javascript
console.log("Token:", localStorage.getItem('token'));
console.log("User:", JSON.parse(localStorage.getItem('user') || 'null'));
console.log("API_BASE:", window.API_BASE);
```

All should show valid values, not null or undefined.
