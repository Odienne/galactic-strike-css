import {GRID_HTML, SQUARE_STATES, LOCAL_SOUNDS} from "./constants.js";
import {playLaserHitSound, playLaserMissSound, playShipExplosion} from "./sounds.js";
import Sounds from '../data/sfx.json';

export const loadSounds = async () => {
    try {
        let data = Sounds;
        //populates sounds object property with js objects if local testing
        if (LOCAL_SOUNDS === true) {
            for (const key in data) {
                if (Object.hasOwnProperty.call(data, key)) {
                    data[key].object = new Audio(data[key].src);
                }
            }
        }

        const SoundsLoadedEvent = new CustomEvent("SoundsLoadedEvent", {
            detail: {
                message: "Sounds Loaded",
                sounds: data,
                time: new Date(),
            },
        });
        document.dispatchEvent(SoundsLoadedEvent)

        return data;
    } catch (error) {
        console.error('Error fetching audios data:', error);
    }
};


export const showEndGame = (Grid) => {
    //todo
    console.log('END GAME')

    setTimeout(() => {
        restart(Grid);
    }, 1000)
}

export const restart = (Grid) => {
    Grid.resetGrid();
}

export const fire = (pos, Grid, weapon) => {
    const {x, y} = pos;
    const affected = weapon.getAffectedCells(x, y);


    affected.forEach(([r, c], index) => {
        const currentPos = {x: r, y: c};

        // Delay bomb drop
        setTimeout(() => {
            dropBomb(currentPos, Grid);

            // Slight delay after bomb before checking hit
            setTimeout(() => {
                try {
                    const square = Grid.getSquare(currentPos);
                    const ship = Grid.getShip(currentPos);

                    const alreadyHitSquare = square.classList.contains(SQUARE_STATES.HIT.toLowerCase());

                    if (ship && !alreadyHitSquare) {
                        Grid.updateSquareState(currentPos, SQUARE_STATES.HIT);
                        Grid.updateShipState(currentPos, SQUARE_STATES.HIT);

                        showExplosion(currentPos, Grid);
                        playLaserHitSound();
                        showPointsOnHit(square, ship);

                        if (ship.isSunk()) {
                            setTimeout(() => {
                                ship.revealSunkShip();
                                playShipExplosion();
                            }, 600);
                        }
                    } else if (!alreadyHitSquare) {
                        Grid.updateSquareState(currentPos, SQUARE_STATES.MISSED);
                        playLaserMissSound();
                    }

                } catch (e) {
                    // Ignore out-of-bounds or failed cell access
                    console.error(e)
                }
            }, 500); // Wait for bomb animation
        }, index * 100); // This delays each bomb based on its order
    });

    setTimeout(() => {
        if (Grid.areAllShipsSunk()) showEndGame(Grid);
    }, 500 + affected.length * 150 + 500); // wait till all animations wrap
};

const dropBomb = (pos, Grid) => {
    const bomb = document.createElement('div');
    bomb.classList.add('missile');
    Grid.htmlElement.appendChild(bomb);

    const {targetX, targetY} = getTargetCoords(pos, Grid);

    try {
        // Initial position (top of the screen, in correct column)
        bomb.style.left = `${targetX}px`;
        bomb.style.top = `-30px`;

        // Enable transition via CSS class
        bomb.style.transition = 'top 0.6s ease-in';

        // Force a reflow here
        void bomb.offsetHeight; // Triggers reflow

        // Now animate
        bomb.style.top = `${targetY}px`;

        // Trigger explosion after animation ends
        setTimeout(() => {
            Grid.htmlElement.removeChild(bomb);
        }, 500);
    } catch (e) {
        //outbound targetX or Y
        console.error(e)
    }
}

