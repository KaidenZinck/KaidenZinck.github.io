// Simple Rain Toy – Endless Random Drops
// Drops move in all directions, never disappear, random colors

/*jslint nomen: true, white: true */
/*global PS */

var RAIN = {

	// CONSTANTS
	GRID_WIDTH: 24,
	GRID_HEIGHT: 24,
	FRAME_RATE: 6,
	BG_COLOR: PS.COLOR_WHITE,

	// VARIABLES
	dropsX: [],
	dropsY: [],
	dropsVX: [],
	dropsVY: [],
	dropsColor: [],

	// FUNCTIONS
	tick : function () {
		"use strict";
		var i, len, x, y, vx, vy, color;

		len = RAIN.dropsX.length;
		i = 0;

		while ( i < len ) {

			x = RAIN.dropsX[i];
			y = RAIN.dropsY[i];
			vx = RAIN.dropsVX[i];
			vy = RAIN.dropsVY[i];
			color = RAIN.dropsColor[i];

			// erase old position
			PS.color( x, y, RAIN.BG_COLOR );

			// move
			x += vx;
			y += vy;

			// bounce off walls
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

			// store updates
			RAIN.dropsX[i] = x;
			RAIN.dropsY[i] = y;
			RAIN.dropsVX[i] = vx;
			RAIN.dropsVY[i] = vy;

			// redraw
			PS.color( x, y, color );

			i += 1;
		}
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

	PS.statusColor( PS.COLOR_BLACK );
	PS.statusText( "Random Endless Rain" );

	PS.timerStart( RAIN.FRAME_RATE, RAIN.tick );
};

// TOUCH – create a new random-colored drop
PS.touch = function( x, y, data, options ) {
	"use strict";
	var vx, vy, color;

	// random direction
	vx = ( PS.random( 2 ) === 1 ) ? -1 : 1;
	vy = ( PS.random( 2 ) === 1 ) ? -1 : 1;

	// random color
	color = PS.makeRGB(
		PS.random( 255 ),
		PS.random( 255 ),
		PS.random( 255 )
	);

	RAIN.dropsX.push( x );
	RAIN.dropsY.push( y );
	RAIN.dropsVX.push( vx );
	RAIN.dropsVY.push( vy );
	RAIN.dropsColor.push( color );

	PS.color( x, y, color );
	PS.audioPlay( "fx_drip1" );
};

// REQUIRED BUT UNUSED EVENTS
PS.release = function () { "use strict"; };
PS.enter = function () { "use strict"; };
PS.exit = function () { "use strict"; };
PS.exitGrid = function () { "use strict"; };
PS.keyDown = function () { "use strict"; };
PS.keyUp = function () { "use strict"; };
PS.swipe = function () { "use strict"; };
PS.input = function () { "use strict"; };
