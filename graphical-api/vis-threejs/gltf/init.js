import setup_anim from "./animations-interface.js";
import setup_caching from "./caching.js";
import * as utils from "./threejs-utils.js";

// vz.vis.addGltf

// https://threejs.org/docs/#examples/en/loaders/GLTFLoader

var dir = import.meta.url.substr( 0,import.meta.url.lastIndexOf("/") ) 
//var aacounter = 0;

export default function setup( vz ) {

  vz.vis.addGltf = function( parent, name ) {
    var obj = vz.create_obj( {},{parent:parent, name:name || "gltf-anim"});
//    aacounter++;
//      console.log("create: aacounter = ",aacounter);    

    obj.addSlider( "opacity", 100,0,100,1,function(v) {
      obj.opacity = v / 100.0;
    });
    
    obj.addSlider( "scale", 1, 0.1, 10, 0.1,function(v) {
      obj.scale = v;
    });


    obj.addFile("src","",function() {
    });
      
      
    ////////////////

    var scale=1;
    Object.defineProperty(obj, 'scale', {
      get: function() { return scale },
      set: function(v) { 
        scale=v; 

        if (obj.gltf) 
          obj.gltf.scene.scale.set( scale,scale,scale ); 
        }
    });

    var opacity=1;
    Object.defineProperty(obj, 'opacity', {
      get: function() { return opacity },
      set: function(v) {
        opacity=v; 
        if (!obj.gltf) return;
        utils.setMaterialOpacity( obj.gltf.scene, opacity );
        }
    });
    
    var colors=[];
    var colors_assigned = [];
    Object.defineProperty(obj, 'colors', {
      get: function() { return colors },
      set: function(v) {
        colors=v;
        if (!obj.gltf) return;
        
        // optimization
        if (colors_assigned[0] == v[0] && colors_assigned[1] == v[1] && colors_assigned[2] == v[2]) return;
        // optimization 2 : real case - points game assigns colors changing very slowly 10 times per second
        if (Math.abs(colors_assigned[0]-v[0]) + Math.abs(colors_assigned[1]-v[1]) + Math.abs(colors_assigned[2]-v[2]) < 0.01) return;
        
        //console.log("CC!",v,colors_assigned);
        colors_assigned = colors.slice();
        
        if (colors.length > 0) {
          //debugger;
          //utils.setMaterialColorEmissive( obj.gltf.scene, new THREE.Color( colors[0], colors[1], colors[2] )  );
          var w = 0.5;
          var c = new THREE.Color( colors[0]*w, colors[1]*w, colors[2]*w )
          utils.traverseMaterials( obj.gltf.scene, function(m) {
            m.emissive = c;
            //m.color = c;
          });
        }
        // are we in need to undo colors?...
        }
    });    
    
    
    // робит только для 1 позиции (т.е. массива из 3 чисел)
    var positions=[0,0,0];
    Object.defineProperty(obj, 'positions', {
      get: function() { return positions },
      set: function(v) { 
        positions=v;
        // debugger;
        if (!obj.gltf) return;
        obj.gltf.scene.position.set( v[0],v[1],v[2] ); 
      }
    });
    
    // робит только для 1 позиции (т.е. массива из 3 чисел)
    var rotations=[0,0,0];
    Object.defineProperty(obj, 'rotations', {
      get: function() { return rotations },
      set: function(v) { 
        rotations=v;
        
        // debugger;
        if (!obj.gltf) return;
        obj.gltf.scene.rotation.set( v[0],v[1],v[2] ); 
      }
    });
    
    function addtosceneif() {
      if (inscene) {
          //console.log("adding to scene",obj.gltf.scene );
          threejs.scene.add( obj.gltf.scene );
      }
      else
      {
        if (obj.gltf)
          threejs.scene.remove( obj.gltf.scene );
      }
    }
    
    // добавлять или нет в сцену
    var inscene=true;
    Object.defineProperty(obj, 'inscene', {
      get: function() { return inscene },
      set: function(v) { 
        inscene=v;
        addtosceneif();
      }
    });    

    // на случай если управлять visible этой модели
    //var myGroup = new THREE.Group();
    //threejs.scene.add( myGroup );

    function clear() {
      if (obj.gltf) {
        // console.log("GLTF removing",obj.gltf.scene);
        threejs.scene.remove( obj.gltf.scene );
        utils.disposeObjectTree( obj.gltf.scene );
      }
      obj.gltf = undefined;
      obj.sceneObject = undefined;
    }

    // переделали калбеки на промисы - зато сможем их кешировать если захотим
    obj.doload = function(loader, src) {
      var p = new Promise(function(resolve,reject) {
        loader.load( src, function ( gltf ) {
          resolve( gltf );
        });
      });
      return p;
    }

    /////////////////////////////
    obj.trackParam("src",function() {
    console.log("src changed", obj.getParam("src") );

    // todo: move imports to doload?
    // btw think something about caching on local File's

    import( threejs.url + "/examples/jsm/loaders/GLTFLoader.js").then(function(m1) {
    import( threejs.url + "/examples/jsm/loaders/DRACOLoader.js").then(function(m2) {
      // Instantiate a loader
      const loader = new m1.GLTFLoader();

      // Optional: Provide a DRACOLoader instance to decode compressed mesh data
      const dracoLoader = new m2.DRACOLoader();
      dracoLoader.setDecoderPath( dir+'/draco/' );
      loader.setDRACOLoader( dracoLoader );

      var src = obj.getParam("src");
      console.log("going to load",src );
      
      if (src instanceof File) {
            src = URL.createObjectURL( src );
            // todo revoke
      }
      else if (!src.length) {
        console.error("gltf: src has no length and not a file! src=",src);
        return;
      }

      obj.doload( loader, src ).then( function( gltf ) {
          console.log( "loaded gltf",gltf );
          clear();
          
          
          
/*          
          if (obj.gltf) {
            threejs.scene.remove( obj.gltf.scene );
          }
*/

        /*
        gltf.scene.scale.set( 2, 2, 2 );               
        gltf.scene.position.x = 0;                    //Position (x = right+ left-) 
        gltf.scene.position.y = 0;                  //Position (y = up+, down-)
        gltf.scene.position.z = 0;
        */

          obj.gltf = gltf;
          obj.sceneObject = gltf.scene;
          
          // if object already removed - do not do anything any more!
          if (obj.removed) {
            clear(); // but call clear on loaded data!
            return;
          }
          
          addtosceneif();
          
          obj.scale = obj.scale;
          obj.opacity = obj.opacity;
          obj.colors = obj.colors;
          obj.positions = obj.positions;
          obj.rotations = obj.rotations;
          
          obj.signal( "loaded" );

          gltf.animations; // Array<THREE.AnimationClip>
          gltf.scene; // THREE.Group
          gltf.scenes; // Array<THREE.Group>
          gltf.cameras; // Array<THREE.Camera>
          gltf.asset; // Object

        });

      });
    });
    
    }); // trackParam src
    
    
    obj.chain("remove",function() {
      clear();
      //obj.removed = true;
      //aacounter--;
      //console.log("remove: aacounter = ",aacounter);
      //debugger;
      this.orig();
    });
    
    /////////////////////////////
    setup_anim( obj ); // feature..
    setup_caching( obj ); // feature..
      
    return obj;
  } // addGltf
}