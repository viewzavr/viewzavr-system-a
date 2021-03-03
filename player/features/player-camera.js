// как ее сохранять - как обычные параметры (плеера) или как-то по-другому?
// как бы организовать доступ для управления через формулы? создать отдельный объект?

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
  
  player.setParam( "cameraPos",[] );
  player.trackParam( "cameraPos", function() {
    var cp = player.getParam("cameraPos");
    qmlEngine.rootObject.cameraPosReal = cp;
  });
  player.setParam( "cameraCenter",[] );
  player.trackParam( "cameraCenter", function() {
    var cp = player.getParam("cameraCenter");
    qmlEngine.rootObject.cameraCenter = cp;
  })
  ;

  qmlEngine.rootObject.cameraCenterChanged.connect( player, function(v) {
    player.setParam( "cameraCenter",v );
  });
  qmlEngine.rootObject.cameraPosRealChanged.connect( player, function(v) {
    player.setParam( "cameraPos",v );
  });  

  //  qmlEngine.rootObject.special_objects = player.special_objects;
}