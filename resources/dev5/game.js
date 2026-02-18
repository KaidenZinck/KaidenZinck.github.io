// MiniGolf – Time-Based Momentum + Perfect Wall Collision

/*jslint nomen: true, white: true */
/*global PS */

var RAIN = {

	//-----------------------------------------
	// GRID
	//-----------------------------------------

	GRID_WIDTH: 24,
	GRID_HEIGHT: 24,
	FRAME_RATE: 6,

	//-----------------------------------------
	// COLORS
	//-----------------------------------------

	BG_COLOR: PS.COLOR_GREEN,
	WALL_COLOR: PS.COLOR_GRAY,
	HOLE_COLOR: PS.COLOR_BLACK,
	BALL_COLOR: PS.COLOR_WHITE,

	//-----------------------------------------
	// PHYSICS
	//-----------------------------------------

	friction: 0.985,
	shotPower: 1.4,

	//-----------------------------------------
	// BALL
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
	holeX: 14,
	holeY: 16,
	holeSize: 2,

	won: false,

	//-----------------------------------------
	// WALL HELPERS
	//-----------------------------------------

	addWall : function ( x, y ) {
		RAIN.walls.push({ x:x, y:y });
	},

	addWallRect : function ( x, y, w, h ) {
		var i, j;
		for ( i = 0; i < w; i++ ) {
			for ( j = 0; j < h; j++ ) {
				RAIN.addWall(x+i, y+j);
			}
		}
	},

	isWall : function ( x, y ) {
		var i, w;
		for ( i = 0; i < RAIN.walls.length; i++ ) {
			w = RAIN.walls[i];
			if ( w.x === x && w.y === y ) {
				return true;
			}
		}
		return false;
	},

	drawWalls : function () {
		var i, w;
		for ( i = 0; i < RAIN.walls.length; i++ ) {
			w = RAIN.walls[i];
			PS.color(w.x, w.y, RAIN.WALL_COLOR);
		}
	},

	//-----------------------------------------
	// HOLE
	//-----------------------------------------

	drawHole : function () {
		var x,y;
		for ( x=0; x<RAIN.holeSize; x++ ) {
			for ( y=0; y<RAIN.holeSize; y++ ) {
				PS.color(RAIN.holeX+x, RAIN.holeY+y, RAIN.HOLE_COLOR);
			}
		}
	},

	inHole : function (x,y) {
		return (
			x >= RAIN.holeX &&
			x < RAIN.holeX + RAIN.holeSize &&
			y >= RAIN.holeY &&
			y < RAIN.holeY + RAIN.holeSize
		);
	},

	//-----------------------------------------
	// LEVEL
	//-----------------------------------------

	loadLevel : function () {

		var i;

		RAIN.walls = [];
		PS.color(PS.ALL, PS.ALL, RAIN.BG_COLOR);

		// Outer border
		for ( i=0;i<RAIN.GRID_WIDTH;i++ ) {
			RAIN.addWall(i,0);
			RAIN.addWall(i,RAIN.GRID_HEIGHT-1);
		}
		for ( i=0;i<RAIN.GRID_HEIGHT;i++ ) {
			RAIN.addWall(0,i);
			RAIN.addWall(RAIN.GRID_WIDTH-1,i);
		}

		// Course shape (grey Γ + bar)
		RAIN.addWallRect(4,6,14,1);
		RAIN.addWallRect(4,6,1,13);
		RAIN.addWallRect(9,12,8,1);

		RAIN.drawWalls();
		RAIN.drawHole();
	},

	//-----------------------------------------
	// RESET
	//-----------------------------------------

	reset : function () {
		RAIN.ballActive = false;
		RAIN.won = false;
		RAIN.loadLevel();
		PS.statusText("Tap to shoot");
	},

	//-----------------------------------------
	// SAFE ERASE
	//-----------------------------------------

	eraseBall : function (x,y){
		if ( !RAIN.isWall(x,y) && !RAIN.inHole(x,y) ) {
			PS.color(x,y,RAIN.BG_COLOR);
		}
	},

	//-----------------------------------------
	// GAME LOOP
	//-----------------------------------------

	tick : function () {

		var x,y,vx,vy;
		var steps, stepX, stepY, i;

		if ( !RAIN.ballActive || RAIN.won ) return;

		x = RAIN.ballX;
		y = RAIN.ballY;
		vx = RAIN.ballVX;
		vy = RAIN.ballVY;

		RAIN.eraseBall(x,y);

		// friction = time based momentum loss
		vx *= RAIN.friction;
		vy *= RAIN.friction;

		if ( Math.abs(vx) < 0.02 && Math.abs(vy) < 0.02 ){
			RAIN.ballActive = false;
			return;
		}

		// Sub-step movement prevents wall skipping
		steps = Math.ceil(Math.max(Math.abs(vx),Math.abs(vy)));
		stepX = vx / steps;
		stepY = vy / steps;

		for ( i=0;i<steps;i++ ){

			if ( !RAIN.isWall(Math.round(x+stepX), Math.round(y)) ){
				x += stepX;
			}else{
				vx = -vx;
				break;
			}

			if ( !RAIN.isWall(Math.round(x), Math.round(y+stepY)) ){
				y += stepY;
			}else{
				vy = -vy;
				break;
			}
		}

		RAIN.ballX = Math.round(x);
		RAIN.ballY = Math.round(y);
		RAIN.ballVX = vx;
		RAIN.ballVY = vy;

		if ( RAIN.inHole(RAIN.ballX,RAIN.ballY) ){
			RAIN.won = true;
			PS.statusText("Nice Shot! Press SPACE");
			PS.audioPlay("fx_tada");
			return;
		}

		PS.color(RAIN.ballX,RAIN.ballY,RAIN.BALL_COLOR);
	}
};

//-----------------------------------------
// INIT
//-----------------------------------------

PS.init = function(){

	PS.gridSize(RAIN.GRID_WIDTH,RAIN.GRID_HEIGHT);
	PS.gridColor(RAIN.BG_COLOR);
	PS.border(PS.ALL,PS.ALL,0);
	PS.color(PS.ALL,PS.ALL,RAIN.BG_COLOR);

	PS.audioLoad("fx_drip1",{lock:true});
	PS.audioLoad("fx_tada",{lock:true});

	RAIN.loadLevel();

	PS.statusText("Tap to shoot");

	PS.timerStart(RAIN.FRAME_RATE,RAIN.tick);
};

//-----------------------------------------
// INPUT
//-----------------------------------------

PS.touch = function(x,y){

	var cx, cy, dx, dy, len;

	if (RAIN.ballActive || RAIN.won) return;

	RAIN.ballActive = true;

	// Shoot from center toward tap (constant power)
	cx = 12;
	cy = 12;

	dx = x - cx;
	dy = y - cy;

	len = Math.sqrt(dx*dx + dy*dy);
	if ( len === 0 ) len = 1;

	RAIN.ballX = cx;
	RAIN.ballY = cy;

	RAIN.ballVX = (dx/len) * RAIN.shotPower;
	RAIN.ballVY = (dy/len) * RAIN.shotPower;

	PS.audioPlay("fx_drip1");
};

PS.keyDown = function(key){
	if ( key === PS.KEY_SPACE ){
		RAIN.reset();
	}
};
