// Rain Puzzle – Bounce Drop Into Big Hole + Reset

/*jslint nomen: true, white: true */
/*global PS */

var RAIN = {

	// CONSTANTS
	GRID_WIDTH: 24,
	GRID_HEIGHT: 24,
	FRAME_RATE: 6,
	BG_COLOR: PS.COLOR_GREEN,

	// BIG HOLE AREA (3x3)
	holeX: 19,
	holeY: 19,
	holeSize: 3,
	holeColor: PS.COLOR_BLACK,

	// SINGLE DROP STATE
	dropActive: false,
	dropX: 0,
	dropY: 0,
	dropVX: 1,
	dropVY: 1,
	dropColor: PS.COLOR_WHITE,

	// GAME STATE
	won: false,

	// DRAW HOLE
	drawHole : function () {
		"use strict";
		var x, y;

		for ( x = 0; x < RAIN.holeSize; x += 1 ) {
			for ( y = 0; y < RAIN.holeSize; y += 1 ) {
				PS.color( RAIN.holeX + x, RAIN.holeY + y, RAIN.holeColor );
			}
		}
	},

	// CHECK IF DROP IN HOLE
	inHole : function ( x, y ) {
		"use strict";

		return (
			x >= RAIN.holeX &&
			x < RAIN.holeX + RAIN.holeSize &&
			y >= RAIN.holeY &&
			y < RAIN.holeY + RAIN.holeSize
		);
	},

	// RESET LEVEL
	reset : function () {
		"use strict";

		RAIN.dropActive = false;
		RAIN.won = false;

		PS.color( PS.ALL, PS.ALL, RAIN.BG_COLOR );
		RAIN.drawHole();

		PS.statusText( "Tap to launch | Press R to reset" );
	},

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

		// store
		RAIN.dropX = x;
		RAIN.dropY = y;
		RAIN.dropVX = vx;
		RAIN.dropVY = vy;

		// check win
		if ( RAIN.inHole( x, y ) ) {
			RAIN.won = true;
			PS.statusText( "You win! Press R to play again" );
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

	PS.statusColor( PS.COLOR_WHITE );
	PS.statusText( "Tap to launch | Press R to reset" );

	RAIN.drawHole();

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

	// Launch angle
	RAIN.dropVX = 1;
	RAIN.dropVY = 1;

	PS.color( x, y, RAIN.dropColor );
	PS.audioPlay( "fx_drip1" );
};

// RESET BUTTON (R key)
PS.keyDown = function( key ) {
	"use strict";

	if ( key === PS.KEY_SPACE ) {
		RAIN.reset();
	}
};

// UNUSED EVENTS
PS.release = function () { "use strict"; };
PS.enter = function () { "use strict"; };
PS.exit = function () { "use strict"; };
PS.exitGrid = function () { "use strict"; };
PS.keyUp = function () { "use strict"; };
PS.swipe = function () { "use strict"; };
PS.input = function () { "use strict"; };
