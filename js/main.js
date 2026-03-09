// Main Portfolio Script

// Wait for Firebase to be ready
async function waitForFirebaseDB(maxAttempts = 50) {
  let attempts = 0;
  while ((!db || !firebaseReady) && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    attempts++;
  }

  if (!db || !firebaseReady) {
    console.error(
      "Firestore not initialized. Check Firebase configuration in js/config.js",
    );
    throw new Error("Firestore not initialized");
  }

  return db;
}

// Render portfolio content from Firestore
async function loadPortfolioContent() {
  try {
    // Ensure Firestore is ready
    if (!db) {
      await waitForFirebaseDB();
    }

    // Load profile
    const profileDoc = await db.collection("portfolio").doc("profile").get();
    if (profileDoc.exists) {
      const profile = profileDoc.data();
      document.getElementById("heroName").textContent =
        profile.name || "Developer";
      document.getElementById("heroTitle").textContent =
        profile.title || "Developer";
      document.getElementById("heroBio").textContent = profile.bio || "";

      if (profile.profileImage) {
        document.getElementById("heroImage").src = profile.profileImage;
      }

      if (profile.email) {
        document.getElementById("emailLink").href = `mailto:${profile.email}`;
        document.getElementById("contactEmailLink").href =
          `mailto:${profile.email}`;
      }

      if (profile.linkedin) {
        document.getElementById("linkedinLink").href = profile.linkedin;
      }

      if (profile.twitter) {
        document.getElementById("twitterLink").href = profile.twitter;
      }

      if (profile.resumeLink) {
        document.getElementById("resumeBtn").href = profile.resumeLink;
        document.getElementById("resumeBtn").style.display = "inline-flex";
      }
    }

    // Load projects
    const projectsSnapshot = await db
      .collection("projects")
      .where("featured", "==", true)
      .limit(6)
      .get();
    renderProjects(projectsSnapshot.docs);

    // Load skills
    const skillsSnapshot = await db
      .collection("skills")
      .orderBy("category")
      .get();
    renderSkills(skillsSnapshot.docs);

    // Load about section
    const aboutDoc = await db.collection("portfolio").doc("about").get();
    if (aboutDoc.exists) {
      const about = aboutDoc.data();
      document.getElementById("aboutText").textContent = about.aboutText || "";
      document.getElementById("experienceYears").textContent =
        about.experience + "+" || "5+";

      if (about.interests) {
        const interests = about.interests.split(",").map((i) => i.trim());
        document.getElementById("interestsTags").innerHTML = interests
          .map((interest) => `<span class="interest-tag">${interest}</span>`)
          .join("");
      }
    }

    // Increment visitor counter
    incrementVisitorCounter();
  } catch (error) {
    console.error("Error loading portfolio content:", error);
  }
}

// Render projects grid
function renderProjects(projectDocs) {
  const projectsGrid = document.getElementById("projectsGrid");

  if (projectDocs.length === 0) {
    projectsGrid.innerHTML = '<div class="loading">No projects yet</div>';
    return;
  }

  projectsGrid.innerHTML = projectDocs
    .map((doc) => {
      const project = doc.data();
      return `
            <div class="project-card">
                ${project.image ? `<img src="${project.image}" alt="${project.title}" class="project-image">` : `<div class="project-image" style="background: linear-gradient(135deg, var(--primary), var(--secondary));"></div>`}
                <div class="project-content">
                    ${project.featured ? '<div class="project-badge">Featured</div>' : ""}
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description}</p>
                    ${
                      project.technologies
                        ? `
                        <div class="project-techs">
                            ${project.technologies
                              .split(",")
                              .map(
                                (tech) =>
                                  `<span class="tech-tag">${tech.trim()}</span>`,
                              )
                              .join("")}
                        </div>
                    `
                        : ""
                    }
                    <div class="project-links">
                        ${project.githubLink ? `<a href="${project.githubLink}" target="_blank"><i class="fab fa-github"></i> Code</a>` : ""}
                        ${project.liveDemo ? `<a href="${project.liveDemo}" target="_blank"><i class="fas fa-external-link-alt"></i> Demo</a>` : ""}
                    </div>
                </div>
            </div>
        `;
    })
    .join("");
}

