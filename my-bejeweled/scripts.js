const boardZone = document.querySelector('.board_zone');
const showZone = document.querySelector('.show_zone');
const result = document.querySelector('#result');
const btnNewGame = document.querySelector('#btn_new_game');
const btnShuffleBoard = document.querySelector('#btn_shuffle_board');
const inpBoardSize = document.querySelector('#inp_board_size');
const inpWinSize = document.querySelector('#inp_win_size');
const timer = document.querySelector("#clock");
const inpBoardSizeVal = document.querySelector("#inp_board_size_val");
const inpWinSizeVal = document.querySelector("#inp_win_size_val");
const imgBackBtnShuffle = document.querySelector('.img_back_btn_shuffle');
const divLightNewGame = document.querySelector('.light_new_game');


btnNewGame.addEventListener('click', newGame);
btnShuffleBoard.addEventListener('click', shuffleBoard);

inpBoardSize.addEventListener('oninput', () => inpBoardSizeVal.textContent = inpBoardSize.value);
inpWinSizeVal.addEventListener('oninput', () => inpWinSizeVal.textContent = inpWinSize.value);


const piecesURL = [
    'circle.svg',
    'pentagon.svg',
    'rectangle.svg',
    'star.svg',
    'triangle.svg'
];

let squaresList;
let showSquaresList = [];
let board;
let clicked = false;
let draggedPiece;
let timeWithoutMove = 0;

let hours = 0;
let minutes = 0;
let seconds = 0;
let hoursStr;
let minutesStr;
let secondsStr;

let squareSize;

let matrix = [];

let squareSel;

let scorePossible = true;

window.onload = newGame;

window.onresize = resizeBoard;

let horizontalPieces;
let verticalPieces;

let lineValueWin;

function resizeBoard() {

    let newValueSize;

    let dimensionW = Math.floor((window.innerWidth / 2) / horizontalPieces);
    let dimensionH = Math.floor((window.innerHeight / 1.4) / horizontalPieces);

    if (dimensionW > dimensionH) {
        newValueSize = dimensionH;
    } else
        newValueSize = dimensionW;

    squaresList.forEach(square => {
        square.style.width = newValueSize + 'px';
        square.style.height = newValueSize + 'px';
    });

    squareSize = newValueSize;

    showSquaresList.forEach(square => {
        square.style.width = newValueSize + 'px';
        square.style.height = newValueSize + 'px';
    });
}

let timerInterval;

function newGame() {
    squaresList = [];
    hours = 0;
    minutes = 0;
    seconds = 0;
    clearInterval(timerInterval);
    [horizontalPieces, verticalPieces] = [parseInt(inpBoardSize.value), parseInt(inpBoardSize.value)];
    lineValueWin = parseInt(inpWinSize.value);
    drawBoard();
    checkNoMoves();
}

function shuffleBoard() {
    let tempArr = squaresList;
    while (tempArr.length > 1) {
        let indexO = Math.floor(Math.random() * tempArr.length);
        const sqrOrigin = tempArr[indexO];
        tempArr = tempArr.slice(0, indexO).concat(tempArr.slice(indexO + 1, tempArr.length));
        let indexD = Math.floor(Math.random() * tempArr.length);
        const sqrDestiny = tempArr[indexD];
        tempArr = tempArr.slice(0, indexO).concat(tempArr.slice(indexO + 1, tempArr.length));
        switchPiece(sqrOrigin, sqrDestiny);
    }
    scorePossible = false;
    makeMove();
    scorePossible = true;
}

function dropPieces() {
    let time = 0;
    squaresList.forEach(square => {
        if (!square.hasChildNodes()) {
            setTimeout(() => {
                dropPiece(square);
            }, 50 * time);
            time++;
        }
    });

    //verificar o width do drop de peças
    showZone.style.width = board.style.width;

    setTimeout(() => {
        makeMove();
        timerInterval = setInterval(startTimer, 1000);
    }, time * 70);
}


