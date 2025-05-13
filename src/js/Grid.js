import {GRID_SIZE, GRID_HTML, SQUARE_STATES} from "./constants.js";
import Ship from "./Ship.js";
import {GridInitEvent} from "./Events/GridInitEvent.js";

class Grid {
    constructor(shipsData, size = GRID_SIZE) {
        this.size = size;
        this.grid = [];
        this.ships = [];
        this.shipsData = shipsData;
        this.htmlElement = document.getElementById("grid");
        this.init();
    }

    init() {
        for (let i = 0; i < this.size; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.size; j++) {
                this.grid[i][j] = {
                    square: this.createSquare(i, j),
                    state: SQUARE_STATES.UNKNOWN,
                    ship: null
                };
            }
        }
        this.placeShips(this.shipsData);

        document.dispatchEvent(GridInitEvent)
    }

    createSquare(i, j) {
        const square = document.createElement("div");
        square.classList.add('square');
        square.id = `${i}-${j}`;
        GRID_HTML.insertAdjacentElement("beforeend", square);
        return square;
    }

    placeShips(shipsData) {
        // Loop through each ship
        shipsData.forEach((ship) => {
            ship = new Ship({name: ship.name, id: ship.id, points: ship.points, size: ship.size, images: ship.images});
            let placed = false;
            while (!placed) {
                // Randomly select a starting position for the ship
                let row = Math.floor(Math.random() * 10);
                let col = Math.floor(Math.random() * 10);

                // Randomly select a direction for the ship (horizontal or vertical)
                let direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';

                // Check if the ship can be placed at the selected position
                if (this.canPlaceShip(ship, row, col, direction)) {
                    // Place the ship on the grid
                    this.placeShip(ship, row, col, direction);
                    placed = true;
                }
            }
        });
    }

    canPlaceShip(ship, row, col, direction) {
        let canPlace = true;
        for (let i = 0; i < ship.size; i++) {
            if (direction === 'horizontal' && (col + i >= 10 || this.grid[row][col + i].ship)) {
                canPlace = false;
                break;
            } else if (direction === 'vertical' && (row + i >= 10 || this.grid[row + i][col].ship)) {
                canPlace = false;
                break;
            }
        }

        return canPlace;
    }

    placeShip(ship, row, col, direction) {
        for (let i = 0; i < ship.size; i++) {
            if (direction === 'horizontal') {
                let shipCell = document.createElement('div');
                shipCell.className = 'ship-cell horizontal';
                shipCell.style.backgroundImage = `url(${ship.images['horizontal'][i]})`;
                this.grid[row][col + i].square.appendChild(shipCell);

                //save position and part status for easier check later
                ship.positions.push({x: row, y: col + i, state: SQUARE_STATES.UNKNOWN, htmlElement: shipCell});
                //also save the ship object into the grid, easier to retrieve later
                this.grid[row][col + i].ship = ship;
            } else {
                let shipCell = document.createElement('div');
                shipCell.className = 'ship-cell vertical';
                shipCell.style.backgroundImage = `url(${ship.images['vertical'][i]})`;
                this.grid[row + i][col].square.appendChild(shipCell);
                //save position and part status for easier check later
                ship.positions.push({x: row + i, y: col, state: SQUARE_STATES.UNKNOWN, htmlElement: shipCell});
                //also save the ship object into the grid, easier to retrieve later
                this.grid[row + i][col].ship = ship;
            }
        }
        this.ships.push(ship)
    }

    getShip(pos) {
        const {x, y} = pos;

        return this.grid[x][y].ship
    }

    getSquare(pos) {
        const {x, y} = pos;

        return this.grid[x][y].square
    }

    updateSquareState(pos, state) {
        const {x, y} = pos;
        this.grid[x][y].state = state
        this.grid[x][y].square.classList.add(state.toLowerCase());
    }

    updateShipState(pos, state) {
        const ship = this.getShip(pos);

        //Update the part of the ship that was hit = matching the x, y pos
        for (let i = 0; i < ship.positions.length; i++) {
            if (ship.positions[i].x === pos.x && ship.positions[i].y === pos.y) {
                ship.positions[i].state = state;
                break;
            }
        }
        //update the grid view
        this.grid[pos.x][pos.y].ship = ship;

        //also update the ships array
        let shipIndex = this.ships.indexOf(ship);
        if (shipIndex !== -1) {
            this.ships[shipIndex] = ship;
        }
    }


    areAllShipsSunk() {
        return this.ships.every(ship => ship.positions.every(pos => pos.state === SQUARE_STATES.HIT));
    }


    resetShipsHtmlState() {
        this.ships.forEach((ship) => {
            ship.htmlElement.classList.remove('revealed');
        })
    }

    resetGrid() {
        //reset html and object
        GRID_HTML.innerHTML = '';
        this.init();
        this.placeShips(this.shipsData);
    }

    resetShips() {
        //todo ?
    }
}

export default Grid;