// Render skills
function renderSkills(skillDocs) {
  const skillsGrid = document.getElementById("skillsGrid");

  if (skillDocs.length === 0) {
    skillsGrid.innerHTML = '<div class="loading">No skills yet</div>';
    return;
  }

  // Group skills by category
  const categories = {};
  skillDocs.forEach((doc) => {
    const skill = doc.data();
    const cat = skill.category || "other";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(skill);
  });

  // Render skills
  let html = "";
  Object.entries(categories).forEach(([category, skills]) => {
    skills.forEach((skill) => {
      html += `
                <div class="skill-card">
                    <i class="${skill.icon || "fas fa-code"}"></i>
                    <h3>${skill.skillName}</h3>
                </div>
            `;
    });
  });

  skillsGrid.innerHTML = html || '<div class="loading">No skills yet</div>';
}

// Project filtering
function setupProjectFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter");
      const projectsGrid = document.getElementById("projectsGrid");
      projectsGrid.innerHTML = '<div class="loading">Loading projects...</div>';

      try {
        let query = db.collection("projects");

        if (filter === "featured") {
          query = query.where("featured", "==", true);
        }

        const snapshot = await query.orderBy("createdAt", "desc").get();
        renderProjects(snapshot.docs);
      } catch (error) {
        console.error("Error filtering projects:", error);
      }
    });
  });
}

// Contact form submission
async function setupContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("contactName").value;
    const email = document.getElementById("contactEmail").value;
    const message = document.getElementById("contactMessage").value;

    try {
      // Show loading state
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Sending...";

      // Ensure Firestore is ready
      if (!db) {
        await waitForFirebaseDB();
      }

      // Save to Firestore
      await db.collection("messages").add({
        name,
        email,
        message,
        date: new Date().toISOString(),
        read: false,
      });

      // Reset form
      form.reset();
      btn.textContent = originalText;
      btn.disabled = false;

      showToast("Message sent successfully!", "success");
    } catch (error) {
      console.error("Error sending message:", error);
      showToast("Error sending message. Please try again.", "error");

      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = "Send Message";
      btn.disabled = false;
    }
  });
}

// Visitor counter
function incrementVisitorCounter() {
  let visitors = localStorage.getItem("portfolio_visitors") || "0";
  visitors = parseInt(visitors) + 1;
  localStorage.setItem("portfolio_visitors", visitors);
  document.getElementById("visitorCount").textContent = visitors;
}

// Smooth scroll for navigation
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href !== "#") {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });
}

// Mobile menu
function setupMobileMenu() {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.style.display =
        navLinks.style.display === "flex" ? "none" : "flex";
    });

    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.style.display = "none";
      });
    });
  }
}

// Intersection Observer for animations
function setupAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.animation = "fadeInUp 0.6s ease forwards";
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document
    .querySelectorAll(".project-card, .skill-card, .stat-card, .contact-item")
    .forEach((el) => {
      el.style.opacity = "0";
      observer.observe(el);
    });
}

// Navigation active state
function setupActiveNavigation() {
  window.addEventListener("scroll", () => {
    let current = "";
    const sections = document.querySelectorAll("section[id]");

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      if (pageYOffset >= sectionTop - 200) {
        current = section.getAttribute("id");
      }
    });

    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href").slice(1) === current) {
        link.classList.add("active");
      }
    });
  });
}

// Initialize everything on page load
document.addEventListener("DOMContentLoaded", async () => {
  // Wait for Firebase to initialize
  if (!firebaseReady) {
    console.log("Portfolio: Waiting for Firebase to initialize...");
    const waitForInit = setInterval(() => {
      if (firebaseReady && db) {
        clearInterval(waitForInit);
        initializePortfolio();
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(waitForInit);
      if (!firebaseReady) {
        console.error("Firebase initialization timeout");
      }
    }, 10000);
  } else {
    initializePortfolio();
  }
});

async function initializePortfolio() {
  try {
    await loadPortfolioContent();
    setupProjectFilters();
    setupContactForm();
    setupSmoothScroll();
    setupMobileMenu();
    setupAnimations();
    setupActiveNavigation();
  } catch (error) {
    console.error("Error initializing portfolio:", error);
  }
}
