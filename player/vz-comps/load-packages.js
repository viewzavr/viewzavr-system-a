// load modules by hand by URL

export function create( vz, opts ) {
  var obj = vz.createObj( opts );
  
  var p = new Promise( function(resolv, rej) { resolv() } );

  obj.addFile("packages-urls","",function(v) {
    if (v) {
      //console.log("packages-url triggered --->",v);
      p = vzPlayer.loadPackage(v);
    }
  });

/*
  obj.getPromise = function() {
    return p;
  }
  
  obj.chain("dump",function() {
    var d = this.orig();
    d.priority = 10;
    return d;
  });
*/

  return obj;
}


export function setup( vz ) {
  vz.addItemType( "load-packages-by-url","Load packages by URL", function(opts) {
   return create( vz, opts );
  }, {label: "visual", guionce: true, title_ru: "Загрузка пакетов", hidegui: true} );
}
