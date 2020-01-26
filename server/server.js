//https://socket.io/docs/emit-cheatsheet/

const express = require('express');
const app     = express();
const http    = require('http').Server(app);
const io  = require('socket.io')(http);
const config  = require('./config.json');
const MAX_CONNS = 4; 

const Rigidbodies = []; 
const players = [null, null, null, null];
let clients = 0; 

const playerSize = 40;

class RigidBody {
  constructor(type = 'mf', color = 'white', num = 0){
      //type
      if(type === 'mf'){
        this.create(0,600,900,100, false, false, false);
      }
      else if(type === 'pf'){
        this.create(num*100-(num%4)*25, 300+(num%3)*100, 100, 10, false, false, false);
      }
      
      //style
      this.color = color
  }

  create(x,y,w,h,b1,b2,b3){
    //position
    this.x = x; 
    this.y = y;
    this.width = w;
    this.height = h;
    // mechanics
    this.fallThrough=b1;
    this.jumpThrough=b2;
    this.invisible=b3;
  }

}

class Player {
  constructor(xPos, yPos, xVelocity, yVelocity, name, id){
      this.xPos = xPos;
      this.yPos = yPos;
      this.xVelocity = xVelocity;
      this.yVelocity = yVelocity;
      this.name = name;
      this.id = id; 
      this.jump = 0;
      this.grounded = false; 
  }
  moveX() {
      this.xPos += this.xVelocity;
  }
  moveY(){
    this.yPos += this.yVelocity;
    this.yVelocity += 0.2
  }
  moveLeft() {
      this.xPos -= this.xVelocity;
  }
  jump1() {
    if(this.jump > 0){
      this.yVelocity -= this.jump
      this.jump -= 1
    }
  }
}

function createPlayer(name, id) {
  p1 = new Player(50 + (clients*200), 500, 0, 1, name, id);
  return p1;
}

function createMap(){
  f1 = new RigidBody('mf', 'white');
  Rigidbodies.push(f1);
  for(let i = 1; i < 9; i++){
    Rigidbodies.push(new RigidBody('pf', 'green', i));
  }
  
}
function checkCollisionTop(player){
  let b = false
  Rigidbodies.forEach(platform => {
    let moved = player.yPos + player.yVelocity; 
    if(lineInt(player.xPos, moved, player.xPos, moved + playerSize, 
      platform.x, platform.y, platform.x+platform.width, platform.y)){
      b = true; 
      return; 
    } 
    if(lineInt(player.xPos+playerSize, moved, player.xPos+playerSize, moved + playerSize, 
      platform.x, platform.y, platform.x+platform.width, platform.y)){
      b = true;
      return;
    } 
  });
  player.grounded = b; 
  return b; 
}


setInterval(handleLogic, 1000/30);
function handleLogic() {
  players.forEach(player => {
    if(player){
      if(!checkCollisionTop(player)){
        player.moveY();
      }

      player.moveX();
      player.jump1();
      
    }
  })
  io.emit('data', players);

}
//setup server
app.use(express.static(__dirname + '/../client'));

const serverPort = process.env.PORT || config.port;
http.listen(serverPort, () => {
  console.log("Server is listening on port " + serverPort);
  createMap();
});


io.on('connection', (socket) => {
  console.log('New connection with id ' + socket.id)
  socket.on('addplayer', addPlayer); 
  socket.on('update', update);
  socket.on('disconnect', disconnect)
});

//adds info to player 
function addPlayer(data){
  this.emit('stage', Rigidbodies)
  for(let i = 0; i < MAX_CONNS; i++){
    if(players[i] === null){
      console.log('User joined game'); 
      players[i] = createPlayer(data.playerName, this.id);
      this.emit('pn', i);
      clients++;
      break;
    }
  }
}

//disconnect a player
function disconnect(){
  for(let i = 0; i < players.length; i++){
    if(players[i]){
      //console.log('client', client.id, this.id); 
      if(players[i].id === this.id){ 
        console.log('A user disconnected with id: ', players[i].id);
        players[i] = null;
        clients--; 
        break; 
      }
    }
  } 
  //console.log(players)
}; 


function update(data) {
  players[data.pn].xVelocity = data.vx
  //players[data.pn].yVelocity = data.vy
  players[data.pn].jump = data.jump
  io.emit('data', players);
}

// returns true iff the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
function lineInt(a,b,c,d,p,q,r,s) {
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }
};







