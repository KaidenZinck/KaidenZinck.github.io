/*jslint nomen: true, white: true */
/*global PS */

"use strict";

var GAME = {

    // Grid
    WIDTH: 25,
    HEIGHT: 20,

    // Game states
    STATE_TITLE: 0,
    STATE_PLAY: 1,
    STATE_OVER: 2,

    state: 0,

    // Moles
    moleCount: 5,
    moles: [],
    tunnels: [],
    speed: 0.02,
    maxSpeed: 0.18,

    timer: null,
    escapes: 0,
    maxEscapes: 3,
    score: 0
};

////////////////////////////////////////////////////////////
// INITIALIZATION
////////////////////////////////////////////////////////////

PS.init = function () {
    PS.gridSize(GAME.WIDTH, GAME.HEIGHT);
    PS.border(PS.ALL, PS.ALL, 0);
    PS.seed(12345); // seeded randomness
    showTitle();
};

////////////////////////////////////////////////////////////
// TITLE SCREEN
////////////////////////////////////////////////////////////

function showTitle() {
    GAME.state = GAME.STATE_TITLE;

    PS.gridColor(0x5a3e1b); // dirt brown
    PS.color(PS.ALL, PS.ALL, 0x5a3e1b);

    PS.statusText("MOLE PATROL - Click to Start Digging");
    PS.statusColor(PS.COLOR_WHITE);

    PS.glyph(12, 8, "M");
    PS.glyphColor(12, 8, PS.COLOR_WHITE);

    PS.glyph(11, 9, "^");
    PS.glyph(13, 9, "^");
}

////////////////////////////////////////////////////////////
// START GAME
////////////////////////////////////////////////////////////

function startGame() {

    GAME.state = GAME.STATE_PLAY;
    GAME.escapes = 0;
    GAME.score = 0;
    GAME.speed = 0.02;

    PS.statusText("Stop the moles!");
    PS.gridColor(0x5a3e1b);
    PS.color(PS.ALL, PS.ALL, 0x5a3e1b);

    drawScene();
    createTunnels();
    createMoles();

    GAME.timer = PS.timerStart(2, update);
}

////////////////////////////////////////////////////////////
// DRAW SCENE
////////////////////////////////////////////////////////////

function drawScene() {

    // Grass surface
    for (let x = 0; x < GAME.WIDTH; x++) {
        PS.color(x, 2, 0x2ecc40); // green
    }

    // Dirt below
    for (let y = 3; y < GAME.HEIGHT; y++) {
        for (let x = 0; x < GAME.WIDTH; x++) {
            PS.color(x, y, 0x5a3e1b);
        }
    }
}

////////////////////////////////////////////////////////////
// CREATE TUNNELS
////////////////////////////////////////////////////////////

function createTunnels() {
    GAME.tunnels = [];
    let spacing = GAME.WIDTH / (GAME.moleCount + 1);

    for (let i = 0; i < GAME.moleCount; i++) {
        let x = Math.floor((i + 1) * spacing);
        GAME.tunnels.push(x);

        for (let y = 3; y < GAME.HEIGHT; y++) {
            PS.color(x, y, 0x3b2a14);
        }
    }
}

////////////////////////////////////////////////////////////
// CREATE MOLES (SPRITES)
////////////////////////////////////////////////////////////

function createMoles() {
    GAME.moles = [];

    for (let i = 0; i < GAME.moleCount; i++) {
        let sprite = PS.spriteSolid(1, 1);
        PS.spriteSolidColor(sprite, 0x8b5a2b);

        let x = GAME.tunnels[i];
        let y = GAME.HEIGHT - 1;

        PS.spriteMove(sprite, x, y);

        GAME.moles.push({
            sprite: sprite,
            x: x,
            y: y,
            rising: false
        });
    }
}

////////////////////////////////////////////////////////////
// UPDATE LOOP
////////////////////////////////////////////////////////////

function update() {

    GAME.score++;

    // Increase difficulty gradually
    if (GAME.speed < GAME.maxSpeed) {
        GAME.speed += 0.0002;
    }

    for (let i = 0; i < GAME.moles.length; i++) {
        let mole = GAME.moles[i];

        // Random chance to start rising
        if (!mole.rising && PS.random(100) < 3) {
            mole.rising = true;
        }

        if (mole.rising) {
            mole.y -= GAME.speed;

            if (mole.y <= 2) {
                mole.y = 2;
                mole.rising = false;
                mole.y = GAME.HEIGHT - 1;

                GAME.escapes++;
                flashGrass();

                if (GAME.escapes >= GAME.maxEscapes) {
                    gameOver();
                }
            }

            PS.spriteMove(mole.sprite, mole.x, Math.floor(mole.y));
        }
    }
}

////////////////////////////////////////////////////////////
// FLASH GRASS WHEN ESCAPE
////////////////////////////////////////////////////////////

function flashGrass() {
    for (let x = 0; x < GAME.WIDTH; x++) {
        PS.color(x, 2, PS.COLOR_RED);
    }

    PS.timerStart(10, function () {
        for (let x = 0; x < GAME.WIDTH; x++) {
            PS.color(x, 2, 0x2ecc40);
        }
    });
}

////////////////////////////////////////////////////////////
// PUSH MOLE DOWN
////////////////////////////////////////////////////////////

PS.touch = function (x, y) {

    if (GAME.state === GAME.STATE_TITLE) {
        startGame();
        return;
    }

    if (GAME.state === GAME.STATE_OVER) {
        showTitle();
        return;
    }

    if (GAME.state !== GAME.STATE_PLAY) {
        return;
    }

    for (let i = 0; i < GAME.moles.length; i++) {
        let mole = GAME.moles[i];

        if (x === mole.x) {
            mole.y = GAME.HEIGHT - 1;
            mole.rising = false;
            PS.spriteMove(mole.sprite, mole.x, mole.y);
            PS.audioPlay("fx_click");
        }
    }
};

////////////////////////////////////////////////////////////
// GAME OVER
////////////////////////////////////////////////////////////

function gameOver() {
    PS.timerStop(GAME.timer);
    GAME.state = GAME.STATE_OVER;

    PS.statusText("Too many moles escaped! Click to restart.");
    PS.audioPlay("fx_boom");
}
