/**
 * Create a Backpack object, populate some HTML to display its properties.
 */
import Cell from "./cell.js";

const btnSimulate = document.querySelector("#btn-simulate");
const btnSimulateN = document.querySelector("#btn-simulate-n");
const btnSimulateForever = document.querySelector("#btn-simulate-forever");
const btnStopSimulation = document.querySelector("#btn-stop-simulation");
const btnExport = document.querySelector("#btn-export");
const btnReset = document.querySelector("#btn-reset");
const grid = document.querySelector(".grid");
const genInput = document.querySelector("#gen-input");
const selBoard = document.querySelector("#sel-board");
const genDelayInp = document.querySelector("#gen-delay");
const numCellsAlive = document.querySelector("#num-cells-alive");
const counter = document.querySelector(".counter");
const inputBox = document.querySelector(".input-box");
const timerBox = document.querySelector(".timer-box");
const messages = document.querySelector(".messages");
let boardChanged;
let nFactor = 0;
let intervId;
const BOARD_SIZE = 20;
const cells = [];
const boardMap = new Map();

const createCommonForm = (value = null) => {
  const matrix = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    const line = [];
    for (let j = 0; j < BOARD_SIZE; j++) {
      line[j] = value === null ? getRandomInt(1) : value;
    }
    matrix[i] = line;
  }
  return matrix;
};

const updateAliveCells = (num) => {
  numCellsAlive.innerHTML = (Number(numCellsAlive.innerHTML) + num).toString().padStart(3, "0");
}

const generateBoardWithCommonForm = (arr) => {
  numCellsAlive.innerHTML = "000";
  grid.innerHTML = "";
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    const line = [];
    for (let j = 0; j < arr[i].length; j++) {
      const cell = new Cell(count, arr[i][j], i, j);
      line[j] = cell;
      grid.appendChild(cell.getHTMLElement());
      count++;
      updateAliveCells(cell.state);
    }
    cells[i] = line;
  }
};

boardMap.set(0, createCommonForm(1));

for (let i = 1; i < 6; i++) {
  boardMap.set(i, createCommonForm());
  const opt = document.createElement("option");
  opt.setAttribute("value", `${i}`);
  opt.innerText = "Board-" + i;
  selBoard.appendChild(opt);
}

generateBoardWithCommonForm(boardMap.get(0));

selBoard.addEventListener("change", (ev) => {
  const board = boardMap.get(Number(ev.target.value));
  generateBoardWithCommonForm(board);
});

const showCounter = () => {
  if (!inputBox.classList.contains("hide")) {
    inputBox.classList.toggle("hide");
  }
  if (timerBox.classList.contains("hide")) {
    timerBox.classList.toggle("hide");
  }
  counter.innerHTML = nFactor;
};

const hideCounter = () => {
  inputBox.classList.toggle("hide");
  timerBox.classList.toggle("hide");
};

const stopTimer = () => {
  clearInterval(intervId);
  hideCounter();
  intervId = undefined;
  if (!boardChanged) {
    createMessage("No more changes possible");
    genInput.value = nFactor;
  }
};

const runGeneration = (type) => {
  if (!intervId) {
    const numGen = genInput.value === "" ? 0 : Number(genInput.value);
    const delay = genDelayInp.value === "" ? 0 : Number(genDelayInp.value);
    if (Number(numCellsAlive.innerText) === 0) {
      createMessage("All cells are dead :(");
      return;
    }
    if (type === 2 && numGen <= 0) {
      createMessage("Gen number must be greater than 0");
      return;
    }
    if (type === 2 && delay < 0) {
      createMessage("Must insert a delay equal or greater than 0");
      return;
    }
    if (type === 3 && delay <= 0) {
      createMessage("Must insert a delay greater than 0");
      return;
    }
    nFactor = 0;
    intervId = setInterval(() => {
      nFactor++;
      showCounter();
      changeCellsState();
      if (type === 1 || (type === 2 && (numGen - nFactor) === 0) || !boardChanged) {
        stopTimer();
      }
    }, type === 1 ? 0 : delay);
  }
}

btnSimulate.addEventListener("click", () => runGeneration(1));
btnSimulateN.addEventListener("click", () => runGeneration(2));
btnSimulateForever.addEventListener("click", () => runGeneration(3));

btnReset.addEventListener("click", () => {
  generateBoardWithCommonForm(boardMap.get(Number(selBoard.value)));
});

btnStopSimulation.addEventListener("click", () => {
  if (intervId) {
    stopTimer();
  }
});

btnExport.addEventListener("click", () => {
  console.log(cells.map(line => line.map(cell => cell.state)));
});

const changeCellsState = () => {
  boardChanged = false;
  cells.forEach(line => line.forEach(cell => cell.nearCellsAlive = getNearCellsAlive(cell)));
  cells.forEach(line => line.forEach(cell => {
    if ((cell.state === 1 && (cell.nearCellsAlive < 2 || cell.nearCellsAlive > 3)) || (cell.state === 0 && cell.nearCellsAlive === 3)) {
      cell.toggleState();
      boardChanged = true;
    }
  }));
};

const getNearCellsAlive = (cell) => {

  const isNearCellAlive = (row, col) => {
    return cells[row] && cells[row][col] && cells[row][col].state === 1;
  };

  let cellsAlive = 0;

  if (isNearCellAlive(cell.row, cell.col - 1))
    cellsAlive++;
  if (isNearCellAlive(cell.row, cell.col + 1))
    cellsAlive++;
  if (isNearCellAlive(cell.row - 1, cell.col - 1))
    cellsAlive++;
  if (isNearCellAlive(cell.row - 1, cell.col))
    cellsAlive++;
  if (isNearCellAlive(cell.row - 1, cell.col + 1))
    cellsAlive++;
  if (isNearCellAlive(cell.row + 1, cell.col - 1))
    cellsAlive++;
  if (isNearCellAlive(cell.row + 1, cell.col))
    cellsAlive++;
  if (isNearCellAlive(cell.row + 1, cell.col + 1))
    cellsAlive++;

  return cellsAlive;
};

function getRandomInt(max) {
  return Math.floor(Math.random() * (max + 1));
}

const createMessage = (message) => {
  messages.innerHTML = message;
  setTimeout(() => {
    messages.innerHTML = "";
  }, 3000);
};
