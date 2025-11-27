// =====================================
// Helix Jump - The Fruit Crave
// A nostalgic helix jump game with fruits
// =====================================

// Game Constants
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 700;

// Level Configurations
const LEVELS = {
    1: {
        name: "Sunny Meadow",
        floors: 10,
        timeLimit: 60,
        towerColor: "#FF9AA2",
        platformColor: "#FFDAC1",
        gapColor: "#B5EAD7",
        ballColor: "#FF6B6B",
        bgGradient: ["#FFE5B4", "#FFDAB9", "#FFA07A"],
        fruitFrequency: 0.4,
        difficulty: 1,
        description: "A bright and welcoming world!"
    },
    2: {
        name: "Ocean Breeze",
        floors: 12,
        timeLimit: 55,
        towerColor: "#89CFF0",
        platformColor: "#00CED1",
        gapColor: "#E0FFFF",
        ballColor: "#FF6347",
        bgGradient: ["#87CEEB", "#00BFFF", "#1E90FF"],
        fruitFrequency: 0.35,
        difficulty: 1.2,
        description: "Dive into the refreshing ocean!"
    },
    3: {
        name: "Forest Dream",
        floors: 14,
        timeLimit: 50,
        towerColor: "#228B22",
        platformColor: "#90EE90",
        gapColor: "#98FB98",
        ballColor: "#FF4500",
        bgGradient: ["#9ACD32", "#6B8E23", "#556B2F"],
        fruitFrequency: 0.35,
        difficulty: 1.4,
        description: "Explore the enchanted forest!"
    },
    4: {
        name: "Desert Sunset",
        floors: 16,
        timeLimit: 50,
        towerColor: "#DEB887",
        platformColor: "#F4A460",
        gapColor: "#FFEFD5",
        ballColor: "#DC143C",
        bgGradient: ["#FF7F50", "#FF6347", "#CD5C5C"],
        fruitFrequency: 0.3,
        difficulty: 1.6,
        description: "Race against the setting sun!"
    },
    5: {
        name: "Space Journey",
        floors: 18,
        timeLimit: 45,
        towerColor: "#4B0082",
        platformColor: "#9370DB",
        gapColor: "#E6E6FA",
        ballColor: "#00FF7F",
        bgGradient: ["#191970", "#000080", "#000033"],
        fruitFrequency: 0.3,
        difficulty: 1.8,
        description: "The final frontier awaits!"
    }
};

// Fruit Types
const FRUITS = {
    BANANA: {
        emoji: "🍌",
        name: "Banana",
        effect: "speed",
        duration: 5000,
        color: "#FFE135"
    },
    APPLE: {
        emoji: "🍎",
        name: "Apple",
        effect: "life",
        color: "#FF0000"
    },
    CHOCOLATE: {
        emoji: "🍫",
        name: "Chocolate",
        effect: "time",
        bonus: 5,
        color: "#8B4513"
    }
};

// Game State
let canvas, ctx;
let gameState = "menu"; // menu, levelSelect, playing, paused, levelComplete, gameOver
let currentLevel = 1;
let unlockedLevels = 1;
let score = 0;
let lives = 3;
let timeRemaining = 60;
let timerInterval = null;

// Ball properties
let ball = {
    x: CANVAS_WIDTH / 2,
    y: 150,
    radius: 12,
    velocityY: 0,
    velocityX: 0,
    gravity: 0.3,
    bounce: -0.3,
    onPlatform: false,
    speedBoost: 1,
    speedBoostTimer: null
};

// Tower properties
let tower = {
    rotation: 0,
    rotationSpeed: 0,
    targetRotation: 0,
    platforms: [],
    centerX: CANVAS_WIDTH / 2,
    radius: 80,
    platformHeight: 15,
    platformGap: 50,
    scrollOffset: 0
};

// Fruits on platforms
let fruits = [];

// Audio Context for nostalgic sounds
let audioContext = null;
let backgroundMusic = null;

// Initialize the game
function init() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    
    // Set canvas size
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    // Load saved progress
    loadProgress();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update level buttons
    updateLevelButtons();
    
    // Start the game loop
    requestAnimationFrame(gameLoop);
}

