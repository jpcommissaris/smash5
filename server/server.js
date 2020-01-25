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
  constructor(xPos, yPos, xVelocity, yVelocity, name, id, jump){
      this.xPos = xPos;
      this.yPos = yPos;
      this.xVelocity = xVelocity;
      this.yVelocity = yVelocity;
      this.name = name;
      this.id = id; 
      this.jump = jump;
  }
  move() {
      this.xPos += this.xVelocity;
      this.yPos += this.yVelocity;
      this.yVelocity += 0.2
  }
  jump1() {
    if(this.jump > 0){
      this.yVelocity -= 3
      this.jump -= 1
    }
  }
}

function createPlayer(name, id) {
  p1 = new Player(20, 20, 0, 1, name, id, 0);
  return p1;
}

function createMap(){
  f1 = new RigidBody('mf', 'white')
  Rigidbodies.push(f1);
}

function checkCollision(player){

}

setInterval(handleLogic, 1000/30);
function handleLogic() {
  players.forEach(player => {
    if(player){
      player.move();
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
  players[data.pn].jump = data.jump
  console.log(data.jump)
  io.emit('data', players);
}








