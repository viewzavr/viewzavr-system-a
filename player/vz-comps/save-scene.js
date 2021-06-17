// provides functions:
// * export scene to json
// * import scene from json
// * import scene from json as a new object in current scene
// * reset scene

import setup_plantuml from "./export-plantuml.js";

export default function setup( mv, player ) {

mv.addItemType( "import-export","Save and Load",make, {label:"special", guionce:true, name:"save-load", hidegui: true} );

// сохраняет сцену в файл json, загружает из файла

// идея - уметь загружать multiple... тогда если несколько то грузим как объекты?
// идея - экспортировать только часть сцены (какие-то узлы по выбору....)
// идея - драг и дроп втаскивать в сцену json-ки

function load( plus ) {
var input = document.createElement('input');
input.type = 'file';
input.accept = ".json,.txt";

input.onchange = e => { 

   // getting a hold of the file reference
   var file = e.target.files[0];
   //console.log("inpuit change",file, "plus=",plus );   

   // setting up the reader
   var reader = new FileReader();
   reader.readAsText(file,'UTF-8');

   // here we tell the reader what to do when it's done reading...
   reader.onload = readerEvent => {
      var content = readerEvent.target.result; // this is the content!
      //console.log( content );
      var d = JSON.parse( content );
      var isplayerstate = d.viewzavr_player_flags ? true : false;

      
      if (plus) {
        if (isplayerstate) {
          //var scene_dump = d.children.scene; // так мы потеряем пакеты..
          // var q = mv.createSyncFromDump( scene_dump,undefined,vzPlayer.getRoot() );
          mv.createSyncFromDump( d,undefined,vzPlayer.getRoot() ).then( (q) => {
            q.manuallyInserted = true;
          });
          
        }
        else
        {
          mv.createSyncFromDump( d,undefined,vzPlayer.getRoot() ).then( (q) => {
            q.manuallyInserted = true;
          });
        }
      }
      else {
        if (isplayerstate) {
          mv.createSyncFromDump( d,vzPlayer );
        }
        else
        {
          var q = vzPlayer.getRoot();
          mv.createSyncFromDump( d, vzPlayer.getRoot() ).then( (obj) => {
            vzPlayer.setRoot(obj);
            q.remove();
          });
        }
      }
   }

}

input.click();
}

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

function make(opts) {
  var obj = mv.create_obj( {}, opts );
  
  obj.addCmd("Export to TinyURL",function(value) {  
     console.log("forcing url to our state");
     vzPlayer.saveToHash( vzPlayer );
     console.log("opening tiny url");
     var href = "http://tinyurl.com/create.php?url="+encodeURIComponent(location.href);
     window.open( href );
  } );

  obj.addCmd("Export JSON",function(value) { // player state including scene
    var root = vzPlayer;
//    var root = vzPlayer.getRoot();
    var s = root.dump();
    s.viewzavr_player_flags = 1; // это у нас признак что сие есть состояние плеера.
    // s.children.scene.manual = true; // ну либо тут эти флаги ставить, либо на загрузке..
    // кошернее таки на загрузке флаг выставлять
    var t  = JSON.stringify(s, null, '\t');
    download( t,"viewzavr-player.json","text/plain" );
  });
/*  
  obj.addCmd("Export scene JSON",function(value) {
//    var root = mv.find_root( obj );  
    var root = vzPlayer.getRoot();
    var s = root.dump();
    // s.manual = true;
    var t  =JSON.stringify(s, null, '\t');
    download( t,"viewzavr-scene.json","text/plain" );
  });  
*/  
  
  // R-EXPORT-JS
/* seems no need
  obj.addCmd("Export JS",function(value) {
    var root = mv.find_root( obj );  
    var s = root.dump();
    //var t = "// creates a scene\n// obj - a parent obj; you may pass vz.root here.\n\nfunction create( obj ) {\n" + json2js( "obj",s,"  " ) + "\n   return obj;\n}\n";
    var t = `// viewzavr scene generated on ${new Date().toString()}\nvar obj = vz.root;\n` + json2js( "obj",s,"  " );
    // an idea to generate a function instead of just code is fine for making components
    // because they need create function ;-)
    download( t,"viewzavr-scene.js","text/plain" );
  });
*/  
  
  // R-EXPORT-JS-PACKAGE
  obj.addCmd("Generate Viewzavr package",function(value) {
    //var root = mv.find_root( obj );
    var root = vzPlayer.getRoot();
    var s = root.dump();
    
    var d = new Date();
    var new_type_id = "component-"+ Math.floor(Math.random()*1000000).toString();
    //d.getDate()  + "-" + (d.getMonth()+1) + "-" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes();
    
    var t = `// viewzavr package generated on ${new Date().toString()}
// a package may contain a list of components, 0 or more.
`
    
    //debugger;
    if (s.module_url) {
      t += `\nimport * as m1 from '${s.module_url}';\n`
    }

   t +=`
// package setup adds record(s) to the table of visual components, which is used by visual interface
export function setup( vz ) {
  vz.addItemType( "${new_type_id}","My ${new_type_id}", function( opts ) {
    return create( vz, opts );
  } );
  // you may add many components in 1 module
}

// the component code
export function create( vz, opts ) {
`
    t += json2js_v2( s.name || "scene","obj", "opts.parent",s,"  ", true ) + "\n  return obj;\n}\n";
    // an idea to generate a function instead of just code is fine for making components
    // because they need create function ;-)
    download( t,"viewzavr-module.js","text/plain" );
  });  
  
  obj.addCmd("Load",function(value) {
    load();
  });
  
  obj.addCmd("Append as object",function(value) {
    load( true );
  });
  
  
  obj.addCmd("Reset",function(value) {
    mv.createSyncFromDump( {}, vzPlayer.getRoot() ).then( obj => vzPlayer.setRoot(obj)  );
    /*
    var new_root = mv.createObj();
    var old_root = vzPlayer.getRoot();
    vzPlayer.setRoot( new_root );
    old_root.remove();
    */
  });  
  
  setup_plantuml( obj );

  return obj; // ну то есть я пока не понял, хочу я вообще что-то возвращать или нет
}



}