// Setup event listeners
function setupEventListeners() {
    // Keyboard controls
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    
    // Touch controls for mobile
    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchmove", handleTouchMove);
    canvas.addEventListener("touchend", handleTouchEnd);
    
    // Button listeners
    document.getElementById("start-btn").addEventListener("click", showLevelSelect);
    document.getElementById("back-btn").addEventListener("click", showMainMenu);
    document.getElementById("next-level-btn").addEventListener("click", nextLevel);
    document.getElementById("menu-btn").addEventListener("click", showMainMenu);
    document.getElementById("retry-btn").addEventListener("click", retryLevel);
    document.getElementById("game-over-menu-btn").addEventListener("click", showMainMenu);
    
    // Level buttons
    document.querySelectorAll(".level-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const level = parseInt(e.currentTarget.dataset.level);
            if (level <= unlockedLevels) {
                startLevel(level);
            }
        });
    });
}

// Keyboard handling
let keysPressed = {};

function handleKeyDown(e) {
    keysPressed[e.key] = true;
    
    if (gameState === "playing") {
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
            tower.rotationSpeed = -0.05 * ball.speedBoost;
        } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
            tower.rotationSpeed = 0.05 * ball.speedBoost;
        } else if (e.key === "Escape") {
            pauseGame();
        }
    }
}

function handleKeyUp(e) {
    keysPressed[e.key] = false;
    
    if (gameState === "playing") {
        if ((e.key === "ArrowLeft" || e.key === "a" || e.key === "A") && tower.rotationSpeed < 0) {
            tower.rotationSpeed = 0;
        } else if ((e.key === "ArrowRight" || e.key === "d" || e.key === "D") && tower.rotationSpeed > 0) {
            tower.rotationSpeed = 0;
        }
    }
}

// Touch handling
let touchStartX = 0;

function handleTouchStart(e) {
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
}

function handleTouchMove(e) {
    e.preventDefault();
    if (gameState !== "playing") return;
    
    const touchX = e.touches[0].clientX;
    const diff = touchX - touchStartX;
    tower.rotationSpeed = (diff / 50) * 0.05 * ball.speedBoost;
    touchStartX = touchX;
}

function handleTouchEnd(e) {
    e.preventDefault();
    tower.rotationSpeed = 0;
}

// Screen management
function showMainMenu() {
    gameState = "menu";
    stopTimer();
    document.getElementById("start-screen").classList.remove("hidden");
    document.getElementById("level-select-screen").classList.add("hidden");
    document.getElementById("level-complete-screen").classList.add("hidden");
    document.getElementById("game-over-screen").classList.add("hidden");
    document.getElementById("game-ui").classList.add("hidden");
}

function showLevelSelect() {
    gameState = "levelSelect";
    updateLevelButtons();
    document.getElementById("start-screen").classList.add("hidden");
    document.getElementById("level-select-screen").classList.remove("hidden");
}

function updateLevelButtons() {
    document.querySelectorAll(".level-btn").forEach(btn => {
        const level = parseInt(btn.dataset.level);
        if (level <= unlockedLevels) {
            btn.classList.remove("locked");
        } else {
            btn.classList.add("locked");
        }
    });
}

// Start a level
function startLevel(level) {
    currentLevel = level;
    const levelConfig = LEVELS[level];
    
    // Reset game state
    score = 0;
    lives = 3;
    timeRemaining = levelConfig.timeLimit;
    
    // Reset ball
    ball.x = CANVAS_WIDTH / 2;
    ball.y = 150;
    ball.velocityY = 0;
    ball.velocityX = 0;
    ball.onPlatform = false;
    ball.speedBoost = 1;
    
    // Reset tower
    tower.rotation = 0;
    tower.rotationSpeed = 0;
    tower.scrollOffset = 0;
    
    // Generate platforms
    generatePlatforms(levelConfig);
    
    // Hide screens, show game UI
    document.getElementById("start-screen").classList.add("hidden");
    document.getElementById("level-select-screen").classList.add("hidden");
    document.getElementById("level-complete-screen").classList.add("hidden");
    document.getElementById("game-over-screen").classList.add("hidden");
    document.getElementById("game-ui").classList.remove("hidden");
    
    // Update UI
    updateUI();
    
    // Start game
    gameState = "playing";
    startTimer();
    
    // Play background music
    playBackgroundMusic();
}

