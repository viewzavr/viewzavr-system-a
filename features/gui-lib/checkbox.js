// предназначение - уметь добавить элемент из html
// идея - а что если совместить с контейнером?

import * as G from "./guinode.js" ;

var cbcounter=0;
export function create( vz, opts )
{
  var obj = G.create( vz, {name:"text",...opts} );
  var myid = `autocheckbox_${cbcounter++}`;

  var cb = document.createElement("input");
  cb.id = myid;
  obj.dom.appendChild( cb );
  var label = document.createElement("label");
  label.htmlFor = myid;
  obj.dom.appendChild( label );
  //var obj = vz.createFromXmlNow( `<div><input type='checkbox' id='${myid}'/><label for='${myid} id='labla'/></div>`)
  cb.type="checkbox";
  
  cb.checked = true;
  obj.addCheckbox("checked",true,(v) => {
    if (v === "false" || v === "no") v = false;
    cb.checked = v;
  })

  cb.addEventListener("change",function() {
    obj.setParam("checked",cb.checked,true);
  });

  /////////////////////

  obj.addString("text","",gen);

  /// фича value
  obj.feature("param-alias");
  obj.addParamAlias("text","value");

  function gen() {
    label.innerHTML = obj.params.text;
  };

  return obj;
}

export function setup( vz ) {
  vz.addType( "checkbox",create, "GUI: checkbox", {guiAddItems: true, guiAddItemsCrit: "gui"} );
}