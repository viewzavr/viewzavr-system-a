import url_hash_persistence from "./features/window-hash.js";
import * as packages_table from "./features/packages-table.js";
import * as feature_packages_load_once from "./features/packages-load-once.js";

// import create_player_state from "./features/player-state.js";
import create_player_state from "./features/player-state-special-form.js";
import player_camera from "./features/player-camera.js";

import add_importexport_component from "./vz-comps/save-scene.js";
import * as load_packages_checkbox from "./vz-comps/packages-checkbox/init.js";
import * as load_packages_by_url from "./vz-comps/load-packages.js";

import * as js_fast_component from "./vz-comps/js-fast-component/app.js";

import formatSrc from "./format-src.js";

// viewzavr app/module

// vz - переменная вьюзавра
// qmlEngine - движок qmlweb с инициализироввным вьюлангом на нем (пока так)
export function create( vz, qmlEngine ) {
  var dir = import.meta.url.substr( 0, import.meta.url.lastIndexOf("/") );
  qmlEngine.loadFile( dir + "/qmlweb-ui3/scene2.vl" );

  var p = vz.createObj();
  p.qmlEngine = qmlEngine;
  // always dump
  p.chain("dump",function() { return this.orig( true ); })

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

  // loads viewzavr package
  // this means load file and call it's exported `setup` function
  // url may be:
  // * path to js file
  // * an array of pathes
  // * txt file, where each line is a path to js or txt file
  // returns promise that is resolved when all url data is processes (wherever successfully or not)
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
    
    if (url.indexOf(".txt") >= 0) {
      return new Promise( function( resolv, rej ) {
    
      //fetch(url,{credentials: 'include'}).then((response) => {
      //seems credentials are useless now - until we will consider credentials of import..
      fetch(url).then((response) => {
        return response.text();
        })
      .then((data) => {
        console.warn("loaded txt:",data);
        var dir = url.substr( 0, url.lastIndexOf("/") ) + "/";
        p.loadPackage( data.split("\n").filter( l => l.length > 0 ).map( function(line) {
          return dir + "./" + line;
        }) ).then( function() { 
           resolv( {} ); // we provide empty {} object to resolv - so module arg will not be null (see below)
        } );
      });
        // todo errors!
      });
      
    }

    return new Promise( function( resolv, rej ) {
      var url2 = formatSrc( url ); // TODO this is hack based on viewlang function formatSrc
      //console.log("url2=",url2)
      import( url2 ).then( function(mod) {
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

  // same as loadPackage, but additionally call create on loaded package and assign it as root object to player
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
  
  // loads scene in json format and calls createSynsFromDump, e.g. reconstructing scene
  // maybe loadJson is not a better variant, maybe it is better to load it then allow user to call vz.createSyncFromDump
  p.loadJson = function( url ) {
     return new Promise( function( resolv, rej ) {
      fetch(url).then((response) => {
          if (!response.ok) {
            console.error("loadJson fetch not ok:",response.statusText)
            throw "fetch error";
          }
          
          return response.json();
        },
        (reason) => {
          console.log("viewzavr loadJson error: ",reason); // Ошибка!
          rej( reason )
          //resolv( {} );
          return {};
        }
      )
      .then((data) => {
        //console.log(data);
        console.log("loadJson: loaded, syncing");
          var r = vz.createSyncFromDump( data,vzPlayer );
          r.then( (obj) => {
            console.log("loadJson: synced");
            resolv(obj);
          }) 
          // .catch( (rerr) => { console.error("loadJson: error during sync",rerr); rej(rerr); } );
          // @todo: createSyncFromDump always returns success (see allSettled). track that..
      }
      ,(err) => { console.error("loadJson parse error",err); rej(err); }
      );
     });
  }
  
  url_hash_persistence( vz,p );
  add_importexport_component( vz,p );
  load_packages_checkbox.setup( vz,p );
  load_packages_by_url.setup( vz,p );
  js_fast_component.setup( vz,p );

  packages_table.setup( p );
  feature_packages_load_once.setup( p );

  create_player_state(p);
  // надо пробовать оно нам может камеры сможет устанавливать при смене
  player_camera(p);
  
  // вот такая вот временная жесть
  window.qmlwebParamsHashProhibitied = true;

  return p;
}
