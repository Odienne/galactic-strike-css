/**
 * Signals to Qt app to update player score
 */
const signalScore = (score) => {
    sendToQt({score})
}

/**
 * Signals to Qt app new timer value
 */
const signalTime = (time) => {
    sendToQt({time})
}

/**
 * Signals to Qt app to play a sound
 * @param id
 */
const signalPlaySound = (id) => {
    sendToQt({"audio": id})
}

/**
 * Signals to Qt the grid configuration
 * @param grid
 */
const signalNewGrid = (grid) => {
    sendToQt({grid})
}

/**
 * Generic function to send data to Qt
 * @param data
 */
function sendToQt(data) {
    if (window.QtBridge) {
        window.QtBridge.receiveData(JSON.stringify(data));
    }
}

export {signalScore, signalTime, signalPlaySound, signalNewGrid};