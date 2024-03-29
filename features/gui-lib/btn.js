// предназначение - уметь добавить элемент из html
// идея - а что если совместить с контейнером?

import * as G from "./guinode.js" ;

export function call_cmd_by_path(obj) {

  obj.callCmdByPath = ( target_path ) => {
      var arr = target_path.split("->");
      if (arr.length != 2) {
        //console.error("btn: cmd arr length not 2!",arr );
        return;
      }
      var objname = arr[0];
      var paramname = arr[1];
      //var sobj = obj.findByPath( objname );
      //R-LINKS-FROM-OBJ
      var sobj = obj.findByPath( objname );
      if (!sobj) {
        console.error("callCmdByPath: cmd target obj not found",objname );
        return; 
      }
      if (!sobj.hasCmd( paramname)) {
        if (typeof( sobj[paramname] ) === "function") {
          sobj[paramname].apply( sobj );
          return;
        }
        console.error("btn: cmd target obj has nor such cmd, nor function",objname,paramname );
        return; 
      }
      sobj.callCmd( paramname );
  }

}

export function create( vz, opts )
{
  var obj = G.create( vz, {name:"button",...opts, tag:'button'} );

  let dom = obj.dom;
  let btn = dom;
  //let btn = document.createElement("button");
  //dom.appendChild( btn );

  function f(o) {
     let acc = [];
     for (let pn of o.getParamsNames()) {
        let gui = o.getGui( pn );
        if (gui?.type == "cmd") acc.push( pn )
     }
     return acc;
  }

  obj.addString("text","vz-btn-clickme",gen);
  obj.feature( "param_alias");
  // vz.libs.param_alias.addParamAlias( obj, "text","value")
  // obj.features.addParamAlias
  obj.addParamAlias("text","value");
  obj.addParamRef("cmd","",f);

  function gen() {
    btn.innerText = obj.params.text;
    obj.emit("dom_was_changed" )
  };
  gen();

  obj.feature("call_cmd_by_path");
  function callcmd() {
    obj.callCmdByPath( obj.params.cmd );
    obj.emit("click");
  }

  obj.addCmd("click",callcmd);

  obj.dom.addEventListener("click",callcmd);

  // тыркнем родителя
  if (obj.ns.parent?.rescan_children) obj.ns.parent.rescan_children();
  // @todo переделать на нормальную ТПУ

  return obj;
}


export function setup( vz ) {
  vz.addItemType( "btn","GUI: button", function( opts ) {
    return create( vz, opts );
  }, {hidegui: true} );

  vz.addItemType( "button","GUI: button", function( opts ) {
    return create( vz, opts );
  } );

  vz.register_feature("call_cmd_by_path",call_cmd_by_path)

}

/* алгоритм очистки всех чилренов дома */
function clear_dom_children(dom) {
  while (dom.firstChild) 
    dom.removeChild( dom.lastChild );
}

/*
dialog:-internal-modal {
    position: fixed;
    top: 0px;
    bottom: 0px;
    max-width: calc((100% - 6px) - 2em);
    max-height: calc((100% - 6px) - 2em);
    overflow: auto;
}
*/