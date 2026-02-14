/* ============================================
   AUREA — Cognitive Games Controller
   20 Brain Training Games
   ============================================ */

let currentGame = null;
let gameTimer = null;
let gameSeconds = 0;
let gameScore = 0;
let gameMoves = 0;

// ---- Game Definitions ----
const GAMES = [
  { id: 'memory-match', title: 'Memory Match', icon: '🃏', category: 'memory', difficulty: 'Easy', desc: 'Find matching pairs' },
  { id: 'word-search', title: 'Word Search', icon: '🔤', category: 'language', difficulty: 'Medium', desc: 'Find hidden words' },
  { id: 'sequence', title: 'Sequence Recall', icon: '🔢', category: 'memory', difficulty: 'Medium', desc: 'Remember the pattern' },
  { id: 'trivia', title: 'Daily Trivia', icon: '❓', category: 'language', difficulty: 'Easy', desc: 'Test your knowledge' },
  { id: 'jigsaw', title: 'Jigsaw Puzzle', icon: '🧩', category: 'problem', difficulty: 'Easy', desc: 'Put pieces together' },
  { id: 'spot-diff', title: 'Spot the Difference', icon: '🔍', category: 'attention', difficulty: 'Medium', desc: 'Find the differences' },
  { id: 'sudoku', title: 'Sudoku Lite', icon: '🔢', category: 'problem', difficulty: 'Medium', desc: '4×4 number puzzle' },
  { id: 'pattern', title: 'Pattern Match', icon: '🔷', category: 'attention', difficulty: 'Easy', desc: 'What comes next?' },
  { id: 'sorting', title: 'Category Sort', icon: '📦', category: 'problem', difficulty: 'Easy', desc: 'Sort into groups' },
  { id: 'reaction', title: 'Reaction Time', icon: '⚡', category: 'attention', difficulty: 'Easy', desc: 'How fast can you tap?' },
  { id: 'color-match', title: 'Color Match', icon: '🎨', category: 'attention', difficulty: 'Medium', desc: 'Match the color, not the word' },
  { id: 'math-quiz', title: 'Math Quiz', icon: '➕', category: 'problem', difficulty: 'Easy', desc: 'Solve simple math' },
  { id: 'emoji-pairs', title: 'Emoji Pairs', icon: '😊', category: 'memory', difficulty: 'Easy', desc: 'Match emoji pairs' },
  { id: 'word-scramble', title: 'Word Scramble', icon: '🔠', category: 'language', difficulty: 'Medium', desc: 'Unscramble the word' },
  { id: 'counting', title: 'Quick Count', icon: '🔢', category: 'attention', difficulty: 'Easy', desc: 'Count the objects' },
  { id: 'shape-match', title: 'Shape Match', icon: '🔶', category: 'attention', difficulty: 'Easy', desc: 'Find the matching shape' },
  { id: 'true-false', title: 'True or False', icon: '✅', category: 'language', difficulty: 'Easy', desc: 'Is the fact true?' },
  { id: 'missing-num', title: 'Missing Number', icon: '🔍', category: 'problem', difficulty: 'Medium', desc: 'Find the missing number' },
  { id: 'odd-one-out', title: 'Odd One Out', icon: '🎯', category: 'attention', difficulty: 'Easy', desc: 'Which one is different?' },
  { id: 'clock-read', title: 'Clock Reading', icon: '🕐', category: 'problem', difficulty: 'Medium', desc: 'What time is it?' }
];

// ---- Render Game Hub ----
function renderGamesHub(filter = 'all') {
  const grid = document.getElementById('gamesGrid');
  if (!grid) return;

  const filtered = filter === 'all' ? GAMES : GAMES.filter(g => g.category === filter);

  grid.innerHTML = filtered.map(game => {
    const best = db.getBestScore(game.id);
    return `
      <div class="game-card" data-category="${game.category}" onclick="startGame('${game.id}')">
        <div class="game-icon">${game.icon}</div>
        <div class="game-title">${game.title}</div>
        <div class="game-difficulty">${game.difficulty}</div>
        ${best > 0 ? `<div class="game-score">Best: ${best}</div>` : ''}
      </div>
    `;
  }).join('');
}

function filterGames(category, el) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  renderGamesHub(category);
}

// ---- Game Lifecycle ----
function startGame(gameId) {
  currentGame = gameId;
  gameScore = 0;
  gameMoves = 0;
  gameSeconds = 0;

  document.getElementById('gamesGrid').parentElement.querySelector('.page-header').classList.add('hidden');
  document.querySelector('.text-body')?.classList.add('hidden');
  document.querySelector('[style*="overflow-x"]')?.classList.add('hidden');
  document.getElementById('gamesGrid').classList.add('hidden');
  document.getElementById('gamePlayArea').classList.remove('hidden');
  document.getElementById('gameCompleteArea').classList.add('hidden');
  document.getElementById('bottomNav').style.display = 'none';

  updateScoreDisplay();
  startTimer();

  // Launch the game
  const board = document.getElementById('gameBoard');
  switch (gameId) {
    case 'memory-match': initMemoryMatch(board); break;
    case 'word-search': initWordSearch(board); break;
    case 'sequence': initSequence(board); break;
    case 'trivia': initTrivia(board); break;
    case 'jigsaw': initJigsaw(board); break;
    case 'spot-diff': initSpotDiff(board); break;
    case 'sudoku': initSudoku(board); break;
    case 'pattern': initPattern(board); break;
    case 'sorting': initSorting(board); break;
    case 'reaction': initReaction(board); break;
    case 'color-match': initColorMatch(board); break;
    case 'math-quiz': initMathQuiz(board); break;
    case 'emoji-pairs': initEmojiPairs(board); break;
    case 'word-scramble': initWordScramble(board); break;
    case 'counting': initCounting(board); break;
    case 'shape-match': initShapeMatch(board); break;
    case 'true-false': initTrueFalse(board); break;
    case 'missing-num': initMissingNumber(board); break;
    case 'odd-one-out': initOddOneOut(board); break;
    case 'clock-read': initClockReading(board); break;
  }
}

function exitGame() {
  stopTimer();
  currentGame = null;

  document.getElementById('gamesGrid').parentElement.querySelector('.page-header').classList.remove('hidden');
  document.querySelector('.text-body')?.classList.remove('hidden');
  document.querySelector('[style*="overflow-x"]')?.classList.remove('hidden');
  document.getElementById('gamesGrid').classList.remove('hidden');
  document.getElementById('gamePlayArea').classList.add('hidden');
  document.getElementById('gameCompleteArea').classList.add('hidden');
  document.getElementById('bottomNav').style.display = '';

  renderGamesHub();
}

function completeGame() {
  stopTimer();
  
  db.saveGameScore(currentGame, gameScore);

  // Complete daily task
  const tasks = db.getDailyTasks();
  const gameTask = tasks.find(t => t.type === 'game' && !t.completed);
  if (gameTask) db.completeDailyTask(gameTask.id);

  document.getElementById('gamePlayArea').classList.add('hidden');
  document.getElementById('gameCompleteArea').classList.remove('hidden');
  document.getElementById('finalScore').textContent = gameScore;
  document.getElementById('finalTime').textContent = formatTimer(gameSeconds);
  document.getElementById('finalMoves').textContent = gameMoves;
}

