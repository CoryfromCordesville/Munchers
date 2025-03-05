// Game state
const gameState = {
    level: 1,
    score: 0,
    lives: 3,
    currentGoal: 'prime',
    muncherPosition: { row: 0, col: 0 },
    messageVisible: false,
    animationInProgress: false,
    boardSize: { rows: 4, cols: 6 },
    gameRunning: false,
    gameOver: false,
    titleScreenActive: true,
    titleScreenPage: 1, // 1: intro screen, 2: menu screen, 3: hall of fame, 4: information, 5: options
    currentScreen: null, // Used to track which screen we're on for returns to main menu
    selectedMenuOption: 0, // 0: Play, 1: Hall of Fame, 2: Information, 3: Options, 4: Quit
    playerName: 'AAA',  // Default name for high score
    editingName: false, // Whether we're currently editing name
    namePosition: 0     // Position in the name being edited (0, 1, or 2)
};

// DOM elements
const titleContainer = document.getElementById('title-container');
const titleScreen1 = document.getElementById('title-screen-1');
const titleScreen2 = document.getElementById('title-screen-2');
const hallOfFameScreen = document.getElementById('hall-of-fame-screen');
const informationScreen = document.getElementById('information-screen');
const optionsScreen = document.getElementById('options-screen');
const gameWrapper = document.getElementById('game-wrapper');
const gameHeader = document.getElementById('game-header');
const gameContainer = document.getElementById('game-container');
const gameFooter = document.getElementById('game-footer');
const messageDisplay = document.getElementById('message-display');
const levelDisplay = document.getElementById('level-display');
const goalDisplay = document.getElementById('goal-display');
const scoreDisplay = document.getElementById('score-display');
const livesContainer = document.getElementById('lives-container');

// Check if a number is prime
function isPrime(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    
    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    
    return true;
}

// Create game board with specific numbers to match the screenshot
function createGameBoard() {
    // Clear the game container
    gameContainer.innerHTML = '';
    
    // Numbers exactly match the original Number Munchers layout
    const boardNumbers = [
        [2, 2, 1, 2, 1, 2],
        [1, "", 1, 1, 1, 2],
        [2, 2, 1, 1, 1, 1],
        [2, 2, 2, 1, 2, 1]
    ];
    
    // Create squares
    for (let row = 0; row < gameState.boardSize.rows; row++) {
        for (let col = 0; col < gameState.boardSize.cols; col++) {
            const square = document.createElement('div');
            square.className = 'square';
            square.dataset.row = row;
            square.dataset.col = col;
            
            // Add the number from our defined board or generate one if not specified
            const numberValue = boardNumbers[row][col];
            if (numberValue !== "") {
                square.textContent = numberValue;
                square.dataset.number = numberValue;
                
                // Store whether this number is a valid answer (prime)
                const isPrimeNumber = isPrime(parseInt(numberValue));
                square.dataset.isPrime = isPrimeNumber;
            }
            
            gameContainer.appendChild(square);
        }
    }
}

// Spawn the muncher
function spawnMuncher(row = 0, col = 0) {
    // Create muncher
    const muncher = document.createElement('div');
    muncher.className = 'muncher';
    
    // Find the target square
    const targetSquare = document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
    if (targetSquare) {
        targetSquare.appendChild(muncher);
        
        // Update position
        gameState.muncherPosition = { row, col };
    }
}

// Move the muncher
function moveMuncher(newRow, newCol) {
    const oldRow = gameState.muncherPosition.row;
    const oldCol = gameState.muncherPosition.col;
    
    // Get squares
    const oldSquare = document.querySelector(`.square[data-row="${oldRow}"][data-col="${oldCol}"]`);
    const newSquare = document.querySelector(`.square[data-row="${newRow}"][data-col="${newCol}"]`);
    
    if (!oldSquare || !newSquare) return;
    
    // Get muncher element
    const muncher = oldSquare.querySelector('.muncher');
    if (!muncher) return;
    
    // Moving animation
    gameState.animationInProgress = true;
    muncher.classList.remove('idle');
    muncher.classList.remove('wrong-eat'); // In case we just made a wrong move
    muncher.classList.add('moving');
    
    // Store any existing number in the target square for later display
    const targetNumber = newSquare.textContent;
    
    // Move after animation
    setTimeout(() => {
        // Remove muncher from old square
        if (oldSquare.contains(muncher)) {
            oldSquare.removeChild(muncher);
        }
        
        // Preserve the number but add the muncher to the new square
        if (targetNumber) {
            // Store the number in a data attribute
            newSquare.dataset.number = targetNumber;
        }
        
        // Add muncher to new square
        newSquare.appendChild(muncher);
        
        // Update position
        gameState.muncherPosition = { row: newRow, col: newCol };
        
        // Back to idle
        muncher.classList.remove('moving');
        muncher.classList.add('idle');
        
        gameState.animationInProgress = false;
    }, 300); // Match animation duration
}

