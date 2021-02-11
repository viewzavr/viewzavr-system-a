// A Viewzavr package is a javascript module. It may do anything, and beside that
// there are following special functions may be exported:
// * setup, which is called when package is loaded
// * create, which is called to create scene when vzPlayer.loadApp function is called.

// setup function may register components in types table, which is used by player's visual interface
// and by Viewzavr.createObjByType function.
export function setup( vz ) {
  vz.addItemType( "my-test-component-type-id","My test component", function( opts ) {
    return create( vz, opts );
  } );
}

// create function should return Viewzavr object
export function create( vz, opts ) {
  opts.name ||= "demoscene";
  var obj = vz.createObj( opts );

  var pts = vz.vis.addPoints( obj );
  pts.positions = [1,2,3, 1,2,5, 1,3,12];

  var lins = vz.vis.addLines( obj );
  lins.positions = [1,2,3, 1,2,5, 1,2,5, 1,3,12];
  
  obj.addCmd( "click", function() {
    obj.signalTracked( "r" );
  });
  obj.addSlider("r",10,0,100,1,function() {
    var acc = []; var r = obj.getParam("r");
    for (var i=0; i<100; i++) acc.push( r*(Math.random()-0.5),r*(Math.random()-0.5),r*(Math.random()-0.5) );
    pts.positions = acc;
    lins.positions = acc;
  } );

  return obj;
}
