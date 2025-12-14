// === CARD POOL (all pairs) ===
const allCardPairs = [
    { id: 1,  content: "Grupo -OH ligado a carbono saturado",              name: "Álcool" },
    { id: 2,  content: "Carbonila (C=O) em carbono terminal",              name: "Aldeído" },
    { id: 3,  content: "Carbonila (C=O) entre dois carbonos",              name: "Cetona" },
    { id: 4,  content: "Grupo Carboxila (-COOH)",                          name: "Ácido Carboxílico" },
    { id: 5,  content: "R-COO-R' (Derivado de Ácido + Álcool)",           name: "Éster" },
    { id: 6,  content: "Derivada da amônia com grupo -NH₂ ou -NH-",        name: "Amina" },
    { id: 7,  content: "Carbonila (C=O) ligada a Nitrogênio (-NH-)",       name: "Amida" },
    { id: 8,  content: "Oxigênio entre dois radicais orgânicos (R-O-R')",  name: "Éter" },
    { id: 9,  content: "Grupo -SH ligado a carbono",                       name: "Tiol" },
    { id: 10, content: "Grupo -NO₂ ligado a carbono",                      name: "Nitrocomposto" },
    { id: 11, content: "Halogênio (F, Cl, Br ou I) ligado a carbono",      name: "Haleto Orgânico" },
    { id: 12, content: "Ligação tripla entre dois carbonos (C≡C)",         name: "Alcino" },
];

// === DIFFICULTY CONFIG ===
const DIFFICULTIES = {
    easy:   { pairs: 8,  time: 180 },
    medium: { pairs: 10, time: 120 },
    hard:   { pairs: 12, time: 90  },
};

// === STATE ===
let currentDifficulty = 'easy';
let activePairs = [];
let flippedCards = [];
let lockBoard = false;
let matchesFound = 0;
let moves = 0;
let timerInterval = null;
let timeLeft = 0;
let totalTime = 0;

// === DOM REFS ===
const board          = document.getElementById('game-board');
const movesDisplay   = document.getElementById('moves-count');
const matchesDisplay = document.getElementById('matches-count');
const overlay        = document.getElementById('message-overlay');
const restartButton  = document.getElementById('restart-button');
const changeDiffBtn  = document.getElementById('change-diff-button');
const finalMessage   = document.getElementById('final-message');
const finalMoves     = document.getElementById('final-moves');
const resultStats    = document.getElementById('result-stats');
const resultEmoji    = document.getElementById('result-emoji');
const introOverlay   = document.getElementById('intro-overlay');
const startButton    = document.getElementById('start-button');
const timerDisplay   = document.getElementById('timer-display');
const timerBar       = document.getElementById('timer-bar');
const timerPill      = document.getElementById('timer-pill');

// === DIFFICULTY SELECTOR ===
document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDifficulty = btn.dataset.difficulty;
    });
});

