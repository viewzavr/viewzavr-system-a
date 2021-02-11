// viewzavr app/module

// module may contain `setup` function, which may add records to a table of visual components, used by visual interface
export function setup( vz ) {
  vz.addItemType( "example-a-simple-spheres","Example: a-simple-spheres", function( opts ) {
    return create( vz, opts );
  } );
}

// place your app code in this function
export function create( vz, opts ) {
  opts.name ||= "demoscene";
  var obj = vz.createObj( opts );

  var pts = vz.vis.addSpheres( obj );
  pts.positions = [1,2,3, 1,2,5, 1,3,12];

  var lins = vz.vis.addLines( obj );
  lins.positions = [1,2,3, 1,2,5, 1,2,5, 1,3,12];
  
  obj.addCmd("open source",function() {
    window.open( import.meta.url );
  });

  return obj;
}