function replayGame() {
  const gameId = currentGame;
  document.getElementById('gameCompleteArea').classList.add('hidden');
  startGame(gameId);
}

// ---- Timer ----
function startTimer() {
  gameSeconds = 0;
  updateTimerDisplay();
  gameTimer = setInterval(() => {
    gameSeconds++;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  clearInterval(gameTimer);
  gameTimer = null;
}

function updateTimerDisplay() {
  document.getElementById('timerDisplay').textContent = formatTimer(gameSeconds);
}

function formatTimer(s) {
  return Math.floor(s / 60) + ':' + (s % 60).toString().padStart(2, '0');
}

function updateScoreDisplay() {
  document.getElementById('scoreDisplay').textContent = gameScore;
}

/* ============================================
   GAME 1: Memory Match
   ============================================ */
let matchState = { cards: [], flipped: [], matched: 0, locked: false };

function initMemoryMatch(board) {
  const emojis = ['🌟', '🌈', '🦋', '🌺', '🐶', '🎵'];
  const pairs = [...emojis, ...emojis];
  shuffleArray(pairs);

  matchState = { cards: pairs, flipped: [], matched: 0, locked: false };

  board.innerHTML = `
    <div class="match-grid size-4x3" id="matchGrid">
      ${pairs.map((emoji, i) => `
        <div class="match-card" data-index="${i}" onclick="flipCard(${i})">
          <div class="match-card-inner">
            <div class="match-card-front">✦</div>
            <div class="match-card-back">${emoji}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function flipCard(index) {
  if (matchState.locked) return;
  const card = document.querySelector(`.match-card[data-index="${index}"]`);
  if (!card || card.classList.contains('flipped') || card.classList.contains('matched')) return;

  card.classList.add('flipped');
  matchState.flipped.push(index);
  gameMoves++;

  if (matchState.flipped.length === 2) {
    matchState.locked = true;
    const [i1, i2] = matchState.flipped;

    if (matchState.cards[i1] === matchState.cards[i2]) {
      // Match!
      setTimeout(() => {
        document.querySelector(`.match-card[data-index="${i1}"]`).classList.add('matched');
        document.querySelector(`.match-card[data-index="${i2}"]`).classList.add('matched');
        matchState.flipped = [];
        matchState.locked = false;
        matchState.matched += 2;
        gameScore += 10;
        updateScoreDisplay();

        if (matchState.matched === matchState.cards.length) {
          gameScore += Math.max(0, 50 - gameSeconds);
          setTimeout(completeGame, 500);
        }
      }, 500);
    } else {
      setTimeout(() => {
        document.querySelector(`.match-card[data-index="${i1}"]`).classList.remove('flipped');
        document.querySelector(`.match-card[data-index="${i2}"]`).classList.remove('flipped');
        matchState.flipped = [];
        matchState.locked = false;
      }, 800);
    }
  }
}

/* ============================================
   GAME 2: Word Search
   ============================================ */
function initWordSearch(board) {
  const words = ['SUN', 'LOVE', 'HAPPY', 'CALM'];
  const size = 8;
  const grid = createWordSearchGrid(size, words);
  wordSelection = [];
  wordsFound = 0;

  board.innerHTML = `
    <div style="margin-bottom:16px">
      <div class="word-list" id="wordList">
        ${words.map(w => `<span class="word" data-word="${w}">${w}</span>`).join('')}
      </div>
    </div>
    <div class="word-grid" id="wordGrid" style="grid-template-columns: repeat(${size}, 1fr);">
      ${grid.flat().map((letter, i) => `
        <div class="word-cell" data-index="${i}" data-row="${Math.floor(i/size)}" data-col="${i%size}" 
             onclick="selectWordCell(this)">${letter}</div>
      `).join('')}
    </div>
    <p class="text-caption text-center mt-md">Tap letters to find the hidden words</p>
  `;
}

function createWordSearchGrid(size, words) {
  const grid = Array(size).fill(null).map(() => Array(size).fill(''));
  
  words.forEach(word => {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 50) {
      attempts++;
      const dir = Math.random() > 0.5 ? 'h' : 'v';
      const row = Math.floor(Math.random() * (dir === 'v' ? size - word.length : size));
      const col = Math.floor(Math.random() * (dir === 'h' ? size - word.length : size));
      
      let canPlace = true;
      for (let k = 0; k < word.length; k++) {
        const r = dir === 'v' ? row + k : row;
        const c = dir === 'h' ? col + k : col;
        if (grid[r][c] !== '' && grid[r][c] !== word[k]) { canPlace = false; break; }
      }
      
      if (canPlace) {
        for (let k = 0; k < word.length; k++) {
          const r = dir === 'v' ? row + k : row;
          const c = dir === 'h' ? col + k : col;
          grid[r][c] = word[k];
        }
        placed = true;
      }
    }
  });

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') grid[r][c] = letters[Math.floor(Math.random() * 26)];
    }
  }
  return grid;
}

let wordSelection = [];
let wordsFound = 0;

function selectWordCell(el) {
  el.classList.toggle('selected');
  if (el.classList.contains('selected')) {
    wordSelection.push(el.textContent);
  } else {
    wordSelection = [];
    document.querySelectorAll('.word-cell.selected').forEach(c => {
      wordSelection.push(c.textContent);
    });
  }

  const selectedWord = wordSelection.join('');
  const wordSpans = document.querySelectorAll('.word-list .word:not(.found)');
  
  wordSpans.forEach(span => {
    if (span.dataset.word === selectedWord) {
      span.classList.add('found');
      document.querySelectorAll('.word-cell.selected').forEach(c => {
        c.classList.remove('selected');
        c.classList.add('found');
      });
      wordSelection = [];
      wordsFound++;
      gameScore += 25;
      gameMoves++;
      updateScoreDisplay();

      if (wordsFound >= 4) {
        gameScore += Math.max(0, 50 - gameSeconds);
        setTimeout(completeGame, 500);
      }
    }
  });
}

/* ============================================
   GAME 3: Sequence Recall (Simon-like)
   ============================================ */
let seqState = { sequence: [], playerIndex: 0, showing: false };

function initSequence(board) {
  seqState = { sequence: [], playerIndex: 0, showing: false };

  board.innerHTML = `
    <p class="text-body text-center mb-lg" id="seqInstruction">Watch the sequence, then repeat it!</p>
    <div class="sequence-display" id="seqDisplay">
      <button class="sequence-btn red" data-color="red" onclick="seqPlayerTap('red')"></button>
      <button class="sequence-btn blue" data-color="blue" onclick="seqPlayerTap('blue')"></button>
      <button class="sequence-btn green" data-color="green" onclick="seqPlayerTap('green')"></button>
      <button class="sequence-btn yellow" data-color="yellow" onclick="seqPlayerTap('yellow')"></button>
    </div>
    <p class="text-caption text-center mt-lg">Level: <strong id="seqLevel">1</strong></p>
  `;

  setTimeout(() => addToSequence(), 1000);
}

function addToSequence() {
  const colors = ['red', 'blue', 'green', 'yellow'];
  seqState.sequence.push(colors[Math.floor(Math.random() * 4)]);
  seqState.playerIndex = 0;
  document.getElementById('seqLevel').textContent = seqState.sequence.length;
  playSequence();
}

