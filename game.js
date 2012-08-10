var SCALE = 9; //feet per pixel
var SHIP_POWER_PER_IMPULSE = 0.03;
var SHIP_MAX_IMPULSE = 4;
var SHIP_TURN_SPEED = 100;
var SHIP_DAMPEN_RATE = 4;
var SHIP_PROJECTILE_SPEED = 1;
var SHIP_RANGE_FINDER = 100;

function start() {
    app = new game();
    app.fullscreen();
    
    ship = new player();

    awesomeSound = new sound('res/laser.mp3');
    app.addSound(awesomeSound);
}

function update() {
    app.update();
    
    if (app.onKeyDown(38)) { //up arrow
        ship.addImpulse();
    }
    
    if (app.onKeyDown(40)) { //down arrow
        ship.reverseImpulse();
    }
    
    if (ship.engineImpulse === 0 && app.isKeyDown(40)) {
        ship.reverseImpulse();
    }
    
    if (app.isKeyDown(37)) { //left arrow
        ship.poly.rotate(-SHIP_TURN_SPEED * app.deltaTime);
        var curMag = ship.netForce.magnitude();
        var directionVector = ship.poly.origin.getTranslatedAlongRotation(6, ship.poly.rotation - 60);
        directionVector.translate(new vec2(-ship.poly.origin.x, -ship.poly.origin.y));
        directionVector.normalize();
        ship.netForce.translate(directionVector.getScaled(curMag * app.deltaTime));
    }

    if (app.isKeyDown(39)) { //right arrow
        ship.poly.rotate(SHIP_TURN_SPEED * app.deltaTime);
        curMag = ship.netForce.magnitude();
        directionVector = ship.poly.origin.getTranslatedAlongRotation(6, ship.poly.rotation + 60);
        directionVector.translate(new vec2(-ship.poly.origin.x, -ship.poly.origin.y));
        directionVector.normalize();
        ship.netForce.translate(directionVector.getScaled(curMag * app.deltaTime));
    } 
    
    if (app.onKeyDown(32)) { //spacebar
        ship.fire();
        console.log(app.sounds);
        app.playSound(awesomeSound.audio.src);
        console.log(app.sounds);
    }
    
    ship.update();
    
    draw();
    app.loop();
}

function draw() {
    app.clearScreen('black');
    app.drawEntities();
    
    ship.draw();
    
    drawText("FPS: " + app.fps, new vec2(app.screenSize.x - 250, 50), 'green', app.sctx);
    drawText("Impulse: " + ship.engineImpulse, new vec2(app.screenSize.x - 250, 80), 'green', app.sctx);
    drawText("Force: " + ship.netForce.x.toFixed(2) + ' ' + ship.netForce.y.toFixed(2), new vec2(app.screenSize.x - 250, 110), 'green', app.sctx);
    drawText("Bullets: " + app.entities.length, new vec2(app.screenSize.x - 250, 140), 'green', app.sctx);
    drawText("Delta Time: " + app.deltaTime, new vec2(app.screenSize.x - 250, 170), 'green', app.sctx);
    drawText("Rotation: " + ship.poly.rotation, new vec2(app.screenSize.x - 250, 200), 'green', app.sctx);
    directionVector = ship.poly.origin.getTranslatedAlongRotation(6, ship.poly.rotation - 60);
    directionVector.normalize();
    drawText("X: " + directionVector.x.toFixed(2) + " Y: " + directionVector.y.toFixed(2), new vec2(app.screenSize.x - 250, 230), 'green', app.sctx);
    drawText("Magnitude: " + directionVector.magnitude(), new vec2(app.screenSize.x - 250, 260), 'green', app.sctx);
}

function projectile(type, location, force, ttl) {
    if (type === 'player') {
        this.structure = [
            new vec2(0, 0), new vec2(3, 0), new vec2(3, 3), new vec2(0, 3)
        ];
        this.origin = new vec2(1.5, 1.5);
    }
    this.poly = new polygon(location.clone(), this.origin, this.structure);
    this.poly.color = 'orange';
    this.poly.update();
    this.netForce = force.clone();
    this.timeLeft = ttl;
}

projectile.prototype.update = function () {
    this.timeLeft -= app.deltaTime * 1000;
    this.poly.translate(this.netForce);

    if (this.timeLeft <= 0)
        app.removeEntity(this.entityIndex);
};

projectile.prototype.draw = function(sctx) {
    this.poly.draw(sctx);
}

