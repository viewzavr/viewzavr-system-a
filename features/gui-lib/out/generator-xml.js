// предназначение - уметь добавить элемент на XML где узлы это вьюзавр-объекты
// собственно это вроде как язык Дениса

// xml-генератор сделан так что весь указанный xml преобразует в детей target"
// предыдущий вариант был - только первый узел.
// идеи на будущее - сделать вариант и для среды.
// а этот оставить на случай чтобы можно было на xml ваять программно.
// (впрочем и для этого варианта желательно иметь просто функцию)

import * as G from "./guinode.js" ;
import * as GH from "./guinode-html.js" ;

export function create( vz, opts )
{
  var obj = vz.createObj( {name:"generator-xml",...opts} )

  /////// собственный html-код

  obj.addText("text","<group/>",gen );
  // @idea параметр target   
  // @idea fallback в html сделать опциональным
  
  function gen(v) {
    
    var parser = new DOMParser();
    var v2 = "<group>"+v+"</group>";
    var doc = parser.parseFromString(v2, "text/xml");

    if (doc?.body?.firstChild?.nodeName === "parsererror") {
       console.log("generator-xml: parse error",doc?.body?.firstChild)
       return;
    }

    var newnode = doc.children[0];
    var dump = xml2dump_with_fallback( newnode, vz );

    //var dump2 = { children: {} };
    //dump2.children[ dump.type ] =  dump;

    obj.restoreFromDump( dump ).then( () => {

       // перекидываем понаделанное
       var target = obj.ns.parent;

       for (let c of target.ns.children) {
         if (c.generator === obj) c.remove();
       }

       for (let cname of obj.ns.getChildNames()) {
         let c = obj.ns.getChildByName( cname );
         c.generator = obj;
         target.ns.appendChild( c, cname );
       }
       // надо бы параметры сох-ра-нить @todo

    })
    
    // 1 добавим свой код
    //clear_all_children( dom ); 
    //dom.appendChild( newnode );
    
    // 2 комбинация - добавляем детей
    //obj.rescan_children();

    obj.emit("dom_was_changed" )
  };

  // тыркнем родителя
  // if (obj.ns.parent?.rescan_children) obj.ns.parent.rescan_children();
  // @todo переделать на нормальную ТПУ

  return obj;
}


export function setup( vz ) {
  vz.addItemType( "generator-xml","Gui: XML", function( opts ) {
    return create( vz, opts );
  }, {guiAddItems: true, guiAddItemsCrit: "gui"} );

  vz.addItemType( "group","Gui: XML group", function( opts ) {
    return vz.createObj( opts ); // пустышка
  }, {guiAddItems: true, guiAddItemsCrit: "gui", hidegui: true } );

}

/* алгоритм очистки всех чилренов дома */
function clear_dom_children(dom) {
  while (dom.firstChild) 
    dom.removeChild( dom.lastChild );
}



function xml2dump_with_fallback(xml,vz) {
  var res = {
    params: {},
    children: {},
    forcecreate: true
  };

  if (xml.nodeType != 1) return res;

  res.type = xml.nodeName;

  if (!vz.getTypeInfo( res.type )) {
    // нету там такого типа - но у нас фаллбек
    res.type = "guinodehtml";
    res.params["text"] = xml.outerHTML;
  }

  if (xml.attributes.length) // element with attributes  ..
    for (var i = 0; i < xml.attributes.length; i++)
      res.params[xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue || "").toString();

  let counter=0;
  for (var n = xml.firstChild; n; n = n.nextSibling) {
    if (n.nodeType == 1) {
      let c = xml2dump_with_fallback(n,vz);
      //res.children.push(c)
      res.children[ `${c.type}_${counter.toString()}` ] = c;
      counter++;
    }
  }

  return res;
}

// https://goessner.net/download/prj/jsonxml/
function xml2dump(xml) {
  var res = {
    params: {},
    children: {},
    type: xml.nodeName,
    manual: true
  };
  if (xml.nodeType != 1) return res;

  if (xml.attributes.length) // element with attributes  ..
    for (var i = 0; i < xml.attributes.length; i++)
      res.params[xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue || "").toString();

  let counter=0;
  for (var n = xml.firstChild; n; n = n.nextSibling) {
    if (n.nodeType == 1) {
      let c = xml2dump(n);
      //res.children.push(c)
      res.children[ `${c.type}_${counter.toString()}` ] = c;
      counter++;
    }
  }

  return res;
}
