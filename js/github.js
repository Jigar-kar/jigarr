// GitHub API Integration

class GitHubAPI {
  constructor(username) {
    this.username = username;
    this.baseURL = `${GITHUB_API_BASE}/users/${username}`;
  }

  // Fetch GitHub user profile
  async getUser() {
    try {
      const response = await fetch(`${this.baseURL}`);
      if (!response.ok) throw new Error("GitHub user not found");
      return await response.json();
    } catch (error) {
      console.error("Error fetching GitHub user:", error);
      return null;
    }
  }

  // Fetch repositories
  async getRepositories(sort = "stars") {
    try {
      const response = await fetch(
        `${this.baseURL}/repos?sort=updated&direction=desc&per_page=100`,
        { headers: { Accept: "application/vnd.github.v3+json" } },
      );
      if (!response.ok) throw new Error("Failed to fetch repositories");

      let repos = await response.json();

      // Sort repositories
      repos.sort((a, b) => {
        if (sort === "stars") {
          return (b.stargazers_count || 0) - (a.stargazers_count || 0);
        } else if (sort === "name") {
          return a.name.localeCompare(b.name);
        } else if (sort === "updated") {
          return new Date(b.updated_at) - new Date(a.updated_at);
        }
        return 0;
      });

      return repos;
    } catch (error) {
      console.error("Error fetching repositories:", error);
      return [];
    }
  }

  // Fetch recent events/activity
  async getEvents() {
    try {
      const response = await fetch(`${this.baseURL}/events?per_page=30`);
      if (!response.ok) throw new Error("Failed to fetch events");
      return await response.json();
    } catch (error) {
      console.error("Error fetching events:", error);
      return [];
    }
  }

  // Calculate total stars across repositories
  async getTotalStars() {
    try {
      const repos = await this.getRepositories();
      return repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    } catch (error) {
      console.error("Error calculating total stars:", error);
      return 0;
    }
  }
}

// Create global instance
let githubAPI;

// Initialize GitHub API
function initGitHubAPI() {
  githubAPI = new GitHubAPI(GITHUB_USERNAME);
}

// Render GitHub stats on portfolio
async function renderGitHubStats() {
  try {
    const user = await githubAPI.getUser();
    if (!user) {
      showToast("Could not load GitHub profile", "error");
      return;
    }

    // Update stats
    document.getElementById("githubFollowers").textContent =
      user.followers || 0;
    document.getElementById("githubFollowing").textContent =
      user.following || 0;
    document.getElementById("githubRepos").textContent = user.public_repos || 0;

    // Update contribution graph
    document.getElementById("contributionGraph").src =
      `https://ghchart.rshah.org/${GITHUB_USERNAME}`;

    // Get total stars
    const totalStars = await githubAPI.getTotalStars();
    document.getElementById("totalStars").textContent = totalStars;
  } catch (error) {
    console.error("Error rendering GitHub stats:", error);
  }
}

