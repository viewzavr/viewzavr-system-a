import * as m1 from "../a-simple-spheres/app.js";
import * as m2 from "../fun/app.js";

export function create( vz, opts ) {
  var obj = vz.createObj( opts );
  
  m1.create( vz, {parent:obj} );
  m2.create( vz, {parent:obj} );

  return obj;
}
