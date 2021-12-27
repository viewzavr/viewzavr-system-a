// предназначение - сохранять в hash страницы все что там ставится через параметры
// и загружать на старте страницы

// функция setup настраивает player - дает ему методы loadFromHash, saveToHash, startSavingToHash, stopSavingToHash
// путем заноса во вьюзавр хуков - на установку параметров и модификацию деревьев


export default function setup( vz, player ) {

////////////////////////////////////////// цепляемся в команды obj - будем от них плясать на тему сохранения в хеш

function setup_obj(x) {

  var _setParam = x.setParam;
  var _getParam = x.getParam;
  var _removeParam = x.removeParam;

  x.setParam = function(name,value, ...rest) {
    //console.log("hasher see setParam call",name,value);
    if (!x.getParamOption(name,"internal")) player.scheduleSaveToHash( x );
    return _setParam( name, value, ...rest );
  }

  x.removeParam = function(name) {
    return _removeParam(name);
  }
  
  //debugger;
  var _appendChild = x.ns.appendChild;
  x.ns.appendChild = function(obj,name)
  {
    if (obj.manuallyInserted) 
        player.scheduleSaveToHash(x);
    
    _appendChild.apply(x.ns,arguments);
  }
  
  var _removeChild = x.ns.forgetChild;
  x.ns.forgetChild = function(obj)
  {
    if (obj.manuallyInserted)
        player.scheduleSaveToHash(x);

    _removeChild.apply(x.ns,arguments);
  }

}

///////////////////////////////////////// дадим полезных методов

player.saveToHash = function( obj ) {
  var name = obj.saveTreeToHashName;
  if (!name) return;
  
  var q = read_from_hash();
  q[ name ] = obj.dump();
  write_to_hash( q );
  console.log("saved to hash");
}

function findRoot( obj ) {
  if (!obj.ns.parent) return obj;
  return findRoot( obj.ns.parent );
}

var writeTimeoutId = null;
var lastWriteTm = 0;
player.scheduleSaveToHash = function( signalObj ) {
//  console.log("scheduling save to hash");
  /* оказывается если включить таймер анимации то эта штука не успевает сохранить.. */
  /*
    if (writeTimeoutId) {
      clearTimeout(writeTimeoutId);
      writeTimeoutId = null;
    }
  */
  
  //if (lastWriteTm + 5*1000 > performance.now()) return; // skip if already writted in last 5 seconds

    if (!writeTimeoutId)
      writeTimeoutId = setTimeout( function() {
        player.saveToHash( findRoot( signalObj ) );
        writeTimeoutId = null;
        lastWriteTm = performance.now();
      }, 2500 );
}

player.loadFromHash = function( aname, targetobj ) {
    if (!targetobj) targetobj = player;

    var q = read_from_hash();

    var name = aname || targetobj.saveTreeToHashName || "mvis";
    if (q && q[name]) {
      if (!targetobj) {
        targetobj = player.root;
        console.error( "restoreFromHash: reading deprecated thing vz.root!" );
      }
      return vz.createSyncFromDump( q[name], targetobj, undefined, undefined, true );
    }
    return new Promise( (resolv, reject) => {
      resolv( targetobj );
    });
}

player.startSavingToHash = function( name="mvis",targetobj ) {
  if (!targetobj) targetobj = player;
  targetobj.saveTreeToHashName = name;
};

player.stopSavingToHash = function( targetobj ) {
  targetobj.saveTreeToHashName = undefined;
};

///////////////////////////// впишемся в создание объектов..

vz.chain("create_obj", function( obj, opts ) {
  this.orig( obj,opts );
  setup_obj( obj );
  return obj;
});

}


///////////////////////////////////////
/////////////////////////////////////// ценныя методы


  // пишет в хеш объект
  function write_to_hash(obj) {
    //console.log("write_to_hash",obj);
     var strpos = JSON.stringify( obj );
     //strpos = encodeURIComponent( strpos );
     strpos = strpos.replace(/ /g, "%20");
     if (strpos.length > 1024*1024) {
       console.error("Viewzavr: warning: program state is too long!",strpos.length );
       console.error( strpos );
     }
     // это добавляет историю в браузер а нам не надо ибо много во время особенно анимации вращения
     //location.hash = strpos;
     // а этот вариант историю не добавляет - норм
     history.replaceState(undefined, undefined, "#"+strpos)
  }

  // читает из хеша объект
  function read_from_hash() {
      var oo = {};
       try {
         var s = location.hash.substr(1);
         if (s.length <= 0) return oo;
         // we have 2 variations: use decode and use replace %20.
         // at 2020 we see Russian language in objects, thus we use variant with decode.
         s = decodeURIComponent( s );
         //s = s.replace(/%20/g, " ");
         oo = JSON.parse( s );
       } catch(err) {
         //console.error("read_hash_obj: failed to parse. err=",err);
         var s = location.hash.substr(1);
         console.error("str was",s, "location.hash is ",location.hash);
         // sometimes url may be converted. decode it.
         try {
           //oo = JSON.parse( decodeURIComponent( location.hash.substr(1) ) );
           // если не получилось с decode - попробуем без него
           oo = JSON.parse( location.hash.substr(1) );
         }
         catch (err2) {
           // console.error("read_hash_obj: second level of error catch. err2=",err2);
           // do nothing
         }
       }
     return oo;
  }