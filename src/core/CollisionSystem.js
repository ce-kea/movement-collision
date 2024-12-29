export default class CollisionSystem {
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
            ...newPos
        };

        const coords = this.board.getTileCoordsFromCharacter(tmpChar);
        
        if (coords.some(c => this.board.isObstacle(this.board.getTileAtCoord(c)))) {
            return false;
        }

        return coords.every(({row, col}) => 
            row >= 0 && 
            col < this.board.tiles.colNum && 
            col >= 0 && 
            row < this.board.tiles.rowNum
        ) && newPos.y - character.regY >= 0;
    }

    getCharacterBounds(character) {
        return {
            left: character.x + character.hitbox.x,
            right: character.x + character.hitbox.x + character.hitbox.w,
            top: character.y + character.hitbox.y,
            bottom: character.y + character.hitbox.y + character.hitbox.h
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
}