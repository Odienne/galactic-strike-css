import {signalPlaySound} from "./signals.js";
import {LOCAL_SOUNDS} from "./constants.js";

let sounds = {};

/**
 * Generic function to play a sound
 */
const playSound = (name) => {
    const sound = sounds[name];
    if (LOCAL_SOUNDS === true) {
        sound.object.play();
    } else {
        signalPlaySound(sound.id);
    }
}

const playLaserHitSound = () => {
    playSound('laser-hit')
}
const playLaserMissSound = () => {
    playSound('laser-miss')
}
const playShipExplosion = () => {
    playSound('ship-explosion')
}

document.addEventListener('SoundsLoadedEvent', (e) => {
    sounds = e.detail.sounds;
})

export {playLaserHitSound, playLaserMissSound, playShipExplosion};