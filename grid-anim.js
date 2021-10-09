const canvas = document.getElementById("grid-anim");
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var stop = false;
var frameCount = 0;
var fpsInterval, startTime, now, then, elapsed;

class Particles {
    constructor(size,gap) {
        this.particlesArray = [];
        this.size = size;
        this.gap = gap;
    }
    populate(xGap, yGap) {
        
        let startPosX = Math.floor((innerWidth % xGap)/2);
        let startPosY = Math.floor((innerHeight % yGap)/2);
        let endPosX = innerWidth - startPosX;
        let endPosY = innerHeight - startPosY;

        for (let x = startPosX; x <= endPosX; x += xGap) {
            for (let y = startPosY; y <= endPosY; y += yGap) {
                this.particlesArray.push(
                    new Particle(x, y, this.size, 'gray')
                    );
            }
        }


        // this.particlesArray = [];
        // let nX = Math.ceil(innerWidth / this.gap);
        // let nY = Math.ceil(innerHeight / this.gap);
        // for (let x = 1; x <= nX; x++) {
        //     for (let y = 1; y <= nY; y++) {
        //         this.particlesArray.push(new Particle(x * this.gap, y * this.gap, this.size, 'gray'));
        //     }
        // }
    }
    get(i) {
        return this.particlesArray[i];
    }

    length() {
        return this.particlesArray.length;
    }

    isChanged() { return this.changed; }
}

const TAU = Math.PI * 2;

class Particle {
    constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;

        this.amplitude = 0.5;
        this.period = 1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {
        this.size = Math.cos(0.001 * (now + this.x +this.y)) * 5 + 5;
        this.draw();
    }
}


function init() {
    particles = new Particles(10,100);
    particles.populate(128,128,24);
    
}

function startAnimation(fps) {
    init();
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    animate();
}

function animate() {
    if (stop) {
        return;
    }
    
    requestAnimationFrame(animate);
    
    now = Date.now();
    elapsed = now - then;
    
    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);
        ctx.clearRect(0,0,innerWidth,innerHeight)
    
        for (let i = 0; i < particles.length(); i++) {
            particles.get(i).update();
        }
    
    }
}

startAnimation(30);