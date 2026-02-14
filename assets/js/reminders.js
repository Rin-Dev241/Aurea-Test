/* ============================================
   AUREA — Daily Reminders Controller
   ============================================ */

let currentReminderTab = 'today';
let selectedCategory = 'medication';

// Category icons
const CATEGORY_ICONS = {
  medication: '💊',
  exercise: '🏃',
  meal: '🍽️',
  appointment: '📅',
  activity: '🎯',
  other: '📝'
};

// ---- Tab Switching ----
function switchReminderTab(tab, el) {
  currentReminderTab = tab;
  document.querySelectorAll('.tab-bar .tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  loadReminders();
}

// ---- Load Reminders ----
function loadReminders() {
  const allReminders = db.getReminders();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  let filtered;
  switch (currentReminderTab) {
    case 'today':
      filtered = allReminders.filter(r => !r.completed && isReminderForToday(r));
      break;
    case 'completed':
      filtered = allReminders.filter(r => r.completed);
      break;
    default:
      filtered = allReminders.filter(r => !r.completed);
  }

  const list = document.getElementById('reminderList');
  const empty = document.getElementById('emptyReminders');

  if (filtered.length === 0) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  // Sort by time
  filtered.sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  list.innerHTML = filtered.map(rem => {
    const icon = CATEGORY_ICONS[rem.category] || '📝';
    const timeStr = rem.time ? formatReminderTime(rem.time) : '';
    const repeatBadge = rem.repeat && rem.repeat !== 'none'
      ? `<span class="reminder-repeat">${rem.repeat}</span>` : '';

    return `
      <div class="reminder-card ${rem.completed ? 'completed' : ''}" data-id="${rem.id}">
        <div class="reminder-check" onclick="toggleReminder('${rem.id}')">
          ${rem.completed
            ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="var(--color-success)"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4" fill="none" stroke="white" stroke-width="2"/></svg>'
            : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-border)" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>'}
        </div>
        <div class="reminder-content" onclick="editReminder('${rem.id}')">
          <div class="reminder-title">${icon} ${rem.title}</div>
          <div class="reminder-meta">
            <span class="reminder-time">${timeStr}</span>
            ${repeatBadge}
          </div>
          ${rem.notes ? `<div class="reminder-notes">${rem.notes}</div>` : ''}
        </div>
        <button class="reminder-delete" onclick="deleteReminder('${rem.id}')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
        </button>
      </div>
    `;
  }).join('');
}

function isReminderForToday(reminder) {
  if (!reminder.repeat || reminder.repeat === 'none') return true;
  const day = new Date().getDay(); // 0=Sun
  if (reminder.repeat === 'daily') return true;
  if (reminder.repeat === 'weekdays') return day >= 1 && day <= 5;
  if (reminder.repeat === 'weekly') return true; // simplified
  return true;
}

function formatReminderTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

// ---- Toggle Complete ----
function toggleReminder(id) {
  const reminders = db.getReminders();
  const rem = reminders.find(r => r.id === id);
  if (rem) {
    rem.completed = !rem.completed;
    rem.completedAt = rem.completed ? new Date().toISOString() : null;
    db.saveReminder(rem);
    loadReminders();

    if (rem.completed) {
      showToast('Reminder completed! ✅');
    }
  }
}

// ---- Add / Edit ----
function showAddReminder() {
  document.getElementById('reminderModalTitle').textContent = 'Add Reminder';
  document.getElementById('reminderForm').reset();
  document.getElementById('editReminderId').value = '';
  selectedCategory = 'medication';
  document.querySelectorAll('.category-chips .chip').forEach(c => {
    c.classList.toggle('active', c.dataset.cat === 'medication');
  });
  document.getElementById('reminderModal').classList.add('active');
}

function editReminder(id) {
  const reminders = db.getReminders();
  const rem = reminders.find(r => r.id === id);
  if (!rem) return;

  document.getElementById('reminderModalTitle').textContent = 'Edit Reminder';
  document.getElementById('editReminderId').value = id;
  document.getElementById('reminderTitle').value = rem.title || '';
  document.getElementById('reminderTime').value = rem.time || '';
  document.getElementById('reminderRepeat').value = rem.repeat || 'none';
  document.getElementById('reminderNotes').value = rem.notes || '';
  selectedCategory = rem.category || 'other';
  document.querySelectorAll('.category-chips .chip').forEach(c => {
    c.classList.toggle('active', c.dataset.cat === selectedCategory);
  });
  document.getElementById('reminderModal').classList.add('active');
}

function closeReminderModal() {
  document.getElementById('reminderModal').classList.remove('active');
}

function selectCategory(cat, el) {
  selectedCategory = cat;
  document.querySelectorAll('.category-chips .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
}

function saveReminder(e) {
  e.preventDefault();

  const id = document.getElementById('editReminderId').value;
  const reminder = {
    id: id || 'rem_' + Date.now(),
    title: document.getElementById('reminderTitle').value.trim(),
    time: document.getElementById('reminderTime').value,
    category: selectedCategory,
    repeat: document.getElementById('reminderRepeat').value,
    notes: document.getElementById('reminderNotes').value.trim(),
    enabled: true,
    completed: false,
    createdAt: new Date().toISOString()
  };

  // If editing, preserve completed status
  if (id) {
    const existing = db.getReminders().find(r => r.id === id);
    if (existing) {
      reminder.completed = existing.completed;
      reminder.createdAt = existing.createdAt;
    }
  }

  db.saveReminder(reminder);
  closeReminderModal();
  loadReminders();
  showToast(id ? 'Reminder updated!' : 'Reminder added!');
}

function deleteReminder(id) {
  if (!confirm('Delete this reminder?')) return;
  db.deleteReminder(id);
  loadReminders();
  showToast('Reminder deleted');
}

// ---- Quote ----
function loadQuote() {
  const settings = db.getSettings();
  const quoteType = settings.quoteType || 'motivational';

  document.getElementById('quoteTypeToggle').checked = quoteType === 'bible';

  const quotes = QUOTES[quoteType] || QUOTES.motivational;
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const quote = quotes[dayOfYear % quotes.length];

  document.getElementById('quoteText').textContent = quote.text;
  document.getElementById('quoteSource').textContent = `— ${quote.source}`;
}

function toggleQuoteType() {
  const checked = document.getElementById('quoteTypeToggle').checked;
  const settings = db.getSettings();
  settings.quoteType = checked ? 'bible' : 'motivational';
  db.saveSettings(settings);
  loadQuote();
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  loadQuote();
  loadReminders();
  requestNotificationPermission();
});
