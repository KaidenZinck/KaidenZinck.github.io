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

    speed: 0.11,
    maxSpeed: 0.2,
    riseChance: 6,

    timer: null,
    timeSurvived: 0,
    winTime: 45,

    // JUICE
    shakeTime: 0,
    shakeAmount: 0
};

////////////////////////////////////////////////////////////
// INIT
////////////////////////////////////////////////////////////

PS.init = function () {

    PS.gridSize(GAME.WIDTH, GAME.HEIGHT);
    PS.border(PS.ALL, PS.ALL, 0);
    PS.seed(12345);

    // Load sounds
    PS.audioLoad("fx_pop", { lock: true });
    PS.audioLoad("fx_squish", { lock: true });
    PS.audioLoad("fx_tada", { lock: true });
    PS.audioLoad("fx_uhoh", { lock: true });

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
    GAME.speed = 0.08;

    PS.color(PS.ALL, PS.ALL, 0x5a3e1b);
    PS.glyph(PS.ALL, PS.ALL, "");

    createTunnels();
    createMoles();
    drawGrass();

    GAME.timer = PS.timerStart(4, update);
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
// MOLES
////////////////////////////////////////////////////////////

function createMoles() {

    GAME.moles = [];

    for (let i = 0; i < GAME.moleCount; i++) {

        GAME.moles.push({
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

    PS.statusText("🌱 Survive: " +
        Math.floor(GAME.timeSurvived) + " / 45 seconds");

    if (GAME.speed < GAME.maxSpeed) {
        GAME.speed += 0.0015;
    }

    redrawTunnels();

    // Screen shake effect
    if (GAME.shakeTime > 0) {
        GAME.shakeTime--;
        PS.gridPlane(1);
        PS.gridColor(PS.random(GAME.shakeAmount), 0);
        PS.gridPlane(0);
    }

    for (let i = 0; i < GAME.moles.length; i++) {

        let mole = GAME.moles[i];

        // Random rise
        if (!mole.rising && PS.random(100) < GAME.riseChance) {
            mole.rising = true;
            PS.audioPlay("fx_pop", { volume: 0.2 });
        }

        if (mole.rising) {

            mole.y -= GAME.speed;

            // Danger flash
            if (mole.y <= 4) {
                PS.color(mole.x, 2, PS.COLOR_RED);
            }

            if (mole.y <= 2) {
                loseGame();
                return;
            }
        }

        let drawY = Math.floor(mole.y);

        PS.glyph(mole.x, drawY, "●");
        PS.glyphColor(mole.x, drawY, 0x2b1a0d);

        // Slight scaling intensity
        PS.scale(mole.x, drawY, 100 + (GAME.speed * 200));
    }
}

////////////////////////////////////////////////////////////
// REDRAW TUNNELS
////////////////////////////////////////////////////////////

function redrawTunnels() {

    for (let i = 0; i < GAME.tunnels.length; i++) {

        let x = GAME.tunnels[i];

        for (let y = 3; y < GAME.HEIGHT; y++) {
            PS.color(x, y, 0x3b2a14);
            PS.glyph(x, y, "");
            PS.scale(x, y, 100);
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

    if (GAME.state === GAME.STATE_OVER ||
        GAME.state === GAME.STATE_WIN) {
        showTitle();
        return;
    }

    for (let i = 0; i < GAME.moles.length; i++) {

        let mole = GAME.moles[i];

        if (x === mole.x && mole.rising) {

            PS.audioPlay("fx_squish", { volume: 0.3 });

            let drawY = Math.floor(mole.y);

            // Squash effect
            PS.scale(x, drawY, 50);
            PS.glyph(x, drawY, "✸");
            PS.glyphColor(x, drawY, PS.COLOR_RED);

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

    PS.audioPlay("fx_uhoh", { volume: 0.4 });

    GAME.shakeTime = 15;
    GAME.shakeAmount = 5;

    PS.statusText("❄ A mole escaped! 6 MORE WEEKS OF WINTER!");

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

    PS.audioPlay("fx_tada", { volume: 0.5 });

    PS.statusText("🌸 YOU SAVED SPRING! Click to play again!");

    for (let x = 0; x < GAME.WIDTH; x++) {
        PS.color(x, 2, 0x00ccff);
    }
}
