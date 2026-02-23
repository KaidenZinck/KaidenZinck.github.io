/*jslint nomen: true, white: true */
/*global PS */

"use strict";

var GAME = {

    WIDTH: 25,
    HEIGHT: 20,

    STATE_TITLE: 0,
    STATE_PLAY: 1,
    STATE_OVER: 2,
    STATE_WIN: 3,

    state: 0,

    moleCount: 5,
    moles: [],
    tunnels: [],

    speed: 0.02,        // slower start
    maxSpeed: 0.08,     // much less aggressive
    riseChance: 2,      // lower random trigger %

    timer: null,
    timeSurvived: 0,
    winTime: 25
};

////////////////////////////////////////////////////////////
// INIT
////////////////////////////////////////////////////////////

PS.init = function () {
    PS.gridSize(GAME.WIDTH, GAME.HEIGHT);
    PS.border(PS.ALL, PS.ALL, 0);
    PS.seed(12345);
    showTitle();
};

////////////////////////////////////////////////////////////
// TITLE
////////////////////////////////////////////////////////////

function showTitle() {

    GAME.state = GAME.STATE_TITLE;
    PS.color(PS.ALL, PS.ALL, 0x5a3e1b);
    PS.glyph(PS.ALL, PS.ALL, "");
    PS.statusText("MOLE PATROL - Click to Start");
}

////////////////////////////////////////////////////////////
// START GAME
////////////////////////////////////////////////////////////

function startGame() {

    GAME.state = GAME.STATE_PLAY;
    GAME.speed = 0.02;
    GAME.timeSurvived = 0;

    PS.color(PS.ALL, PS.ALL, 0x5a3e1b);
    PS.glyph(PS.ALL, PS.ALL, "");

    createTunnels();
    createMoles();
    drawGrass();

    GAME.timer = PS.timerStart(6, update); // slower timer
}

////////////////////////////////////////////////////////////
// DRAW GRASS
////////////////////////////////////////////////////////////

function drawGrass() {
    for (let x = 0; x < GAME.WIDTH; x++) {
        PS.color(x, 2, 0x2ecc40);
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
// CREATE MOLES
////////////////////////////////////////////////////////////

function createMoles() {

    GAME.moles = [];

    for (let i = 0; i < GAME.moleCount; i++) {

        let sprite = PS.spriteSolid(1, 1);
        PS.spriteSolidAlpha(sprite, 0);

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

    if (GAME.state !== GAME.STATE_PLAY) {
        return;
    }

    GAME.timeSurvived += 0.1;

    // Win condition
    if (GAME.timeSurvived >= GAME.winTime) {
        winGame();
        return;
    }

    PS.statusText("Survive: " + Math.floor(GAME.timeSurvived) + " / 25 seconds");

    if (GAME.speed < GAME.maxSpeed) {
        GAME.speed += 0.0001;
    }

    redrawTunnels();

    for (let i = 0; i < GAME.moles.length; i++) {

        let mole = GAME.moles[i];

        if (!mole.rising && PS.random(100) < GAME.riseChance) {
            mole.rising = true;
        }

        if (mole.rising) {
            mole.y -= GAME.speed;

            if (mole.y <= 2) {
                loseGame();
                return;
            }
        }

        let drawY = Math.floor(mole.y);
        PS.spriteMove(mole.sprite, mole.x, drawY);

        PS.glyph(mole.x, drawY, "●");
        PS.glyphColor(mole.x, drawY, 0x2b1a0d);
    }
}

////////////////////////////////////////////////////////////
// REDRAW TUNNELS (PERMANENT FIX)
////////////////////////////////////////////////////////////

function redrawTunnels() {

    for (let i = 0; i < GAME.tunnels.length; i++) {

        let x = GAME.tunnels[i];

        for (let y = 3; y < GAME.HEIGHT; y++) {
            PS.color(x, y, 0x3b2a14);
            PS.glyph(x, y, "");
        }
    }

    drawGrass();
}

////////////////////////////////////////////////////////////
// CLICK HANDLER
////////////////////////////////////////////////////////////

PS.touch = function (x, y) {

    if (GAME.state === GAME.STATE_TITLE) {
        startGame();
        return;
    }

    if (GAME.state === GAME.STATE_OVER || GAME.state === GAME.STATE_WIN) {
        showTitle();
        return;
    }

    for (let i = 0; i < GAME.moles.length; i++) {

        let mole = GAME.moles[i];

        if (x === mole.x) {
            mole.y = GAME.HEIGHT - 1;
            mole.rising = false;
        }
    }
};

////////////////////////////////////////////////////////////
// LOSE
////////////////////////////////////////////////////////////

function loseGame() {

    PS.timerStop(GAME.timer);
    GAME.state = GAME.STATE_OVER;

    PS.statusText("A mole escaped! Click to restart.");

    for (let x = 0; x < GAME.WIDTH; x++) {
        PS.color(x, 2, PS.COLOR_RED);
    }
}

////////////////////////////////////////////////////////////
// WIN
////////////////////////////////////////////////////////////

function winGame() {

    PS.timerStop(GAME.timer);
    GAME.state = GAME.STATE_WIN;

    PS.statusText("You contained the moles! Click to play again.");

    for (let x = 0; x < GAME.WIDTH; x++) {
        PS.color(x, 2, 0x00ccff);
    }
}