// Eat the number in the current square
function eatNumber() {
    if (gameState.animationInProgress) return;
    
    // Get the current square
    const { row, col } = gameState.muncherPosition;
    const square = document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
    if (!square || !square.textContent || square.dataset.eaten === 'true') return;
    
    // Check if the number is prime
    const isCorrect = square.dataset.isPrime === 'true';
    const muncher = square.querySelector('.muncher');
    
    if (muncher) {
        gameState.animationInProgress = true;
        
        if (isCorrect) {
            // Correct answer - eat the number
            const numberToRemove = square.textContent;
            muncher.classList.add('eating');
            
            // Wait for animation to complete
            setTimeout(() => {
                // Clear number
                square.textContent = '';
                square.dataset.eaten = 'true';
                
                // Mark square as eaten
                square.dataset.eaten = 'true';
                
                // Make sure the muncher is still there
                square.appendChild(muncher);
                
                // Reset animation state
                muncher.classList.remove('eating');
                
                // Update score
                gameState.score += 5;
                updateScore();
                
                // Check if level is complete
                if (checkLevelComplete()) {
                    // Level complete!
                    gameState.level++;
                    levelDisplay.textContent = gameState.level;
                    showMessage(`Level ${gameState.level - 1} complete! Press Space Bar to continue.`);
                }
                
                gameState.animationInProgress = false;
            }, 500);
        } else {
            // Wrong answer - show wrong eat animation
            muncher.classList.add('wrong-eat');
            
            // Show message
            const numberValue = square.textContent;
            if (numberValue === '1') {
                showMessage(`The number "1" is not prime.<br>Press Space Bar to continue.`);
            } else {
                showMessage(`The number "${numberValue}" is ${isCorrect ? '' : 'not '}prime.<br>Press Space Bar to continue.`);
            }
            
            // Reduce lives
            gameState.lives--;
            updateLives();
            
            // Game over if no lives left
            if (gameState.lives <= 0) {
                gameOver();
            }
            
            gameState.animationInProgress = false;
        }
    }
}

// Reset muncher after wrong answer
function resetMuncherAfterWrongAnswer() {
    const { row, col } = gameState.muncherPosition;
    const square = document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
    
    if (!square) return;
    
    // Remove existing muncher
    const oldMuncher = square.querySelector('.muncher');
    if (oldMuncher) {
        square.removeChild(oldMuncher);
    }
    
    // Create new muncher in idle state
    spawnMuncher(row, col);
}

// Check if level is complete
function checkLevelComplete() {
    // Count remaining correct squares
    const correctSquares = document.querySelectorAll('.square[data-isPrime="true"]:not([data-eaten="true"])');
    
    if (correctSquares.length === 0) {
        // Level complete
        gameState.level++;
        levelDisplay.textContent = `Level: ${gameState.level}`;
        
        // Show message
        showMessage(`Level Complete!<br>Press Space Bar to continue.`);
        return true;
    }
    return false;
}

// Show a message
function showMessage(text) {
    messageDisplay.innerHTML = text;
    messageDisplay.style.display = 'block';
    gameState.messageVisible = true;
}

// Hide all screens
function hideAllScreens() {
    titleScreen1.style.display = 'none';
    titleScreen2.style.display = 'none';
    hallOfFameScreen.style.display = 'none';
    informationScreen.style.display = 'none';
    optionsScreen.style.display = 'none';
}

// Show a specific screen
function showScreen(screen) {
    hideAllScreens();
    screen.style.display = 'block';
    gameState.currentScreen = screen;
}

