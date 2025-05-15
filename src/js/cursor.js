import {CURSOR_SPEED, AVAILABLE_WEAPONS} from "./constants.js";
import {calculateAffectedCells} from "./utils.js";

let currentWeapon = AVAILABLE_WEAPONS[0];
let rowPosition = 0;   // Row starts at position 0
let columnPosition = 0; // Column starts at position 0
let rowDirection = 1;   // 1 means moving down, -1 means moving up
let columnDirection = 1; // 1 means moving right, -1 means moving left

let moveRow = true;     // Controls if the row should be moving
let moveColumn = true;  // Controls if the column should be moving

const rowHighlight = document.querySelector('#row-highlight');
const columnHighlight = document.querySelector('#column-highlight');
const blastPreviewLayer = document.querySelector('#blast-preview-layer');
let viewfinders = document.querySelectorAll('.viewfinder');

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
    rowHighlight.style.transform = `translateY(${rowPosition * cellSize.height}px)`;
    columnHighlight.style.transform = `translateX(${columnPosition * cellSize.width}px)`;

    //update viewfinders
    updateBlastPreview(false);

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
    viewfinders.forEach(v => {
        v.style.width = `${cellSize.width}px`;
        v.style.height = `${cellSize.height}px`;
    })
}
const updateRowSize = () => {
    rowHighlight.style.height = `${cellSize.height}px`;
}
const updateColumnSize = () => {
    columnHighlight.style.width = `${cellSize.width}px`;
}

const resetWeapon = () => {
    currentWeapon = AVAILABLE_WEAPONS[0];
    updateBlastPreview(true);
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
    resetWeapon();
    resetCursor();

    // Responsive updates
    let resizeObserver = new ResizeObserver(updateSizes);
    resizeObserver.observe(document.querySelector('.square'));

    window.addEventListener('resize', updateSizes);
    updateSizes();

    cursorInterval = setInterval(() => {
        moveHighlights();
        updateBlastPreview();
    }, CURSOR_SPEED);
});

function updateBlastPreview(newWeapon = false) {
    const previewLayer = document.getElementById('blast-preview-layer');

    if (newWeapon) {
        previewLayer.innerHTML = ''; // Clear previous
    }

    const affected = currentWeapon.getAffectedCells(rowPosition, columnPosition);

    affected.forEach(([r, c]) => {
        if (newWeapon) { // this works great to create a new animation on weapon change
            const cell = document.createElement('div');
            cell.classList.add('viewfinder');
            cell.style.width = `${cellSize.width}px`;
            cell.style.height = `${cellSize.height}px`;
            //this places the viewfinders at the current target location
            cell.style.left = `${columnPosition * cellSize.width}px`;
            cell.style.top = `${rowPosition * cellSize.height}px`;
            previewLayer.appendChild(cell);

            // force reflow to ensure initial position is "seen"
            void cell.offsetWidth;

            requestAnimationFrame(() => {
                //then we animate the viewfinders to disperse to their right locations
                cell.style.left = `${c * cellSize.width}px`;
                cell.style.top = `${r * cellSize.height}px`;
            })
        }
    });

    if (newWeapon) {
        viewfinders = document.querySelectorAll('.viewfinder');
    }

    // Update viewfinder positions (applies always)
    viewfinders.forEach((v, i) => {
        if (i >= affected.length) return; // safety: skip extra viewfinders

        const [r, c] = affected[i];
        v.style.left = `${c * cellSize.width}px`;
        v.style.top = `${r * cellSize.height}px`;
    });
}

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
    //manage weapons
    if (e.key === '1') {
        currentWeapon = AVAILABLE_WEAPONS[0];
        updateBlastPreview(true);
    }
    if (e.key === '2') {
        currentWeapon = AVAILABLE_WEAPONS[1];
        updateBlastPreview(true);
    }
    if (e.key === '3') {
        currentWeapon = AVAILABLE_WEAPONS[2];
        updateBlastPreview(true);
    }

    //row, column and viewfinder management
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
const updateWeapon = (weaponId) => {
    //find weapon
    currentWeapon = AVAILABLE_WEAPONS[weaponId];
    updateBlastPreview(true);
    return currentWeapon;
}

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
            weapon: currentWeapon,
            time: new Date(),
        },
    });
    document.dispatchEvent(FireEvent)
}

//attach them to window to make them globally accessible
window.setWeapon = updateWeapon;
window.updateKeyColumn = updateKeyColumn;
window.updateKeyRow = updateKeyRow;
window.updateKeyFire = updateKeyFire;