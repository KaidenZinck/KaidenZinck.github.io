var RAIN = {

	// CONSTANTS
	GRID_WIDTH: 24,
	GRID_HEIGHT: 24,
	FRAME_RATE: 6,
	BG_COLOR: PS.COLOR_WHITE,

	// INPUT STATE
	altDown: false,

	// VARIABLES
	dropsX: [],
	dropsY: [],
	dropsVX: [],
	dropsVY: [],
	dropsColor: [],

	// DRAW FLAT OUTER BORDER
	drawOuterBorder : function () {
		"use strict";
		var x, y;

		PS.border( PS.ALL, PS.ALL, 0 );

		for ( x = 0; x < RAIN.GRID_WIDTH; x += 1 ) {
			PS.border( x, 0, { top: 1 } );
			PS.border( x, RAIN.GRID_HEIGHT - 1, { bottom: 1 } );
		}

		for ( y = 0; y < RAIN.GRID_HEIGHT; y += 1 ) {
			PS.border( 0, y, { left: 1 } );
			PS.border( RAIN.GRID_WIDTH - 1, y, { right: 1 } );
		}

		PS.borderColor( PS.ALL, PS.ALL, PS.COLOR_BLACK );
	},

	// ADD ONE DROP
	addDrop : function ( x, y ) {
		"use strict";
		var vx, vy, color;

		vx = ( PS.random( 2 ) === 1 ) ? -1 : 1;
		vy = ( PS.random( 2 ) === 1 ) ? -1 : 1;

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

	// MOVE DROPS
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

			PS.color( x, y, RAIN.BG_COLOR );

			x += vx;
			y += vy;

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

			RAIN.dropsX[i] = x;
			RAIN.dropsY[i] = y;
			RAIN.dropsVX[i] = vx;
			RAIN.dropsVY[i] = vy;

			PS.color( x, y, color );
			i += 1;
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
		PS.statusText( "Reset" );
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
	PS.statusText( "Click: 1 drop | Hold ALT: 3 drops" );

	PS.timerStart( RAIN.FRAME_RATE, RAIN.tick );
};

// CLICK HANDLER
PS.touch = function( x, y ) {
	"use strict";
	var i, count;

	count = RAIN.altDown ? 3 : 1;

	for ( i = 0; i < count; i += 1 ) {
		RAIN.addDrop( x, y );
	}

	PS.audioPlay( "fx_drip1" );
};

// KEY DOWN
PS.keyDown = function ( key ) {
	"use strict";

	if ( key === PS.KEY_ALT ) {
		RAIN.altDown = true;
	}
	else if ( key === PS.KEY_SPACE ) {
		RAIN.reset();
	}
};

// KEY UP
PS.keyUp = function ( key ) {
	"use strict";

	if ( key === PS.KEY_ALT ) {
		RAIN.altDown = false;
	}
};

// REQUIRED BUT UNUSED EVENTS
PS.release = function () { "use strict"; };
PS.enter = function () { "use strict"; };
PS.exit = function () { "use strict"; };
PS.exitGrid = function () { "use strict"; };
PS.swipe = function () { "use strict"; };
PS.input = function () { "use strict"; };
