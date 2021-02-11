// наполняет указанный объект m полем .vis в который добавляет функции создания 3д объектов
// типа m.vis.addPoints и т.п.
// требует на вход чтобы было m.create_qml

import gltf from "./gltf/init.js";
import gltf_array from "./gltf-array/init.js";
import clones from "./clones/init.js";
import sound from "./sound.js";

export default function setup( vz ) {
  sound( vz );
  gltf( vz );
  gltf_array( vz );
  clones( vz );
  sound( vz );
}
