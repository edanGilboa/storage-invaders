// Game state
const gameState = {
    running: false,
    score: 0,
    highScore: 0,
    unicornPosition: { x: 0 },  // Only need x-position since vertical is fixed
    unicornSpeed: 5,
    invaders: [],
    missiles: [],
    clouds: [],
    gameWidth: 0,
    gameHeight: 0,
    invaderMoveDirection: 1,
    invaderMoveSpeed: 0.5,
    invaderDropAmount: 20,
    invaderShootRate: 0.005,
    moveInterval: null,
    invaderTypes: ['s', 'b', 'e', 'v'],  // $ B € ¥ symbols
    invaderPoints: {
        's': 50,   // $ invader
        'b': 30,   // B invader
        'e': 20,   // € invader
        'v': 10    // ¥ invader
    },
    lastMissileFired: 0,
    missileSpeed: 7,
    missileCooldown: 500,  // Milliseconds between missile fires
    keysPressed: {}
};

// DOM Elements
const gameScreen = document.getElementById('game-screen');
const unicorn = document.getElementById('unicorn');
const scoreValue = document.getElementById('score-value');
const messageText = document.getElementById('message-text');
const topScore = document.getElementById('top-score');
const invadersContainer = document.getElementById('invaders-container');
const missilesContainer = document.getElementById('missiles-container');
const cloudsContainer = document.getElementById('clouds-container');

// Initialize game
function initGame() {
    // Set game dimensions
    gameState.gameWidth = gameScreen.clientWidth;
    gameState.gameHeight = gameScreen.clientHeight;
    
    // Initialize unicorn position
    gameState.unicornPosition.x = (gameState.gameWidth / 2) - 20;
    unicorn.style.left = `${gameState.unicornPosition.x}px`;
    
    // Create unicorn image
    unicorn.style.backgroundImage = "url('unicorn.png')";
    
    // Setup event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('keypress', handleKeyPress);
    
    // Responsive adjustments
    window.addEventListener('resize', handleResize);
    
    // Check for saved high score
    const savedHighScore = localStorage.getItem('unicornInvadersHighScore');
    if (savedHighScore) {
        gameState.highScore = parseInt(savedHighScore);
        updateTopScore();
    }
    
    // Generate cloud background
    generateClouds();
}

// Handle window resize
function handleResize() {
    gameState.gameWidth = gameScreen.clientWidth;
    gameState.gameHeight = gameScreen.clientHeight;
    
    // Reposition unicorn if needed
    if (gameState.unicornPosition.x > gameState.gameWidth - 40) {
        gameState.unicornPosition.x = gameState.gameWidth - 40;
        unicorn.style.left = `${gameState.unicornPosition.x}px`;
    }
}

// Handle key presses
function handleKeyDown(e) {
    gameState.keysPressed[e.key] = true;
}

function handleKeyUp(e) {
    gameState.keysPressed[e.key] = false;
}

function handleKeyPress(e) {
    // Space to start game
    if (e.key === ' ' && !gameState.running) {
        startGame();
    }
}

// Start the game
function startGame() {
    if (gameState.running) return;
    
    // Reset game state
    resetGame();
    
    // Create invaders grid
    createInvaders();
    
    // Start game loop
    gameState.running = true;
    messageText.style.display = 'none';
    
    // Start game interval
    gameState.moveInterval = setInterval(gameLoop, 16); // ~60fps
}

// Reset game state
function resetGame() {
    // Clear existing game elements
    clearInvaders();
    clearMissiles();
    
    // Reset game state
    gameState.score = 0;
    gameState.invaderMoveDirection = 1;
    gameState.invaderMoveSpeed = 0.5;
    gameState.invaders = [];
    gameState.missiles = [];
    
    // Reset unicorn position
    gameState.unicornPosition.x = (gameState.gameWidth / 2) - 20;
    unicorn.style.left = `${gameState.unicornPosition.x}px`;
    
    // Update score display
    updateScore();
}