// Generate platforms for current level
function generatePlatforms(levelConfig) {
    tower.platforms = [];
    fruits = [];
    
    const gapSize = Math.PI / 3; // Gap size in radians
    const numPlatforms = levelConfig.floors;
    
    for (let i = 0; i < numPlatforms; i++) {
        const y = 200 + i * tower.platformGap;
        const gapStart = Math.random() * Math.PI * 2;
        
        // Create platform segments (the gaps are where ball can fall through)
        const platform = {
            y: y,
            gapStart: gapStart,
            gapEnd: gapStart + gapSize,
            hasCollectible: false,
            collectible: null
        };
        
        // Add fruits based on frequency
        if (Math.random() < levelConfig.fruitFrequency) {
            platform.hasCollectible = true;
            const fruitTypes = Object.keys(FRUITS);
            const randomFruit = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
            
            // Position fruit on platform (not in gap)
            const fruitAngle = gapStart + gapSize + Math.random() * (Math.PI * 2 - gapSize);
            
            platform.collectible = {
                type: randomFruit,
                angle: fruitAngle,
                collected: false
            };
        }
        
        tower.platforms.push(platform);
    }
    
    // Update floor display
    document.getElementById("total-floors").textContent = numPlatforms;
    document.getElementById("current-floor").textContent = 1;
}

