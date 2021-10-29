// показывает гармошку параметров заданных объектов
// вход input список объектов
// хотя вот у Дениса это список путей, и даже со звездочками.. как быть?
// я сделал еще круче, по критерию - а оказалось не удобно.. (хотя может не универсально?)
// в том плане что набор путей со звездочками - сводится к стандартному варианту (множества объектов)
// а вот список категорий уже не сводится.. хм.. может быть и в этом дело, надо попробовать..
// кстати вот если мы заменим категорию на фичу - тогда можно искать объекты по именам и по фичам../
// и это будет вполне себе универсально, кажется.
// итого: на вход подается набор строк. каждая строка определяет поисковый запрос.
// результатом будет объединение поисковых запросов (для пересечения найдем другие варианты..)
// ну и например так:
/*
   /some/object/path
   regex object/path/regex
   *path/with/glob - можно тут * заменять на .+ так-то
   (feature-name & feature-name2)
   кстати да. можно через пробел указывать - имена фич. и тогда по ним & выполняется.
   ну а в разных строчках - это or. и тогда это будет вполне себе.
   и в имена фич звездочки добавить - это regex.
   можно кстати | и это замена перевода строки, как вариант.
   единственное как отличить - перед нами путь или имя фичи...
   (по фичам реально кажется искать удобно.. это просто как признаки такие, вхождение в множество.. мм..)
   **FILE_* /**  - вот, покажет все что внутри FILE находится.. непонятно только, звездочка это что? имя, или любая подстрока?
   @cinema_visual_artifact - и договор, назначать эти метки синема-артефактам. удобно. удобно!

   и еще непонятно у addObjects. У них на вход идет критерий (список строк..). А на выходе для апи - список уже объектов, было бы удобно. Ну или список путей.
   я думаю что список объектов. Просто странно если мы говорим obj.setParam("objects","criteria") а затем obj.getParam("objects") и это список объектов (да даже и путей)
   это по идее разные вещи.
   Но вообще-то это механизм. Он как бы отдельный, он в целом - как под-объект. И у него есть входные параметры (criteria) и выходные (objects-list).
   Странно это все. Да и механизмы поиска могут измениться..

   Наверное тут проще - список объектов на вход. Ну на худой конец список путей. Но таких, железных. И все..

   Мысль такая - addObjects должна хранить строку, а выдавать на выход отдельной каллбекой - список полученных объектов.
   тогда параметр это строка, критерий, у него свой гуи даже, а результат - хранится отдельно.

   Ну и еще, addObjRef - из этой же оперы товарищ. Но там хитрость что это один объект. У него поэтому гуи другое...
*/

import * as G from "../guinode.js" ;
import * as S from "../screen.js" ;

//var VZXML = await IT.import("viewzavr-player/features/vz-xml.js");
//var VZXML = await IT.import("vz-xml");

export function setup( vz ) {
  vz.addType( "objects-guis", objects_guis, {title: "GUI: objects guis"} );
}

// todo превратить addStyle в фичу плеера
S.addStyle(`
.vz-object-btn {
    width:150px;
    white-space: normal;
    word-break: break-all;
}
`)

///////////////////////////////////////////////////

function objects_guis( vz, opts ) {
  var obj = vz.createObj( opts );
  obj.feature("xml-lang find_by_criteria");

  //vz.createFromXmlNow(`<guinode/>`,null,opts.parent,opts.name || "objects_guis" );

  obj.outputDom = () => {
    return obj.ns.children.map( (c) => c.outputDom() ).flat(2);
  }

  obj.addObjects( "objects","",regen);
  // но и это тупняк - в том плане что не указать рут и только в том же дереве что и.
  // ну пока так.

  //obj.setParamOption("objects_criteria","internal",true) // нефиг там
  //obj.setParam("input",[]);
  //obj.trackParam("input",regen);

  function regen(list) {
    if (!list) return;
    //let list = obj.params.objects || [];
    //list ||= obj.params.objects || [];

    let s = "";

    function xmlfor( c ) {
      let q = "";
      
      if (obj.params.recursive) {
        for (let cc of c.ns.children) {
          if (vz.getObjType( cc ) != "link")
              q += xmlfor( cc );
        }
      }

      if (obj.params.removable && c.ismanual()) 
         q += `<btn style="width:150px;margin-top:5px;" text="удалить" cmd="${c.getPath()}->remove"/>`;

      return `<column> 
          <row>
            <btn class='vz-object-btn' text="${c.params.title || c.ns.name}" cmd="../../edit-params-col->trigger_visible"/>
            <checkbox id="cbb" checked_link="${c.getPath()}->visible" checked_link_to="${c.getPath()}->visible @manual" features="disable_dump"/>
          </row>
          <column id="edit-params-col" visible="false" class='extras-params-pane'>
            <edit-params input="${c.getPath()}" except="visible"/>
            ${q}
          </column>
      </column>`;
    }
    // <link id="qqqq" from="../cbb->checked" to="${c.getPath()}->enabled"/>

    for (let c of list) {
      if (typeof(c) === "string") c = obj.findByPath( c );
      if (c)
          s += xmlfor( c );
    }

    // спорный момент, но пока оставим его так.
    // проблема - когда происходит пересчет, мы теряем настроенное состояние - 
    // распахнуто или схлопнуто список параметров того или иного объекта.

    //var d = obj.dump(); // keep visibilities

    obj.childrenFromXml( s, true, false );

    //if (d) {
      //console.log("ururur d=",d)
      //obj.restoreFromDump( d, true ); // keep visibilities
    //}
    //obj.emit("dom-changed");
    if (obj.ns.parent)
        obj.ns.parent.emit("appendChild"); // надо тыркнуть чтобы перерендерилось
    else
      debugger;
  }

  regen();

  return obj;
}