// Create invaders grid
function createInvaders() {
    // Define the layout pattern for invaders
    const pattern = [
        ['s', 's', 's', 's', 's', 's'],  // Top row - $ symbols
        ['b', 'b', 'b', '-', 'b', 'b', 'b'],  // Second row - B symbols
        ['e', 'e', 'e', '-', 'e', 'e', 'e'],  // Third row - € symbols
        ['v', 'v', '-', '-', '-', 'v', 'v']   // Bottom row - ¥ symbols
    ];
    
    // Clear the container
    invadersContainer.innerHTML = '';
    
    // Create invaders based on pattern
    pattern.forEach((row, rowIndex) => {
        row.forEach((type, colIndex) => {
            if (type !== '-') {  // Skip empty positions
                const invader = document.createElement('div');
                invader.className = `invader invader-${type}`;
                
                // Set initial position (adjusted for empty spaces)
                const xPos = colIndex * 55 - (row.length * 55) / 2 + gameState.gameWidth / 2;
                const yPos = rowIndex * 55 + 80;
                
                // Create invader object
                const invaderObj = {
                    element: invader,
                    type: type,
                    position: { x: xPos, y: yPos },
                    width: 40,
                    height: 40,
                    alive: true
                };
                
                // Store in game state
                gameState.invaders.push(invaderObj);
                
                // Set position
                invader.style.position = 'absolute';
                invader.style.left = `${xPos}px`;
                invader.style.top = `${yPos}px`;
                
                // Add content - $ B € ¥ symbols
                if (type === 's') {
                    invader.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;width:100%;height:100%;font-weight:bold;color:white;font-size:22px;">$</div>';
                } else if (type === 'b') {
                    invader.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;width:100%;height:100%;font-weight:bold;color:white;font-size:22px;">B</div>';
                } else if (type === 'e') {
                    invader.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;width:100%;height:100%;font-weight:bold;color:white;font-size:22px;">€</div>';
                } else if (type === 'v') {
                    invader.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;width:100%;height:100%;font-weight:bold;color:white;font-size:22px;">¥</div>';
                }
                
                // Append to container
                invadersContainer.appendChild(invader);
                
                // Add animation
                invader.style.animation = `invaderMove 1s infinite`;
            }
        });
    });
}

// Clear all invaders
function clearInvaders() {
    invadersContainer.innerHTML = '';
    gameState.invaders = [];
}

// Clear all missiles
function clearMissiles() {
    while (missilesContainer && missilesContainer.firstChild) {
        missilesContainer.removeChild(missilesContainer.firstChild);
    }
    gameState.missiles = [];
}

// Generate decorative clouds
function generateClouds() {
    // Add some white cloud-like shapes to the bottom
    for (let i = 0; i < 3; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        
        // Random position along the bottom
        const xPos = i * (gameState.gameWidth / 3) + Math.random() * 50;
        const yPos = gameState.gameHeight - 60 - Math.random() * 20;
        
        cloud.style.left = `${xPos}px`;
        cloud.style.top = `${yPos}px`;
        cloud.style.width = `${60 + Math.random() * 40}px`;
        
        cloudsContainer.appendChild(cloud);
        
        gameState.clouds.push({
            element: cloud,
            position: { x: xPos, y: yPos }
        });
    }
}

// Fire missile
function fireMissile() {
    const now = Date.now();
    
    // Check cooldown
    if (now - gameState.lastMissileFired < gameState.missileCooldown) {
        return;
    }
    
    gameState.lastMissileFired = now;
    
    // Create missile element
    const missile = document.createElement('div');
    missile.className = 'missile';
    
    // Position missile at unicorn's position
    const missileX = gameState.unicornPosition.x + 17; // Center of unicorn
    const missileY = gameState.gameHeight - 120; // Just above unicorn
    
    missile.style.left = `${missileX}px`;
    missile.style.top = `${missileY}px`;
    
    // Add to DOM
    missilesContainer.appendChild(missile);
    
    // Add to game state
    gameState.missiles.push({
        element: missile,
        position: { x: missileX, y: missileY },
        width: 6,
        height: 15
    });
}

// Game loop
function gameLoop() {
    if (!gameState.running) return;
    
    // Move unicorn
    moveUnicorn();
    
    // Move invaders
    moveInvaders();
    
    // Move missiles
    moveMissiles();
    
    // Check collisions
    checkCollisions();
    
    // Check win/lose conditions
    checkGameConditions();
}

// Move unicorn based on keys pressed
function moveUnicorn() {
    if (gameState.keysPressed['ArrowLeft']) {
        gameState.unicornPosition.x -= gameState.unicornSpeed;
    }
    
    if (gameState.keysPressed['ArrowRight']) {
        gameState.unicornPosition.x += gameState.unicornSpeed;
    }
    
    // Keep unicorn within game bounds
    if (gameState.unicornPosition.x < 0) {
        gameState.unicornPosition.x = 0;
    }
    
    if (gameState.unicornPosition.x > gameState.gameWidth - 40) {
        gameState.unicornPosition.x = gameState.gameWidth - 40;
    }
    
    // Update unicorn position
    unicorn.style.left = `${gameState.unicornPosition.x}px`;
    
    // Fire missile if space is pressed
    if (gameState.keysPressed[' ']) {
        fireMissile();
    }
}

