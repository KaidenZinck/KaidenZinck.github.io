/*jslint nomen: true, white: true */
/*global PS */

var GAME = {

    GRID_W: 32,
    GRID_H: 32,

    BG_COLOR: PS.COLOR_GREEN,
    WALL_COLOR: 0x808080,
    BALL_COLOR: PS.COLOR_WHITE,
    HOLE_COLOR: PS.COLOR_BLACK,

    stage: 1,

    ballX: 0,
    ballY: 0,
    vx: 0,
    vy: 0,
    moving: false,

    holeX: 0,
    holeY: 0,

    safeRadius: 3,

    shotStartTime: 0,

    levelComplete: false,

    // ---------- LEVELS ----------
    levels: [

        // Stage 1
        {
            walls: function () {

                // Outer box
                for (var x = 4; x <= 27; x++) {
                    PS.color(x, 4, GAME.WALL_COLOR);
                    PS.color(x, 27, GAME.WALL_COLOR);
                }

                for (var y = 4; y <= 27; y++) {
                    PS.color(4, y, GAME.WALL_COLOR);
                    PS.color(27, y, GAME.WALL_COLOR);
                }

                // Inner L
                for (x = 10; x <= 20; x++) {
                    PS.color(x, 12, GAME.WALL_COLOR);
                }

                for (y = 12; y <= 22; y++) {
                    PS.color(10, y, GAME.WALL_COLOR);
                }
            },

            hole: { x: 22, y: 22 }
        },

        // Stage 2 (simple variation)
        {
            walls: function () {

                for (var x = 3; x <= 28; x++) {
                    PS.color(x, 3, GAME.WALL_COLOR);
                    PS.color(x, 28, GAME.WALL_COLOR);
                }

                for (var y = 3; y <= 28; y++) {
                    PS.color(3, y, GAME.WALL_COLOR);
                    PS.color(28, y, GAME.WALL_COLOR);
                }

                for (x = 8; x <= 24; x++) {
                    PS.color(x, 16, GAME.WALL_COLOR);
                }
            },

            hole: { x: 25, y: 25 }
        }
    ],

    // ---------- RESET LEVEL ----------
    loadStage: function () {

        PS.color(PS.ALL, PS.ALL, GAME.BG_COLOR);

        GAME.moving = false;
        GAME.levelComplete = false;

        var lvl = GAME.levels[GAME.stage - 1];

        lvl.walls();

        GAME.holeX = lvl.hole.x;
        GAME.holeY = lvl.hole.y;

        PS.color(GAME.holeX, GAME.holeY, GAME.HOLE_COLOR);

        PS.statusText("Stage " + GAME.stage);
    },

    // ---------- SAFE BALL SPAWN ----------
    spawnBall: function () {

        var x, y, safe;

        do {
            x = PS.random(GAME.GRID_W - 2) + 1;
            y = PS.random(GAME.GRID_H - 2) + 1;

            safe = true;

            if (PS.color(x, y) === GAME.WALL_COLOR) safe = false;

            if (Math.abs(x - GAME.holeX) <= GAME.safeRadius &&
                Math.abs(y - GAME.holeY) <= GAME.safeRadius) safe = false;

        } while (!safe);

        GAME.ballX = x;
        GAME.ballY = y;

        PS.color(x, y, GAME.BALL_COLOR);
    },

    // ---------- SHOOT ----------
    shoot: function () {

        if (GAME.moving) return;

        GAME.vx = 0.7;
        GAME.vy = 0.7;

        GAME.moving = true;
        GAME.shotStartTime = Date.now();
    },

    // ---------- MOVE ----------
    update: function () {

        if (!GAME.moving) return;

        var timeAlive = (Date.now() - GAME.shotStartTime) / 1000;

        // Slight decay
        var speedScale = Math.max(0.2, 1 - timeAlive * 0.1);

        var nextX = GAME.ballX + GAME.vx * speedScale;
        var nextY = GAME.ballY + GAME.vy * speedScale;

        var gx = Math.round(nextX);
        var gy = Math.round(nextY);

        // WALL COLLISION
        if (PS.color(gx, Math.round(GAME.ballY)) === GAME.WALL_COLOR) {
            GAME.vx *= -1;
            nextX = GAME.ballX;
        }

        if (PS.color(Math.round(GAME.ballX), gy) === GAME.WALL_COLOR) {
            GAME.vy *= -1;
            nextY = GAME.ballY;
        }

        // Apply movement
        PS.color(Math.round(GAME.ballX), Math.round(GAME.ballY), GAME.BG_COLOR);

        GAME.ballX = nextX;
        GAME.ballY = nextY;

        PS.color(Math.round(GAME.ballX), Math.round(GAME.ballY), GAME.BALL_COLOR);

        // HOLE CHECK
        if (!GAME.levelComplete &&
            Math.round(GAME.ballX) === GAME.holeX &&
            Math.round(GAME.ballY) === GAME.holeY) {

            GAME.levelComplete = true;
            GAME.moving = false;

            PS.statusText("Stage Clear!");

            PS.timerStart(60, function () {

                GAME.stage++;

                if (GAME.stage > GAME.levels.length) {
                    GAME.stage = 1;
                }

                GAME.loadStage();
                GAME.spawnBall();

            });
        }
    }
};

// ---------- INIT ----------
PS.init = function () {

    PS.gridSize(GAME.GRID_W, GAME.GRID_H);

    PS.gridColor(GAME.BG_COLOR);
    PS.border(PS.ALL, PS.ALL, 0);
    PS.color(PS.ALL, PS.ALL, GAME.BG_COLOR);

    GAME.loadStage();
    GAME.spawnBall();

    PS.timerStart(2, GAME.update);
};

// ---------- INPUT ----------
PS.touch = function () {
    GAME.shoot();
};
