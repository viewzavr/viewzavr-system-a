import * as cam from "../vz-comps/camera.js";

export default function setup( player ) {
  cam.setup( player.vz );
  var camobj = cam.create( player.vz, {parent: player.special_objects.state, name:"camera" } )
}