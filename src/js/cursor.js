import {CURSOR_SPEED} from "./constants.js";

let rowPosition = 0;   // Row starts at position 0
let columnPosition = 0; // Column starts at position 0
let rowDirection = 1;   // 1 means moving down, -1 means moving up
let columnDirection = 1; // 1 means moving right, -1 means moving left

let moveRow = true;     // Controls if the row should be moving
let moveColumn = true;  // Controls if the column should be moving

const rowHighlight = document.querySelector('#row-highlight');
const columnHighlight = document.querySelector('#column-highlight');
const viewfinder = document.querySelector('#viewfinder');

let cellSize = getCellSize();
let cursorInterval = null; //used later

// Function to move row, column, and viewfinder
function moveHighlights() {
    // Update row position and reverse direction if necessary
    if (moveRow) {
        if (rowPosition >= 9) {
            rowDirection = -1;  // Change direction when reaching the bottom
        } else if (rowPosition <= 0) {
            rowDirection = 1;   // Change direction when reaching the top
        }
        rowPosition += rowDirection;
    }

    // Update column position and reverse direction if necessary
    if (moveColumn) {
        if (columnPosition >= 9) {
            columnDirection = -1; // Change direction when reaching the right
        } else if (columnPosition <= 0) {
            columnDirection = 1;  // Change direction when reaching the left
        }
        columnPosition += columnDirection;
    }

    // Update the row and column highlight positions
    rowHighlight.style.transform = `translateY(${rowPosition * cellSize.height}px)`;  // 50px for the cell + 2px gap
    columnHighlight.style.transform = `translateX(${columnPosition * cellSize.width}px)`;  // 50px for the cell + 2px gap

    // Update the viewfinder position at the intersection of row and column
    viewfinder.style.transform = `translate(${columnPosition * cellSize.width}px, ${rowPosition * cellSize.height}px)`;  // Position at the intersection
}

function getCellSize() {
    let cellWidth = 0;
    let cellHeight = 0;

    const firstCell = document.querySelector('.square');
    if (firstCell) {
        const rect = firstCell.getBoundingClientRect();
        cellWidth = rect.width;
        cellHeight = rect.height;
    }

    return {width: cellWidth, height: cellHeight};
}


const updateCursorSize = () => {
    viewfinder.style.width = `${cellSize.width}px`;
    viewfinder.style.height = `${cellSize.height}px`;
}
const updateRowSize = () => {
    columnHighlight.style.width = `${cellSize.height}px`;
}
const updateColumnSize = () => {
    columnHighlight.style.width = `${cellSize.width}px`;
}


const resetCursor = () => {
    clearInterval(cursorInterval);

    rowPosition = 0;
    columnPosition = 0;
    rowDirection = 1;
    columnDirection = 1;
    moveRow = true;
    moveColumn = true;

    window.removeEventListener('resize', updateSizes);
}

document.addEventListener("GridInitEvent", function (e) {
    resetCursor();

    // Responsive updates
    let resizeObserver = new ResizeObserver(updateSizes);
    resizeObserver.observe(document.querySelector('.square'));

    window.addEventListener('resize', updateSizes);
    updateSizes();

    cursorInterval = setInterval(() => {
        moveHighlights();
    }, CURSOR_SPEED);
});

function updateSizes() {
    cellSize = getCellSize();
    updateCursorSize();
    updateRowSize();
    updateColumnSize();
}


// Key event listeners to stop and start row and column movement
const keyStatus = {
    q: false, // Q for row
    d: false,  // D for column
    s: false  // S for FIRE
}

// Listen for keydown and keyup events
window.addEventListener('keydown', (e) => {
    if (e.key === 'q') {
        keyStatus.q = true;
        moveRow = false; // Stop row when Q is pressed
    }
    if (e.key === 's') {
        keyStatus.s = true;
        dispatchFireEvent();
    }
    if (e.key === 'd') {
        keyStatus.d = true;
        moveColumn = false; // Stop column when D is pressed
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'q') {
        keyStatus.q = false;
        moveRow = true;  // Resume row when Q is released
    }
    if (e.key === 's') {
        keyStatus.s = false;
    }
    if (e.key === 'd') {
        keyStatus.d = false;
        moveColumn = true;  // Resume column when D is released
    }
});


//Functions called by QT to control the key state
const updateKeyColumn = (isPressed) => {
    keyStatus.d = isPressed;
    moveColumn = !isPressed;
}

const updateKeyRow = (isPressed) => {
    keyStatus.q = isPressed;
    moveRow = !isPressed;
}

const updateKeyFire = (isPressed) => {
    keyStatus.s = isPressed;

    if (isPressed) {
        dispatchFireEvent();
    }
}

function dispatchFireEvent() {
    let FireEvent = new CustomEvent("FireEvent", {
        detail: {
            message: "FIRE !!!",
            x: rowPosition,
            y: columnPosition,
            time: new Date(),
        },
    });
    document.dispatchEvent(FireEvent)
}

//attach them to window to make them globally accessible
window.updateKeyColumn = updateKeyColumn;
window.updateKeyRow = updateKeyRow;
window.updateKeyFire = updateKeyFire;