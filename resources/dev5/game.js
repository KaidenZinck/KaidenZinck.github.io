// MiniGolf Prototype – Enclosed Course + True Tile Collision + Momentum

/*jslint nomen: true, white: true */
/*global PS */

var RAIN = {

	//-----------------------------------------
	// GRID + COLORS
	//-----------------------------------------

	GRID_WIDTH: 24,
	GRID_HEIGHT: 24,
	FRAME_RATE: 6,

	BG_COLOR: PS.COLOR_GREEN,
	WALL_COLOR: PS.COLOR_GRAY,
	HOLE_COLOR: PS.COLOR_BLACK,
	BALL_COLOR: PS.COLOR_WHITE,

	//-----------------------------------------
	// PHYSICS
	//-----------------------------------------

	friction: 0.985,

	//-----------------------------------------
	// BALL STATE
	//-----------------------------------------

	ballActive: false,
	ballX: 0,
	ballY: 0,
	ballVX: 0,
	ballVY: 0,

	//-----------------------------------------
	// COURSE
	//-----------------------------------------

	walls: [],
	holeX: 0,
	holeY: 0,
	holeSize: 2,

	won: false,

	//-----------------------------------------
	// WALL HELPERS
	//-----------------------------------------

	addWall : function ( x, y ) {
		"use strict";
		RAIN.walls.push( { x: x, y: y } );
	},

	addWallRect : function ( x, y, w, h ) {
		"use strict";
		var i, j;

		for ( i = 0; i < w; i += 1 ) {
			for ( j = 0; j < h; j += 1 ) {
				RAIN.addWall( x + i, y + j );
			}
		}
	},

	isWall : function ( x, y ) {
		"use strict";
		var i, w;

		for ( i = 0; i < RAIN.walls.length; i += 1 ) {
			w = RAIN.walls[i];
			if ( w.x === x && w.y === y ) {
				return true;
			}
		}
		return false;
	},

	drawWalls : function () {
		"use strict";
		var i, w;

		for ( i = 0; i < RAIN.walls.length; i += 1 ) {
			w = RAIN.walls[i];
			PS.color( w.x, w.y, RAIN.WALL_COLOR );
		}
	},

	//-----------------------------------------
	// HOLE
	//-----------------------------------------

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

	//-----------------------------------------
	// LEVEL LAYOUT
	//-----------------------------------------

	loadLevel : function () {
		"use strict";
		var i;

		RAIN.walls = [];
		PS.color( PS.ALL, PS.ALL, RAIN.BG_COLOR );

		//---------------------------------
		// OUTER BORDER (No Escape)
		//---------------------------------

		for ( i = 0; i < RAIN.GRID_WIDTH; i += 1 ) {
			RAIN.addWall( i, 0 );
			RAIN.addWall( i, RAIN.GRID_HEIGHT - 1 );
		}

		for ( i = 0; i < RAIN.GRID_HEIGHT; i += 1 ) {
			RAIN.addWall( 0, i );
			RAIN.addWall( RAIN.GRID_WIDTH - 1, i );
		}

		//---------------------------------
		// COURSE SHAPE (Grey Layout)
		//---------------------------------

		// Top horizontal
		RAIN.addWallRect( 4, 6, 14, 1 );

		// Left vertical
		RAIN.addWallRect( 4, 6, 1, 13 );

		// Middle bar
		RAIN.addWallRect( 9, 12, 8, 1 );

		//---------------------------------
		// HOLE INSIDE COURSE
		//---------------------------------

		RAIN.holeX = 14;
		RAIN.holeY = 16;

		RAIN.drawWalls();
		RAIN.drawHole();
	},

	//-----------------------------------------
	// RESET
	//-----------------------------------------

	reset : function () {
		"use strict";

		RAIN.ballActive = false;
		RAIN.won = false;

		RAIN.loadLevel();

		PS.statusText( "Tap anywhere to shoot" );
	},

	//-----------------------------------------
	// GAME LOOP
	//-----------------------------------------

	tick : function () {
		"use strict";

		var x, y, vx, vy, nx, ny;

		if ( !RAIN.ballActive || RAIN.won ) {
			return;
		}

		x = RAIN.ballX;
		y = RAIN.ballY;
		vx = RAIN.ballVX;
		vy = RAIN.ballVY;

		PS.color( x, y, RAIN.BG_COLOR );

		// friction
		vx *= RAIN.friction;
		vy *= RAIN.friction;

		if ( Math.abs( vx ) < 0.02 && Math.abs( vy ) < 0.02 ) {
			RAIN.ballActive = false;
			return;
		}

		nx = Math.round( x + vx );
		ny = Math.round( y + vy );

		// wall bounce X
		if ( RAIN.isWall( nx, y ) ) {
			vx = -vx;
		}
		else {
			x += vx;
		}

		// wall bounce Y
		if ( RAIN.isWall( x, ny ) ) {
			vy = -vy;
		}
		else {
			y += vy;
		}

		RAIN.ballX = Math.round( x );
		RAIN.ballY = Math.round( y );
		RAIN.ballVX = vx;
		RAIN.ballVY = vy;

		if ( RAIN.inHole( RAIN.ballX, RAIN.ballY ) ) {
			RAIN.won = true;
			PS.statusText( "Nice Shot! Press SPACE to reset" );
			PS.audioPlay( "fx_tada" );
			return;
		}

		PS.color( RAIN.ballX, RAIN.ballY, RAIN.BALL_COLOR );
	}
};

//-----------------------------------------
// INIT
//-----------------------------------------

PS.init = function () {
	"use strict";

	PS.gridSize( RAIN.GRID_WIDTH, RAIN.GRID_HEIGHT );
	PS.gridColor( RAIN.BG_COLOR );
	PS.border( PS.ALL, PS.ALL, 0 );
	PS.color( PS.ALL, PS.ALL, RAIN.BG_COLOR );

	PS.audioLoad( "fx_drip1", { lock: true } );
	PS.audioLoad( "fx_tada", { lock: true } );

	RAIN.loadLevel();

	PS.statusText( "Tap anywhere to shoot" );

	PS.timerStart( RAIN.FRAME_RATE, RAIN.tick );
};

//-----------------------------------------
// INPUT
//-----------------------------------------

PS.touch = function ( x, y ) {
	"use strict";

	if ( RAIN.ballActive || RAIN.won ) {
		return;
	}

	RAIN.ballActive = true;
	RAIN.ballX = x;
	RAIN.ballY = y;

	// Shoot toward hole slightly
	RAIN.ballVX = ( RAIN.holeX - x ) * 0.07;
	RAIN.ballVY = ( RAIN.holeY - y ) * 0.07;

	PS.color( x, y, RAIN.BALL_COLOR );
	PS.audioPlay( "fx_drip1" );
};

PS.keyDown = function ( key ) {
	"use strict";

	if ( key === PS.KEY_SPACE ) {
		RAIN.reset();
	}
};
