// purpose: provide a state for scene default camera, so it will be saved and restored

import * as cam from "../../graphical-api/camera.js";

export default function setup( player ) {
  cam.setup( player.vz );
  var camobj = cam.create( player.vz, {parent: player.special_objects.state, name:"camera" } )
  camobj.considerParamsManual = true;
}