// Handle title screen 1 key press
function handleTitleScreen1KeyPress() {
    // Move to main menu
    hideAllScreens();
    titleScreen1.style.display = 'none';
    titleScreen2.style.display = 'block';
    gameState.titleScreenPage = 2;
    gameState.currentScreen = titleScreen2;
    createMenuHighlight(); // Make sure the menu highlight is created
}

// Return to the main menu from any submenu
function returnToMainMenu() {
    showScreen(titleScreen2);
    gameState.titleScreenPage = 2;
    gameState.editingName = false;
}

// Show Hall of Fame screen
function showHallOfFame() {
    showScreen(hallOfFameScreen);
    gameState.titleScreenPage = 3;
}

// Show Information screen
function showInformation() {
    showScreen(informationScreen);
    gameState.titleScreenPage = 4;
}

// Show Options screen
function showOptions() {
    showScreen(optionsScreen);
    gameState.titleScreenPage = 5;
}

// Handle menu selection
function handleMenuSelection(optionNumber) {
    switch (optionNumber) {
        case 1: // Play Number Munchers
            hideAllScreens();
            titleContainer.style.display = 'none';
            gameWrapper.style.display = 'block';
            gameState.titleScreenActive = false;
            gameState.gameOver = false;
            startGame();
            break;
        case 2: // Hall of Fame
            showScreen(hallOfFameScreen);
            gameState.titleScreenPage = 3;
            break;
        case 3: // Information
            showScreen(informationScreen);
            gameState.titleScreenPage = 4;
            break;
        case 4: // Options
            showScreen(optionsScreen);
            gameState.titleScreenPage = 5;
            break;
        case 5: // Quit
            // In a real implementation, we would close the game
            // Here we'll just refresh the page
            window.location.reload();
            break;
    }
}

// Position the menu highlight based on selected option
function updateMenuHighlight() {
    const highlight = document.querySelector('.menu-highlight');
    if (!highlight) return;
    
    // Adjusted positions to better align with the menu text
    const positions = [
        { top: '43.5%' },  // 1. Play Number Munchers
        { top: '51%' },    // 2. Hall of Fame
        { top: '58.5%' },  // 3. Information
        { top: '66%' },    // 4. Options
        { top: '73.5%' }   // 5. Quit
    ];
    
    const pos = positions[gameState.selectedMenuOption];
    highlight.style.top = pos.top;
}

// Create highlight for menu options
function createMenuHighlight() {
    // Remove any existing highlight
    const existingHighlight = document.querySelector('.menu-highlight');
    if (existingHighlight) {
        existingHighlight.remove();
    }
    
    // Create new highlight
    const highlight = document.createElement('div');
    highlight.className = 'menu-highlight';
    titleScreen2.appendChild(highlight);
    
    // Position the highlight
    updateMenuHighlight();
}

// Navigate menu with arrow keys
function navigateMenu(direction) {
    const menuLength = 5; // Number of menu options
    
    if (direction === 'up') {
        gameState.selectedMenuOption = (gameState.selectedMenuOption - 1 + menuLength) % menuLength;
    } else if (direction === 'down') {
        gameState.selectedMenuOption = (gameState.selectedMenuOption + 1) % menuLength;
    }
    
    updateMenuHighlight();
}