function playSequence() {
  seqState.showing = true;
  document.getElementById('seqInstruction').textContent = 'Watch carefully...';
  
  let i = 0;
  const interval = setInterval(() => {
    if (i >= seqState.sequence.length) {
      clearInterval(interval);
      seqState.showing = false;
      document.getElementById('seqInstruction').textContent = 'Your turn! Repeat the sequence';
      return;
    }
    highlightSeqBtn(seqState.sequence[i]);
    i++;
  }, 700);
}

function highlightSeqBtn(color) {
  const btn = document.querySelector(`.sequence-btn.${color}`);
  btn.classList.add('active');
  setTimeout(() => btn.classList.remove('active'), 400);
}

function seqPlayerTap(color) {
  if (seqState.showing) return;
  
  highlightSeqBtn(color);
  gameMoves++;

  if (color === seqState.sequence[seqState.playerIndex]) {
    seqState.playerIndex++;
    if (seqState.playerIndex === seqState.sequence.length) {
      gameScore += seqState.sequence.length * 10;
      updateScoreDisplay();
      
      if (seqState.sequence.length >= 8) {
        setTimeout(completeGame, 500);
      } else {
        document.getElementById('seqInstruction').textContent = 'Great! Watch the next one...';
        setTimeout(addToSequence, 1000);
      }
    }
  } else {
    document.getElementById('seqInstruction').textContent = 'Oops! Game over. Nice try!';
    setTimeout(completeGame, 1000);
  }
}

/* ============================================
   GAME 4: Trivia Quiz
   ============================================ */
const TRIVIA_QUESTIONS = [
  { q: "What is the capital of the Philippines?", options: ["Manila", "Cebu", "Davao", "Quezon City"], answer: 0 },
  { q: "How many days are in a week?", options: ["5", "6", "7", "8"], answer: 2 },
  { q: "What color is the sky on a clear day?", options: ["Green", "Blue", "Red", "Yellow"], answer: 1 },
  { q: "Which animal says 'Meow'?", options: ["Dog", "Bird", "Cat", "Fish"], answer: 2 },
  { q: "What do you drink to stay hydrated?", options: ["Juice", "Water", "Milk", "Coffee"], answer: 1 },
  { q: "How many months are in a year?", options: ["10", "11", "12", "13"], answer: 2 },
  { q: "What meal do you eat in the morning?", options: ["Lunch", "Dinner", "Breakfast", "Snack"], answer: 2 },
  { q: "What shape is a ball?", options: ["Square", "Triangle", "Circle", "Rectangle"], answer: 2 },
  { q: "What do trees produce that we breathe?", options: ["Water", "Oxygen", "Food", "Noise"], answer: 1 },
  { q: "What is 2 + 3?", options: ["4", "5", "6", "7"], answer: 1 }
];

let triviaState = { questions: [], current: 0, answered: false };

function initTrivia(board) {
  triviaState.questions = shuffleArray([...TRIVIA_QUESTIONS]).slice(0, 5);
  triviaState.current = 0;
  triviaState.answered = false;
  renderTriviaQuestion(board);
}

function renderTriviaQuestion(board) {
  const q = triviaState.questions[triviaState.current];
  if (!q) { completeGame(); return; }

  board.innerHTML = `
    <p class="text-caption text-center mb-md">Question ${triviaState.current + 1} of ${triviaState.questions.length}</p>
    <div class="trivia-question">${q.q}</div>
    <div class="trivia-options" id="triviaOptions">
      ${q.options.map((opt, i) => `
        <button class="trivia-option" onclick="answerTrivia(${i})">${opt}</button>
      `).join('')}
    </div>
  `;
  triviaState.answered = false;
}

function answerTrivia(index) {
  if (triviaState.answered) return;
  triviaState.answered = true;
  gameMoves++;

  const q = triviaState.questions[triviaState.current];
  const options = document.querySelectorAll('.trivia-option');

  options[q.answer].classList.add('correct');
  if (index !== q.answer) {
    options[index].classList.add('wrong');
  } else {
    gameScore += 20;
    updateScoreDisplay();
  }

  setTimeout(() => {
    triviaState.current++;
    if (triviaState.current >= triviaState.questions.length) {
      completeGame();
    } else {
      renderTriviaQuestion(document.getElementById('gameBoard'));
    }
  }, 1200);
}

/* ============================================
   GAME 5: Jigsaw Puzzle (Sliding Puzzle)
   ============================================ */
function initJigsaw(board) {
  const size = 3;
  let tiles = Array.from({ length: size * size - 1 }, (_, i) => i + 1);
  tiles.push(0); // empty
  
  // Shuffle (ensure solvable)
  for (let i = 0; i < 100; i++) {
    const emptyIdx = tiles.indexOf(0);
    const moves = getJigsawMoves(emptyIdx, size);
    const pick = moves[Math.floor(Math.random() * moves.length)];
    [tiles[emptyIdx], tiles[pick]] = [tiles[pick], tiles[emptyIdx]];
  }

  const emojis = ['🌟', '🌈', '🦋', '🌺', '🐶', '🎵', '🌻', '🍎'];

  board.innerHTML = `
    <p class="text-caption text-center mb-md">Tap a tile next to the empty space to slide it</p>
    <div class="jigsaw-container" id="jigsawGrid" style="grid-template-columns: repeat(${size}, 1fr);">
      ${tiles.map((tile, i) => `
        <div class="jigsaw-piece ${tile === 0 ? 'empty' : ''}" 
             data-index="${i}" data-tile="${tile}"
             onclick="slideJigsaw(${i})"
             style="background: ${tile === 0 ? 'transparent' : 'var(--color-bg-card)'}; 
                    display: flex; align-items: center; justify-content: center;
                    font-size: 28px; font-weight: 700; aspect-ratio: 1;
                    box-shadow: ${tile === 0 ? 'none' : 'var(--shadow-sm)'};">
          ${tile === 0 ? '' : emojis[tile - 1] || tile}
        </div>
      `).join('')}
    </div>
  `;

  window._jigsawTiles = tiles;
  window._jigsawSize = size;
}

function getJigsawMoves(emptyIdx, size) {
  const moves = [];
  const row = Math.floor(emptyIdx / size);
  const col = emptyIdx % size;
  if (row > 0) moves.push(emptyIdx - size);
  if (row < size - 1) moves.push(emptyIdx + size);
  if (col > 0) moves.push(emptyIdx - 1);
  if (col < size - 1) moves.push(emptyIdx + 1);
  return moves;
}

function slideJigsaw(index) {
  const tiles = window._jigsawTiles;
  const size = window._jigsawSize;
  const emptyIdx = tiles.indexOf(0);
  const moves = getJigsawMoves(emptyIdx, size);

  if (!moves.includes(index)) return;

  [tiles[emptyIdx], tiles[index]] = [tiles[index], tiles[emptyIdx]];
  gameMoves++;
  
  // Re-render
  const emojis = ['🌟', '🌈', '🦋', '🌺', '🐶', '🎵', '🌻', '🍎'];
  const grid = document.getElementById('jigsawGrid');
  grid.innerHTML = tiles.map((tile, i) => `
    <div class="jigsaw-piece ${tile === 0 ? 'empty' : ''}" 
         data-index="${i}" data-tile="${tile}"
         onclick="slideJigsaw(${i})"
         style="background: ${tile === 0 ? 'transparent' : 'var(--color-bg-card)'}; 
                display: flex; align-items: center; justify-content: center;
                font-size: 28px; font-weight: 700; aspect-ratio: 1;
                box-shadow: ${tile === 0 ? 'none' : 'var(--shadow-sm)'};">
      ${tile === 0 ? '' : emojis[tile - 1] || tile}
    </div>
  `).join('');

  // Check win
  const solved = tiles.every((t, i) => i === tiles.length - 1 ? t === 0 : t === i + 1);
  if (solved) {
    gameScore = 100 + Math.max(0, 50 - gameMoves);
    setTimeout(completeGame, 500);
  }
}

