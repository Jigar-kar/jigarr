# 🎨 Quick Customization Guide

## Change Colors Easily

Edit `styles.css` and find the `:root` section:

```css
:root {
  --primary-color: #6366f1; /* Main purple-ish blue */
  --secondary-color: #ec4899; /* Pink */
  --accent-color: #f59e0b; /* Orange */
}
```

### Popular Color Schemes

**Option 1: Blue & Green (Tech)**

```css
--primary-color: #0066ff;
--secondary-color: #00d4ff;
--accent-color: #39ff14;
```

**Option 2: Purple & Orange (Creative)**

```css
--primary-color: #7c3aed;
--secondary-color: #f97316;
--accent-color: #fbbf24;
```

**Option 3: Dark & Neon (Modern)**

```css
--primary-color: #00d4ff;
--secondary-color: #ff006e;
--accent-color: #ffbe0b;
```

**Option 4: Red & Yellow (Warm)**

```css
--primary-color: #ef4444;
--secondary-color: #f97316;
--accent-color: #eab308;
```

---

## Add Your GitHub Projects

### For Each Project:

1. Open `index.html`
2. Find the project card you want to update
3. Add GitHub link:

```html
<div class="project-card">
  <div class="project-header">
    <i class="fas fa-github"></i>
  </div>
  <h3>Your Project Name</h3>
  <p>Project description here...</p>
  <div class="project-tags">
    <span class="tag">Technology 1</span>
    <span class="tag">Technology 2</span>
  </div>
  <!-- Add this line -->
  <a
    href="https://github.com/Jigar-kar/your-project"
    target="_blank"
    class="btn btn-secondary"
    style="width: 100%; margin-top: 15px;"
    >View on GitHub</a
  >
</div>
```

---

## Change Hero Image/Icon

Currently shows `<code>` element. Options:

### Option 1: Replace with Emoji

```html
<div class="floating-card">
  <div class="code-snippet">💻</div>
</div>
```

### Option 2: Replace with Icon

```html
<div class="floating-card">
  <div class="code-snippet">
    <i class="fas fa-laptop-code"></i>
  </div>
</div>
```

### Option 3: Replace with Image

```html
<div class="floating-card">
  <img
    src="your-image.png"
    alt="Profile"
    style="width: 200px; border-radius: 20px;"
  />
</div>
```

---

## Update Social Links

Find this section in `index.html`:

```html
<div class="social-links">
  <a href="https://github.com/Jigar-kar" target="_blank" title="GitHub">
    <i class="fab fa-github"></i>
  </a>
  <a href="mailto:karjigar56@gmail.com" title="Email">
    <i class="fas fa-envelope"></i>
  </a>
  <a href="https://linkedin.com" target="_blank" title="LinkedIn">
    <i class="fab fa-linkedin"></i>
  </a>
</div>
```

Replace URLs and add more platforms:

```html
<!-- Twitter -->
<a href="https://twitter.com/your-handle" target="_blank" title="Twitter">
  <i class="fab fa-twitter"></i>
</a>

<!-- Instagram -->
<a href="https://instagram.com/your-handle" target="_blank" title="Instagram">
  <i class="fab fa-instagram"></i>
</a>

<!-- YouTube -->
<a href="https://youtube.com/@your-channel" target="_blank" title="YouTube">
  <i class="fab fa-youtube"></i>
</a>

<!-- Codepen -->
<a href="https://codepen.io/your-handle" target="_blank" title="Codepen">
  <i class="fab fa-codepen"></i>
</a>
```

---

## Add More Skills

Find the Skills section and add new cards:

```html
<div class="skill-card">
  <div class="skill-icon">
    <i class="fab fa-react"></i>
  </div>
  <h3>React</h3>
  <p>Frontend framework</p>
</div>
```

**More Icon Options**:

- `fab fa-node` - Node.js
- `fab fa-docker` - Docker
- `fas fa-database` - Database
- `fab fa-git` - Git
- `fab fa-aws` - AWS

---

## Add Experience Section

Add this after About section in `index.html`:

