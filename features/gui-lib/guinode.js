// предназначение - уметь добавить элемент из html
// идея - а что если совместить с контейнером?

/* Выясняется что надо иметь несколько видов dom
   1. dom который собственный элемент объекта. ну есть и все.
   2. dom который втаскивается в родительский объект (т.е. учавствует в комбинации)
   его может и не быть. например для диалогов выяснилось что им надо быть в корне желательно.
   3. dom в который втаскиваются дети, т.е. цель для комбинации.
   она может отличаться от dom (1) потому что мы можем создать обвязку, и детей надо вставлять куда-то внутрь.
*/

/* Получается guinode наш основной объект для создания gui. У него интерфейс - он выдает dom-узел.
   (todo сделать мб - несколько dom-узлов чтобы выдавал - тогда можно делать генератор и group)
   (генератор - чтобы по функции getDomы давал набор дом-ов..)

   Этот же гуиноде играет роль контейнера. Он цепляет детские dom в себя, в obj.combiningDom
   Возможно это стоит вынести отдельно, чтобы можно было делать разного рода контейнеры.

   Далее это садится в screen, а насчет них уже идет модель - показывать какой-то экран.

   И далее к этому guinnode приделаны guinodehtml и qml и еще xml.

   А ну и еще узел layout сделан - он раскладывает элементы в плоскости.
*/

// здесь f это функция создания dom-элемента
export function create( vz, opts, f )
{
  var obj = vz.createObj( { name:"guinode",...opts } );

  /////// собственный html-код
  
  obj.setParamOption("dom","internal",true);
  /*
  obj.addCmd("debug",() => {
    console.log(dom);
  })
  */

  f ||= function() { return document.createElement( opts.tag || opts?.params?.tag || "div") };
  let dom = f();
  obj.dom = dom;

  obj.chain("remove",function() {
    dom.remove();
    this.orig();
  });

  //// поведение контейнера
  // todo надо будет разделить dom и childdom т.к. формально это разное

  obj.outputDom = () => obj.dom;    // выходной дом для кобминаций
  //obj.combiningDom = () => obj?.dom?.children[0] || obj?.dom; // целевой комбинирующий дом
  obj.combiningDom = () => obj.dom; // целевой комбинирующий дом
  obj.inputObjectsList = () => obj.ns.children;

  // вроде как это не работает - children-ы добавляются до того как в объекте появилось dom
  obj.on("appendChild",rescan_children);
  obj.on("forgetChild",rescan_children);

  // это у нас по сути - алгоритм комбинации из SICP.
  // ВОЗМОЖНО его надо будет сделать перенастраиваемым

  //obj.rescan_children = delayed(rescan_children);
  obj.rescan_children = rescan_children;
  
  function rescan_children() {
    clear_viewzavr_dom_children();
    //console.log("rescan_children called on",obj.combiningDom())

    // тут еще вопросы, надо ли так или разделить и сделать по аналогии с rescan_children
    /*
    for (let c of obj.shadow.children) {
       let od = c.outputDom ? c.outputDom() : null;
       if (od) {
           target.appendChild( od );
       }
    }
    */

    /*
      новая логика
      если у объекта есть shadowRoot то рендеринг уходит в него
      а children объекта передаются рендерингу shadow-root как аргумент для подстановки куда выберет этот shadow-root

      идея - использовать прямо dom shadowroot - вроде бы так проще по реализации
      ну а там уж поиграем и будем думать как в других системах это делать если до них дело дойдет вообще
    
    if (obj.shadowRoot) {
      let slot = obj.shadowRoot.find((e) => {
        return e.ns.name === "slot";
      });
    }
    */

    let target  = obj.combiningDom();
    //let inputs = obj.inputObjectsList();
    let inputs = obj.ns.children;
    for (let c of inputs) {
      if (c.protected) continue;
      /*
       if (c.is_shadow_root) {
          const shadow = target.attachShadow({mode: 'open'});
          continue;
       }
       */
       let od = c.outputDom ? c.outputDom() : null;
       if (od) {
          //target.appendChild( od );
          //od.viewzavr_combination_source  = c; // в него прям поселим
        
           if (!Array.isArray(od)) od = [od];
           //od = od.flat(8);
           for (let odd of od) {
             target.appendChild( odd );
             //console.log("adding child dom",odd);
             odd.viewzavr_combination_source  = c; // в него прям поселим
           } 
       }
    }
  }

  function clear_viewzavr_dom_children() {
    var acc = [];
    for (let dc of dom.children) {
      if (dc.viewzavr_combination_source) {
        if (dc.viewzavr_combination_source.protected) continue; 
        acc.push( dc );
      }
    }
    for (let dc of acc)
      dc.remove();
  }

  //// фишка участия во flex-раскладке (пока тут)
  obj.addString("flex","",(v) => {
    dom.style.flex = v;
  })

  obj.addText("style","",(v) => {
    dom.style.cssText = dom.style.cssText + ";" + v; // todo странная вещь - будет расти
  })

  obj.addString("content-padding","0em",(v) => {
    dom.style.padding = v;
  })

  // ну это вестимо да, всем надо..
  obj.addCheckbox("visible",true,(v) => {
    /*
     if (v) dom.removeAttribute("hidden")
      else
     dom.setAttribute("hidden", true)
   */
      //v ? dom.classList.remove("vz_gui_hide") : dom.classList.add("vz_gui_hide");
      
      dom.hidden = !v;
      //dom.style.visibility = v ? 'visible' : 'collapse';
  })
  Object.defineProperty(obj, "visible", { 
     set: function (x) { obj.setParam("visible",x); },
     get: function() { return obj.params.visible; }
  });
  obj.addCmd("trigger_visible",() => { 
    //obj.visible = !obj.visible 
    obj.setParam("visible", !obj.visible, true); // отметка что сделано вручную
  });

  // feature: передать слот
  if (opts?.params?.slot) {
    //obj.dom.slot = opts.params.slot;
    obj.dom.setAttribute("slot",opts.params.slot);
  }
  // это надо для слотов
  if (opts?.params?.name)
    obj.dom.setAttribute("name",opts.params.name);

  if (opts?.params?.class)
    obj.dom.setAttribute("class",opts.params.class);

  // тыркнем родителя
  if (obj.ns.parent?.rescan_children) obj.ns.parent.rescan_children();
  // @todo переделать на нормальную ТПУ

  return obj;
}