/* ============================================
   GAME 6: Spot the Difference
   ============================================ */
function initSpotDiff(board) {
  const shapes = [
    { x: 30, y: 30, type: 'circle', color: '#FF7675', size: 25 },
    { x: 80, y: 50, type: 'rect', color: '#74B9FF', size: 30 },
    { x: 50, y: 80, type: 'circle', color: '#00B894', size: 20 },
    { x: 20, y: 60, type: 'rect', color: '#FDCB6E', size: 22 },
    { x: 70, y: 25, type: 'circle', color: '#A29BFE', size: 18 }
  ];

  // Pick 2 shapes to change
  const diffIndices = [1, 3];
  const modifiedShapes = shapes.map((s, i) => {
    if (diffIndices.includes(i)) {
      return { ...s, color: i === 1 ? '#E17055' : '#6C5CE7' };
    }
    return s;
  });

  let found = 0;
  window._spotDiffs = diffIndices;
  window._spotFound = [];

  board.innerHTML = `
    <p class="text-caption text-center mb-md">Find <strong>2</strong> differences between the images</p>
    <div class="spot-container">
      <div class="spot-image" id="spotLeft">
        <canvas id="canvasLeft" width="200" height="200"></canvas>
      </div>
      <div class="spot-image" id="spotRight" onclick="spotClick(event)">
        <canvas id="canvasRight" width="200" height="200"></canvas>
      </div>
    </div>
    <p class="text-caption text-center">Found: <strong id="spotCount">0</strong> / 2</p>
  `;

  // Draw canvases
  setTimeout(() => {
    drawSpotCanvas('canvasLeft', shapes);
    drawSpotCanvas('canvasRight', modifiedShapes);
  }, 100);

  window._spotShapes = modifiedShapes;
}

function drawSpotCanvas(canvasId, shapes) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth * 2;
  canvas.height = canvas.offsetHeight * 2;
  ctx.scale(2, 2);
  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight;

  ctx.fillStyle = '#FFF8F0';
  ctx.fillRect(0, 0, w, h);

  shapes.forEach(s => {
    ctx.fillStyle = s.color;
    const px = (s.x / 100) * w;
    const py = (s.y / 100) * h;
    if (s.type === 'circle') {
      ctx.beginPath();
      ctx.arc(px, py, s.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(px - s.size / 2, py - s.size / 2, s.size, s.size);
    }
  });
}

function spotClick(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  gameMoves++;

  const shapes = window._spotShapes;
  const diffs = window._spotDiffs;

  diffs.forEach((di, idx) => {
    if (window._spotFound.includes(di)) return;
    const s = shapes[di];
    const dist = Math.sqrt((x - s.x) ** 2 + (y - s.y) ** 2);
    if (dist < 15) {
      window._spotFound.push(di);
      gameScore += 25;
      updateScoreDisplay();
      document.getElementById('spotCount').textContent = window._spotFound.length;

      // Add marker
      const marker = document.createElement('div');
      marker.className = 'spot-marker';
      marker.style.left = s.x + '%';
      marker.style.top = s.y + '%';
      document.getElementById('spotRight').appendChild(marker);

      if (window._spotFound.length >= 2) {
        gameScore += Math.max(0, 30 - gameSeconds);
        setTimeout(completeGame, 800);
      }
    }
  });
}

/* ============================================
   GAME 7: Sudoku Lite (4×4)
   ============================================ */
function initSudoku(board) {
  // Pre-made 4x4 puzzle
  const solution = [
    [1,2,3,4],
    [3,4,1,2],
    [2,1,4,3],
    [4,3,2,1]
  ];

  // Remove some cells
  const puzzle = solution.map(row => [...row]);
  const blanks = [[0,1],[0,3],[1,0],[1,2],[2,1],[2,3],[3,0],[3,2]];
  blanks.forEach(([r,c]) => puzzle[r][c] = 0);

  window._sudokuSolution = solution;
  window._sudokuPuzzle = puzzle;
  window._sudokuSelected = null;

  board.innerHTML = `
    <p class="text-caption text-center mb-md">Fill in the 4×4 grid (each row & column has 1-4)</p>
    <div class="sudoku-grid" id="sudokuGrid">
      ${puzzle.flat().map((val, i) => {
        const r = Math.floor(i / 4), c = i % 4;
        return `<div class="sudoku-cell ${val !== 0 ? 'fixed' : ''}" 
                     data-row="${r}" data-col="${c}" data-index="${i}"
                     onclick="selectSudokuCell(${r}, ${c})">
          ${val || ''}
        </div>`;
      }).join('')}
    </div>
    <div class="sudoku-numpad" id="sudokuNumpad">
      ${[1,2,3,4].map(n => `<button onclick="placeSudokuNum(${n})">${n}</button>`).join('')}
      <button onclick="placeSudokuNum(0)" style="color:var(--color-danger)">✕</button>
    </div>
  `;
}

function selectSudokuCell(r, c) {
  if (window._sudokuPuzzle[r][c] !== 0 && window._sudokuSolution[r][c] === window._sudokuPuzzle[r][c]) {
    // Fixed cell that was given — check if it's original fixed
    const blanks = [[0,1],[0,3],[1,0],[1,2],[2,1],[2,3],[3,0],[3,2]];
    const isBlank = blanks.some(([br, bc]) => br === r && bc === c);
    if (!isBlank) return;
  }
  
  document.querySelectorAll('.sudoku-cell').forEach(c => c.classList.remove('selected'));
  const cell = document.querySelector(`.sudoku-cell[data-row="${r}"][data-col="${c}"]`);
  if (cell && !cell.classList.contains('fixed')) {
    cell.classList.add('selected');
    window._sudokuSelected = { r, c };
  }
}

function placeSudokuNum(num) {
  if (!window._sudokuSelected) return;
  const { r, c } = window._sudokuSelected;
  window._sudokuPuzzle[r][c] = num;
  gameMoves++;

  const cell = document.querySelector(`.sudoku-cell[data-row="${r}"][data-col="${c}"]`);
  cell.textContent = num || '';
  cell.classList.remove('error', 'selected');

  if (num !== 0 && num !== window._sudokuSolution[r][c]) {
    cell.classList.add('error');
  }

  // Check completion
  const complete = window._sudokuPuzzle.flat().every((v, i) => v === window._sudokuSolution.flat()[i]);
  if (complete) {
    gameScore = 100 + Math.max(0, 60 - gameSeconds);
    updateScoreDisplay();
    setTimeout(completeGame, 500);
  }

  window._sudokuSelected = null;
}

/* ============================================
   GAME 8: Pattern Recognition
   ============================================ */
