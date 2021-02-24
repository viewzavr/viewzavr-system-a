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
  vz.addItemType( "javascript-fast-component","Javascript fast component", function( opts ) {
    return create( vz, opts );
  } );
}

// create function should return Viewzavr object
export function create( vz, opts ) {
  //opts.name ||= "js-component";
  var eobj = vz.createObj( opts );
  eobj.addText( "code",example,f );
  
  eobj.addLabel( "export_app_spacing","export app.js:");
  eobj.addCmd( "export app.js", exportjs );
//  eobj.addCmd( "clone", clonethis );
  // eobj.addText( "export_app" );
  
  var registered_id;
  var obj;
  function f() {
    //exportjs();
    var qq;
    
    if (obj) { qq = obj.dump(); obj.remove(); }
    obj = vz.createObj( {parent: eobj, name: "obj"} );
    var t = eobj.getParam("code");

    try {
      eval( t );
      if (qq) obj.restoreFromDump( qq );
    } catch (ex) {
      console.error("EXCEPTION:",ex );
    }
  }
  
  //////////////////////////////////
  
  function exportjs() {
    var t = "\n  // ******************** code\n" + eobj.getParam("code");
//    var id = obj.getParam("component_id");
//    var name = obj.getParam("component_name");  
    var id = "js-" +Math.ceil(Math.random()*1000);
    var name = "My "+id;
    var name2 = name.replace(/[ \/,|()]+/,"_");
    
    var t2 = "\n  // ******************* parameters\n" + json2js_v3( "obj","obj","obj.parent",obj.dump(),"  ", true );
    
    
//    opts.name ||= "${name2}";    
    var code = `
// this is Viewzavr component/app, generated at ${new Date()}

export function setup( vz ) {
  vz.addItemType( "${id}","${name}", function( opts ) {
    return create( vz, opts );
  } );
}
  
export function create( vz,opts ) {
  var obj = vz.createObj( opts );
  ${t}
  ${t2}
  return obj;
}
`;
   
    download( code, "app.js","text/javascript" );
    //eobj.setParam("export_app",code );
  }

/*  
  function clonethis() {
    var q = create( {parent: eobj.parent} );
  }
*/  

  return eobj;
}


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
      if (!isroot)
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
      result += "\n" + json2js_v3( name, objvarname + "_" + name, objvarname, c[name],padding);
    });
        
          
   return result.split("\n").map( s => padding+s ).join("\n");
}
