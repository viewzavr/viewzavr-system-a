export function setup( vz ) {
  vz.addItemType( "example-websockets-ruka","Example: websockets-ruka", function( opts ) {
    return create( vz, opts );
  } );
}

export function create( vz, opts ) {
  var obj = vz.createObj( opts );
  var lins = vz.vis.addTubes( obj );
  var sp = vz.vis.addSpheres( obj );
  
  obj.addText( "Websocket server addr",'ws://please-set-host:5555', function(v) {

  const socket = new WebSocket( v );

  socket.addEventListener('open', function (event) {
    socket.send('Hello Server!');
  });

  socket.addEventListener('message', function (event) {
      console.log('Message from server ', event.data);
      var arr = event.data.split(/[\s,]+/).filter( function(s) { return s.length > 0 }).map( parseFloat );
      lins.positions=arr;
      sp.positions=arr;
  });
  
  });
  
  obj.addLabel( "note","Please make sure you have started websocket server" );

  return obj;
}