// === SHUFFLE ===
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// === TIMER ===
function formatTime(seconds) {
    if (typeof seconds !== 'number') return '--:--';
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function startTimer() {
    clearInterval(timerInterval);
    const cfg = DIFFICULTIES[currentDifficulty];
    timeLeft = cfg.time;
    totalTime = cfg.time;

    timerDisplay.textContent = formatTime(timeLeft);
    timerBar.style.width = '100%';
    timerBar.style.background = 'var(--accent)';
    timerPill.classList.remove('danger');

    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = formatTime(timeLeft);

        const pct = (timeLeft / totalTime) * 100;
        timerBar.style.width = pct + '%';

        if (pct < 25) {
            timerBar.style.background = '#ff4444';
            timerPill.classList.add('danger');
        } else if (pct < 55) {
            timerBar.style.background = '#ffaa00';
            timerPill.classList.remove('danger');
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timeoutGame();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

// === BUILD BOARD ===
function createBoard() {
    board.innerHTML = '';
    matchesFound = 0;
    moves = 0;
    lockBoard = false;
    flippedCards = [];

    movesDisplay.textContent = '0';
    overlay.style.display = 'none';
    timerPill.classList.remove('danger');

    const cfg = DIFFICULTIES[currentDifficulty];
    const chosenPairs = shuffle([...allCardPairs]).slice(0, cfg.pairs);
    activePairs = chosenPairs;

    matchesDisplay.textContent = `0/${cfg.pairs}`;

    const cardData = [];
    chosenPairs.forEach(pair => {
        cardData.push({ id: pair.id, content: pair.content, type: 'def' });
        cardData.push({ id: pair.id, content: pair.name,    type: 'name' });
    });

    shuffle(cardData).forEach((data, index) => {
        const el = document.createElement('div');
        el.classList.add('card');
        el.dataset.id = data.id;
        el.dataset.type = data.type;
        el.style.animationDelay = `${index * 35}ms`;

        el.innerHTML = `
            <div class="flip-container">
                <div class="card-face card-front ${data.type === 'name' ? 'card-name' : 'card-def'}">
                    <span class="card-type-badge">${data.type === 'name' ? '🏷 Nome' : '🔬 Grupo'}</span>
                    <span class="card-text">${data.content}</span>
                </div>
                <div class="card-face card-back">
                    <span class="card-back-symbol">?</span>
                </div>
            </div>
        `;

        el.addEventListener('click', flipCard);
        board.appendChild(el);
    });

    startTimer();
}

// === FLIP ===
function flipCard() {
    if (lockBoard) return;
    if (this.classList.contains('flipped') || this.classList.contains('matched')) return;

    this.classList.add('flipped');
    flippedCards.push(this);

    if (flippedCards.length < 2) return;

    lockBoard = true;
    moves++;
    movesDisplay.textContent = moves;

    checkForMatch();
}

function checkForMatch() {
    const [card1, card2] = flippedCards;
    const sameId   = card1.dataset.id === card2.dataset.id;
    const diffType = card1.dataset.type !== card2.dataset.type;

    if (sameId && diffType) {
        disableCards();
    } else {
        unflipCards();
    }
}

function disableCards() {
    flippedCards.forEach(card => {
        card.classList.add('matched');
        card.removeEventListener('click', flipCard);
    });

    matchesFound++;
    matchesDisplay.textContent = `${matchesFound}/${activePairs.length}`;
    resetBoard();

    if (matchesFound === activePairs.length) {
        stopTimer();
        setTimeout(endGame, 600);
    }
}

function unflipCards() {
    setTimeout(() => {
        flippedCards.forEach(card => card.classList.remove('flipped'));
        resetBoard();
    }, 1200);
}

function resetBoard() {
    flippedCards = [];
    lockBoard = false;
}

// === END STATES ===
function endGame() {
    const timeUsed   = totalTime - timeLeft;
    const efficiency = moves > 0 ? Math.round((activePairs.length / moves) * 100) : 100;
    const diffLabel  = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' }[currentDifficulty];

    resultEmoji.textContent   = '🎉';
    finalMessage.textContent  = 'Parabéns! Você dominou a Química Orgânica!';
    finalMoves.textContent    = `Completado em ${moves} movimentos!`;

    resultStats.innerHTML = `
        <div class="stat-badge">⏱ ${formatTime(timeUsed)} gastos</div>
        <div class="stat-badge">🎯 Eficiência: ${efficiency}%</div>
        <div class="stat-badge">⚗️ Nível: ${diffLabel}</div>
    `;

    overlay.style.display = 'flex';
}

function timeoutGame() {
    lockBoard = true;
    resultEmoji.textContent  = '⏰';
    finalMessage.textContent = 'Tempo Esgotado!';
    finalMoves.textContent   = `Você encontrou ${matchesFound} de ${activePairs.length} pares.`;
    resultStats.innerHTML    = `<div class="stat-badge">💡 Tente novamente!</div>`;
    overlay.style.display = 'flex';
}

// === BUTTONS ===
restartButton.addEventListener('click', () => {
    overlay.style.display = 'none';
    createBoard();
});

changeDiffBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
    stopTimer();
    introOverlay.style.display = 'flex';
});

startButton.addEventListener('click', () => {
    introOverlay.style.display = 'none';
    createBoard();
});

// === DEBUG KEY (P) ===
function autoMatchAndEnd() {
    lockBoard = true;
    board.querySelectorAll('.card').forEach(card => {
        card.classList.add('flipped', 'matched');
        card.removeEventListener('click', flipCard);
    });
    matchesFound = activePairs.length;
    moves = activePairs.length;
    movesDisplay.textContent = moves;
    matchesDisplay.textContent = `${matchesFound}/${activePairs.length}`;
    stopTimer();
    setTimeout(endGame, 1000);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        autoMatchAndEnd();
    }
});
