// todo: add js parameters when exporting to app.js
// do we need to generate app.js or just this item is enought?..

var example = `// source code for create. parameters:
  // vz - viewzavr system, opts - options for component
  // obj - your new object
  
  var pts = vz.vis.addPoints( obj );
  pts.positions = [0,0,0, 20,10,5,  3,4,7 ];
  pts.color = [1,0,0];
`;

export function setup( vz ) {
  vz.addType( "js-code",create, "Javascript code" );
}

// create function should return Viewzavr object
export function create( vz, opts ) {
  //opts.name ||= "js-component";
  var eobj = vz.createObj( opts );
  eobj.opts = opts;
  eobj.addText( "code",opts?.params?.code || example,f );
  eobj.setParamOption("code","language","js");
  
  eobj.addLabel( "export_app_spacing","export app.js:");
  eobj.setParamOption( "export_app_spacing","internal",true );
  eobj.addCmd( "export_app_js", () => exportjs(eobj) );
  
  eobj.addCmd( "export_EDITABLE_app_js", () => exportjs_e(eobj) );
//  eobj.addCmd( "clone", clonethis );
  // eobj.addText( "export_app" );

  eobj.addLabel("status");
  
  var registered_id;
  var obj;
  function f() {

    obj = eobj; // попробуем

    //todo: очистить все gui кроме наших
    for (let g of obj.getGuiNames()) {
      if (obj.own_parameters.indexOf(g)>=0) continue;
      obj.removeGui( g );
    }

    obj.ns.removeChildren(); // что там было насоздовано все стираем - щас заново создадим
    
    var t = eobj.getParam("code");

    try {
      eval( t );
      eobj.setParam("status","статус: норма");
    } catch (ex) {
      eobj.setParam("status","статус: ошибка");
      console.error("EXCEPTION:",ex );
      console.info("ERROR: ошибка внешнего js-кода:",ex.toString(),ex.stack );
    }

    eobj.emit("obj-updated");
  }

  eobj.own_parameters = ["code","export_app_js","export_EDITABLE_app_js"];

  f();

  eobj.generate_editable = ( t, id, name ) => {
    return `
// this is Viewzavr component/app, generated at ${new Date()}

export function setup( vz ) {
  vz.addType( "${id}",create,"${name}" );
}
  
export function create( vz,opts ) {
  var obj = vz.createObjByType( "js-code", opts ) );
  ${t}
  return obj;
}
// done
`;
  }

  eobj.generate_final = ( t, t2, id, name ) => {
  return `
// this is Viewzavr component/app, generated at ${new Date()}

export function setup( vz ) {
  vz.addType( "${id}",create,"${name}");
}
  
export function create( vz,opts ) {
  var obj = vz.createObj( opts );
  ${t}
  ${t2}
  return obj;
}
`;
}
  

  return eobj;
}

////////////////////////////////
  
  function exportjs(eobj) {
    var t = "\n  // ******************** code\n" + eobj.getParam("code");
//    var id = obj.getParam("component_id");
//    var name = obj.getParam("component_name");  
    var id = "js-" +Math.ceil(Math.random()*1000);
    var name = "My "+id;
    var name2 = name.replace(/[ \/,|()]+/,"_");
    
    var dump = eobj.dump();
    var clon = {};
    Object.keys(dump.params).forEach( (p) => {
      if (!eobj.own_parameters.indexOf(p)<0)
         clon[p] = dump.params[p];
    });
    dump.params = clon;
    
    var t2 = "\n  // ******************* code done \n" + json2js_v3( "obj","obj","obj.parent",dump,"  ", true );

    var code = eobj.generate_final( t, t2, id, name );

//    opts.name ||= "${name2}";    
    
   
    download( code, "app.js","text/javascript" );
    //eobj.setParam("export_app",code );
  }

//////////////////////////////////  
  
  
function exportjs_e(eobj) {
  var t = "\n  // ******************** code\n" + json2js_v3( "obj","obj","obj.parent",eobj.dump(),"  ", true );
  var id = "js" + "-" + Math.ceil(Math.random()*1000);
  var name = "My "+id;
  var code = eobj.generate_editable( t, id, name );
  download( code, "app.js","text/javascript" );
}

//////////////////////////////////


// todo add Window to viewzavr?

// https://stackoverflow.com/a/30832210
// Function to download data to a file
function download(data, filename, type) {
    var file = new Blob([data], {type: type});
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
}


////////////////////////////////////////////
export function json2js_v3( objname, objvarname, parentvarname, dump, padding, isroot ) {
    var result = `// object ${objname}\n`;

    objvarname = objvarname.replace(/[^\d\w]/,"_").replace("-","_");

    {
      if (!isroot) {
        if (dump.manual)
          result += `var ${objvarname} = vz.createObjByType( { type: '${dump.type}', parent: ${parentvarname}, name: '${objname}' } );\n`;
        else
          result += `var ${objvarname} = ${parentvarname}.ns.getChildByName('${objname}');\n`;
      }
    }

    var h = dump.params || {};
    var keys = Object.keys(h);
      
    keys.forEach( function(name) {
      var val = h[name];
      var v = JSON.stringify( h[name] );
      
      if (typeof val === 'string' || val instanceof String)
        if (val.indexOf("\n") >=0) {
          val = val.replaceAll("`","\\`").replaceAll("$","\\$");
          //&& val.indexOf("`") < 0 && val.indexOf("$") < 0) 
          v = "`"+val+"`";
        }
      result += `${objvarname}.setParam( '${name}', ${v} );\n`;
    });

    var c = dump.children || {};
    var ckeys = Object.keys( c );
          
    // todo отсортировать в порядке order..
    ckeys.forEach( function(name) {
      result += "\n" + json2js_v3( name, objvarname + "_" + name, objvarname, c[name],padding);
    });
        
          
   return result.split("\n").map( s => padding+s ).join("\n");
}
