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

  var argstable = {
    "orbit": ["OrbitControls"],
    "map" : ["OrbitControls","MapControls"]
    //,"orbit-old" : ["OrbitControlsTheta","OrbitControls"]
  }

  obj.addComboValue( "type","orbit",["orbit","map"],function(v) {
    let args = argstable[ v ];

    if (args)
      qmlEngine.rootObject.scene3d.cameraControlC.setupControl.apply( qmlEngine.rootObject.scene3d.cameraControlC, args );
  });

  return obj;
}