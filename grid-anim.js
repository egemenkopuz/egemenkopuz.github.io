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
var shadowOffsetX = 6;
var shadowOffsetY = 6;
var defaultSize = 10;

// other setting
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
        ctx.shadowOffsetX = shadowOffsetX;
        ctx.shadowOffsetY = shadowOffsetY;
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
        let startX = Math.floor((innerWidth % rowGap) / 2);
        let startY = Math.floor((innerHeight % colGap) / 2);
        
        let endX = innerWidth - startX;
        let endY = innerHeight - startY;


        let curY = startY;
        for (let i = 0; curY <= endY; i++) {
            this.items[i] = new Array(0);

            let curX = startX;
            for (let j = 0; curX <= endX; j++) {
                this.items[i].push(
                    new Particle(particleType.DIAGONAL_WAVE, colorType.GRADIENTBYSIZE,
                        curX, curY, defaultSize, 0, 0)
                );
                curX += colGap;
            }
            curY += rowGap;
        }
    }

    updateItems() {
        // this.items.forEach(e => e.update()); 
        this.items.forEach(function (row) {
            row.forEach(function (e) {
                e.update();
            });
        });
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
        ctx.clearRect(0, 0, innerWidth, innerHeight);
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

window.addEventListener('resize', function () {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    startGridAnimation(fpsLimit);
});

startGridAnimation(30);