function initPattern(board) {
  const patterns = [
    { seq: ['🔴','🔵','🔴','🔵','🔴'], answer: '🔵', options: ['🔵','🟢','🔴','🟡'] },
    { seq: ['⭐','⭐','🌙','⭐','⭐'], answer: '🌙', options: ['⭐','🌙','☀️','🌟'] },
    { seq: ['🐶','🐱','🐶','🐱','🐶'], answer: '🐱', options: ['🐶','🐱','🐰','🐸'] },
    { seq: ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣'], answer: '6️⃣', options: ['6️⃣','7️⃣','5️⃣','4️⃣'] },
    { seq: ['🌺','🌻','🌹','🌺','🌻'], answer: '🌹', options: ['🌺','🌻','🌹','🌷'] }
  ];

  window._patternData = shuffleArray([...patterns]);
  window._patternIndex = 0;
  renderPattern(board);
}

function renderPattern(board) {
  if (window._patternIndex >= window._patternData.length) {
    completeGame();
    return;
  }

  const p = window._patternData[window._patternIndex];

  board.innerHTML = `
    <p class="text-caption text-center mb-md">Round ${window._patternIndex + 1} of ${window._patternData.length}</p>
    <p class="text-h3 text-center mb-lg">What comes next?</p>
    <div class="pattern-display">
      ${p.seq.map(s => `<div class="pattern-item">${s}</div>`).join('')}
      <div class="pattern-item mystery">?</div>
    </div>
    <div class="pattern-options mt-lg">
      ${shuffleArray([...p.options]).map(opt => `
        <div class="pattern-option" onclick="answerPattern('${opt}', '${p.answer}', this)">${opt}</div>
      `).join('')}
    </div>
  `;
}

function answerPattern(selected, answer, el) {
  gameMoves++;
  document.querySelectorAll('.pattern-option').forEach(o => o.style.pointerEvents = 'none');

  if (selected === answer) {
    el.classList.add('correct');
    gameScore += 20;
    updateScoreDisplay();
  } else {
    el.classList.add('wrong');
    document.querySelectorAll('.pattern-option').forEach(o => {
      if (o.textContent === answer) o.classList.add('correct');
    });
  }

  window._patternIndex++;
  setTimeout(() => renderPattern(document.getElementById('gameBoard')), 1000);
}

/* ============================================
   GAME 9: Category Sorting
   ============================================ */
function initSorting(board) {
  _selectedSortItem = null;
  const categories = [
    { name: 'Fruits 🍎', items: ['Apple', 'Banana', 'Orange', 'Grape'] },
    { name: 'Animals 🐶', items: ['Dog', 'Cat', 'Bird', 'Fish'] }
  ];

  const allItems = shuffleArray(categories.flatMap(c => c.items.map(item => ({ item, category: c.name }))));
  window._sortCategories = categories;
  window._sortItems = allItems;
  window._sortCorrect = 0;
  window._sortTotal = allItems.length;

  board.innerHTML = `
    <p class="text-caption text-center mb-md">Tap an item, then tap the correct category</p>
    <div class="sorting-items" id="sortPool" style="margin-bottom: 20px;">
      ${allItems.map((item, i) => `
        <div class="sorting-item" data-item="${item.item}" data-category="${item.category}" 
             data-index="${i}" onclick="pickSortItem(this)">
          ${item.item}
        </div>
      `).join('')}
    </div>
    <div class="sorting-categories" id="sortCategories">
      ${categories.map(c => `
        <div class="sorting-category" data-name="${c.name}" onclick="dropSortItem('${c.name}')">
          <h4>${c.name}</h4>
          <div class="sorting-items" id="cat-${c.name.replace(/\s/g,'')}"></div>
        </div>
      `).join('')}
    </div>
    <p class="text-caption text-center mt-md">Sorted: <strong id="sortScore">0</strong> / ${allItems.length}</p>
  `;
}

let _selectedSortItem = null;

function pickSortItem(el) {
  document.querySelectorAll('#sortPool .sorting-item').forEach(i => i.style.outline = '');
  el.style.outline = '3px solid var(--color-primary)';
  _selectedSortItem = el;
}

function dropSortItem(categoryName) {
  if (!_selectedSortItem) return;

  const correctCategory = _selectedSortItem.dataset.category;
  gameMoves++;

  if (correctCategory === categoryName) {
    _selectedSortItem.classList.add('correct');
    _selectedSortItem.style.outline = '';
    _selectedSortItem.style.pointerEvents = 'none';
    window._sortCorrect++;
    gameScore += 10;
    updateScoreDisplay();
    document.getElementById('sortScore').textContent = window._sortCorrect;

    if (window._sortCorrect >= window._sortTotal) {
      gameScore += Math.max(0, 30 - gameSeconds);
      setTimeout(completeGame, 500);
    }
  } else {
    _selectedSortItem.classList.add('wrong');
    setTimeout(() => _selectedSortItem.classList.remove('wrong'), 600);
  }

  _selectedSortItem = null;
}

/* ============================================
   GAME 10: Reaction Time
   ============================================ */
let reactionState = { phase: 'idle', startTime: 0, timeout: null, attempts: 0, times: [] };

function initReaction(board) {
  reactionState = { phase: 'idle', startTime: 0, timeout: null, attempts: 0, times: [] };

  board.innerHTML = `
    <p class="text-caption text-center mb-md">Tap when the screen turns <strong style="color:var(--color-success)">GREEN</strong>!</p>
    <div class="reaction-area waiting" id="reactionArea" onclick="handleReactionTap()">
      <h2>Tap to Start</h2>
    </div>
    <p class="text-caption text-center mt-md">Attempt: <span id="reactionAttempt">0</span> / 5</p>
  `;
}

function handleReactionTap() {
  const area = document.getElementById('reactionArea');

  if (reactionState.phase === 'idle') {
    // Start waiting
    reactionState.phase = 'waiting';
    area.className = 'reaction-area waiting';
    area.innerHTML = '<h2>Wait for green...</h2>';

    const delay = 1500 + Math.random() * 3000;
    reactionState.timeout = setTimeout(() => {
      reactionState.phase = 'ready';
      reactionState.startTime = Date.now();
      area.className = 'reaction-area ready';
      area.innerHTML = '<h2>TAP NOW!</h2>';
    }, delay);

  } else if (reactionState.phase === 'waiting') {
    // Too early!
    clearTimeout(reactionState.timeout);
    area.className = 'reaction-area result';
    area.innerHTML = '<h2 style="color:var(--color-danger)">Too early! 😅</h2>';
    reactionState.phase = 'idle';
    setTimeout(() => {
      area.className = 'reaction-area waiting';
      area.innerHTML = '<h2>Tap to try again</h2>';
      reactionState.phase = 'idle';
    }, 1000);

  } else if (reactionState.phase === 'ready') {
    const time = Date.now() - reactionState.startTime;
    reactionState.times.push(time);
    reactionState.attempts++;
    gameMoves++;
    
    area.className = 'reaction-area result';
    area.innerHTML = `<div class="time">${time}ms</div>`;
    
    document.getElementById('reactionAttempt').textContent = reactionState.attempts;

    // Score based on speed
    if (time < 300) gameScore += 30;
    else if (time < 500) gameScore += 20;
    else if (time < 800) gameScore += 10;
    else gameScore += 5;
    updateScoreDisplay();

    if (reactionState.attempts >= 5) {
      const avg = Math.round(reactionState.times.reduce((a, b) => a + b, 0) / reactionState.times.length);
      setTimeout(() => {
        area.innerHTML = `<div><div class="time">${avg}ms</div><p style="color:var(--color-text-secondary)">Average</p></div>`;
        setTimeout(completeGame, 1500);
      }, 800);
    } else {
      reactionState.phase = 'idle';
      setTimeout(() => {
        area.className = 'reaction-area waiting';
        area.innerHTML = '<h2>Tap to continue</h2>';
        reactionState.phase = 'idle';
      }, 1200);
    }
  }
}

/* ============================================
   NEW GAMES (11-20)
   ============================================ */

// ---- 11. Color Match (Stroop) ----
let colorMatchRound = 0;
const COLOR_MATCH_ROUNDS = 10;
const STROOP_COLORS = [
  { name: 'RED', hex: '#FF6B6B' },
  { name: 'BLUE', hex: '#74B9FF' },
  { name: 'GREEN', hex: '#00B894' },
  { name: 'YELLOW', hex: '#FDCB6E' },
  { name: 'PURPLE', hex: '#A29BFE' },
  { name: 'ORANGE', hex: '#E17055' }
];

function initColorMatch(board) {
  colorMatchRound = 0;
  board.innerHTML = `
    <p class="text-caption text-center mb-md">Tap the button that matches the <strong>INK COLOR</strong>, not the word!</p>
    <div id="stroopWord" style="text-align:center;font-size:2.5rem;font-weight:800;padding:30px 0;"></div>
    <div id="stroopOptions" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px;"></div>
    <p class="text-caption text-center mt-md">Round: <span id="stroopRound">0</span> / ${COLOR_MATCH_ROUNDS}</p>
  `;
  nextColorMatch();
}

function nextColorMatch() {
  if (colorMatchRound >= COLOR_MATCH_ROUNDS) { completeGame(); return; }
  colorMatchRound++;
  document.getElementById('stroopRound').textContent = colorMatchRound;

  const wordColor = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];
  let inkColor;
  do { inkColor = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)]; } while (inkColor.name === wordColor.name);

  document.getElementById('stroopWord').innerHTML = `<span style="color:${inkColor.hex}">${wordColor.name}</span>`;

  const options = shuffleArray([inkColor, ...shuffleArray(STROOP_COLORS.filter(c => c.name !== inkColor.name)).slice(0, 3)]);
  document.getElementById('stroopOptions').innerHTML = options.map(c =>
    `<button class="btn btn-secondary" style="padding:16px;font-size:1rem;font-weight:700;" onclick="checkColorMatch('${c.name}','${inkColor.name}')">${c.name}</button>`
  ).join('');
}

