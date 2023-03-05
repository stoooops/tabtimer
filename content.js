// Timer class encapsulates the timer logic
class Timer {
    constructor(callback, interval) {
        this.callback = callback;
        this.interval = interval;
        this.timerId = null;
        this.startTime = null;
        this.elapsedTime = 0;
    }

    // Start the timer
    start() {
        this.startTime = Date.now();
        this.timerId = setInterval(() => {
            this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            this.callback();
        }, this.interval);
    }

    // Stop the timer and reset the elapsed time
    stop() {
        clearInterval(this.timerId);
        this.timerId = null;
        this.startTime = null;
        this.elapsedTime = 0;
    }

    // Pause the timer and save the elapsed time in seconds
    pause() {
        clearInterval(this.timerId);
        this.timerId = null;
        this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
    }

    // Resume the timer and restore the elapsed time
    resume() {
        this.startTime = Date.now() - this.elapsedTime * 1000;
        this.timerId = setInterval(() => {
            this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            this.callback();
        }, this.interval);
    }
}

class Model {
    constructor() {
        // Create two instances of the Timer class: countupTimer and focusTimer
        this.countupTimer = new Timer(() => { }, 1000);
        this.countupTimer.start();
        this.focusTimer = new Timer(() => { }, 1000);
        this.focusTimer.start();

        // Listen for the visibilitychange event and handle it
        document.addEventListener('visibilitychange', this.handleVisibilityChange);

        // Listen for the blur event and handle it
        window.addEventListener('blur', this.handleBlur);
    }

    // Handle the visibilitychange event by pausing or resuming the focus timer
    handleVisibilityChange = () => {
        if (document.hidden) {
            this.focusTimer.pause();
            console.log('Pause focus timer @ ' + this.focusTimer.elapsedTime);
        } else {
            this.focusTimer.resume();
            console.log('Resume focus timer @ ' + this.focusTimer.elapsedTime);
        }
    };

    // Handle the blur event by pausing the focus timer
    handleBlur = () => {
        this.focusTimer.pause();
        console.log('Pause focus timer @ ' + this.focusTimer.elapsedTime);
    };
}

// Pad a number with leading zeros to make it two digits long
function pad(num) {
    return num.toString().padStart(2, '0');
}

// Format a time in seconds as hh:mm:ss
function formatTime(time) {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time - hours * 3600) / 60);
    const seconds = time - hours * 3600 - minutes * 60;
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

class View {
    constructor(model) {
        this.model = model;
        this.timerType = 'focus';
        this.div = document.createElement('div');
        this.div.style.position = 'fixed';
        this.div.style.top = '0';
        this.div.style.left = '50%';
        this.div.style.transform = 'translateX(-50%)';
        this.div.style.padding = '10px 20px';
        this.div.style.background = '#333';
        this.div.style.borderRadius = '0 0 30px 30px';
        this.div.style.boxShadow = '0px 3px 3px rgba(0, 0, 0, 0.2)';
        this.div.style.zIndex = '9999';
        this.div.style.fontWeight = 'bold';
        this.div.style.color = '#FFF';
        this.div.style.textAlign = 'center';
        this.div.style.fontSize = '16px';
        this.div.style.cursor = 'pointer';

        const triangle = document.createElement('div');
        triangle.style.width = '0';
        triangle.style.height = '0';
        triangle.style.borderStyle = 'solid';
        triangle.style.borderWidth = '0 15px 15px 15px';
        triangle.style.borderColor = 'transparent transparent #333 transparent';
        triangle.style.position = 'absolute';
        triangle.style.top = '-15px';
        triangle.style.left = '50%';
        triangle.style.transform = 'translateX(-50%)';

        this.div.appendChild(triangle);
        this.updateTimerText();
        this.div.addEventListener('click', this.handleClick);

        document.body.appendChild(this.div);
    }

    changeTimerType = () => {
        if (this.timerType === 'countup') {
            this.timerType = 'focus';
        } else if (this.timerType === 'focus') {
            this.timerType = 'countup';
        } else {
            console.error('Invalid timer type: ' + this.timerType);
        }
    };

    handleClick = () => {
        this.changeTimerType();
        this.updateTimerText();
    };

    // Update the timer text every second
    updateTimerText() {
        let elapsedTime = undefined;
        if (this.timerType === 'countup') {
            elapsedTime = this.model.countupTimer.elapsedTime;
        } else if (this.timerType === 'focus') {
            elapsedTime = this.model.focusTimer.elapsedTime;
        } else {
            console.error('Invalid timer type: ' + this.timerType);
        }
        console.log(`${this.timerType} elapsedTime: ${elapsedTime}`);

        if (elapsedTime !== undefined) {
            this.div.innerText = formatTime(elapsedTime);
        }
    }
}

class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        setInterval(() => this.view.updateTimerText(), 1000);
    }
}


const model = new Model();
const view = new View(model);
const controller = new Controller(model, view);