function makeMove() {
    let result;
    updateMatrixValues();
    result = isPiecesAligned();
    if (result) {
        fillEmptySpaces();
    }
    return result;
}


function dropPiece(sqr, sqrOrigin) {
    let piece;

    if (sqrOrigin != null) {
        piece = sqrOrigin.childNodes[0];
        piece.style.top = (sqrOrigin.offsetTop - sqr.offsetTop) + 'px';
    } else {
        piece = generatePiece(piecesURL);
        piece.style.top = -(sqr.offsetTop - showZone.offsetTop) + 'px';
    }

    piece.setAttribute('data-lin', sqr.dataset.lin);
    piece.setAttribute('data-col', sqr.dataset.col);

    sqr.appendChild(piece);


    setTimeout(() => {
        piece.style.top = 0 + 'px';
        piece.style.left = 0 + 'px';
    }, 16);
}

function switchPiece(sqrOrigin, sqrDestiny) {

    let originalPiece;
    let touchedPiece;

    originalPiece = sqrOrigin.childNodes[0];
    touchedPiece = sqrDestiny.childNodes[0];

    originalPiece.style.left = sqrOrigin.offsetLeft - sqrDestiny.offsetLeft + 'px';
    originalPiece.style.top = (sqrOrigin.offsetTop - sqrDestiny.offsetTop) + 'px';
    touchedPiece.style.left = sqrDestiny.offsetLeft - sqrDestiny.offsetLeft + 'px';
    touchedPiece.style.top = (sqrDestiny.offsetTop - sqrOrigin.offsetTop) + 'px';

    touchedPiece.setAttribute('data-lin', sqrOrigin.dataset.lin);
    touchedPiece.setAttribute('data-col', sqrOrigin.dataset.col);
    originalPiece.setAttribute('data-lin', sqrDestiny.dataset.lin);
    originalPiece.setAttribute('data-col', sqrDestiny.dataset.col);

    sqrOrigin.appendChild(touchedPiece);
    sqrDestiny.appendChild(originalPiece);


    setTimeout(() => {
        touchedPiece.style.left = 0 + 'px';
        touchedPiece.style.top = 0 + 'px';
        originalPiece.style.left = 0 + 'px';
        originalPiece.style.top = 0 + 'px';
    }, 16);
}


function onMouseOver(e) {
    if (clicked) {
        draggedPiece.style.left = (e.clientX - squareSize / 2 - squareSel.offsetLeft) + 'px';
        draggedPiece.style.top = (e.clientY - squareSize / 2 - squareSel.offsetTop) + 'px';
        playSound(2, true);
    }
}

function onAnimationEnd() {
    this.style.zIndex = '20';
}

function generatePiece(arr) {
    const index = Math.floor(Math.random() * arr.length);
    const piece = document.createElement('img');
    piece.setAttribute('data-key', index + '');
    piece.classList.add('piece', 'show', 'dropping');
    piece.width = squareSize;
    piece.height = squareSize;
    piece.src = 'images/' + piecesURL[index];
    piece.onmousedown = mouseDown;
    piece.onmouseup = mouseUp;
    piece.onmouseover = onMouseOver;
    piece.addEventListener("webkitAnimationEnd", onAnimationEnd);
    return piece;
}

function mouseDown(e) {
    e.preventDefault();
    this.classList.add('highlight');
    playSound(1);
    draggedPiece = this;
    squareSel = this.parentElement;
    clicked = true;
}


