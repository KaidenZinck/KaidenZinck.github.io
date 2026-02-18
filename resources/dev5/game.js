// MiniGolf – Multi Level + Hole Safety Zone + Fixed Shot Direction

/*global PS */

var RAIN = {

GRID_WIDTH: 24,
GRID_HEIGHT: 24,
FRAME_RATE: 6,

BG_COLOR: PS.COLOR_GREEN,
WALL_COLOR: PS.COLOR_GRAY,
HOLE_COLOR: PS.COLOR_BLACK,
BALL_COLOR: PS.COLOR_WHITE,

friction: 0.985,
shotPower: 1.4,

ballActive:false,
ballX:0,
ballY:0,
ballVX:0,
ballVY:0,

walls:[],
holeX:18,
holeY:18,
holeSize:2,

holeSafeRadius:3,

won:false,
level:0,

//---------------- WALLS ----------------

addWall:function(x,y){
RAIN.walls.push({x:x,y:y});
},

addWallRect:function(x,y,w,h){
var i,j;
for(i=0;i<w;i++){
for(j=0;j<h;j++){
RAIN.addWall(x+i,y+j);
}
}
},

isWall:function(x,y){
var i,w;
for(i=0;i<RAIN.walls.length;i++){
w=RAIN.walls[i];
if(w.x===x && w.y===y) return true;
}
return false;
},

drawWalls:function(){
var i,w;
for(i=0;i<RAIN.walls.length;i++){
w=RAIN.walls[i];
PS.color(w.x,w.y,RAIN.WALL_COLOR);
}
},

//---------------- HOLE ----------------

drawHole:function(){
var x,y;
for(x=0;x<RAIN.holeSize;x++){
for(y=0;y<RAIN.holeSize;y++){
PS.color(RAIN.holeX+x,RAIN.holeY+y,RAIN.HOLE_COLOR);
}
}
},

inHole:function(x,y){
return(
x>=RAIN.holeX &&
x<RAIN.holeX+RAIN.holeSize &&
y>=RAIN.holeY &&
y<RAIN.holeY+RAIN.holeSize
);
},

inHoleSafeZone:function(x,y){
var cx = RAIN.holeX + 1;
var cy = RAIN.holeY + 1;
var dx = x - cx;
var dy = y - cy;
return Math.sqrt(dx*dx+dy*dy) < RAIN.holeSafeRadius;
},

//---------------- LEVELS ----------------

loadLevel:function(){

var i;
RAIN.walls=[];
PS.color(PS.ALL,PS.ALL,RAIN.BG_COLOR);

// Border always
for(i=0;i<RAIN.GRID_WIDTH;i++){
RAIN.addWall(i,0);
RAIN.addWall(i,RAIN.GRID_HEIGHT-1);
}
for(i=0;i<RAIN.GRID_HEIGHT;i++){
RAIN.addWall(0,i);
RAIN.addWall(RAIN.GRID_WIDTH-1,i);
}

// -------- LEVEL 1 --------
if(RAIN.level===0){

RAIN.addWallRect(4,6,14,1);
RAIN.addWallRect(4,6,1,13);
RAIN.addWallRect(9,12,8,1);

RAIN.holeX=17;
RAIN.holeY=16;
}

// -------- LEVEL 2 --------
if(RAIN.level===1){

RAIN.addWallRect(3,5,16,1);
RAIN.addWallRect(3,5,1,15);
RAIN.addWallRect(3,19,16,1);
RAIN.addWallRect(18,5,1,15);

RAIN.addWallRect(6,10,10,1);

RAIN.holeX=16;
RAIN.holeY=17;
}

// -------- LEVEL 3 --------
if(RAIN.level===2){

RAIN.addWallRect(3,3,18,1);
RAIN.addWallRect(3,3,1,18);
RAIN.addWallRect(3,20,18,1);
RAIN.addWallRect(20,3,1,18);

RAIN.addWallRect(6,6,10,1);
RAIN.addWallRect(6,6,1,10);
RAIN.addWallRect(10,12,8,1);

RAIN.holeX=18;
RAIN.holeY=18;
}

RAIN.drawWalls();
RAIN.drawHole();
},

//---------------- RESET ----------------

reset:function(){
RAIN.ballActive=false;
RAIN.won=false;
RAIN.loadLevel();
PS.statusText("Level "+(RAIN.level+1)+" - Tap to place ball");
},

//---------------- ERASE SAFE ----------------

eraseBall:function(x,y){
if(!RAIN.isWall(x,y) && !RAIN.inHole(x,y)){
PS.color(x,y,RAIN.BG_COLOR);
}
},

//---------------- GAME LOOP ----------------

tick:function(){

var x,y,vx,vy;
var steps,stepX,stepY,i;

if(!RAIN.ballActive || RAIN.won) return;

x=RAIN.ballX;
y=RAIN.ballY;
vx=RAIN.ballVX;
vy=RAIN.ballVY;

RAIN.eraseBall(x,y);

vx*=RAIN.friction;
vy*=RAIN.friction;

if(Math.abs(vx)<0.02 && Math.abs(vy)<0.02){
RAIN.ballActive=false;
return;
}

steps=Math.ceil(Math.max(Math.abs(vx),Math.abs(vy)));
stepX=vx/steps;
stepY=vy/steps;

for(i=0;i<steps;i++){

if(!RAIN.isWall(Math.round(x+stepX),Math.round(y))){
x+=stepX;
}else{
vx=-vx;
}

if(!RAIN.isWall(Math.round(x),Math.round(y+stepY))){
y+=stepY;
}else{
vy=-vy;
}
}

RAIN.ballX=Math.round(x);
RAIN.ballY=Math.round(y);
RAIN.ballVX=vx;
RAIN.ballVY=vy;

if(RAIN.inHole(RAIN.ballX,RAIN.ballY)){
RAIN.won=true;
PS.statusText("Hole Complete!");

PS.timerStart(60,function(){
RAIN.level++;
if(RAIN.level>2) RAIN.level=0;
RAIN.reset();
});

return;
}

PS.color(RAIN.ballX,RAIN.ballY,RAIN.BALL_COLOR);
}

};

//---------------- INIT ----------------

PS.init=function(){

PS.gridSize(RAIN.GRID_WIDTH,RAIN.GRID_HEIGHT);
PS.gridColor(RAIN.BG_COLOR);
PS.border(PS.ALL,PS.ALL,0);
PS.color(PS.ALL,PS.ALL,RAIN.BG_COLOR);

RAIN.reset();

PS.timerStart(RAIN.FRAME_RATE,RAIN.tick);
};

//---------------- INPUT ----------------

PS.touch=function(x,y){

if(RAIN.ballActive || RAIN.won) return;

// Prevent spawn near hole
if(RAIN.inHoleSafeZone(x,y)) return;

RAIN.ballActive=true;
RAIN.ballX=x;
RAIN.ballY=y;

// ALWAYS diagonal down right
RAIN.ballVX=RAIN.shotPower;
RAIN.ballVY=RAIN.shotPower;
};

PS.keyDown=function(key){
if(key===PS.KEY_SPACE){
RAIN.reset();
}
};
