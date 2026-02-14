/* ============================================
   AUREA — Main Application Controller
   ============================================ */

// ---- Navigation ----
function navigateTo(page) {
  window.location.href = page;
}

// ---- Time-based Greeting ----
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'GOOD MORNING';
  if (hour < 17) return 'GOOD AFTERNOON';
  return 'GOOD EVENING';
}

function getFormattedDate() {
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString('en-US', options);
}

// ---- Toast Notifications ----
function showToast(message, type = 'info', duration = 5000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = {
    info: '💡',
    success: '✅',
    warning: '⚠️',
    danger: '🚨',
    emotion: '💛'
  };

  const colors = {
    info: '#E3F2FD',
    success: '#D5F5ED',
    warning: '#FFF9E6',
    danger: '#FDEAE6',
    emotion: '#FFF8F0'
  };

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-icon" style="background: ${colors[type]}">
      <span style="font-size: 20px">${icons[type]}</span>
    </div>
    <div style="flex:1">
      <div style="font-size: 14px; font-weight: 600;">${message}</div>
    </div>
    <button onclick="this.closest('.toast').remove()" style="color:#AEAEB2; font-size: 18px;">✕</button>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

// ---- Dashboard Initialization ----
function initDashboard() {
  // Hide loading screen
  setTimeout(() => {
    const loading = document.getElementById('loadingScreen');
    if (loading) loading.style.display = 'none';
  }, 800);

  // Set greeting
  const greetLabel = document.getElementById('greetingLabel');
  const greetName = document.getElementById('greetingName');
  const greetDate = document.getElementById('greetingDate');

  if (greetLabel) greetLabel.textContent = getGreeting();
  if (greetDate) greetDate.textContent = getFormattedDate();

  // Set user name
  const user = db.getUser();
  if (greetName) greetName.textContent = user.name || 'Beloved Patient';
  
  const avatar = document.getElementById('avatarInitial');
  if (avatar) {
    const name = user.name || 'BP';
    avatar.textContent = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }

  // Update progress ring
  updateDailyProgress();

  // Load schedule
  loadUpcomingSchedule();

  // Load daily tip
  loadDailyTip();

  // Load daily quote
  loadDailyQuote();

  // Update emotion status
  updateEmotionStatus();

  // Update alert badge
  updateAlertBadge();

  // Check reminders
  startReminderChecker();
}

// ---- Daily Progress Ring ----
function updateDailyProgress() {
  const progress = db.getDailyProgress();
  const circle = document.getElementById('progressCircle');
  const percent = document.getElementById('progressPercent');
  const completed = document.getElementById('tasksCompleted');
  const total = document.getElementById('tasksTotal');

  if (circle) {
    const circumference = 213.6;
    const offset = circumference - (progress.percentage / 100) * circumference;
    circle.style.strokeDashoffset = offset;
  }
  if (percent) percent.textContent = progress.percentage + '%';
  if (completed) completed.textContent = progress.completed;
  if (total) total.textContent = progress.total;
}

// ---- Upcoming Schedule ----
function loadUpcomingSchedule() {
  const container = document.getElementById('scheduleList');
  if (!container) return;

  let reminders = db.getReminders();
  
  // If no reminders, show defaults
  if (reminders.length === 0) {
    reminders = [
      { id: 'd1', title: 'Breakfast & Medicine', time: '08:00', category: 'medicine', enabled: true },
      { id: 'd2', title: 'Morning Walk', time: '10:00', category: 'exercise', enabled: true },
      { id: 'd3', title: 'Lunch', time: '12:00', category: 'meal', enabled: true }
    ];
  }

  // Filter upcoming (not past)
  const now = new Date();
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

  const upcoming = reminders.filter(r => r.enabled).slice(0, 4);

  const categoryIcons = {
    medicine: '💊',
    meal: '🍽️',
    exercise: '🚶',
    appointment: '📋',
    hydration: '💧',
    general: '⭐'
  };

  container.innerHTML = upcoming.map(r => `
    <div class="schedule-card" onclick="navigateTo('reminders.html')">
      <div class="schedule-icon ${r.category || 'general'}">
        ${categoryIcons[r.category] || '⭐'}
      </div>
      <div class="schedule-details">
        <div class="schedule-title">${r.title}</div>
        <div class="schedule-time">${formatTime(r.time)}</div>
      </div>
      <div class="schedule-rating">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        4.8
      </div>
    </div>
  `).join('');
}

// ---- Format Time ----
function formatTime(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

// ---- Daily Tips ----
const DAILY_TIPS = [
  "Drink water to stay hydrated and keep your brain sharp!",
  "Try to learn something new every day — even small things count.",
  "A short walk can boost your mood and memory.",
  "Write down 3 things you're grateful for today.",
  "Listen to music you love — it activates many brain areas!",
  "Get enough sleep — your brain consolidates memories while you rest.",
  "Connect with someone you care about today.",
  "Do a puzzle or brain game to keep your mind active.",
  "Eat colorful fruits and vegetables for brain health.",
  "Take a few deep breaths when you feel overwhelmed.",
  "Laugh often — humor is great medicine for the brain!",
  "Try recalling what you had for breakfast to exercise memory.",
  "Organize one small area — it helps clear your mind too.",
  "Spend time outdoors — nature reduces stress hormones.",
  "Reading, even for 15 minutes, strengthens neural pathways.",
  "Practice saying someone's name 3 times when you meet them.",
  "Create associations to remember things — link new info to old.",
  "Use a calendar or planner to reduce mental load.",
  "Teach someone else what you know — it reinforces your memory.",
  "Dark chocolate (in moderation) has brain-boosting compounds!",
  "Meditation, even 5 minutes, improves focus and memory.",
  "Try using your non-dominant hand for simple tasks.",
  "Social interaction is one of the best brain exercises.",
  "Break large tasks into small steps — it's easier to remember.",
  "Singing activates both brain hemispheres simultaneously!",
  "Keep a routine — predictability reduces cognitive load.",
  "Visualize steps before doing them to improve recall.",
  "Standing up and stretching increases blood flow to the brain.",
  "Positive self-talk improves cognitive performance.",
  "Each night, review 3 things that happened today."
];

function loadDailyTip() {
  const tipEl = document.getElementById('tipText');
  if (!tipEl) return;
  const dayOfYear = getDayOfYear();
  tipEl.textContent = DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
}

// ---- Daily Quotes ----
const QUOTES = {
  motivational: [
    { text: "Every day is a new beginning. Take a deep breath, smile, and start again.", author: "Unknown" },
    { text: "You are braver than you believe, stronger than you seem, and smarter than you think.", author: "A.A. Milne" },
    { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
    { text: "Small steps in the right direction can turn out to be the biggest step of your life.", author: "Naeem Callaway" },
    { text: "It does not matter how slowly you go, as long as you do not stop.", author: "Confucius" },
    { text: "You don't have to be perfect to be amazing.", author: "Unknown" },
    { text: "Be gentle with yourself. You're doing the best you can.", author: "Unknown" },
    { text: "Every moment is a fresh beginning.", author: "T.S. Eliot" },
    { text: "The sun himself is weak when he first rises, and gathers strength as the day gets on.", author: "Charles Dickens" },
    { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
    { text: "Keep your face always toward the sunshine, and shadows will fall behind you.", author: "Walt Whitman" },
    { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
    { text: "Happiness is not something ready made. It comes from your own actions.", author: "Dalai Lama" }
  ],
  bible: [
    { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you.", author: "Jeremiah 29:11" },
    { text: "The Lord is my shepherd; I shall not want.", author: "Psalm 23:1" },
    { text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you.", author: "Joshua 1:9" },
    { text: "Come to me, all you who are weary and burdened, and I will give you rest.", author: "Matthew 11:28" },
    { text: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.", author: "Psalm 34:18" },
    { text: "I can do all things through Christ who strengthens me.", author: "Philippians 4:13" },
    { text: "Cast all your anxiety on Him because He cares for you.", author: "1 Peter 5:7" },
    { text: "The Lord will fight for you; you need only to be still.", author: "Exodus 14:14" },
    { text: "He gives strength to the weary and increases the power of the weak.", author: "Isaiah 40:29" },
    { text: "Trust in the Lord with all your heart and lean not on your own understanding.", author: "Proverbs 3:5" },
    { text: "Peace I leave with you; my peace I give you.", author: "John 14:27" },
    { text: "Even to your old age and gray hairs I am He who will sustain you.", author: "Isaiah 46:4" },
    { text: "God is our refuge and strength, an ever-present help in trouble.", author: "Psalm 46:1" },
    { text: "Do not fear, for I am with you; do not be dismayed, for I am your God.", author: "Isaiah 41:10" },
    { text: "The steadfast love of the Lord never ceases; His mercies never come to an end.", author: "Lamentations 3:22" }
  ]
};

function loadDailyQuote() {
  const quoteTextEl = document.getElementById('quoteText');
  const quoteAuthorEl = document.getElementById('quoteAuthor');
  if (!quoteTextEl || !quoteAuthorEl) return;

  const settings = db.getSettings();
  const dayOfYear = getDayOfYear();
  let pool = [];

  if (settings.quoteType === 'motivational') pool = QUOTES.motivational;
  else if (settings.quoteType === 'bible') pool = QUOTES.bible;
  else pool = [...QUOTES.motivational, ...QUOTES.bible];

  const quote = pool[dayOfYear % pool.length];
  quoteTextEl.textContent = `"${quote.text}"`;
  quoteAuthorEl.textContent = `— ${quote.author}`;
}

// ---- Emotion Status ----
function updateEmotionStatus() {
  const recent = db.getRecentEmotions(1);
  const emojiEl = document.getElementById('currentEmoji');
  const labelEl = document.getElementById('currentEmotionLabel');
  const subEl = document.getElementById('currentEmotionSub');

  if (recent.length > 0 && emojiEl && labelEl && subEl) {
    const emotion = recent[0];
    const emotionData = EMOTION_MAP[emotion.emotion] || { emoji: '😊', label: 'Okay' };
    emojiEl.textContent = emotionData.emoji;
    labelEl.textContent = `Feeling ${emotionData.label}`;
    const timeAgo = getTimeAgo(new Date(emotion.timestamp));
    subEl.textContent = `${timeAgo} · Tap to update`;
  }
}

// ---- Alert Badge ----
function updateAlertBadge() {
  const badge = document.getElementById('alertBadge');
  if (!badge) return;
  const count = db.getUnresolvedAlertCount();
  if (count > 0) {
    badge.textContent = count > 9 ? '9+' : count;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

// ---- Suggestion Modal ----
function showSuggestion(title, text, icon = '💛') {
  const dialog = document.getElementById('suggestionDialog');
  const titleEl = document.getElementById('suggestionTitle');
  const textEl = document.getElementById('suggestionText');
  const iconEl = document.getElementById('suggestionIcon');

  if (dialog) {
    if (titleEl) titleEl.textContent = title;
    if (textEl) textEl.textContent = text;
    if (iconEl) iconEl.textContent = icon;
    dialog.classList.add('active');
  }
}

function closeSuggestion() {
  const dialog = document.getElementById('suggestionDialog');
  if (dialog) dialog.classList.remove('active');
}

// ---- Reminder Checker ----
function startReminderChecker() {
  checkReminders();
  setInterval(checkReminders, 60000); // Check every minute
}

function checkReminders() {
  const reminders = db.getReminders();
  const now = new Date();
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

  reminders.forEach(r => {
    if (r.enabled && r.time === currentTime && !r.completed) {
      showToast(`⏰ ${r.title}`, 'warning');
      
      // Browser notification
      if (Notification.permission === 'granted') {
        new Notification('Aurea Reminder', {
          body: r.title,
          icon: '/assets/icons/aurea.png'
        });
      }
    }
  });
}

// ---- Utility Functions ----
function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
  return Math.floor(seconds / 86400) + 'd ago';
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ---- Emotion Map ----
const EMOTION_MAP = {
  happy: { emoji: '😊', label: 'Happy', color: '#00B894', negative: false },
  sad: { emoji: '😢', label: 'Sad', color: '#74B9FF', negative: true },
  angry: { emoji: '😠', label: 'Angry', color: '#FF7675', negative: true },
  worried: { emoji: '😟', label: 'Worried', color: '#FDCB6E', negative: true },
  calm: { emoji: '😌', label: 'Calm', color: '#A29BFE', negative: false },
  confused: { emoji: '😕', label: 'Confused', color: '#FD79A8', negative: true },
  tired: { emoji: '😴', label: 'Tired', color: '#636E72', negative: false },
  loved: { emoji: '🥰', label: 'Loved', color: '#E17055', negative: false }
};

// ---- Request Notification Permission ----
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// Request on first load
requestNotificationPermission();

// Start reminder checker on every page
startReminderChecker();
