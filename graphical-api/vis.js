// наполняет указанный объект m полем .vis в который добавляет функции создания 3д объектов
// типа vz.vis.addPoints и т.п.
// требует на вход чтобы было m.create_qml

export default function setup( vz ) {

  // тут мы подряд фич напихаем, но это необязательно

  vz.vis.addPoints = function( parent, name, opts ) {
    var obj = vz.vis.addQml3d( "Points.qml", parent, name || "points", opts );
    var shapes = ["","spark1.png","ball.png","circle.png","disc.png","particle.png","particleA.png","snowflake1.png","snowflake3.png"]

    //console.log( "my meta is ",import.meta.url);
    var dir = import.meta.url.replace(/\/[^/]+\/?$/, '');
    obj.addCombo( "shape",0,shapes, function(v) {
      //todo https://stackoverflow.com/questions/57663763/get-the-file-name-of-the-current-es-module
      //obj.textureUrl = shapes[v] ? Qt.resolvedUrl("https://viewlang.ru/code/components/creative_points/sprites/"+shapes[v]) : null
      obj.textureUrl = shapes[v] ? dir + "/assets/sprites/"+shapes[v] : null
    });
    obj.addSlider( "additive",0,0,1,1,function(v) {
      obj.additive = v > 0;
    });
    obj.addSlider( "depth_test",1,0,1,1,function(v) {
      obj.depthTest = v > 0;
    });
    obj.addCheckbox("size_attenuation",true,(v) => {
       obj.sizeAttenuation = v;
    });
    
    obj.addArray("colors",[],3);
    obj.trackParam("colors",function() {
      var c = obj.getParam("colors");
      // feature: reset original color when colors are assigned
      // because color plays as a mask
      if (c && c.length > 0) obj.color = [1,1,1];
      obj.colors = c;
    });
    /* todo
    obj.addSlider( "alpha-test",100,0,100,1,function(v) {
      console.log("sertting at",v / 100.0 );
      obj.alphaTest = v / 100.0;
    });    
    */
    return obj;
  };

  vz.vis.addLines = function( parent, name, opts ) {
    var obj = vz.vis.addQml3d( "Lines.qml", parent, name || "lines", opts );
    obj.addSlider( "additive",0,0,1,1,function(v) {
      obj.additive = v > 0;
    });    
    return obj;
  };
  
  vz.vis.addLinestrip = function( parent, name, opts ) {
    var obj = vz.vis.addQml3d( "Linestrip.qml", parent, name || "linesstrip", opts );
    obj.addSlider( "additive",0,0,1,1,function(v) {
      obj.additive = v > 0;
    });
    return obj;
  };  

  vz.vis.addSpheres = function( parent, name, opts ) {
    var p = vz.vis.addQml3d( "Spheres.qml", parent, name || "spheres", opts );
    p.addSlider( "nx", p.nx, 4, 10, 1, function(v) {
      p.nx = v;
    });
    p.addSlider( "ny", p.ny, 4, 10, 1, function(v) {
      p.ny = v;
    });
    add_mesh_params( p,p.atrimesh );
    return p;
  };

  vz.vis.addTubes = function( parent, name, opts ) {
    var q = vz.vis.addQml3d( "Cylinders.qml", parent, name || "tubes", opts );
    add_mesh_params( q,q.trimesh );
    return q;
  };
  
  vz.vis.addCones = function( parent, name, opts ) {
    var q = vz.vis.addQml3d( "Cones.qml", parent, name || "cones", opts );
    add_mesh_params( q,q.trimesh );
    return q;
  };
  
  vz.vis.addViewlang = function(viewlang_name, opts={}) {
    return vz.vis.addQml3d( viewlang_name+".qml", opts.parent, opts.name || "viewlang-item", opts );
  }
  
  vz.vis.addMesh = function( parent, name, opts ) {
    var q = vz.vis.addQml3d( "Trimesh.qml", parent, name || "mesh", opts );
    q.removeGui("radius");
    add_mesh_params( q,q );
    return q;
  };

}

function add_mesh_params( obj,q ) {
    // R-MESH-FLATSHADING
    obj.addSlider("flat-shading",0,0,1,1,function(v) {
      if (q.materials && q.materials[0])
          q.materials[0].flat = v > 0;
      // the following is from viewlang creativetrimesh
      setTimeout( function() {
        q.make3d();
      },5);
    });
    obj.addSlider("shine",30,0,100,1,function(v) {
      if (q.materials && q.materials[0])
          q.materials[0].shine = v;
    });
    obj.addSlider("wire",0,0,10,0.1,function(v) {
      if (q.materials && q.materials[0]) {
          q.materials[0].wire = v>0;
          q.materials[0].wirewidth = v;
      }
    });
}