function checkColorMatch(chosen, correct) {
  gameMoves++;
  if (chosen === correct) {
    gameScore += 10;
    updateScoreDisplay();
  }
  nextColorMatch();
}

// ---- 12. Math Quiz ----
let mathRound = 0;
const MATH_ROUNDS = 10;

function initMathQuiz(board) {
  mathRound = 0;
  board.innerHTML = `
    <p class="text-caption text-center mb-md">Solve the equation!</p>
    <div id="mathQuestion" style="text-align:center;font-size:2.2rem;font-weight:800;padding:24px 0;"></div>
    <div id="mathOptions" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;"></div>
    <p class="text-caption text-center mt-md">Question: <span id="mathRound">0</span> / ${MATH_ROUNDS}</p>
  `;
  nextMathQuestion();
}

function nextMathQuestion() {
  if (mathRound >= MATH_ROUNDS) { completeGame(); return; }
  mathRound++;
  document.getElementById('mathRound').textContent = mathRound;

  const ops = ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b, answer;
  if (op === '+') { a = Math.floor(Math.random() * 20) + 1; b = Math.floor(Math.random() * 20) + 1; answer = a + b; }
  else if (op === '-') { a = Math.floor(Math.random() * 20) + 10; b = Math.floor(Math.random() * a); answer = a - b; }
  else { a = Math.floor(Math.random() * 10) + 1; b = Math.floor(Math.random() * 10) + 1; answer = a * b; }

  document.getElementById('mathQuestion').textContent = `${a} ${op} ${b} = ?`;

  const distractors = new Set([answer]);
  while (distractors.size < 4) { distractors.add(answer + Math.floor(Math.random() * 11) - 5); }
  const options = shuffleArray([...distractors]);
  document.getElementById('mathOptions').innerHTML = options.map(o =>
    `<button class="btn btn-secondary" style="padding:16px;font-size:1.2rem;font-weight:700;" onclick="checkMath(${o},${answer})">${o}</button>`
  ).join('');
}

function checkMath(chosen, correct) {
  gameMoves++;
  if (chosen === correct) { gameScore += 10; updateScoreDisplay(); }
  nextMathQuestion();
}

// ---- 13. Emoji Pairs ----
function initEmojiPairs(board) {
  const emojis = ['🌸', '🌻', '🍀', '🌈', '⭐', '🎵'];
  const pairs = shuffleArray([...emojis, ...emojis]);
  let flipped = [], matched = 0;

  board.innerHTML = `
    <div class="match-grid size-4x3" id="emojiGrid">
      ${pairs.map((e, i) => `
        <div class="match-card" data-index="${i}" data-emoji="${e}" onclick="flipEmoji(this)">
          <div class="match-card-inner">
            <div class="match-card-front">?</div>
            <div class="match-card-back">${e}</div>
          </div>
        </div>
      `).join('')}
    </div>
    <p class="text-caption text-center mt-md">Find all matching emoji pairs!</p>
  `;

  window._emojiState = { flipped, matched, total: emojis.length };
}

function flipEmoji(card) {
  const st = window._emojiState;
  if (card.classList.contains('flipped') || card.classList.contains('matched') || st.flipped.length >= 2) return;
  card.classList.add('flipped');
  st.flipped.push(card);
  gameMoves++;

  if (st.flipped.length === 2) {
    const [a, b] = st.flipped;
    if (a.dataset.emoji === b.dataset.emoji) {
      a.classList.add('matched'); b.classList.add('matched');
      st.matched++;
      gameScore += 15;
      updateScoreDisplay();
      st.flipped = [];
      if (st.matched >= st.total) setTimeout(completeGame, 600);
    } else {
      setTimeout(() => { a.classList.remove('flipped'); b.classList.remove('flipped'); st.flipped = []; }, 800);
    }
  }
}

// ---- 14. Word Scramble ----
let scrambleRound = 0;
const SCRAMBLE_WORDS = ['HAPPY', 'SMILE', 'BRAIN', 'HEART', 'DREAM', 'PEACE', 'LIGHT', 'MUSIC', 'DANCE', 'BLOOM'];

function initWordScramble(board) {
  scrambleRound = 0;
  showScrambleWord(board);
}

function showScrambleWord(board) {
  if (scrambleRound >= 8) { completeGame(); return; }
  const word = SCRAMBLE_WORDS[scrambleRound];
  const scrambled = shuffleArray(word.split('')).join('');

  board.innerHTML = `
    <p class="text-caption text-center mb-md">Unscramble the word!</p>
    <div style="text-align:center;font-size:2.2rem;font-weight:800;letter-spacing:8px;padding:20px;color:var(--color-primary);">${scrambled}</div>
    <div style="max-width:300px;margin:20px auto;">
      <input type="text" class="form-input" id="scrambleInput" placeholder="Type the word..." autocomplete="off" style="text-align:center;font-size:1.2rem;text-transform:uppercase;">
      <button class="btn btn-primary w-full mt-md" onclick="checkScramble('${word}')">Submit</button>
    </div>
    <p class="text-caption text-center mt-md">Word ${scrambleRound + 1} / 8</p>
  `;
  document.getElementById('scrambleInput').addEventListener('keydown', e => { if (e.key === 'Enter') checkScramble(word); });
}

