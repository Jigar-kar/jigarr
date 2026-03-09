// Admin Panel Functionality

// Wait for Firebase to be ready
async function waitForFirebaseAdmin(maxAttempts = 50) {
  let attempts = 0;
  while ((!db || !firebaseReady) && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    attempts++;
  }

  if (!db || !firebaseReady) {
    const errorMsg =
      "Firestore not initialized. Check Firebase configuration in js/config.js and ensure all Firebase scripts are loaded.";
    console.error("❌ Error:", errorMsg);
    throw new Error(errorMsg);
  }

  return db;
}

let currentEditingProject = null;
let currentEditingSkill = null;

// Setup sidebar navigation
function setupSidebar() {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const section = item.getAttribute("data-section");
      showSection(section);

      document
        .querySelectorAll(".nav-item")
        .forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
    });
  });

  // Mobile sidebar toggle
  const sidebarToggle = document.querySelector(".sidebar-toggle");
  const sidebar = document.querySelector(".admin-sidebar");

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }
}

// Show/hide sections
function showSection(sectionName) {
  document.querySelectorAll(".admin-section").forEach((section) => {
    section.classList.remove("active");
  });

  const section = document.getElementById(sectionName);
  if (section) {
    section.classList.add("active");
  }

  // Load section data
  if (sectionName === "dashboard") {
    loadAdminDashboard();
  } else if (sectionName === "profile") {
    loadProfileForm();
  } else if (sectionName === "projects") {
    loadProjectsList();
  } else if (sectionName === "skills") {
    loadSkillsList();
  } else if (sectionName === "messages") {
    loadMessagesList();
  } else if (sectionName === "settings") {
    loadSettingsForm();
  }
}

// ===== DASHBOARD =====
async function loadAdminDashboard() {
  try {
    // Ensure Firestore is ready
    if (!db) {
      await waitForFirebaseAdmin();
    }

    // Count messages
    const messagesSnap = await db.collection("messages").get();
    document.getElementById("messageCount").textContent = messagesSnap.size;

    // Count projects
    const projectsSnap = await db.collection("projects").get();
    document.getElementById("projectCount").textContent = projectsSnap.size;

    // Get visitor count
    const visitors = localStorage.getItem("portfolio_visitors") || "0";
    document.getElementById("viewCount").textContent = visitors;

    // Calculate total stars
    if (githubAPI) {
      const stars = await githubAPI.getTotalStars();
      document.getElementById("starsCount").textContent = stars;
    }
  } catch (error) {
    console.error("Error loading dashboard:", error);
  }
}

// ===== PROFILE MANAGEMENT =====
async function loadProfileForm() {
  try {
    const profileDoc = await db.collection("portfolio").doc("profile").get();
    if (profileDoc.exists) {
      const profile = profileDoc.data();
      document.getElementById("profileName").value = profile.name || "";
      document.getElementById("profileTitle").value = profile.title || "";
      document.getElementById("profileBio").value = profile.bio || "";
      document.getElementById("profileImage").value =
        profile.profileImage || "";
      document.getElementById("profileEmail").value = profile.email || "";
      document.getElementById("profileGithub").value =
        profile.github || "Jigar-kar";
      document.getElementById("profileLinkedin").value = profile.linkedin || "";
      document.getElementById("profileTwitter").value = profile.twitter || "";
      document.getElementById("profileResume").value = profile.resumeLink || "";
    }
  } catch (error) {
    console.error("Error loading profile:", error);
  }
}

document
  .getElementById("profileForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const profileData = {
        name: document.getElementById("profileName").value,
        title: document.getElementById("profileTitle").value,
        bio: document.getElementById("profileBio").value,
        profileImage: document.getElementById("profileImage").value,
        email: document.getElementById("profileEmail").value,
        github: document.getElementById("profileGithub").value,
        linkedin: document.getElementById("profileLinkedin").value,
        twitter: document.getElementById("profileTwitter").value,
        resumeLink: document.getElementById("profileResume").value,
        updatedAt: new Date().toISOString(),
      };

      await db
        .collection("portfolio")
        .doc("profile")
        .set(profileData, { merge: true });
      showToast("Profile updated successfully!", "success");
    } catch (error) {
      console.error("Error saving profile:", error);
      showToast("Error saving profile", "error");
    }
  });

