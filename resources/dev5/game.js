// MiniGolf – Fixed Diagonal Shot + Level Progression + Safe Hole Zone

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
	shotVX: 1.2,
	shotVY: 1.2,

	//-----------------------------------------
	// BALL
	//-----------------------------------------

	ballActive: false,
	ballX: 0,
	ballY: 0,
	ballVX: 0,
	ballVY: 0,

	//-----------------------------------------
	// LEVEL
	//-----------------------------------------

	level: 0,
	walls: [],
	holeX: 0,
	holeY: 0,
	holeSize: 2,
	holeBuffer: 3,

	transitioning: false, // ⭐ NEW FIX

	//-----------------------------------------
	// WALL HELPERS
	//-----------------------------------------

	addWall : function (x,y) {
		RAIN.walls.push({x:x,y:y});
	},

	addWallRect : function (x,y,w,h) {
		var i,j;
		for (i=0;i<w;i++) {
			for (j=0;j<h;j++) {
				RAIN.addWall(x+i,y+j);
			}
		}
	},

	isWall : function (x,y) {
		var i,w;
		for (i=0;i<RAIN.walls.length;i++) {
			w = RAIN.walls[i];
			if (w.x === x && w.y === y) return true;
		}
		return false;
	},

	drawWalls : function () {
		var i,w;
		for (i=0;i<RAIN.walls.length;i++) {
			w = RAIN.walls[i];
			PS.color(w.x,w.y,RAIN.WALL_COLOR);
		}
	},

	//-----------------------------------------
	// HOLE
	//-----------------------------------------

	drawHole : function () {
		var x,y;
		for (x=0;x<RAIN.holeSize;x++) {
			for (y=0;y<RAIN.holeSize;y++) {
				PS.color(RAIN.holeX+x,RAIN.holeY+y,RAIN.HOLE_COLOR);
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

	inHoleBuffer : function (x,y) {
		return (
			x >= RAIN.holeX - RAIN.holeBuffer &&
			x <= RAIN.holeX + RAIN.holeSize + RAIN.holeBuffer &&
			y >= RAIN.holeY - RAIN.holeBuffer &&
			y <= RAIN.holeY + RAIN.holeSize + RAIN.holeBuffer
		);
	},

	//-----------------------------------------
	// LEVEL DATA
	//-----------------------------------------

	loadLevel : function () {

		var i;

		RAIN.walls = [];
		RAIN.transitioning = false; // ⭐ reset transition lock
		PS.color(PS.ALL,PS.ALL,RAIN.BG_COLOR);

		for (i=0;i<RAIN.GRID_WIDTH;i++) {
			RAIN.addWall(i,0);
			RAIN.addWall(i,RAIN.GRID_HEIGHT-1);
		}
		for (i=0;i<RAIN.GRID_HEIGHT;i++) {
			RAIN.addWall(0,i);
			RAIN.addWall(RAIN.GRID_WIDTH-1,i);
		}

		if (RAIN.level === 0) {

			RAIN.addWallRect(4,6,14,1);
			RAIN.addWallRect(4,6,1,13);
			RAIN.addWallRect(9,12,8,1);

			RAIN.holeX = 14;
			RAIN.holeY = 16;
		}
		else {

			RAIN.addWallRect(3,4,18,1);
			RAIN.addWallRect(3,4,1,16);
			RAIN.addWallRect(3,19,18,1);
			RAIN.addWallRect(20,4,1,16);

			RAIN.addWallRect(8,10,8,1);
			RAIN.addWallRect(12,10,1,6);

			RAIN.holeX = 17;
			RAIN.holeY = 6;
		}

		RAIN.drawWalls();
		RAIN.drawHole();
		PS.statusText("Level " + (RAIN.level+1) + " – Tap to shoot");
	},

	//-----------------------------------------
	// RESET
	//-----------------------------------------

	resetBall : function () {
		RAIN.ballActive = false;
	},

	nextLevel : function () {
		RAIN.level = (RAIN.level + 1) % 2;
		RAIN.resetBall();
		RAIN.loadLevel();
	},

	//-----------------------------------------
	// SAFE ERASE
	//-----------------------------------------

	eraseBall : function (x,y) {
		if (!RAIN.isWall(x,y) && !RAIN.inHole(x,y)) {
			PS.color(x,y,RAIN.BG_COLOR);
		}
	},

	//-----------------------------------------
	// GAME LOOP
	//-----------------------------------------

	tick : function () {

		var x,y,vx,vy,steps,stepX,stepY,i;

		if (!RAIN.ballActive) return;
		if (RAIN.transitioning) return; // ⭐ prevent repeat triggers

		x = RAIN.ballX;
		y = RAIN.ballY;
		vx = RAIN.ballVX;
		vy = RAIN.ballVY;

		RAIN.eraseBall(x,y);

		vx *= RAIN.friction;
		vy *= RAIN.friction;

		if (Math.abs(vx) < 0.02 && Math.abs(vy) < 0.02) {
			RAIN.ballActive = false;
			return;
		}

		steps = Math.ceil(Math.max(Math.abs(vx),Math.abs(vy)));
		stepX = vx / steps;
		stepY = vy / steps;

		for (i=0;i<steps;i++) {

			if (!RAIN.isWall(Math.round(x+stepX),Math.round(y))) {
				x += stepX;
			} else {
				vx = -vx;
				break;
			}

			if (!RAIN.isWall(Math.round(x),Math.round(y+stepY))) {
				y += stepY;
			} else {
				vy = -vy;
				break;
			}
		}

		RAIN.ballX = Math.round(x);
		RAIN.ballY = Math.round(y);
		RAIN.ballVX = vx;
		RAIN.ballVY = vy;

		if (RAIN.inHole(RAIN.ballX,RAIN.ballY)) {

			RAIN.transitioning = true; // ⭐ lock transition
			RAIN.ballActive = false;

			PS.audioPlay("fx_tada");

			PS.timerStart(30, function () {
				RAIN.nextLevel();
			});

			return;
		}

		PS.color(RAIN.ballX,RAIN.ballY,RAIN.BALL_COLOR);
	}
};

//-----------------------------------------
// INIT
//-----------------------------------------

PS.init = function () {

	PS.gridSize(RAIN.GRID_WIDTH,RAIN.GRID_HEIGHT);
	PS.gridColor(RAIN.BG_COLOR);
	PS.border(PS.ALL,PS.ALL,0);

	PS.audioLoad("fx_drip1",{lock:true});
	PS.audioLoad("fx_tada",{lock:true});

	RAIN.loadLevel();
	PS.timerStart(RAIN.FRAME_RATE,RAIN.tick);
};

//-----------------------------------------
// INPUT
//-----------------------------------------

PS.touch = function (x,y) {

	if (RAIN.ballActive) return;
	if (RAIN.isWall(x,y)) return;
	if (RAIN.inHoleBuffer(x,y)) return;

	RAIN.ballActive = true;
	RAIN.ballX = x;
	RAIN.ballY = y;

	RAIN.ballVX = RAIN.shotVX;
	RAIN.ballVY = RAIN.shotVY;

	PS.audioPlay("fx_drip1");
};
