import { Grid } from "./Grid.js";
import Tile from "./Tile.js";
export default class Board {
  element;

  sightRange = 350;

  // board dimensions
  width;
  height;
  tileSize;

  // tiles grid
  /**
   * @property {Grid} tiles
   * @public
   */
  tiles;

  constructor(width, height, tileSize) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
    this.tiles = new Grid(
      Math.ceil(height / tileSize),
      Math.ceil(width / tileSize)
    );
  }

  // loads a map into the board
  loadMap(map) {
    for (let row = 0; row < map.length; row++) {
      for (let col = 0; col < map[0].length; col++) {
        const tileType = map[row][col];
        this.tiles.set(row, col, new Tile(tileType));
      }
    }
  }

  // checks if a tile is an obstacle, i.e. should block movement
  isObstacle(tile) {
    if (!tile) {
      return true; // out of bounds - needs to be true, otherwise it will be considered a valid move and the enemy will be stuck in place and player-enemy-coliision will not work
    }
    return tile.isObstacle;
  }

  // gets the tile at a given row and col
  getTileAtCoord({ row, col }) {
    if (this.tiles.indexFor(row, col) === -1) {
      return null; // out of bounds
    }
    return this.tiles.get(row, col);
  }

  // gets the tile at a given position (x, y)
  getTileAtPos({ x, y }) {
    const { row, col } = this.getCoordFromPos({ x, y });
    return this.getTileAtCoord({ row, col });
  }

  // gets the position (x, y) of the top left corner of a tile given a row and col
  getTilePosFromCoord({ row, col }) {
    return { x: col * this.tileSize, y: row * this.tileSize };
  }

  // gets the row and col of a tile given a position (x, y)
  getCoordFromPos({ x, y }) {
    return {
      row: Math.floor(y / this.tileSize),
      col: Math.floor(x / this.tileSize),
    };
  }

  // gets the coords (row, col) of the 4 corners of a character hitbox
  getTileCoordsFromCharacter(character) {
    const topLeft = {
      x: character.x - character.regX + character.hitbox.x,
      y: character.y - character.regY + character.hitbox.y,
    };
    const topRight = {
      x: topLeft.x + character.hitbox.w,
      y: topLeft.y,
    };
    const botLeft = {
      x: topLeft.x,
      y: topLeft.y + character.hitbox.h,
    };
    const botRight = {
      x: topLeft.x + character.hitbox.w,
      y: topLeft.y + character.hitbox.h,
    };

    return [
      this.getCoordFromPos(topLeft),
      this.getCoordFromPos(topRight),
      this.getCoordFromPos(botLeft),
      this.getCoordFromPos(botRight),
    ];
  }

  /**
   * Get the tiles between two positions, using the Bresenham's line algorithm
   * @param {{x:number, y:number}} posA
   * @param {{x:number, y:number}} posB
   * @returns {Tile[]} tiles between the two positions
   */
  getTilesBetween(posA, posB) {
    // get start and end coords in the grid
    const start = this.getCoordFromPos(posA);
    const end = this.getCoordFromPos(posB);

    const tiles = [];

    // calculate differences
    const dx = Math.abs(end.col - start.col);
    const dy = Math.abs(end.row - start.row);

    // determine direction of the line
    // sx positive means moving right, negative means moving left
    const sx = start.col < end.col ? 1 : -1;
    // sy positive means moving down, negative means moving up
    const sy = start.row < end.row ? 1 : -1;

    // error value
    let deviation = dx - dy;

    // set current coords
    let currentCol = start.col;
    let currentRow = start.row;
    while (true) {
      // add current coords to result
      tiles.push(this.tiles.get(currentRow, currentCol));

      // check if we reached the end
      if (currentCol === end.col && currentRow === end.row) {
        break;
      }

      // calculate error for next step
      const d2 = 2 * deviation;

      // step in x direction
      if (d2 > -dy) {
        deviation -= dy;
        currentCol += sx;
      }

      // step in y direction
      if (d2 < dx) {
        deviation += dx;
        currentRow += sy;
      }
    }

    return tiles;
  }
}
