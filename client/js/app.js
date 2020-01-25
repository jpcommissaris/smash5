let playerName;
let playerNameInput = document.getElementById('playerNameInput');
const MAX_CONNS = 8; 

let socket;
socket = io();

let canv = document.getElementById('cvs');
let ctx = canv.getContext('2d');
ctx.font = '28px Arial'; 

canv.width = window.innerWidth;
canv.height = window.innerHeight;

let players = [];
let RigidBodies = [];




function drawStage(){
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height);
    RigidBodies.forEach(body =>{
        ctx.fillStyle = body.color
        ctx.fillRect(body.x, body.y, body.width, body.height); 
    })

}

function gameloop() {
    socket.on('data', (data) => {
        players = data;
        handleGraphics(); 
    }); 
}

function handleGraphics() {
    drawStage();
    players.forEach((p1) => {
        ctx.fillStyle = 'red';
        ctx.fillRect(p1.xPos, p1.yPos, 20, 20);
    })
}



// -- menu screen and setup -- 

function startGame() {
    playerName = playerNameInput.value.replace(/(<([^>]+)>)/ig, '');
    document.getElementById('gameAreaWrapper').style.display = 'block';
    document.getElementById('startMenuWrapper').style.display = 'none';
    // add player, draw stage
    socket.emit('addplayer', {playerName: playerName}); //sends json
    socket.on('stage', (data) => {
        console.log(data)
        RigidBodies = data;
        drawStage();
    })
    
    gameloop();     
    
}

// check if nick is valid alphanumeric characters (and underscores)
function validNick() {
    var regex = /^\w*$/;
    console.log('Regex Test', regex.exec(playerNameInput.value));
    return regex.exec(playerNameInput.value) !== null;
}

window.onload = function() {
    'use strict';
    var btn = document.getElementById('startButton'),
        nickErrorText = document.querySelector('#startMenu .input-error');
    btn.onclick = function () {
        // check if the nick is valid
        if (validNick()) {
            startGame();
            //highscore button?
        } else {
            nickErrorText.style.display = 'inline';
        }
    };
    playerNameInput.addEventListener('keypress', (e) => {
        var key = e.which || e.keyCode;
        if (key === 13) {
            if (validNick()) {
                startGame();
            } else {
                nickErrorText.style.display = 'inline';
            }
        }
    });
};




// -- event listeners --

window.addEventListener('resize', () => {
    canv.width = window.innerWidth;
    canv.height = window.innerHeight;
    size = canv.width/(tc[0]+2)
    sizeH = canv.height/(tc[1]+2)
    gameRect = [size, size, size*tc[0], size*tc[1]];
    drawStage()
}, true);







