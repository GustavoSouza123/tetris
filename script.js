canvas = document.getElementById('game-board');
ctx = canvas.getContext('2d');
let gBArrayHeight = 20;
let gBArrayWidth = 12;
let startX = 4;
let startY = 0;
let score = 0;
let level = 1;
let pieces = 0;
let winOrLose = 'Playing';
let tetrisLogo;
let speed = 1000;
let coordinateArray = [...Array(gBArrayHeight)].map(e => Array(gBArrayWidth).fill(0));

let curTetromino = [];
let tetrominos = [];
let tetrominoColors = ['#bb07bb', '#03cfcf', '#316eff', '#ffe200', '#eb8400', '#00bf00', '#c10000'];
let curTetrominoColor;
let tetrominoQueue = [];
let tetrominoQueueLength = 5;

let gameBoardArray = [...Array(gBArrayHeight)].map(e => Array(gBArrayWidth)).fill(0);

let stoppedShapeArray = [...Array(gBArrayHeight)].map(e => Array(gBArrayWidth).fill(0));

let DIRECTION = {
    IDLE: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3
};
let direction;

class Coordinates {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

document.addEventListener('DOMContentLoaded', setupCanvas);

function createCoordArray() {
    let i = 0, j = 0;
    for(let y = 9; y <= 446; y += 23) {
        for(let x = 11; x <= 264; x += 23) {
            coordinateArray[i][j] = new Coordinates(x, y);
            i++;
        }
        j++;
        i = 0;
    }
}

function setupCanvas() {
    canvas.width = 296;
    canvas.height = 476;
    
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(canvas.width, canvas.height);

    document.querySelector('.score span').innerText = score;
    document.querySelector('.level span').innerText = level;
    document.querySelector('.status span').innerText = winOrLose;

    document.addEventListener('keydown', handleKeyPress);
    createCoordArray();
    createTetrominos();
    createTetromino();
    drawTetromino();
    setTimeout(drawTetrominoQueue, 100);

    // tetromino queue
    for(let i = 0; i < tetrominoQueueLength; i++) {
        let randomTetromino = Math.floor(Math.random() * tetrominos.length);
        tetrominoQueue.push(randomTetromino);
    }
}

function drawTetromino() {
    for(let i = 0; i < curTetromino.length; i++) {
        let x = curTetromino[i][0] + startX;
        let y = curTetromino[i][1] + startY;
        gameBoardArray[x][y] = 1;
        let coorX = coordinateArray[x][y].x;
        let coorY = coordinateArray[x][y].y;
        ctx.fillStyle = curTetrominoColor;
        ctx.fillRect(coorX, coorY, 21, 21);
    }
}

function handleKeyPress(key) {
    if(winOrLose != "Game Over") {
        if(key.keyCode === 37) { // arrow left key
            direction = DIRECTION.LEFT;
            if(!hittingTheWall() && !checkForHorizontalCollision()) {
                deleteTetromino();
                startX--;
                drawTetromino();
            }
        } else if(key.keyCode === 39) { // arrow right key
            direction = DIRECTION.RIGHT;
            if(!hittingTheWall() && !checkForHorizontalCollision()) {
                deleteTetromino();
                startX++;
                drawTetromino();
            }
        } else if(key.keyCode === 40) { // arrow down key
            moveTetrominoDown();
        } else if(key.keyCode === 38) { // arrow up key
            rotateTetromino();
        } else if(key.keyCode === 32) { // space key
            while(!checkForVerticalCollision()) {
                moveTetrominoDown();
            }
        }
    }
}

function moveTetrominoDown() {
    direction = DIRECTION.DOWN;
    if(!checkForVerticalCollision()) {
        deleteTetromino();
        startY++;
        drawTetromino();
    }
}

window.setInterval(function() {
    if(winOrLose != "Game Over") {
        moveTetrominoDown();
    }
}, speed);

function deleteTetromino() {
    for(let i = 0; i < curTetromino.length; i++) {
        let x = curTetromino[i][0] + startX;
        let y = curTetromino[i][1] + startY;
        gameBoardArray[x][y] = 0;
        let coorX = coordinateArray[x][y].x;
        let coorY = coordinateArray[x][y].y;
        ctx.fillStyle = 'black';
        ctx.fillRect(coorX, coorY, 21, 21);
    }
}

function createTetrominos() {
    // 0. T
    tetrominos.push([[1,0], [0,1], [1,1], [2,1]]);
    // 1. I
    tetrominos.push([[0,0], [1,0], [2,0], [3,0]]);
    // 2. L
    tetrominos.push([[0,0], [0,1], [1,1], [2,1]]);
    // 3. O (square)
    tetrominos.push([[0,0], [1,0], [0,1], [1,1]]);
    // 4. J
    tetrominos.push([[2,0], [0,1], [1,1], [2,1]]);
    // 5. S
    tetrominos.push([[1,0], [2,0], [0,1], [1,1]]);
    // 6. Z
    tetrominos.push([[0,0], [1,0], [1,1], [2,1]]);
}

function createTetromino() {
    let newTetromino = Math.floor(Math.random() * tetrominos.length);
    tetrominoQueue.push(newTetromino);
    let firstTetromino = tetrominoQueue.shift();
    curTetromino = tetrominos[firstTetromino];
    curTetrominoColor = tetrominoColors[firstTetromino];
    pieces++;
    document.querySelector('.pieces span').innerText = pieces;
    if(pieces > 1) {
        drawTetrominoQueue();
    }
}

function drawTetrominoQueue() {
    document.querySelector('.next .content').innerHTML = '';
    for(let cont = 0; cont < tetrominoQueueLength; cont++) {
        document.querySelector('.next .content').innerHTML += `
            <div class="tetromino tetromino${cont}">
                <span id="span00"></span>
                <span id="span01"></span>
                <span id="span02"></span>
                <span id="span03"></span>
                <span id="span10"></span>
                <span id="span11"></span>
                <span id="span12"></span>
                <span id="span13"></span>
            </div>
        `;
        let curTet = tetrominos[tetrominoQueue[cont]];
        let curTetColor = tetrominoColors[tetrominoQueue[cont]];
        for(let i = 0; i < curTet.length; i++) {
            let x = curTet[i][0];
            let y = curTet[i][1];
            let curCoord = 'span' + String(y) + String(x);
            document.querySelector(`.tetromino${cont} #${curCoord}`).style.backgroundColor = curTetColor;
        }
    }
}

function hittingTheWall() {
    for(let i = 0; i < curTetromino.length; i++) {
        let newX = curTetromino[i][0] + startX;
        if(newX <= 0 && direction === DIRECTION.LEFT) {
            return true;
        } else if(newX >= 11 && direction === DIRECTION.RIGHT) {
            return true;
        }
    }
    return false;
}

function checkForVerticalCollision() {
    let tetrominoCopy = curTetromino;
    let collision = false;
    for(let i = 0; i < tetrominoCopy.length; i++){
        let square = tetrominoCopy[i];
        let x = square[0] + startX;
        let y = square[1] + startY;
        if(direction === DIRECTION.DOWN){
            y++;
        }
        if(typeof stoppedShapeArray[x][y+1] === 'string'){
            deleteTetromino();
            startY++;
            drawTetromino();
            collision = true;
            break;
        }
        if(y >= 20){
            collision = true;
            break;
        }
    }
    if(collision){
        if(startY <= 1){
            winOrLose = "Game Over";
            document.querySelector('.status span').innerText = winOrLose;
        } else {
            for(let i = 0; i < tetrominoCopy.length; i++){
                let square = tetrominoCopy[i];
                let x = square[0] + startX;
                let y = square[1] + startY;
                stoppedShapeArray[x][y] = curTetrominoColor;
            }
            checkForCompletedRows();
            createTetromino();
            direction = DIRECTION.IDLE;
            startX = 4;
            startY = 0;
            drawTetromino();
        }
    }
    return collision;
}

function checkForHorizontalCollision() {
    let tetrominoCopy = curTetromino;
    let collision = false;
    for(let i = 0; i < tetrominoCopy.length; i++) {
        let square = tetrominoCopy[i];
        let x = square[0] + startX;
        let y = square[1] + startY;
        if(direction === DIRECTION.LEFT) {
            x--;
        } else if(direction === DIRECTION.RIGHT) {
            x++;
        }
        var stoppedShapeVal = stoppedShapeArray[x][y];
        if(typeof stoppedShapeVal === 'string') {
            collision = true;
            break;
        }
    }
    return collision;
}

function checkForCompletedRows() {
    let rowsToDelete = 0;
    let startOfDeletion = 0;
    for(let y = 0; y < gBArrayHeight; y++) {
        let completed = true;
        for(let x = 0; x < gBArrayWidth; x++) {
            let square = stoppedShapeArray[x][y];
            if(square === 0 || typeof square === 'undefined') {
                completed = false;
                break;
            }
        }
        if(completed) {
            if(startOfDeletion === 0) startOfDeletion = y;
            rowsToDelete++;
            for(let i = 0; i < gBArrayWidth; i++) {
                stoppedShapeArray[i][y] = 0;
                gameBoardArray[i][y] = 0;
                let coorX = coordinateArray[i][y].x;
                let coorY = coordinateArray[i][y].y;
                ctx.fillStyle = 'black';
                ctx.fillRect(coorX, coorY, 21, 21);
            }
        }
    }
    if(rowsToDelete > 0) {
        score += 10 * rowsToDelete;
        document.querySelector('.score span').innerText = score;
        moveAllRowsDown(rowsToDelete, startOfDeletion)
    }
}

function moveAllRowsDown(rowsToDelete, startOfDeletion) {
    for(var i = startOfDeletion-1; i >= 0; i--) {
        for(var x = 0; x < gBArrayWidth; x++) {
            var y2 = i + rowsToDelete;
            var square = stoppedShapeArray[x][i];
            var nextSquare = stoppedShapeArray[x][y2];
            if(typeof square === 'string') {
                nextSquare = square;
                gameBoardArray[x][y2] = 1;
                stoppedShapeArray[x][y2] = square;
                let coorX = coordinateArray[x][y2].x;
                let coorY = coordinateArray[x][y2].y;
                ctx.fillStyle = nextSquare;
                ctx.fillRect(coorX, coorY, 21, 21);

                square = 0;
                gameBoardArray[x][i] = 0;
                stoppedShapeArray[x][i] = 0;
                coorX = coordinateArray[x][i].x;
                coorY = coordinateArray[x][i].y;
                ctx.fillStyle = 'black';
                ctx.fillRect(coorX, coorY, 21, 21);
            }
        }
    }
}

function rotateTetromino() {
    let newRotation = new Array();
    let tetrominoCopy = curTetromino;
    let curTetrominoBU;
    for(let i = 0; i < tetrominoCopy.length; i++) {
        curTetrominoBU = [...curTetromino];
        let x = tetrominoCopy[i][0];
        let y = tetrominoCopy[i][1];
        let newX = (getLastSquareX() - y);
        let newY = x;
        newRotation.push([newX, newY]);
    }
    deleteTetromino();
    try {
        curTetromino = newRotation;
        drawTetromino();
    } catch(e) {
        if(e instanceof TypeError) {
            curTetromino = curTetrominoBU;
            deleteTetromino();
            drawTetromino();
        }
    }
}

function getLastSquareX() {
    let lastX = 0;
    for(let i = 0; i < curTetromino.length; i++) {
        let square = curTetromino[i];
        if(square[0] > lastX) {
            lastX = square[0];
        }
    }
    return lastX;
}

function drawGrid(w, h) {
    ctx.strokeStyle = '#222';
    ctx.lineWidth = '1px';
    for(x = 10; x <= w; x += 23) {
        for(y = 8; y <= h; y += 23) {
            ctx.beginPath();
            ctx.moveTo(x, 9);
            ctx.lineTo(x, h-9);
            ctx.stroke();
            ctx.moveTo(9, y);
            ctx.lineTo(w-9, y);
            ctx.stroke();
        }
    }
}