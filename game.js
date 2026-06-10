// canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// player setup
const player = {
    x: 400,
    y: 430,
    width: 40,
    height: 40,
    speed: 5
};

// keyboard durability
const durability = {
    a: 20,
    d: 20
};

const maxDurability = {
    a: 20,
    d: 20
};

const brokenKeys = new Set();

// game state
let gameStarted = false;

//controls
const keys = {};

document.addEventListener("keydown", (e) => {

    const key = e.key.toLowerCase();

    if (key === " ") return;
    if (brokenKeys.has(key)) return;

    keys[key] = true;

    if (durability[key] !== undefined) {

        durability[key]--;

        if (durability[key] <= 0) {
            brokenKeys.add(key);
        }

        renderKeyboard();
    }
});

document.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

// obstacles
const obstacles = [];
const items = [];

function spawnObstacle() {

    obstacles.push({
        x: Math.random() * (canvas.width - 30),
        y: -30,
        width: 30,
        height: 30,
        speed: 3 + Math.random() * 3
    });
}

setInterval(spawnObstacle, 1000);

function spawnItem() {
    const key = Math.random() < 0.5 ? "a" : "d";

    items.push({
        x: Math.random() * (canvas.width - 24),
        y: -24,
        width: 24,
        height: 24,
        speed: 2 + Math.random() * 2,
        key
    });
}

setInterval(spawnItem, 3500);

// update game
let gameOver = false;

function showMenu(titleText, subtitleText, buttonText) {
    document.getElementById("menuTitle").textContent = titleText;
    document.getElementById("menuSubtitle").textContent = subtitleText;
    document.getElementById("startBtn").textContent = buttonText;
    document.getElementById("menu").style.display = "flex";
}

function showMainMenu() {
    document.getElementById("menuTitle").textContent = "Keyboard Survival";
    document.getElementById("menuSubtitle").textContent = "Press the button to start the game.";
    document.getElementById("startBtn").textContent = "Start Game";
    document.getElementById("howToPlayBtn").textContent = "How to Play";
    document.getElementById("instructions").hidden = true;
    document.getElementById("menuButtons").style.display = "flex";
    document.getElementById("menu").style.display = "flex";
}

function showGameOverScreen() {
    updateBestScore();
    document.getElementById("menuTitle").textContent = "Game Over";
    document.getElementById("menuSubtitle").textContent = `Current Result: ${Math.floor(score)}\nBest Result: ${Math.floor(bestScore)}`;
    document.getElementById("startBtn").textContent = "Play Again";
    document.getElementById("howToPlayBtn").textContent = "Main Menu";
    document.getElementById("instructions").hidden = true;
    document.getElementById("menuButtons").style.display = "flex";
    document.getElementById("menu").style.display = "flex";
}

function healKey(key) {
    if (durability[key] < maxDurability[key]) {
        durability[key] = maxDurability[key];
    }

    brokenKeys.delete(key);
    renderKeyboard();
    updateHUD();
}

function startGame() {
    gameStarted = true;
    gameOver = false;
    score = 0;
    survivalTime = 0;
    obstacles.length = 0;
    items.length = 0;
    brokenKeys.clear();

    Object.keys(durability).forEach(key => {
        durability[key] = maxDurability[key];
    });

    Object.keys(keys).forEach(key => {
        delete keys[key];
    });

    player.x = 400;
    renderKeyboard();
    updateHUD();

    document.getElementById("menu").style.display = "none";
}

