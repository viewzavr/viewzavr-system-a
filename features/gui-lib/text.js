// предназначение - текстовый элемент
// идея - а что если совместить с контейнером?

import * as G from "./guinode.js" ;

export function create( vz, opts )
{
  var obj = G.create( vz, {name:"text",...opts, tag:'span'} );
  
  obj.addString("text","",gen);

  /// фича value
  obj.feature( "param_alias");
  obj.addParamAlias("text","value");

  function gen() {
    obj.dom.innerText = obj.params.text;
  };
  gen();

  return obj;
}

export function setup( vz ) {
  vz.addType( "text",create, "GUI: text", {guiAddItems: true, guiAddItemsCrit: "gui"} );
}