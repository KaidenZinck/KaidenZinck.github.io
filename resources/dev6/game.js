/*jslint nomen: true, white: true */
/*global PS */

"use strict";

var GAME = {

    WIDTH: 25,
    HEIGHT: 20,

    STATE_TITLE: 0,
    STATE_PLAY: 1,
    STATE_OVER: 2,

    state: 0,

    moleCount: 5,
    moles: [],
    tunnels: [],

    speed: 0.03,
    maxSpeed: 0.2,

    timer: null
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

    PS.gridColor(0x5a3e1b);
    PS.color(PS.ALL, PS.ALL, 0x5a3e1b);
    PS.glyph(PS.ALL, PS.ALL, "");

    PS.statusText("MOLE PATROL - Click to Start Digging");

    PS.glyph(12, 8, "🐹");
    PS.glyph(12, 9, "MOLE PATROL");
    PS.glyphColor(12, 9, PS.COLOR_WHITE);
}

////////////////////////////////////////////////////////////
// START
////////////////////////////////////////////////////////////

function startGame() {

    GAME.state = GAME.STATE_PLAY;
    GAME.speed = 0.03;

    PS.statusText("Stop the moles!");

    drawScene();
    createTunnels();
    createMoles();

    GAME.timer = PS.timerStart(2, update);
}

////////////////////////////////////////////////////////////
// DRAW SCENE
////////////////////////////////////////////////////////////

function drawScene() {

    PS.color(PS.ALL, PS.ALL, 0x5a3e1b);
    PS.glyph(PS.ALL, PS.ALL, "");

    // Grass surface
    for (let x = 0; x < GAME.WIDTH; x++) {
        PS.color(x, 2, 0x2ecc40);
    }
}

////////////////////////////////////////////////////////////
// TUNNELS
////////////////////////////////////////////////////////////

function createTunnels() {

    GAME.tunnels = [];
    let spacing = GAME.WIDTH / (GAME.moleCount + 1);

    for (let i = 0; i < GAME.moleCount; i++) {
        let x = Math.floor((i + 1) * spacing);
        GAME.tunnels.push(x);
    }
}

////////////////////////////////////////////////////////////
// MOLES
////////////////////////////////////////////////////////////

function createMoles() {

    GAME.moles = [];

    for (let i = 0; i < GAME.moleCount; i++) {

        let sprite = PS.spriteSolid(1, 1);
        PS.spriteSolidColor(sprite, PS.COLOR_BLACK);
        PS.spriteSolidAlpha(sprite, 0); // invisible sprite

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

    if (GAME.speed < GAME.maxSpeed) {
        GAME.speed += 0.0005;
    }

    redrawTunnels();

    for (let i = 0; i < GAME.moles.length; i++) {

        let mole = GAME.moles[i];

        // Randomly start rising
        if (!mole.rising && PS.random(100) < 4) {
            mole.rising = true;
        }

        if (mole.rising) {
            mole.y -= GAME.speed;

            if (mole.y <= 2) {
                gameOver();
                return;
            }
        }

        PS.spriteMove(mole.sprite, mole.x, Math.floor(mole.y));

        // Draw mole emoji on bead under sprite
        let drawY = Math.floor(mole.y);
        PS.glyph(mole.x, drawY, "🐹");
    }
}

////////////////////////////////////////////////////////////
// REDRAW TUNNELS (FIXES DARK BROWN BUG)
////////////////////////////////////////////////////////////

function redrawTunnels() {

    for (let i = 0; i < GAME.tunnels.length; i++) {

        let x = GAME.tunnels[i];

        for (let y = 3; y < GAME.HEIGHT; y++) {
            PS.color(x, y, 0x3b2a14);
            PS.glyph(x, y, "");
        }
    }
}

////////////////////////////////////////////////////////////
// PUSH MOLE
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

    PS.statusText("A mole escaped! Click to restart.");
    PS.audioPlay("fx_boom");

    // Flash grass red
    for (let x = 0; x < GAME.WIDTH; x++) {
        PS.color(x, 2, PS.COLOR_RED);
    }
}
