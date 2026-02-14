/* ============================================
   AUREA — Walkthrough / Onboarding Guide
   Tooltip-based dashboard tour with skip
   ============================================ */

const WALKTHROUGH_STEPS = [
  {
    target: '.dashboard-header',
    title: 'Welcome to Aurea! 🌟',
    text: 'This is your care dashboard. Here you can see your daily greeting and access your profile.',
    position: 'bottom'
  },
  {
    target: '.emotion-status',
    title: 'Emotion Check-In',
    text: 'Tap here to track how you\'re feeling. Aurea can detect your emotions and alert your caregiver if needed.',
    position: 'bottom'
  },
  {
    target: '.daily-goals-card',
    title: 'Daily Goals',
    text: 'Track your daily progress here — complete tasks like brain games, emotion check-ins, and memory activities.',
    position: 'bottom'
  },
  {
    target: '.quick-actions-grid',
    title: 'Quick Actions',
    text: 'Access brain games, emotion tracking, reminders, and memories with one tap.',
    position: 'top'
  },
  {
    target: '.bottom-nav',
    title: 'Navigation',
    text: 'Use the bottom bar to move between Home, Brain Games, Memories, Alerts, and your Profile.',
    position: 'top'
  }
];

let walkthroughStep = 0;
let walkthroughOverlay = null;
let walkthroughTooltip = null;

function shouldShowWalkthrough() {
  return !localStorage.getItem('aurea_walkthrough_done');
}

function startWalkthrough() {
  walkthroughStep = 0;

  // Create overlay
  walkthroughOverlay = document.createElement('div');
  walkthroughOverlay.className = 'walkthrough-overlay';
  walkthroughOverlay.id = 'walkthroughOverlay';
  document.body.appendChild(walkthroughOverlay);

  // Create tooltip container
  walkthroughTooltip = document.createElement('div');
  walkthroughTooltip.className = 'walkthrough-tooltip';
  walkthroughTooltip.id = 'walkthroughTooltip';
  document.body.appendChild(walkthroughTooltip);

  showWalkthroughStep();
}

function showWalkthroughStep() {
  if (walkthroughStep >= WALKTHROUGH_STEPS.length) {
    endWalkthrough();
    return;
  }

  const step = WALKTHROUGH_STEPS[walkthroughStep];
  const target = document.querySelector(step.target);

  if (!target) {
    walkthroughStep++;
    showWalkthroughStep();
    return;
  }

  // Scroll target into view
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });

  setTimeout(() => {
    // Highlight target
    const rect = target.getBoundingClientRect();
    const pad = 8;

    // Update overlay to create spotlight effect
    walkthroughOverlay.style.cssText = '';

    // Remove old spotlight
    const oldSpot = document.getElementById('walkthroughSpotlight');
    if (oldSpot) oldSpot.remove();

    const spotlight = document.createElement('div');
    spotlight.className = 'walkthrough-spotlight';
    spotlight.id = 'walkthroughSpotlight';
    spotlight.style.left = (rect.left - pad) + 'px';
    spotlight.style.top = (rect.top - pad) + 'px';
    spotlight.style.width = (rect.width + pad * 2) + 'px';
    spotlight.style.height = (rect.height + pad * 2) + 'px';
    document.body.appendChild(spotlight);

    // Position tooltip
    const tooltip = walkthroughTooltip;
    const dots = WALKTHROUGH_STEPS.map((_, i) =>
      `<div class="walkthrough-dot ${i === walkthroughStep ? 'active' : ''}"></div>`
    ).join('');

    tooltip.innerHTML = `
      <h3>${step.title}</h3>
      <p>${step.text}</p>
      <div class="walkthrough-footer">
        <div class="walkthrough-dots">${dots}</div>
        <div class="walkthrough-actions">
          <button class="btn btn-ghost" onclick="endWalkthrough()" style="font-size:var(--font-size-sm);padding:8px 14px;">Skip</button>
          <button class="btn btn-primary" onclick="nextWalkthroughStep()" style="font-size:var(--font-size-sm);padding:8px 14px;">
            ${walkthroughStep < WALKTHROUGH_STEPS.length - 1 ? 'Next' : 'Done!'}
          </button>
        </div>
      </div>
    `;

    // Position: below or above target
    const tooltipWidth = Math.min(320, window.innerWidth - 40);
    tooltip.style.width = tooltipWidth + 'px';

    if (step.position === 'bottom') {
      tooltip.style.top = (rect.bottom + pad + 12) + 'px';
      tooltip.style.bottom = 'auto';
    } else {
      tooltip.style.top = 'auto';
      tooltip.style.bottom = (window.innerHeight - rect.top + pad + 12) + 'px';
    }

    // Center horizontally
    const left = Math.max(20, Math.min(
      window.innerWidth - tooltipWidth - 20,
      rect.left + rect.width / 2 - tooltipWidth / 2
    ));
    tooltip.style.left = left + 'px';

  }, 350);
}

function nextWalkthroughStep() {
  walkthroughStep++;
  showWalkthroughStep();
}

function endWalkthrough() {
  localStorage.setItem('aurea_walkthrough_done', 'true');

  // Remove elements
  const overlay = document.getElementById('walkthroughOverlay');
  const tooltip = document.getElementById('walkthroughTooltip');
  const spot = document.getElementById('walkthroughSpotlight');

  if (overlay) overlay.remove();
  if (tooltip) tooltip.remove();
  if (spot) spot.remove();

  walkthroughOverlay = null;
  walkthroughTooltip = null;
}

// Auto-start on dashboard load
document.addEventListener('DOMContentLoaded', () => {
  // Slight delay to let dashboard render first
  setTimeout(() => {
    if (shouldShowWalkthrough()) {
      startWalkthrough();
    }
  }, 1500);
});
