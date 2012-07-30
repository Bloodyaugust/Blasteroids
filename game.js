SHIP_ACCELERATION = 1;
SHIP_TURN_SPEED = 150;

function start() {
    app = new game();
    app.fullscreen();
    
    ship = new player();
}

function update() {
    app.update();
    
    if (app.isKeyDown(38)) { //up arrow
        ship.addImpulse();
    } 
    
    if (app.isKeyDown(37)) { //left arrow
        ship.poly.rotate(-SHIP_TURN_SPEED * app.deltaTime);
    }
    
    if (app.isKeyDown(39)) { //right arrow
        ship.poly.rotate(SHIP_TURN_SPEED * app.deltaTime);
    } 
    
    if (app.onKeyDown(32)) { //spacebar
        //fire
    }
    
    ship.update();
    
    draw();
    app.loop();
}

function draw() {
    app.clearScreen('black');
    
    ship.draw();
    
    //drawText("Mouse Button: " + app.mouseButton, new vec2(100, 200), 'green', app.sctx);
    
    //drawText("Mouse Location: " + "(" + app.mouseLocation.x + ", " + app.mouseLocation.y + ")", new vec2(100, 100), 'green', app.sctx);
    
    drawText("FPS: " + app.fps, new vec2(app.screenSize.x - 150, 50), 'green', app.sctx);
}

function player() {
    this.structure = [
        new vec2(0, 0), new vec2(30, 15), new vec2(0, 30)
    ];
    this.poly = new polygon(new vec2(100, 100), new vec2(15, 15), this.structure);
    this.poly.color = 'red';
    this.poly.rotation = 0;
    this.poly.update();
    this.engineSpeed = 0;
}

player.prototype.addImpulse = function() {
    this.engineSpeed += SHIP_ACCELERATION;
}

player.prototype.update = function() {
    var deltaSpeed = this.engineSpeed * app.deltaTime;
    var newX = deltaSpeed * (Math.cos(this.poly.rotation) * 180 / Math.PI);
    var newY = -deltaSpeed * (Math.sin(this.poly.rotation) * 180 / Math.PI);
    
    this.poly.translate(new vec2(newX, newY));
}

player.prototype.draw = function() {
    this.poly.draw(app.sctx);
}