export const showExplosion = (pos, Grid) => {
    const {targetX, targetY} = getTargetCoords(pos, Grid);

    try {
        // Create explosion
        const explosion = document.createElement('img');
        explosion.src = 'src/img/explosion.gif';
        explosion.classList.add('explosion');
        explosion.style.position = 'absolute';
        explosion.style.left = `${targetX - 40}px`;
        explosion.style.top = `${targetY - 40}px`;
        explosion.style.width = '222px';
        explosion.style.height = '222px';
        explosion.style.pointerEvents = 'none';
        explosion.style.zIndex = '20';

        Grid.htmlElement.appendChild(explosion);

        // Remove explosion after it plays
        setTimeout(() => {
            Grid.htmlElement.removeChild(explosion);
        }, 600);
    } catch (e) {
        //outbound targetX or Y
        console.error(e)
    }
}

const getTargetCoords = (pos, Grid) => {
    const {x, y} = pos;

    const targetCell = document.getElementById(`${x}-${y}`);

    if (!targetCell) {
        return {targetX: -100, targetY: -100}; // fallback
    }

    const cellRect = targetCell.getBoundingClientRect();
    const gridRect = Grid.htmlElement.getBoundingClientRect();
    // Calculate relative position inside the grid
    const targetX = cellRect.left - gridRect.left + cellRect.width / 2 - 25;
    const targetY = cellRect.top - gridRect.top + cellRect.height / 2 - 25;

    return {targetX, targetY};
}

export const showPointsOnHit = (square, ship) => {
    const pointsPopup = document.createElement('div');
    const points = ship.points;

    updatePlayerPoints(points);

    pointsPopup.classList.add('points-popup');
    pointsPopup.textContent = '+ ' + points;

    // Add to DOM first (hidden), so we can measure it
    pointsPopup.style.visibility = 'hidden';
    GRID_HTML.appendChild(pointsPopup);

    const squareRect = square.getBoundingClientRect();
    const gridRect = GRID_HTML.getBoundingClientRect();
    const popupRect = pointsPopup.getBoundingClientRect();

    // Center the popup over the square
    const left = squareRect.left - gridRect.left + (square.offsetWidth / 2) - (popupRect.width / 2);
    const top = squareRect.top - gridRect.top + (square.offsetHeight / 2) - (popupRect.height / 2);

    pointsPopup.style.left = `${left}px`;
    pointsPopup.style.top = `${top}px`;

    // Make it visible again
    pointsPopup.style.visibility = 'visible';

    // Optional: add animation class here

    setTimeout(() => {
        try {
            GRID_HTML.removeChild(pointsPopup);
        } catch (e) {
            console.error(e)
        }
    }, 800);
}

const updatePlayerPoints = (points) => {
    const UpdatePlayerPointsEvent = new CustomEvent("UpdatePlayerPointsEvent", {
        detail: {
            message: "Update player points",
            points: points,
            time: new Date(),
        },
    });

    document.dispatchEvent(UpdatePlayerPointsEvent);
}

export const calculateAffectedCells = (row, col, weapon) => {
    const inBounds = (r, c) => r >= 0 && r < 10 && c >= 0 && c < 10;

    const cells = [];

    switch (weapon) {
        case "laser":
            if (inBounds(row, col)) {
                cells.push([row, col]);
            }
            break;

        case "blaster":
            // Fires on current and horizontal neighbors
            [-1, 0, 1].forEach(offset => {
                const c = col + offset;
                if (inBounds(row, c)) cells.push([row, c]);
            });
            break;

        case "nuke":
            // Fires in an X pattern: row±1 & col±1
            cells.push([row, col]); // center
            if (inBounds(row - 1, col - 1)) cells.push([row - 1, col - 1]);
            if (inBounds(row + 1, col + 1)) cells.push([row + 1, col + 1]);
            if (inBounds(row - 1, col + 1)) cells.push([row - 1, col + 1]);
            if (inBounds(row + 1, col - 1)) cells.push([row + 1, col - 1]);
            break;
    }

    return cells;
}


export const getDebugParam = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return (urlParams.get('debug') != null && urlParams.get('debug') === 'true') || false;
}


