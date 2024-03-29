// как ее сохранять - как обычные параметры (плеера) или как-то по-другому?
// как бы организовать доступ для управления через формулы? создать отдельный объект?

export function create( vz, opts )
{
  var obj = vz.createObj( Object.assign( { name: "camera" }, opts )); //, parent: opts.parent } );
  
  // гуи
  obj.addArray( "cameraPos", [], 3 );
  obj.addArray( "cameraCenter", [], 3 );
  
  // todo: active camera.. (of player root?)
  
  obj.setParam( "cameraPos", qmlEngine.rootObject.scene3d.cameraPos );
  
  obj.trackParam( "cameraPos", function() {
    var cp = obj.getParam("cameraPos");
//    console.log( "cameraPos param changed to",cp );
    if (cp && cp.length && cp.length == 3)
      qmlEngine.rootObject.scene3d.cameraPos = cp;
  });
  obj.setParam( "cameraCenter", qmlEngine.rootObject.scene3d.cameraCenter );
  obj.trackParam( "cameraCenter", function() {
    var cp = obj.getParam("cameraCenter");
//    console.log( "cameraCenter param changed to",cp );
    if (cp && cp.length && cp.length == 3)
      qmlEngine.rootObject.scene3d.cameraCenter = cp;
  })
  ;

  qmlEngine.rootObject.scene3d.cameraCenterChanged.connect( obj, function(v) {
    if (i_set_camparam) return; // защита от воздействия установки параметра cameraInfo
    // @todo разобраться отдельно - получается что камеры все реагируют на экран
    // выставляя себе параметр будто он выставлен руками
    /// и при этом они конечно должны реагировать - некоторые алгоритмы считают что так и будет
    // (т.е. быть может это должно быть и опцией)ы
    // update вводим спец-флаг насчет manual - considerParamsManual

    obj.setParam( "cameraCenter",v, obj.considerParamsManual );
    updateCameraInfo();
  });

  qmlEngine.rootObject.scene3d.cameraPosRealChanged.connect( obj, function(v) {
    if (i_set_camparam) return; // защита от воздействия установки параметра cameraInfo
    obj.setParam( "cameraPos",v, obj.considerParamsManual );
    updateCameraInfo();
  });
  
  var updateCameraInfo = delayed( function() {
    i_set_caminfo = true;
    var p = qmlEngine.rootObject.scene3d.cameraPos;
    var c = qmlEngine.rootObject.scene3d.cameraCenter;
    var arr = [ p[0],p[1],p[2], c[0], c[1], c[2] ]; // такой расклад т.к. p,c могут быть float32array внезапно и concat у них нет
    obj.setParam( "cameraInfo", arr );
    i_set_caminfo = false;
  });

  

  ////////////////////////////// тема cameraInfo - оказалось полезно иметь все в 1 массиве
  obj.addArray( "cameraInfo", [], 3 );
  
  obj.setParam( "cameraInfo",[0,0,0,0,0,0] );
  obj.setParamOption( "cameraInfo","internal",true );

  obj.setParamOption( "cameraInfo","maylink",function(o,pname) {
    if (pname.match(/camera/)) return 10; // приоритет
    return true; // чето динамические эти штуки не срабатывают
    var v = o.getParam(pname);
    return Array.isArray(v) || v === undefined || v === null; //&& pname.match(/camera/);
  });
  
  var i_set_caminfo = false;
  var i_set_camparam = false;
  obj.trackParam( "cameraInfo", function() {
    if (i_set_caminfo) return; // защита от пере-установки параметров если это мы установили cameraInfo из параметров
    //if (!(Array.isArray(obj.params.cameraInfo)) return;
    if (!obj.params.cameraInfo?.slice) return;
    i_set_camparam = true;
    //console.log("setting cam params");
    obj.setParam("cameraPos", obj.params.cameraInfo.slice(0,3) );
    obj.setParam("cameraCenter", obj.params.cameraInfo.slice(3,6) );
    i_set_camparam = false;
  });
  
  return obj;
}


export function setup( vz ) {

  vz.addItemType( "camera","Camera: Camera", function( opts ) {
    return create( vz, opts );
  } );

}

// todo move to vz
export function delayed( f,delay=0 ) {
  var t;
    
  var res = function() {
    if (t) return;
    t = setTimeout( () => {
      t=null;
      f();
    },delay);
  }
    
  return res;
}