function mouseUp() {
    let validMove = false;
    if (clicked) {
        let [keyCol, keyLine] = [parseInt(this.dataset.col), parseInt(this.dataset.lin)];
        let [otherKeyCol, otherKeyLine] = [parseInt(draggedPiece.dataset.col), parseInt(draggedPiece.dataset.lin)];

        if ((keyCol === otherKeyCol && keyLine === otherKeyLine) ||
            (keyCol === otherKeyCol && keyLine === otherKeyLine - 1) ||
            (keyCol === otherKeyCol && keyLine === otherKeyLine + 1) ||
            (keyCol === otherKeyCol - 1 && keyLine === otherKeyLine) ||
            (keyCol === otherKeyCol + 1 && keyLine === otherKeyLine)) {
            validMove = true;
        }
        if (validMove) {
            switchPiece(draggedPiece.parentElement, this.parentElement);
            if (!makeMove()) {
                switchPiece(this.parentElement, draggedPiece.parentElement);
                playSound(7);
            }
        } else {
            playSound(7);
        }
    }
    if (draggedPiece != null) {
        draggedPiece.classList.remove('highlight');
        draggedPiece.style.left = 0 + 'px';
        draggedPiece.style.top = 0 + 'px';
        draggedPiece = null;
    }

    clicked = false;
}

let checkNoMoveInterval;
let checkMoveInterval;

let pieceToAlign1;
let pieceToAlign2;

let isHoverImgShuffle;

imgBackBtnShuffle.onmouseover = function () {
    isHoverImgShuffle = true;
    this.classList.add('img_back_btn_shuffle_hover');
}

btnNewGame.onmouseover = function () {
    divLightNewGame.classList.add('light_new_game_hover');
    playSound(1, true);
}

btnNewGame.onmouseleave = function () {
    divLightNewGame.classList.remove('light_new_game_hover');
    playSound(7, true);
}

imgBackBtnShuffle.onmouseleave = function () {
    isHoverImgShuffle = false;
    this.classList.remove('img_back_btn_shuffle_hover');
}


function checkNoMoves() {
    checkNoMoveInterval = setInterval(() => {
        //matrix fazer iteracao de mudanca dos valores de lado
        timeWithoutMove++;
        for (let j = 0; j < matrix[0].length; j++) {
            for (let k = 0; k < matrix.length; k++) {
                const indiceKeyUp = [j - 1 >= 0 ? j - 1 : null, k];
                const indiceKeyDown = [j + 1 < verticalPieces ? j + 1 : null, k];
                const indiceKeyLeft = [j, k - 1 >= 0 ? k - 1 : null];
                const indiceKeyRight = [j, k + 1 < horizontalPieces ? k + 1 : null];
                if (checkIfChangedPiecesAligned([j, k], indiceKeyUp) ||
                    checkIfChangedPiecesAligned([j, k], indiceKeyDown) ||
                    checkIfChangedPiecesAligned([j, k], indiceKeyLeft) ||
                    checkIfChangedPiecesAligned([j, k], indiceKeyRight)) {
                    if (timeWithoutMove%10 == 0) {
                        if (pieceToAlign1 != null && pieceToAlign2 != null) {
                            pieceToAlign1.classList.add('move_hint');
                            pieceToAlign2.classList.add('move_hint');
                            setTimeout(() => {
                                //TODO : corrigir bug quando o timeout acontece sobre uma peça que já está destruída
                                squaresList.forEach(sqr => sqr.childNodes[0].classList.remove('move_hint'));
                            },2000);
                        }
                    }


                    if (!isHoverImgShuffle)
                        imgBackBtnShuffle.classList.remove('img_back_btn_shuffle_hover');
                    return;
                } else {
                    pieceToAlign1 = null;
                    pieceToAlign2 = null;
                }
            }
        }
        if (pieceToAlign1 == null) {
            setTimeout(() => {
                squaresList.forEach(sqr => sqr.childNodes[0].classList.remove('move_hint'));
            },2000);
            imgBackBtnShuffle.classList.add('img_back_btn_shuffle_hover');
        }
    }, 1000);
}

