// Authentication & Authorization

// Wait for Firebase to be ready
async function waitForFirebase(maxAttempts = 50) {
  let attempts = 0;
  while ((!auth || !firebaseReady) && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    attempts++;
  }

  if (!auth || !firebaseReady) {
    const errorMsg =
      "Firebase auth not initialized. Check Firebase configuration in js/config.js and ensure all Firebase scripts are loaded.";
    console.error("❌ Error:", errorMsg);
    showToast(errorMsg, "error");
    throw new Error(errorMsg);
  }

  return auth;
}

// Check if user is authenticated
function isUserAuthenticated() {
  return new Promise((resolve) => {
    // Check if auth is ready
    const checkAuth = setInterval(() => {
      if (auth) {
        clearInterval(checkAuth);
        const unsubscribe = auth.onAuthStateChanged((user) => {
          unsubscribe();
          resolve(!!user);
        });
      }
    }, 50);

    // Timeout after 5 seconds
    setTimeout(() => {
      clearInterval(checkAuth);
      resolve(false);
    }, 5000);
  });
}

// Get current user
function getCurrentUser() {
  return auth?.currentUser || null;
}

// Login with email and password
async function loginWithEmail(email, password) {
  try {
    if (!auth) {
      await waitForFirebase();
    }
    const result = await auth.signInWithEmailAndPassword(email, password);
    localStorage.setItem(STORAGE_KEYS.ADMIN_USER, result.user.uid);
    return result.user;
  } catch (error) {
    throw new Error(error.message || "Login failed");
  }
}

// Login with Google
async function loginWithGoogle() {
  try {
    if (!auth) {
      await waitForFirebase();
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await auth.signInWithPopup(provider);
    localStorage.setItem(STORAGE_KEYS.ADMIN_USER, result.user.uid);
    return result.user;
  } catch (error) {
    throw new Error(error.message || "Google login failed");
  }
}

// Logout
async function logout() {
  try {
    if (!auth) {
      await waitForFirebase();
    }
    await auth.signOut();
    localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
    return true;
  } catch (error) {
    throw new Error(error.message || "Logout failed");
  }
}

// Protect admin pages
async function protectAdminPage() {
  const isAuthenticated = await isUserAuthenticated();

  if (!isAuthenticated) {
    window.location.href = "admin-login.html";
    return false;
  }

  return true;
}

// Setup login form
function setupLoginForm() {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const btn = loginForm.querySelector('button[type="submit"]');

    try {
      btn.disabled = true;
      btn.textContent = "Signing in...";

      const user = await loginWithEmail(email, password);
      showToast("Logged in successfully!", "success");

      setTimeout(() => {
        window.location.href = "admin.html";
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      showToast(error.message || "Login failed", "error");
      btn.disabled = false;
      btn.textContent = "Sign In";
    }
  });
}

// Setup Google login
function setupGoogleLogin() {
  const googleBtn = document.getElementById("googleSignIn");
  if (!googleBtn) return;

  googleBtn.addEventListener("click", async () => {
    try {
      googleBtn.disabled = true;
      googleBtn.textContent = "Loading...";

      const user = await loginWithGoogle();
      showToast("Logged in with Google!", "success");

      setTimeout(() => {
        window.location.href = "admin.html";
      }, 1000);
    } catch (error) {
      console.error("Google login error:", error);
      showToast(error.message || "Google login failed", "error");
      googleBtn.disabled = false;
      googleBtn.textContent = "Sign in with Google";
    }
  });
}

// Setup auth on login page
document.addEventListener("DOMContentLoaded", () => {
  // Wait for Firebase to initialize
  if (!firebaseReady) {
    console.log("Waiting for Firebase to initialize...");
    const waitForInit = setInterval(() => {
      if (firebaseReady) {
        clearInterval(waitForInit);
        setupLoginForm();
        setupGoogleLogin();
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!firebaseReady) {
        clearInterval(waitForInit);
        showToast(
          "Firebase initialization timeout. Check console for errors.",
          "error",
        );
      }
    }, 10000);
  } else {
    setupLoginForm();
    setupGoogleLogin();
  }
});

// Auth listeners for admin pages
if (document.getElementById("logoutBtn")) {
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
      await logout();
      showToast("Logged out successfully", "success");
      setTimeout(() => {
        window.location.href = "admin-login.html";
      }, 500);
    } catch (error) {
      showToast("Error logging out", "error");
    }
  });
}

// Protect admin on page load
if (window.location.pathname.includes("admin.html")) {
  protectAdminPage().then((isProtected) => {
    if (isProtected) {
      // Load admin content
      loadAdminContent();
    }
  });
}

// Load admin user info
async function loadAdminUserInfo() {
  const user = getCurrentUser();
  if (user) {
    document.getElementById("adminName").textContent =
      user.displayName || user.email;
    document.getElementById("adminEmail").textContent = user.email;

    if (user.photoURL) {
      document.getElementById("adminAvatar").src = user.photoURL;
    }
  }
}

// Initialize admin UI
async function loadAdminContent() {
  try {
    loadAdminUserInfo();

    if (typeof loadAdminDashboard === "function") {
      loadAdminDashboard();
    }

    setupSidebar();
  } catch (error) {
    console.error("Error loading admin content:", error);
  }
}

// Call on admin page load
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("admin.html")) {
    if (!firebaseReady) {
      console.log("Admin page: Waiting for Firebase to initialize...");
      const waitForInit = setInterval(() => {
        if (firebaseReady && auth) {
          clearInterval(waitForInit);
          loadAdminContent();
        }
      }, 100);

      // Timeout
      setTimeout(() => {
        clearInterval(waitForInit);
        if (!firebaseReady) {
          showToast("Firebase initialization timeout", "error");
        }
      }, 10000);
    } else if (auth) {
      loadAdminContent();
    }
  }
});
