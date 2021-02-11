// состояние плеера + предварительная загрузка пакетов, объявленных в дампе, в режиме особой формы
// так то тут похоже все водно смешано - особая ситуация с пакетами и состояние плеера
// туду разделить

export default function setup( player ) {

  // ща мы как отсортируем всех по priority
  // todo - а хорошо бы всех внутри приорити еще и по порядку заодно уж
  player.vz.chain( "createChildrenByDump", function( dump, obj )
  {
    var p = dump.packages || {};
    var p1 = p.codes || []
    var p2 = p.urls  || [];
    

    obj.historyPackages = dump.packages;

    var orig = this.orig;
    // первым делом, первым делом самолеты, ну а девушки - а девушки потом
    player.loadPackageByCode( p1 ).then( function() {
      player.loadPackage( p2 ).then( function() {
        orig( dump, obj );
      });
    });

  });
  
  // ну и собственно сохранить теперичмо
  player.vz.chain( "dumpObj", function(obj) {
    var d = this.orig( obj );
    
    if (obj.historyPackages)
        d.packages = obj.historyPackages;
    
    // а теперь самое интересное место - откуда эти пакеты то у нас берутся? правильнО, из плеера
    // а точнее из гуи, с которым работает пользователь
    // (ибо все которые из кода - они в коде и живут, и им и там хорошо)
    
    if (obj == player.getRoot()) {
      var codes = Object.keys( player.special_objects.packages.getParams() );
      var urls = player.special_objects.packages_by_url.getParam( "packages-urls" );
      if (!Array.isArray(urls)) {
        if (urls.length > 0) urls = [urls];
      }
      // просто присваиваем - потому что эта штука управляется отсюда, из гуи, для корневого объекта
      if (!d.packages) d.packages = {};
      d.packages.codes = codes;
      d.packages.urls = urls;
    }
    
    return d;
  });
  
  var orig = player.setRoot;
  player.setRoot = function(root) {
     var p = root.historyPackages || {};
     (p.codes || []).forEach( function(code) {
       player.special_objects.packages.setParam( code, true );
     });
     // ну да, это просто альтернативная ветка да и все.. чисто формально.. а те спец-объекты это просто как бы как объекты сидящие в сей ветке
     player.special_objects.packages_by_url.setParam( "packages-urls", (p.urls || []) );
     orig( root );
  };
  
    var b = player.vz.createObj( {name: "state", parent: player } );
    var packages_by_cb  = player.vz.createObjByType( {parent: b, type: "load-packages-checkbox", player: player} );
    var packages_by_url = player.vz.createObjByType( {parent: b, type: "load-packages-by-url", player: player} );
    var savescene       = player.vz.createObjByType( {parent: b, type: "import-export", player: player} );
    
    packages_by_cb.dump = function() {};
    packages_by_url.dump = function() {};
    savescene.dump = function() {};
    
    //todo отключить сохранение для пакет-объектов?

    player.special_objects = {
      packages: packages_by_cb,
      packages_by_url: packages_by_url,
      import_export: savescene
    }
    // собственно говоря, это уже идет зачаток состояния плеера. сюда надо еще камеру токмо.

    qmlEngine.rootObject.special_objects = player.special_objects;
}