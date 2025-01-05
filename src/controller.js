import {
  map1,
  mapArena,
  mapAsymmetric,
  mapDungeon,
  mapMaze,
  mapOpen,
} from "../configs/maps.js";
import Board from "./model/Board.js";
import Enemy from "./model/Enemy.js";
import Player from "./model/Player.js";
import GameLoop from "./core/GameLoop.js";
import InputHandler from "./core/InputHandler.js";
import CollisionSystem from "./core/CollisionSystem.js";
import * as view from "./view/view.js";
import * as debugRenderer from "./view/debugRenderer.js";

// debug toggle flag
let DEBUG = false;

const board = new Board(768, 768, 64);

// Initialize core systems
const inputHandler = new InputHandler();
const collisionSystem = new CollisionSystem(board);
let gameLoop;

let player, enemies;

window.addEventListener("gameStart", (e) => start(e.detail));
window.addEventListener("gameRestart", (e) => reset(e.detail));
window.addEventListener("load", init);

function init() {
  console.log("Game initialized");

  view.initModal();
}

function start(selectedMap) {
  handleMapSelect(selectedMap);

  player = createPlayer();
  enemies = createEnemies(1, board);

  view.init(board, [player, ...enemies]);

  gameLoop = new GameLoop(
    board,
    player,
    enemies,
    view,
    inputHandler,
    collisionSystem
  );

  gameLoop.start();
}

function handleMapSelect(mapName) {
  const maps = { map1, mapArena, mapMaze, mapOpen, mapAsymmetric, mapDungeon };
  board.loadMap(maps[mapName]);
}

function createPlayer() {
  return new Player({ x: 96, y: 96 });
}

function createEnemies(amount, board) {
  const enemies = [];
  for (let i = 0; i < amount; i++) {
    enemies.push(createRandomEnemy(board));
  }
  return enemies;
}

function createRandomEnemy(board) {
  const newEnemy = new Enemy({
    x: Math.random() * board.width,
    y: Math.random() * board.height,
  });

  if (!collisionSystem.validateMovement(newEnemy, newEnemy)) {
    return createRandomEnemy(board);
  }
  return newEnemy;
}

export function reset(selectedMap) {
  handleMapSelect(selectedMap);
  player = createPlayer();
  enemies = createEnemies(1, board);
  gameLoop.reset(player, enemies);
}

export function debugModeOn() {
  return DEBUG;
}

export function toggleDebug() {
  DEBUG = !DEBUG;
  debugRenderer.setEnabled(DEBUG);
  view.setDebugButtonText(DEBUG ? "ON" : "OFF");
}
