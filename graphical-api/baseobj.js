// gui - объект с гуями, p - объект с js-свойствами
export function addBaseGui( gui, p ) {

  var sr = gui.addSlider( "radius", 2, 0.1, 10, 0.1, function(v) {
    p.radius = v;
  });
  var sc = gui.addColor( "color", p.color, function(v) {
    // console.log("ccc=",v);
    p.color = v;
  });
  var so = gui.addSlider( "opacity", 100,0,100,1,function(v) {
    p.opacity = v / 100.0;
  });
  // p.radiusChanged.connect...
  
  return gui;
}

export default function setup( m, vis ) {

  vis.addQml3d = function( qmlfile, parent, name ) {
    if (!parent) {
      parent = qmlEngine.rootObject;
    }
    var p = m.create_qml( qmlfile );
    parent.create_obj( p, {name: name} );
    vis.addBaseGui( p,p );
    return p;
  }
  
  m.addQml = function( qmlfile, opts ) {
    var isparentqml = opts.parent.$tidyupList ? true : false;
    var p = m.create_qml( qmlfile, isparentqml ? opts.parent : qmlEngine.rootObject );
    opts.parent.create_obj( p, opts );
    return p;
  }
  
  vis.addBaseGui = addBaseGui;

}