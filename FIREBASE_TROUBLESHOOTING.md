# Firebase Configuration Troubleshooting Guide

## Error: "Cannot read properties of undefined"

If you're seeing errors like:

- `Cannot read properties of undefined (reading 'signInWithEmailAndPassword')`
- `Cannot read properties of undefined (reading 'firestore')`
- `Cannot read properties of undefined (reading 'collection')`

This means Firebase has not been properly initialized. Follow these steps:

---

## ✅ Solution: Configure Firebase Credentials

### Step 1: Get Your Firebase Config

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click **Settings ⚙️** → **Project Settings**
4. Scroll down to **Your apps**
5. Click on the Web app (or create one if needed)
6. Copy your Firebase config object (should look like this):

```javascript
{
  apiKey: "AIzaSyxxxxxxxxxx",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-xxx",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx"
}
```

### Step 2: Update js/config.js

Open `js/config.js` and replace:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

With your actual config values.

### Step 3: Verify Firebase Scripts

Make sure ALL three Firebase scripts are loaded in your HTML files:

**admin-login.html (✅ Fixed)**

```html
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js"></script>
<script src="js/config.js"></script>
<script src="js/auth.js"></script>
```

**admin.html** (✅ Already correct)

```html
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js"></script>
<script src="js/config.js"></script>
<script src="js/auth.js"></script>
<script src="js/admin.js"></script>
```

**index-new.html** (✅ Already correct)

```html
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js"></script>
<script src="js/config.js"></script>
<script src="js/main.js"></script>
<script src="js/github.js"></script>
```

---

## 🔍 How to Debug

### 1. Check the Browser Console

1. Open your website
2. Press **F12** (or right-click → Inspect)
3. Click **Console** tab
4. Look for error messages

### 2. Check Firebase Initialization

In the Console, type:

```javascript
console.log(auth); // Should show Firebase auth object
console.log(db); // Should show Firestore object
```

If both show `undefined`, Firebase hasn't initialized yet.

### 3. Check Network Requests

1. Press **F12** → **Network** tab
2. Reload the page
3. Look for failed requests to `gstatic.com`
4. If Firebase CDN scripts failed, check your internet connection

### 4. Check Configuration

In the Console, type:

```javascript
console.log(firebaseConfig);
```

Make sure all values are NOT the default `"YOUR_API_KEY"` etc.

---

## ⚠️ Common Mistakes

### ❌ Mistake 1: Using Placeholder Values

```javascript
// WRONG ❌
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // ← This is just a placeholder!
  //...
};
```

**Fix:** Replace with actual values from Firebase Console.

### ❌ Mistake 2: Missing firebase-firestore Script

If you only include `firebase-app.js` and `firebase-auth.js`:

```javascript
// WRONG ❌ (Missing Firestore)
<script src="...firebase-app.js"></script>
<script src="...firebase-auth.js"></script>
```

**Fix:** Add all three:

```html
<!-- CORRECT ✅ -->
<script src="...firebase-app.js"></script>
<script src="...firebase-firestore.js"></script>
<script src="...firebase-auth.js"></script>
```

### ❌ Mistake 3: Scripts in Wrong Order

```javascript
// WRONG ❌
<script src="js/config.js"></script>      <!-- Uses Firebase -->
<script src="...firebase-app.js"></script> <!-- Firebase loads too late! -->
```

**Fix:** Load Firebase scripts BEFORE config.js:

```html
<!-- CORRECT ✅ -->
<script src="...firebase-app.js"></script>
<script src="...firebase-firestore.js"></script>
<script src="...firebase-auth.js"></script>
<script src="js/config.js"></script>
```

---

## 🚀 Verify It Works

### Test Login Page

1. Open `admin-login.html` in browser
2. Open DevTools Console (F12)
3. You should see: `"Firebase initialized successfully"`
4. Try entering email/password (should now work)

### Test Portfolio

1. Open `index-new.html`
2. Check Console for: `"Firebase initialized successfully"`
3. GitHub stats should load

### Test Admin Panel

1. Open `admin.html`
2. You should be redirected to login (auth protecting it)
3. After login, you should see the dashboard

---

## 📋 Setup Checklist

- [ ] Firebase project created
- [ ] Firebase config copied to `js/config.js`
- [ ] All three Firebase scripts are in HTML files
- [ ] Scripts are loaded in correct order
- [ ] No placeholder values remain (`YOUR_API_KEY` etc.)
- [ ] Browser console shows "Firebase initialized successfully"
- [ ] Admin login works
- [ ] Portfolio data loads

---

## Still Having Issues?

### Enable Debug Logging

Add this to the top of your HTML (before scripts):

```html
<script>
  window.onerror = function (msg, url, lineNo, columnNo, error) {
    console.error("Error: " + msg);
    console.error("Stack: " + error.stack);
    return false;
  };
</script>
```

### Check Firebase Status

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Check that:
   - [ ] Project exists and is active
   - [ ] Firestore database is created
   - [ ] Authentication is enabled
   - [ ] No outages reported

### Test Firebase Connection

In browser Console, try:

```javascript
// Wait a moment, then run:
firebase.initializeApp(firebaseConfig);
const testDb = firebase.firestore();
const testAuth = firebase.auth();

console.log("DB:", testDb);
console.log("Auth:", testAuth);
```

---

## 📚 Additional Resources

- [Firebase Setup Guide](https://firebase.google.com/docs/web/setup)
- [Firebase Authentication](https://firebase.google.com/docs/auth/web/start)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [QUICK_START.md](QUICK_START.md) - Full setup guide

---

**If you've completed all steps and still have issues, check the browser console for specific error messages and refer to the Firebase documentation.**

Happy coding! 🚀
