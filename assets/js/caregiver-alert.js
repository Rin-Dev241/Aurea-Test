/* ============================================
   AUREA — Caregiver Alert System Controller
   ============================================ */

let currentAlertTab = 'contacts';

// ---- Tab Switching ----
function switchAlertTab(tab, el) {
  currentAlertTab = tab;
  document.querySelectorAll('.tab-bar .tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');

  document.getElementById('contactsPanel').classList.toggle('hidden', tab !== 'contacts');
  document.getElementById('alertsPanel').classList.toggle('hidden', tab !== 'alerts');
  document.getElementById('settingsPanel').classList.toggle('hidden', tab !== 'settings');

  if (tab === 'contacts') loadCaregivers();
  if (tab === 'alerts') loadAlertHistory();
  if (tab === 'settings') loadAlertSettings();
}

// ---- Summary Stats ----
function updateAlertSummary() {
  const alerts = db.getAlerts();
  const caregivers = db.getCaregivers();

  document.getElementById('totalAlerts').textContent = alerts.length;
  document.getElementById('unresolvedAlerts').textContent = alerts.filter(a => !a.resolved).length;
  document.getElementById('caregiverCount').textContent = caregivers.length;
}

// ---- Caregivers ----
function loadCaregivers() {
  const caregivers = db.getCaregivers();
  const list = document.getElementById('caregiverList');
  const empty = document.getElementById('emptyCaregivers');

  if (caregivers.length === 0) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  list.innerHTML = caregivers.map(cg => {
    const initials = cg.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const relLabel = { family: '👨‍👩‍👦 Family', nurse: '👩‍⚕️ Nurse', doctor: '🩺 Doctor', friend: '🤝 Friend', other: '📌 Other' };
    const relationKey = cg.relation || cg.relationship || 'other';
    const user = db.getUser();
    const patientName = user.name || 'Your loved one';
    const alertMsg = encodeURIComponent(`Hi ${cg.name}, this is an alert from Aurea. ${patientName} may need your help. Please check on them.`);
    const emailSubject = encodeURIComponent(`Aurea Alert — ${patientName} needs attention`);
    const phone = cg.phone ? cg.phone.replace(/\s+/g, '') : '';

    return `
      <div class="caregiver-card" data-id="${cg.id}">
        <div class="caregiver-avatar">${initials}</div>
        <div class="caregiver-info">
          <div class="caregiver-name">${cg.name}</div>
          <div class="caregiver-detail">${cg.email}</div>
          <div class="caregiver-detail">${relLabel[relationKey] || relationKey}${cg.phone ? ' • ' + cg.phone : ''}</div>
          <div class="quick-contact">
            ${phone ? `<a href="tel:${phone}" class="quick-btn call">📞 Call</a>` : ''}
            ${phone ? `<a href="sms:${phone}?body=${alertMsg}" class="quick-btn sms">💬 SMS</a>` : ''}
            ${phone ? `<a href="https://wa.me/${phone.replace(/^0/, '63')}?text=${alertMsg}" target="_blank" class="quick-btn whatsapp">📱 WA</a>` : ''}
            <a href="mailto:${cg.email}?subject=${emailSubject}&body=${alertMsg}" class="quick-btn email-btn">📧 Email</a>
          </div>
        </div>
        <div class="caregiver-actions">
          <button class="btn-edit" onclick="editCaregiver('${cg.id}')">✏️</button>
          <button class="btn-del" onclick="deleteCaregiver('${cg.id}')">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

function showAddCaregiver() {
  document.getElementById('caregiverModalTitle').textContent = 'Add Caregiver';
  document.getElementById('caregiverForm').reset();
  document.getElementById('editCaregiverId').value = '';
  document.getElementById('caregiverModal').classList.add('active');
}

function editCaregiver(id) {
  const caregivers = db.getCaregivers();
  const cg = caregivers.find(c => c.id === id);
  if (!cg) return;

  document.getElementById('caregiverModalTitle').textContent = 'Edit Caregiver';
  document.getElementById('editCaregiverId').value = id;
  document.getElementById('caregiverName').value = cg.name;
  document.getElementById('caregiverEmail').value = cg.email;
  document.getElementById('caregiverPhone').value = cg.phone || '';
  document.getElementById('caregiverRelation').value = cg.relation || 'family';
  document.getElementById('caregiverModal').classList.add('active');
}

function closeCaregiverModal() {
  document.getElementById('caregiverModal').classList.remove('active');
}

function saveCaregiver(e) {
  e.preventDefault();

  const id = document.getElementById('editCaregiverId').value;
  const caregiver = {
    id: id || 'cg_' + Date.now(),
    name: document.getElementById('caregiverName').value.trim(),
    email: document.getElementById('caregiverEmail').value.trim(),
    phone: document.getElementById('caregiverPhone').value.trim(),
    relation: document.getElementById('caregiverRelation').value,
    addedAt: new Date().toISOString()
  };

  db.saveCaregiver(caregiver);
  closeCaregiverModal();
  loadCaregivers();
  updateAlertSummary();
  showToast(id ? 'Caregiver updated!' : 'Caregiver added!');
}

function deleteCaregiver(id) {
  if (!confirm('Remove this caregiver?')) return;
  db.deleteCaregiver(id);
  loadCaregivers();
  updateAlertSummary();
  showToast('Caregiver removed');
}

// ---- Alert History ----
function loadAlertHistory() {
  const alerts = db.getAlerts();
  const container = document.getElementById('alertHistory');
  const empty = document.getElementById('emptyAlerts');

  if (alerts.length === 0) {
    container.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  // Sort newest first
  alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  container.innerHTML = alerts.map(alert => {
    const date = new Date(alert.timestamp);
    const timeStr = date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const severityClass = alert.severity === 'high' ? 'critical' : alert.resolved ? 'resolved' : '';
    const severityBadge = alert.severity
      ? `<span class="alert-badge-severity severity-${alert.severity}">${alert.severity}</span>` : '';

    return `
      <div class="alert-card ${severityClass}" data-id="${alert.id}">
        <div class="alert-header">
          <div>
            <div class="alert-title">${alert.emotion ? EMOTION_MAP[alert.emotion]?.emoji + ' ' : ''}${alert.title || 'Emotional Distress Alert'}</div>
            ${severityBadge}
          </div>
          <span class="alert-time">${timeStr}</span>
        </div>
        <div class="alert-body">
          ${alert.message || `Patient reported feeling ${alert.emotion || 'distressed'}`}
        </div>
        <div class="alert-actions">
          ${!alert.resolved ? `<button class="btn btn-primary" onclick="resolveAlert('${alert.id}')">Mark Resolved</button>` : '<span style="color:var(--color-success);font-size:12px">✅ Resolved</span>'}
        </div>
      </div>
    `;
  }).join('');
}

function resolveAlert(id) {
  db.resolveAlert(id);
  loadAlertHistory();
  updateAlertSummary();
  showToast('Alert resolved');
}

// ---- Settings ----
function loadAlertSettings() {
  const settings = db.getAutomationSettings();

  // Alert method
  const method = localStorage.getItem('aurea_alert_method') || 'sms';
  document.getElementById('alertMethod').value = method;

  // Preferences
  document.getElementById('autoAlertToggle').checked = settings.alertCaregiverOnDistress !== false;
  document.getElementById('alertCooldown').value = (settings.alertCooldownMinutes || 30).toString();
  document.getElementById('maxDailyAlerts').value = (settings.maxAlertsPerDay || 3).toString();
}

function saveAlertPreferences() {
  const settings = db.getAutomationSettings();
  settings.alertCaregiverOnDistress = document.getElementById('autoAlertToggle').checked;
  settings.alertCooldownMinutes = parseInt(document.getElementById('alertCooldown').value);
  settings.maxAlertsPerDay = parseInt(document.getElementById('maxDailyAlerts').value);
  db.saveAutomationSettings(settings);

  // Save alert method
  localStorage.setItem('aurea_alert_method', document.getElementById('alertMethod').value);

  showToast('Preferences saved!');
}

// ---- SOS Alert ----
function sendSOSAlert() {
  const caregivers = db.getCaregivers();
  if (caregivers.length === 0) {
    showToast('Add a caregiver first!', 'warning');
    return;
  }

  const user = db.getUser();
  const patientName = user.name || 'Your loved one';
  const method = localStorage.getItem('aurea_alert_method') || 'sms';
  const message = `URGENT from Aurea: ${patientName} needs help. Please check on them immediately. — Sent via Aurea Care App`;

  // Record alert
  const alert = db.addAlert({
    emotion: 'worried',
    label: 'Manual SOS',
    severity: 'high',
    consecutiveCount: 0,
    patientName: patientName,
    title: 'Manual SOS Alert',
    message: `${patientName} sent a manual SOS alert`
  });

  if (method === 'sms') {
    // Collect all phone numbers
    const phones = caregivers.filter(c => c.phone).map(c => c.phone.replace(/\s+/g, ''));
    if (phones.length > 0) {
      window.location.href = `sms:${phones.join(',')}?body=${encodeURIComponent(message)}`;
    } else {
      // Fallback to email
      const emails = caregivers.map(c => c.email).join(',');
      window.location.href = `mailto:${emails}?subject=${encodeURIComponent('Aurea Alert — ' + patientName)}&body=${encodeURIComponent(message)}`;
    }
  } else if (method === 'whatsapp') {
    const firstPhone = caregivers.find(c => c.phone);
    if (firstPhone) {
      const num = firstPhone.phone.replace(/\s+/g, '').replace(/^0/, '63');
      window.open(`https://wa.me/${num}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      showToast('No phone numbers saved. Add a phone number.', 'warning');
    }
  } else if (method === 'email') {
    const emails = caregivers.map(c => c.email).join(',');
    window.location.href = `mailto:${emails}?subject=${encodeURIComponent('Aurea Alert — ' + patientName)}&body=${encodeURIComponent(message)}`;
  } else if (method === 'call') {
    const firstPhone = caregivers.find(c => c.phone);
    if (firstPhone) {
      window.location.href = `tel:${firstPhone.phone.replace(/\s+/g, '')}`;
    } else {
      showToast('No phone numbers saved. Add a phone number.', 'warning');
    }
  }

  // Also show browser notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Aurea SOS Alert Sent', {
      body: `Alert sent to ${caregivers.length} caregiver(s)`,
      icon: '/assets/icons/aurea.png'
    });
  }

  showToast('🚨 Alert triggered!', 'danger');
  updateAlertSummary();
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  updateAlertSummary();
  loadCaregivers();
});
