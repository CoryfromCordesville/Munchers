const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');
const gameOverDisplay = document.getElementById('game-over');
const timerDisplay = document.getElementById('timer');
const livesDisplay = document.getElementById('lives');

let score = 0;
let level = 1;
let lives = 3;
let timer = 60; // in seconds
let gameRunning = true;

const muncher = {
  row: 2,
  col: 2,
};

function createSquare(number, row, col, type) {
  const square = document.createElement('div');
  square.classList.add('square');
  square.textContent = number;
  square.dataset.row = row;
  square.dataset.col = col;
  square.dataset.type = type;
  square.dataset.multiple = number % 2 === 0; // true if the number is a multiple of 2
  square.addEventListener('click', () => {
    munchSquare(square);
  });
  return square;
}

function munchSquare(square) {
  if (!gameRunning) return;

  const number = parseInt(square.textContent);
  const type = square.dataset.type;
  const isMultiple = square.dataset.multiple === 'true';

  if (type === 'enemy') {
    // Game over logic
    lives--;
    if (lives === 0) {
      endGame();
    }
    return;
  }

  // Only update score and level if the number is a multiple
  if (isMultiple) {
    score += number;
    updateScoreAndLevel();
  }

  // Remove the square from the game board
  square.remove();
}

function updateScoreAndLevel() {
  scoreDisplay.textContent = `Score: ${score}`;
  level++;
  levelDisplay.textContent = `Level: ${level}`;
}

function moveMuncher(direction) {
  if (!gameRunning) return;

  const newMuncherPosition = { ...muncher };

  switch (direction) {
    case 'up':
      if (newMuncherPosition.row > 0) {
        newMuncherPosition.row--;
      }
      break;
    case 'down':
      if (newMuncherPosition.row < 4) {
        newMuncherPosition.row++;
      }
      break;
    case 'left':
      if (newMuncherPosition.col > 0) {
        newMuncherPosition.col--;
      }
      break;
    case 'right':
      if (newMuncherPosition.col < 4) {
        newMuncherPosition.col++;
      }
      break;
    default:
      break;
  }

  muncher.row = newMuncherPosition.row;
  muncher.col = newMuncherPosition.col;
  updateMuncherPosition();
}

function updateMuncherPosition() {
  const muncherElement = document.querySelector('.muncher');
  muncherElement.style.gridRow = muncher.row + 1;
  muncherElement.style.gridColumn = muncher.col + 1;
}

function getRandomSquareType() {
  const types = ['number', 'power-up', 'enemy'];
  const randomIndex = Math.floor(Math.random() * types.length);
  return types[randomIndex];
}

function endGame() {
  gameRunning = false;
  gameOverDisplay.textContent = 'Game Over';
}

function generateGameBoard() {
  gameBoard.innerHTML = '';

  for (let i = 1; i <= 24; i++) {
    const row = Math.floor((i - 1) / 5);
    const col = (i - 1) % 5;
    const type = getRandomSquareType();
    const square = createSquare(i, row, col, type);
    gameBoard.appendChild(square);
  }

  const muncherElement = document.createElement('div');
  muncherElement.className = 'muncher';

  const muncherImage = document.createElement('img');
  muncherImage.src = 'green-muncher.png'; // Update this path accordingly
  muncherElement.appendChild(muncherImage);

  gameBoard.appendChild(muncherElement);

  updateMuncherPosition();
}

function handleKeyDown(event) {
  if (!gameRunning) return;

  switch (event.key) {
    case 'ArrowUp':
    case 'ArrowDown':
    case 'ArrowLeft':
    case 'ArrowRight':
      moveMuncher(event.key.replace('Arrow', '').toLowerCase());
      break;
    default:
      break;
  }
}

function updateTimerDisplay() {
  timerDisplay.textContent = `Time: ${timer} seconds`;
}

function updateLivesDisplay() {
  livesDisplay.textContent = `Lives: ${lives}`;
}

function initGame() {
  updateScoreAndLevel();
  updateTimerDisplay();
  updateLivesDisplay();
  startTimer();
}

function startTimer() {
  const interval = setInterval(() => {
    timer--;
    updateTimerDisplay();

    if (timer === 0) {
      clearInterval(interval);
      endGame();
    }
  }, 1000);
}

document.addEventListener('keydown', handleKeyDown);

generateGameBoard();
initGame();