export function setup( vz ) {
  vz.addItemType( "guinode","GUI: node", function( opts ) {
    return create( vz, opts );
  }, {guiAddItems: true, guiAddItemsCrit: "gui"} );
  vz.addItemType( "shadow","GUI: node shadow root", function( opts ) {
    return create_shadow( vz, opts );
  }, {guiAddItems: true, guiAddItemsCrit: "gui"} );  

}

/* алгоритм очистки всех чилренов дома */
function clear_dom_children(dom) {
  while (dom.firstChild) 
    dom.removeChild( dom.lastChild );
}


export function create_shadow( vz, opts, f )
{
  var obj = vz.createObjByType( {...opts,type:"guinode"} );

  obj.outputDom = () => null;

  // todo on parentchange
  if (opts.parent) {
     obj.shadow_instance = opts.parent.dom.attachShadow({mode: 'open'});
     obj.combiningDom = () => obj.shadow_instance;
  }

  return obj;
}

/*
export function addStyle( styles ) {
  var styleSheet = document.createElement("style");
  styleSheet.type = "text/css"; styleSheet.textContent = styles;  
  document.head.appendChild(styleSheet)
}

addStyle(".vz_gui_hide { display: none !important; }")
*/

///////////////////////////////////////////

export function delayed( f,delay=0 ) {
  var t;

  var res = function() {
    if (t) return;
    t = setTimeout( () => {
      t=null;
      f();
    },delay);
  }

  return res;
}