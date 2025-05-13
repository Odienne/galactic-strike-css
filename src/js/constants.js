const GRID_SIZE = 10;
const FIRE_COOLDOWN_MS = 666;
const CURSOR_SPEED = 444;
const SQUARE_STATES = {'UNKNOWN': 'UNKNOWN', 'HIT': 'HIT', 'MISSED': 'MISSED'};
const GRID_HTML = document.getElementById('grid');
const PLAYER_POINTS_HTML = document.getElementById('player-points');
const ENV = 'dev'; // dev or prod
const LOCAL_SOUNDS = true; //for local sound testing

export {GRID_SIZE, GRID_HTML, PLAYER_POINTS_HTML, FIRE_COOLDOWN_MS, SQUARE_STATES, ENV, LOCAL_SOUNDS, CURSOR_SPEED};