/* ============================================
   AUREA — Memory Recall Module
   Photos, Videos, Audio management
   ============================================ */

let currentMemoryType = 'photo';
let selectedTags = ['family'];
let uploadedFileData = null;

// ---- Tab Switching ----
function switchMemoryTab(tab) {
  document.querySelectorAll('[id$="Section"]').forEach(s => {
    if (['photosSection', 'videosSection', 'audioSection'].includes(s.id)) {
      s.classList.add('hidden');
    }
  });
  document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));

  if (tab === 'photos') {
    document.getElementById('photosSection').classList.remove('hidden');
    document.getElementById('tabPhotos').classList.add('active');
  } else if (tab === 'videos') {
    document.getElementById('videosSection').classList.remove('hidden');
    document.getElementById('tabVideos').classList.add('active');
  } else {
    document.getElementById('audioSection').classList.remove('hidden');
    document.getElementById('tabAudio').classList.add('active');
  }
}

// ---- Load Memories ----
function loadMemories() {
  const memories = db.getMemories();
  
  const photos = memories.filter(m => m.type === 'photo');
  const videos = memories.filter(m => m.type === 'video');
  const audio = memories.filter(m => m.type === 'audio');

  renderPhotoGrid(photos);
  renderVideoGrid(videos);
  renderAudioList(audio);
}

function renderPhotoGrid(photos) {
  const grid = document.getElementById('photosGrid');
  const empty = document.getElementById('photosEmpty');
  
  if (photos.length === 0) {
    grid.classList.add('hidden');
    empty.classList.remove('hidden');
    return;
  }

  grid.classList.remove('hidden');
  empty.classList.add('hidden');

  // Sample placeholder images for demo
  const placeholderImages = [
    'https://images.unsplash.com/photo-1476725994324-6f6833ea0631?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=300&h=300&fit=crop'
  ];

  grid.innerHTML = photos.map((photo, i) => {
    const imgSrc = photo.dataUrl || placeholderImages[i % placeholderImages.length];
    return `
      <div class="memory-card ${i === 0 ? 'featured' : ''}" onclick="openMediaViewer('${photo.id}')">
        <div class="media-wrapper">
          <img src="${imgSrc}" alt="${photo.title}" loading="lazy"
               onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'300\\' height=\\'300\\' fill=\\'%23FFF8F0\\'><rect width=\\'300\\' height=\\'300\\'/><text x=\\'50%25\\' y=\\'50%25\\' text-anchor=\\'middle\\' dy=\\'.3em\\' font-size=\\'48\\'>📸</text></svg>'">
        </div>
        <div class="card-info">
          <div class="card-title">${photo.title}</div>
          <div class="card-date">${formatMemoryDate(photo.createdAt)}</div>
        </div>
      </div>
    `;
  }).join('');
}

function renderVideoGrid(videos) {
  const grid = document.getElementById('videosGrid');
  const empty = document.getElementById('videosEmpty');

  if (videos.length === 0) {
    grid.classList.add('hidden');
    empty.classList.remove('hidden');
    return;
  }

  grid.classList.remove('hidden');
  empty.classList.add('hidden');

  grid.innerHTML = videos.map(video => `
    <div class="memory-card" onclick="openMediaViewer('${video.id}')">
      <div class="media-wrapper">
        <div style="width:100%;height:100%;background:#1a1a2e;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:48px">🎬</span>
        </div>
        <div class="play-overlay">
          <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
      </div>
      <div class="card-info">
        <div class="card-title">${video.title}</div>
        <div class="card-date">${formatMemoryDate(video.createdAt)}</div>
      </div>
    </div>
  `).join('');
}

function renderAudioList(audioItems) {
  const list = document.getElementById('audioList');
  const empty = document.getElementById('audioEmpty');

  if (audioItems.length === 0) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  list.innerHTML = audioItems.map(audio => `
    <div class="audio-card">
      <div class="audio-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
      </div>
      <div class="audio-info">
        <div class="audio-title">${audio.title}</div>
        <div class="audio-duration">${formatMemoryDate(audio.createdAt)}</div>
      </div>
      <button class="audio-play-btn" onclick="playAudio('${audio.id}')">
        <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      </button>
      <button style="color:var(--color-danger);padding:8px;" onclick="deleteMemoryItem('${audio.id}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </div>
  `).join('');
}

// ---- Upload Modal ----
function showUploadModal(type) {
  currentMemoryType = type || 'photo';
  document.getElementById('uploadModal').classList.add('active');
  uploadedFileData = null;
  document.getElementById('memoryTitle').value = '';
  document.getElementById('memoryDesc').value = '';
  document.getElementById('uploadPreview').classList.add('hidden');
}

function closeUploadModal() {
  document.getElementById('uploadModal').classList.remove('active');
}