function checkScramble(correct) {
  const input = document.getElementById('scrambleInput').value.trim().toUpperCase();
  gameMoves++;
  if (input === correct) { gameScore += 15; updateScoreDisplay(); }
  scrambleRound++;
  showScrambleWord(document.getElementById('gameBoard'));
}

// ---- 15. Quick Count ----
let countRound = 0;

function initCounting(board) {
  countRound = 0;
  nextCountRound(board);
}

function nextCountRound(board) {
  if (countRound >= 8) { completeGame(); return; }
  countRound++;
  const emoji = ['🍎', '⭐', '🔵', '🌸', '🐱'][Math.floor(Math.random() * 5)];
  const count = Math.floor(Math.random() * 12) + 3;
  const items = Array(count).fill(emoji);
  // Add some distractors
  const distractorEmoji = ['🍊', '🟡', '🟢', '🌺', '🐶'][['🍎', '⭐', '🔵', '🌸', '🐱'].indexOf(emoji)];
  const distractors = Math.floor(Math.random() * 5) + 2;
  for (let i = 0; i < distractors; i++) items.push(distractorEmoji);
  const shuffled = shuffleArray(items);

  board.innerHTML = `
    <p class="text-caption text-center mb-md">How many <span style="font-size:1.3rem">${emoji}</span> do you see?</p>
    <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;padding:16px;font-size:1.8rem;line-height:1;">
      ${shuffled.map(e => `<span>${e}</span>`).join('')}
    </div>
    <div id="countOptions" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:16px;">
      ${shuffleArray([count, count+1, count-1, count+2]).map(n =>
        `<button class="btn btn-secondary" style="padding:14px;font-size:1.2rem;font-weight:700;" onclick="checkCount(${n},${count})">${n}</button>`
      ).join('')}
    </div>
    <p class="text-caption text-center mt-md">Round: ${countRound} / 8</p>
  `;
}

function checkCount(chosen, correct) {
  gameMoves++;
  if (chosen === correct) { gameScore += 12; updateScoreDisplay(); }
  nextCountRound(document.getElementById('gameBoard'));
}

// ---- 16. Shape Match ----
let shapeRound = 0;
const SHAPES = [
  { svg: '<circle cx="30" cy="30" r="25" fill="FG"/>', name: 'circle' },
  { svg: '<rect x="5" y="5" width="50" height="50" fill="FG"/>', name: 'square' },
  { svg: '<polygon points="30,5 55,55 5,55" fill="FG"/>', name: 'triangle' },
  { svg: '<polygon points="30,5 55,20 55,45 30,55 5,45 5,20" fill="FG"/>', name: 'hexagon' },
  { svg: '<polygon points="30,2 38,22 58,22 42,34 48,55 30,43 12,55 18,34 2,22 22,22" fill="FG"/>', name: 'star' }
];
const SHAPE_COLORS = ['#FF6B6B', '#74B9FF', '#00B894', '#FDCB6E', '#A29BFE'];

function initShapeMatch(board) {
  shapeRound = 0;
  nextShapeRound(board);
}

function nextShapeRound(board) {
  if (shapeRound >= 8) { completeGame(); return; }
  shapeRound++;
  const target = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const targetColor = SHAPE_COLORS[Math.floor(Math.random() * SHAPE_COLORS.length)];
  const targetSvg = target.svg.replace('FG', targetColor);

  const options = [{ shape: target, color: targetColor, correct: true }];
  while (options.length < 4) {
    const s = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const c = SHAPE_COLORS[Math.floor(Math.random() * SHAPE_COLORS.length)];
    if (s.name !== target.name || c !== targetColor) {
      options.push({ shape: s, color: c, correct: false });
    }
  }
  const shuffled = shuffleArray(options);

  board.innerHTML = `
    <p class="text-caption text-center mb-md">Find the matching shape!</p>
    <div style="text-align:center;padding:20px;">
      <svg viewBox="0 0 60 60" width="100" height="100">${targetSvg}</svg>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px;">
      ${shuffled.map((o, i) => `
        <div style="text-align:center;padding:16px;background:var(--color-bg-card);border-radius:var(--radius-md);cursor:pointer;box-shadow:var(--shadow-sm);"
             onclick="checkShape(${o.correct},this)">
          <svg viewBox="0 0 60 60" width="60" height="60">${o.shape.svg.replace('FG', o.color)}</svg>
        </div>
      `).join('')}
    </div>
    <p class="text-caption text-center mt-md">Round: ${shapeRound} / 8</p>
  `;
}

function checkShape(correct, el) {
  gameMoves++;
  if (correct) {
    gameScore += 12;
    updateScoreDisplay();
    el.style.border = '3px solid var(--color-success)';
  } else {
    el.style.border = '3px solid var(--color-danger)';
  }
  setTimeout(() => nextShapeRound(document.getElementById('gameBoard')), 500);
}

// ---- 17. True or False ----
let tfRound = 0;
const TF_FACTS = [
  { statement: 'The Sun is a star', answer: true },
  { statement: 'Water boils at 50°C', answer: false },
  { statement: 'Elephants are the largest land animals', answer: true },
  { statement: 'Spiders have 6 legs', answer: false },
  { statement: 'The Earth is round', answer: true },
  { statement: 'Bananas are berries', answer: true },
  { statement: 'Diamonds are made of wood', answer: false },
  { statement: 'The Moon orbits the Earth', answer: true },
  { statement: 'Penguins can fly', answer: false },
  { statement: 'Honey never spoils', answer: true },
  { statement: 'Cats have 9 lives', answer: false },
  { statement: 'Gold is heavier than silver', answer: true }
];

function initTrueFalse(board) {
  tfRound = 0;
  nextTrueFalse(board);
}

function nextTrueFalse(board) {
  if (tfRound >= 10) { completeGame(); return; }
  const fact = TF_FACTS[tfRound % TF_FACTS.length];
  tfRound++;

  board.innerHTML = `
    <p class="text-caption text-center mb-md">True or False?</p>
    <div style="text-align:center;padding:30px 16px;">
      <p style="font-size:1.3rem;font-weight:700;color:var(--color-text-primary);line-height:1.6;">"${fact.statement}"</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
      <button class="btn" style="padding:18px;font-size:1.1rem;font-weight:700;background:#00B894;color:white;border:none;border-radius:var(--radius-md);" onclick="checkTF(true,${fact.answer})">✅ TRUE</button>
      <button class="btn" style="padding:18px;font-size:1.1rem;font-weight:700;background:#FF6B6B;color:white;border:none;border-radius:var(--radius-md);" onclick="checkTF(false,${fact.answer})">❌ FALSE</button>
    </div>
    <p class="text-caption text-center mt-md">Question: ${tfRound} / 10</p>
  `;
}

