// предназначение - создать набор контролов для редактирования параметров объекта
// input - входной объект
// except - фильтр параметров

// idea - следовало бы на вход давать не объект, а именно список параметров (или их гуи-записей)
// но иногда нам нужен объект для подписок, сейчас он доступен в rec.obj но надо понять а может стоит самой rec обеспечить все необходимое?

import * as L from "./layout.js" ;
import * as G from "./guinode.js" ;

export function create( vz, opts )
{
  var obj = L.create( vz, {name:"edit-params",...opts} );

  obj.feature("delayed");
  var update = obj.delayed(update2);
  
  obj.setParam("flow","column");
  obj.addObjRef("input",null,null,(o) => update())
  obj.addString("except","",update);
  obj.addString("only","",update);
  obj.trackParam("visible",(v) => {
     //debugger;
  })
 
  let remove_subscription;
  function update2() {

    obj.ns.removeChildren();
    let o = obj.params.input;
    if (remove_subscription) remove_subscription();

    if (!o) {
       let t2 = vz.createObjByType("text",{parent:obj});
       t2.setParam("text","no object");
       return;
    }
    
    remove_subscription = subscribe_to_many( o,["gui-added","gui-removed", "gui-visible-changed"], () => {
        update();
      });

    let except = (obj.params.except || "").trim().split(/\s+/);
    let only = (obj.params.only || "").trim(); //.split(/\s+/);

    if (!o) return;
    let names = o.getGuiNames();

    if (names.length == 0) {
      let t2 = vz.createObjByType("text",{parent:obj});
      t2.setParam("text","no parameters");
      return; 
    }

    for (let name of names) {
        if (except.indexOf(name) >= 0) continue;
        if (only && only.length && only.indexOf(name) < 0) continue;
        let gui = o.getGui(name);
        if (!gui) continue;

        //let t = vz.createObjByType("guinodehtml",{parent:obj,tag:"div"});
        //t.setParam("text",`${name}(${gui.type})<br/>`);
        

        var fn = tablica[ gui.type ];
        if (fn) {
          

          let g  = fn( obj,gui,o )
          g.feature("disable_dump");
          //g.dump = () => {}; // не надо ево сохранять

          trackVisible( gui, g );
        }
        else {
          console.log("edit-params: gui not supported",gui.type,name,o.getPath() );
          //let t = vz.createObjByType("text",{parent:obj});
          //t.setParam("text",`${name}(${gui.type})`);
        }
    }
  }

  obj.chain("remove",function() {
    if (remove_subscription) remove_subscription();
    this.orig();
  })

  update();

  return obj;
}


export function setup( vz ) {

  vz.addType( "edit-params",create,"GUI: edit params" );
  init_param_guis( vz );

}

function subscribe_to_many( obj, events, fn ) {
  let arr = [];
  for (let n of events) {
    arr.push( obj.on( n, fn) )
  }
  return function() {
    for (let cb of arr)
      cb();
  }
}


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

// ------------------------------------------------

var tablica = {};

function add( type, fn ) {
    tablica[ type ] = fn;
}

