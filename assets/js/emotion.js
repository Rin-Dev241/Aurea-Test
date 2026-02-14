/* ============================================
   AUREA — Emotion Recognition Module
   Manual input + Camera detection (face-api.js)
   ============================================ */

let selectedEmotion = null;
let cameraStream = null;
let detectionInterval = null;
let emotionReadings = []; // Rolling average buffer

// ---- Tab Switching ----
function switchEmotionTab(tab) {
  const manualSection = document.getElementById('manualSection');
  const cameraSection = document.getElementById('cameraSection');
  const tabManual = document.getElementById('tabManual');
  const tabCamera = document.getElementById('tabCamera');
  const resultSection = document.getElementById('emotionResultSection');

  // Hide result section when switching
  if (resultSection) resultSection.classList.add('hidden');
  if (manualSection) manualSection.classList.remove('hidden');

  if (tab === 'manual') {
    manualSection.classList.remove('hidden');
    cameraSection.classList.add('hidden');
    tabManual.classList.add('active');
    tabCamera.classList.remove('active');
    stopCamera();
  } else {
    manualSection.classList.add('hidden');
    cameraSection.classList.remove('hidden');
    tabManual.classList.remove('active');
    tabCamera.classList.add('active');
  }
}

// ---- Manual Emotion Selection ----
function selectEmotion(card) {
  // Remove selection from all
  document.querySelectorAll('.emotion-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  selectedEmotion = card.dataset.emotion;
  
  const btn = document.getElementById('submitEmotionBtn');
  if (btn) btn.disabled = false;
}

function submitManualEmotion() {
  if (!selectedEmotion) return;

  const emotionData = EMOTION_MAP[selectedEmotion];
  
  // Process through automation engine
  AutomationEngine.processEmotion(selectedEmotion, 'manual');

  // Show result
  showEmotionResult(selectedEmotion);
}

function showEmotionResult(emotion) {
  const data = EMOTION_MAP[emotion];
  const manualSection = document.getElementById('manualSection');
  const resultSection = document.getElementById('emotionResultSection');
  
  if (manualSection) manualSection.classList.add('hidden');
  if (resultSection) resultSection.classList.remove('hidden');

  document.getElementById('resultEmoji').textContent = data.emoji;
  document.getElementById('resultTitle').textContent = `Feeling ${data.label}!`;

  const messages = {
    happy: "That's wonderful! Keep spreading those good vibes. 🌟",
    sad: "It's okay to feel this way. We're here for you, always. 💙",
    angry: "Take a deep breath. Let's try to find some calm together. 🍃",
    worried: "You're not alone in this. Everything will be alright. 🤗",
    calm: "What a peaceful state of mind. Enjoy this moment. 🕊️",
    confused: "It's okay to not have all the answers. One step at a time. 🌈",
    tired: "Rest is important. Take it easy and recharge. 😴",
    loved: "You are so loved and cherished. Never forget that. 💛"
  };

  document.getElementById('resultMessage').textContent = messages[emotion] || "Thank you for sharing how you feel.";
  
  // Refresh history
  loadEmotionHistory();
}

function resetEmotionInput() {
  const manualSection = document.getElementById('manualSection');
  const resultSection = document.getElementById('emotionResultSection');
  
  if (manualSection) manualSection.classList.remove('hidden');
  if (resultSection) resultSection.classList.add('hidden');
  
  selectedEmotion = null;
  document.querySelectorAll('.emotion-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('submitEmotionBtn').disabled = true;
}

// ---- Camera Emotion Detection ----
async function startCamera() {
  const video = document.getElementById('cameraVideo');
  const placeholder = document.getElementById('cameraPlaceholder');
  const overlay = document.getElementById('cameraOverlay');
  const startBtn = document.getElementById('startCameraBtn');
  const stopBtn = document.getElementById('stopCameraBtn');

  try {
    // Load face-api.js models
    startBtn.textContent = '⏳ Loading AI models...';
    startBtn.disabled = true;

    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/';
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
    ]);

    // Get camera stream
    startBtn.textContent = '📸 Opening camera...';
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    });

    video.srcObject = cameraStream;
    await video.play();

    // Show/hide UI elements
    placeholder.classList.add('hidden');
    overlay.classList.remove('hidden');
    startBtn.classList.add('hidden');
    stopBtn.classList.remove('hidden');

    // Reset rolling average buffer
    emotionReadings = [];

    // Start detection loop every 2 seconds
    detectionInterval = setInterval(() => detectEmotion(video), 2000);

  } catch (err) {
    console.error('Camera error:', err);
    startBtn.textContent = '📸 Start Camera';
    startBtn.disabled = false;

    if (err.name === 'NotAllowedError') {
      showToast('Camera permission denied. Please allow camera access.', 'warning');
    } else if (err.name === 'NotFoundError') {
      showToast('No camera found on this device.', 'warning');
    } else {
      showToast('Could not start camera. Check your connection for AI model loading.', 'danger');
    }
  }
}

