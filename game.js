(() => {
  // src/data/translations/translations.fr.json
  var translations_fr_default = {
    right: "Super !",
    wrong: "Mauvaise re\u0301ponse !",
    score: "Score :"
  };

  // src/data/translations/translations.en.json
  var translations_en_default = {
    right: "Right!",
    wrong: "Wrong!",
    score: "Score:"
  };

  // src/js/Translator.js
  var Translator = class {
    constructor(lang2) {
      this.lang = lang2;
      this.translations = lang2 === "fr" ? translations_fr_default : translations_en_default;
    }
  };

  // src/js/translation.js
  var lang = "fr";
  var translations = {};
  function setLanguage(newLang) {
    lang = newLang;
    translateAll();
    return lang;
  }
  var translate = (key) => {
    return translations[key] || key;
  };
  async function translateAll() {
    translations = new Translator(lang).translations;
    document.getElementById("score-text").textContent = translate("score");
  }
  window.addEventListener("DOMContentLoaded", () => {
    setLanguage("fr");
  });
  window.setLanguage = setLanguage;

  // src/js/constants.js
  var GRID_SIZE = 10;
  var FIRE_COOLDOWN_MS = 800;
  var CURSOR_SPEED = 600;
  var SQUARE_STATES = { "UNKNOWN": "UNKNOWN", "HIT": "HIT", "MISSED": "MISSED" };
  var GRID_HTML = document.getElementById("grid");
  var PLAYER_POINTS_HTML = document.getElementById("player-points");
  var LOCAL_SOUNDS = true;
  var AVAILABLE_WEAPONS = {
    "0": {
      "name": "Laser",
      "id": "laser",
      getAffectedCells: (row, col) => {
        return [[row, col]];
      }
    },
    "1": {
      "name": "Blaster",
      "id": "blaster",
      getAffectedCells: (row, col) => {
        return [
          [row, col - 1],
          [row, col],
          [row, col + 1]
        ];
      }
    },
    "2": {
      "name": "Nuke",
      "id": "nuke",
      getAffectedCells: (row, col) => {
        return [
          [row - 1, col - 1],
          [row - 1, col + 1],
          [row, col],
          [row + 1, col - 1],
          [row + 1, col + 1]
        ];
      }
    }
  };

  // src/js/signals.js
  var signalScore = (score) => {
  };
  var signalPlaySound = (id) => {
  };
  var signalNewGrid = (grid) => {
  };

  // src/js/sounds.js
  var sounds = {};
  var playSound = (name) => {
    const sound = sounds[name];
    if (LOCAL_SOUNDS === true) {
      sound.object.play();
    } else {
      signalPlaySound(sound.id);
    }
  };
  var playLaserHitSound = () => {
    playSound("laser-hit");
  };
  var playLaserMissSound = () => {
    playSound("laser-miss");
  };
  var playShipExplosion = () => {
    playSound("ship-explosion");
  };
  document.addEventListener("SoundsLoadedEvent", (e) => {
    sounds = e.detail.sounds;
  });

  // src/data/sfx.json
  var sfx_default = {
    fire: {
      id: "1",
      name: "fire",
      src: "src/sfx/fire.mp3",
      description: "Played when player presses the fire button",
      object: null
    },
    "laser-hit": {
      id: "2",
      name: "laser_hit",
      src: "src/sfx/laser_hit.mp3",
      description: "Played when laser hits something",
      object: null
    },
    "laser-miss": {
      id: "3",
      name: "laser_miss",
      src: "src/sfx/laser_miss.mp3",
      description: "Played when laser misses",
      object: null
    },
    "ship-explosion": {
      id: "4",
      name: "ship_explosion",
      src: "src/sfx/ship_explosion.mp3",
      description: "Played when ship is sunk",
      object: null
    }
  };

  // src/js/utils.js
  var loadSounds = async () => {
    try {
      let data = sfx_default;
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
          time: /* @__PURE__ */ new Date()
        }
      });
      document.dispatchEvent(SoundsLoadedEvent);
      return data;
    } catch (error) {
      console.error("Error fetching audios data:", error);
    }
  };
  var showEndGame = (Grid2) => {
    console.log("END GAME");
    setTimeout(() => {
      restart(Grid2);
    }, 1e3);
  };
  var restart = (Grid2) => {
    Grid2.resetGrid();
  };
  var fire = (pos, Grid2, weapon) => {
    const { x, y } = pos;
    const affected = weapon.getAffectedCells(x, y);
    affected.forEach(([r, c], index) => {
      const currentPos = { x: r, y: c };
      setTimeout(() => {
        dropBomb(currentPos, Grid2);
        setTimeout(() => {
          try {
            const square = Grid2.getSquare(currentPos);
            const ship = Grid2.getShip(currentPos);
            const alreadyHitSquare = square.classList.contains(SQUARE_STATES.HIT.toLowerCase());
            if (ship && !alreadyHitSquare) {
              Grid2.updateSquareState(currentPos, SQUARE_STATES.HIT);
              Grid2.updateShipState(currentPos, SQUARE_STATES.HIT);
              showExplosion(currentPos, Grid2);
              playLaserHitSound();
              showPointsOnHit(square, ship);
              if (ship.isSunk()) {
                setTimeout(() => {
                  ship.revealSunkShip();
                  playShipExplosion();
                }, 600);
              }
            } else if (!alreadyHitSquare) {
              Grid2.updateSquareState(currentPos, SQUARE_STATES.MISSED);
              playLaserMissSound();
            }
          } catch (e) {
            console.error(e);
          }
        }, 500);
      }, index * 100);
    });
    setTimeout(() => {
      if (Grid2.areAllShipsSunk()) showEndGame(Grid2);
    }, 500 + affected.length * 150 + 500);
  };
  var dropBomb = (pos, Grid2) => {
    const bomb = document.createElement("div");
    bomb.classList.add("missile");
    Grid2.htmlElement.appendChild(bomb);
    const { targetX, targetY } = getTargetCoords(pos, Grid2);
    try {
      bomb.style.left = `${targetX}px`;
      bomb.style.top = `-30px`;
      bomb.style.transition = "top 0.6s ease-in";
      void bomb.offsetHeight;
      bomb.style.top = `${targetY}px`;
      setTimeout(() => {
        Grid2.htmlElement.removeChild(bomb);
      }, 500);
    } catch (e) {
      console.error(e);
    }
  };
  var showExplosion = (pos, Grid2) => {
    const { targetX, targetY } = getTargetCoords(pos, Grid2);
    try {
      const explosion = document.createElement("img");
      explosion.src = "src/img/explosion.gif";
      explosion.classList.add("explosion");
      explosion.style.position = "absolute";
      explosion.style.left = `${targetX - 40}px`;
      explosion.style.top = `${targetY - 40}px`;
      explosion.style.width = "222px";
      explosion.style.height = "222px";
      explosion.style.pointerEvents = "none";
      explosion.style.zIndex = "20";
      Grid2.htmlElement.appendChild(explosion);
      setTimeout(() => {
        Grid2.htmlElement.removeChild(explosion);
      }, 600);
    } catch (e) {
      console.error(e);
    }
  };
  var getTargetCoords = (pos, Grid2) => {
    const { x, y } = pos;
    const targetCell = document.getElementById(`${x}-${y}`);
    if (!targetCell) {
      return { targetX: -100, targetY: -100 };
    }
    const cellRect = targetCell.getBoundingClientRect();
    const gridRect = Grid2.htmlElement.getBoundingClientRect();
    const targetX = cellRect.left - gridRect.left + cellRect.width / 2 - 25;
    const targetY = cellRect.top - gridRect.top + cellRect.height / 2 - 25;
    return { targetX, targetY };
  };
  var showPointsOnHit = (square, ship) => {
    const pointsPopup = document.createElement("div");
    const points = ship.points;
    updatePlayerPoints(points);
    pointsPopup.classList.add("points-popup");
    pointsPopup.textContent = "+ " + points;
    pointsPopup.style.visibility = "hidden";
    GRID_HTML.appendChild(pointsPopup);
    const squareRect = square.getBoundingClientRect();
    const gridRect = GRID_HTML.getBoundingClientRect();
    const popupRect = pointsPopup.getBoundingClientRect();
    const left = squareRect.left - gridRect.left + square.offsetWidth / 2 - popupRect.width / 2;
    const top = squareRect.top - gridRect.top + square.offsetHeight / 2 - popupRect.height / 2;
    pointsPopup.style.left = `${left}px`;
    pointsPopup.style.top = `${top}px`;
    pointsPopup.style.visibility = "visible";
    setTimeout(() => {
      try {
        GRID_HTML.removeChild(pointsPopup);
      } catch (e) {
        console.error(e);
      }
    }, 800);
  };
  var updatePlayerPoints = (points) => {
    const UpdatePlayerPointsEvent = new CustomEvent("UpdatePlayerPointsEvent", {
      detail: {
        message: "Update player points",
        points,
        time: /* @__PURE__ */ new Date()
      }
    });
    document.dispatchEvent(UpdatePlayerPointsEvent);
  };
  var getDebugParam = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("debug") != null && urlParams.get("debug") === "true" || false;
  };

  // src/js/cursor.js
  var currentWeapon = AVAILABLE_WEAPONS[0];
  var rowPosition = 0;
  var columnPosition = 0;
  var rowDirection = 1;
  var columnDirection = 1;
  var moveRow = true;
  var moveColumn = true;
  var rowHighlight = document.querySelector("#row-highlight");
  var columnHighlight = document.querySelector("#column-highlight");
  var blastPreviewLayer = document.querySelector("#blast-preview-layer");
  var viewfinders = document.querySelectorAll(".viewfinder");
  var cellSize = getCellSize();
  var cursorInterval = null;
  function moveHighlights() {
    if (moveRow) {
      if (rowPosition >= 9) {
        rowDirection = -1;
      } else if (rowPosition <= 0) {
        rowDirection = 1;
      }
      rowPosition += rowDirection;
    }
    if (moveColumn) {
      if (columnPosition >= 9) {
        columnDirection = -1;
      } else if (columnPosition <= 0) {
        columnDirection = 1;
      }
      columnPosition += columnDirection;
    }
    rowHighlight.style.transform = `translateY(${rowPosition * cellSize.height}px)`;
    columnHighlight.style.transform = `translateX(${columnPosition * cellSize.width}px)`;
    updateBlastPreview(false);
  }
  function getCellSize() {
    let cellWidth = 0;
    let cellHeight = 0;
    const firstCell = document.querySelector(".square");
    if (firstCell) {
      const rect = firstCell.getBoundingClientRect();
      cellWidth = rect.width;
      cellHeight = rect.height;
    }
    return { width: cellWidth, height: cellHeight };
  }
  var updateCursorSize = () => {
    viewfinders.forEach((v) => {
      v.style.width = `${cellSize.width}px`;
      v.style.height = `${cellSize.height}px`;
    });
  };
  var updateRowSize = () => {
    rowHighlight.style.height = `${cellSize.height}px`;
  };
  var updateColumnSize = () => {
    columnHighlight.style.width = `${cellSize.width}px`;
  };
  var resetWeapon = () => {
    currentWeapon = AVAILABLE_WEAPONS[0];
    updateBlastPreview(true);
  };
  var resetCursor = () => {
    clearInterval(cursorInterval);
    rowPosition = 0;
    columnPosition = 0;
    rowDirection = 1;
    columnDirection = 1;
    moveRow = true;
    moveColumn = true;
    window.removeEventListener("resize", updateSizes);
  };
  document.addEventListener("GridInitEvent", function(e) {
    resetWeapon();
    resetCursor();
    let resizeObserver = new ResizeObserver(updateSizes);
    resizeObserver.observe(document.querySelector(".square"));
    window.addEventListener("resize", updateSizes);
    updateSizes();
    cursorInterval = setInterval(() => {
      moveHighlights();
      updateBlastPreview();
    }, CURSOR_SPEED);
  });
  function updateBlastPreview(newWeapon = false) {
    const previewLayer = document.getElementById("blast-preview-layer");
    if (newWeapon) {
      previewLayer.innerHTML = "";
    }
    const affected = currentWeapon.getAffectedCells(rowPosition, columnPosition);
    affected.forEach(([r, c]) => {
      if (newWeapon) {
        const cell = document.createElement("div");
        cell.classList.add("viewfinder");
        cell.style.width = `${cellSize.width}px`;
        cell.style.height = `${cellSize.height}px`;
        cell.style.left = `${columnPosition * cellSize.width}px`;
        cell.style.top = `${rowPosition * cellSize.height}px`;
        previewLayer.appendChild(cell);
        void cell.offsetWidth;
        requestAnimationFrame(() => {
          cell.style.left = `${c * cellSize.width}px`;
          cell.style.top = `${r * cellSize.height}px`;
        });
      }
    });
    if (newWeapon) {
      viewfinders = document.querySelectorAll(".viewfinder");
    }
    viewfinders.forEach((v, i) => {
      if (i >= affected.length) return;
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
  var keyStatus = {
    q: false,
    // Q for row
    d: false,
    // D for column
    s: false
    // S for FIRE
  };
  window.addEventListener("keydown", (e) => {
    if (e.key === "1") {
      currentWeapon = AVAILABLE_WEAPONS[0];
      updateBlastPreview(true);
    }
    if (e.key === "2") {
      currentWeapon = AVAILABLE_WEAPONS[1];
      updateBlastPreview(true);
    }
    if (e.key === "3") {
      currentWeapon = AVAILABLE_WEAPONS[2];
      updateBlastPreview(true);
    }
    if (e.key === "q") {
      keyStatus.q = true;
      moveRow = false;
    }
    if (e.key === "s") {
      keyStatus.s = true;
      dispatchFireEvent();
    }
    if (e.key === "d") {
      keyStatus.d = true;
      moveColumn = false;
    }
  });
  window.addEventListener("keyup", (e) => {
    if (e.key === "q") {
      keyStatus.q = false;
      moveRow = true;
    }
    if (e.key === "s") {
      keyStatus.s = false;
    }
    if (e.key === "d") {
      keyStatus.d = false;
      moveColumn = true;
    }
  });
  var updateWeapon = (weaponId) => {
    currentWeapon = AVAILABLE_WEAPONS[weaponId];
    updateBlastPreview(true);
    return currentWeapon;
  };
  var updateKeyColumn = (isPressed) => {
    keyStatus.d = isPressed;
    moveColumn = !isPressed;
  };
  var updateKeyRow = (isPressed) => {
    keyStatus.q = isPressed;
    moveRow = !isPressed;
  };
  var updateKeyFire = (isPressed) => {
    keyStatus.s = isPressed;
    if (isPressed) {
      dispatchFireEvent();
    }
  };
  function dispatchFireEvent() {
    let FireEvent = new CustomEvent("FireEvent", {
      detail: {
        message: "FIRE !!!",
        x: rowPosition,
        y: columnPosition,
        weapon: currentWeapon,
        time: /* @__PURE__ */ new Date()
      }
    });
    document.dispatchEvent(FireEvent);
  }
  window.setWeapon = updateWeapon;
  window.updateKeyColumn = updateKeyColumn;
  window.updateKeyRow = updateKeyRow;
  window.updateKeyFire = updateKeyFire;

  // src/js/timer.js
  var localTimer = 180;
  var localTimerInterval = null;
  var startLocalTimer = () => {
    localTimerInterval = setInterval(() => {
      let minutes = Math.floor(localTimer / 60);
      let seconds = localTimer % 60;
      document.getElementById("timer").innerHTML = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      localTimer--;
      if (localTimer < 0) {
        clearInterval(localTimerInterval);
        document.getElementById("timer").innerHTML = "Time's up!";
      }
    }, 1e3);
  };
  document.addEventListener("DOMContentLoaded", startLocalTimer);

  // src/data/ships.json
  var ships_default = [
    {
      name: "Carrier",
      id: "carrier",
      points: 20,
      size: 5,
      images: {
        vertical: [
          "./src/img/ships/default/carrier1.png",
          "./src/img/ships/default/carrier2.png",
          "./src/img/ships/default/carrier3.png",
          "./src/img/ships/default/carrier4.png",
          "./src/img/ships/default/carrier5.png"
        ],
        horizontal: [
          "./src/img/ships/default/carrier1.png",
          "./src/img/ships/default/carrier2.png",
          "./src/img/ships/default/carrier3.png",
          "./src/img/ships/default/carrier4.png",
          "./src/img/ships/default/carrier5.png"
        ]
      },
      positions: []
    },
    {
      name: "Cruiser",
      id: "cruiser",
      points: 30,
      size: 3,
      images: {
        vertical: [
          "./src/img/ships/default/cruiser1.png",
          "./src/img/ships/default/cruiser2.png",
          "./src/img/ships/default/cruiser3.png"
        ],
        horizontal: [
          "./src/img/ships/default/cruiser1.png",
          "./src/img/ships/default/cruiser2.png",
          "./src/img/ships/default/cruiser3.png"
        ]
      },
      positions: []
    },
    {
      name: "Submarine 2",
      id: "submarine2",
      points: 30,
      size: 2,
      images: {
        vertical: [
          "./src/img/ships/default/submarine1.png",
          "./src/img/ships/default/submarine2.png"
        ],
        horizontal: [
          "./src/img/ships/default/submarine1.png",
          "./src/img/ships/default/submarine2.png"
        ]
      },
      positions: []
    },
    {
      name: "Submarine 1",
      id: "submarine1",
      points: 40,
      size: 2,
      images: {
        vertical: [
          "./src/img/ships/default/submarine_dark1.png",
          "./src/img/ships/default/submarine_dark2.png"
        ],
        horizontal: [
          "./src/img/ships/default/submarine_dark1.png",
          "./src/img/ships/default/submarine_dark2.png"
        ]
      },
      positions: []
    },
    {
      name: "Destroyer",
      points: 50,
      id: "destroyer",
      size: 1,
      images: {
        vertical: [
          "./src/img/ships/default/destroyer1.png"
        ],
        horizontal: [
          "./src/img/ships/default/destroyer1.png"
        ]
      },
      positions: []
    }
  ];

  // src/js/Ship.js
  var Ship = class {
    constructor({ name, id, points, size, images }) {
      this.name = name;
      this.id = id;
      this.points = points;
      this.size = size;
      this.images = images;
      this.positions = [];
    }
    isSunk() {
      return this.positions.every((p) => p.state === SQUARE_STATES.HIT);
    }
    revealSunkShip() {
      this.positions.forEach((pos) => {
        const square = document.getElementById(`${pos.x}-${pos.y}`);
        square.classList.add(SQUARE_STATES.HIT.toLowerCase());
        pos.htmlElement.style.backgroundImage = pos.htmlElement.style.backgroundImage.replace("default", "broken");
        pos.htmlElement.classList.add("revealed");
      });
      this.updateHTMLShipToBroken();
    }
    updateHTMLShipToBroken() {
      const shipFullImage = document.querySelector(`#${this.id} img`);
      shipFullImage.src = "src/img/ships/" + this.id + "_broken.png";
      shipFullImage.classList.add("sunk");
    }
  };
  var Ship_default = Ship;

  // src/js/Events/GridInitEvent.js
  var GridInitEvent = new CustomEvent("GridInitEvent", {
    detail: {
      message: "Grid init",
      time: /* @__PURE__ */ new Date()
    }
  });

  // src/js/Grid.js
  var Grid = class {
    constructor(shipsData, size = GRID_SIZE) {
      this.size = size;
      this.grid = [];
      this.ships = [];
      this.shipsData = shipsData;
      this.htmlElement = document.getElementById("grid");
      this.init();
    }
    init() {
      this.grid = [];
      this.ships = [];
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
      document.dispatchEvent(GridInitEvent);
    }
    createSquare(i, j) {
      const square = document.createElement("div");
      square.classList.add("square");
      square.id = `${i}-${j}`;
      GRID_HTML.insertAdjacentElement("beforeend", square);
      return square;
    }
    placeShips(shipsData) {
      shipsData.forEach((ship) => {
        ship = new Ship_default({ name: ship.name, id: ship.id, points: ship.points, size: ship.size, images: ship.images });
        let placed = false;
        while (!placed) {
          let row = Math.floor(Math.random() * 10);
          let col = Math.floor(Math.random() * 10);
          let direction = Math.random() < 0.5 ? "horizontal" : "vertical";
          if (this.canPlaceShip(ship, row, col, direction)) {
            this.placeShip(ship, row, col, direction);
            placed = true;
          }
        }
      });
    }
    canPlaceShip(ship, row, col, direction) {
      let canPlace = true;
      for (let i = 0; i < ship.size; i++) {
        if (direction === "horizontal" && (col + i >= 10 || this.grid[row][col + i].ship)) {
          canPlace = false;
          break;
        } else if (direction === "vertical" && (row + i >= 10 || this.grid[row + i][col].ship)) {
          canPlace = false;
          break;
        }
      }
      return canPlace;
    }
    placeShip(ship, row, col, direction) {
      for (let i = 0; i < ship.size; i++) {
        if (direction === "horizontal") {
          let shipCell = document.createElement("div");
          shipCell.className = "ship-cell horizontal";
          shipCell.style.backgroundImage = `url(${ship.images["horizontal"][i]})`;
          this.grid[row][col + i].square.appendChild(shipCell);
          ship.positions.push({ x: row, y: col + i, state: SQUARE_STATES.UNKNOWN, htmlElement: shipCell });
          this.grid[row][col + i].ship = ship;
        } else {
          let shipCell = document.createElement("div");
          shipCell.className = "ship-cell vertical";
          shipCell.style.backgroundImage = `url(${ship.images["vertical"][i]})`;
          this.grid[row + i][col].square.appendChild(shipCell);
          ship.positions.push({ x: row + i, y: col, state: SQUARE_STATES.UNKNOWN, htmlElement: shipCell });
          this.grid[row + i][col].ship = ship;
        }
      }
      this.ships.push(ship);
    }
    getShip(pos) {
      const { x, y } = pos;
      return this.grid[x][y].ship;
    }
    getSquare(pos) {
      const { x, y } = pos;
      return this.grid[x][y].square;
    }
    updateSquareState(pos, state) {
      const { x, y } = pos;
      this.grid[x][y].state = state;
      this.grid[x][y].square.classList.add(state.toLowerCase());
    }
    updateShipState(pos, state) {
      const ship = this.getShip(pos);
      for (let i = 0; i < ship.positions.length; i++) {
        if (ship.positions[i].x === pos.x && ship.positions[i].y === pos.y) {
          ship.positions[i].state = state;
          break;
        }
      }
      this.grid[pos.x][pos.y].ship = ship;
      let shipIndex = this.ships.indexOf(ship);
      if (shipIndex !== -1) {
        this.ships[shipIndex] = ship;
      }
    }
    areAllShipsSunk() {
      return this.ships.every((ship) => ship.positions.every((pos) => pos.state === SQUARE_STATES.HIT));
    }
    resetShipsHtmlState() {
      this.ships.forEach((ship) => {
        const shipFullImage = document.querySelector(`#${ship.id} img`);
        shipFullImage.src = "src/img/ships/" + ship.id + ".png";
        shipFullImage.classList.remove("sunk");
      });
    }
    resetGrid() {
      this.htmlElement.innerHTML = "";
      this.init();
      this.resetShipsHtmlState();
    }
  };
  var Grid_default = Grid;

  // src/js/main.js
  var GameState = {
    timer: 180,
    isDebug: getDebugParam(),
    canFire: true,
    hasGameStarted: false,
    playerTotalPoints: 0,
    ships: null,
    sounds: null
  };
  var startGame = async () => {
    GameState.sounds = await loadSounds();
    GameState.ships = ships_default;
    GameState.grid = new Grid_default(GameState.ships);
    GameState.hasGameStarted = true;
  };
  startGame();
  document.addEventListener("UpdatePlayerPointsEvent", onUpdatePlayerPoints);
  document.addEventListener("FireEvent", onFireEvent);
  document.addEventListener("GridInitEvent", () => {
    signalNewGrid(GameState.grid);
  });
  function onFireEvent(event) {
    if (GameState.canFire) {
      GameState.canFire = false;
      const { x, y } = event.detail;
      fire({ x, y }, GameState.grid, event.detail.weapon);
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
})();
