// экспорт в plantuml

// туду - это должно быть модулем посторонним, не включаемым в плеер (например)

// идея: вынести отдельно ТПУ. т.е мы не просто стрелку на объект даем, а что за тпу у него..
// например объект вызывает свое событие, а оно уже прикручено к другим объектам.
// тогда стрелка идет объект->имясобытия (или это поле), а от него уже - стрелка к.
// ну либо - выделять ТПУ как записи в объекте (plantuml умеет)

// запуск сервера:
// docker run -d -p 8090:8080 plantuml/plantuml-server:jetty
// https://hub.docker.com/r/plantuml/plantuml-server 

import * as S from "./save-scene.js";

export default function setup( obj ) {
  obj.addCmd("Export PlantUML",function(value) {
    var root = obj.findRoot();
    //var root = mv.find_root( obj );
    //var name = obj.getPath();
    var text = "@startuml\n" + gen( root ) + "@enduml\n";
    console.log(text);
    
    // https://plantuml.com/ru/text-encoding
    var h = tohex(text);
    //console.log(h);

    var newWin = open('');
    // todo тут другая кодировка текста
    newWin.document.write(`
      
      <a target='_blank' href='https://www.plantuml.com/plantuml/uml/~h${h}'>www.plantuml.com/plantuml/</a>
      |
      <a target='_blank' href='https://www.planttext.com/'>www.planttext.com</a>
      <br/>

      <pre>${text}</pre>`);
    return;

    
    var url = `http://localhost:8090/uml/~h${h}`;
    window.open( url );
  });
}

function gen( obj ) {
  var id = obj.getPath();
  
  if (id == "/state") return "";
  
  var t = `(${id})\n`;
  var ch = obj.ns.getChildNames();
  ch.forEach( function(cname,index) {
      var c = obj.ns.getChildByName( cname );
      var cid = c.getPath();
      
      if (c.historicalType == "link") { // ссылки параметры
        t += genlink( c );
      }
      else {
        if (id != "/") // уберем ссылку от корня
          t += `(${id}) ..> (${cid})\n`; // связь родитель-ребенок.. 
        t += gen( c );
      }
  });
  

  // ссылки объектов
  for (var refname of Object.keys( obj.references || {})) {
      var path = obj.getParam( refname );
      var ref = path && path.getPath ? path.getPath() : path; // R-SETREF-OBJ
      if (ref) {
         if (obj.getParamOption( refname,"backref" ))
         t += `(${id}) <== (${ref}) : "obj ref TPU"\n`;
         else
         t += `(${id}) ==> (${ref}) : "obj ref TPU"\n`;
      }
  }
  
  // неведомое
  if (obj.extraTpus) {
    var extras = obj.extraTpus();
    for (var e of Object.keys(extras)) {
      var ecomment = extras[e];
      if (typeof(ecomment) !== "string") ecomment = "";
      t += `(${id}) ==> (${e}) : "${ecomment}"\n`;
    }
  }
  if (obj.extraTpusBack) {
    var extras = obj.extraTpusBack();
    for (var e of Object.keys(extras)) {
      var ecomment = extras[e];
      if (typeof(ecomment) !== "string") ecomment = "";
      t += `(${id}) <== (${e}) : "${ecomment}"\n`;
    }
  }  
  
  return t;
}

function genlink( obj ) {
      var v = obj.getParam("from");
      if (!v || v.length == 0) return;
      var arr = v.split("->");
      if (arr.length != 2) {
        //console.error("Link: source arr length not 2!",arr );
        return;
      }
      var objname = arr[0];
      var paramname = arr[1];
      
      var id = obj.getPath();
      var v2 = obj.getParam("to") || "";
      var arr2 = v2.split("->");
      if (arr2.length != 2) return;
      var objname2 = arr2[0]; // КУДА
      var paramname2 = arr2[1];

      // convert to absolute pathes
      if (obj.currentRefFrom && obj.currentRefFrom())
        objname = obj.currentRefFrom().getPath();
      else
        objname=objname + " [UNRESOLVED]";
      if (obj.currentRefTo && obj.currentRefTo())
        objname2 = obj.currentRefTo().getPath();      
      else
        objname2=objname2 + " [UNRESOLVED]";
      
      return `(${objname}) ..> (${objname2}) : "link ${paramname} -> ${paramname2} TPU"\n`;
}

////////////////////////////////////////// https://plantuml.com/ru/code-javascript-synchronous
  function tohex(str) {
    var result = '';
    for (var i=0; i<str.length; i++) {
      var r = str.charCodeAt(i).toString(16);
      //r = ("000"+r).slice(-4);
      r = ("0"+r).slice(-2);
      if (r.length != 2) 
        debugger;
      result += r;
    }
    return result;
  }