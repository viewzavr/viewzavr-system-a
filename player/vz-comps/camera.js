// как ее сохранять - как обычные параметры (плеера) или как-то по-другому?
// как бы организовать доступ для управления через формулы? создать отдельный объект?

export function create( vz, opts )
{
  var obj = vz.createObj( Object.assign( { name: "camera" }, opts )); //, parent: opts.parent } );
  
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
    if (i_set_camparam) return; // защита от воздействия установки параметра cameraInfo
    obj.setParam( "cameraCenter",v );
    updateCameraInfo();    
  });

  qmlEngine.rootObject.cameraPosRealChanged.connect( obj, function(v) {
    if (i_set_camparam) return; // защита от воздействия установки параметра cameraInfo
    obj.setParam( "cameraPos",v );
    updateCameraInfo();
  });
  
  var updateCameraInfo = delayed( function() {
    i_set_caminfo = true;
    obj.setParam( "cameraInfo",  qmlEngine.rootObject.cameraPos.concat( qmlEngine.rootObject.cameraCenter ) );
    i_set_caminfo = false;
  });
  
  obj.setParam( "cameraInfo",[0,0,0,0,0,0] );
  obj.setParamOption( "cameraInfo","internal",true );
  obj.setParamOption( "cameraInfo","maylink",function(o,pname) {
    if (pname.match(/camera/)) return 10; // приоритет
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

  vz.addItemType( "camera","Camera", function( opts ) {
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