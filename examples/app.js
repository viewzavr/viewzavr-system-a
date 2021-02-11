export function setup( vz ) {
  var dir = vz.getDir( import.meta.url );
  var variants = ["a-simple","a-simple-spheres","a-simple-with-param","fun","load-data-txt","load-data-with-param","websockets-ruka"];
  return vzPlayer.loadPackage( variants.map( function(v) { return dir + v + "/app.js" } ) );
}

// create function should return Viewzavr object
export function create( vz, opts ) {
  opts.name ||= "demoscene";
  var obj = vz.createObj( opts );
  
  obj.addLabel("info","HINT: add objects of examples to the scene!");
  
  return obj;
}
