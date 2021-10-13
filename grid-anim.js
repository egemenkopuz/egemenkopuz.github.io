const canvas = document.getElementById("grid-anim");
const intro = document.getElementsByClassName("intro");
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// frame settings
var fpsLimit = 30;
var stop = false;
var dt, fpsInterval, startTime, now, then, elapsed;

// grid settings
var gridRowGap = 48;
var gridColGap = 48;

// particle settings
var startColor = [0, 255, 255];
var endColor = [237, 102, 111];
var cosineCoordAmp = 5; 
var cosineSizeAmp = 5;
var cosineFreq = 0.0002;
var shadowBlur = 6;
var defaultSize = 10;

// scroll settings
var scrollThreshold = 24;

// other settings
var stopLines = false;

// linear interpolation
function lerp(start, end, amt) { return (1 - amt) * start + amt * end; }

const TAU = Math.PI * 2;

const particleType = {
    DIAGONAL_WAVE: 0,
    HORIZONTAL_WAVE: 1,
    VERTICAL_WAVE: 2,
    PROJECTILE: 3,
}

const colorType = {
    DEFAULT: 0,
    GRADIENTBYSIZE: 1,
}

let mouse = {
    x: null,
    y: null,
    radius: 24,
}

const gaussianFilter = [
    [1,4,7,4,1],
    [4,16,26,16,4],
    [7,26,41,26,7,],
    [4,16,26,16,4],
    [1,4,7,4,1],
]

class Particle {
    constructor(pType, cType, x, y, size = 10, dirX = -0.7071, dirY = 0.7071,
        particleColor = 'rgba(1,1,1,1)', shadowColor = 'rgba(0,0,0,1)') {
        this.pType = pType;
        this.cType = cType;
        this.size = size;
        this.origX = x;
        this.origY = y;
        this.x = x;
        this.y = y;
        this.dirX = dirX;
        this.dirY = dirY;
        this.particleColor = particleColor;
        this.shadowColor = shadowColor;
    }

    draw() {
        ctx.beginPath();
        ctx.shadowBlur = shadowBlur;
        let offSet = this.size * 0.5;
        ctx.shadowOffsetX = offSet;
        ctx.shadowOffsetY = offSet;
        ctx.shadowColor = this.shadowColor;
        ctx.arc(this.x, this.y, this.size, Math.PI * 2, false);
        ctx.fillStyle = this.particleColor;
        ctx.fill();
    }

    update() {
        let osc;
        switch (this.pType) {
            case particleType.DIAGONAL_WAVE:
                osc = Math.cos(TAU * cosineFreq * (now + this.origX + this.origY));
                this.x = osc * cosineCoordAmp + this.origX;
                this.size = osc * cosineSizeAmp + cosineSizeAmp;
                break;
            case particleType.HORIZONTAL_WAVE:
                osc = Math.cos(TAU * cosineFreq * (now + this.origX));
                this.x = osc * cosineCoordAmp + this.origX;
                this.size = osc * cosineSizeAmp + cosineSizeAmp;
                break;
            case particleType.VERTICAL_WAVE:
                osc = Math.cos(TAU * cosineFreq * (now + this.origY));
                this.x = osc * cosineCoordAmp + this.origX;
                this.size = osc * cosineSizeAmp + cosineSizeAmp;
                break;
            case particleType.PROJECTILE:
                this.x += this.dirX * dt;
                this.y += this.dirY * dt;
                break;
        }

        switch (this.cType) {
            case colorType.GRADIENTBYSIZE:
                let amp = this.size / 10;
                let rVal = Math.floor(lerp(startColor[0], endColor[0], amp));
                let gVal = Math.floor(lerp(startColor[1], endColor[1], amp));
                let bVal = Math.floor(lerp(startColor[2], endColor[2], amp));
                this.particleColor = `rgba(${rVal},${gVal},${bVal},${amp})`;
                this.shadowColor = `rgba(${rVal},${gVal},${bVal},${amp / 2})`;
        }

        this.draw();
    }
}

class Grid {
    constructor() {
        this.items = new Array(0);
    }

    populate(rowGap, colGap) {
        let startX = Math.floor(rowGap * 0.5 + (canvas.width % rowGap) * 0.5);
        let startY = Math.floor(colGap * 0.5 + (canvas.height % colGap) * 0.5);
        
        let endX = canvas.width - Math.floor(rowGap * 0.5);
        let endY = canvas.height - Math.floor(colGap * 0.5);

        let curY = startY;
        for (let i = 0; curY <= endY; i++) {
            this.items[i] = new Array(0);

            let curX = startX;
            for (let j = 0; curX <= endX; j++) {
                this.items[i].push(
                    new Particle(
                        particleType.DIAGONAL_WAVE, 
                        colorType.GRADIENTBYSIZE,
                        curX, curY, defaultSize, 0, 0)
                );      
                curX += colGap;
            }
            curY += rowGap;
        }
    }

    updateItems() {
        let iSize = this.items.length;
        let jSize = this.items[0].length;
        for (let i = 0; i < iSize; i++) {
            for (let j = 0; j < jSize; j++) {
                let item = this.items[i][j];
                item.update();
            }
        }
    
    }

    length() {
        if (this.items.length == 0) return 0;
        return this.items[0].length * this.items.length;
    }
}

function gridAnimation() {
    if (stop) { return; }

    requestAnimationFrame(gridAnimation);

    now = Date.now();
    elapsed = now - then;
    if (elapsed > fpsInterval) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        dt = elapsed / fpsInterval;
        grid.updateItems();
        then = now - (elapsed % fpsInterval);
    }
}

function startGridAnimation(fps) {
    grid = new Grid();
    grid.populate(gridRowGap, gridColGap);
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    gridAnimation();    
}

function drawLine(x1,y1,x2,y2,color,width) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = width;
    ctx.stroke();
}

function isInRange(x1,y1,x2,y2,r) {
    let dx = x1 - x2;
    let dy = y1 - y2;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < r) { return true; }
    return false;
}

function checkVisible(elm, threshold, mode) {
    threshold = threshold || 0;
    mode = mode || 'visible';
    var rect = elm.getBoundingClientRect();
    var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    var above = rect.bottom - threshold < 0;
    var below = rect.top - viewHeight + threshold >= 0;
    return mode === 'above' ? above : (mode === 'below' ? below : !above && !below);
}

window.addEventListener('resize', 
    function () {
        canvas.width = Math.min(innerWidth, 1920);
        canvas.height = Math.min(innerHeight, 1080);
        if (!stop) startGridAnimation(fpsLimit);
    }
);

window.addEventListener('mousemove',
    function (event) {
        mouse.x = event.x;
        mouse.y = event.y;
    }
);

window.addEventListener('mouseout',
    function () {
        mouse.x = undefined;
        mouse.y = undefined;
    }
);

intro[0].addEventListener("mouseover", function () { stopLines = true; });

intro[0].addEventListener("mouseout", function () { stopLines = false; });

window.onscroll = function () {
    var gridAnimVisibility = checkVisible(canvas, scrollThreshold, 'above');
    if (gridAnimVisibility) { stop = true; }
    else { stop = false; gridAnimation(); }
};  

startGridAnimation(fpsLimit);