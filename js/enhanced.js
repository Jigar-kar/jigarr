// ===========================
// ENHANCED PORTFOLIO SCRIPT
// ===========================

// ===========================
// SCROLL PROGRESS BAR
// ===========================

function updateScrollProgressBar() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;
  document.querySelector('.scroll-progress-bar').style.width = scrollPercent + '%';
}

window.addEventListener('scroll', updateScrollProgressBar);

// ===========================
// INITIALIZE AOS (Animate On Scroll)
// ===========================

function initializeAOS() {
  try {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: false,
      mirror: false,
      offset: 100,
      delay: 0,
    });
  } catch (error) {
    console.warn('AOS library not loaded:', error);
  }
}

// ===========================
// THEME TOGGLE (Dark/Light Mode)
// ===========================

function initializeTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const htmlElement = document.documentElement;
  
  // Check localStorage for saved theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  htmlElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = htmlElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      htmlElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('#themeToggle i');
  if (icon) {
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

// ===========================
// MOBILE MENU TOGGLE
// ===========================

function initializeMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
  });

  // Close menu when a link is clicked
  document.querySelectorAll('.nav-links a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      hamburger.classList.remove('active');
    });
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('active');
      hamburger.classList.remove('active');
    }
  });
}

// ===========================
// SMOOTH SCROLL
// ===========================

function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

// ===========================
// COPY TO CLIPBOARD
// ===========================

function setupCopyToClipboard() {
  document.querySelectorAll('.copy-to-clipboard').forEach((element) => {
    element.addEventListener('click', async (e) => {
      e.preventDefault();
      const text = element.textContent;
      try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!', 'success');
      } catch (err) {
        console.error('Failed to copy:', err);
        showToast('Failed to copy', 'error');
      }
    });
  });
}

// ===========================
// STAT COUNTER ANIMATION
// ===========================

function animateStatCounters() {
  const stats = document.querySelectorAll('.stat-number[data-target]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
        const target = parseInt(entry.target.getAttribute('data-target'));
        animateCounter(entry.target, target);
        entry.target.classList.add('animated');
      }
    });
  }, { threshold: 0.5 });

  stats.forEach((stat) => observer.observe(stat));
}

function animateCounter(element, target) {
  let current = 0;
  const increment = target / 50;
  const interval = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target + '+';
      clearInterval(interval);
    } else {
      element.textContent = Math.floor(current) + '+';
    }
  }, 20);
}

// ===========================
// FORM VALIDATION & SUBMISSION
// ===========================

function setupContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  // Real-time validation
  const inputs = form.querySelectorAll('input, textarea');
  inputs.forEach((input) => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) {
        validateField(input);
      }
    });
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all fields
    let isValid = true;
    inputs.forEach((input) => {
      if (!validateField(input)) {
        isValid = false;
      }
    });

    if (!isValid) return;

    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const subject = document.getElementById('contactSubject').value;
    const message = document.getElementById('contactMessage').value;

    try {
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

      // Wait for Firebase to be ready
      if (!db) {
        await waitForFirebaseDB();
      }

      // Save to Firestore
      await db.collection('messages').add({
        name,
        email,
        subject,
        message,
        timestamp: new Date().toISOString(),
        read: false,
      });

      form.reset();
      btn.innerHTML = originalText;
      btn.disabled = false;
      showToast('Message sent successfully! I\'ll get back to you soon.', 'success');
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Error sending message. Please try again.', 'error');
      const btn = form.querySelector('button[type="submit"]');
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
      btn.disabled = false;
    }
  });
}

function validateField(field) {
  const errorElement = document.getElementById(field.id + 'Error');
  let isValid = true;
  let errorMessage = '';

  if (!field.value.trim()) {
    isValid = false;
    errorMessage = 'This field is required';
  } else if (field.type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(field.value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email';
    }
  }

  if (!isValid) {
    field.classList.add('error');
    if (errorElement) {
      errorElement.textContent = errorMessage;
      errorElement.classList.add('show');
    }
  } else {
    field.classList.remove('error');
    if (errorElement) {
      errorElement.classList.remove('show');
      errorElement.textContent = '';
    }
  }

  return isValid;
}

// ===========================
// FIREBASE INITIALIZATION
// ===========================

