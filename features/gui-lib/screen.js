// предназначение - быть экраном

import * as G from "./guinode.js" ;
import * as L from "./layout.js" ;

addStyle(`[hidden] {
    display: none !important;
}

.vz-screen {
  pointer-events: all !important;
}
`)

export function addStyle( styles ) {
  var styleSheet = document.createElement("style");
  styleSheet.type = "text/css"; styleSheet.textContent = styles;  
  document.head.appendChild(styleSheet)
}

export function addStyleHref( src ) {
  var styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.href = src;
  document.head.appendChild(styleSheet)
}

export function create( vz, opts )
{
  var obj = G.create( vz, {name:"screen",...opts} );
  obj.setParam("visible",false);
  obj.dom.classList.add("vz-screen");
  
  obj.addCmd("activate",() => {
    //qmlEngine.rootObject.setActiveScreen( obj );
    vzPlayer.feature("screens-api");
    vzPlayer.setParam("active_screen",obj,true);
  });
  
  obj.chain("remove",function() {
    //qmlEngine.rootObject.removeScreen( obj );
    this.orig();
  });

  // пока пусть тут будет
  qmlEngine.rootObject.dom.appendChild( obj.dom );
  // хотя это уже вызывает вопрос.

  // правка баги от цсс корявой
  // obj.dom.style.pointerEvents = "all";

  //// поведение visible
  // вообще оно нужно только экрану, и поэтому мб переедет туды
  /* уехало в guinode
  Object.defineProperty(obj, "visible", { 
      set: function (x) { obj.dom.hidden = !x; },
      get: function() { return !obj.dom.hidden; }
    });
  */

  // регаемся в qml-движке но вообще это отсюда уедет - в плеере надо регаться ибо
  // qmlEngine.rootObject.addScreen( obj );

  var init_called;
  obj.trackParam("oninit",(cmd) => {
    if (init_called) return;
    init_called = true;
    obj.feature("call_cmd_by_path");
    obj.callCmdByPath(cmd);
  })

  return obj;
}

export function auto_activate(env) {
  env.activate();
}

export function setup( vz ) {

  vz.addItemType( "screen","GUI: screen", function( opts ) {
    return create( vz, opts );
  }, {guiAddItems: true, guiAddItemsCrit: "gui"} );

  vz.register_feature("auto_activate",auto_activate);

}