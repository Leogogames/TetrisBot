const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const COLS = 10; // Количество колонок
const ROWS = 20; // Количество рядов
const BLOCK_SIZE = 30; // Размер одного блока

// Цвета фигур
const COLORS = [
    null, '#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF5733', '#33FFF7', '#FF33AA'
];

// Описание всех возможных фигур (Tetrimino)
const SHAPES = [
    [],
    [[1, 1, 1], [0, 1, 0]], // T-shape
    [[1, 1], [1, 1]], // Square
    [[0, 1, 1], [1, 1, 0]], // S-shape
    [[1, 1, 0], [0, 1, 1]], // Z-shape
    [[1, 0, 0], [1, 1, 1]], // L-shape
    [[0, 0, 1], [1, 1, 1]], // J-shape
    [[1, 1, 1, 1]] // I-shape
];

let score = 0;
let board = createBoard(); // Доска, на которой будут расположены фигуры
let currentPiece = getRandomPiece(); // Текущая фигура
let nextPiece = getRandomPiece(); // Следующая фигура
let piecePos = {x: 4, y: 0}; // Начальная позиция фигуры

// Функция для создания пустого игрового поля
function createBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

// Функция для отрисовки игрового поля и текущей фигуры
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    drawPiece(currentPiece, piecePos.x, piecePos.y);
}

// Функция для отрисовки доски
function drawBoard() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col] !== 0) {
                ctx.fillStyle = COLORS[board[row][col]];
                ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

// Функция для отрисовки текущей фигуры
function drawPiece(piece, offsetX, offsetY) {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.fillStyle = COLORS[piece.color];
                ctx.fillRect((offsetX + x) * BLOCK_SIZE, (offsetY + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeRect((offsetX + x) * BLOCK_SIZE, (offsetY + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
}

// Функция для получения случайной фигуры
function getRandomPiece() {
    const typeId = Math.floor(Math.random() * SHAPES.length);
    return {
        shape: SHAPES[typeId],
        color: typeId
    };
}

// Движение фигуры вниз
function moveDown() {
    if (!isCollision(0, 1)) {
        piecePos.y++;
    } else {
        mergePiece();
        resetPiece();
        score += 10;
        updateScore();
        if (isGameOver()) {
            alert("Game Over!");
            resetGame();
        }
    }
    draw();
}

// Проверка на коллизии (столкновения)
function isCollision(offsetX, offsetY) {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x] !== 0) {
                const newX = piecePos.x + x + offsetX;
                const newY = piecePos.y + y + offsetY;

                if (newX < 0 || newX >= COLS || newY >= ROWS || board[newY][newX] !== 0) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Фиксируем фигуру на доске
function mergePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[piecePos.y + y][piecePos.x + x] = currentPiece.color;
            }
        });
    });
}

// Сбрасываем фигуру и позицию
function resetPiece() {
    currentPiece = nextPiece;
    nextPiece = getRandomPiece();
    piecePos = {x: 4, y: 0};
}

// Проверяем, не завершилась ли игра
function isGameOver() {
    return board[0].some(col => col !== 0);
}

// Функция для обновления очков
function updateScore() {
    document.getElementById('score').innerText = score;
}

// Сброс игры
function resetGame() {
    board = createBoard();
    score = 0;
    updateScore();
    currentPiece = getRandomPiece();
}

// Управление для мобильных устройств (кнопки)
document.getElementById('left').addEventListener('click', () => {
    if (!isCollision(-1, 0)) piecePos.x--;
    draw();
});

document.getElementById('right').addEventListener('click', () => {
    if (!isCollision(1, 0)) piecePos.x++;
    draw();
});

document.getElementById('rotate').addEventListener('click', () => {
    const rotatedShape = rotate(currentPiece.shape);
    if (!isCollision(0, 0, rotatedShape)) {
        currentPiece.shape = rotatedShape;
    }
    draw();
});

document.getElementById('down').addEventListener('click', moveDown);

// Функция для вращения фигуры
function rotate(matrix) {
    return matrix[0].map((_, i) => matrix.map(row => row[i])).reverse();
}

// Запускаем игровой цикл
setInterval(moveDown, 1000);

draw();
