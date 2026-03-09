# ⚡ Quick Start Guide (5 Minutes)

## Prerequisites

- Firebase account (free at firebase.google.com)
- GitHub account
- Code editor (VS Code recommended)

---

## 🔥 Step 1: Firebase Setup (2 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project named "portfolio"
3. Copy your config from **Project Settings**:

```javascript
// YOUR GENERATED CONFIG
const firebaseConfig = {
  apiKey: "COPY_YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

4. Paste into `js/config.js` (replace the placeholder config)

---

## 🗄️ Step 2: Firestore Setup (1 minute)

1. In Firebase → **Firestore Database**
2. Click **Create Database** → **Test Mode** → Create

3. Delete the entire contents of **Firestore Rules** and paste this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /portfolio/{document=**} { allow read: if true; }
    match /projects/{document=**} { allow read: if true; }
    match /skills/{document=**} { allow read: if true; }
    match /{document=**} { allow write: if request.auth != null; }
    match /messages/{document=**} {
      allow create: if true;
      allow read: if request.auth != null;
    }
  }
}
```

Click **Publish**

---

## 👤 Step 3: Create Admin User (1 minute)

1. Go to **Authentication** → **Get Started**
2. Enable **Email/Password**
3. Click **Users** tab → **Add User**
4. Enter email: `admin@example.com`
5. Enter password: `Admin123!`
6. Click **Create User**

---

## 🔧 Step 4: Update Config (30 seconds)

### 1. Update GitHub Username

Open `js/config.js`:

```javascript
const GITHUB_USERNAME = "YOUR_GITHUB_USERNAME"; // change this
```

### 2. Update Firebase Config

```javascript
const firebaseConfig = {
  // PASTE YOUR FIREBASE CONFIG HERE
};
```

---

## 📝 Step 5: Add Initial Data (1 minute)

### In Firebase Firestore, Create:

**1. Collection: `portfolio`**

- Document ID: `profile`
- Add fields:
  - `name`: "Your Name"
  - `title`: "Your Title"
  - `bio`: "Your Bio"
  - `email`: "your@email.com"
  - `github`: "your-github-username"

**2. Collection: `portfolio`**

- Document ID: `about`
- Add fields:
  - `aboutText`: "About you..."
  - `experience`: 2
  - `interests`: "AI, Web Dev"

**3. Collection: `projects`**

- Add document with fields:
  - `title`: "Project Name"
  - `description`: "Description"
  - `technologies`: "React, Node"
  - `featured`: true
  - `githubLink`: "github url"

**4. Collection: `skills`**

- Add document:
  - `skillName`: "React"
  - `category`: "frontend"
  - `icon`: "fab fa-react"

---

## 🎉 Step 6: Test Locally (30 seconds)

```bash
# Option 1: Direct Open
1. Open index-new.html in browser

# Option 2: Live Server
1. Right-click index-new.html
2. "Open with Live Server"
```

### Test Admin Panel:

1. Open `admin-login.html`
2. Login with: admin@example.com / Admin123!
3. You're in the admin panel!

---

## ✅ Verification Checklist

- [ ] Firebase config updated in `js/config.js`
- [ ] GitHub username updated in `js/config.js`
- [ ] Firestore collections created
- [ ] Initial data added
- [ ] Admin user created
- [ ] Portfolio page loads
- [ ] Admin page accessible after login
- [ ] GitHub stats showing
- [ ] Projects displaying

---

## 🚀 Ready to Deploy!

Choose one:

### Vercel (Easiest)

```bash
1. Push to GitHub
2. Go to vercel.com
3. Import GitHub repo
4. Deploy (done!)
```

### Netlify

```bash
1. Go to netlify.com
2. Drag & drop portfolio folder
3. Live in seconds!
```

### GitHub Pages

```bash
1. Push to GitHub
2. Settings → Pages
3. Deploy from main branch
```

---

## 🆘 Quick Troubleshooting

| Problem                | Solution                                  |
| ---------------------- | ----------------------------------------- |
| "Firebase not defined" | Check all script tags loaded in HTML      |
| Admin login fails      | Verify user exists in Firebase Auth       |
| No GitHub data         | Check GitHub username in config.js        |
| Firestore errors       | Check collection names and security rules |
| CORS errors            | This is normal - GitHub API is read-only  |

---

## 🎯 You're Done! 🎉

Your professional portfolio is live and ready to impress!

**Next**: Update personal info, add your projects, customize colors.

For detailed setup → See `PORTFOLIO_SETUP.md`

Questions? Check troubleshooting section in main guide!
