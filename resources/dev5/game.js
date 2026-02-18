// Rain MiniGolf – 3 Level Course With Momentum + Win Screens

/*jslint nomen: true, white: true */
/*global PS */

var RAIN = {

	// GRID
	GRID_WIDTH: 24,
	GRID_HEIGHT: 24,
	FRAME_RATE: 6,

	// COLORS
	BG_COLOR: PS.COLOR_GREEN,
	WALL_COLOR: PS.COLOR_GRAY,
	HOLE_COLOR: PS.COLOR_BLACK,
	DROP_COLOR: PS.COLOR_WHITE,

	// HOLE
	holeX: 0,
	holeY: 0,
	holeSize: 3,

	// DROP
	dropActive: false,
	dropX: 0,
	dropY: 0,
	dropVX: 0,
	dropVY: 0,
	friction: 0.98,

	// GAME
	level: 0,
	won: false,
	showWinScreen: false,

	// WALL STORAGE
	walls: [],

	//---------------------------------------------------------
	// LEVEL DATA
	//---------------------------------------------------------

	loadLevel : function () {
		"use strict";

		RAIN.walls = [];
		PS.color( PS.ALL, PS.ALL, RAIN.BG_COLOR );

		if ( RAIN.level === 0 ) {
			RAIN.holeX = 20;
			RAIN.holeY = 18;

			RAIN.addWallRect( 5, 5, 14, 1 );
			RAIN.addWallRect( 5, 5, 1, 10 );
			RAIN.addWallRect( 10, 10, 10, 1 );
		}

		else if ( RAIN.level === 1 ) {
			RAIN.holeX = 19;
			RAIN.holeY = 2;

			RAIN.addWallRect( 3, 3, 18, 1 );
			RAIN.addWallRect( 3, 3, 1, 15 );
			RAIN.addWallRect( 3, 17, 15, 1 );
			RAIN.addWallRect( 17, 6, 1, 12 );
		}

		else {
			RAIN.holeX = 20;
			RAIN.holeY = 20;

			RAIN.addWallRect( 4, 4, 16, 1 );
			RAIN.addWallRect( 4, 4, 1, 16 );
			RAIN.addWallRect( 4, 19, 16, 1 );
			RAIN.addWallRect( 19, 4, 1, 16 );

			RAIN.addWallRect( 8, 8, 8, 1 );
			RAIN.addWallRect( 8, 8, 1, 8 );
			RAIN.addWallRect( 8, 15, 8, 1 );
		}

		RAIN.drawWalls();
		RAIN.drawHole();
	},

	//---------------------------------------------------------
	// WALL HELPERS
	//---------------------------------------------------------

	addWallRect : function ( x, y, w, h ) {
		"use strict";
		var i, j;

		for ( i = 0; i < w; i += 1 ) {
			for ( j = 0; j < h; j += 1 ) {
				RAIN.walls.push( { x : x + i, y : y + j } );
			}
		}
	},

	drawWalls : function () {
		"use strict";
		var i, w;

		for ( i = 0; i < RAIN.walls.length; i += 1 ) {
			w = RAIN.walls[ i ];
			PS.color( w.x, w.y, RAIN.WALL_COLOR );
		}
	},

	isWall : function ( x, y ) {
		"use strict";
		var i, w;

		for ( i = 0; i < RAIN.walls.length; i += 1 ) {
			w = RAIN.walls[ i ];
			if ( w.x === x && w.y === y ) {
				return true;
			}
		}
		return false;
	},

	//---------------------------------------------------------
	// HOLE
	//---------------------------------------------------------

	drawHole : function () {
		"use strict";
		var x, y;

		for ( x = 0; x < RAIN.holeSize; x += 1 ) {
			for ( y = 0; y < RAIN.holeSize; y += 1 ) {
				PS.color( RAIN.holeX + x, RAIN.holeY + y, RAIN.HOLE_COLOR );
			}
		}
	},

	inHole : function ( x, y ) {
		"use strict";

		return (
			x >= RAIN.holeX &&
			x < RAIN.holeX + RAIN.holeSize &&
			y >= RAIN.holeY &&
			y < RAIN.holeY + RAIN.holeSize
		);
	},

	//---------------------------------------------------------
	// RESET
	//---------------------------------------------------------

	reset : function () {
		"use strict";

		RAIN.dropActive = false;
		RAIN.won = false;
		RAIN.showWinScreen = false;

		RAIN.loadLevel();

		PS.statusText( "Level " + (RAIN.level + 1) + " - Tap to shoot" );
	},

	//---------------------------------------------------------
	// NEXT LEVEL
	//---------------------------------------------------------

	nextLevel : function () {
		"use strict";

		RAIN.level += 1;

		if ( RAIN.level > 2 ) {
			RAIN.level = 0;
		}

		RAIN.reset();
	},

	//---------------------------------------------------------
	// GAME LOOP
	//---------------------------------------------------------

	tick : function () {
		"use strict";

		var x, y, vx, vy, nx, ny;

		if ( !RAIN.dropActive || RAIN.won || RAIN.showWinScreen ) {
			return;
		}

		x = RAIN.dropX;
		y = RAIN.dropY;
		vx = RAIN.dropVX;
		vy = RAIN.dropVY;

		PS.color( x, y, RAIN.BG_COLOR );

		// momentum loss
		vx *= RAIN.friction;
		vy *= RAIN.friction;

		// stop if slow
		if ( Math.abs( vx ) < 0.05 && Math.abs( vy ) < 0.05 ) {
			RAIN.dropActive = false;
			return;
		}

		nx = Math.round( x + vx );
		ny = Math.round( y + vy );

		// bounce walls
		if ( RAIN.isWall( nx, y ) ) {
			vx = -vx;
		}
		else {
			x += vx;
		}

		if ( RAIN.isWall( x, ny ) ) {
			vy = -vy;
		}
		else {
			y += vy;
		}

		RAIN.dropX = Math.round( x );
		RAIN.dropY = Math.round( y );
		RAIN.dropVX = vx;
		RAIN.dropVY = vy;

		if ( RAIN.inHole( RAIN.dropX, RAIN.dropY ) ) {
			RAIN.won = true;
			RAIN.showWinScreen = true;

			PS.statusText( "Level Complete! Press SPACE" );
			PS.audioPlay( "fx_tada" );
			return;
		}

		PS.color( RAIN.dropX, RAIN.dropY, RAIN.DROP_COLOR );
	}
};

