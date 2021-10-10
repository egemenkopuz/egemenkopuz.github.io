const canvas = document.getElementById("grid-anim");
const intro = document.getElementsByClassName("intro");
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var stop = false;
var stopLines = false;
var frameCount = 0;
var fpsInterval, startTime, now, then, elapsed;

let mouse = {
    x : null,
    y : null,
    radius: 150,
    radiusHalf: this.radius / 2
}

window.addEventListener('mousemove',
    function(event) {
        mouse.x = event.x;
        mouse.y = event.y;

    }
)

window.addEventListener('mouseout',
    function() {
        mouse.x = undefined;
        mouse.y = undefined;
    })

intro[0].addEventListener("mouseover", function (event) {
    stopLines = true;
    })
intro[0].addEventListener("mouseout", function (event) {
    stopLines = false;
    })

function lerp (start,end, amt) {
    return (1 - amt) * start + amt * end;
}

class Particles {
    constructor(size) {
        this.particlesArray = [];
        this.size = size;
    }
    populate(xGap, yGap) {
        
        let startPosX = Math.floor((innerWidth % xGap)/2);
        let startPosY = Math.floor((innerHeight % yGap)/2);
        let endPosX = innerWidth - startPosX;
        let endPosY = innerHeight - startPosY;

        for (let x = startPosX; x <= endPosX; x += xGap) {
            for (let y = startPosY; y <= endPosY; y += yGap) {
                this.particlesArray.push(
                    new Particle(x, y, this.size)
                    );
            }
        }
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
var pushPower = 2;

class Particle {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;

        this.amplitude = 0.5;
        this.period = 1;
    }

    draw(inMouseRange , dx, dy, distance) {
        ctx.beginPath();
        if (inMouseRange && !stopLines) {
            let dirX = dx / distance;
            let dirY = dy / distance;
            let newX, newY;
            let pp = Math.exp(pushPower) - 1;
            if (distance < mouse.radiusHalf) {
                newX = this.x + dirX * pp;
                newY = this.y + dirY * pp;
                ctx.arc(newX, newY, this.size, Math.PI * 2, false);
            }
            else {
                newX = this.x - dirX * pp;
                newY = this.y - dirY * pp;
                ctx.arc(newX, newY, this.size, Math.PI * 2, false);
            }
            ctx.fillStyle = this.cColor;
            ctx.fill();
            
            ctx.beginPath();
            ctx.strokeStyle = this.cColor;
            ctx.moveTo(newX, newY);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        else {
            ctx.arc(this.x, this.y, this.size, Math.PI * 2, false);
            ctx.fillStyle = this.cColor;
            ctx.fill();
        }
    }

    update() {
        this.size = Math.cos(0.002 * (now + this.x +this.y)) * 5 + 5;
        let amp = this.size / 10;
        let rVal = Math.floor(lerp(0, 237, amp));
        let gVal = Math.floor(lerp(255, 102, amp));
        let bVal = Math.floor(lerp(255, 111, amp));
        this.cColor = `rgba(${rVal},${gVal},${bVal},${amp})`;
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
            this.draw(true, dx, dy, distance);
        }
        else {
            this.draw(false);
        }
    }
}


function init() {
    particles = new Particles(10,100);
    particles.populate(128,128);
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

window.addEventListener('resize', function() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    startAnimation(30);
});

startAnimation(30);