/* ============================================
   AUREA — Authentication
   ============================================ */

let selectedRole = 'patient';

function switchAuthTab(tab) {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const tabLogin = document.getElementById('tabLogin');
  const tabSignup = document.getElementById('tabSignup');
  const error = document.getElementById('authError');

  if (error) { error.classList.remove('show'); error.textContent = ''; }

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
  } else {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    tabLogin.classList.remove('active');
    tabSignup.classList.add('active');
  }
}

function selectRole(role) {
  selectedRole = role;
  document.getElementById('rolePatient').classList.toggle('selected', role === 'patient');
  document.getElementById('roleCaregiver').classList.toggle('selected', role === 'caregiver');
}

function showAuthError(message) {
  const error = document.getElementById('authError');
  if (error) {
    error.textContent = message;
    error.classList.add('show');
  }
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showAuthError('Please fill in all fields.');
    return;
  }

  // Check local stored user
  const user = db.getUser();
  if (user.email === email) {
    // Logged in
    window.location.href = 'pages/dashboard.html';
  } else {
    // For now, just create/login locally
    db.setUser({
      ...user,
      email: email,
      name: user.name || email.split('@')[0],
      lastLogin: new Date().toISOString()
    });
    window.location.href = 'pages/dashboard.html';
  }
}

function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;

  if (!name || !email || !password) {
    showAuthError('Please fill in all fields.');
    return;
  }

  if (password.length < 6) {
    showAuthError('Password must be at least 6 characters.');
    return;
  }

  // Store locally
  db.setUser({
    name: name,
    email: email,
    role: selectedRole,
    avatar: '',
    createdAt: new Date().toISOString()
  });

  window.location.href = 'pages/dashboard.html';
}

function handleDemoLogin() {
  db.setUser({
    name: 'Beloved Patient',
    email: 'demo@aurea.app',
    role: 'patient',
    avatar: '',
    createdAt: new Date().toISOString()
  });

  // Add some demo reminders
  const existing = db.getReminders();
  if (existing.length === 0) {
    db.addReminder({ title: 'Breakfast & Medicine', time: '08:00', category: 'medicine', repeat: 'daily' });
    db.addReminder({ title: 'Morning Walk', time: '10:00', category: 'exercise', repeat: 'daily' });
    db.addReminder({ title: 'Lunch', time: '12:00', category: 'meal', repeat: 'daily' });
    db.addReminder({ title: 'Drink Water', time: '14:00', category: 'hydration', repeat: 'daily' });
    db.addReminder({ title: 'Afternoon Activity', time: '15:00', category: 'general', repeat: 'daily' });
    db.addReminder({ title: 'Dinner & Evening Medicine', time: '18:00', category: 'medicine', repeat: 'daily' });
  }

  // Add demo caregiver
  const caregivers = db.getCaregivers();
  if (caregivers.length === 0) {
    db.addCaregiver({ name: 'Dr. Santos', email: 'caregiver@example.com', phone: '09123456789', relationship: 'Primary Caregiver' });
  }

  window.location.href = 'pages/dashboard.html';
}