// Render repositories
async function renderRepositories(sort = "stars") {
  try {
    const repos = await githubAPI.getRepositories(sort);
    const reposList = document.getElementById("reposList");

    if (!repos || repos.length === 0) {
      reposList.innerHTML = '<div class="loading">No repositories found</div>';
      return;
    }

    reposList.innerHTML = repos
      .map(
        (repo) => `
            <div class="repo-card">
                <div class="repo-header">
                    <div>
                        <div class="repo-name">${repo.name}</div>
                    </div>
                    ${repo.stargazers_count ? `<div class="repo-star">⭐ ${repo.stargazers_count}</div>` : ""}
                </div>
                <p class="repo-description">${repo.description || "No description"}</p>
                <div class="repo-meta">
                    ${repo.language ? `<span><i class="fas fa-code"></i> ${repo.language}</span>` : ""}
                    <span><i class="fas fa-code-branch"></i> ${repo.forks_count || 0} forks</span>
                    <span><i class="fas fa-clock"></i> ${timeAgo(repo.updated_at)}</span>
                </div>
                <div class="repo-footer">
                    <a href="${repo.html_url}" target="_blank" class="repo-footer a">View Repository</a>
                    ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" class="repo-footer a">Live Demo</a>` : ""}
                </div>
            </div>
        `,
      )
      .join("");
  } catch (error) {
    console.error("Error rendering repositories:", error);
    document.getElementById("reposList").innerHTML =
      '<div class="loading">Error loading repositories</div>';
  }
}

// Filter repositories
function filterRepositories() {
  const searchTerm =
    document.getElementById("repoSearch")?.value.toLowerCase() || "";
  const repos = document.querySelectorAll(".repo-card");

  repos.forEach((repo) => {
    const name =
      repo.querySelector(".repo-name")?.textContent.toLowerCase() || "";
    const description =
      repo.querySelector(".repo-description")?.textContent.toLowerCase() || "";

    if (name.includes(searchTerm) || description.includes(searchTerm)) {
      repo.style.display = "";
    } else {
      repo.style.display = "none";
    }
  });
}

// Render activity timeline
async function renderActivityTimeline() {
  try {
    const events = await githubAPI.getEvents();
    const activityList = document.getElementById("activityList");

    if (!events || events.length === 0) {
      activityList.innerHTML = '<div class="loading">No recent activity</div>';
      return;
    }

    const activityHTML = events
      .slice(0, 10)
      .map((event) => {
        const type = event.type;
        let icon = "fas fa-circle";
        let title = "";
        let description = "";

        if (type === "PushEvent") {
          icon = "fas fa-arrow-up";
          title = `Pushed to ${event.repo.name}`;
          description = `${event.payload.commits?.length || 0} commit(s)`;
        } else if (type === "CreateEvent") {
          icon = "fas fa-plus";
          title = `Created ${event.payload.ref_type} in ${event.repo.name}`;
          description = event.payload.ref || "Repository";
        } else if (type === "PullRequestEvent") {
          icon = "fas fa-code-branch";
          title = `${event.payload.action} Pull Request on ${event.repo.name}`;
          description = event.payload.pull_request?.title || "Pull Request";
        } else if (type === "IssuesEvent") {
          icon = "fas fa-exclamation-circle";
          title = `${event.payload.action} Issue on ${event.repo.name}`;
          description = event.payload.issue?.title || "Issue";
        } else if (type === "WatchEvent") {
          icon = "fas fa-star";
          title = `Starred ${event.repo.name}`;
          description = "Repository";
        } else if (type === "ForkEvent") {
          icon = "fas fa-code-branch";
          title = `Forked ${event.repo.name}`;
          description = "Repository Fork";
        } else {
          title = `${type} on ${event.repo.name}`;
          description = "Activity";
        }

        return `
                <div class="activity-item">
                    <div class="activity-type">
                        <i class="${icon}"></i> ${type.replace("Event", "")}
                    </div>
                    <div class="activity-title">${title}</div>
                    <div class="activity-time">${timeAgo(event.created_at)}</div>
                </div>
            `;
      })
      .join("");

    activityList.innerHTML = activityHTML;
  } catch (error) {
    console.error("Error rendering activity:", error);
    document.getElementById("activityList").innerHTML =
      '<div class="loading">Error loading activity</div>';
  }
}

// Setup GitHub event listeners
function setupGitHubListeners() {
  // Repository sort
  const repoSort = document.getElementById("repoSort");
  if (repoSort) {
    repoSort.addEventListener("change", (e) => {
      renderRepositories(e.target.value);
    });
  }

  // Repository search
  const repoSearch = document.getElementById("repoSearch");
  if (repoSearch) {
    repoSearch.addEventListener("input", filterRepositories);
  }
}

// Load GitHub data on page load
document.addEventListener("DOMContentLoaded", () => {
  initGitHubAPI();

  // Add a small delay to ensure DOM is ready
  setTimeout(() => {
    renderGitHubStats();
    renderRepositories();
    renderActivityTimeline();
    setupGitHubListeners();
  }, 100);
});
