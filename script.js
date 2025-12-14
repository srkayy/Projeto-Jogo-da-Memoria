const board = document.getElementById('game-board');
const movesDisplay = document.getElementById('moves-count');
const matchesDisplay = document.getElementById('matches-count');
const overlay = document.getElementById('message-overlay');
const restartButton = document.getElementById('restart-button');
const finalMessage = document.getElementById('final-message');
const finalMoves = document.getElementById('final-moves');

// NOVOS SELETORES DE INÍCIO
const introOverlay = document.getElementById('intro-overlay');
const startButton = document.getElementById('start-button');


let cards = [];
let flippedCards = [];
let lockBoard = false;
let matchesFound = 0;
let moves = 0;

const cardPairs = [
    { id: 1, content: "Grupo Funcional -OH ligado a carbono saturado" }, { id: 1, content: "Álcool" }, 
    { id: 2, content: "Carbonila (C=O) em carbono primário" }, { id: 2, content: "Aldeído" },
    { id: 3, content: "Carbonila (C=O) entre dois carbonos" }, { id: 3, content: "Cetona" },
    { id: 4, content: "Grupo Carboxila (-COOH)" }, { id: 4, content: "Ácido Carboxílico" },
    { id: 5, content: "R-COO-R' (Derivado de Ácido Carboxílico)" }, { id: 5, content: "Éster" },
    { id: 6, content: "Derivada da amônia, com Grupo -N- ligado ao carbono" }, { id: 6, content: "Amina" },
    { id: 7, content: "Carbonila (C=O) ligada a um Nitrogênio (N)" }, { id: 7, content: "Amida" },
    { id: 8, content: "Oxigênio (O) entre dois radicais orgânicos (R-O-R')" }, { id: 8, content: "Éter" },
];

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createBoard() {
    board.innerHTML = '';
    
    matchesFound = 0;
    moves = 0;
    lockBoard = false; 
    flippedCards = []; 

    movesDisplay.textContent = 'Movimentos: 0';
    matchesDisplay.textContent = 'Pares Encontrados: 0';
    overlay.style.display = 'none';

    cards = shuffle([...cardPairs]); 

    cards.forEach(cardData => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.id = cardData.id;
        
        cardElement.innerHTML = `
            <div class="flip-container">
                <div class="card-face card-front">${cardData.content}</div>
                <div class="card-face card-back">?</div>
            </div>
        `;

        cardElement.addEventListener('click', flipCard);
        board.appendChild(cardElement);
    });
}

function flipCard() {
    if (lockBoard) return;
    if (this.classList.contains('flipped') || this.classList.contains('matched')) return; 

    this.classList.add('flipped');
    flippedCards.push(this);

    if (flippedCards.length < 2) {
        return;
    }

    lockBoard = true;
    moves++;
    movesDisplay.textContent = `Movimentos: ${moves}`;

    checkForMatch();
}

function checkForMatch() {
    const [card1, card2] = flippedCards;
    const isMatch = card1.dataset.id === card2.dataset.id;

    if (isMatch) {
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
    matchesDisplay.textContent = `Pares Encontrados: ${matchesFound}`;

    resetBoard();
    
    if (matchesFound === cardPairs.length / 2) {
        endGame();
    }
}

function unflipCards() {
    setTimeout(() => {
        flippedCards.forEach(card => {
            card.classList.remove('flipped');
        });
        resetBoard();
    }, 1500);
}

function resetBoard() {
    [flippedCards, lockBoard] = [[], false];
}

function endGame() {
    finalMessage.textContent = 'Parabéns, você dominou a Química Orgânica!';
    
    if (moves === 'CHEATED') {
        finalMoves.textContent = `Resultado: Acerto Automático (Modo Debug)`;
    } else {
        finalMoves.textContent = `Você completou o jogo em ${moves} movimentos.`;
    }

    overlay.style.display = 'flex';
}

// LÓGICA DE INÍCIO E REINÍCIO
restartButton.addEventListener('click', () => {
    createBoard();
});

startButton.addEventListener('click', () => {
    introOverlay.style.display = 'none';
    createBoard(); 
});

// AQUI NÃO CHAMAMOS createBoard(); O modal intro fica por cima.

function autoMatchAndEnd() {
    lockBoard = true; 
    
    const allCards = board.querySelectorAll('.card');
    allCards.forEach(card => {
        card.classList.add('flipped', 'matched');
        card.removeEventListener('click', flipCard); 
    });
    
    matchesFound = cardPairs.length / 2;
    moves = 'CHEATED'; 
    movesDisplay.textContent = 'Movimentos: AUTO';
    matchesDisplay.textContent = `Pares Encontrados: ${matchesFound}`;

    setTimeout(endGame, 1500);
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'p' || event.key === 'P') {
        event.preventDefault(); 
        console.log("Tecla 'P' pressionada! Auto-acerto ativado.");
        autoMatchAndEnd();
    }
});