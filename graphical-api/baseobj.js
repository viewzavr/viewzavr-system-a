// gui - объект с гуями, p - объект с js-свойствами
export function addBaseGui( gui, p ) {

  var sr = gui.addSlider( "radius", 2, 0.1, 20, 0.1, function(v) {
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

  vis.addQml3d = function( qmlfile, parent, name, opts ) {
    var p = m.addQml( qmlfile, Object.assign( {parent:parent, name: name}, opts || {} ) );
/*    
    if (!parent) {
      parent = qmlEngine.rootObject;
    }
    var p = m.create_qml( qmlfile );
    m.create_obj( p, {name: name,parent:parent} );
*/    
    vis.addBaseGui( p,p );
    return p;
  }
  
  m.addQml = function( qmlfile, opts ) {
    var isparentqml = opts && opts.parent && opts.parent.$tidyupList ? true : false;
    var p = m.create_qml( qmlfile, isparentqml ? opts.parent : qmlEngine.rootObject,function(newobj) {
      newobj.vz = m; // pass viewzavr system to created objects.
    } );
    if (!p) {
      //console.error("addQml: failed to create QML from file",qmlfile)
      console.error("addQml: returning just blank object");
      return m.createObj( opts );
    }
    m.create_obj( p, opts );
//    m.chain("remove",function() {
//    });
    return p;
  }
  
  vis.addBaseGui = addBaseGui;

}