// Handle key presses
function handleKeyPress(e) {
    // Handle name entry
    if (gameState.editingName) {
        switch (e.code) {
            case 'ArrowUp':
                editNameCharacter('up');
                return;
            case 'ArrowDown':
                editNameCharacter('down');
                return;
            case 'ArrowRight':
            case 'Space':
            case 'Enter':
                nextNameCharacter();
                return;
        }
        return;
    }
    
    // Handle title screen
    if (gameState.titleScreenActive) {
        if (gameState.titleScreenPage === 1) {
            // Any key on the first title screen goes to the menu
            handleTitleScreen1KeyPress();
            return;
        } else if (gameState.titleScreenPage === 2) {
            // Menu screen - use arrow keys to navigate, Enter to select
            switch (e.code) {
                case 'ArrowUp':
                    navigateMenu('up');
                    return;
                case 'ArrowDown':
                    navigateMenu('down');
                    return;
                case 'Enter':
                    // Select menu option with Enter key
                    handleMenuSelection(gameState.selectedMenuOption + 1);
                    return;
                // Remove direct numeric key selection to follow frame instructions
            }
        } else if (gameState.titleScreenPage > 2) {
            // Any key on other screens returns to menu
            returnToMainMenu();
            return;
        }
    }
    
    // Space to dismiss message
    if (e.code === 'Space' && gameState.messageVisible) {
        messageDisplay.style.display = 'none';
        gameState.messageVisible = false;
        
        // If game over, go to high score entry
        if (gameState.gameOver) {
            showHighScoreEntry();
            return;
        }
        
        // Reset muncher if wrong answer
        if (document.querySelector('.muncher.wrong-eat')) {
            resetMuncherAfterWrongAnswer();
        }
        // Respawn muncher if needed
        else if (!document.querySelector('.muncher') && gameState.lives > 0) {
            spawnMuncher();
        }
        
        return;
    }
    
    // Don't handle other keys if game not running or animation in progress
    if (!gameState.gameRunning || gameState.animationInProgress || gameState.messageVisible) return;
    
    const { row, col } = gameState.muncherPosition;
    let newRow = row;
    let newCol = col;
    
    switch (e.code) {
        case 'ArrowUp':
            newRow = Math.max(0, row - 1);
            break;
        case 'ArrowDown':
            newRow = Math.min(gameState.boardSize.rows - 1, row + 1);
            break;
        case 'ArrowLeft':
            newCol = Math.max(0, col - 1);
            break;
        case 'ArrowRight':
            newCol = Math.min(gameState.boardSize.cols - 1, col + 1);
            break;
        case 'Space':
            eatNumber();
            return;
        case 'Escape': // ESC key to return to menu
            endGame();
            return;
    }
    
    // Move if position changed
    if (newRow !== row || newCol !== col) {
        moveMuncher(newRow, newCol);
    }
}

// Update score display
function updateScore() {
    scoreDisplay.textContent = gameState.score;
}

// Update lives display with muncher sprites
function updateLives() {
    livesContainer.innerHTML = '';
    
    for (let i = 0; i < gameState.lives; i++) {
        const lifeIcon = document.createElement('div');
        lifeIcon.className = 'life-icon';
        livesContainer.appendChild(lifeIcon);
    }
}

// Game over
function gameOver() {
    gameState.gameOver = true;
    gameState.gameRunning = false;
    
    // Show final score and prompt for Hall of Fame
    showMessage(`Game Over!<br>Your score: ${gameState.score}<br>Press Space Bar to continue to Hall of Fame.`);
}

// End game (return to menu)
function endGame() {
    // Reset game state
    gameState.gameRunning = false;
    gameState.gameOver = false;
    gameState.score = 0;
    gameState.lives = 3;
    gameState.level = 1;
    
    // Hide game and show title screen
    gameWrapper.style.display = 'none';
    titleContainer.style.display = 'block';
    showScreen(titleScreen2);
    
    // Reset title screen state
    gameState.titleScreenActive = true;
    gameState.titleScreenPage = 2;
}

// Show high score entry screen
function showHighScoreEntry() {
    // Hide game
    gameWrapper.style.display = 'none';
    messageDisplay.style.display = 'none';
    
    // Show Hall of Fame screen
    titleContainer.style.display = 'block';
    showScreen(hallOfFameScreen);
    
    // Create name entry overlay
    createNameEntryOverlay();
    
    // Update state
    gameState.titleScreenActive = true;
    gameState.titleScreenPage = 3;
    gameState.editingName = true;
    gameState.namePosition = 0;
}

