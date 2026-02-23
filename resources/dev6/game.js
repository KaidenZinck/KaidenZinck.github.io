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

    PS.glyph(12, 8, "M");
    PS.glyphColor(12, 8, PS.COLOR_BLACK);
}

////////////////////////////////////////////////////////////
// START
////////////////////////////////////////////////////////////

function startGame() {

    GAME.state = GAME.STATE_PLAY;
    GAME.speed = 0.03;

    PS.statusText("Stop the moles!");

    createTunnels();
    createMoles();

    GAME.timer = PS.timerStart(2, update);
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
// UPDATE
////////////////////////////////////////////////////////////

function update() {

    if (GAME.speed < GAME.maxSpeed) {
        GAME.speed += 0.0005;
    }

    redrawEntireScene();

    for (let i = 0; i < GAME.moles.length; i++) {

        let mole = GAME.moles[i];

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

        let drawY = Math.floor(mole.y);

        PS.spriteMove(mole.sprite, mole.x, drawY);

        // Draw mole glyph
        PS.glyph(mole.x, drawY, "●");
        PS.glyphColor(mole.x, drawY, 0x3b2a14);
    }
}

////////////////////////////////////////////////////////////
// FULL REDRAW (THIS FIXES YOUR BUG)
////////////////////////////////////////////////////////////

function redrawEntireScene() {

    // Fill dirt
    for (let y = 0; y < GAME.HEIGHT; y++) {
        for (let x = 0; x < GAME.WIDTH; x++) {
            PS.color(x, y, 0x5a3e1b);
            PS.glyph(x, y, "");
        }
    }

    // Grass surface
    for (let x = 0; x < GAME.WIDTH; x++) {
        PS.color(x, 2, 0x2ecc40);
    }

    // Tunnels
    for (let i = 0; i < GAME.tunnels.length; i++) {

        let x = GAME.tunnels[i];

        for (let y = 3; y < GAME.HEIGHT; y++) {
            PS.color(x, y, 0x3b2a14);
        }
    }
}

////////////////////////////////////////////////////////////
// CLICK
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
        }
    }
};

////////////////////////////////////////////////////////////
// GAME OVER
////////////////////////////////////////////////////////////

function gameOver() {

    PS.timerStop(GAME.timer);
    GAME.state = GAME.STATE_OVER;

    PS.statusText("A mole escaped! Six more weeks of winter ;<  Click to restart.");

    // Flash grass red
    for (let x = 0; x < GAME.WIDTH; x++) {
        PS.color(x, 2, PS.COLOR_RED);
    }
}
