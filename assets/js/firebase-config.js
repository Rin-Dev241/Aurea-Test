/* ============================================
   AUREA — Firebase Configuration
   ============================================
   
   SETUP INSTRUCTIONS:
   1. Go to https://console.firebase.google.com
   2. Create a new project called "Aurea"
   3. Enable Authentication (Email/Password)
   4. Enable Cloud Firestore
   5. Replace the config below with YOUR project's config
   ============================================ */

const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

/* ============================================
   LOCAL STORAGE DATABASE (Works without Firebase)
   This provides a complete offline-first experience.
   When Firebase is configured, data syncs to cloud.
   ============================================ */

class AureaDB {
  constructor() {
    this.useFirebase = FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY_HERE";
    this.prefix = 'aurea_';
  }

  // ---- Core Storage Methods ----
  _get(key) {
    try {
      const data = localStorage.getItem(this.prefix + key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  _set(key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage failed:', e);
      return false;
    }
  }

  _remove(key) {
    localStorage.removeItem(this.prefix + key);
  }

  // ---- User Profile ----
  getUser() {
    return this._get('user') || {
      name: 'Beloved Patient',
      email: '',
      role: 'patient',
      avatar: '',
      createdAt: new Date().toISOString()
    };
  }

  setUser(user) {
    this._set('user', user);
  }

  // ---- Emotions ----
  getEmotions() {
    return this._get('emotions') || [];
  }

  addEmotion(emotion) {
    const emotions = this.getEmotions();
    emotions.unshift({
      ...emotion,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    });
    // Keep last 500 records
    if (emotions.length > 500) emotions.length = 500;
    this._set('emotions', emotions);
    return emotions[0];
  }

  getRecentEmotions(count = 5) {
    return this.getEmotions().slice(0, count);
  }

  // ---- Memory Recall Items ----
  getMemories() {
    return this._get('memories') || [];
  }

  addMemory(memory) {
    const memories = this.getMemories();
    const newMemory = {
      ...memory,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    memories.unshift(newMemory);
    
    if (this._set('memories', memories)) {
      return newMemory;
    } else {
      return null;
    }
  }

  deleteMemory(id) {
    const memories = this.getMemories().filter(m => m.id !== id);
    this._set('memories', memories);
  }

  // ---- Reminders ----
  getReminders() {
    return this._get('reminders') || [];
  }

  addReminder(reminder) {
    const reminders = this.getReminders();
    reminders.push({
      ...reminder,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      enabled: true,
      completed: false
    });
    reminders.sort((a, b) => a.time.localeCompare(b.time));
    this._set('reminders', reminders);
    return reminders[reminders.length - 1];
  }

  updateReminder(id, updates) {
    const reminders = this.getReminders();
    const idx = reminders.findIndex(r => r.id === id);
    if (idx > -1) {
      reminders[idx] = { ...reminders[idx], ...updates };
      this._set('reminders', reminders);
    }
  }

  deleteReminder(id) {
    const reminders = this.getReminders().filter(r => r.id !== id);
    this._set('reminders', reminders);
  }

  saveReminder(reminder) {
    const reminders = this.getReminders();
    const idx = reminders.findIndex(r => r.id === reminder.id);
    if (idx >= 0) {
      reminders[idx] = { ...reminders[idx], ...reminder };
    } else {
      reminders.push(reminder);
    }
    reminders.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    this._set('reminders', reminders);
  }

  // ---- Game Scores ----
  getGameScores() {
    return this._get('gameScores') || {};
  }

  saveGameScore(gameId, score) {
    const scores = this.getGameScores();
    if (!scores[gameId]) scores[gameId] = [];
    scores[gameId].unshift({
      score,
      date: new Date().toISOString()
    });
    if (scores[gameId].length > 50) scores[gameId].length = 50;
    this._set('gameScores', scores);
  }

  getBestScore(gameId) {
    const scores = this.getGameScores()[gameId] || [];
    if (scores.length === 0) return 0;
    return Math.max(...scores.map(s => s.score));
  }

  // ---- Caregivers ----
  getCaregivers() {
    return this._get('caregivers') || [];
  }

  addCaregiver(caregiver) {
    const caregivers = this.getCaregivers();
    caregivers.push({
      ...caregiver,
      id: caregiver.id || Date.now().toString(),
      addedAt: new Date().toISOString()
    });
    this._set('caregivers', caregivers);
    return caregivers[caregivers.length - 1];
  }

  saveCaregiver(caregiver) {
    const caregivers = this.getCaregivers();
    const idx = caregivers.findIndex(c => c.id === caregiver.id);
    if (idx >= 0) {
      caregivers[idx] = { ...caregivers[idx], ...caregiver };
    } else {
      caregivers.push(caregiver);
    }
    this._set('caregivers', caregivers);
  }

  deleteCaregiver(id) {
    const caregivers = this.getCaregivers().filter(c => c.id !== id);
    this._set('caregivers', caregivers);
  }

  // ---- Alerts ----
  getAlerts() {
    return this._get('alerts') || [];
  }

  addAlert(alert) {
    const alerts = this.getAlerts();
    alerts.unshift({
      ...alert,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      resolved: false
    });
    if (alerts.length > 100) alerts.length = 100;
    this._set('alerts', alerts);
    return alerts[0];
  }

  resolveAlert(id) {
    const alerts = this.getAlerts();
    const idx = alerts.findIndex(a => a.id === id);
    if (idx > -1) {
      alerts[idx].resolved = true;
      alerts[idx].resolvedAt = new Date().toISOString();
      this._set('alerts', alerts);
    }
  }

  getUnresolvedAlertCount() {
    return this.getAlerts().filter(a => !a.resolved).length;
  }

  // ---- Daily Tasks ----
  getDailyTasks() {
    const today = new Date().toDateString();
    const tasks = this._get('dailyTasks_' + today);
    if (tasks) return tasks;

    // Generate default daily tasks
    const defaults = [
      { id: '1', title: 'Morning Check-in', type: 'emotion', completed: false },
      { id: '2', title: 'Take Medicine', type: 'reminder', completed: false },
      { id: '3', title: 'Play a Brain Game', type: 'game', completed: false },
      { id: '4', title: 'Look at Memories', type: 'memory', completed: false },
      { id: '5', title: 'Afternoon Walk', type: 'exercise', completed: false },
      { id: '6', title: 'Evening Check-in', type: 'emotion', completed: false }
    ];
    this._set('dailyTasks_' + today, defaults);
    return defaults;
  }

  completeDailyTask(taskId) {
    const today = new Date().toDateString();
    const tasks = this.getDailyTasks();
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx > -1) {
      tasks[idx].completed = true;
      this._set('dailyTasks_' + today, tasks);
    }
    return tasks;
  }

  getDailyProgress() {
    const tasks = this.getDailyTasks();
    const completed = tasks.filter(t => t.completed).length;
    return {
      completed,
      total: tasks.length,
      percentage: Math.round((completed / tasks.length) * 100)
    };
  }

  // ---- Automation Settings ----
  getAutomationSettings() {
    return this._get('automationSettings') || {
      autoSuggestOnNegative: true,
      alertCaregiverOnDistress: true,
      distressThreshold: 3,
      alertCooldownMinutes: 30,
      maxAlertsPerDay: 3
    };
  }

  setAutomationSettings(settings) {
    this._set('automationSettings', settings);
  }

  saveAutomationSettings(settings) {
    this.setAutomationSettings(settings);
  }

  getLastAlertTime() {
    return this._get('lastAlertTime') || 0;
  }

  setLastAlertTime(time) {
    this._set('lastAlertTime', time);
  }

  getAlertCountToday() {
    const today = new Date().toDateString();
    return this._get('alertCount_' + today) || 0;
  }

  incrementAlertCountToday() {
    const today = new Date().toDateString();
    const count = this.getAlertCountToday() + 1;
    this._set('alertCount_' + today, count);
    return count;
  }

  // ---- Settings ----
  getSettings() {
    return this._get('settings') || {
      quoteType: 'both', // 'motivational', 'bible', 'both'
      notificationsEnabled: true,
      cameraDetectionEnabled: true,
      theme: 'light'
    };
  }

  setSettings(settings) {
    this._set('settings', settings);
  }

  saveSettings(settings) {
    this.setSettings(settings);
  }
}

// Global database instance
const db = new AureaDB();
