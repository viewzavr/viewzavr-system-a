

import baseobj from "./baseobj.js";
import shaders from "./shaders.js";
import vis from "./vis.js";

import utils_setup from             "./utils/init.js";
import vis_threejs_setup from       "./vis-threejs/init.js";
//import components_setup from        "./components/init.js";
import components_threejs_setup from "./components-threejs/init.js";

export function setup( vz, opts={} ) {
  if (!vz.vis) vz.vis = {};

  utils_setup( vz );

  baseobj( vz, vz.vis );
  shaders( vz );
  vis( vz );
  vis_threejs_setup( vz );

//  components_setup( vz );
  components_threejs_setup( vz );

  vz.register_feature_set( {scene_screenshot} );
}

/////////////////
export function scene_screenshot(env) {
  env.sceneScreenShot = (format="image/png") => {
    var img = renderer.domElement.toDataURL(format);
    return img;
  }
  env.sceneScreenShotBlob = (format="image/png",cb) => {
    renderer.domElement.toBlob(cb,format);
  }  
}
