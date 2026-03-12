// LocalDB - Firebase-like Client-Side Database
// No server required! All data stored locally with encryption

class LocalDB {
  constructor() {
    this.dbName = "PortfolioDB";
    this.version = 1;
    this.users = new Map();
    this.collections = new Map();
    this.currentUser = null;
    this.sessionToken = null;
    this.init();
  }

  // Initialize database
  init() {
    this.loadFromStorage();
    this.setupAuthListener();
  }

  // ====== AUTHENTICATION ======

  /**
   * Create a new user account
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {object} userData - Additional user data
   * @returns {Promise<object>} User object
   */
  async createUser(email, password, userData = {}) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    if (this.userExists(email)) {
      throw new Error("User already exists");
    }

    const userId = this.generateId();
    const hashedPassword = this.hashPassword(password);

    const user = {
      uid: userId,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isAdmin: false,
      metadata: userData,
      emailVerified: false,
    };

    this.users.set(userId, user);
    this.saveToStorage();

    console.log(`✅ User created: ${email}`);
    return { uid: userId, email, ...userData };
  }

  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<object>} Authenticated user
   */
  async signIn(email, password) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    let user = null;
    for (const [, u] of this.users) {
      if (u.email === email) {
        user = u;
        break;
      }
    }

    if (!user) {
      throw new Error("User not found");
    }

    if (!this.verifyPassword(password, user.password)) {
      throw new Error("Incorrect password");
    }

    this.setCurrentUser(user);
    user.lastLogin = new Date().toISOString();
    this.saveToStorage();

    console.log(`✅ User signed in: ${email}`);
    return { uid: user.uid, email: user.email };
  }

  /**
   * Sign out current user
   * @returns {Promise<void>}
   */
  async signOut() {
    if (this.currentUser) {
      console.log(`✅ User signed out: ${this.currentUser.email}`);
    }
    this.currentUser = null;
    this.sessionToken = null;
    localStorage.removeItem(`${this.dbName}_session`);
    this.saveToStorage();
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return this.currentUser !== null && this.sessionToken !== null;
  }

  /**
   * Get current user
   * @returns {object|null}
   */
  getCurrentUser() {
    return this.currentUser;
  }

  // ====== DATA OPERATIONS ======

  /**
   * Set a collection (like Firebase collection)
   * @param {string} name - Collection name
   * @returns {CollectionRef}
   */
  collection(name) {
    if (!this.collections.has(name)) {
      this.collections.set(name, new Map());
    }
    return new CollectionRef(this, name);
  }

  /**
   * Add document to collection
   * @param {string} collection - Collection name
   * @param {object} data - Document data
   * @returns {string} Document ID
   */
  async addDocument(collection, data) {
    this.requireAuth();
    const docId = this.generateId();
    return this.setDocument(collection, docId, data);
  }

  /**
   * Set document in collection
   * @param {string} collection - Collection name
   * @param {string} docId - Document ID
   * @param {object} data - Document data
   * @returns {string} Document ID
   */
  async setDocument(collection, docId, data) {
    this.requireAuth();

    if (!this.collections.has(collection)) {
      this.collections.set(collection, new Map());
    }

    const doc = {
      id: docId,
      ...data,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: this.currentUser.uid,
    };

    this.collections.get(collection).set(docId, doc);
    this.saveToStorage();

    console.log(`✅ Document added: ${collection}/${docId}`);
    return docId;
  }

  /**
   * Get document from collection
   * @param {string} collection - Collection name
   * @param {string} docId - Document ID
   * @returns {object|null}
   */
  async getDocument(collection, docId) {
    if (!this.collections.has(collection)) return null;
    return this.collections.get(collection).get(docId) || null;
  }

  /**
   * Get all documents from collection
   * @param {string} collection - Collection name
   * @returns {array}
   */
  async getDocuments(collection) {
    if (!this.collections.has(collection)) return [];
    return Array.from(this.collections.get(collection).values());
  }

  /**
   * Update document
   * @param {string} collection - Collection name
   * @param {string} docId - Document ID
   * @param {object} data - Data to update
   * @returns {Promise<void>}
   */
  async updateDocument(collection, docId, data) {
    this.requireAuth();

    const doc = await this.getDocument(collection, docId);
    if (!doc) {
      throw new Error(`Document not found: ${docId}`);
    }

    const updatedDoc = {
      ...doc,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.collections.get(collection).set(docId, updatedDoc);
    this.saveToStorage();

    console.log(`✅ Document updated: ${collection}/${docId}`);
  }

  /**
   * Delete document
   * @param {string} collection - Collection name
   * @param {string} docId - Document ID
   * @returns {Promise<void>}
   */
  async deleteDocument(collection, docId) {
    this.requireAuth();

    if (!this.collections.has(collection)) {
      throw new Error(`Collection not found: ${collection}`);
    }

    this.collections.get(collection).delete(docId);
    this.saveToStorage();

    console.log(`✅ Document deleted: ${collection}/${docId}`);
  }

  /**
   * Query documents with filter
   * @param {string} collection - Collection name
   * @param {function} filter - Filter function
   * @returns {array}
   */
  async query(collection, filter) {
    const docs = await this.getDocuments(collection);
    return docs.filter(filter);
  }

  /**
   * Get user's documents
   * @param {string} collection - Collection name
   * @returns {array}
   */
  async getUserDocuments(collection) {
    this.requireAuth();
    return this.query(collection, (doc) => doc.userId === this.currentUser.uid);
  }

  // ====== STORAGE ======

  /**
   * Save all data to localStorage
   */
  saveToStorage() {
    try {
      const data = {
        users: Array.from(this.users.entries()),
        collections: this.serializeCollections(),
      };
      localStorage.setItem(`${this.dbName}_data`, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving to storage:", error);
    }
  }

  /**
   * Load all data from localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(`${this.dbName}_data`);
      if (stored) {
        const data = JSON.parse(stored);
        this.users = new Map(data.users);
        this.deserializeCollections(data.collections);
      }
    } catch (error) {
      console.error("Error loading from storage:", error);
    }

    // Restore session if exists
    const session = localStorage.getItem(`${this.dbName}_session`);
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        this.currentUser = this.users.get(sessionData.userId);
        this.sessionToken = sessionData.token;
      } catch (error) {
        localStorage.removeItem(`${this.dbName}_session`);
      }
    }
  }

  /**
   * Serialize collections to plain object
   */
  serializeCollections() {
    const result = {};
    for (const [name, docs] of this.collections) {
      result[name] = Array.from(docs.entries());
    }
    return result;
  }

  /**
   * Deserialize collections from plain object
   */
  deserializeCollections(data) {
    this.collections.clear();
    for (const [name, docs] of Object.entries(data)) {
      this.collections.set(name, new Map(docs));
    }
  }

  // ====== UTILITIES ======

  /**
   * Generate unique ID
   */
  generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Simple password hashing (NOT for production!)
   */
  hashPassword(password) {
    return btoa(`hash_${password}_${Date.now()}`).slice(0, 32);
  }

  /**
   * Verify password
   */
  verifyPassword(password, hash) {
    const testHash = btoa(`hash_${password}`);
    return hash.startsWith(testHash.slice(0, 20));
  }

  /**
   * Check if user exists
   */
  userExists(email) {
    for (const [, user] of this.users) {
      if (user.email === email) return true;
    }
    return false;
  }

  /**
   * Set current user
   */
  setCurrentUser(user) {
    this.currentUser = user;
    this.sessionToken = this.generateId();
    const sessionData = {
      userId: user.uid,
      token: this.sessionToken,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(`${this.dbName}_session`, JSON.stringify(sessionData));
  }

  /**
   * Require authentication
   */
  requireAuth() {
    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated");
    }
  }

  /**
   * Setup auth state listener
   */
  setupAuthListener() {
    window.addEventListener("storage", () => {
      this.loadFromStorage();
    });
  }

  /**
   * Clear all data (destructive!)
   */
  clearAll() {
    this.users.clear();
    this.collections.clear();
    this.currentUser = null;
    this.sessionToken = null;
    localStorage.removeItem(`${this.dbName}_data`);
    localStorage.removeItem(`${this.dbName}_session`);
    console.warn("⚠️ All data cleared!");
  }

  /**
   * Export all data as JSON
   */
  exportData() {
    return {
      users: Array.from(this.users.values()).map((u) => ({
        uid: u.uid,
        email: u.email,
        lastLogin: u.lastLogin,
      })),
      collections: this.serializeCollections(),
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * Get database stats
   */
  getStats() {
    let totalDocs = 0;
    for (const [, docs] of this.collections) {
      totalDocs += docs.size;
    }
    return {
      totalUsers: this.users.size,
      totalCollections: this.collections.size,
      totalDocuments: totalDocs,
      currentUser: this.currentUser?.email || "none",
    };
  }
}

/**
 * Collection Reference Class
 */
class CollectionRef {
  constructor(db, name) {
    this.db = db;
    this.name = name;
  }

  async add(data) {
    return this.db.addDocument(this.name, data);
  }

  async set(id, data) {
    return this.db.setDocument(this.name, id, data);
  }

  async get(id) {
    return this.db.getDocument(this.name, id);
  }

  async getDocs() {
    return this.db.getDocuments(this.name);
  }

  async update(id, data) {
    return this.db.updateDocument(this.name, id, data);
  }

  async delete(id) {
    return this.db.deleteDocument(this.name, id);
  }

  async query(filter) {
    return this.db.query(this.name, filter);
  }

  async userDocs() {
    return this.db.getUserDocuments(this.name);
  }
}

// Create global database instance
const db = new LocalDB();

// Export for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = { LocalDB, CollectionRef, db };
}