/////////////////////////////////////////////////////////


// converts json viewzavr dump into js language
// objname - a name of dump root object (probably vz.root by default)
export function json2js( objname, dump,padding ) {
    var result = "";

    var h = dump.params || {};
    var keys = Object.keys(h);

    keys.forEach( function(name) {
      var v = JSON.stringify( h[name] );
      result += `${objname}.setParam( '${name}', ${v} );\n`;
    });

    var c = dump.children || {};
    var ckeys = Object.keys( c );

    // todo отсортировать в порядке order..
    ckeys.forEach( function(name) {
      var cobjname = objname + "_" + name;
      
      result += `\n // object ${cobjname}\n`;
      cobjname = cobjname.replace(/[^\d\w]/,"_").replace("-","_");
      if (c[name].manual) 
      {
        result += `var ${cobjname} = ${objname}.vz.create_obj_by_type( { type: '${c[name].type}', parent: ${objname}, name: '${name}' } );\n`;
      }
      else
      {
        result += `var ${cobjname} = ${objname}.ns.getChildByName('${name}');\n`;
      }
      result += json2js( cobjname, c[name],padding );
    });
    

   return result.split("\n").map( s => padding+s ).join("\n");
}

// converts json viewzavr dump into js language
// objname - a name of dump root object (probably vz.root by default)

export function json2js_v2( objname, objvarname, parentvarname, dump, padding, isroot ) {
    var result = `// object ${objname}\n`;

    objvarname = objvarname.replace(/[^\d\w]/,"_").replace("-","_");
    
    if (dump.module_url)
    {
      result += `var ${objvarname} = m1.create( vz, opts );\n`
    }
    else
    if (dump.manual)
    {
      result += `var ${objvarname} = vz.create_obj_by_type( { type: '${dump.type}', parent: ${parentvarname}, name: '${objname}' } );\n`;
    }
    else
    if (isroot) {
      result += `var ${objvarname} = vz.createObj( { parent: ${parentvarname}, name: '${objname}' } );\n`;
    }
    else
    {
      result += `var ${objvarname} = ${parentvarname}.ns.getChildByName('${objname}');\n`;
    }

    var h = dump.params || {};
    var keys = Object.keys(h);

    keys.forEach( function(name) {
      var v = JSON.stringify( h[name] );
      result += `${objvarname}.setParam( '${name}', ${v} );\n`;
    });

    var c = dump.children || {};
    var ckeys = Object.keys( c );

    // todo отсортировать в порядке order..
    ckeys.forEach( function(name) {
      result += "\n" + json2js_v2( name, objvarname + "_" + name, objvarname, c[name],padding);
    });
    

   return result.split("\n").map( s => padding+s ).join("\n");
}