// ===== PROJECTS MANAGEMENT =====
async function loadProjectsList() {
  try {
    const projectsSnap = await db
      .collection("projects")
      .orderBy("createdAt", "desc")
      .get();
    const tableBody = document.getElementById("projectsTableBody");

    if (projectsSnap.empty) {
      tableBody.innerHTML =
        '<tr><td colspan="4" class="text-center">No projects yet</td></tr>';
      return;
    }

    tableBody.innerHTML = projectsSnap.docs
      .map(
        (doc) => `
            <tr>
                <td>${doc.data().title}</td>
                <td>${doc.data().technologies || "N/A"}</td>
                <td>${doc.data().featured ? "✓" : ""}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="editProject('${doc.id}')">Edit</button>
                        <button class="btn-delete" onclick="deleteProject('${doc.id}')">Delete</button>
                    </div>
                </td>
            </tr>
        `,
      )
      .join("");
  } catch (error) {
    console.error("Error loading projects:", error);
  }
}

document.getElementById("addProjectBtn")?.addEventListener("click", () => {
  document.getElementById("projectForm").style.display = "block";
  document.getElementById("projectFormTitle").textContent = "Add New Project";
  document.getElementById("projectForm").reset();
  currentEditingProject = null;
});

document.getElementById("cancelProjectBtn")?.addEventListener("click", () => {
  document.getElementById("projectForm").style.display = "none";
});

document
  .getElementById("projectForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const projectData = {
        title: document.getElementById("projectTitle").value,
        description: document.getElementById("projectDescription").value,
        image: document.getElementById("projectImage").value,
        technologies: document.getElementById("projectTechs").value,
        githubLink: document.getElementById("projectGithub").value,
        liveDemo: document.getElementById("projectDemo").value,
        featured: document.getElementById("projectFeatured").checked,
        updatedAt: new Date().toISOString(),
      };

      if (currentEditingProject) {
        await db
          .collection("projects")
          .doc(currentEditingProject)
          .update(projectData);
        showToast("Project updated successfully!", "success");
      } else {
        projectData.createdAt = new Date().toISOString();
        await db.collection("projects").add(projectData);
        showToast("Project added successfully!", "success");
      }

      document.getElementById("projectForm").style.display = "none";
      loadProjectsList();
    } catch (error) {
      console.error("Error saving project:", error);
      showToast("Error saving project", "error");
    }
  });

async function editProject(projectId) {
  try {
    const doc = await db.collection("projects").doc(projectId).get();
    const data = doc.data();

    document.getElementById("projectTitle").value = data.title;
    document.getElementById("projectDescription").value = data.description;
    document.getElementById("projectImage").value = data.image;
    document.getElementById("projectTechs").value = data.technologies;
    document.getElementById("projectGithub").value = data.githubLink;
    document.getElementById("projectDemo").value = data.liveDemo;
    document.getElementById("projectFeatured").checked = data.featured;

    currentEditingProject = projectId;
    document.getElementById("projectFormTitle").textContent = "Edit Project";
    document.getElementById("projectForm").style.display = "block";
  } catch (error) {
    console.error("Error loading project:", error);
  }
}

async function deleteProject(projectId) {
  if (confirm("Are you sure you want to delete this project?")) {
    try {
      await db.collection("projects").doc(projectId).delete();
      showToast("Project deleted!", "success");
      loadProjectsList();
    } catch (error) {
      console.error("Error deleting project:", error);
      showToast("Error deleting project", "error");
    }
  }
}

// ===== SKILLS MANAGEMENT =====
async function loadSkillsList() {
  try {
    const skillsSnap = await db.collection("skills").orderBy("category").get();
    const grid = document.getElementById("skillsGrid");

    if (skillsSnap.empty) {
      grid.innerHTML = '<div class="empty-state"><p>No skills yet</p></div>';
      return;
    }

    grid.innerHTML = skillsSnap.docs
      .map(
        (doc) => `
            <div class="skill-admin-card">
                <i class="${doc.data().icon || "fas fa-code"}"></i>
                <h4>${doc.data().skillName}</h4>
                <p>${doc.data().category}</p>
                <button class="skill-delete" onclick="deleteSkill('${doc.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `,
      )
      .join("");
  } catch (error) {
    console.error("Error loading skills:", error);
  }
}

document.getElementById("addSkillBtn")?.addEventListener("click", () => {
  document.getElementById("skillForm").style.display = "block";
  document.getElementById("skillForm").reset();
  currentEditingSkill = null;
});

