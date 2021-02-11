var WebSocketServer = new require('ws');

// подключённые клиенты
var clients = {};

var webSocketServer = new WebSocketServer.Server({
  port: parseInt( process.env["PORT"] || 5555 )
});
console.log( "started server",webSocketServer );
console.log( "OK! Hello world! Serving web sockets!" );

webSocketServer.on('connection', function(ws) {

  var id = Math.random();
  clients[id] = ws;
  console.log("новое соединение " + id);

  ws.on('close', function() {
    console.log('соединение закрыто ' + id);
    delete clients[id];
  });

});


function broadcast( ruka ) {
  // message is a string in form: "X,Y,Z,X2,Y2,Z2,...";
  var msg = "";
  
  // translate ruka to lines coords:
  
  //var x=ruka[0][0] % 50, y=ruka[0][1] % 50, z=0;
  var x=0,y=0,z=0;
  var yaw =0, pitch = 0;
  for (var i=1; i<ruka.length; i++) {
    var r = 5;
    yaw += ruka[i][0] * Math.PI / 180;
    pitch += ruka[i][1] * Math.PI / 180;
    
    var dx = r*Math.cos(yaw)*Math.cos(pitch);
    var dy = r*Math.sin(yaw)*Math.cos(pitch);
    var dz = r* Math.sin(pitch);
  //  console.log(dx,dy,dz);
    var nx = x + dx;
    var ny = y + dy;
    var nz = z + dz;
    var line = [x,y,z,nx,ny,nz].join(",");
    //console.log("arr=",[x,y,z,nx,ny,nz]);
    //console.log("line=",line);
    msg = msg + "\n" + line;
    x=nx;
    y=ny;
    z=nz;
  }

  for (var key in clients) {
    console.log("sending");
    clients[key].send(msg);
  }
}

function moveruka( ruka ) {
  for (var i=0; i<ruka.length; i++) {
    var delta = 0.3;
    ruka[i][0] += Math.random()*delta;
    ruka[i][1] += Math.random()*delta;    
  }
}

function setlen( ruka, n ) {
  if (ruka.length > n)
    ruka.length = n;
  else
    while (ruka.length < n)
      ruka.push( [0,0] );
}

//////////////////////////////////

var ruka = [ [0,0], [10,20], [-15,-2] ]; // a list of euler angles (degree)

setlen( ruka, 15 );

function step() {
  moveruka( ruka )
  broadcast( ruka );
}

setInterval( step, 10 );
