import './translation.js';
import './background.js';
import './cursor.js';
import './timer.js';

import Ships from '../data/ships.json';

import Grid from './Grid.js';
import {fire, getDebugParam, loadSounds} from "./utils.js";
import {signalNewGrid, signalScore} from "./signals.js";
import {FIRE_COOLDOWN_MS, PLAYER_POINTS_HTML} from "./constants.js";



/* Clean way of keeping track of game state */
const GameState = {
    timer: 180,
    isDebug: getDebugParam(),
    canFire: true,
    hasGameStarted: false,
    playerTotalPoints: 0,
    ships: null,
    sounds: null,
};


const startGame = async () => {
    GameState.sounds = await loadSounds();
    GameState.ships = Ships;

    GameState.grid = new Grid(GameState.ships);
    GameState.hasGameStarted = true;
}

startGame();

document.addEventListener('UpdatePlayerPointsEvent', onUpdatePlayerPoints);
document.addEventListener('FireEvent', onFireEvent);
document.addEventListener('GridInitEvent', () => {
    signalNewGrid(GameState.grid);
});

function onFireEvent(event) {
    if (GameState.canFire) {
        GameState.canFire = false;

        const {x, y} = event.detail;
        fire({x, y}, GameState.grid, event.detail.weapon);

        setTimeout(() => {
            GameState.canFire = true;
        }, FIRE_COOLDOWN_MS);
    }
}

function onUpdatePlayerPoints(event) {
    const points = event.detail.points;
    GameState.playerTotalPoints += points;
    PLAYER_POINTS_HTML.textContent = GameState.playerTotalPoints;

    signalScore(GameState.playerTotalPoints);
}