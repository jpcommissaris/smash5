//https://socket.io/docs/emit-cheatsheet/

const express = require('express');
const app     = express();
const http    = require('http').Server(app);
const io  = require('socket.io')(http);
const config  = require('./config.json');
const MAX_CONNS = 8; 

const Rigidbodies = []; 
const players = [];


class RigidBody {
  constructor(type = 'mf', color = 'white'){
      //type
      if(type === 'mf'){
        this.create(100,600,900,100, false, false, false);
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
  constructor(xPos, yPos, xVelocity, yVelocity){
      this.xPos = xPos;
      this.yPos = yPos;
      this.xVelocity = xVelocity;
      this.yVelocity = yVelocity;
  }
  moveRight() {
      this.xPos += this.xVelocity;
  }
  moveLeft() {
      this.xPos -= this.xVelocity;
  }
  jump() {
      this.yPos 
  }
}

function createPlayer() {
  p1 = new Player(20, 20, 0, 1);
  players.push(p1);
}

function createMap(){
  f1 = new RigidBody('mf', 'white')
  Rigidbodies.push(f1);
}

function checkCollision(player){

}

setInterval(handleLogic, 1000/10);
function handleLogic() {
  players.forEach(player => {
    player.xPos += player.xVelocity;
    player.yPos += player.yVelocity;
  })
  update();

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
});

//adds info to player 
function addPlayer(data){
  this.emit('stage', Rigidbodies)
  console.log('User joined game'); 
  createPlayer();
}

function update(data) {
  io.emit('data', players);
}







