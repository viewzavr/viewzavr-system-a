// allows to choose camera control in gui
// uses threejs and viewlang

export default function setup( vz ) {

  vz.addItemType( "camera-gui-control","Camera: Camera GUI control", function( opts ) {
    return create( vz, opts );
  } );

}

export function create( vz, opts )
{
  var obj = vz.createObj( Object.assign( { name: "camera-gui-control" }, opts )); //, parent: opts.parent } );
  
  var argstable = [
    ["OrbitControls"],
    ["OrbitControls","MapControls"],
    ["../threejs_driver/OrbitControls.js","OrbitControls"]
  ]
  
  obj.addCombo( "type",0,["orbit","map","orbit-old"],function(v) {
    let args = argstable[ v ];
    qmlEngine.rootObject.cameraControlC.setupControl.apply( qmlEngine.rootObject.cameraControlC, args );
  });

  return obj;
}