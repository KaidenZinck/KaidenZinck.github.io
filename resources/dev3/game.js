// Rain Puzzle – Bounce Drop Into Hole

/*jslint nomen: true, white: true */
/*global PS */

var RAIN = {

	// CONSTANTS
	GRID_WIDTH: 24,
	GRID_HEIGHT: 24,
	FRAME_RATE: 6,
	BG_COLOR: PS.COLOR_WHITE,

	// HOLE LOCATION
	holeX: 20,
	holeY: 20,
	holeColor: PS.COLOR_BLACK,

	// SINGLE DROP STATE
	dropActive: false,
	dropX: 0,
	dropY: 0,
	dropVX: 1,
	dropVY: 1,
	dropColor: PS.COLOR_BLUE,

	// GAME STATE
	won: false,

	// GAME LOOP
	tick : function () {
		"use strict";

		var x, y, vx, vy;

		if ( !RAIN.dropActive || RAIN.won ) {
			return;
		}

		x = RAIN.dropX;
		y = RAIN.dropY;
		vx = RAIN.dropVX;
		vy = RAIN.dropVY;

		// erase old
		PS.color( x, y, RAIN.BG_COLOR );

		// move
		x += vx;
		y += vy;

		// bounce walls
		if ( x < 0 ) {
			x = 0;
			vx = -vx;
		}
		else if ( x >= RAIN.GRID_WIDTH ) {
			x = RAIN.GRID_WIDTH - 1;
			vx = -vx;
		}

		if ( y < 0 ) {
			y = 0;
			vy = -vy;
		}
		else if ( y >= RAIN.GRID_HEIGHT ) {
			y = RAIN.GRID_HEIGHT - 1;
			vy = -vy;
		}

		// store back
		RAIN.dropX = x;
		RAIN.dropY = y;
		RAIN.dropVX = vx;
		RAIN.dropVY = vy;

		// check hole
		if ( x === RAIN.holeX && y === RAIN.holeY ) {
			RAIN.won = true;
			PS.statusText( "Nice shot! You win!" );
			PS.audioPlay( "fx_tada" );
			return;
		}

		// draw drop
		PS.color( x, y, RAIN.dropColor );
	}
};

// INIT
PS.init = function( system, options ) {
	"use strict";

	PS.gridSize( RAIN.GRID_WIDTH, RAIN.GRID_HEIGHT );
	PS.gridColor( RAIN.BG_COLOR );
	PS.border( PS.ALL, PS.ALL, 0 );
	PS.color( PS.ALL, PS.ALL, RAIN.BG_COLOR );

	PS.audioLoad( "fx_drip1", { lock : true } );
	PS.audioLoad( "fx_tada", { lock : true } );

	PS.statusColor( PS.COLOR_BLACK );
	PS.statusText( "Tap once to launch the drop toward the hole" );

	// draw hole
	PS.color( RAIN.holeX, RAIN.holeY, RAIN.holeColor );

	PS.timerStart( RAIN.FRAME_RATE, RAIN.tick );
};

// TOUCH – spawn drop once
PS.touch = function( x, y, data, options ) {
	"use strict";

	if ( RAIN.dropActive ) {
		return;
	}

	RAIN.dropActive = true;
	RAIN.dropX = x;
	RAIN.dropY = y;

	// FIXED PUZZLE ANGLE (change this to make harder/easier)
	RAIN.dropVX = 1;
	RAIN.dropVY = 1;

	PS.color( x, y, RAIN.dropColor );
	PS.audioPlay( "fx_drip1" );
};

// REQUIRED EMPTY EVENTS
PS.release = function () { "use strict"; };
PS.enter = function () { "use strict"; };
PS.exit = function () { "use strict"; };
PS.exitGrid = function () { "use strict"; };
PS.keyDown = function () { "use strict"; };
PS.keyUp = function () { "use strict"; };
PS.swipe = function () { "use strict"; };
PS.input = function () { "use strict"; };
