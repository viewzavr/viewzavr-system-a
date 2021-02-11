export function setup( vz ) {
  vz.addItemType( "example-load-data-txt","Example: load-data-txt", function( opts ) {
    return create( vz, opts );
  } );
}

export function create( vz,opts ) {

  var obj = vz.createObj( opts );
  var pts = vz.vis.addPoints( obj );

  fetch( vz.getDir( import.meta.url ) + "w_spheres.csv" ).then( function(res) { 
   res.text().then( function(txt) {
    var acc = [];
    var colors = [];

    txt.split("\n").forEach( function(line) {
      var nums = line.split(/[\s,]+/).map(parseFloat);
      if (nums.length < 6) return;
      acc.push( nums[0], nums[1], nums[2] );
      colors.push( nums[3], nums[4], nums[5] );
    });
     pts.positions = acc;
     pts.colors = colors;

  } ) });

  return obj;
}

