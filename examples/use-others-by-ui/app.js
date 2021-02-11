// viewzavr app/module
import * as m1 from "../a-simple-spheres/app.js";
import * as m2 from "../fun/app.js";

export function setup( vz ) {
  m1.setup(vz);
  m2.setup(vz);
  console.log("create things by hand using Add object menu");
}

export function create( vz, opts ) {
  console.log("Find new types in Examples, in Add item command!");

  return vz.createObj(opts);
}
