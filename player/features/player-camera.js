// как ее сохранять - как обычные параметры (плеера) или как-то по-другому?
// как бы организовать доступ для управления через формулы? создать отдельный объект?


export function create_camera( vz, opts )
{
  var obj = vz.createObj( Object.assign( {}, opts, { name: "camera" } )); //, parent: opts.parent } );
  
  // гуи
  obj.addArray( "cameraPos", [], 3 );
  obj.addArray( "cameraCenter", [], 3 );  
  
  // todo: active camera.. (of player root?)
  
  obj.setParam( "cameraPos",[] );
  
  obj.trackParam( "cameraPos", function() {
    var cp = obj.getParam("cameraPos");
//    console.log( "cameraPos param changed to",cp );
    if (cp && cp.length && cp.length == 3)
      qmlEngine.rootObject.cameraPos = cp;
  });
  obj.setParam( "cameraCenter",[] );
  obj.trackParam( "cameraCenter", function() {
    var cp = obj.getParam("cameraCenter");
//    console.log( "cameraCenter param changed to",cp );
    if (cp && cp.length && cp.length == 3)
      qmlEngine.rootObject.cameraCenter = cp;
  })
  ;

  qmlEngine.rootObject.cameraCenterChanged.connect( obj, function(v) {
    obj.setParam( "cameraCenter",v );
  });

  qmlEngine.rootObject.cameraPosRealChanged.connect( obj, function(v) {
    obj.setParam( "cameraPos",v );
  });
  

  
  return obj;
}


export default function setup( player ) {
  
  /*
  // ну и собственно сохранить теперичмо
  player.vz.chain( "dumpObj", function(obj) {
    var d = this.orig( obj );
    
    if (obj.historyPackages)
        d.packages = obj.historyPackages;
    
    // а теперь самое интересное место - откуда эти пакеты то у нас берутся? правильнО, из плеера
    // а точнее из гуи, с которым работает пользователь
    // (ибо все которые из кода - они в коде и живут, и им и там хорошо)
    
    if (obj == player.getRoot()) {
      id (!d.camera) d.camera = {};
    }
    
    return d;
  });
  */
  
  var camobj = create_camera( player.vz, {parent: player.special_objects.state } )
  
  player.vz.addItemType( "camera","Camera", function( opts ) {
    return create_camera( player.vz, opts );
  } );

}