SCALE = 9; //feet per pixel
SHIP_POWER_PER_IMPULSE = 0.03;
SHIP_MAX_IMPULSE = 4;
SHIP_TURN_SPEED = 100;
SHIP_DAMPEN_RATE = 4;

function start() {
    app = new game();
    app.fullscreen();
    
    ship = new player();
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
    }
    
    if (app.isKeyDown(39)) { //right arrow
        ship.poly.rotate(SHIP_TURN_SPEED * app.deltaTime);
    } 
    
    if (app.onKeyDown(32)) { //spacebar
        app.addEntity(new projectile('player', ship.poly.location, ship.netForce.getTranslated(1, 1), 20000));
    }
    
    ship.update();
    
    draw();
    app.loop();
}

function draw() {
    app.clearScreen('black');
    app.drawEntities();
    
    ship.draw();
    
    //drawText("Mouse Button: " + app.mouseButton, new vec2(100, 200), 'green', app.sctx);
    
    //drawText("Mouse Location: " + "(" + app.mouseLocation.x + ", " + app.mouseLocation.y + ")", new vec2(100, 100), 'green', app.sctx);
    
    drawText("FPS: " + app.fps, new vec2(app.screenSize.x - 250, 50), 'green', app.sctx);
    drawText("Impulse: " + ship.engineImpulse, new vec2(app.screenSize.x - 250, 80), 'green', app.sctx);
    drawText("Force: " + ship.netForce.x.toFixed(2) + ' ' + ship.netForce.y.toFixed(2), new vec2(app.screenSize.x - 250, 110), 'green', app.sctx);
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
    this.deathTime = new Date().getTime() + ttl;
}

projectile.prototype.update = function() {
    this.poly.translate(this.netForce);
    
    if (app.lastFrameTime >= this.deathTime)
        app.removeEntity(this.entityIndex);
}

projectile.prototype.draw = function(sctx) {
    this.poly.draw(sctx);
}

function player() {
    this.structure = [
    new vec2(0, 0), new vec2(30, 15), new vec2(0, 30)
    ];
    this.poly = new polygon(new vec2(100, 100), new vec2(15, 15), this.structure);
    this.poly.color = 'red';
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
    var newX = SCALE * (deltaSpeed * (Math.cos(this.poly.rotation * Math.PI / 180)));
    var newY = SCALE * (deltaSpeed * (Math.sin(this.poly.rotation * Math.PI / 180)));
    this.netForce.translate(new vec2(newX, newY));
    
    this.poly.translate(this.netForce);
}

player.prototype.draw = function() {
    this.poly.draw(app.sctx);
}