function player() {
    this.structure = [
    new vec2(0, 0), new vec2(30, 15), new vec2(0, 30)
    ];
    this.poly = new polygon(new vec2(100, 100), new vec2(15, 15), this.structure);
    this.poly.color = 'green';
    this.poly.rotation = 0;
    this.poly.update();
    this.engineImpulse = 0;
    this.netForce = new vec2(0, 0);
}

player.prototype.addImpulse = function() {
    if (this.engineImpulse < SHIP_MAX_IMPULSE)
        this.engineImpulse++;
}

player.prototype.reverseImpulse = function() {
    if (this.engineImpulse > 0)
        this.engineImpulse--;
    else 
        this.dampenInertia();
}

player.prototype.dampenInertia = function() {
    if (this.netForce.x < 0) {
        if (this.netForce.x + SHIP_DAMPEN_RATE * app.deltaTime > 0)
            this.netForce.x = 0;
        else
            this.netForce.x += SHIP_DAMPEN_RATE * app.deltaTime;
    }

    if (this.netForce.x > 0) {
        if (this.netForce.x - SHIP_DAMPEN_RATE * app.deltaTime < 0)
            this.netForce.x = 0;
        else
            this.netForce.x -= SHIP_DAMPEN_RATE * app.deltaTime;
    }
    
    if (this.netForce.y < 0) {
        if (this.netForce.y + SHIP_DAMPEN_RATE * app.deltaTime > 0)
            this.netForce.y = 0;
        else
            this.netForce.y += SHIP_DAMPEN_RATE * app.deltaTime;
    }

    if (this.netForce.y > 0) {
        if (this.netForce.y - SHIP_DAMPEN_RATE * app.deltaTime < 0)
            this.netForce.y = 0;
        else
            this.netForce.y -= SHIP_DAMPEN_RATE * app.deltaTime;
    }
}

player.prototype.update = function() {
    var deltaSpeed = this.engineImpulse * SHIP_POWER_PER_IMPULSE * app.deltaTime;
    var newX = (deltaSpeed * SCALE * (Math.cos(this.poly.rotation * Math.PI / 180)));
    var newY = (deltaSpeed * SCALE * (Math.sin(this.poly.rotation * Math.PI / 180)));
    this.netForce.translate(new vec2(newX, newY));
    
    this.poly.translate(this.netForce);
}

player.prototype.draw = function() {
    this.poly.draw(app.sctx);
    drawLine(new line(this.poly.origin.getTranslatedAlongRotation(12, this.poly.rotation), this.poly.origin.getTranslatedAlongRotation(SHIP_RANGE_FINDER, this.poly.rotation)), 'red', app.sctx);
    drawLine(new line(this.poly.origin.getTranslatedAlongRotation(6, this.poly.rotation - 60), this.poly.origin.getTranslatedAlongRotation(SHIP_RANGE_FINDER, this.poly.rotation - 60)), 'pink', app.sctx);
    drawLine(new line(this.poly.origin.getTranslatedAlongRotation(6, this.poly.rotation + 60), this.poly.origin.getTranslatedAlongRotation(SHIP_RANGE_FINDER, this.poly.rotation + 60)), 'blue', app.sctx);
    drawLine(new line(this.poly.origin.getTranslatedAlongRotation(6, this.poly.rotation - 60), this.poly.origin.getTranslatedAlongRotation(SHIP_RANGE_FINDER, this.poly.rotation - 90)), 'pink', app.sctx);
    drawLine(new line(this.poly.origin.getTranslatedAlongRotation(6, this.poly.rotation + 60), this.poly.origin.getTranslatedAlongRotation(SHIP_RANGE_FINDER, this.poly.rotation + 90)), 'blue', app.sctx);
}

player.prototype.fire = function() {
    var directionalForceX = SCALE * SHIP_PROJECTILE_SPEED * (Math.cos(this.poly.rotation * Math.PI / 180));
    var directionalForceY = SCALE * SHIP_PROJECTILE_SPEED * (Math.sin(this.poly.rotation * Math.PI / 180));
    var newForce = this.netForce.getTranslated(new vec2(directionalForceX, directionalForceY));
    
    app.addEntity(new projectile('player', ship.poly.origin, newForce, 2000));
    newForce = new vec2(-newForce.x / SHIP_DAMPEN_RATE, -newForce.y / SHIP_DAMPEN_RATE);
    this.netForce.translate(newForce);
}