export function setup( vz ) {
  vz.addItemType( "example-simple-with-param","Example: a-simple-with-param", function( opts ) {
    return create( vz, opts );
  } );
}

export function create( vz, opts ) {
  opts.name ||= "demoscene";
  var obj = vz.createObj( opts );

  var pts = vz.vis.addPoints( obj );
  var lins = vz.vis.addLines( obj );

  obj.addCmd( "click", function() {
    obj.signalParam( "r" );
  });

  obj.addSlider("r",10,0,100,1,function() {
    var acc = []; var r = obj.getParam("r");
    for (var i=0; i<100; i++) acc.push( r*(Math.random()-0.5),r*(Math.random()-0.5),r*(Math.random()-0.5) );
    pts.positions = acc;
    lins.positions = acc;
  } );
  
  obj.signalParam("r");
  
  obj.addCmd("open source",function() {
    window.open( import.meta.url );
  });


  return obj;
}
