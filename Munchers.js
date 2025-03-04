const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');
const livesDisplay = document.getElementById('lives');
const goalDisplay = document.getElementById('goal');

// Game state initialization
let gameState = {
  score: 0,
  level: 1,
  lives: 3,
  currentGoal: 2,
  gameRunning: true,
  muncherPosition: { row: 0, col: 0 },
  wrongAttempts: 0,
  enemies: []
};

// Reset game state
function resetGameState() {
  gameState = {
    score: 0,
    level: 1,
    lives: 3,
    currentGoal: 2,
    gameRunning: true,
    muncherPosition: { row: 0, col: 0 },
    wrongAttempts: 0,
    enemies: []
  };
}

// Create a square
function createSquare(row, col, number, isCorrect) {
  const square = document.createElement('div');
  square.classList.add('square');
  square.textContent = number;
  square.dataset.row = row;
  square.dataset.col = col;
  square.dataset.correct = isCorrect;

  return square;
}

// Update board generation
function generateBoard() {
  gameBoard.innerHTML = '';
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const number = Math.floor(Math.random() * 50) + 1;
      const isCorrect = number % gameState.currentGoal === 0;
      const square = createSquare(row, col, number, isCorrect);
      gameBoard.appendChild(square);
    }
  }
}

// Spawn the muncher
function spawnMuncher() {
  const muncher = document.createElement('div');
  muncher.id = 'muncher';
  muncher.classList.add('muncher');
  const startSquare = document.querySelector(
    `.square[data-row="${gameState.muncherPosition.row}"][data-col="${gameState.muncherPosition.col}"]`
  );
  if (startSquare) startSquare.appendChild(muncher);
}

// Move the muncher
function moveMuncher(oldRow, oldCol, newRow, newCol) {
  const muncher = document.getElementById('muncher');
  const targetSquare = document.querySelector(
    `.square[data-row="${newRow}"][data-col="${newCol}"]`
  );

  if (!targetSquare) return;

  // Keep muncher element when moving
  const currentSquare = document.querySelector(
    `.square[data-row="${oldRow}"][data-col="${oldCol}"]`
  );
  
  if (currentSquare) {
    const number = currentSquare.textContent;
    currentSquare.innerHTML = number;  // Preserve number, remove muncher
  }
  
  const targetNumber = targetSquare.textContent;
  targetSquare.innerHTML = targetNumber;  // Preserve number
  targetSquare.appendChild(muncher);  // Add muncher while keeping number

  gameState.muncherPosition = { row: newRow, col: newCol };
}

// Check answer
function checkAnswer() {
  const currentSquare = document.querySelector(
    `.square[data-row="${gameState.muncherPosition.row}"][data-col="${gameState.muncherPosition.col}"]`
  );

  if (currentSquare.dataset.correct === 'true') {
    gameState.score += 10;
    gameState.wrongAttempts = 0;
    updateScore();
    const muncher = document.getElementById('muncher');
    currentSquare.innerHTML = '';  // Clear number
    currentSquare.appendChild(muncher);  // Keep muncher
  } else {
    gameState.wrongAttempts++;
    if (gameState.wrongAttempts >= 3) {
      gameState.lives--;
      gameState.wrongAttempts = 0;
      updateLives();
      if (gameState.lives <= 0) endGame();
    }
  }
}

// Update score
function updateScore() {
  scoreDisplay.textContent = gameState.score;
}

// Update lives
function updateLives() {
  livesDisplay.textContent = gameState.lives;
  if (gameState.lives <= 0) endGame();
}

// End the game
function endGame() {
  alert(`Game Over! Your final score is ${gameState.score}.`);
  gameState.gameRunning = false;
}

// Spawn toggles (enemies)
function spawnToggles() {
  const toggleCount = 3; // Number of toggles to spawn
  for (let i = 0; i < toggleCount; i++) {
    const toggle = document.createElement('div');
    toggle.classList.add('toggle');
    const row = Math.floor(Math.random() * 5);
    const col = Math.floor(Math.random() * 5);
    toggle.dataset.row = row;
    toggle.dataset.col = col;
    gameState.enemies.push({ row, col });
    const square = document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
    if (square) square.appendChild(toggle);
  }
}

// Move toggles randomly
function moveToggles() {
  gameState.enemies.forEach((enemy, index) => {
    const oldRow = enemy.row;
    const oldCol = enemy.col;
    let newRow = oldRow;
    let newCol = oldCol;
    const direction = Math.floor(Math.random() * 4);
    switch (direction) {
      case 0: if (newRow > 0) newRow--; break; // Up
      case 1: if (newRow < 4) newRow++; break; // Down
      case 2: if (newCol > 0) newCol--; break; // Left
      case 3: if (newCol < 4) newCol++; break; // Right
    }
    const targetSquare = document.querySelector(`.square[data-row="${newRow}"][data-col="${newCol}"]`);
    if (targetSquare && !targetSquare.querySelector('.toggle')) {
      const toggle = document.querySelector(`.toggle[data-row="${oldRow}"][data-col="${oldCol}"]`);
      if (toggle) {
        toggle.dataset.row = newRow;
        toggle.dataset.col = newCol;
        targetSquare.appendChild(toggle);
        gameState.enemies[index] = { row: newRow, col: newCol };
      }
    }
  });
}

// Check if muncher collides with a toggle
function checkCollision() {
  const muncher = document.getElementById('muncher');
  const muncherRow = gameState.muncherPosition.row;
  const muncherCol = gameState.muncherPosition.col;
  const toggle = document.querySelector(`.toggle[data-row="${muncherRow}"][data-col="${muncherCol}"]`);
  if (toggle) {
    gameState.lives--;
    updateLives();
    if (gameState.lives <= 0) endGame();
  }
}

// Update game loop to include toggle movement and collision check
function gameLoop() {
  if (!gameState.gameRunning) return;
  moveToggles();
  checkCollision();
  setTimeout(gameLoop, 1000); // Adjust the interval as needed
}

// Movement handler
document.addEventListener('keydown', (e) => {
  if (!gameState.gameRunning) {
    console.log('Game not running');
    return;
  }

  const oldPosition = {...gameState.muncherPosition};
  
  if (e.code === 'Space') {
    checkAnswer();
    return;
  }

  switch(e.key) {
    case 'ArrowUp':
      if (gameState.muncherPosition.row > 0) gameState.muncherPosition.row--;
      break;
    case 'ArrowDown':
      if (gameState.muncherPosition.row < 4) gameState.muncherPosition.row++;
      break;
    case 'ArrowLeft':
      if (gameState.muncherPosition.col > 0) gameState.muncherPosition.col--;
      break;
    case 'ArrowRight':
      if (gameState.muncherPosition.col < 4) gameState.muncherPosition.col++;
      break;
    default:
      return;
  }

  console.log(`Moving from (${oldPosition.row},${oldPosition.col}) to (${gameState.muncherPosition.row},${gameState.muncherPosition.col})`);
  moveMuncher(oldPosition.row, oldPosition.col, gameState.muncherPosition.row, gameState.muncherPosition.col);
});

// Start game function
function startGame() {
  console.log('Starting game...');
  resetGameState();
  generateBoard();
  spawnMuncher();
  spawnToggles();
  updateScore();
  updateLives();
  gameLoop();
  console.log('Game started');
}

// Ensure game starts only when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded');
  startGame();
});
