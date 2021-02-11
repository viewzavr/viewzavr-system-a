export function setup( vz ) {
  vz.addItemType( "example-a-simple","Example: a-simple", function( opts ) {
    return create( vz, opts );
  } );
}

export function create( vz, opts ) {
  opts.name ||= "demoscene";
  var obj = vz.createObj( opts );

  var pts = vz.vis.addPoints( obj );
  pts.positions = [1,2,3, 1,2,5, 1,3,12];

  var lins = vz.vis.addLines( obj );
  lins.positions = [1,2,3, 1,2,5, 1,2,5, 1,3,12];
  
  obj.addCmd("open source",function() {
    window.open( import.meta.url );
  });

  return obj;
}