// Move invaders as a group
function moveInvaders() {
    let moveDown = false;
    let leftMost = gameState.gameWidth;
    let rightMost = 0;
    
    // Find edges of invader group
    gameState.invaders.forEach(invader => {
        if (invader.alive) {
            if (invader.position.x < leftMost) {
                leftMost = invader.position.x;
            }
            
            if (invader.position.x + invader.width > rightMost) {
                rightMost = invader.position.x + invader.width;
            }
        }
    });
    
    // Check if invaders hit edge of screen
    if (rightMost >= gameState.gameWidth - 10 && gameState.invaderMoveDirection > 0) {
        gameState.invaderMoveDirection = -1;
        moveDown = true;
    } else if (leftMost <= 10 && gameState.invaderMoveDirection < 0) {
        gameState.invaderMoveDirection = 1;
        moveDown = true;
    }
    
    // Move each invader
    gameState.invaders.forEach(invader => {
        if (invader.alive) {
            invader.position.x += gameState.invaderMoveSpeed * gameState.invaderMoveDirection;
            
            if (moveDown) {
                invader.position.y += gameState.invaderDropAmount;
            }
            
            // Update position
            invader.element.style.left = `${invader.position.x}px`;
            invader.element.style.top = `${invader.position.y}px`;
        }
    });
    
    // Increase speed slightly over time
    gameState.invaderMoveSpeed += 0.0001;
}

// Move missiles
function moveMissiles() {
    for (let i = gameState.missiles.length - 1; i >= 0; i--) {
        const missile = gameState.missiles[i];
        
        // Move missile up
        missile.position.y -= gameState.missileSpeed;
        missile.element.style.top = `${missile.position.y}px`;
        
        // Remove if off screen
        if (missile.position.y < -20) {
            missilesContainer.removeChild(missile.element);
            gameState.missiles.splice(i, 1);
        }
    }
}

// Check for collisions
function checkCollisions() {
    // Check each missile against each invader
    for (let i = gameState.missiles.length - 1; i >= 0; i--) {
        const missile = gameState.missiles[i];
        
        for (let j = gameState.invaders.length - 1; j >= 0; j--) {
            const invader = gameState.invaders[j];
            
            if (invader.alive && checkCollision(missile, invader)) {
                // Missile hit invader
                handleInvaderHit(missile, invader);
                break; // One missile can only hit one invader
            }
        }
    }
}

// Check if two objects collide
function checkCollision(obj1, obj2) {
    return (
        obj1.position.x < obj2.position.x + obj2.width &&
        obj1.position.x + obj1.width > obj2.position.x &&
        obj1.position.y < obj2.position.y + obj2.height &&
        obj1.position.y + obj1.height > obj2.position.y
    );
}

// Handle invader being hit
function handleInvaderHit(missile, invader) {
    // Mark invader as dead
    invader.alive = false;
    
    // Remove invader from screen with explosion effect
    invader.element.style.backgroundColor = "transparent";
    invader.element.innerHTML = "💥";
    invader.element.style.animation = "flash 0.3s 3";
    
    setTimeout(() => {
        if (invader.element.parentNode) {
            invader.element.parentNode.removeChild(invader.element);
        }
    }, 300);
    
    // Remove missile
    if (missile.element.parentNode) {
        missile.element.parentNode.removeChild(missile.element);
    }
    
    // Remove missile from game state
    const missileIndex = gameState.missiles.indexOf(missile);
    if (missileIndex > -1) {
        gameState.missiles.splice(missileIndex, 1);
    }
    
    // Add score based on invader type
    gameState.score += gameState.invaderPoints[invader.type] || 10;
    updateScore();
}

// Check game win/lose conditions
function checkGameConditions() {
    // Check if all invaders are destroyed (win)
    const remainingInvaders = gameState.invaders.filter(invader => invader.alive);
    
    if (remainingInvaders.length === 0) {
        // Player wins!
        endGame(true);
        return;
    }
    
    // Check if any invaders have reached the bottom (lose)
    for (const invader of gameState.invaders) {
        if (invader.alive && invader.position.y + invader.height >= gameState.gameHeight - 80) {
            // Game over - invaders reached the bottom
            endGame(false);
            return;
        }
    }
}

// End the game
function endGame(playerWon) {
    gameState.running = false;
    clearInterval(gameState.moveInterval);
    
    // Update high score if needed
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('unicornInvadersHighScore', gameState.highScore);
        updateTopScore();
    }
    
    // Show appropriate message
    if (playerWon) {
        messageText.textContent = "YOU WIN!";
    } else {
        messageText.textContent = "GAME OVER";
    }
    
    messageText.style.display = 'block';
    
    // Allow restart with space
    setTimeout(() => {
        messageText.textContent = "PRESS SPACE TO RESTART";
    }, 2000);
}

// Update score display
function updateScore() {
    scoreValue.textContent = gameState.score;
}

// Update top score display
function updateTopScore() {
    topScore.textContent = gameState.highScore.toString().padStart(2, '0');
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', initGame);