document.getElementById("cancelSkillBtn")?.addEventListener("click", () => {
  document.getElementById("skillForm").style.display = "none";
});

document.getElementById("skillForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const skillData = {
      skillName: document.getElementById("skillName").value,
      category: document.getElementById("skillCategory").value,
      icon: document.getElementById("skillIcon").value,
    };

    await db.collection("skills").add(skillData);
    showToast("Skill added successfully!", "success");
    document.getElementById("skillForm").style.display = "none";
    loadSkillsList();
  } catch (error) {
    console.error("Error adding skill:", error);
    showToast("Error adding skill", "error");
  }
});

async function deleteSkill(skillId) {
  if (confirm("Are you sure you want to delete this skill?")) {
    try {
      await db.collection("skills").doc(skillId).delete();
      showToast("Skill deleted!", "success");
      loadSkillsList();
    } catch (error) {
      console.error("Error deleting skill:", error);
      showToast("Error deleting skill", "error");
    }
  }
}

// ===== MESSAGES MANAGEMENT =====
async function loadMessagesList() {
  try {
    const messagesSnap = await db
      .collection("messages")
      .orderBy("date", "desc")
      .get();
    const messagesList = document.getElementById("messagesList");

    if (messagesSnap.empty) {
      messagesList.innerHTML =
        '<div class="empty-state"><i class="fas fa-inbox"></i><p>No messages yet</p></div>';
      return;
    }

    messagesList.innerHTML = messagesSnap.docs
      .map((doc) => {
        const msg = doc.data();
        return `
                <div class="message-item">
                    <div class="message-header">
                        <div>
                            <div class="message-from">${msg.name}</div>
                            <div class="message-email">${msg.email}</div>
                        </div>
                        <div class="message-date">${formatDate(msg.date)}</div>
                    </div>
                    <p class="message-text">${msg.message}</p>
                    <button class="delete-message" onclick="deleteMessage('${doc.id}')">Delete</button>
                </div>
            `;
      })
      .join("");
  } catch (error) {
    console.error("Error loading messages:", error);
  }
}

async function deleteMessage(messageId) {
  try {
    await db.collection("messages").doc(messageId).delete();
    loadMessagesList();
  } catch (error) {
    console.error("Error deleting message:", error);
  }
}

document
  .getElementById("clearMessagesBtn")
  ?.addEventListener("click", async () => {
    if (confirm("Are you sure? This will delete all messages.")) {
      try {
        const messagesSnap = await db.collection("messages").get();
        const batch = db.batch();
        messagesSnap.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        showToast("All messages deleted!", "success");
        loadMessagesList();
      } catch (error) {
        console.error("Error clearing messages:", error);
      }
    }
  });

// ===== SETTINGS =====
async function loadSettingsForm() {
  try {
    const aboutDoc = await db.collection("portfolio").doc("about").get();
    if (aboutDoc.exists) {
      const about = aboutDoc.data();
      document.getElementById("settingsAbout").value = about.aboutText || "";
      document.getElementById("settingsExperience").value =
        about.experience || "";
      document.getElementById("settingsInterests").value =
        about.interests || "";
    }
  } catch (error) {
    console.error("Error loading settings:", error);
  }
}

document
  .getElementById("settingsForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const settingsData = {
        aboutText: document.getElementById("settingsAbout").value,
        experience:
          parseInt(document.getElementById("settingsExperience").value) || 5,
        interests: document.getElementById("settingsInterests").value,
        updatedAt: new Date().toISOString(),
      };

      await db
        .collection("portfolio")
        .doc("about")
        .set(settingsData, { merge: true });
      showToast("Settings updated successfully!", "success");
    } catch (error) {
      console.error("Error saving settings:", error);
      showToast("Error saving settings", "error");
    }
  });

// Initialize admin panel on load
document.addEventListener("DOMContentLoaded", () => {
  if (!firebaseReady) {
    console.log("Admin: Waiting for Firebase to initialize...");
    const waitForInit = setInterval(() => {
      if (firebaseReady && db && auth) {
        clearInterval(waitForInit);
        setupSidebar();
        showSection("dashboard");
        loadAdminUserInfo();
      }
    }, 100);

    // Timeout
    setTimeout(() => {
      clearInterval(waitForInit);
      if (!firebaseReady) {
        console.error("Firebase initialization timeout on admin panel");
      }
    }, 10000);
  } else if (db && auth) {
    setupSidebar();
    showSection("dashboard");
    loadAdminUserInfo();
  }
});