function update() {

    if (!gameStarted) return;

    if (gameOver) return;

    if (keys["a"] && !brokenKeys.has("a")) {
        player.x -= player.speed;
    }

    if (keys["d"] && !brokenKeys.has("d")) {
        player.x += player.speed;
    }

    player.x = Math.max(0, player.x);
    player.x = Math.min(canvas.width - player.width, player.x);

    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.y += obstacle.speed;

        if (obstacle.y > canvas.height) {
            obstacles.splice(i, 1);
            score += 1;
            continue;
        }

        if (
            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y
        ) {
            gameOver = true;
            gameStarted = false;
            showGameOverScreen();
        }
    }

    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        item.y += item.speed;

        if (item.y > canvas.height) {
            items.splice(i, 1);
            continue;
        }

        if (
            player.x < item.x + item.width &&
            player.x + player.width > item.x &&
            player.y < item.y + item.height &&
            player.y + player.height > item.y
        ) {
            items.splice(i, 1);
            healKey(item.key);
        }
    }
}

// draw
function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameStarted) return;

    ctx.fillStyle = "cyan";
    ctx.fillRect(
        player.x,
        player.y,
        player.width,
        player.height
    );

    ctx.fillStyle = "red";

    obstacles.forEach(obstacle => {
        ctx.fillRect(
            obstacle.x,
            obstacle.y,
            obstacle.width,
            obstacle.height
        );
    });

    items.forEach(item => {
        ctx.fillStyle = item.key === "a" ? "lime" : "orange";

        if (item.key === "a") {
            ctx.beginPath();
            ctx.moveTo(item.x + item.width / 2, item.y);
            ctx.lineTo(item.x + item.width, item.y + item.height / 2);
            ctx.lineTo(item.x + item.width / 2, item.y + item.height);
            ctx.lineTo(item.x, item.y + item.height / 2);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.moveTo(item.x + item.width / 2, item.y);
            ctx.lineTo(item.x + item.width, item.y + item.height);
            ctx.lineTo(item.x, item.y + item.height);
            ctx.closePath();
            ctx.fill();
        }
    });

    if (gameOver) {

        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.fillText(
            "GAME OVER",
            280,
            250
        );
}
}

// keyboard UI
function renderKeyboard() {

    const keyboard = document.getElementById("keyboard");

    if (!keyboard) return;

    keyboard.innerHTML = "";

    Object.keys(durability).forEach(key => {

        const hp = durability[key];
        const max = maxDurability[key];

        const div = document.createElement("div");

        div.classList.add("key");

        if (brokenKeys.has(key)) {
            div.classList.add("broken");
        }
        else if (hp < max * 0.25) {
            div.classList.add("critical");
        }
        else if (hp < max * 0.5) {
            div.classList.add("warning");
        }
        else {
            div.classList.add("healthy");
        }

        div.textContent = `${key.toUpperCase()} ${hp}`;

        keyboard.appendChild(div);
    });
}

renderKeyboard();

// score
let score = 0;
let survivalTime = 0;
let bestScore = Number(localStorage.getItem("keyboardSurvivalBestScore") || 0);

function updateBestScore() {
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("keyboardSurvivalBestScore", bestScore);
    }
}

// game loop
function loop() {

    update();
    updateHUD();
    draw();

    requestAnimationFrame(loop);
}

loop();

// update UI
function updateHUD() {

    document.getElementById("score").textContent =
        Math.floor(score);

    document.getElementById("time").textContent =
        Math.floor(survivalTime);

    document.getElementById("aliveKeys").textContent =
        Object.keys(durability).length -
        brokenKeys.size;

    document.getElementById("bestScore").textContent =
        Math.floor(bestScore);
}

// timer
setInterval(() => {

    if (!gameOver) {
        survivalTime++;
    }

}, 1000);

// start button
document
.getElementById("startBtn")
.addEventListener("click", startGame);

document
.getElementById("howToPlayBtn")
.addEventListener("click", () => {
    if (document.getElementById("howToPlayBtn").textContent === "Main Menu") {
        showMainMenu();
    } else {
        document.getElementById("instructions").hidden = false;
        document.getElementById("menuButtons").style.display = "none";
    }
});

document
.getElementById("closeInstructionsBtn")
.addEventListener("click", () => {
    document.getElementById("instructions").hidden = true;
    document.getElementById("menuButtons").style.display = "flex";
});
