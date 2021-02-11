import url_hash_persistence from "./features/window-hash.js";
import * as packages_table from "./features/packages-table.js";

// import create_player_state from "./features/player-state.js";
import create_player_state from "./features/player-state-special-form.js";

import add_importexport_component from "./vz-comps/save-scene.js";
import * as load_packages_checkbox from "./vz-comps/packages-checkbox/init.js";
import * as load_packages_by_url from "./vz-comps/load-packages.js";

// viewzavr app/module

// vz - переменная вьюзавра
// qmlEngine - движок qmlweb с инициализироввным вьюлангом на нем (пока так)
export function create( vz, qmlEngine ) {
  var dir = import.meta.url.substr( 0, import.meta.url.lastIndexOf("/") );
  qmlEngine.loadFile( dir + "/qmlweb-ui3/scene.vl" );

  var p = vz.createObj();
  p.qmlEngine = qmlEngine;

  p.setRoot = function(root) {
    p.root = root;
    qmlEngine.rootObject.vzroot = root;
    // может быть надо remove у ниво вызвать?
    p.ns.forgetChild( "scene" );
    p.ns.appendChild( root, "scene" );
    root.findRoot = function() { return root; }; // устанавливаем водораздел, чтобы всякие искатели по именам тут и оставались
  }

  p.getRoot = function() {
      return p.root;
  }

  p.loadPackage = function( url ) {
    if (Array.isArray(url)) 
    {
      var arr = url;
      var promises = [];
      for (var i=0; i<arr.length; i++) {
        try {
          promises.push( p.loadPackage( arr[i] ) );
        } catch (err) {
          console.error("vr-player-v1: failed to import",arr[i],err );
        }
      }
      return Promise.allSettled( promises );
    }

    return new Promise( function( resolv, rej ) {
      import( url ).then( function(mod) {
        if (mod.setup) {
          var s = mod.setup( p.vz );
          if (s instanceof Promise)
            s.then( function() { resolv(mod) } );
          else
            resolv( mod );
        }
        else
          resolv( mod );
      });
    });
  }

  p.loadApp = function( url ) {
     return new Promise( function( resolv, rej ) {
       p.loadPackage( url ).then( function(module) {
        if (module.create) {
          // up to this moment, all the packages chosen by user should be loaded...
          var root = module.create( vz, {}); // create a root object for scene
          //root.module_url = (url.indexOf("//") >= 0 ? url : import.meta.url.split("#")[0] + url); //;
          root.module_url = url; // это все временно и странно, и надо вообще только для сохранения сцены и восстановления - мб там овверрайдить.. типа фича

          if (!root) {
            console.error("WARNING: your create function did return empty result! Viewzavr needs object!");
            root = vz.createObj();
          }
          
          p.setRoot( root );
        }
        
        resolv( module );
      })
    }); // promisa
  }

  p.loadEmptyScene = function() {
      // this is case when no module provided. we can just start viewzavr.
      var root = vz.createObj({name:"scene"});
      p.setRoot( root );
      return new Promise( function(resolv) { resolv(); } );
  }
  
  url_hash_persistence( vz,p );
  add_importexport_component( vz,p );
  load_packages_checkbox.setup( vz,p );
  load_packages_by_url.setup( vz,p );

  packages_table.setup( p );

  create_player_state(p);

  return p;
}
