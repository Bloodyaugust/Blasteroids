var SCALE = 9; //feet per pixel
var SHIP_DRIVE_POWER = 3;
var SHIP_THRUSTER_POWER = 1.5;
var SHIP_TURN_SPEED = 100;
var SHIP_DAMPEN_RATE = 5;
var SHIP_PROJECTILE_SPEED = 8;
var SHIP_RANGE_FINDER = 100;
var SHIP_TORQUE = 0.8;

function start() {
    app = new game();
    app.fullscreen();
    
    ship = new player();

    awesomeSound = new sound('res/laser.mp3');
    app.addSound(awesomeSound);
}

function update() {
    app.update();
    
    if (app.isKeyDown(38)) { //up arrow
        ship.thrustForward();
    }
    
    if (app.isKeyDown(40)) { //down arrow
        ship.dampenInertia();
    }
    
    if (app.isKeyDown(37)) { //left arrow
        ship.poly.rotate(-SHIP_TURN_SPEED * app.deltaTime);
    }

    if (app.isKeyDown(39)) { //right arrow
        ship.poly.rotate(SHIP_TURN_SPEED * app.deltaTime);
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
    
    drawText("FPS: " + app.fps, new vec2(app.screenSize.x - 250, 80), 'green', app.sctx);
    drawText("Force: " + ship.netForce.x.toFixed(2) + ' ' + ship.netForce.y.toFixed(2), new vec2(app.screenSize.x - 250, 110), 'green', app.sctx);
    drawText("Bullets: " + app.entities.length, new vec2(app.screenSize.x - 250, 140), 'green', app.sctx);
    drawText("Delta Time: " + app.deltaTime, new vec2(app.screenSize.x - 250, 170), 'green', app.sctx);
    drawText("Rotation: " + ship.poly.rotation, new vec2(app.screenSize.x - 250, 200), 'green', app.sctx);
    drawText("Magnitude: " + ship.netForce.magnitude(), new vec2(app.screenSize.x - 250, 230), 'green', app.sctx);
    drawText("Location: " + ship.poly.location.x.toFixed() + " " + ship.poly.location.y.toFixed(), new vec2(app.screenSize.x - 250, 260), 'green', app.sctx);
    drawText("Force Direction: " + ship.netForce.getNormal().x.toFixed(4) + " " + ship.netForce.getNormal().y.toFixed(4), new vec2(app.screenSize.x - 500, 290), 'green', app.sctx);
    drawText("Facing Direction: " + getDirectionVector(ship.poly.rotation).getNormal().x.toFixed(4) + " " + getDirectionVector(ship.poly.rotation).getNormal().y.toFixed(4), new vec2(app.screenSize.x - 500, 320), 'green', app.sctx);
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
    this.netForce = new vec2(0, 0);
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
    var forceDirection = this.netForce.getNormal();
    var facingDirection = getDirectionVector(ship.poly.rotation).getNormal();
    
    var addedX = 0;
    var addedY = 0;
    if (forceDirection.x < facingDirection.x)
        addedX = SHIP_THRUSTER_POWER * app.deltaTime;
    if (forceDirection.x > facingDirection.x)
        addedX = SHIP_THRUSTER_POWER * -app.deltaTime;
    if (forceDirection.y < facingDirection.y)
        addedY = SHIP_THRUSTER_POWER * app.deltaTime;
    if (forceDirection.y > facingDirection.y)
        addedY = SHIP_THRUSTER_POWER * -app.deltaTime;
    
    if (Math.sqrt((forceDirection.x - facingDirection.x) * (forceDirection.x - facingDirection.x)) < SHIP_THRUSTER_POWER * app.deltaTime)
        this.netForce.x = facingDirection.x * this.netForce.magnitude();
    else
        this.netForce.translate(new vec2(addedX, 0));
    
    if (Math.sqrt((forceDirection.y - facingDirection.y) * (forceDirection.y - facingDirection.y)) < SHIP_THRUSTER_POWER * app.deltaTime)
        this.netForce.y = facingDirection.y * this.netForce.magnitude();
    else
        this.netForce.translate(new vec2(0, addedY));
    
    
    
    this.poly.translate(this.netForce);
}

player.prototype.thrustForward = function () {
    var deltaSpeed = SHIP_DRIVE_POWER * app.deltaTime;
    var newX = (deltaSpeed * (Math.cos(this.poly.rotation * Math.PI / 180)));
    var newY = (deltaSpeed * (Math.sin(this.poly.rotation * Math.PI / 180)));
    this.netForce.translate(new vec2(newX, newY));
}

player.prototype.draw = function() {
    this.poly.draw(app.sctx);
    drawLine(new line(this.poly.origin.getTranslatedAlongRotation(12, this.poly.rotation), this.poly.origin.getTranslatedAlongRotation(SHIP_RANGE_FINDER, this.poly.rotation)), 'red', app.sctx);
    drawLine(new line(this.poly.origin.getTranslatedAlongRotation(6, this.poly.rotation - 89), this.poly.origin.getTranslatedAlongRotation(20, this.poly.rotation - 89)), 'pink', app.sctx);
    drawLine(new line(this.poly.origin.getTranslatedAlongRotation(6, this.poly.rotation + 89), this.poly.origin.getTranslatedAlongRotation(20, this.poly.rotation + 89)), 'blue', app.sctx);
    var scaledForce = this.netForce.getNormal().getScaled(this.netForce.magnitude() * 10).getTranslated(this.poly.origin);
    drawLine(new line(this.poly.origin, scaledForce), 'orange', app.sctx);
}

player.prototype.fire = function() {
    var directionalForceX = SHIP_PROJECTILE_SPEED * (Math.cos(this.poly.rotation * Math.PI / 180));
    var directionalForceY = SHIP_PROJECTILE_SPEED * (Math.sin(this.poly.rotation * Math.PI / 180));
    var newForce = this.netForce.getTranslated(new vec2(directionalForceX, directionalForceY));
    
    app.addEntity(new projectile('player', ship.poly.origin, newForce, 2000));
    var addingForce = new vec2(-newForce.x / 8 / SHIP_DAMPEN_RATE, -newForce.y / 8 / SHIP_DAMPEN_RATE);
    this.netForce.translate(addingForce);
}