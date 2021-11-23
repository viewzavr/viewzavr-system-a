// предназначение - быть экраном

import * as G from "./guinode.js" ;
import * as L from "./layout.js" ;

export function setup( vz ) {

  vz.addItemType( "screen","GUI: screen", {guiAddItems: true, guiAddItemsCrit: "gui"} );
  vz.register_feature( "screen",screen)
  /*

  vz.addItemType( "screen","GUI: screen", function( opts ) {
    return create( vz, opts );
  }, {guiAddItems: true, guiAddItemsCrit: "gui"} );
  */

}

addStyle(`[hidden] {
    display: none !important;
}`)

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

export function screen( obj, opts )
{
  obj.feature("layout");
  //var obj = L.create( vz, {name:"screen",...opts} );
  obj.setParam("visible",false);
  
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

  return obj;
}