```html
<!-- Experience Section -->
<section id="experience" class="experience">
  <div class="container">
    <h2 class="section-title">Experience</h2>
    <div class="experience-timeline">
      <div class="experience-item">
        <h3>Developer Intern</h3>
        <p class="company">Tech Company Name</p>
        <p class="date">June 2024 - Present</p>
        <p>Working on full-stack development projects...</p>
      </div>
      <div class="experience-item">
        <h3>Project Lead</h3>
        <p class="company">University Project</p>
        <p class="date">2024</p>
        <p>Led a team to develop College ERP system...</p>
      </div>
    </div>
  </div>
</section>
```

Add CSS to `styles.css`:

```css
.experience {
  padding: 100px 20px;
  background: var(--card-bg);
}

.experience-timeline {
  max-width: 600px;
  margin: 0 auto;
}

.experience-item {
  padding: 30px;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.1),
    rgba(236, 72, 153, 0.1)
  );
  border-radius: 15px;
  margin-bottom: 30px;
  border-left: 4px solid var(--primary-color);
}

.experience-item h3 {
  color: var(--primary-color);
  margin-bottom: 5px;
}

.company {
  color: var(--text-light);
  font-size: 14px;
}

.date {
  color: #999;
  font-size: 13px;
  font-weight: 600;
}

.experience-item p {
  margin-top: 10px;
}
```

---

## Add Contact Form

Replace contact section with form:

```html
<section id="contact" class="contact">
  <div class="container">
    <h2 class="section-title">Get In Touch</h2>
    <form
      class="contact-form"
      action="https://formspree.io/f/YOUR_FORM_ID"
      method="POST"
    >
      <input type="text" name="name" placeholder="Your Name" required />
      <input type="email" name="email" placeholder="Your Email" required />
      <textarea
        name="message"
        placeholder="Your Message"
        rows="5"
        required
      ></textarea>
      <button type="submit" class="btn btn-primary">Send Message</button>
    </form>
  </div>
</section>
```

Add CSS:

```css
.contact-form {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.contact-form input,
.contact-form textarea {
  padding: 15px;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  font-family: inherit;
  transition: var(--transition);
}

.contact-form input:focus,
.contact-form textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.contact-form button {
  align-self: center;
}
```

To set up form: Go to formspree.io → Create form → Get form ID

---

## Change Fonts

Currently uses "Segoe UI". To change:

In `styles.css`:

```css
body {
  font-family: "Font Name", fallback, sans-serif;
}
```

**Popular Options**:

- `'Poppins', sans-serif` - Modern
- `'Roboto', sans-serif` - Clean
- `'Inter', sans-serif` - Minimal
- `'Playfair Display', serif` - Elegant
- `'Ubuntu', sans-serif` - Friendly

Add from Google Fonts in `index.html` head:

```html
<link
  href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap"
  rel="stylesheet"
/>
```

---

## Add Animation Effects

Add to CSS for more animations:

```css
/* Pulse effect */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Bounce effect */
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Glow effect */
@keyframes glow {
  0%,
  100% {
    box-shadow: 0 0 5px rgba(99, 102, 241, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.8);
  }
}
```

Use on elements:

```css
.skill-card:hover {
  animation: bounce 0.5s ease;
}
```

---

## Mobile Optimization Tips

1. Test on phone: Use browser's device emulation (F12)
2. Touch-friendly buttons: Min 44px height
3. Readable text: Min 16px font size
4. Adequate spacing: Use padding/margins
5. Fast loading: Optimize images

---

## Performance Checklist

- [ ] All images optimized (<100KB)
- [ ] No unused CSS/JavaScript
- [ ] Links work (especially GitHub)
- [ ] Mobile responsive tested
- [ ] All fonts loaded correctly
- [ ] Smooth animations at 60fps
- [ ] Fast page load (<3 seconds)

---

## Browser Compatibility

Portfolio works on:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

---

## Common Mistakes to Avoid

❌ **Wrong**: `background-image: url(../images/bg.jpg);`
✅ **Right**: `background-image: url('./images/bg.jpg');` or `url('images/bg.jpg');`

❌ **Wrong**: Forgetting to update GitHub links
✅ **Right**: Replace all demo links with real ones

❌ **Wrong**: Using non-responsive units
✅ **Right**: Use %, em, rem instead of px where possible

---

## Need Help?

Check:

1. Browser console (F12) for errors
2. File paths and names
3. CSS syntax (extra colons, braces)
4. HTML tags properly closed
5. Icons loaded from Font Awesome CDN

---

**Happy Customizing! 🚀**
