import { aStar, manhattanDistance } from "./pathfinding.js";
import { highlightTiles } from "../view/debugRenderer.js";

export default class GameLoop {
  constructor(board, player, enemies, view, inputHandler, collisionSystem) {
    this.board = board;
    this.player = player;
    this.enemies = enemies;
    this.view = view;
    this.inputHandler = inputHandler;
    this.collisionSystem = collisionSystem;

    this.prevTime = 0;
    this.accumulator = 0;
    this.restart = false;
  }

  start() {
    this.inputHandler.setupListeners();
    this.tick();
  }

  stop() {
    this.restart = true;
    this.inputHandler.removeListeners();
  }

  reset(newPlayer, newEnemies) {
    this.stop();
    this.player = newPlayer;
    this.enemies = newEnemies;
    this.view.init(this.board, [this.player, ...this.enemies]);

    setTimeout(() => {
      this.restart = false;
      this.start();
    }, 100);
  }

  tick = (time) => {
    if (!this.restart) requestAnimationFrame(this.tick);

    const controls = this.inputHandler.getControls();
    this.view.displayCharacter(this.player, controls, this.board);

    const deltaT = (time - this.prevTime) / 1000;
    this.prevTime = time;

    if (!isNaN(deltaT)) {
      this.accumulator += deltaT;
    }
    this.player.move(deltaT, controls, this.collisionSystem);

    let playerCollided = false;
    this.enemies.forEach((enemy) => {
      this.view.displayCharacter(enemy, enemy.controls, this.board);

      let path = [];
      const inSight = this.collisionSystem.inLineOfSight(
        this.player,
        enemy,
        this.board
      );
      if (inSight) {
        this.view.enemyFollowsPlayer(enemy);
        path = aStar(enemy, this.player, this.board, manhattanDistance);
      } else {
        this.view.enemyStopsFollowingPlayer(enemy);
      }

      highlightTiles(path);
      if (this.accumulator > Math.random() * 500 && path.length < 1) {
        enemy.randomizeControls();
        this.accumulator = 0;
      }

      if (!enemy.alive) return;

      enemy.move(deltaT, this.collisionSystem, this.player, path);

      if (this.collisionSystem.handleCollision(this.player, enemy)) {
        this.view.addCollisionAnimation(enemy);
        playerCollided = true;
      }

      setTimeout(() => {
        this.view.removeCollisionAnimation(enemy);
      }, 500);
    });

    if (playerCollided) {
      this.view.addCollisionAnimation(this.player);
    } else {
      this.view.removeCollisionAnimation(this.player);
    }
  };
}
