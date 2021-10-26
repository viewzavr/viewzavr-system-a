// предназначение - уметь добавить элемент из QML


/*  для упрощения поиска source можно использовать на этапе инициализации qmlweb:

    var htmldir = (new URL(".", import.meta.url )).toString();
    qmlEngine.addImportPath( htmldir + "qml/" );
*/    

import * as G from "./guinode.js" ;

export function create( vz, opts )
{
  var obj = G.create( vz, {name:"guiqml",...opts} );

  /////// собственный html-код

  obj.addString("source","",gen );

  let dom = obj.dom;
  
  function gen(v) {
    var qmlobj = vz.addQml( obj.params.source, {parent:obj} );
    clear_dom_children( dom );
    if (qmlobj && qmlobj.dom) {
        dom.appendChild( qmlobj.dom );
        qmlobj.dom.style.position = "inherit";

        // feature: transfer parameters from tag to qml
        qmlobj.vzroot = opts.parent ? opts.parent.findRoot() : vzPlayer.getRoot();

        if (opts.params) { // используем хак что параметры передаются и в opts
          // в другом случае - надо дожидаться пока все параметры придут в obj, т.е. вызывать gen в виде delayed
        let pn = Object.keys(opts.params) ; // obj.getParamsNames()
        for (let p of pn) {
          if (p === "id" || p === "source") continue;
          qmlobj[ p ] = opts.params[ p ];
        }
        }
    }
    else
      console.error("guinode-qml: skipped, seems no QML loaded");


    obj.emit("dom_was_changed", )
  };

  // тыркнем родителя
  if (obj.ns.parent?.rescan_children) obj.ns.parent.rescan_children();
  // @todo переделать на нормальную ТПУ

  return obj;
}


export function setup( vz ) {
  vz.addItemType( "qml","GUI: QML node", function( opts ) {
    return create( vz, opts );
  }, {guiAddItems: true, guiAddItemsCrit: "gui"} );

}

/* алгоритм очистки всех чилренов дома */
function clear_dom_children(dom) {
  while (dom.firstChild) 
    dom.removeChild( dom.lastChild );
}
