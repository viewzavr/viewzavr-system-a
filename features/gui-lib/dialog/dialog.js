// предназначение - показать диалог.

import * as G from "../guinode.js" ;
import * as S from "../screen.js" ;

// иначе немодальный диалог болтается внизу
S.addStyle( `
dialog {  
    position: fixed;
    top: 0px;
    bottom: 0px;
    max-width: calc((100% - 6px) - 2em);
    max-height: calc((100% - 6px) - 2em);
    z-index: 11000;
}

dialog .vz-dlg-close {
    position: absolute;
    right: 2px; top: 2px;
    cursor: pointer;
}
`)

export function create( vz, opts )
{
  var obj = G.create( vz, {name:"dialog",...opts, tag: "dialog"} );

  dialog_polifill_feature( obj.dom,vz );

  document.body.appendChild( obj.dom );

  obj.outputDom = null;

  obj.show = () => { obj.emit("show"); obj.dom.show(); }
  obj.showModal = () => { obj.emit("show"); obj.dom.showModal(); }
  // совместимость - надоело запоминать что там
  obj.open = obj.show;
  obj.openModal = obj.showModal;

  obj.close = (ret) => { obj.dom.close(ret); obj.emit("close"); }

  //obj.addCmd( "show", () => obj.show() );
  obj.addCmd( "show_modal", () => obj.showModal() );
  //obj.addCmd( "close", () => obj.close() );
  // вот почему у меня тут разные наименования? не знаю..

  // фича мышкой закрывать диалоги
  // я редактировал длинный код и два раза кликнул и оно закрылось. это был криминал.
  // либо надо спрашивать перед закрытием...
  // obj.dom.addEventListener("dblclick", obj.close);

  // фича крестик
  var cr = document.createElement("span");
  cr.innerText = "X";
  cr.classList.add("vz-dlg-close");
  cr.addEventListener("click", obj.close);
  //var s = obj.dom.attachShadow({mode: 'open'});
  obj.dom.appendChild( cr );

  return obj;
}


export function setup( vz ) {
  // dlg потому что dialog есть в html5
  vz.addItemType( "dlg","GUI: dialog", function( opts ) {
    return create( vz, opts );
  }, {guiAddItems: true, guiAddItemsCrit: "gui"} );

}


///////////////////////////////////////////////
// dialog нету в файрфокс - используем полифилл

if (false) S.addStyle( `
dialog {
  position: absolute;
  left: 0; right: 0;
  width: -moz-fit-content;
  width: -webkit-fit-content;
  width: fit-content;
  height: -moz-fit-content;
  height: -webkit-fit-content;
  height: fit-content;
  margin: auto;
  border: solid;
  padding: 1em;
  background: white;
  color: black;
  display: block;
}

dialog:not([open]) {
  display: none;
}

dialog + .backdrop {
  position: fixed;
  top: 0; right: 0; bottom: 0; left: 0;
  background: rgba(0,0,0,0.1);
}

._dialog_overlay {
  position: fixed;
  top: 0; right: 0; bottom: 0; left: 0;
}

dialog.fixed {
  position: fixed;
  top: 50%;
  transform: translate(0, -50%);
}
`) // это копипаста из их css

import dialogPolyfill from "./dialog-polyfill/dist/dialog-polyfill.esm.js"
function dialog_polifill_feature( dom, vz ) {
   //S.addStyleHref( vz.getDir( import.meta.url.split ) + ) - не надо, сделал копипасту
   dialogPolyfill.registerDialog( dom );
}