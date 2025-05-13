import {GRID_HTML, SQUARE_STATES, LOCAL_SOUNDS} from "./constants.js";
import {playLaserHitSound, playLaserMissSound, playShipExplosion} from "./sounds.js";

export const fetchAudiosData = async () => {
    try {
        const response = await fetch('src/data/sfx.json');
        let data = await response.json();
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
                message: "FIRE !!!",
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

export const fetchShipsData = async () => {
    try {
        const response = await fetch('src/data/ships.json');
        return await response.json();
    } catch (error) {
        console.error('Error fetching ships data:', error);
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

export const fire = (pos, Grid) => {
    const ship = Grid.getShip(pos);
    const square = Grid.getSquare(pos);

    const alreadyHitSquare = square.classList.contains(SQUARE_STATES.HIT.toLowerCase());

    dropBomb(pos, Grid);

    //timeout to sync with dropBomb animation
    setTimeout(() => {
        //first time hit on a square and it did hit a ship
        if (ship && !alreadyHitSquare) {
            Grid.updateSquareState(pos, SQUARE_STATES.HIT);
            Grid.updateShipState(pos, SQUARE_STATES.HIT);

            showExplosion(pos, Grid);
            playLaserHitSound();
            showPointsOnHit(square, ship);

            if (ship.isSunk()) {
                setTimeout(() => {
                    ship.revealSunkShip();
                    playShipExplosion();
                }, 600);
            }
        } else if (!alreadyHitSquare) {
            Grid.updateSquareState(pos, SQUARE_STATES.MISSED);
            playLaserMissSound();
        }
    }, 500)

    setTimeout(() => {
        if (Grid.areAllShipsSunk()) showEndGame(Grid);
    }, 1500);
}

const dropBomb = (pos, Grid) => {
    const bomb = document.createElement('div');
    bomb.classList.add('missile');
    Grid.htmlElement.appendChild(bomb);

    const {targetX, targetY} = getTargetCoords(pos, Grid);

    // Initial position (top of the screen, in correct column)
    bomb.style.left = `${targetX}px`;
    bomb.style.top = `-30px`;

    // Enable transition via CSS class
    bomb.style.transition = 'top 0.6s ease-in';

    // 👇 Force a reflow here
    void bomb.offsetHeight; // Triggers reflow

    // Now animate
    bomb.style.top = `calc(${targetY}px - 50px)`;

    // Trigger explosion after animation ends
    setTimeout(() => {
       Grid.htmlElement.removeChild(bomb);
    }, 500);
}

export const showExplosion = (pos, Grid) => {
    const {targetX, targetY} = getTargetCoords(pos, Grid);

    // Create explosion
    const explosion = document.createElement('img');
    explosion.src = 'src/img/explosion.gif'; // ✅ put your correct path here
    explosion.classList.add('explosion');
    explosion.style.position = 'absolute';
    explosion.style.left = `${targetX - 40}px`;
    explosion.style.top = `${targetY - 40}px`;
    explosion.style.width = '120px';
    explosion.style.height = '120px';
    explosion.style.pointerEvents = 'none';
    explosion.style.zIndex = '20';

    Grid.htmlElement.appendChild(explosion);

    // Remove explosion after it plays
    setTimeout(() => {
        Grid.htmlElement.removeChild(explosion);
    }, 600);
}

const getTargetCoords = (pos, Grid) => {
    const {x, y} = pos;

    const targetCell = document.getElementById(`${x}-${y}`);
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

    // Position it relative to the grid
    const squareRect = square.getBoundingClientRect();
    const gridRect = GRID_HTML.getBoundingClientRect();

    pointsPopup.style.left = (squareRect.left - gridRect.left + square.offsetWidth / 2 - 10) + 'px';
    pointsPopup.style.top = (squareRect.top - gridRect.top + square.offsetHeight / 2 - 10) + 'px';

    GRID_HTML.appendChild(pointsPopup);

    // Remove after animation
    setTimeout(() => {
        try {
            GRID_HTML.removeChild(pointsPopup);
        } catch (e) {

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

export const getDebugParam = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return (urlParams.get('debug') != null && urlParams.get('debug') === 'true') || false;
}

let debug = Boolean(getDebugParam());


