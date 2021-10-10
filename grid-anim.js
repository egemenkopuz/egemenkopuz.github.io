const canvas = document.getElementById("grid-anim");
const intro = document.getElementsByClassName("intro");
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var halfWidth = innerWidth/2;
var halfHeight = innerHeight/2;

var stop = false;
var stopLines = false;
var frameCount = 0;
var fpsInterval, startTime, now, then, elapsed;

var globalX, globalY = 0;

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
        if (!stop) {

        }
    }
)

window.addEventListener('mouseout',
    function() {
        mouse.x = undefined;
        mouse.y = undefined;
    })

canvas.addEventListener('click', 
    function(event) {
        if (projectiles.length() <= 3) {
            projectiles.populateRandom(mouse.x,mouse.y,1,2000);
        }
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

    populateRandom(x,y,n,ts=500) {
        for (let i = 0; i < n; i++) {
            let dirX = (Math.random() - 0.5) * 25;
            let dirY = (Math.random() - 0.5) * 25;
            this.particlesArray.push(
                new Particle(x, y, this.size,dirX,dirY,ts)
            );
        }
    }

    get(i) {
        return this.particlesArray[i];
    }

    length() {
        return this.particlesArray.length;
    }
}

var pp = Math.exp(2) - 1;
class Particle {
    constructor(x, y, size, dirX = 0, dirY = 0, timespan = -1, amplitude = 0.5, period = 1, isProjectile = false) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.dirX = dirX;
        this.dirY = dirY;
        this.timespan = timespan;
        this.amplitude = amplitude;
        this.period = period;
        this.isProjectile = this.isProjectile;
    }

    draw(inMouseRange , dx, dy, distance) {
        ctx.beginPath();
        if (inMouseRange && !stopLines) {
            let ppDirX = dx / distance;
            let ppDirY = dy / distance;
            let newX, newY;
            if (distance < mouse.radiusHalf) {
                newX = this.x + ppDirX * pp;
                newY = this.y + ppDirY * pp;
                ctx.arc(newX, newY, this.size, Math.PI * 2, false);
            }
            else {
                newX = this.x - ppDirX * pp;
                newY = this.y - ppDirY * pp;
                ctx.arc(newX, newY, this.size, Math.PI * 2, false);
            }
            ctx.fillStyle = this.cColor;
            ctx.fill();

            ctx.beginPath();
            ctx.strokeStyle = this.cColor;
            if (newX < halfWidth) {
                ctx.bezierCurveTo(newX, newY, newX, newY + 50, mouse.x, mouse.y,);
            }
            else {
                ctx.bezierCurveTo(newX, newY, newX, newY - 50, mouse.x, mouse.y,);
            }
            // ctx.moveTo(newX, newY);
            // ctx.lineTo(mouse.x, mouse.y);
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        else {
            ctx.arc(this.x, this.y, this.size, Math.PI * 2, false);
            ctx.fillStyle = this.cColor;
            ctx.fill();
        }
        if (!this.isProjectile) {
            for (let i = 0; i < projectiles.length(); i++) {
                console.log("hey");
                let p = projectiles.get(i);
                let dx = p.x - this.x;
                let dy = p.y - this.y;
                let d = Math.sqrt(dx * dx + dy * dy);
                if (d < 150) {
                    ctx.beginPath();
                    ctx.strokeStyle = this.cColor;
                    if (this.x < halfWidth) {
                        ctx.bezierCurveTo(this.x, this.y, this.x, this.y + 50, p.x, p.y);
                    }
                    else {
                        ctx.bezierCurveTo(this.x, this.y, this.x, this.y - 50, p.x, p.y);
                    }
                    // ctx.moveTo(this.x, this.y);
                    // ctx.lineTo(p.x, p.y);
                    ctx.lineWidth = 3;
                    ctx.stroke();
                }
            }
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

        this.x += this.dirX;
        this.y += this.dirY;

        if (this.timespan > 0) {
            this.timespan -= elapsed;
        }
    }
}


function init() {
    particles = new Particles(10);
    particles.populate(96,96);
    projectiles = new Particles(10);
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
        for (let i = particles.length() - 1; i >= 0; i--) {
            let p = particles.get(i);
            particles.get(i).update();   
        }
        for (let i = projectiles.length() - 1; i >= 0; i--) {
            let p = projectiles.get(i);
            if (p.timespan > 0) {
                projectiles.get(i).update();
            }
            else {
                projectiles.particlesArray.splice(i,1);
            }
        }
    }
}

window.addEventListener('resize', function() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    startAnimation(30);
});

startAnimation(30);