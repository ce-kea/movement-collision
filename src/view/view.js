import * as controller from "../controller.js";
import * as debugRenderer from "./debugRenderer.js";

export function init(board, characters) {
  initKeyboardListeners();
  initButtons();

  const root = document.querySelector("#root");
  root.innerHTML = "";
  const boardElement = initBoard(board);
  root.appendChild(boardElement);
  displayTiles(board);

  characters.forEach((c) => {
    const characterElement = initCharacter(c);
    board.element.appendChild(characterElement);
  });
}

function initButtons() {
  const debugButton = document.querySelector("#debug-button");
  debugButton.addEventListener("click", controller.toggleDebug);
  setDebugButtonText(controller.debugModeOn() ? "ON" : "OFF");
}

export function setDebugButtonText(text) {
  const debugButtonText = document.querySelector("#debug-status");
  debugButtonText.innerText = text;
}

function initKeyboardListeners() {
  window.removeEventListener("keydown", controller.handleKeyDownInput);
  window.removeEventListener("keyup", controller.handleKeyUpInput);
  window.addEventListener("keydown", controller.handleKeyDownInput);
  window.addEventListener("keyup", controller.handleKeyUpInput);
}

function initBoard(board) {
  const boardElement = document.createElement("div");
  boardElement.setAttribute("id", "board");
  boardElement.style.width = board.width + "px";
  boardElement.style.height = board.height + "px";
  board.element = boardElement;

  initTiles(board);

  document.documentElement.style.setProperty("--row-num", board.tiles.rowNum);
  document.documentElement.style.setProperty("--col-num", board.tiles.colNum);
  document.documentElement.style.setProperty("--tile-size", board.tileSize);
  document.documentElement.style.setProperty("--sight-range", board.sightRange);

  return boardElement;
}

function initTiles(board) {
  for (let row = 0; row < board.tiles.rowNum; row++) {
    for (let col = 0; col < board.tiles.colNum; col++) {
      const cell = document.createElement("div");
      cell.classList.add("tile");
      cell.dataset.row = row;
      cell.dataset.col = col;
      board.element.appendChild(cell);
    }
  }
}

function displayTiles(board) {
  for (let row = 0; row < board.tiles.rowNum; row++) {
    for (let col = 0; col < board.tiles.colNum; col++) {
      const tile = document.querySelector(
        `.tile[data-row="${row}"][data-col="${col}"]`
      );
      const tileObj = board.tiles.get(row, col);
      tile.classList.add(tileObj.className);
    }
  }
}

function initCharacter(character) {
  const characterElement = document.createElement("div");
  if (character.enemy) {
    characterElement.classList.add("enemy");
  }
  characterElement.setAttribute("id", character.id);
  characterElement.classList.add("character");
  characterElement.style.height = character.height + "px";
  characterElement.style.width = character.width + "px";

  character.element = characterElement;
  return characterElement;
}

export function displayCharacter(character, controls, board) {
  character.element.style.height = character.height + "px";
  character.element.style.width = character.width + "px";
  if (!character.enemy) {
    displayPlayerStats(character);
  }

  if (controller.debugModeOn()) {
    if (!character.enemy) {
      debugRenderer.showHitBox(character);
    }
    debugRenderer.showRect(character);
    debugRenderer.showReg(character);
    debugRenderer.showGridOutline();
    if (character.enemy) {
      debugRenderer.showLineOfSight(character);
    }
  } else {
    debugRenderer.clearAll(character);
  }

  if (!character.alive) {
    character.element.classList.add("dead");
    return;
  }
  displayLookDirection(character, controls);
  displayCharacterMovement(character, controls);
}

function displayCharacterMovement(character, controls) {
  if (controls.up || controls.down || controls.left || controls.right) {
    character.element.classList.add("move");
  } else {
    character.element.classList.remove("move");
  }
  character.element.style.translate = `${character.x - character.regX}px ${
    character.y - character.regY
  }px`;
}

function displayLookDirection(character, controls) {
  if (controls.up && !controls.down) {
    character.element.style.backgroundPositionY = "300%";
  }
  if (controls.down && !controls.up) {
    character.element.style.backgroundPositionY = 0;
  }
  if (controls.left && !controls.right) {
    character.element.style.backgroundPositionY = "200%";
  }
  if (controls.right && !controls.left) {
    character.element.style.backgroundPositionY = "100%";
  }
}

export function addCollisionAnimation(character) {
  character.element.classList.add("collision");
}

export function removeCollisionAnimation(character) {
  character.element.classList.remove("collision");
}

function displayPlayerStats(player) {
  const playerHealth = document.querySelector("#player-health");
  playerHealth.innerText = player.health.toFixed(2);
}

export function initModal() {
  const modal = document.querySelector("#game-modal");
  const startButton = document.querySelector("#start-button");
  const restartButton = document.querySelector("#restart-button");
  const mapSelect = document.querySelector("#map-select");

  startButton.addEventListener("click", () => {
    const selectedMap = mapSelect.value;
    modal.close();
    window.dispatchEvent(new CustomEvent("gameStart", { detail: selectedMap }));
    showStatbar();
  });

  restartButton.addEventListener("click", () => {
    const selectedMap = mapSelect.value;
    modal.close();
    window.dispatchEvent(
      new CustomEvent("gameRestart", { detail: selectedMap })
    );
    showStatbar();
  });

  showStartModal();
}

export function showStartModal() {
  const modal = document.querySelector("#game-modal");
  hideStatbar();
  updateModal("Welcome!", "Please select the map you would like to play", true);
  modal.classList.remove("game-over");
  document.querySelector("#game-modal").showModal();
}

export function showGameOverModal() {
  const modal = document.querySelector("#game-modal");
  hideStatbar();
  updateModal("Game Over!", "Would you like to try again?", false);
  modal.classList.add("game-over");
  document.querySelector("#game-modal").showModal();
}

function updateModal(header, text, isStart) {
  document.querySelector("#modal-header").textContent = header;
  document.querySelector("#modal-text").textContent = text;
  document.querySelector("#start-button").style.display = isStart
    ? "block"
    : "none";
  document.querySelector("#restart-button").style.display = isStart
    ? "none"
    : "block";
}

function hideStatbar() {
  const statbar = document.querySelector("#statbar");
  statbar.classList.add("hidden");
}

function showStatbar() {
  const statbar = document.querySelector("#statbar");
  statbar.classList.remove("hidden");
}

export function enemyFollowsPlayer(enemy) {
  enemy.element.classList.add("follow");
}

export function enemyStopsFollowingPlayer(enemy) {
  enemy.element.classList.remove("follow");
}
