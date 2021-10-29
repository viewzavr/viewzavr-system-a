// предназначение - редактор кода https://github.com/kazzkiq/CodeFlask#usage

import * as G from "../guinode.js";
import * as S from "../screen.js";
//import CodeFlask from "https://unpkg.com/codeflask@1.4.1/build/codeflask.module.js";
import CodeFlask from "./codeflask-distr/codeflask.module.js";

/*
S.addStyle(`)
.codeflask--has-line-numbers .codeflask__flatten {
    width: inherit;
}
`);
*/

export function create( vz, opts )
{
  var obj = G.create( vz, {name:"flask-editor",...opts} );

  obj.dom.style.width = "600px";
  obj.dom.style.height = "400px";
  obj.dom.style.position = 'relative'; // без этого кодефласк пучит
  obj.dom.style.border = "1px solid grey";

  obj.dom.addEventListener('keydown', function(e) {
    //console.log(e)
      if ( e.ctrlKey && e.key == 'Enter') {
        console.log("emitting");
         obj.emit("enter");
         e.preventDefault = true;
      }
    /*
       if ( e.ctrlKey && ( String.fromCharCode(e.which) === 'm' || String.fromCharCode(e.which) === 'M' ) ) {
         toggleView();
       };
       */
    }, false);
  /////////////////////////// 


  obj.addString("language",opts.params.language || "html");
  obj.addText("text","",(v) => {
    if (obj.flask) obj.flask.updateCode( v )
  });

  function setup() {
    //let flask = new CodeFlask( obj.dom, { language: obj.params.language, lineNumbers: true });
    let flask = new CodeFlask( obj.dom, { language: obj.params.language,lineNumbers: false });
    flask.updateCode( obj.params.text )
    flask.onUpdate(function(code) {
        obj.setParam("text",code);
    });
    //obj.dom.appendChild( flask );
    obj.flask = flask;
  } 

  setup();

  // тыркнем родителя
  //if (obj.ns.parent?.rescan_children) obj.ns.parent.rescan_children();
  // @todo переделать на нормальную ТПУ

  return obj;
}


export function setup( vz ) {
  vz.addItemType( "codeflask","GUI: flask code editor", function( opts ) {
    return create( vz, opts );
  }, {guiAddItems: true, guiAddItemsCrit: "gui"} );
}

/* алгоритм очистки всех чилренов дома */
function clear_dom_children(dom) {
  while (dom.firstChild) 
    dom.removeChild( dom.lastChild );
}
