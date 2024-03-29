// loads packages by checkbox select

/*
var variants = {
  "vis-comp": {
    title: "Visualization components",
    info: "....",
    url: "https://viewlang.ru/viewzavr-apps/visualization-components/init.js"
  },
  "krakozabra": {
    title: "Krakozabra 3d",
    info: "a figure of krakozabra",
    //url: "https://cdn.jsdelivr.net/gh/pavelvasev/vr-points-game@master/krako.js"
    url: "https://viewlang.ru/viewzavr-apps/vr-points-game/krako.js"
  },
  "points-game": {
    title: "Points game algorythm",
    info: "....",
    url: "https://viewlang.ru/viewzavr-apps/vr-points-game//points-game/init.js"
  }
}
*/

// package may contain `setup` function, which may add records to a table of visual components, used by visual interface
export function setup( vz ) {

  vz.addItemType( "load-packages-checkbox","Load packages", function( opts ) {
    return create( vz, opts );
  }, { hidegui:true} );

}

// place your app code in this function
export function create( vz, opts ) {
  // opts.name ||= "packages-checkbox-library";
  // opts.priority = 10;
  var obj = vz.createObj( opts );

  var promises = {};
  
  var player = opts.player || vzPlayer;
  var orig = player.addPackage;
  player.addPackage = function(...args) {
    orig( ...args );
    reflect_variants();
  }
  // todo: change to events / or maybe "append"
  var orig1 = player.loadPackageByCode;
  player.loadPackageByCode = function(code) {
    var q = orig1(code);
    // sometimes code is just blank
    if (code.length && code.length > 0) {
      // todo: timer?
      var curval = player.isPackageLoaded( code );
      if (!curval) // reflect only if it loads. we do not have an unload
        q.then( () => {
          reflect_variants();
        });
    }
    return q;
  }


  function reflect_variants() {
    
    var variants = player.getPackagesTable();

    var items = Object.keys( variants );
    items.forEach( function(item) {
      var curval = player.isPackageLoaded( item );

      obj.addCheckbox( item,curval,function(v) {
        //console.log("they want load..",item,v);
        if (v) {
          //var p = vzPlayer.loadPackage( variants[item].url );
          var p = vzPlayer.loadPackage( variants[item].code );
          promises[item] = p;
        }
      });
    });
/*
    player.on("package-loaded",function(code) {
      obj.setParam(code,true);
    });
*/    
  }
  
  obj.getPromise = function() {
    return  Promise.allSettled( Object.values( promises ) );
  }
  
  obj.chain("dump",function() {
    var d = this.orig();
    d.priority = 10;
    return d;
  });
  
  reflect_variants();
  
  // console.log("thus mc returning");

  return obj;
}
