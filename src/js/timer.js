let localTimer = 180; //3 minutes to seconds
let localTimerInterval = null;

const startLocalTimer = () => {
    localTimerInterval = setInterval(() => {
        let minutes = Math.floor(localTimer / 60);
        let seconds = localTimer % 60;
        document.getElementById("timer").innerHTML = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        localTimer--;
        if (localTimer < 0) {
            clearInterval(localTimerInterval);
            document.getElementById("timer").innerHTML = "Time's up!";
        }
    }, 1000);
}

document.addEventListener("DOMContentLoaded", startLocalTimer);