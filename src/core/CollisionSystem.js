import Board from "../model/Board.js";
import Character from "../model/Character.js";

export default class CollisionSystem {
  /**
   * @property {Board} board
   */

  /**
   * @param {Board} board
   */
  constructor(board) {
    this.board = board;
  }

  checkCharacterCollision(charA, charB) {
    if (!charA.alive || !charB.alive) return false;
    return this.checkAABBCollision(
      this.getCharacterBounds(charA),
      this.getCharacterBounds(charB)
    );
  }

  validateMovement(character, newPos) {
    const tmpChar = {
      regX: character.regX,
      regY: character.regY,
      hitbox: character.hitbox,
      ...newPos,
    };

    const coords = this.board.getTileCoordsFromCharacter(tmpChar);

    // Check if any of the tiles are out of bounds
    if (coords.some((coord) => this.board.getTileAtCoord(coord) === null)) {
      return false;
    }

    // Check if any of the tiles are obstacles
    return !coords.some((c) =>
      this.board.isObstacle(this.board.getTileAtCoord(c))
    );
  }

  getCharacterBounds(character) {
    return {
      left: character.x + character.hitbox.x,
      right: character.x + character.hitbox.x + character.hitbox.w,
      top: character.y + character.hitbox.y,
      bottom: character.y + character.hitbox.y + character.hitbox.h,
    };
  }

  checkAABBCollision(boundsA, boundsB) {
    return (
      boundsA.left < boundsB.right &&
      boundsA.right > boundsB.left &&
      boundsA.top < boundsB.bottom &&
      boundsA.bottom > boundsB.top
    );
  }

  handleCollision(charA, charB) {
    if (this.checkCharacterCollision(charA, charB)) {
      charA.takeDamage(charB.damage);
      charB.takeDamage(charA.damage);
      return true;
    }
    return false;
  }

  /**
   * Checks if charA has line of sight of charB
   * @param {Character} charA
   * @param {Character} charB
   * @param {Board} board
   */
  inLineOfSight(charA, charB, board) {
    // calculate straight line distance in pixels between charA and charB
    const straightLineDistance = Math.hypot(
      charB.x - charA.x,
      charB.y - charA.y
    );
    if (straightLineDistance > board.sightRange) {
      return false;
    }
    // get tiles between the two characters to check if any blocks vision
    const tilesBetween = board.getTilesBetween(charA, charB);
    let visionBlocked = false;
    tilesBetween.forEach((t, i) => {
      if (t.blocksVision) {
        visionBlocked = true;
      }
    });
    return !visionBlocked;
  }
}
