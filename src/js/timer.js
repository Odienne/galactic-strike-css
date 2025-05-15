import {signalTime} from "./signals.js";

let totalDuration = 180; // 3 minutes in seconds
let endTime;

const startLocalTimer = () => {
    endTime = Date.now() + totalDuration * 1000;

    const updateTimer = () => {
        const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;

        document.getElementById("timer").innerHTML =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (remaining > 0) {
            signalTime(remaining);
            requestAnimationFrame(updateTimer); // more efficient & smoother than setInterval
        } else {
            document.getElementById("timer").innerHTML = "Time's up!";
        }
    };

    updateTimer();
};

document.addEventListener("DOMContentLoaded", startLocalTimer);
