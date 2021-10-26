// редактор объекта
// вход: функция perform( tgtobj ) - запускает редактор XML и по нажатию на кнопку вносит правку в объект

import * as G from "./guinode.js" ;


//use xml from "xml-lang xtra-features denis-lang total-logger"
export function create( vz, opts )
{
  /*
  vz.env().feature("xml-lang").then( (env) => {
     dlg = env.createFromXmlNow()
  })

  var xml = vz.env("xml-lang denis-lang total-logger");
  */

  vz.feature("xml-lang");

  var obj = vz.createFromXmlNow( `
    <dlg>
    <column id="col" gap="0.5em">
      <h3 style='margin: 0 !important;'>Редактор объекта</h3>
      <codeflask id="cf"/>
      <div></div>
      <btn id='commitbtn' text="commit"/>
      <span id='status'>status</span>
      </column>
    </dlg>`
  )
  // TODO vz.createFromText( .... )

  var targetobj;

  // мб items уже сократить просто obj.colcommitbtn ?
  // или сделать типа obj.find("commitbtn") - кстати как вариант.. и не надо весь путь указывать..
  //  у нас есть  vz.findObj - попробовать на его базе, мб и правда obj.find
  obj.items.col.items.commitbtn.on("click",parsecode)
  obj.items.col.items.cf.on("enter",parsecode)

  function parsecode () {
       let t = obj.items.col.items.cf.getParam("text");
       try {
        status("parsing");
        targetobj.restoreFromXml( t, true );
        status("done");
        obj.close();
      } catch (err) {
        console.log("edit-object: error",err);
        status( [err.msg,err.details].join("<br/>") )
      }
  }

  // @todo ctrl+enter в codeflask => click

  function status( html ) {
    obj.items.col.items.status.dom.innerHTML = html;
  }

  obj.perform = function(tgtobj) {
    tgtobj.feature("obj_xml");
    
    // кстати а правильно ли это вообще.. мне нужно что-то сделать с объектом,
    // и для этого я населяю его методами.. бред же... и это в данном случае - не мой объект же...
    // формально я не могу с ним что-то делать... да уж....
    let text = tgtobj.dumpToXml();
    obj.items.col.items.cf.setParam("text",text)
    status("")
    obj.showModal();
    targetobj = tgtobj;
  }

  return obj;
}

/// может тут хорошие вещи сделать типа text, targetobject, open?


export function setup( vz ) {

  vz.addItemType( "edit-object","GUI: edit-object", function( opts ) {
    return create( vz, opts );
  }, {guiAddItems: true, guiAddItemsCrit: "gui"} );

}