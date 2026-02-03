
var RAIN = {

	// CONSTANTS
	GRID_WIDTH : 24,
	GRID_HEIGHT : 24,
	FRAME_RATE : 6,
	BG_COLOR : PS.COLOR_WHITE,

	// MODE STATE
	spreadOn : false,

	// VARIABLES
	dropsX : [],
	dropsY : [],
	dropsVX : [],
	dropsVY : [],
	dropsColor : [],

	// DRAW FLAT OUTER BORDER
	drawOuterBorder : function () {
		"use strict";
		var x, y;

		PS.border( PS.ALL, PS.ALL, 0 );

		for ( x = 0; x < RAIN.GRID_WIDTH; x += 1 ) {
			PS.border( x, 0, { top : 1 } );
			PS.border( x, RAIN.GRID_HEIGHT - 1, { bottom : 1 } );
		}

		for ( y = 0; y < RAIN.GRID_HEIGHT; y += 1 ) {
			PS.border( 0, y, { left : 1 } );
			PS.border( RAIN.GRID_WIDTH - 1, y, { right : 1 } );
		}

		PS.borderColor( PS.ALL, PS.ALL, PS.COLOR_BLACK );
	},

	// ADD DROP
	addDrop : function ( x, y, vx, vy ) {
		"use strict";
		var color;

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
	},

	// MOVE DROPS (WITH COLLISIONS)
	tick : function () {
		"use strict";
		var i, j, len;
		var x, y, vx, vy, color;

		len = RAIN.dropsX.length;

		for ( i = 0; i < len; i += 1 ) {

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

			// wall bounce
			if ( x < 0 ) {
				x = 0;
				vx = -vx;
				PS.audioPlay( "fx_silencer" );
			}
			else if ( x >= RAIN.GRID_WIDTH ) {
				x = RAIN.GRID_WIDTH - 1;
				vx = -vx;
				PS.audioPlay( "fx_silencer" );
			}

			if ( y < 0 ) {
				y = 0;
				vy = -vy;
				PS.audioPlay( "fx_silencer" );
			}
			else if ( y >= RAIN.GRID_HEIGHT ) {
				y = RAIN.GRID_HEIGHT - 1;
				vy = -vy;
				PS.audioPlay( "fx_silencer" );
			}

			// drop-to-drop collision
			for ( j = 0; j < len; j += 1 ) {
				if ( j !== i &&
					x === RAIN.dropsX[j] &&
					y === RAIN.dropsY[j] ) {

					vx = -vx;
					vy = -vy;
					RAIN.dropsVX[j] = -RAIN.dropsVX[j];
					RAIN.dropsVY[j] = -RAIN.dropsVY[j];

					PS.audioPlay( "fx_silencer" );
				}
			}

			// save updated state
			RAIN.dropsX[i] = x;
			RAIN.dropsY[i] = y;
			RAIN.dropsVX[i] = vx;
			RAIN.dropsVY[i] = vy;

			// draw new position
			PS.color( x, y, color );
		}
	},

	// RESET
	reset : function () {
		"use strict";

		RAIN.dropsX.length = 0;
		RAIN.dropsY.length = 0;
		RAIN.dropsVX.length = 0;
		RAIN.dropsVY.length = 0;
		RAIN.dropsColor.length = 0;

		PS.color( PS.ALL, PS.ALL, RAIN.BG_COLOR );
		RAIN.drawOuterBorder();
		PS.statusText( RAIN.spreadOn ? "Spread ON (T)" : "Spread OFF (T)" );
	}
};

// INIT
PS.init = function () {
	"use strict";

	PS.gridSize( RAIN.GRID_WIDTH, RAIN.GRID_HEIGHT );
	PS.gridColor( RAIN.BG_COLOR );
	PS.color( PS.ALL, PS.ALL, RAIN.BG_COLOR );

	RAIN.drawOuterBorder();

	PS.audioLoad( "fx_drip1", { lock : true } );
	PS.audioLoad( "fx_silencer", { lock : true } );

	PS.statusColor( PS.COLOR_BLACK );
	PS.statusText( "Spread OFF (press T)" );

	PS.timerStart( RAIN.FRAME_RATE, RAIN.tick );
};

// CLICK
PS.touch = function ( x, y ) {
	"use strict";
	var vx, vy;

	if ( RAIN.spreadOn ) {
		RAIN.addDrop( x, y, -1, 1 );
		RAIN.addDrop( x, y,  0, 1 );
		RAIN.addDrop( x, y,  1, 1 );
	}
	else {
		vx = ( PS.random( 2 ) === 1 ) ? -1 : 1;
		vy = ( PS.random( 2 ) === 1 ) ? -1 : 1;
		RAIN.addDrop( x, y, vx, vy );
	}

	PS.audioPlay( "fx_drip1" );
};

// KEY DOWN
PS.keyDown = function ( key ) {
	"use strict";

	if ( key === 84 ) { // T
		RAIN.spreadOn = !RAIN.spreadOn;
		PS.statusText( RAIN.spreadOn ? "Spread ON (T)" : "Spread OFF (T)" );
	}
	else if ( key === PS.KEY_SPACE ) {
		RAIN.reset();
	}
};

// REQUIRED BUT UNUSED EVENTS
PS.release = function () { "use strict"; };
PS.enter = function () { "use strict"; };
PS.exit = function () { "use strict"; };
PS.exitGrid = function () { "use strict"; };
PS.keyUp = function () { "use strict"; };
PS.swipe = function () { "use strict"; };
PS.input = function () { "use strict"; };
