let enabled = false;
let prevTiles = [];

export function setEnabled(isEnabled) {
  enabled = isEnabled;
  if (!enabled) {
    clearAll();
  }
}

export function highlightTiles(tiles) {
  if (!enabled) return;
  const className = "highlight-enemy-tile";
  prevTiles.forEach((t) => t.classList.remove(className));
  prevTiles = [];
  tiles.forEach((c) => {
    const visualTile = getVisualTileFromCoords(c);
    visualTile.classList.add(className);
    prevTiles.push(visualTile);
  });
}

export function showHitBox(character) {
  if (!enabled) return;
  document.documentElement.style.setProperty("--hitboxH", character.hitbox.h);
  document.documentElement.style.setProperty("--hitboxW", character.hitbox.w);
  document.documentElement.style.setProperty("--hitboxX", character.hitbox.x);
  document.documentElement.style.setProperty("--hitboxY", character.hitbox.y);
  character.element.classList.add("show-hitbox");
}

export function showReg(character) {
  if (!enabled) return;
  document.documentElement.style.setProperty("--regY", character.regY);
  document.documentElement.style.setProperty("--regX", character.regX);
  character.element.classList.add("show-reg");
}

export function showRect(character) {
  if (!enabled) return;
  character.element.classList.add("show-rect");
}

export function showLineOfSight(character) {
  if (!enabled) return;
  character.element.classList.add("show-line-of-sight");
}

export function showGridOutline() {
  if (!enabled) return;
  document
    .querySelectorAll(".tile")
    .forEach((t) => t.classList.add("show-grid-outline"));
}

export function clearAll(character) {
  clearDebugStyles(character);
}

// Private helper functions
function getVisualTileFromCoords({ row, col }) {
  return document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
}

function clearDebugStyles(character) {
  if (character) {
    character.element.classList.remove("show-hitbox");
    character.element.classList.remove("show-reg");
    character.element.classList.remove("show-rect");
    character.element.classList.remove("show-line-of-sight");
  }
  document.querySelectorAll(".tile").forEach((t) => {
    t.classList.remove("show-grid-outline");
    t.classList.remove("highlight-enemy-tile");
  });
}
