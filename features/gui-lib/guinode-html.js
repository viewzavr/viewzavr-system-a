// предназначение - уметь добавить элемент из html
// идея - а что если совместить с контейнером?

import * as G from "./guinode.js" ;

export function create( vz, opts )
{
  var obj = G.create( vz, {name:"guihtml",...opts} );

  /////// собственный html-код

  let dom = obj.dom;

  obj.addText("text","<div/>",gen );
  
  
  function gen(v) {
    /*
    var parser = new DOMParser();
    var doc = parser.parseFromString(v, "text/html");
    var newnode = doc.body.children[0];
    */
    // 1 добавим свой код
    //clear_all_children( dom ); dom.appendChild( newnode );
    dom.innerHTML = v;
    // 2 комбинация - добавляем детей
    obj.rescan_children(); 

    obj.emit("dom_was_changed", )
  };

  obj.trackParam("textisinternal",function() {
    if (obj.params.textisinternal) {
       obj.setParamOption("text","internal",true)
       obj.setParamOption("textisinternal","internal",true)
    }
  })

  // тыркнем родителя
  if (obj.ns.parent?.rescan_children) obj.ns.parent.rescan_children();
  // @todo переделать на нормальную ТПУ

  return obj;
}


export function setup( vz ) {
  vz.addItemType( "guinodehtml","GUI: HTML node", function( opts ) {
    return create( vz, opts );
  }, {guiAddItems: true, guiAddItemsCrit: "gui"} );

}

/* алгоритм очистки всех чилренов дома */
function clear_dom_children(dom) {
  while (dom.firstChild) 
    dom.removeChild( dom.lastChild );
}