function checkIfChangedPiecesAligned(indexI, indexF) {
    let result = false;
    const temp = matrix[indexI[0]][indexI[1]];
    if (indexF[0] != null && indexF[1] != null) {
        matrix[indexI[0]][indexI[1]] = matrix[indexF[0]][indexF[1]];
        matrix[indexF[0]][indexF[1]] = temp;
        result = isPiecesAligned(true);
        matrix[indexF[0]][indexF[1]] = matrix[indexI[0]][indexI[1]];
        matrix[indexI[0]][indexI[1]] = temp;
    }
    if (result) {
        pieceToAlign1 = squaresList[horizontalPieces * (verticalPieces - 1 - indexI[0]) + indexI[1]].childNodes[0];
        pieceToAlign2 = squaresList[horizontalPieces * (verticalPieces - 1 - indexF[0]) + indexF[1]].childNodes[0];
    }
    return result;
}

function playSound(key, cutSound) {
    const audio = document.querySelector(`audio[data-key="${key}"]`);
    if (!audio) return;
    if (cutSound) audio.currentTime = 0;
    audio.play();
}

function movePiece(piece, finalPos, speed) {
    let [xI, yI] = [parseInt(piece.style.left === '' ? 0 : piece.style.left), parseInt(piece.style.top === '' ? 0 : piece.style.top)];
    const [xF, yF] = [finalPos[0], finalPos[1]];
    const xIncrement = xI > xF ? -1 : xI == xF ? 0 : 1;
    const yIncrement = yI > yF ? -1 : yI == yF ? 0 : 1;
    const interval = setInterval(frame, speed);
    function frame() {
        if (xI == xF && yI == yF) {
            clearInterval(interval);
        } else {
            xI = xI + xIncrement;
            yI = yI + yIncrement;
            piece.style.left = xI + 'px';
            piece.style.top = yI + 'px';
        }

    }
}


function isPiecesAligned(simulate) {
    let result = false;
    let arr = [];
    let count = 1;
    for (let i = 0; i < matrix.length; i++) {
        let tempKey = '-1';
        for (let j = 0; j < matrix[i].length; j++) {
            let key = matrix[i][j];
            arr.push(squaresList[horizontalPieces * (verticalPieces - 1 - i) + j]);
            if (key == tempKey) {
                count++;
            } else {
                count = 1;
                arr = [];
                arr.push(squaresList[horizontalPieces * (verticalPieces - 1 - i) + j]);
            }
            tempKey = key;
            if (count >= lineValueWin) {
                if (!simulate)
                    arr.forEach(sqr => sqr.childNodes[0].classList.add('destroy'));

                result = true;
            }
        }
    }
    count = 1;
    for (let i = 0; i < matrix[0].length; i++) {
        let tempKey = '-1';
        for (let j = 0; j < matrix.length; j++) {
            let key = matrix[j][i];
            arr.push(squaresList[horizontalPieces * (verticalPieces - 1 - j) + i]);
            if (key == tempKey) {
                count++;
            } else {
                count = 1;
                arr = [];
                arr.push(squaresList[horizontalPieces * (verticalPieces - 1 - j) + i]);
            }
            tempKey = key;
            if (count >= lineValueWin) {
                if (!simulate)
                    arr.forEach(sqr => sqr.childNodes[0].classList.add('destroy'));

                result = true;
            }
        }
    }
    return result;
}

function updateMatrixValues() {
    matrix.length = 0;
    let line = [];
    const pieces = document.querySelectorAll('.piece');
    for (let i = 0; i < pieces.length; i++) {
        line.push(pieces[i].dataset.key);
        if ((i + 1) % (horizontalPieces) == 0) {
            matrix.push(line);
            line = [];
        }
    }
}

let score = 0;

function hasPiecesDestroyed() {
    let time = 0;
    let cleanPieces = false;
    squaresList.forEach(square => {
        if (square.hasChildNodes() && square.childNodes[0].classList.contains('destroy')) {
            square.childNodes[0].remove();
            //play sound
            playSound(3)
            if (scorePossible) {
                score++;
                timeWithoutMove = 0;
                result.textContent = score + '';
            }
            time++;
            cleanPieces = true;
        }
    });
    return cleanPieces;
}

