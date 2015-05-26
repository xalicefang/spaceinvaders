//  Creates an instance of the Game class.
function Game() {
    //  Set the initial config.
    this.config = {
        hatRate: 0.05,
        hatVelocity: 50,
        gameWidth: 400,
        gameHeight: 300,
        fps: 50,
        debugMode: false,
        aliceSpeed: 120,
    };

    //  All state is in the variables below.
    this.width = 0;
    this.height = 0;
    this.gameBounds = {left: 0, top: 0, right: 0, bottom: 0};
    this.intervalId = 0;
    this.score = 0;

    //  Input/output
    this.pressedKeys = {};
    this.gameCanvas =  null;
    this.hats = [];

}

//  Initialise the Game with a canvas.
Game.prototype.initialise = function(gameCanvas) {

    //  Set the game canvas.
    this.gameCanvas = gameCanvas;

    //  Set the game width and height.
    this.width = gameCanvas.width;
    this.height = gameCanvas.height;

    //  Set the state game bounds.
    this.gameBounds = {
        left: gameCanvas.width / 2 - this.config.gameWidth / 2,
        right: gameCanvas.width / 2 + this.config.gameWidth / 2,
        top: gameCanvas.height / 2 - this.config.gameHeight / 2,
        bottom: gameCanvas.height / 2 + this.config.gameHeight / 2,
    };
};


Game.prototype.start = function() {
    //  Start the game loop.
    var game = this;
    this.intervalId = setInterval(function () { GameLoop(game);}, 1000 / this.config.fps);

    var randX = function() {
        return Math.floor((Math.random() * game.gameBounds.right) + game.gameBounds.left);
    }

    //  Create the alice.
    this.alice = new Alice(game.width / 2, game.gameBounds.bottom);
    var hat1 = new Hat(randX(), game.gameBounds.top, game.config.hatVelocity);
    var hat2 = new Hat(randX(), game.gameBounds.top, game.config.hatVelocity);
    var hat3 = new Hat(randX(), game.gameBounds.top, game.config.hatVelocity);
    game.hats = [hat1, hat2, hat3];

    //  Set the alice speed for this level, as well as invader params.
    var levelMultiplier = this.level * this.config.levelDifficultyMultiplier;
    this.aliceSpeed = this.config.aliceSpeed;
    this.hatRate = this.config.hatRate + (levelMultiplier * this.config.hatRate);
    this.hatMinVelocity = this.config.hatMinVelocity + (levelMultiplier * this.config.hatMinVelocity);
    this.hatMaxVelocity = this.config.hatMaxVelocity + (levelMultiplier * this.config.hatMaxVelocity);

};

Game.prototype.update = function(game, dt) {
    
    //  If the left or right arrow keys are pressed, move
    //  the alice. Check this on ticks rather than via a keydown
    //  event for smooth movement, otherwise the alice would move
    //  more like a text editor caret.
    if(game.pressedKeys[37]) {
        this.alice.x -= this.aliceSpeed * dt;
    }
    if(game.pressedKeys[39]) {
        this.alice.x += this.aliceSpeed * dt;
    }

    //  Keep the alice in bounds.
    if(this.alice.x < game.gameBounds.left) {
        this.alice.x = game.gameBounds.left;
    }
    if(this.alice.x > game.gameBounds.right) {
        this.alice.x = game.gameBounds.right;
    }

    //  Move each hat.
    for(var i=0; i<this.hats.length; i++) {
        var hat = this.hats[i];

        // if hat hasn't reached bottom, move
        if (hat.y <= game.gameBounds.bottom) 
            hat.y += dt * hat.velocity;
    }

    //  Check for hat/alice collisions.
    for(var i=0; i<this.hats.length; i++) {
        var hat = this.hats[i];
        if(hat.x >= (this.alice.x - this.alice.width/2) && hat.x <= (this.alice.x + this.alice.width/2) &&
                hat.y >= (this.alice.y - this.alice.height/2) && hat.y <= (this.alice.y + this.alice.height/2)) {
            this.hats.splice(i--, 1);
            // join Alice and hat!!
        }
                
    }

};

Game.prototype.draw = function(game, dt, ctx) {
    //  Clear the background.
    ctx.clearRect(0, 0, game.width, game.height);
    
    var game = this;
    //  Draw alice.
    var alice = new Image();
    alice.src = 'img/alice.png';
    alice.onload = function() {
        ctx.drawImage(alice, game.alice.x - (game.alice.width / 2), game.alice.y - (game.alice.height / 2), game.alice.width, game.alice.height);
    };

    //  Draw hats.
    ctx.fillStyle = '#000';
    for(var i=0; i<this.hats.length; i++) {
        var hat = this.hats[i];
        ctx.fillRect(hat.x - 2, hat.y - 2, 4, 4);
    }

    //  If we're in debug mode, draw bounds.
    if(this.config.debugMode) {
        ctx.strokeStyle = '#ff0000';
        ctx.strokeRect(0,0,game.width, game.height);
        ctx.strokeRect(game.gameBounds.left, game.gameBounds.top,
            game.gameBounds.right - game.gameBounds.left,
            game.gameBounds.bottom - game.gameBounds.top);
    }

};

//  The main loop.
function GameLoop(game) {
    //  Delta t is the time to update/draw.
    var dt = 1 / game.config.fps;

    //  Get the drawing context.
    var ctx = this.gameCanvas.getContext("2d");
    
    game.update(game, dt);    
    game.draw(game, dt, ctx);

}

//  Inform the game a key is down.
Game.prototype.keyDown = function(keyCode) {
    this.pressedKeys[keyCode] = true;
};

//  Inform the game a key is up.
Game.prototype.keyUp = function(keyCode) {
    delete this.pressedKeys[keyCode];
};


/*
 
  Alice

*/
function Alice(x, y) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 66;
}


/*
    Hat

*/
function Hat(x, y, velocity) {
    this.x = x;
    this.y = y;
    this.velocity = velocity;
}