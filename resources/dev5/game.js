// Mini Golf Multi-Level - Stable Physics Version

var RAIN = {

    GRID_WIDTH : 24,
    GRID_HEIGHT : 24,

    ballX : 0,
    ballY : 0,
    ballVX : 0,
    ballVY : 0,
    ballActive : false,

    shotPower : 0.8,
    friction : 0.985,

    level : 0,
    transitioning : false,

    // Hole safe placement radius
    holeSafeRadius : 2,

    // LEVEL DATA
    levels : [
        {
            holeX : 20,
            holeY : 20,
            walls : [
                [10,10],[11,10],[12,10],[13,10],
                [13,11],[13,12],[13,13]
            ]
        },
        {
            holeX : 3,
            holeY : 20,
            walls : [
                [6,5],[6,6],[6,7],[6,8],
                [7,8],[8,8],[9,8],
                [12,15],[13,15],[14,15]
            ]
        },
        {
            holeX : 20,
            holeY : 3,
            walls : [
                [15,5],[15,6],[15,7],[15,8],
                [16,5],[17,5],
                [5,15],[6,15],[7,15]
            ]
        }
    ]
};

////////////////////////////////////////////////////

RAIN.drawLevel = function() {

    var lvl = RAIN.levels[RAIN.level];

    PS.gridSize(RAIN.GRID_WIDTH, RAIN.GRID_HEIGHT);
    PS.color(PS.ALL, PS.ALL, PS.COLOR_WHITE);

    // Draw walls
    lvl.walls.forEach(function(w){
        PS.color(w[0], w[1], PS.COLOR_BLACK);
    });

    // Draw hole
    PS.color(lvl.holeX, lvl.holeY, PS.COLOR_GREEN);

    PS.statusText("Stage " + (RAIN.level + 1));
};

////////////////////////////////////////////////////

RAIN.isWall = function(x,y){
    var lvl = RAIN.levels[RAIN.level];
    for (var i=0;i<lvl.walls.length;i++){
        if (lvl.walls[i][0] === x && lvl.walls[i][1] === y){
            return true;
        }
    }
    return false;
};

////////////////////////////////////////////////////

RAIN.nearHole = function(x,y){
    var lvl = RAIN.levels[RAIN.level];

    return (
        Math.abs(x - lvl.holeX) <= RAIN.holeSafeRadius &&
        Math.abs(y - lvl.holeY) <= RAIN.holeSafeRadius
    );
};

////////////////////////////////////////////////////

RAIN.nextLevel = function(){

    if (RAIN.transitioning) return;

    RAIN.transitioning = true;

    setTimeout(function(){

        RAIN.level++;

        if (RAIN.level >= RAIN.levels.length){
            PS.statusText("You Win!");
            return;
        }

        RAIN.ballActive = false;
        RAIN.transitioning = false;
        RAIN.drawLevel();

    }, 1000);
};

////////////////////////////////////////////////////

RAIN.updateBall = function(){

    if (!RAIN.ballActive) return;

    PS.color(Math.floor(RAIN.ballX), Math.floor(RAIN.ballY), PS.COLOR_WHITE);

    var nextX = RAIN.ballX + RAIN.ballVX;
    var nextY = RAIN.ballY + RAIN.ballVY;

    var nx = Math.floor(nextX);
    var ny = Math.floor(nextY);

    // WALL COLLISION (Prevents Riding)
    if (RAIN.isWall(nx, Math.floor(RAIN.ballY))){
        RAIN.ballVX *= -1;
        nextX = RAIN.ballX + RAIN.ballVX;
    }

    if (RAIN.isWall(Math.floor(RAIN.ballX), ny)){
        RAIN.ballVY *= -1;
        nextY = RAIN.ballY + RAIN.ballVY;
    }

    // Corner hit
    if (RAIN.isWall(nx, ny)){
        RAIN.ballVX *= -1;
        RAIN.ballVY *= -1;
        nextX = RAIN.ballX + RAIN.ballVX;
        nextY = RAIN.ballY + RAIN.ballVY;
    }

    RAIN.ballX = nextX;
    RAIN.ballY = nextY;

    // Friction
    RAIN.ballVX *= RAIN.friction;
    RAIN.ballVY *= RAIN.friction;

    if (Math.abs(RAIN.ballVX) < 0.01 && Math.abs(RAIN.ballVY) < 0.01){
        RAIN.ballActive = false;
    }

    var lvl = RAIN.levels[RAIN.level];

    // Hole detection (ONLY ONCE)
    if (!RAIN.transitioning &&
        Math.floor(RAIN.ballX) === lvl.holeX &&
        Math.floor(RAIN.ballY) === lvl.holeY){

        PS.audioPlay("fx_tada");
        RAIN.ballActive = false;
        RAIN.nextLevel();
        return;
    }

    PS.color(Math.floor(RAIN.ballX), Math.floor(RAIN.ballY), PS.COLOR_BLUE);
};

////////////////////////////////////////////////////

PS.init = function(){
    PS.timerStart(1, RAIN.updateBall);
    RAIN.drawLevel();
};

////////////////////////////////////////////////////

PS.touch = function(x,y){

    if (RAIN.ballActive || RAIN.transitioning) return;

    if (RAIN.isWall(x,y)) return;

    if (RAIN.nearHole(x,y)) return;

    // Spawn at tap
    RAIN.ballX = x;
    RAIN.ballY = y;

    // ALWAYS diagonal down-right
    RAIN.ballVX = RAIN.shotPower;
    RAIN.ballVY = RAIN.shotPower;

    RAIN.ballActive = true;

    PS.audioPlay("fx_blip");
};
