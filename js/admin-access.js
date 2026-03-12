// Secret Admin Access System
// Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A

const AdminAccess = {
  konamiCode: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyA"],
  konamiIndex: 0,
  passcode: "1886", // Change this to your desired passcode
  accessDeniedAttempts: 0,
  maxAttempts: 3,
  lockoutDuration: 300000, // 5 minutes in milliseconds

  init() {
    // Listen for Konami code
    document.addEventListener("keydown", (e) => this.handleKonamiCode(e));

    // Check if there's a passcode modal to show
    if (
      document.body.contains(document.querySelector(".passcode-modal-overlay"))
    ) {
      this.setupPasscodeModal();
    }
  },

  handleKonamiCode(event) {
    const key = event.code;

    // Check if the pressed key matches the next key in the Konami code
    if (key === this.konamiCode[this.konamiIndex]) {
      this.konamiIndex++;

      // If the entire code has been entered, trigger admin access
      if (this.konamiIndex === this.konamiCode.length) {
        this.triggerAdminAccess();
        this.konamiIndex = 0;
      }
    } else {
      // Reset if wrong key is pressed
      // Allow for some flexibility - if the first key is pressed again, start over
      if (key === this.konamiCode[0]) {
        this.konamiIndex = 1;
      } else {
        this.konamiIndex = 0;
      }
    }
  },

  triggerAdminAccess() {
    // Check if we're already on admin login page
    if (window.location.pathname.includes("admin-login")) {
      // Show passcode modal
      this.showPasscodeModal();
    } else {
      // Navigate to admin login
      this.showAccessNotification();
      setTimeout(() => {
        window.location.href = "admin-login.html?secret=true";
      }, 2000);
    }
  },

  showAccessNotification() {
    const notification = document.createElement("div");
    notification.className = "admin-access-notification";
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-lock-open"></i>
        <h3>Secret Access Unlocked!</h3>
        <p>Admin panel access available</p>
      </div>
    `;

    document.body.appendChild(notification);

    // Add CSS if not already present
    if (!document.querySelector("style[data-admin-notifications]")) {
      const style = document.createElement("style");
      style.setAttribute("data-admin-notifications", "true");
      style.textContent = `
        .admin-access-notification {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px 50px;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          z-index: 10000;
          animation: slideInUp 0.5s ease;
        }
        
        .notification-content {
          text-align: center;
        }
        
        .notification-content i {
          font-size: 40px;
          margin-bottom: 15px;
          display: block;
        }
        
        .notification-content h3 {
          margin: 0 0 10px 0;
          font-size: 24px;
          font-weight: 700;
        }
        
        .notification-content p {
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translate(-50%, -40%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `;
      document.head.appendChild(style);
    }

    setTimeout(() => notification.remove(), 2000);
  },

  showPasscodeModal() {
    const modal = document.createElement("div");
    modal.className = "passcode-modal-overlay";
    modal.innerHTML = `
      <div class="passcode-modal">
        <div class="passcode-header">
          <i class="fas fa-lock"></i>
          <h2>Enter Admin Passcode</h2>
          <p>This is a secure area. Please enter your passcode.</p>
        </div>
        
        <form id="passcodeForm" class="passcode-form">
          <div class="passcode-input-group">
            <input
              type="password"
              id="passcodeInput"
              class="passcode-input"
              placeholder="••••"
              maxlength="6"
              autocomplete="off"
              required
            />
            <button type="button" class="toggle-passcode" id="togglePasscode" title="Show/Hide">
              <i class="fas fa-eye"></i>
            </button>
          </div>
          
          <div class="passcode-display" id="passcodeDisplay"></div>
          
          <button type="submit" class="btn-submit-passcode">
            <i class="fas fa-check"></i> Verify Passcode
          </button>
        </form>
        
        <div class="passcode-footer">
          <button type="button" class="btn-cancel-passcode">
            <i class="fas fa-times"></i> Cancel
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.setupPasscodeModal();
  },

  setupPasscodeModal() {
    const input = document.getElementById("passcodeInput");
    const toggleBtn = document.getElementById("togglePasscode");
    const form = document.getElementById("passcodeForm");
    const cancelBtn = document.querySelector(".btn-cancel-passcode");

    if (!input) return;

    // Toggle show/hide password
    if (toggleBtn) {
      toggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const type = input.type === "password" ? "text" : "password";
        input.type = type;
        toggleBtn.querySelector("i").classList.toggle("fa-eye");
        toggleBtn.querySelector("i").classList.toggle("fa-eye-slash");
      });
    }

    // Handle form submission
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.verifyPasscode(input.value);
      });
    }

    // Handle cancel
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        const modal = document.querySelector(".passcode-modal-overlay");
        if (modal) modal.remove();
      });
    }

    // Focus on input
    input.focus();

    // Add styles if not already present
    this.addPasscodeStyles();
  },

  verifyPasscode(enteredPasscode) {
    // Check for lockout
    if (this.isLockedOut()) {
      this.showPasscodeError(
        "Too many failed attempts. Please try again in 5 minutes.",
      );
      return;
    }

    if (enteredPasscode === this.passcode) {
      // Correct passcode
      this.handleCorrectPasscode();
    } else {
      // Wrong passcode
      this.accessDeniedAttempts++;
      const attemptsLeft = this.maxAttempts - this.accessDeniedAttempts;

      if (attemptsLeft <= 0) {
        localStorage.setItem("adminLockoutTime", Date.now().toString());
        this.showPasscodeError(
          "Maximum attempts reached. Access locked for 5 minutes.",
        );
        setTimeout(() => {
          const modal = document.querySelector(".passcode-modal-overlay");
          if (modal) modal.remove();
        }, 2000);
      } else {
        this.showPasscodeError(
          `Incorrect passcode. ${attemptsLeft} attempts remaining.`,
        );
        document.getElementById("passcodeInput").value = "";
        document.getElementById("passcodeInput").focus();
      }
    }
  },

  isLockedOut() {
    const lockoutTime = localStorage.getItem("adminLockoutTime");
    if (!lockoutTime) return false;

    const timePassed = Date.now() - parseInt(lockoutTime);
    if (timePassed > this.lockoutDuration) {
      localStorage.removeItem("adminLockoutTime");
      this.accessDeniedAttempts = 0;
      return false;
    }
    return true;
  },

  handleCorrectPasscode() {
    // Store authentication token
    const token = btoa(`admin_${Date.now()}_${Math.random()}`);
    localStorage.setItem("adminToken", token);
    sessionStorage.setItem("adminSession", "true");

    this.showPasscodeSuccess();

    // Clear attempts
    this.accessDeniedAttempts = 0;
    localStorage.removeItem("adminLockoutTime");

    // Redirect to admin panel
    setTimeout(() => {
      window.location.href = "admin.html";
    }, 1500);
  },

  showPasscodeError(message) {
    const form = document.getElementById("passcodeForm");
    const existingError = document.querySelector(".passcode-error");

    if (existingError) existingError.remove();

    const error = document.createElement("div");
    error.className = "passcode-error";
    error.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      <span>${message}</span>
    `;

    form.appendChild(error);

    // Shake animation
    form.classList.add("shake");
    setTimeout(() => form.classList.remove("shake"), 500);
  },

  showPasscodeSuccess() {
    const form = document.getElementById("passcodeForm");
    const input = document.getElementById("passcodeInput");

    if (form) form.style.opacity = "0.5";
    if (input) input.disabled = true;

    const success = document.createElement("div");
    success.className = "passcode-success";
    success.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>Access Granted! Redirecting...</span>
    `;

    const modal = document.querySelector(".passcode-modal");
    modal.appendChild(success);
  },

  addPasscodeStyles() {
    if (document.querySelector("style[data-passcode-styles]")) return;

    const style = document.createElement("style");
    style.setAttribute("data-passcode-styles", "true");
    style.textContent = `
      .passcode-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        animation: fadeIn 0.3s ease;
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      
      .passcode-modal {
        background: white;
        border-radius: 20px;
        padding: 40px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(80px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .passcode-header {
        text-align: center;
        margin-bottom: 30px;
      }
      
      .passcode-header i {
        font-size: 48px;
        color: #667eea;
        margin-bottom: 15px;
        display: block;
      }
      
      .passcode-header h2 {
        margin: 0 0 10px 0;
        color: #1f2937;
        font-size: 24px;
        font-weight: 700;
      }
      
      .passcode-header p {
        margin: 0;
        color: #6b7280;
        font-size: 14px;
      }
      
      .passcode-form {
        margin-bottom: 25px;
      }
      
      .passcode-input-group {
        position: relative;
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
      }
      
      .passcode-input {
        flex: 1;
        padding: 14px 16px;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        font-size: 24px;
        letter-spacing: 8px;
        font-weight: 600;
        transition: all 0.3s ease;
        font-family: 'Courier New', monospace;
      }
      
      .passcode-input:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }
      
      .toggle-passcode {
        width: 50px;
        height: 50px;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        background: white;
        color: #6b7280;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
      }
      
      .toggle-passcode:hover {
        border-color: #667eea;
        color: #667eea;
      }
      
      .btn-submit-passcode {
        width: 100%;
        padding: 14px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      
      .btn-submit-passcode:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
      }
      
      .btn-submit-passcode:active {
        transform: translateY(0);
      }
      
      .passcode-error {
        background: #fee2e2;
        color: #991b1b;
        padding: 12px 16px;
        border-radius: 8px;
        margin-top: 15px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
        font-weight: 600;
        animation: shake 0.5s ease;
      }
      
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
      }
      
      .passcode-form.shake {
        animation: shake 0.5s ease;
      }
      
      .passcode-success {
        background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
        color: white;
        padding: 16px;
        border-radius: 12px;
        margin-top: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        font-weight: 700;
        animation: slideUp 0.4s ease;
      }
      
      .passcode-success i {
        font-size: 20px;
      }
      
      .passcode-footer {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-top: 20px;
      }
      
      .btn-cancel-passcode {
        padding: 10px 20px;
        background: #f3f4f6;
        color: #6b7280;
        border: none;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      .btn-cancel-passcode:hover {
        background: #e5e7eb;
        color: #374151;
      }
    `;
    document.head.appendChild(style);
  },
};

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => AdminAccess.init());
