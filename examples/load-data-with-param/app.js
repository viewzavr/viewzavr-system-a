console.log("hello Viewzavr!");

export function setup( vz ) {
  vz.addItemType( "example-load-data-with-param","Example: load-data-with-param", function( opts ) {
    return create( vz, opts );
  } );
}

export function create( vz,opts ) {

  var obj = vz.createObj( opts );
  var pts = vz.vis.addPoints( obj );
  var lins = vz.vis.addLines( obj );

  var load = function() {
  
  var n = obj.getParam("N");
  fetch( vz.getDir( import.meta.url ) + n + ".txt" ).then( function(res) {
   res.text().then( function(txt) {
     var nums = txt.split(/\s+/).map(parseFloat);
     var acc = [];
     var acc2 = [];
     nums.forEach( function(v,index) {
       if (!isFinite(v)) return;
       acc.push( index, v % 50, 0 );
       acc2.push( index, 0, 0 );
       acc2.push( index, v % 50, 0 );
     });
     pts.positions = acc;
     lins.positions = acc2;
  } ) });
  
  } // load

  obj.addSlider( "N",1,1,3,1,load );

  return obj;
}