function toggleTag(el) {
  el.classList.toggle('active');
  const tag = el.dataset.tag;
  if (el.classList.contains('active')) {
    selectedTags.push(tag);
  } else {
    selectedTags = selectedTags.filter(t => t !== tag);
  }
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Determine type
  if (file.type.startsWith('image/')) currentMemoryType = 'photo';
  else if (file.type.startsWith('video/')) currentMemoryType = 'video';
  else if (file.type.startsWith('audio/')) currentMemoryType = 'audio';

  const preview = document.getElementById('uploadPreview');
  const previewImg = document.getElementById('previewImage');
  const previewName = document.getElementById('previewFilename');
  
  preview.classList.remove('hidden');
  previewName.textContent = file.name;

  // Read as data URL for local storage
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedFileData = e.target.result;
    
    if (file.type.startsWith('image/')) {
      previewImg.src = uploadedFileData;
      previewImg.style.display = 'block';
    } else {
      previewImg.style.display = 'none';
    }
  };

  // For images, compress before storing
  if (file.type.startsWith('image/')) {
    compressImage(file, (dataUrl) => {
      uploadedFileData = dataUrl;
      previewImg.src = dataUrl;
      previewImg.style.display = 'block';
    });
  } else {
    reader.readAsDataURL(file);
  }
}

function compressImage(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX = 600;
      let w = img.width, h = img.height;
      if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } }
      else { if (h > MAX) { w *= MAX / h; h = MAX; } }
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      callback(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function saveMemory() {
  const title = document.getElementById('memoryTitle').value.trim();
  if (!title) {
    showToast('Please enter a title for this memory', 'warning');
    return;
  }

  const desc = document.getElementById('memoryDesc').value.trim();

  const memory = {
    title,
    description: desc,
    type: currentMemoryType,
    tags: [...selectedTags],
    dataUrl: uploadedFileData,
    uploadedBy: db.getUser().role || 'patient'
  };

  db.addMemory(memory);

  // Complete daily task
  const tasks = db.getDailyTasks();
  const memTask = tasks.find(t => t.type === 'memory' && !t.completed);
  if (memTask) db.completeDailyTask(memTask.id);

  closeUploadModal();
  loadMemories();
  showToast('Memory saved! 📸', 'success');
}

function deleteMemoryItem(id) {
  if (confirm('Remove this memory?')) {
    db.deleteMemory(id);
    loadMemories();
    showToast('Memory removed', 'info');
  }
}

// ---- Media Viewer ----
function openMediaViewer(id) {
  const memories = db.getMemories();
  const memory = memories.find(m => m.id === id);
  if (!memory) return;

  const viewer = document.getElementById('mediaViewer');
  const viewerImg = document.getElementById('viewerImage');
  const viewerVideo = document.getElementById('viewerVideo');
  const viewerTitle = document.getElementById('viewerTitle');
  const viewerDesc = document.getElementById('viewerDesc');

  viewerTitle.textContent = memory.title;
  viewerDesc.textContent = memory.description || '';

  if (memory.type === 'photo' && memory.dataUrl) {
    viewerImg.src = memory.dataUrl;
    viewerImg.style.display = 'block';
    viewerVideo.style.display = 'none';
  } else if (memory.type === 'video' && memory.dataUrl) {
    viewerVideo.src = memory.dataUrl;
    viewerVideo.style.display = 'block';
    viewerImg.style.display = 'none';
  } else {
    // Placeholder
    viewerImg.src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300' fill='%23FFF8F0'><rect width='300' height='300'/><text x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='48'>📸</text></svg>`;
    viewerImg.style.display = 'block';
    viewerVideo.style.display = 'none';
  }

  viewer.classList.add('active');
}

function closeMediaViewer() {
  const viewer = document.getElementById('mediaViewer');
  const viewerVideo = document.getElementById('viewerVideo');
  viewer.classList.remove('active');
  viewerVideo.pause();
}

function playAudio(id) {
  const memories = db.getMemories();
  const memory = memories.find(m => m.id === id);
  if (!memory || !memory.dataUrl) {
    showToast('Audio file not available', 'warning');
    return;
  }
  const audio = new Audio(memory.dataUrl);
  audio.play();
}

// ---- Utilities ----
function formatMemoryDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ---- Add demo memories ----
function addDemoMemories() {
  const memories = db.getMemories();
  if (memories.length > 0) return;

  const demoPhotos = [
    { title: 'Sunday Family Dinner', description: 'Everyone was there — great food and laughter!', type: 'photo', tags: ['family', 'food'] },
    { title: 'Beach Walk', description: 'Beautiful sunset by the shore', type: 'photo', tags: ['nature', 'travel'] },
    { title: 'Birthday Celebration', description: 'My 70th birthday party', type: 'photo', tags: ['celebration', 'family'] },
    { title: 'Garden Morning', description: 'The flowers were blooming so beautifully', type: 'photo', tags: ['nature'] },
    { title: 'Christmas Eve', description: 'The whole family gathered together', type: 'photo', tags: ['family', 'celebration'] },
    { title: 'Old Friends Reunion', description: 'So happy to see everyone again', type: 'photo', tags: ['friends'] }
  ];

  demoPhotos.forEach(p => db.addMemory(p));
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  addDemoMemories();
  loadMemories();
});
