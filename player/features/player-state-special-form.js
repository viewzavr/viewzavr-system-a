/* Потребность:
   а) управлять пакетами особо удобным образом в гуи
   б) сохранять состояние настроенных пакетов в дамп
   б) загружать это состояние из дампов
   б1) если это глубокий под-объект - просто загружать, применять
   б2) если это текущее состояние плеера - выставлять гуи-элементы (а) на него.
   
   Решение - создать экземпляры объектов для управления пакетами,
   сделать для них гуи, сохранять состояние этих объектов в особый ключ "packages" у плеера.
   При восстановлении из дампа проверять ключ packages, проводить загрузку по данным из него.
   
   Минус этой системы - мы не сможем управлять пакетами загруженной подсцены.
*/

// состояние плеера + предварительная загрузка пакетов, объявленных в дампе, в режиме особой формы
// так то тут похоже все водно смешано - особая ситуация с пакетами и состояние плеера
// туду разделить

export default function setup( player ) {

    var b = player.vz.createObj( {name: "state", parent: player } );
    var packages_by_cb  = player.vz.createObjByType( {parent: b, type: "load-packages-checkbox", player: player} );
    var packages_by_url = player.vz.createObjByType( {parent: b, type: "load-packages-by-url", player: player} );
    var savescene       = player.vz.createObjByType( {parent: b, type: "import-export", player: player} );
    //var guistate        = player.vz.createObj( {parent: b, player: player, name: "guistate"} );

    packages_by_cb.dump = function() {};
    packages_by_url.dump = function() {};
    savescene.dump = function() {};

    //todo отключить сохранение для пакет-объектов?

    player.special_objects = {
      packages: packages_by_cb,
      packages_by_url: packages_by_url,
      import_export: savescene,
      state: b
    }
    // player.state = b;
    // собственно говоря, это уже идет зачаток состояния плеера. сюда надо еще камеру токмо.

    qmlEngine.rootObject.special_objects = player.special_objects;
    
    //////////////////////////////////////////////////////////

  // перед тем как загружать children-ов мы загрузим свои пакеты
  player.vz.chain( "createChildrenByDump", function( dump, obj )
  {
    var p = dump.packages || {};
    var p1 = p.codes || []
    var p2 = p.urls  || [];

    obj.historyPackages = dump.packages;

    var orig = this.orig;
    
    var promise1 = new Promise((resolve, reject) => {

    var p3 = p1.concat(p2);
    if (p3.length > 0)
      player.loadPackage( p3 ).then( () => {
        orig( dump, obj ).then( obj => {
          resolve( obj );
        });
      });
    else {
      orig( dump, obj ).then( obj => {
        resolve( obj );
      });
    }
    /*
    // первым делом, первым делом самолеты, ну а девушки - а девушки потом
    player.loadPackageByCode( p1 ).then( function() {
      player.loadPackage( p2 ).then( function() {
        orig( dump, obj ).then( obj => {
          resolve( obj );
        });
      });
    });*/

    // выставим себе гуи
    // но кстати а почему себе?.. и зачем это делать?..
    // возможно это и не надо делать - возможно там параметры ответственные за это управятся
    if (obj == player) {
       p1.forEach( function(code) {
         player.special_objects.packages.setParam( code, true );
       });
      
       player.special_objects.packages_by_url.setParam( "packages-urls",p2 );
//       player.special_objects.packages_by_url.signalTracked( "packages-urls" );
     }
     
     }); // promise
     
     return promise1;

  });
  
  // update: а нельзя это попроще как-то сделать? зачем вот это все? если пакеты это объект вьюзавра, то пусть уж и сохраняют свои параметры, не?
  // сохраним пакеты во время дампа
  player.vz.chain( "dumpObj", function(obj) {
    var d = this.orig( obj );
    
    if (obj.historyPackages)
        d.packages = obj.historyPackages;

    // save packages (configured in gui) to dump
    if (obj == player) {
      var codes = Object.keys( player.special_objects.packages.getParams() ); // идея - cb-фильтр(name,value) в getParams
      // сотавим только активные
      codes = codes.filter( code => player.special_objects.packages.getParam(code) );
      var urls = player.special_objects.packages_by_url.getParam( "packages-urls" ) || [];
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

}