async function detectEmotion(video) {
  if (!cameraStream) return;

  try {
    const detections = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ 
        inputSize: 320,
        scoreThreshold: 0.5 
      }))
      .withFaceExpressions();

    if (detections) {
      const expressions = detections.expressions;
      
      // Map face-api expressions to our emotion names
      const mappedEmotion = mapFaceApiExpression(expressions);
      
      // Add to rolling average buffer
      emotionReadings.push(mappedEmotion);
      if (emotionReadings.length > 5) emotionReadings.shift();

      // Get mode (most frequent) from buffer
      const averagedEmotion = getModeEmotion(emotionReadings);
      const confidence = getEmotionConfidence(emotionReadings, averagedEmotion);

      // Update UI
      updateCameraUI(averagedEmotion, confidence);

      // Process every 5th reading (to avoid over-triggering)
      if (emotionReadings.length === 5 && emotionReadings.length % 5 === 0) {
        AutomationEngine.processEmotion(averagedEmotion, 'camera');
        loadEmotionHistory();
      }
    } else {
      updateCameraUI(null, 0);
    }
  } catch (err) {
    console.error('Detection error:', err);
  }
}

// Map face-api.js expressions to our emotion system
function mapFaceApiExpression(expressions) {
  // face-api.js returns: neutral, happy, sad, angry, fearful, disgusted, surprised
  const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
  const topExpression = sorted[0][0];
  const topConfidence = sorted[0][1];

  // If confidence is too low, treat as neutral/calm
  if (topConfidence < 0.4) return 'calm';

  const mapping = {
    'happy': 'happy',
    'sad': 'sad',
    'angry': 'angry',
    'fearful': 'worried',
    'disgusted': 'angry',
    'surprised': 'confused',
    'neutral': 'calm'
  };

  return mapping[topExpression] || 'calm';
}

// Get mode (most frequent emotion) from readings buffer
function getModeEmotion(readings) {
  if (readings.length === 0) return 'calm';
  
  const counts = {};
  readings.forEach(r => counts[r] = (counts[r] || 0) + 1);
  
  let maxCount = 0;
  let mode = readings[readings.length - 1]; // Default to latest

  for (const [emotion, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      mode = emotion;
    }
  }

  return mode;
}

// Get confidence as percentage of agreement
function getEmotionConfidence(readings, mode) {
  if (readings.length === 0) return 0;
  const count = readings.filter(r => r === mode).length;
  return Math.round((count / readings.length) * 100);
}

function updateCameraUI(emotion, confidence) {
  const labelEl = document.getElementById('cameraEmotionLabel');
  const confEl = document.getElementById('cameraConfidence');
  const confBar = document.getElementById('cameraConfidenceBar');

  if (!emotion) {
    if (labelEl) labelEl.textContent = 'No face detected';
    if (confEl) confEl.textContent = 'Make sure your face is visible';
    if (confBar) confBar.style.width = '0%';
    return;
  }

  const data = EMOTION_MAP[emotion];
  if (labelEl) labelEl.textContent = `${data.emoji} ${data.label}`;
  if (confEl) confEl.textContent = `Confidence: ${confidence}%`;
  if (confBar) confBar.style.width = confidence + '%';
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }

  if (detectionInterval) {
    clearInterval(detectionInterval);
    detectionInterval = null;
  }

  const video = document.getElementById('cameraVideo');
  const placeholder = document.getElementById('cameraPlaceholder');
  const overlay = document.getElementById('cameraOverlay');
  const startBtn = document.getElementById('startCameraBtn');
  const stopBtn = document.getElementById('stopCameraBtn');

  if (video) video.srcObject = null;
  if (placeholder) placeholder.classList.remove('hidden');
  if (overlay) overlay.classList.add('hidden');
  if (startBtn) {
    startBtn.classList.remove('hidden');
    startBtn.textContent = '📸 Start Camera';
    startBtn.disabled = false;
  }
  if (stopBtn) stopBtn.classList.add('hidden');

  emotionReadings = [];

  // Save final averaged emotion if we had readings
  if (emotionReadings.length > 0) {
    const final = getModeEmotion(emotionReadings);
    AutomationEngine.processEmotion(final, 'camera');
  }
}

// ---- Emotion History ----
function loadEmotionHistory() {
  const container = document.getElementById('emotionHistory');
  if (!container) return;

  const emotions = db.getRecentEmotions(10);

  if (emotions.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 24px 0;">
        <p style="color: var(--color-text-secondary); font-size: 14px;">
          No mood records yet. Start by selecting how you feel!
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = emotions.map(e => {
    const data = EMOTION_MAP[e.emotion] || { emoji: '😊', label: e.emotion };
    const time = getTimeAgo(new Date(e.timestamp));
    return `
      <div class="emotion-history-item">
        <span class="emoji">${data.emoji}</span>
        <div class="info">
          <div class="emotion-name">${data.label}</div>
          <div class="emotion-time">${time}</div>
        </div>
        <span class="emotion-source" style="font-size: 11px; color: var(--color-text-tertiary);">
          ${e.source === 'camera' ? '📸' : '✋'}
        </span>
      </div>
    `;
  }).join('');
}

// ---- Init on page load ----
document.addEventListener('DOMContentLoaded', () => {
  loadEmotionHistory();
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  stopCamera();
});