async function waitForFirebaseDB(maxAttempts = 50) {
  let attempts = 0;
  while ((!db || !firebaseReady) && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    attempts++;
  }

  if (!db || !firebaseReady) {
    console.error('Firestore not initialized. Check Firebase configuration.');
    throw new Error('Firestore not initialized');
  }

  return db;
}

// ===========================
// LOAD PORTFOLIO CONTENT
// ===========================

async function loadPortfolioContent() {
  try {
    if (!db) {
      await waitForFirebaseDB();
    }

    // Load profile
    const profileDoc = await db.collection('portfolio').doc('profile').get();
    if (profileDoc.exists) {
      const profile = profileDoc.data();
      if (profile.name) {
        document.getElementById('heroName').textContent = profile.name;
      }
      if (profile.title) {
        document.getElementById('heroTitle').textContent = profile.title;
      }
      if (profile.bio) {
        document.getElementById('heroBio').textContent = profile.bio;
      }
      if (profile.profileImage) {
        document.getElementById('heroImage').src = profile.profileImage;
      }
      if (profile.email) {
        document.getElementById('emailLink').href = `mailto:${profile.email}`;
        document.getElementById('contactEmailLink').href = `mailto:${profile.email}`;
      }
      if (profile.linkedin) {
        document.getElementById('linkedinLink').href = profile.linkedin;
      }
      if (profile.twitter) {
        document.getElementById('twitterLink').href = profile.twitter;
      }
      if (profile.resumeLink) {
        document.getElementById('resumeBtn').href = profile.resumeLink;
      }
    }

    // Load projects
    const projectsSnapshot = await db
      .collection('projects')
      .where('featured', '==', true)
      .limit(6)
      .orderBy('createdAt', 'desc')
      .get();
    renderProjects(projectsSnapshot.docs);

    // Load skills
    const skillsSnapshot = await db.collection('skills').orderBy('category').get();
    renderSkills(skillsSnapshot.docs);

    // Load about section
    const aboutDoc = await db.collection('portfolio').doc('about').get();
    if (aboutDoc.exists) {
      const about = aboutDoc.data();
      if (about.aboutText) {
        document.getElementById('aboutText').textContent = about.aboutText;
      }
      if (about.experience) {
        document.getElementById('experienceYears').textContent = about.experience + '+';
      }
      if (about.projectsCount) {
        document.getElementById('projectsCount').textContent = about.projectsCount + '+';
      }
    }

    // Increment visitor counter
    incrementVisitorCounter();
  } catch (error) {
    console.error('Error loading portfolio content:', error);
  }
}

// ===========================
// RENDER PROJECTS
// ===========================

