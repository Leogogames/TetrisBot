const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(30, 30);  // 30px на квадрат

const arenaWidth = 10;
const arenaHeight = 14;

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill([0, null])); // Заполняем массив с элементами [0, null]
    }
    return matrix;
}

const arena = createMatrix(arenaWidth, arenaHeight);

const pieces = 'ILJOTSZ';

const colors = {
    'T': '#FF00FF',
    'O': '#FFFF00',
    'L': '#FF8000',
    'J': '#0000FF',
    'I': '#00FFFF',
    'S': '#00FF00',
    'Z': '#FF0000',
};

function createPiece(type) {
    if (type === 'T') {
        return [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ];
    } else if (type === 'O') {
        return [
            [1, 1],
            [1, 1],
        ];
    } else if (type === 'L') {
        return [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0],
        ];
    } else if (type === 'J') {
        return [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0],
        ];
    } else if (type === 'I') {
        return [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0],
        ];
    } else if (type === 'Z') {
        return [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0],
        ];
    }
}

function drawCube(x, y, color) {
    context.fillStyle = color;

    // Основной квадрат
    context.fillRect(x, y, 1, 1);

    // Тень справа
    context.fillStyle = shadeColor(color, -20);
    context.fillRect(x + 0.9, y, 0.1, 1);

    // Тень снизу
    context.fillStyle = shadeColor(color, -40);
    context.fillRect(x, y + 0.9, 1, 0.1);

    // Свет сверху
    context.fillStyle = shadeColor(color, 40);
    context.fillRect(x, y, 1, 0.1);

    // Свет слева
    context.fillStyle = shadeColor(color, 20);
    context.fillRect(x, y, 0.1, 1);
}

function shadeColor(color, percent) {
    let num = parseInt(color.slice(1), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = (num >> 8 & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)).toString(16).slice(1).toUpperCase();
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value[0] !== 0) {
                drawCube(x + offset.x, y + offset.y, value[1]); // Используем функцию рисования кубиков
            }
        });
    });
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix.map(row => row.map(value => [value, player.color])), player.pos);
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = [value, player.color]; // Сохраняем цвет фигуры при фиксации
            }
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                    arena[y + o.y][x + o.x][0]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerReset() {
    const pieceType = pieces[(pieces.length * Math.random()) | 0];
    player.matrix = createPiece(pieceType);
    player.color = colors[pieceType];
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
        (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill([0, null]));
        player.score = 0;
        updateScore();
    }
}

function arenaSweep() {
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x][0] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill([0, null]);
        arena.unshift(row);
        player.score += 10;
    }
}

function updateScore() {
    document.getElementById('score').innerText = 'Score: ' + player.score;
}

const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    color: null,
    score: 0,
};

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

document.getElementById('left').addEventListener('click', () => {
    playerMove(-1);
});

document.getElementById('right').addEventListener('click', () => {
    playerMove(1);
});

document.getElementById('down').addEventListener('click', () => {
    playerDrop();
});

document.getElementById('rotate').addEventListener('click', () => {
    rotate(player.matrix, 1);
});

playerReset();
updateScore();
update();