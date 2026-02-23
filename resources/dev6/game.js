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

    speed: 0.11,        // more aggressive
    maxSpeed: 0.2,
    riseChance: 6,      // more frequent rises

    timer: null,
    timeSurvived: 0,
    winTime: 45
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
    PS.color(PS.ALL, PS.ALL, 0x5a3e1b);
    PS.glyph(PS.ALL, PS.ALL, "");
    PS.statusText("STOP THE EVIL MOLES, WE WANT SPRING!!");
}

////////////////////////////////////////////////////////////
// START GAME
////////////////////////////////////////////////////////////

function startGame() {

    GAME.state = GAME.STATE_PLAY;
    GAME.timeSurvived = 0;
    GAME.speed = 0.04;

    PS.color(PS.ALL, PS.ALL, 0x5a3e1b);
    PS.glyph(PS.ALL, PS.ALL, "");

    createTunnels();
    createMoles();
    drawGrass();

    GAME.timer = PS.timerStart(6, update);
}

////////////////////////////////////////////////////////////
// GRASS
////////////////////////////////////////////////////////////

function drawGrass() {
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

        for (let y = 3; y < GAME.HEIGHT; y++) {
            PS.color(x, y, 0x3b2a14);
        }
    }
}

////////////////////////////////////////////////////////////
// MOLES (no sprite movement anymore)
////////////////////////////////////////////////////////////

function createMoles() {

    GAME.moles = [];

    for (let i = 0; i < GAME.moleCount; i++) {

        // create sprite but do NOT move it
        let sprite = PS.spriteSolid(1, 1);
        PS.spriteSolidAlpha(sprite, 0);

        GAME.moles.push({
            sprite: sprite,
            x: GAME.tunnels[i],
            y: GAME.HEIGHT - 1,
            rising: false
        });
    }
}

////////////////////////////////////////////////////////////
// UPDATE LOOP
////////////////////////////////////////////////////////////

function update() {

    GAME.timeSurvived += 0.1;

    if (GAME.timeSurvived >= GAME.winTime) {
        winGame();
        return;
    }

    PS.statusText("Survive: " + Math.floor(GAME.timeSurvived) + " / 25 seconds");

    if (GAME.speed < GAME.maxSpeed) {
        GAME.speed += 0.0004;  // faster ramp
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
        PS.glyph(mole.x, drawY, "●");
        PS.glyphColor(mole.x, drawY, 0x2b1a0d);
    }
}

////////////////////////////////////////////////////////////
// TUNNEL REDRAW (now stable)
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
// CLICK
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

    PS.statusText("A mole escaped! 6 WEEKS OF WINTER ;<");

    for (let x = 0; x < GAME.WIDTH; x++) {
        PS.color(x, 2, PS.COLOR_WHITE);
    }
}

////////////////////////////////////////////////////////////
// WIN
////////////////////////////////////////////////////////////

function winGame() {

    PS.timerStop(GAME.timer);
    GAME.state = GAME.STATE_WIN;

    PS.statusText("You WON! Spring!!! Click to play again.");

    for (let x = 0; x < GAME.WIDTH; x++) {
        PS.color(x, 2, 0x00ccff);
    }
}