// Create name entry overlay
function createNameEntryOverlay() {
    // Remove any existing overlay
    const existingOverlay = hallOfFameScreen.querySelector('.name-entry-overlay');
    if (existingOverlay) {
        hallOfFameScreen.removeChild(existingOverlay);
    }
    
    // Create new overlay
    const overlay = document.createElement('div');
    overlay.className = 'name-entry-overlay';
    
    // Position for first entry (positioned to fit the Hall of Fame image)
    overlay.style.position = 'absolute';
    overlay.style.top = '148px';
    overlay.style.left = '230px';
    
    // Create name display
    const nameDisplay = document.createElement('div');
    nameDisplay.className = 'name-display';
    nameDisplay.textContent = gameState.playerName;
    overlay.appendChild(nameDisplay);
    
    // Create score display
    const scoreDisplay = document.createElement('div');
    scoreDisplay.className = 'score-display-hof';
    scoreDisplay.textContent = gameState.score;
    scoreDisplay.style.position = 'absolute';
    scoreDisplay.style.left = '100px';
    overlay.appendChild(scoreDisplay);
    
    // Add instructions
    const instructions = document.createElement('div');
    instructions.className = 'name-instructions';
    instructions.textContent = 'ENTER YOUR NAME';
    instructions.style.position = 'absolute';
    instructions.style.top = '-40px';
    instructions.style.left = '-50px';
    instructions.style.width = '200px';
    instructions.style.textAlign = 'center';
    overlay.appendChild(instructions);
    
    // Add to hall of fame screen
    hallOfFameScreen.appendChild(overlay);
    
    // Highlight first character
    highlightNameCharacter();
}

// Highlight the character being edited
function highlightNameCharacter() {
    const nameDisplay = document.querySelector('.name-display');
    if (!nameDisplay) return;
    
    const chars = gameState.playerName.split('');
    nameDisplay.innerHTML = '';
    
    chars.forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char;
        if (index === gameState.namePosition) {
            span.className = 'highlighted-char';
        }
        nameDisplay.appendChild(span);
    });
}

// Edit name character
function editNameCharacter(direction) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    let currentChar = gameState.playerName[gameState.namePosition];
    let currentIndex = chars.indexOf(currentChar);
    
    if (direction === 'up') {
        currentIndex = (currentIndex + 1) % chars.length;
    } else if (direction === 'down') {
        currentIndex = (currentIndex - 1 + chars.length) % chars.length;
    }
    
    const newChar = chars[currentIndex];
    const nameArray = gameState.playerName.split('');
    nameArray[gameState.namePosition] = newChar;
    gameState.playerName = nameArray.join('');
    
    highlightNameCharacter();
}

// Move to next name character
function nextNameCharacter() {
    if (gameState.namePosition < 2) {
        gameState.namePosition++;
        highlightNameCharacter();
    } else {
        // Finished entering name
        saveHighScore();
        returnToMainMenu();
    }
}

// Save high score
function saveHighScore() {
    // In a real implementation, we would save to localStorage or a server
    console.log(`Saved high score: ${gameState.playerName} - ${gameState.score}`);
    
    // Reset for next game
    gameState.editingName = false;
}

// Start the game
function startGame() {
    // Reset game state
    gameState.level = 1;
    gameState.score = 0;
    gameState.lives = 3;
    gameState.messageVisible = false;
    gameState.animationInProgress = false;
    gameState.gameRunning = true;
    gameState.gameOver = false;
    
    // Update displays
    levelDisplay.textContent = `1`;
    goalDisplay.textContent = 'PRIME NUMBERS';
    updateScore();
    updateLives();
    
    // Create game board
    createGameBoard();
    
    // Spawn muncher
    spawnMuncher();
    
    // Show initial message
    showMessage('Eat the prime numbers.<br>Press Space Bar to continue.');
}

// Initialize the game
function initGame() {
    // Show the first title screen initially, not the menu
    titleContainer.style.display = 'block';
    titleScreen1.style.display = 'block';
    titleScreen2.style.display = 'none';
    hallOfFameScreen.style.display = 'none';
    informationScreen.style.display = 'none';
    optionsScreen.style.display = 'none';
    gameWrapper.style.display = 'none';
    
    // Set title screen state
    gameState.titleScreenActive = true;
    gameState.titleScreenPage = 1; // Start with title screen 1
    gameState.currentScreen = titleScreen1;
    gameState.selectedMenuOption = 0; // Default to first option
    gameState.editingName = false;
    
    // Reset game state
    gameState.level = 1;
    gameState.score = 0;
    gameState.lives = 3;
    
    // Add keyboard listener
    document.addEventListener('keydown', handleKeyPress);
    
    // Update lives display
    updateLives();
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', initGame);

// Update for responsive layout
window.addEventListener('resize', function() {
    // If menu screen is visible, update highlight
    if (gameState.titleScreenActive && gameState.titleScreenPage === 2) {
        updateMenuHighlight();
    }
});
