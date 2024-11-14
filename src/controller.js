import Board from "./model/Board.js";
import Enemy from "./model/Enemy.js";
import Player from "./model/Player.js";
import * as view from "./view.js";

window.addEventListener("load", start);

let prevTime = 0;
let accumulator = 0;

const board = new Board(window.innerWidth - 100, window.innerHeight - 100);

const player = new Player({ level: 2 });
const enemy1 = new Enemy({ level: 1 });
const enemy2 = new Enemy({ level: 1 });
const enemy3 = new Enemy({ level: 2 });
const enemy4 = new Enemy({ level: 3 });
const enemy5 = new Enemy({ level: 4 });
const enemy6 = new Enemy({ level: 5 });
const enemy7 = new Enemy({ level: 6 });
const enemies = [enemy1, enemy2, enemy3, enemy4, enemy5, enemy6, enemy7];

const controls = {
  up: false,
  left: false,
  down: false,
  right: false,
};

function start() {
  view.init(board, [player, ...enemies]);
  tick();
}

export function handleKeyDownInput(e) {
  switch (e.key) {
    case "w":
    case "ArrowUp":
      controls.up = true;
      break;
    case "a":
    case "ArrowLeft":
      controls.left = true;
      break;
    case "s":
    case "ArrowDown":
      controls.down = true;
      break;
    case "d":
    case "ArrowRight":
      controls.right = true;
      break;
  }
}

export function handleKeyUpInput(e) {
  switch (e.key) {
    case "w":
    case "ArrowUp":
      controls.up = false;
      break;
    case "a":
    case "ArrowLeft":
      controls.left = false;
      break;
    case "s":
    case "ArrowDown":
      controls.down = false;
      break;
    case "d":
    case "ArrowRight":
      controls.right = false;
      break;
  }
}

function tick(time) {
  requestAnimationFrame(tick);
  const deltaT = (time - prevTime) / 1000;
  prevTime = time;
  if (!isNaN(deltaT)) {
    accumulator += deltaT;
  }
  player.move(deltaT, controls, board);
  let playerCollided = false;
  enemies.forEach((enemy) => {
    // Randomize enemy controls every 500ms
    if (accumulator > Math.random() * 500) {
      enemy.randomizeControls();
      accumulator = 0;
    }

    if (!enemy.alive) return;

    enemy.move(deltaT, board);

    if (handleCollision(player, enemy)) {
      view.addCollisionAnimation(enemy);
      playerCollided = true;
    }
    setTimeout(() => {
      view.removeCollisionAnimation(enemy);
    }, 500);

    view.displayCharacter(enemy, enemy.controls);
  });

  if (playerCollided) {
    view.addCollisionAnimation(player);
  } else {
    view.removeCollisionAnimation(player);
  }

  view.displayCharacter(player, controls);
}

function handleCollision(charA, charB) {
  if (!charA.alive || !charB.alive) return false;
  if (collision(charA, charB)) {
    const c1LeveledDown = charA.takeDamage(charB.damage);
    const c2LeveledDown = charB.takeDamage(charA.damage);

    if (c1LeveledDown) {
      akilledb(charB, charA);
    } else if (c2LeveledDown) {
      akilledb(charA, charB);
    }
    return true;
  }
  return false;
}

function akilledb(charA, charB) {
  charA.levelUp();
  view.addLevelUpAnimation(charA);

  if (charB.alive) {
    view.addInvulnerabilityAnimation(charB);
  }

  setTimeout(() => {
    view.removeInvulnerabilityAnimation(charB);
    view.removeLevelUpAnimation(charA);
  }, 2000);
}

function collision(charA, charB) {
  return (
    charA.x < charB.x + charB.width &&
    charA.x + charA.width > charB.x &&
    charA.y < charB.y + charB.height &&
    charA.y + charA.height > charB.y
  );
}
