const GRID_SIZE = 10;
const FIRE_COOLDOWN_MS = 800;
const CURSOR_SPEED = 600;
const SQUARE_STATES = {'UNKNOWN': 'UNKNOWN', 'HIT': 'HIT', 'MISSED': 'MISSED'};
const GRID_HTML = document.getElementById('grid');
const PLAYER_POINTS_HTML = document.getElementById('player-points');
const ENV = 'dev'; // dev or prod
const LOCAL_SOUNDS = true; //for local sound testing

const AVAILABLE_WEAPONS = {
        '0': {
            'name': 'Laser',
            'id': 'laser',
            getAffectedCells: (row, col) => {
                return [[row, col]];
            }
        },
        '1': {
            'name': 'Blaster',
            'id': 'blaster',
            getAffectedCells: (row, col) => {
                return [
                    [row, col - 1],
                    [row, col],
                    [row, col + 1],
                ]; // line
            }
        },
        '2': {
            'name': 'Nuke',
            'id': 'nuke',
            getAffectedCells: (row, col) => {
                return [
                    [row - 1, col - 1], [row - 1, col + 1]
                    , [row, col],
                    [row + 1, col - 1], [row + 1, col + 1],
                ]; // cross grid
            }
        }
    }
;

export {
    GRID_SIZE,
    GRID_HTML,
    PLAYER_POINTS_HTML,
    FIRE_COOLDOWN_MS,
    SQUARE_STATES,
    ENV,
    LOCAL_SOUNDS,
    CURSOR_SPEED,
    AVAILABLE_WEAPONS
};