function checkTF(chosen, correct) {
  gameMoves++;
  if (chosen === correct) { gameScore += 10; updateScoreDisplay(); }
  nextTrueFalse(document.getElementById('gameBoard'));
}

// ---- 18. Missing Number ----
let mnRound = 0;

function initMissingNumber(board) {
  mnRound = 0;
  nextMissingNumber(board);
}

function nextMissingNumber(board) {
  if (mnRound >= 8) { completeGame(); return; }
  mnRound++;

  const start = Math.floor(Math.random() * 10) + 1;
  const step = [1, 2, 3, 5][Math.floor(Math.random() * 4)];
  const seq = [];
  for (let i = 0; i < 6; i++) seq.push(start + step * i);
  const missingIdx = Math.floor(Math.random() * 4) + 1; // Don't hide first or last
  const answer = seq[missingIdx];
  const display = seq.map((n, i) => i === missingIdx ? '?' : n);

  const distractors = new Set([answer]);
  while (distractors.size < 4) { distractors.add(answer + Math.floor(Math.random() * 7) - 3); }

  board.innerHTML = `
    <p class="text-caption text-center mb-md">Find the missing number!</p>
    <div style="display:flex;justify-content:center;gap:12px;padding:20px;flex-wrap:wrap;">
      ${display.map(n => `
        <div style="width:50px;height:50px;display:flex;align-items:center;justify-content:center;border-radius:var(--radius-sm);font-size:1.3rem;font-weight:700;
          ${n === '?' ? 'background:var(--color-primary);color:white;' : 'background:var(--color-bg-card);color:var(--color-text-primary);box-shadow:var(--shadow-sm);'}">${n}</div>
      `).join('')}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:20px;">
      ${shuffleArray([...distractors]).map(n =>
        `<button class="btn btn-secondary" style="padding:14px;font-size:1.1rem;font-weight:700;" onclick="checkMissing(${n},${answer})">${n}</button>`
      ).join('')}
    </div>
    <p class="text-caption text-center mt-md">Round: ${mnRound} / 8</p>
  `;
}

function checkMissing(chosen, correct) {
  gameMoves++;
  if (chosen === correct) { gameScore += 12; updateScoreDisplay(); }
  nextMissingNumber(document.getElementById('gameBoard'));
}

// ---- 19. Odd One Out ----
let oddRound = 0;

function initOddOneOut(board) {
  oddRound = 0;
  nextOddRound(board);
}

function nextOddRound(board) {
  if (oddRound >= 8) { completeGame(); return; }
  oddRound++;

  const groups = [
    { normal: ['🍎', '🍊', '🍋', '🍇'], odd: '🐱', hint: 'Fruits' },
    { normal: ['🐶', '🐱', '🐰', '🐻'], odd: '🍕', hint: 'Animals' },
    { normal: ['🚗', '🚌', '🏍️', '🚲'], odd: '🌺', hint: 'Vehicles' },
    { normal: ['☀️', '🌙', '⭐', '🌈'], odd: '📚', hint: 'Sky things' },
    { normal: ['👟', '👢', '🥿', '👠'], odd: '🎸', hint: 'Footwear' },
    { normal: ['🎹', '🎸', '🥁', '🎺'], odd: '🍔', hint: 'Instruments' },
    { normal: ['🏠', '🏢', '🏫', '🏥'], odd: '🌊', hint: 'Buildings' },
    { normal: ['✏️', '📝', '📚', '🖊️'], odd: '⚽', hint: 'School' }
  ];

  const g = groups[oddRound % groups.length];
  const items = shuffleArray([...g.normal, g.odd]);

  board.innerHTML = `
    <p class="text-caption text-center mb-md">Tap the odd one out!</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:16px;max-width:300px;margin:0 auto;">
      ${items.map(e => `
        <div style="padding:20px;text-align:center;font-size:2rem;background:var(--color-bg-card);border-radius:var(--radius-md);cursor:pointer;box-shadow:var(--shadow-sm);"
             onclick="checkOdd(this,'${e}','${g.odd}')">${e}</div>
      `).join('')}
    </div>
    <p class="text-caption text-center mt-md" style="color:var(--color-text-tertiary)">Hint: They're all ${g.hint} except one</p>
    <p class="text-caption text-center mt-sm">Round: ${oddRound} / 8</p>
  `;
}

function checkOdd(el, chosen, correct) {
  gameMoves++;
  if (chosen === correct) {
    gameScore += 12;
    updateScoreDisplay();
    el.style.border = '3px solid var(--color-success)';
  } else {
    el.style.border = '3px solid var(--color-danger)';
  }
  setTimeout(() => nextOddRound(document.getElementById('gameBoard')), 500);
}

// ---- 20. Clock Reading ----
let clockRound = 0;

function initClockReading(board) {
  clockRound = 0;
  nextClockRound(board);
}

function nextClockRound(board) {
  if (clockRound >= 8) { completeGame(); return; }
  clockRound++;

  const hour = Math.floor(Math.random() * 12) + 1;
  const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
  const hourAngle = (hour % 12) * 30 + minute * 0.5;
  const minuteAngle = minute * 6;

  const displayTime = `${hour}:${minute.toString().padStart(2, '0')}`;
  const distractors = new Set([displayTime]);
  while (distractors.size < 4) {
    const h = Math.floor(Math.random() * 12) + 1;
    const m = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
    distractors.add(`${h}:${m.toString().padStart(2, '0')}`);
  }

  board.innerHTML = `
    <p class="text-caption text-center mb-md">What time does the clock show?</p>
    <div style="text-align:center;padding:16px;">
      <svg viewBox="0 0 120 120" width="160" height="160" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.1));">
        <circle cx="60" cy="60" r="55" fill="white" stroke="var(--color-text-primary)" stroke-width="3"/>
        ${[1,2,3,4,5,6,7,8,9,10,11,12].map(n => {
          const a = (n * 30 - 90) * Math.PI / 180;
          return `<text x="${60 + 42 * Math.cos(a)}" y="${60 + 42 * Math.sin(a) + 5}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--color-text-primary)">${n}</text>`;
        }).join('')}
        <line x1="60" y1="60" x2="${60 + 28 * Math.cos((hourAngle - 90) * Math.PI / 180)}" y2="${60 + 28 * Math.sin((hourAngle - 90) * Math.PI / 180)}" stroke="var(--color-text-primary)" stroke-width="4" stroke-linecap="round"/>
        <line x1="60" y1="60" x2="${60 + 40 * Math.cos((minuteAngle - 90) * Math.PI / 180)}" y2="${60 + 40 * Math.sin((minuteAngle - 90) * Math.PI / 180)}" stroke="var(--color-primary)" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="60" cy="60" r="3" fill="var(--color-text-primary)"/>
      </svg>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px;">
      ${shuffleArray([...distractors]).map(t =>
        `<button class="btn btn-secondary" style="padding:14px;font-size:1.1rem;font-weight:700;" onclick="checkClock('${t}','${displayTime}')">${t}</button>`
      ).join('')}
    </div>
    <p class="text-caption text-center mt-md">Round: ${clockRound} / 8</p>
  `;
}

function checkClock(chosen, correct) {
  gameMoves++;
  if (chosen === correct) { gameScore += 12; updateScoreDisplay(); }
  nextClockRound(document.getElementById('gameBoard'));
}

/* ============================================
   UTILITIES
   ============================================ */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  renderGamesHub();
});
