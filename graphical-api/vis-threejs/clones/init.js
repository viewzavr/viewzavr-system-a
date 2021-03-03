// var obj = vz.vis.addClones( parent, name)
// obj.setSource( viewzavr-объект или threejs-объект )
// obj.positions (x y z ....)
// obj.colors    (r g b ....)
// obj.rotations (rx ry rz ...)
// obj.scale

// todo:
// obj.scales

// idea for MultiCloner: 
// setSources( [source1, source2, ....] )
// obj.types (i ...) - index in sources array

import { InstancedScene } from "./InstancedScene.js";

// https://threejs.org/docs/#examples/en/loaders/GLTFLoader
// https://github.com/mrdoob/three.js/blob/master/src/objects/InstancedMesh.js

// var dir = import.meta.url.substr( 0,import.meta.url.lastIndexOf("/") ) 
// https://github.com/mrdoob/three.js/blob/master/src/core/Object3D.js
// https://raw.githubusercontent.com/mrdoob/three.js/cf04fca253477f40e04488229cfcaf0f280e448b/build/three.js

/*

  Замысел был что мы берем на вход threjs scene или любой другой объект, проходимся по его иерархии, и клонируем все что можно в Instanced-форму.
  Но. Вот паровоз в нем 132 меша в иерархии (ну такой вот он тупой).
  И получается все-равно 132 вызова - и на большом колве это дорого.
  И более того - проходить и выставлять матрицу каждому - это еще более дорого.
  (а ее надо выставлять и вычислять проходя по иерархии похоже).
  
  Вероятно вариант это все-таки сплющивать всю сцену в один меш, а затем ее уже дублировать через instanced-меш..
  
  https://threejsfundamentals.org/threejs/lessons/threejs-optimize-lots-of-objects.html
  прик пример с рисованием земли и данных на ней и там мерж геометрий

*/

export default function setup( vz ) {

  vz.vis.addClones = function( parent, name ) {

    var obj = vz.create_obj( {},{parent:parent, name:name || "clones"});
    
    var positions=[];
    var rotations=[];
    var scales=[1];
    var colors=[];
    var count=0;
    
    var tempmatr = new THREE.Matrix4();
    
    function updatematrices() {
      if (!obj.sceneObject) return;
    
      const vscale = new THREE.Vector3( scales[0], scales[0], scales[0] );
      var quaternion = new THREE.Quaternion();
      var euler = new THREE.Euler();
      for (var i=0,j=0; i<count; i++,j+=3) {
        //tempmatr.
        if (rotations.length > 0) { // todo optimize
          euler.set( rotations[j], rotations[j+1],rotations[j+2]);
          quaternion.setFromEuler( euler ); 
        }
        
        const position = new THREE.Vector3( positions[j],positions[j+1],positions[j+2] );
        tempmatr.compose( position, quaternion, vscale );
        obj.sceneObject.setMatrixAt( i, tempmatr );
      }
      
      //obj.sceneObject.commit();
    }
    
    function updatecolors() {
      if (!obj.sceneObject) return;

      var color = new THREE.Color();    
      if (colors && colors.length > 0)
      for (var i=0,j=0; i<count; i++,j+=3) {
        color.r = colors[j];
        color.g = colors[j+1];
        color.b = colors[j+2];
        obj.sceneObject.setColorAt( i, color );
      }
      
      //obj.sceneObject.commit();

    }

    //obj.sceneObject = new InstancedScene

    obj.addSlider( "opacity", 100,0,100,1,function(v) {
      obj.opacity = v / 100.0;
    });

    ////////////////

    var scale=1;
    Object.defineProperty(obj, 'scale', {
      get: function() { return scale },
      set: function(v) { 
        scale=v; 
        // debugger;
        if (obj.sceneObject)
          obj.sceneObject.scale.set( scale,scale,scale );
        }
    });

    /*
    var opacity=1;
    Object.defineProperty(obj, 'opacity', {
      get: function() { return opacity },
      set: function(v) {
        opacity=v; 
        if (!obj.gltf) return;

        var materialOptions = obj.gltf.scene.children[0].material;
        if (opacity < 1) {
          materialOptions.transparent = true;
          materialOptions.opacity = opacity;
        }
        else 
        {
          materialOptions.transparent = false;
        }
        materialOptions.needsUpdate=true;
        }
    });
    */

    Object.defineProperty(obj, 'positions', {
      get: function() { return positions },
      set: function(v) {
        positions=v || [];
        updatecount_from_positions();
        updatematrices();
      }
    });

    Object.defineProperty(obj, 'rotations', {
      get: function() { return rotations },
      set: function(v) {
        rotations=v || [];
        updatematrices();
      }
    });    
    
    Object.defineProperty(obj, 'colors', {
      get: function() { return colors },
      set: function(v) {
        colors=v || [];
        updatecolors();
      }
    });
    
    Object.defineProperty(obj, 'scales', {
      get: function() { return scales },
      set: function(v) {
        scales=v || [];
        updatematrices()
      }
    });    

/*
    Object.defineProperty(obj, 'count', {
      get: function() { return count },
      set: function(v) {
        count=v;
      }
    });
*/

/*
    obj.setSource = function( source ) {
      obj
    }

    Object.defineProperty(obj, 'source', {
      get: function() { return obj.sceneObject; },
      set: function(v) {
        count=v;
      }
    });
*/

    function updatecount_from_positions() {
      var orig_count = count;
      count = positions.length / 3;
      if (obj.sceneObject) {
          //obj.sceneObject.setCount( count );
          if (savedSource && orig_count != count)
            obj.setSource( savedSource ); // ehehhee
      }
    }

/*
    Object.defineProperty(obj, 'source', {
      get: function() { return count },
      set: function(v) {
        if (source.sceneObject) source = source.sceneObject;
        clear();
        obj.sceneObject = new InstancedScene( source, count );
      }
    });
*/

    var savedSource;
    obj.setSource = function( source ) {
      if (source.sceneObject) source = source.sceneObject;
      clear();
      obj.sceneObject = new InstancedScene( source, count );
      threejs.scene.add( obj.sceneObject );
      console.log("thus added to scene",obj.sceneObject);
      //debugger;
      savedSource = source;
    }

    // на случай если управлять visible этой модели
    //var myGroup = new THREE.Group();
    //threejs.scene.add( myGroup );

    function clear() {
      if (obj.sceneObject) {
        threejs.scene.remove( obj.sceneObject );
      }
      obj.sceneObject = undefined;
    }


    
    
    obj.chain("remove",function() {
      clear();
    });
    
    /////////////////////////////
      
    return obj;
  }
}