function startTimer() {

    seconds++
    if (seconds < 10) {
        secondsStr = '0' + seconds;
    } else {
        secondsStr = seconds + '';
    }
    if (seconds == 60) {
        secondsStr = '00';
        seconds = 0;
        minutes++;
    }
    if (minutes < 10) {
        minutesStr = '0' + minutes;
    } else {
        minutesStr = minutes + '';
    }
    if (minutes == 60) {
        minutes = 0;
        minutesStr = '00';
        hours++;
    }
    if (hours < 10) {
        hoursStr = '0' + hours;
    } else if (hours = 24) {
        hours = 0;
        hoursStr = '0' + hours;
    } else {
        hoursStr = hours + '';
    }
    timer.textContent = hoursStr + 'h:' + minutesStr + 'm:' + secondsStr + 's';
}

function fillEmptySpaces() {

    let time = 0;

    setTimeout(() => {
        while (hasPiecesDestroyed()) {

            for (let i = 0; i < squaresList.length; i++) {
                if (!squaresList[i].hasChildNodes()) {
                    if (i + horizontalPieces < squaresList.length) {
                        let upSqr = squaresList[i + horizontalPieces];
                        let temp = i + horizontalPieces;
                        while (temp < squaresList.length && !upSqr.hasChildNodes()) {
                            temp += horizontalPieces;
                            upSqr = squaresList[temp];
                        }
                        if (temp > squaresList.length) {
                            time++;
                            setTimeout(() => {
                                dropPiece(squaresList[i]);
                            }, 300 * time);
                            continue;
                        }
                        dropPiece(squaresList[i], upSqr);
                    } else {
                        time++;
                        setTimeout(() => {
                            dropPiece(squaresList[i]);
                        }, 300 * time);
                    }
                }
            }
            setTimeout(() => {
                updateMatrixValues();
                if (isPiecesAligned()) {
                    setTimeout(() => {
                        fillEmptySpaces();
                    }, 500);
                }
            }, 300 * time++);

        }
    }, 500);


}

function drawBoard() {

    let dimensionW = Math.floor((window.innerWidth / 2) / horizontalPieces);
    let dimensionH = Math.floor((window.innerHeight / 1.4) / horizontalPieces);

    if (dimensionW > dimensionH) {
        squareSize = dimensionH;
    } else
        squareSize = dimensionW;

    boardZone.innerHTML = '';

    board = document.createElement('table');

    for (let i = 0; i < verticalPieces; i++) {
        let line = document.createElement('tr');
        for (let j = 0; j < horizontalPieces; j++) {
            const sqr = document.createElement('th');
            sqr.setAttribute('data-lin', i + '');
            sqr.setAttribute('data-col', j + '');
            sqr.classList.add('square');
            sqr.style.width = squareSize + 'px';
            sqr.style.height = squareSize + 'px';
            squaresList.push(sqr);
            line.appendChild(sqr);
        }
        board.insertBefore(line, board.childNodes[0]);
    }

    boardZone.appendChild(board);

    board.onmouseleave = () => {
        if (draggedPiece != null) {
            clicked = false;
            let evt = new MouseEvent('mouseup');
            draggedPiece.dispatchEvent(evt);
        }
    };

    board.onmouseup = mouseUp;

    drawShowZone(squareSize);

    dropPieces();
}

function drawShowZone(squareSize) {

    let squareStuff = document.createElement('table');

    let line = document.createElement('tr');

    for (let j = 0; j < horizontalPieces; j++) {
        const sqr = document.createElement('th');
        sqr.setAttribute('data-key', 0 + '-' + j);
        sqr.classList.add('show_square');
        sqr.style.width = squareSize + 'px';
        sqr.style.height = squareSize + 'px';
        line.appendChild(sqr);
        showSquaresList.push(sqr);
    }

    squareStuff.appendChild(line);

    showZone.appendChild(squareStuff);
}