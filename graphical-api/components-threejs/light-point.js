// scene point light

// todo: move out from here to viewzavr/viewlang driver

export function create( mv, opts ) {
  var obj = mv.create_obj( {}, opts );
  
  var light = new THREE.PointLight( 0xFFFFFF );
  threejs.scene.add( light );
  
  var s = qmlEngine.rootObject;
  s.defaultLightsEnabled = false;
  
  //var s = qmlEngine.rootObject;
  // var c = s.backgroundColor || [0.09, 0.09, 0.17] || [0,0.2,0];
  // var c = any2tri( existing_light.color );
  
  obj.addArray("position",[100,100,100],3,function(v) {
    light.position.set( v[0],v[1],v[2] );
  });

  obj.addColor("color",[1,1,1],function(v) {
    // console.log("setting new bg color",v);  
    light.color = new THREE.Color( v[0],v[1],v[2] );
  });

  obj.addSlider("intensity",1,0.01,10,0.01,function(v) {
    light.intensity = v;
  });
  
  obj.addSlider("distance",0,0.0,1000000,1,function(v) {
    light.distance = v;
  });
  
  obj.addSlider("decay",1,1,5,1,function(v) {
    light.decay = v;
  });
  
  //obj.signalTracked( "color" );
  //obj.signalTracked( "intensity" );

  return obj;
}

export default function setup( mv ) {

  mv.addItemType( "point-light","Point light",function(opts) {
      return create( mv, opts );
    },
    {label: "visual", guionce: true, title_ru: "Свет из точки"}
  );

}