//---------------------------------------------------------
// INIT
//---------------------------------------------------------

PS.init = function () {
	"use strict";

	PS.gridSize( RAIN.GRID_WIDTH, RAIN.GRID_HEIGHT );
	PS.gridColor( RAIN.BG_COLOR );
	PS.border( PS.ALL, PS.ALL, 0 );
	PS.color( PS.ALL, PS.ALL, RAIN.BG_COLOR );

	PS.audioLoad( "fx_drip1", { lock : true } );
	PS.audioLoad( "fx_tada", { lock : true } );

	RAIN.loadLevel();

	PS.statusText( "Level 1 - Tap to shoot" );

	PS.timerStart( RAIN.FRAME_RATE, RAIN.tick );
};

//---------------------------------------------------------
// INPUT
//---------------------------------------------------------

PS.touch = function ( x, y ) {
	"use strict";

	if ( RAIN.dropActive || RAIN.showWinScreen ) {
		return;
	}

	RAIN.dropActive = true;
	RAIN.dropX = x;
	RAIN.dropY = y;

	RAIN.dropVX = ( RAIN.holeX - x ) * 0.08;
	RAIN.dropVY = ( RAIN.holeY - y ) * 0.08;

	PS.color( x, y, RAIN.DROP_COLOR );
	PS.audioPlay( "fx_drip1" );
};

PS.keyDown = function ( key ) {
	"use strict";

	if ( key === PS.KEY_SPACE && RAIN.showWinScreen ) {
		RAIN.nextLevel();
	}
};