function init_param_guis(vz) {
    // rec - описание gui-объекта, g - qml-штука его визуальнога образа
    add( "slider", function( editor, rec, o ) {
      let t = vz.createObjByType("text",{parent:editor});
      t.setParam("text",rec.getTitle());
      var co = vz.createObjByType("row",{parent:editor});
        var te = vz.createObjByType( "input", {parent:co, params: {type: "text"}} );
        te.setParam("style","width:40px;");

      var g = vz.createObjByType( "slider", {parent:co} );
      g.setParam("style","width:100px;");

      g.setParam("min",rec.min || 0);
      g.setParam("max",rec.max || 100);
      g.setParam("step",rec.step || 1);
      g.setParam("value",rec.value );
      g.setParam("sliding",rec.obj.getParamOption( rec.name,"sliding" ) === false ? false : true )

      var b1 = g.trackParam("value",() => {
         rec.setValue( g.params.value );
      })

      var b2 = rec.obj.trackParam( rec.name,() => {
        var qq = rec.obj.getParam( rec.name );
        g.setParam( "value", qq );
      })

      g.chain("remove",function() {
        b1(); b2();
        this.orig();
      });

      
      var vals = rec.obj.getParamOption( rec.name,"values");
      if (vals) {
         // особый режим однако
         // замысел в том чтобы в едите показывать таки финальное значение
         // из списка values. а не индекс.
         g.trackParam("value",(v) => {
            te.setParam("value", vals[v] || "" );
         })
         te.trackParam("value",(v) => {
          var v0 = v;
                v = parseFloat( v );
                if (isNaN(v))
                  return;
                  //v = rec.min;
                else
                {
                  var nearest_i = -1;
                  var nearest_dist = 1e10;
                  for (var i=0; i<vals.length; i++) {
                    var d = Math.abs( vals[i] - v );
                    if (d < nearest_dist) {
                      nearest_dist = d;
                      nearest_i = i;
                      if (d <= 0) break;
                    }
                  }
                  v = nearest_i;
                }
                
                g.setParam("value",v);
         });
         g.signalParam("value");
      }
      else
      {
        te.linkParam( "value", g.getPath() + "->value");
        //g.linkParam( "value", te.getPath() + "->value");
        // там бывает текст прилетает и надо парсить
        te.trackParam( "value", (v) => {
           v = parseFloat( v ); 
           g.setParam("value",v);
        })
        //g.signalParam("value");
        te.setParam("value", g.params.value || "" );
      }

      t.linkParam("visible", g.getPath() + "->visible" );

      return g;
      
    });

    add( "float", function( editor, rec, o ) {
      let t = vz.createObjByType("text",{parent:editor});
      t.setParam("text",rec.getTitle() );

      function val2s( f ) {
        //if (isFinite(f)) return f.toFixed(4);
        if (isFinite(f)) return f.toString();
        return f;
      }

      var g = vz.createObjByType( "input", {parent:editor} );
      g.setParam("value",val2s(rec.value) ); // todo сделать нормальный tostring для неподходящих значений
      var b1 = g.trackParam("value",() => {
         rec.setValue( parseFloat(g.params.value) );
      })

      var b2 = rec.obj.trackParam( rec.name,() => {
        var qq = rec.obj.getParam( rec.name );
        g.setParam( "value", val2s(qq) );
      })

      g.on("remove",function() {
        b1(); b2();
      })

      t.linkParam("visible", g.getPath() + "->visible" );

      return g;
    
    });

    ////////////////////////////////////////////////////
    add( "string", function( editor, rec, o ) {
      let t = vz.createObjByType("text",{parent:editor});
      t.setParam("text",rec.getTitle() );

      function val2s( f ) {
        //if (isFinite(f)) return f.toFixed(4);
        if (isFinite(f)) return f.toString();
        return f;
      }

      var g = vz.createObjByType( "input", {parent:editor} );
      g.setParam("value",val2s(rec.value) ); // todo сделать нормальный tostring для неподходящих значений
      var b1 = g.trackParam("value",() => {
         rec.setValue( g.params.value );
      })

      var b2 = rec.obj.trackParam( rec.name,() => {
        var qq = rec.obj.getParam( rec.name );
        g.setParam( "value", val2s(qq) );
      })

      g.on("remove",function() {
        b1(); b2();
      })

      t.linkParam("visible", g.getPath() + "->visible" );

      //var g = vz.createObjByType( "datalist", {parent:editor} );

      return g;
    
    });

    add( "checkbox", function( editor, rec, o ) {
      //let t = vz.createObjByType("text",{parent:editor});
      //t.setParam("text",tr(vz,rec.name) );

      var g = vz.createObjByType( "checkbox", {parent:editor} );
      g.setParam("text",rec.getTitle() );


      g.setParam("checked",rec.value );

      g.trackParam("checked",(v) => {
         rec.setValue( v );
      })

      var b2 = rec.obj.trackParam( rec.name,(v) => {
        g.setParam( "checked", v );
      })

      g.on("remove",function() {
        b2();
      });

      //t.linkParam("visible", g.getPath() + "->visible" );

      return g;
      
    });

    add( "combo", function( editor, rec, o ) {
      let t = vz.createObjByType("text",{parent:editor});
      t.setParam("text",rec.getTitle() );

      var g = vz.createObjByType( "list", {parent:editor} );

      g.setParam("items", rec.getValues() )

      g.setParam("current_index",rec.value.toString() );
      var b1 = g.trackParam("current_index",() => {
         rec.setValue( g.params.current_index );
      })

      var b2 = rec.obj.trackParam( rec.name,() => {
        var qq = rec.obj.getParam( rec.name );
        g.setParam( "current_index", qq );
      })

      g.on("remove",function() {
        b1(); b2();
      });

      t.linkParam("visible", g.getPath() + "->visible" );

      return g;
    
    });

    add( "combovalue", function( editor, rec, o ) {
      let t = vz.createObjByType("text",{parent:editor});
      t.setParam("text",rec.getTitle() );

      var g = vz.createObjByType( "list", {parent:editor} );
      //g.setParam("items", rec.getValues() )
      var vals = rec.getValues() || [];
      // idea - rec.obj.emit("gui-connect", rec.name) ?
      //var vals = rec.obj.getParamOption( rec.name,"values" ) || [];

      g.setParam("items", vals );

      var i = vals.indexOf( rec.value );
      if (i < 0 && rec.notFound) {
          i = rec.notFound( rec.value, vals );
          console.log("YYYYYYYYYYYYYYYY Rescan issued. rec.value=",rec.value, "lookup table=",vals, "new i=",i)
      }
      g.setParam("current_index",i );

      var b1 = g.trackParam("current_index",() => {
         rec.setValue( vals[ g.params.current_index ] );
      });

      var b2 = rec.obj.trackParam( rec.name,() => {
        var qq = rec.obj.getParam( rec.name );
        g.setParam( "current_index", vals.indexOf(qq) );
      })

      g.on("remove",function() {
        b1(); b2();
      });

      rec.obj.trackParamOption( rec.name,"values", (nv) => {
        // g.setParam("items", nv ) ;
        vals = rec.getValues() || [];
        //vals = nv;
        g.setParam("items",vals );
      })

      t.linkParam("visible", g.getPath() + "->visible" );

      return g;
    });    


    add( "editablecombo", function( editor, rec, o ) {
      let t = vz.createObjByType("text",{parent:editor});
      t.setParam("text",rec.getTitle() );

      var g = vz.createObjByType( "editable_combo", {parent:editor} );
      //g.setParam("items", rec.getValues() )
      var vals = rec.getValues() || [];
      // idea - rec.obj.emit("gui-connect", rec.name) ?
      //var vals = rec.obj.getParamOption( rec.name,"values" ) || [];

      g.setParam("items", vals );
      g.setParam("value",rec.value);

      var b1 = g.trackParam("value",(v) => {
         rec.setValue( v );
      });

      var b2 = rec.obj.trackParam( rec.name,() => {
        var qq = rec.obj.getParam( rec.name );
        g.setParam( "value", qq );
      })

      g.on("remove",function() {
        b1(); b2();
      });

      rec.obj.trackParamOption( rec.name,"values", (nv) => {
        // g.setParam("items", nv ) ;
        vals = rec.getValues() || [];
        //vals = nv;
        g.setParam("items",vals );
      })

      t.linkParam("visible", g.getPath() + "->visible" );

      return g;
    });
    

    add( "color", function( editor, rec, o ) {
      let t = vz.createObjByType("text",{parent:editor});
      t.setParam("text",rec.getTitle() );

      var g = vz.createObjByType( "selectcolor", {parent:editor} );
      
      g.setParam("value",rec.value );
      g.setParam("sliding",rec.obj.getParamOption( rec.name,"sliding" ) === false ? false : true )

      var b1 = g.trackParam("value",() => {
         rec.setValue( g.params.value );
      })

      var b2 = rec.obj.trackParam( rec.name,() => {
        g.setParam( "value", rec.obj.getParam( rec.name ) );
      })

      g.chain("remove",function() {
        b1(); b2();
        this.orig();
      })

      t.linkParam("visible", g.getPath() + "->visible" );

      return g;
      
    });

    add( "cmd", function( editor, rec, o ) {

      var g = vz.createObjByType( "btn", {parent:editor} );
      //g.dom.style.margin="0 0 0.1em 0";
      g.dom.style.marginTop="0.2em";
      g.setParam("text",rec.name );
      g.on("click",() => {
        rec.fn();
      })

      return g;
    });

    add( "text", function( editor, rec, o ) {
      //let t = vz.createObjByType("text",{parent:editor});
      //t.setParam("text",tr(vz,rec.name) + " (text)" );

/*
      var g = vz.createObjByType( "textarea", {parent:editor} );
      //var g = vz.createObjByType( "guinode", {parent:editor,tag:"textarea"} );
      //g.dom.textContent = rec.value.toString();
      g.setParam("value",rec.value.toString() );

      var b1 = g.trackParam("value",() => {
         console.log("TA VAL CHANGED");
         rec.setValue( g.params.value );
      })

      var b2 = rec.obj.trackParam( rec.name,(qq) => {
        //var qq = rec.obj.getParam( rec.name );
        g.setParam( "value", qq.toString() );
      })
      style='width:500px;height:300px;'
*/      

      var g2 = vz.createObjByType( "btn", {parent:editor} );
      g2.setParam("text",`Edit ${rec.getTitle()}`);
      // todo: vz.t( english_word ) + featured..

      var dlg = vz.createObjByType( "dlg", {parent:editor} );
      dlg.feature("xml-lang");
      dlg.childrenFromXml(`<column id='col' gap='0.5em'>
        <codeflask id="txt" language="${rec.obj.getParamOption(rec.name,'language')}"/>
        <btn text="Ввод"/>
        </column>`
        ,true,false);
      g2.on("click",dlg.show );
      dlg.on("show",() => {
        //dlg.items.col.items.txt.setParam("language", rec.obj.getParamOption( rec.name,"language","text" ))
        dlg.items.col.items.txt.setParam("text",rec.value.toString() );
        // if lang js?
        dlg.items.col.items.txt.dom.style.width = "80vw";
        dlg.items.col.items.txt.dom.style.height = "80vh";
      })
      dlg.items.col.items.btn.on("click",() => {
        rec.setValue( dlg.items.col.items.txt.getParam("text") );
        dlg.close();
      })
/*
      g.on("remove",function() {
        //b1(); b2();
      })
*/      

      //t.linkParam("visible", g2.getPath() + "->visible" );

      return g2;
    
    });
}

/*
export function tr( vz, key ) {
  //return vz.t(key);

  var tabl = {
    "opacity" : "Прозрачность",
    "color" : "Цвет",
    "step" : "Шаг, м",
    "size" : "Размер, м",
    "range" : "Диапазон, м",
    "ratio" : "Пропорция",
    "shift" : "Сдвиг",
    "axis" : "Ось",
    "radius" : "Радиус",
    "additive" : "Наложение",
    "application": "Применимость",
    "view" : "Вид"
  }

  return tabl[ key ] || key;
}
*/

// rec - запись гуя, g - объект интерфейса
  function trackVisible( rec, g ) {
    var f = function() {
      var v = rec.obj.getParamOption( rec.name, "visible",true );
      //console.log("PARAM sett to visible=",v)
      g.setParam("visible", v );
    }
    var unbind = rec.obj.trackParamOption( rec.name, "visible", f )
    g.on("remove",unbind);
    f()
  }