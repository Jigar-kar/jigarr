// Firebase Configuration
// Update these values with your Firebase project settings
// Get these from Firebase Console: Project Settings

const firebaseConfig = {
  apiKey: "AIzaSyDjjUDrz8_qPQdr_vgGZqlQZWh5UtcfgCc",
  authDomain: "portfolio-7b242.firebaseapp.com",
  projectId: "portfolio-7b242",
  storageBucket: "portfolio-7b242.appspot.com",
  messagingSenderId: "1000058355749",
  appId: "1:1000058355749:web:a5c8e3d2f1b4c9e6a2d5f8",
};

// Initialize Firebase
let firebaseApp, db, auth;
let firebaseReady = false;

function initializeFirebase() {
  try {
    if (typeof firebase === "undefined") {
      console.error("❌ Firebase SDK not loaded. Check script tags in HTML.");
      return false;
    }

    // Initialize only once
    if (firebaseReady) {
      console.log("✓ Firebase already initialized");
      return true;
    }

    firebaseApp = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    firebaseReady = true;
    console.log("✓ Firebase initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Firebase initialization error:", error.message);
    return false;
  }
}

// NOTE: initializeFirebase() is called explicitly from HTML files after Firebase scripts load
// This ensures Firebase SDK is available before initialization

// GitHub Configuration
const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_USERNAME = "Jigar-kar"; // Update this

// Local Storage Keys
const STORAGE_KEYS = {
  THEME: "portfolio-theme",
  ADMIN_USER: "admin-user-id",
  CACHE_GITHUB: "github-cache",
  CACHE_TIME: "github-cache-time",
};

// Cache duration in milliseconds (1 hour)
const CACHE_DURATION = 60 * 60 * 1000;

// Toast notifications
function showToast(message, type = "info") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove("success", "error", "warning", "info");
  toast.classList.add("show", type);

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Theme toggle
function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme =
    document.documentElement.getAttribute("data-theme") || "light";
  const newTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const icons = document.querySelectorAll(".theme-toggle i");
  icons.forEach((icon) => {
    icon.classList.remove("fa-moon", "fa-sun");
    icon.classList.add(theme === "light" ? "fa-moon" : "fa-sun");
  });
}

// Initialize theme on page load
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  const themeToggles = document.querySelectorAll("#themeToggle");
  themeToggles.forEach((toggle) => {
    toggle.addEventListener("click", toggleTheme);
  });
});

// Helper: Get cached data
function getCachedData(key) {
  const cached = localStorage.getItem(key);
  const cachedTime = localStorage.getItem(key + "_time");

  if (!cached || !cachedTime) return null;

  const age = Date.now() - parseInt(cachedTime);
  if (age > CACHE_DURATION) {
    localStorage.removeItem(key);
    localStorage.removeItem(key + "_time");
    return null;
  }

  return JSON.parse(cached);
}

// Helper: Set cached data
function setCachedData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
  localStorage.setItem(key + "_time", Date.now());
}

// Helper: Format date
function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Helper: Time ago
function timeAgo(date) {
  if (!date) return "";
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";

  return "just now";
}
