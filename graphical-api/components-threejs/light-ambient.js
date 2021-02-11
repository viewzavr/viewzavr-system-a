// scene ambient light

// todo: move out from here to viewzavr/viewlang driver

export function ambient_light( mv, opts ) {
  var obj = mv.create_obj( {}, opts );
  
  var existing_light;
  threejs.scene.traverse( function(obj) {
    if (existing_light) return;
    if (obj.type == "AmbientLight")
        existing_light = obj;
  });
  
  if (!existing_light) {
    existing_light = new THREE.AmbientLight( 0x444444 );
    threejs.scene.add( existing_light );
  }
  
  //var s = qmlEngine.rootObject;
  // var c = s.backgroundColor || [0.09, 0.09, 0.17] || [0,0.2,0];
  var c = any2tri( existing_light.color );

  obj.addColor("color",c,function(v) {
    // console.log("setting new bg color",v);  
    existing_light.color = new THREE.Color( v[0],v[1],v[2] );
  });

  obj.addSlider("intensity",1,0.01,10,0.01,function(v) {
    existing_light.intensity = v;
  });
  
  obj.signalTracked( "color" );
  obj.signalTracked( "intensity" );

  return obj;
}

export default function setup( mv ) {

  mv.addItemType( "ambient-light","Background light",function(opts) {
      return ambient_light( mv, opts );
    },
    {label: "visual", guionce: true, title_ru: "Общий свет"}
  );

}