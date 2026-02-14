/* ============================================
   AUREA — Automation Engine
   Connects emotions → actions → alerts
   ============================================ */

const AutomationEngine = {
  consecutiveNegative: 0,
  sessionSuggestionShown: false,

  // Process a new emotion reading
  processEmotion(emotion, source = 'manual') {
    const emotionData = EMOTION_MAP[emotion];
    if (!emotionData) return;

    // Save to database
    db.addEmotion({ emotion, source, label: emotionData.label });

    // Complete daily task
    const tasks = db.getDailyTasks();
    const unchecked = tasks.find(t => t.type === 'emotion' && !t.completed);
    if (unchecked) {
      db.completeDailyTask(unchecked.id);
    }

    // Check if negative
    if (emotionData.negative) {
      this.consecutiveNegative++;
      this.handleNegativeEmotion(emotion);
    } else {
      this.consecutiveNegative = 0;
      this.sessionSuggestionShown = false;
    }

    // Update UI if on dashboard
    if (typeof updateEmotionStatus === 'function') updateEmotionStatus();
    if (typeof updateDailyProgress === 'function') updateDailyProgress();
    if (typeof updateAlertBadge === 'function') updateAlertBadge();
  },

  // Handle negative emotion detection
  handleNegativeEmotion(emotion) {
    const settings = db.getAutomationSettings();

    // Step 1: Show suggestion (first negative in session)
    if (!this.sessionSuggestionShown && settings.autoSuggestOnNegative) {
      this.sessionSuggestionShown = true;
      
      const emotionData = EMOTION_MAP[emotion];
      const messages = {
        sad: "It's okay to feel sad sometimes. Would you like to look at some happy memories or play a fun game?",
        angry: "Let's take a moment to calm down. Would you like to try some soothing memories or a relaxing game?",
        worried: "Don't worry, we're here for you. How about looking at some happy memories or playing a game?",
        confused: "Let's take it one step at a time. Would you like to look at familiar memories or play a simple game?"
      };

      if (typeof showSuggestion === 'function') {
        showSuggestion(
          "We're here for you " + emotionData.emoji,
          messages[emotion] || "Would you like to look at some happy memories or play a brain game?",
          emotionData.emoji
        );
      }
    }

    // Step 2: Alert caregiver on sustained distress
    if (this.consecutiveNegative >= settings.distressThreshold && settings.alertCaregiverOnDistress) {
      this.triggerCaregiverAlert(emotion);
    }
  },

  // Send caregiver alert
  triggerCaregiverAlert(emotion) {
    const settings = db.getAutomationSettings();
    const now = Date.now();
    const lastAlert = db.getLastAlertTime();
    const cooldown = settings.alertCooldownMinutes * 60 * 1000;
    const alertsToday = db.getAlertCountToday();

    // Check cooldown
    if (now - lastAlert < cooldown) {
      console.log('Alert cooldown active, skipping...');
      return;
    }

    // Check daily limit
    if (alertsToday >= settings.maxAlertsPerDay) {
      console.log('Daily alert limit reached, skipping...');
      return;
    }

    const user = db.getUser();
    const emotionData = EMOTION_MAP[emotion];
    const severity = this.consecutiveNegative >= 5 ? 'high' : 'medium';

    // Create alert record
    const alert = db.addAlert({
      emotion,
      label: emotionData.label,
      severity,
      consecutiveCount: this.consecutiveNegative,
      patientName: user.name,
      title: 'Emotional Distress Detected',
      message: severity === 'high'
        ? `URGENT: ${user.name} has been showing sustained ${emotionData.label.toLowerCase()} (${this.consecutiveNegative}+ readings).`
        : `${user.name} appears to be feeling ${emotionData.label.toLowerCase()} (${this.consecutiveNegative} consecutive readings).`
    });

    // Update cooldown
    db.setLastAlertTime(now);
    db.incrementAlertCountToday();

    // Send via native device actions
    const caregivers = db.getCaregivers();
    if (caregivers.length > 0) {
      this.sendNativeAlert(caregivers, alert, user);
    }

    // Show in-app notification
    if (typeof showToast === 'function') {
      showToast(
        severity === 'high' 
          ? '🚨 Urgent alert sent to your caregiver' 
          : '📨 Your caregiver has been notified',
        severity === 'high' ? 'danger' : 'warning'
      );
    }

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Aurea — Caregiver Alert', {
        body: alert.message,
        icon: '/assets/icons/aurea.png'
      });
    }

    // Update badge
    if (typeof updateAlertBadge === 'function') updateAlertBadge();
  },

  // Send alert using native device capabilities
  sendNativeAlert(caregivers, alert, user) {
    const method = localStorage.getItem('aurea_alert_method') || 'sms';
    const message = alert.severity === 'urgent'
      ? `URGENT from Aurea: ${user.name} has been showing signs of sustained distress (${alert.consecutiveCount}+ readings). Please check on them immediately.`
      : `Aurea Alert: ${user.name} appears to be feeling ${alert.label.toLowerCase()}. Detected ${alert.consecutiveCount} times. Please check on them.`;

    if (method === 'sms') {
      const phones = caregivers.filter(c => c.phone).map(c => c.phone.replace(/\s+/g, ''));
      if (phones.length > 0) {
        window.location.href = `sms:${phones.join(',')}?body=${encodeURIComponent(message)}`;
      }
    } else if (method === 'whatsapp') {
      const firstPhone = caregivers.find(c => c.phone);
      if (firstPhone) {
        const num = firstPhone.phone.replace(/\s+/g, '').replace(/^0/, '63');
        window.open(`https://wa.me/${num}?text=${encodeURIComponent(message)}`, '_blank');
      }
    } else if (method === 'email') {
      const emails = caregivers.map(c => c.email).join(',');
      window.location.href = `mailto:${emails}?subject=${encodeURIComponent('Aurea Alert — ' + user.name)}&body=${encodeURIComponent(message)}`;
    } else if (method === 'call') {
      const firstPhone = caregivers.find(c => c.phone);
      if (firstPhone) {
        window.location.href = `tel:${firstPhone.phone.replace(/\s+/g, '')}`;
      }
    }
  },

  // Reset tracking (e.g., new session)
  reset() {
    this.consecutiveNegative = 0;
    this.sessionSuggestionShown = false;
  }
};
