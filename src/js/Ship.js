import {SQUARE_STATES} from "./constants.js";

class Ship {
    constructor({name, id, points, size, images}) {
        this.name = name;
        this.id = id;
        this.points = points;
        this.size = size;
        this.images = images;
        this.positions = [];
    }

    isSunk() {
        return this.positions.every(p => p.state === SQUARE_STATES.HIT);
    }

    revealSunkShip() {
        //update all squares to show ship
        this.positions.forEach(pos => {
            const square = document.getElementById(`${pos.x}-${pos.y}`);
            square.classList.add(SQUARE_STATES.HIT.toLowerCase()); //just to be sure
            //replace image with damaged version
            pos.htmlElement.style.backgroundImage = pos.htmlElement.style.backgroundImage.replace("default", "broken");
            //reveal image
            pos.htmlElement.classList.add("revealed");
        });

        this.updateHTMLShipToBroken();
    }

    updateHTMLShipToBroken() {
        const shipFullImage = document.querySelector(`#${this.id} img`);
        shipFullImage.src = "src/img/ships/" + this.id + "_broken.png";
        shipFullImage.classList.add('sunk');
    }
}

export default Ship;