function renderProjects(projectDocs) {
  const projectsGrid = document.getElementById('projectsGrid');

  if (projectDocs.length === 0) {
    projectsGrid.innerHTML = '<div class="loading">No projects yet</div>';
    return;
  }

  projectsGrid.innerHTML = projectDocs
    .map((doc) => {
      const project = doc.data();
      return `
        <div class="project-card" data-aos="fade-up">
          ${
            project.image
              ? `<img src="${project.image}" alt="${project.title}" class="project-image" loading="lazy">`
              : `<div class="project-image"></div>`
          }
          <div class="project-content">
            ${project.featured ? '<div class="project-badge">Featured</div>' : ''}
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
            ${
              project.technologies
                ? `
              <div class="project-techs">
                ${project.technologies
                  .split(',')
                  .map(
                    (tech) =>
                      `<span class="tech-tag">${tech.trim()}</span>`,
                  )
                  .join('')}
              </div>
            `
                : ''
            }
            <div class="project-links">
              ${project.githubLink ? `<a href="${project.githubLink}" target="_blank" rel="noopener noreferrer" title="View GitHub"><i class="fab fa-github"></i> Code</a>` : ''}
              ${project.liveDemo ? `<a href="${project.liveDemo}" target="_blank" rel="noopener noreferrer" title="View Demo"><i class="fas fa-external-link-alt"></i> Demo</a>` : ''}
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  // Refresh AOS
  try {
    AOS.refresh();
  } catch (e) {
    console.warn('AOS refresh failed');
  }
}

// ===========================
// RENDER SKILLS
// ===========================

function renderSkills(skillDocs) {
  const skillsGrid = document.getElementById('skillsGrid');

  if (skillDocs.length === 0) {
    skillsGrid.innerHTML = '<div class="loading">No skills yet</div>';
    return;
  }

  const categories = {};
  skillDocs.forEach((doc) => {
    const skill = doc.data();
    const cat = skill.category || 'other';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(skill);
  });

  let html = '';
  Object.entries(categories).forEach(([category, skills]) => {
    skills.forEach((skill) => {
      const proficiency = skill.proficiency || 80;
      html += `
        <div class="skill-card" data-aos="zoom-in">
          <i class="${skill.icon || 'fas fa-code'}"></i>
          <h3>${skill.skillName}</h3>
          <div class="proficiency">
            <div class="proficiency-bar" style="--proficiency: ${proficiency}%"></div>
          </div>
        </div>
      `;
    });
  });

  skillsGrid.innerHTML = html || '<div class="loading">No skills yet</div>';

  // Refresh AOS
  try {
    AOS.refresh();
  } catch (e) {
    console.warn('AOS refresh failed');
  }
}

// ===========================
// PROJECT FILTERING
// ===========================

function setupProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      filterBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const filter = btn.getAttribute('data-filter');
      const projectsGrid = document.getElementById('projectsGrid');
      projectsGrid.innerHTML = '<div class="loading" role="status">Loading projects...</div>';

      try {
        let query = db.collection('projects');

        if (filter === 'featured') {
          query = query.where('featured', '==', true);
        }

        const snapshot = await query.orderBy('createdAt', 'desc').get();
        renderProjects(snapshot.docs);
      } catch (error) {
        console.error('Error filtering projects:', error);
      }
    });
  });
}

// ===========================
// VISITOR COUNTER
// ===========================

function incrementVisitorCounter() {
  let visitors = localStorage.getItem('portfolio_visitors') || '0';
  visitors = parseInt(visitors) + 1;
  localStorage.setItem('portfolio_visitors', visitors);
  document.getElementById('visitorCount').textContent = visitors;
}

// ===========================
// LAZY LOAD IMAGES
// ===========================

function setupLazyLoading() {
  if ('IntersectionObserver' in window) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach((img) => {
      img.addEventListener('load', () => {
        img.classList.add('loaded');
      });
    });
  }
}

// ===========================
// TOAST NOTIFICATIONS
// ===========================

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ===========================
// KEYBOARD ACCESSIBILITY
// ===========================

function setupKeyboardNavigation() {
  // Skip to main content link
  const skipLink = document.createElement('a');
  skipLink.href = '#projects';
  skipLink.className = 'skip-link';
  skipLink.textContent = 'Skip to main content';
  document.body.insertBefore(skipLink, document.body.firstChild);

  // Keyboard navigation for menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const navLinks = document.querySelector('.nav-links');
      const hamburger = document.querySelector('.hamburger');
      if (navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
      }
    }
  });
}

// ===========================
// PERFORMANCE OPTIMIZATION
// ===========================

function setupPerformanceOptimizations() {
  // Defer non-critical images
  const images = document.querySelectorAll('img');
  images.forEach((img) => {
    if (!img.src.includes('profile') && !img.src.includes('project')) {
      img.setAttribute('loading', 'lazy');
    }
  });

  // Preload critical resources
  if ('link' in document) {
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preconnect';
    preloadLink.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preloadLink);
  }
}

// ===========================
// INITIALIZE ALL
// ===========================

function initializePortfolio() {
  // Core functionality
  initializeTheme();
  initializeMobileMenu();
  setupSmoothScroll();
  setupCopyToClipboard();
  setupContactForm();
  setupProjectFilters();
  setupLazyLoading();
  setupKeyboardNavigation();
  setupPerformanceOptimizations();

  // Animations
  initializeAOS();
  animateStatCounters();

  // Load content
  loadPortfolioContent();
}

// ===========================
// DOCUMENT READY
// ===========================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePortfolio);
} else {
  initializePortfolio();
}

// Refresh AOS on window resize
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    try {
      AOS.refresh();
    } catch (e) {
      console.warn('AOS refresh failed');
    }
  }, 250);
});