// Timer functions
function startTimer() {
    stopTimer();
    timerInterval = setInterval(() => {
        if (gameState === "playing") {
            timeRemaining--;
            document.getElementById("timer").textContent = timeRemaining;
            
            if (timeRemaining <= 0) {
                gameOver("Time's up!");
            }
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function pauseGame() {
    gameState = "paused";
}

// Update UI elements
function updateUI() {
    // Update lives
    let heartsHtml = "";
    for (let i = 0; i < lives; i++) {
        heartsHtml += "❤️ ";
    }
    document.getElementById("lives-hearts").textContent = heartsHtml || "💔";
    
    // Update score
    document.getElementById("score").textContent = score;
    
    // Update timer
    document.getElementById("timer").textContent = timeRemaining;
    
    // Update level info
    document.getElementById("current-level").textContent = `Level ${currentLevel}`;
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    if (gameState === "playing") {
        update();
    }
    
    render();
    
    requestAnimationFrame(gameLoop);
}

// Update game physics
function update() {
    const levelConfig = LEVELS[currentLevel];
    
    // Update tower rotation
    tower.rotation += tower.rotationSpeed;
    
    // Apply gravity
    ball.velocityY += ball.gravity;
    
    // Update ball position
    ball.y += ball.velocityY;
    
    // Check platform collisions
    checkPlatformCollisions();
    
    // Check if ball reached bottom
    checkLevelComplete();
    
    // Check if ball fell off screen (rare edge case)
    if (ball.y > CANVAS_HEIGHT + 100) {
        loseLife();
    }
    
    // Scroll view to follow ball
    const targetScroll = Math.max(0, ball.y - 300);
    tower.scrollOffset += (targetScroll - tower.scrollOffset) * 0.1;
    
    // Update floor display
    const currentFloor = Math.floor((ball.y - 200) / tower.platformGap) + 1;
    document.getElementById("current-floor").textContent = Math.max(1, Math.min(currentFloor, levelConfig.floors));
}

// Check collisions with platforms
function checkPlatformCollisions() {
    const levelConfig = LEVELS[currentLevel];
    
    for (let platform of tower.platforms) {
        const relativeY = platform.y - tower.scrollOffset;
        
        // Check if ball is at platform height
        if (ball.y + ball.radius >= platform.y && 
            ball.y + ball.radius <= platform.y + tower.platformHeight &&
            ball.velocityY > 0) {
            
            // Calculate ball angle on platform
            const ballAngle = Math.atan2(0, 0) + tower.rotation; // Ball is at center
            
            // Normalize angles
            let gapStart = platform.gapStart + tower.rotation;
            let gapEnd = platform.gapEnd + tower.rotation;
            
            // Normalize to 0-2PI
            gapStart = ((gapStart % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            gapEnd = ((gapEnd % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            
            // Check if ball is in gap (can pass through)
            const inGap = isAngleInGap(0, gapStart, gapEnd);
            
            if (!inGap) {
                // Ball hits platform - bounce
                ball.y = platform.y - ball.radius;
                ball.velocityY = 0;
                ball.onPlatform = true;
                
                // Check for collectibles
                if (platform.hasCollectible && platform.collectible && !platform.collectible.collected) {
                    collectFruit(platform);
                }
            } else {
                // Ball passes through gap
                ball.onPlatform = false;
                score += 10;
                updateUI();
                
                // Play drop sound
                playSound("drop");
            }
        }
    }
}

// Check if angle is within gap
function isAngleInGap(angle, gapStart, gapEnd) {
    // Normalize angle to 0-2PI
    angle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    
    if (gapStart <= gapEnd) {
        return angle >= gapStart && angle <= gapEnd;
    } else {
        // Gap wraps around
        return angle >= gapStart || angle <= gapEnd;
    }
}

// Collect fruit power-up
function collectFruit(platform) {
    const collectible = platform.collectible;
    collectible.collected = true;
    
    const fruitData = FRUITS[collectible.type];
    
    // Apply effect based on fruit type
    switch (fruitData.effect) {
        case "speed":
            // Banana - Speed boost
            ball.speedBoost = 2;
            showPowerup("🍌 Speed Boost!");
            
            // Clear existing timer
            if (ball.speedBoostTimer) {
                clearTimeout(ball.speedBoostTimer);
            }
            
            // Set timer to remove boost
            ball.speedBoostTimer = setTimeout(() => {
                ball.speedBoost = 1;
                hidePowerup();
            }, fruitData.duration);
            break;
            
        case "life":
            // Apple - Extra life
            lives = Math.min(lives + 1, 5);
            showPowerup("🍎 +1 Life!");
            setTimeout(hidePowerup, 1500);
            break;
            
        case "time":
            // Chocolate - Extra time
            timeRemaining += fruitData.bonus;
            showPowerup("🍫 +5 Seconds!");
            setTimeout(hidePowerup, 1500);
            break;
    }
    
    score += 50;
    updateUI();
    playSound("collect");
}

// Show power-up message
function showPowerup(message) {
    const powerupEl = document.getElementById("speed-boost");
    powerupEl.textContent = message;
    powerupEl.classList.remove("hidden");
}

function hidePowerup() {
    document.getElementById("speed-boost").classList.add("hidden");
}

// Lose a life
function loseLife() {
    lives--;
    updateUI();
    playSound("hit");
    
    if (lives <= 0) {
        gameOver("No lives left!");
    } else {
        // Reset ball position
        ball.y = 150 + tower.scrollOffset;
        ball.velocityY = 0;
    }
}

// Check if level is complete
function checkLevelComplete() {
    const levelConfig = LEVELS[currentLevel];
    const lastPlatformY = 200 + (levelConfig.floors - 1) * tower.platformGap;
    
    if (ball.y > lastPlatformY + tower.platformGap) {
        levelComplete();
    }
}

// Level complete
function levelComplete() {
    gameState = "levelComplete";
    stopTimer();
    
    // Calculate bonuses
    const timeBonus = timeRemaining * 10;
    const finalScore = score + timeBonus;
    
    // Unlock next level
    if (currentLevel < 5) {
        unlockedLevels = Math.max(unlockedLevels, currentLevel + 1);
        saveProgress();
    }
    
    // Update UI
    document.getElementById("final-score").textContent = score;
    document.getElementById("time-bonus").textContent = timeBonus;
    document.getElementById("game-ui").classList.add("hidden");
    document.getElementById("level-complete-screen").classList.remove("hidden");
    
    // Hide next level button if on last level
    if (currentLevel >= 5) {
        document.getElementById("next-level-btn").style.display = "none";
    } else {
        document.getElementById("next-level-btn").style.display = "inline-block";
    }
    
    playSound("win");
}

// Game over
function gameOver(reason) {
    gameState = "gameOver";
    stopTimer();
    
    document.getElementById("game-over-score").textContent = score;
    document.getElementById("game-ui").classList.add("hidden");
    document.getElementById("game-over-screen").classList.remove("hidden");
    
    playSound("lose");
}

// Next level
function nextLevel() {
    if (currentLevel < 5) {
        startLevel(currentLevel + 1);
    }
}

// Retry level
function retryLevel() {
    startLevel(currentLevel);
}

// Save/Load progress
function saveProgress() {
    localStorage.setItem("helixJump_unlockedLevels", unlockedLevels);
}

function loadProgress() {
    const saved = localStorage.getItem("helixJump_unlockedLevels");
    if (saved) {
        unlockedLevels = parseInt(saved);
    }
}

// Rendering
function render() {
    const levelConfig = LEVELS[currentLevel] || LEVELS[1];
    
    // Draw background
    drawBackground(levelConfig);
    
    if (gameState === "playing" || gameState === "paused") {
        // Draw tower center
        drawTowerCenter(levelConfig);
        
        // Draw platforms
        drawPlatforms(levelConfig);
        
        // Draw ball
        drawBall(levelConfig);
    }
}

// Draw background gradient
function drawBackground(levelConfig) {
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, levelConfig.bgGradient[0]);
    gradient.addColorStop(0.5, levelConfig.bgGradient[1]);
    gradient.addColorStop(1, levelConfig.bgGradient[2]);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Add some stars for space level
    if (currentLevel === 5) {
        drawStars();
    }
}

// Draw stars for space level
function drawStars() {
    ctx.fillStyle = "white";
    for (let i = 0; i < 50; i++) {
        const x = (Math.sin(i * 123.456) * 0.5 + 0.5) * CANVAS_WIDTH;
        const y = (Math.cos(i * 789.012) * 0.5 + 0.5) * CANVAS_HEIGHT;
        const size = 1 + Math.sin(Date.now() / 1000 + i) * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Draw tower center column
function drawTowerCenter(levelConfig) {
    const centerRadius = 25;
    
    // Draw column
    ctx.fillStyle = levelConfig.towerColor;
    ctx.fillRect(
        tower.centerX - centerRadius,
        0,
        centerRadius * 2,
        CANVAS_HEIGHT
    );
    
    // Add gradient overlay
    const gradient = ctx.createLinearGradient(
        tower.centerX - centerRadius, 0,
        tower.centerX + centerRadius, 0
    );
    gradient.addColorStop(0, "rgba(255,255,255,0.3)");
    gradient.addColorStop(0.5, "rgba(255,255,255,0.1)");
    gradient.addColorStop(1, "rgba(0,0,0,0.2)");
    
    ctx.fillStyle = gradient;
    ctx.fillRect(
        tower.centerX - centerRadius,
        0,
        centerRadius * 2,
        CANVAS_HEIGHT
    );
}

// Draw platforms
function drawPlatforms(levelConfig) {
    for (let platform of tower.platforms) {
        const y = platform.y - tower.scrollOffset;
        
        // Only draw visible platforms
        if (y < -50 || y > CANVAS_HEIGHT + 50) continue;
        
        drawPlatformRing(platform, y, levelConfig);
        
        // Draw collectible if present
        if (platform.hasCollectible && platform.collectible && !platform.collectible.collected) {
            drawCollectible(platform, y);
        }
    }
}

// Draw a single platform ring
function drawPlatformRing(platform, y, levelConfig) {
    let gapStart = platform.gapStart + tower.rotation;
    let gapEnd = platform.gapEnd + tower.rotation;
    
    // Normalize angles to 0-2PI
    gapStart = ((gapStart % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    gapEnd = ((gapEnd % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    
    // Convert gap angles to screen positions
    // The gap is visible when it's at the "front" of the tower (around angle 0 or PI)
    // We'll draw the platform as a horizontal bar with a visible gap
    
    const leftEdge = tower.centerX - tower.radius;
    const rightEdge = tower.centerX + tower.radius;
    const platformWidth = tower.radius * 2;
    
    // Calculate gap position on the visible platform
    // Map angle to x position: angle 0 = right side, PI = left side
    // For visual clarity, we'll show the gap as a section of the platform
    
    // Draw platform in two parts with gap in between
    const gapCenterAngle = (gapStart + (platform.gapEnd - platform.gapStart) / 2 + tower.rotation);
    const normalizedGapCenter = ((gapCenterAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    
    // Convert angle to x position (cosine mapping)
    const gapCenterX = tower.centerX + Math.cos(normalizedGapCenter) * tower.radius * 0.8;
    const gapWidth = 40; // Visual gap width in pixels
    
    // Draw left portion of platform (from center column to gap)
    const centerColumnRight = tower.centerX + 25;
    
    // Draw shadow first
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(leftEdge, y + 3, platformWidth, tower.platformHeight);
    
    // Determine if gap is visible (front-facing)
    const gapVisible = normalizedGapCenter < Math.PI / 2 || normalizedGapCenter > Math.PI * 3 / 2;
    
    if (gapVisible) {
        // Draw platform with visible gap
        const gapLeft = Math.max(leftEdge, gapCenterX - gapWidth / 2);
        const gapRight = Math.min(rightEdge, gapCenterX + gapWidth / 2);
        
        // Left section
        if (gapLeft > leftEdge) {
            drawPlatformSection(leftEdge, gapLeft, y, levelConfig);
        }
        
        // Right section
        if (gapRight < rightEdge) {
            drawPlatformSection(gapRight, rightEdge, y, levelConfig);
        }
    } else {
        // Gap is on the back, draw full platform
        drawPlatformSection(leftEdge, rightEdge, y, levelConfig);
    }
}

// Helper function to draw a platform section
function drawPlatformSection(x1, x2, y, levelConfig) {
    if (x2 <= x1) return;
    
    // Main platform body
    const gradient = ctx.createLinearGradient(x1, y, x1, y + tower.platformHeight);
    gradient.addColorStop(0, adjustBrightness(levelConfig.platformColor, 1.2));
    gradient.addColorStop(0.5, levelConfig.platformColor);
    gradient.addColorStop(1, adjustBrightness(levelConfig.platformColor, 0.7));
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    // Use fillRect for better browser compatibility
    ctx.fillRect(x1, y, x2 - x1, tower.platformHeight);
    
    // Top highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillRect(x1, y, x2 - x1, 2);
    
    // Bottom shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(x1, y + tower.platformHeight - 2, x2 - x1, 2);
}

// Adjust color brightness
function adjustBrightness(color, factor) {
    // Convert hex to RGB
    let r, g, b;
    if (color.startsWith("#")) {
        const hex = color.slice(1);
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
    } else {
        return color;
    }
    
    // Adjust
    r = Math.min(255, Math.max(0, Math.floor(r * factor)));
    g = Math.min(255, Math.max(0, Math.floor(g * factor)));
    b = Math.min(255, Math.max(0, Math.floor(b * factor)));
    
    return `rgb(${r}, ${g}, ${b})`;
}

// Draw collectible on platform
function drawCollectible(platform, y) {
    const collectible = platform.collectible;
    const fruitData = FRUITS[collectible.type];
    
    // Calculate position
    const angle = collectible.angle + tower.rotation;
    const x = tower.centerX + Math.cos(angle) * (tower.radius * 0.7);
    
    // Draw fruit emoji
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(fruitData.emoji, x, y - 10);
    
    // Add glow effect
    ctx.shadowColor = fruitData.color;
    ctx.shadowBlur = 10;
    ctx.fillText(fruitData.emoji, x, y - 10);
    ctx.shadowBlur = 0;
}

// Draw the ball
function drawBall(levelConfig) {
    const ballY = ball.y - tower.scrollOffset;
    
    // Ball shadow
    ctx.beginPath();
    ctx.ellipse(ball.x + 5, ballY + 5, ball.radius, ball.radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fill();
    
    // Ball body
    ctx.beginPath();
    ctx.arc(ball.x, ballY, ball.radius, 0, Math.PI * 2);
    
    // Gradient for 3D effect
    const gradient = ctx.createRadialGradient(
        ball.x - ball.radius * 0.3, ballY - ball.radius * 0.3, 0,
        ball.x, ballY, ball.radius
    );
    gradient.addColorStop(0, "white");
    gradient.addColorStop(0.3, levelConfig.ballColor);
    gradient.addColorStop(1, adjustBrightness(levelConfig.ballColor, 0.6));
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Add shine
    ctx.beginPath();
    ctx.arc(ball.x - ball.radius * 0.3, ballY - ball.radius * 0.3, ball.radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fill();
    
    // Speed boost effect
    if (ball.speedBoost > 1) {
        ctx.beginPath();
        ctx.arc(ball.x, ballY, ball.radius + 5, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 215, 0, 0.7)";
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}

// Audio functions - Simple Web Audio API sounds
function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log("Web Audio API not supported");
    }
}

function playSound(type) {
    if (!audioContext) {
        initAudio();
    }
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
        case "drop":
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
            
        case "collect":
            oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
            
        case "hit":
            oscillator.type = "sawtooth";
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
            break;
            
        case "win":
            playMelody([523, 587, 659, 698, 784, 880, 988, 1047], 0.1);
            break;
            
        case "lose":
            playMelody([400, 350, 300, 250, 200], 0.15);
            break;
    }
}

function playMelody(notes, duration) {
    if (!audioContext) return;
    
    notes.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * duration);
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime + index * duration);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * duration + duration);
        
        oscillator.start(audioContext.currentTime + index * duration);
        oscillator.stop(audioContext.currentTime + index * duration + duration);
    });
}

function playBackgroundMusic() {
    // Background music would be implemented with actual audio files
    // For now, we'll use simple generated tones
    if (!audioContext) {
        initAudio();
    }
}

// Initialize game when page loads
window.addEventListener("load", init);
