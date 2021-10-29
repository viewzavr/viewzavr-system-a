// см также другой лист, https://developer.mozilla.org/ru/docs/Web/HTML/Element/datalist

import * as G from "./guinode.js" ;

export function setup( vz ) {
  vz.addType( "list",create,"Gui: list");
  vz.addType( "datalist",create_datalist,"Gui: datalist");
  vz.addType( "slider",create_slider,"Gui: slider");
  vz.addType( "input",create_input,"Gui: input");
  vz.addType( "selectcolor",create_color,"Gui: color select");
  vz.addType( "textarea",create_textarea,"Gui: text area");
}

export function create( vz, opts ) {
  var obj = G.create( vz, {name:"list",...opts, tag:'select'} );
  obj.items_parsed = [];
  
  obj.dom.style.maxWidth = "160px";

  obj.addText( "items", "", function(v) {
    var v1 = v.split ? v.split("\n") : [v].flat(2);
    obj.items_parsed = v1;
    var res = "";
    for (let str of v1) { 
      let selected = (str == obj.params.current) ? "selected" : "";
      res += `<option ${selected}>${str}</option>`
    }
    //obj.childrenFromXml( res, true, false );
    obj.dom.innerHTML = res;
    
    //obj.setParam( "current", obj.items_parsed[ obj.params.current ] );
  });
  
  obj.addSlider( "size",1,1,20,1,function(v) {
    obj.dom.setAttribute("size",v);
    //obj.dom.size = v;
    obj.dom.height = v*25;
  });
  
  obj.addString( "current","",function(v) {
    var i = obj.items_parsed.indexOf(v);
    obj.dom.selectedIndex = i;
  });

  obj.addSlider( "current_index",0,0,1000,1,function(v) {
    obj.setParam("current", obj.items_parsed[ v ] );
    //obj.dom.selectedIndex = v;
  })

  obj.dom.addEventListener( "change",function(event) {
    obj.setParam("current", obj.items_parsed[ obj.dom.selectedIndex ] );
    obj.setParam("current_index", obj.dom.selectedIndex );
  })

  return obj;
}

var datalist_counter=0;
export function create_datalist( vz, opts ) {
  var obj = create_input( vz, {...opts,params:{type:"text"}})
  var my_datalist_id = `vz_datalist_${datalist_counter++}`;
  obj.dom.setAttribute("list",my_datalist_id);

  obj.items_parsed = [];
  
  obj.dom.style.maxWidth = "160px";
  obj.dom.style.width = "160px";

  obj.addText( "items", "", function(v) {
    var v1 = v.split ? v.split("\n") : [v].flat(2);
    obj.items_parsed = v1;
    var res = "";
    for (let str of v1) { 
      res += `<option value="${str}">${str}</option>`
    }
    res = `<datalist id="${my_datalist_id}">${res}</datalist>`;
    //obj.childrenFromXml( res, true, false );
    obj.dom.innerHTML = res;
    //obj.setParam( "current", obj.items_parsed[ obj.params.current ] );
  });

  return obj;
}

///////////////////////////////////////////////////// slider


export function create_slider( vz, opts ) {
  var obj = G.create( vz, {...opts, tag:'input'} );
  obj.dom.setAttribute("type","range");

  obj.addFloat( "min",0,function(v) {
    obj.dom.setAttribute("min",v);
  });

  obj.addFloat( "max",0,function(v) {
    obj.dom.setAttribute("max",v);
  });

  obj.addFloat( "step",0,function(v) {
    obj.dom.step = v;
  });
  
    
  obj.addFloat( "value",0,function(v) {
    obj.dom.value = v;
  });

  obj.addCheckbox("sliding",true);

  obj.dom.addEventListener( "change",function(event) {
    obj.setParam("value", parseFloat( obj.dom.value ) );
  })

  obj.dom.addEventListener( "input",f)
  function f(event) {
    if (obj.params.sliding)
        obj.setParam("value", parseFloat( obj.dom.value ) );
  }

  obj.on("remove",() => {
    obj.dom.removeEventListener( "input",f)
  })

  return obj;
}

///////////////////////////////// input
export function create_input( vz, opts ) {
  var obj = G.create( vz, {...opts, tag:'input'} );
  obj.dom.setAttribute("type",opts?.params?.type);
  obj.dom.style.width = "60px";
    
  obj.addString( "value",opts?.params?.value || "",function(v) {
    obj.dom.value = v;
  });

  obj.dom.addEventListener( "change",function(event) {
    obj.setParam("value", obj.dom.value , true);
  })

  obj.trackParam("type",(v) => {
     obj.dom.setAttribute("type",v);
  })

/*
  obj.addCheckbox("sliding",false);

  obj.dom.addEventListener( "input",function(event) {
    if (obj.params.sliding)
        obj.setParam("value", hex2tri( obj.dom.value ) );
  })
*/  

  return obj;
}


///////////////////////////////// color


export function create_color( vz, opts ) {
  var obj = G.create( vz, {...opts, tag:'input'} );
  obj.dom.setAttribute("type","color");
    
  obj.addColor( "value",0,function(v) {
    obj.dom.value = tri2hex(v);
  });

  obj.addCheckbox("sliding",true);

  obj.dom.addEventListener( "change",function(event) {
    obj.setParam("value", hex2tri( obj.dom.value ));
  })

  obj.dom.addEventListener( "input",function(event) {
    if (obj.params.sliding)
        obj.setParam("value", hex2tri( obj.dom.value ));
  })

  return obj;
}


/// работа с цветом    
// c число от 0 до 255
function componentToHex(c) {
    if (typeof(c) === "undefined") {
      debugger;
    }
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

// r g b от 0 до 255
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}  

// triarr массив из трех чисел 0..1
function tri2hex( triarr ) {
   return rgbToHex( Math.floor(triarr[0]*255),Math.floor(triarr[1]*255),Math.floor(triarr[2]*255) )
}

// triarr массив из трех чисел 0..1
function color2css( triarr ) {
   if (typeof(triarr) === "string") return triarr;
   return tri2hex( triarr );
}

// triarr массив из трех чисел 0..1 - выход число int
function tri2int( triarr ) {
   return Math.floor(triarr[0]*255) * (256*256) + Math.floor(triarr[1]*255)*256  + Math.floor(triarr[2]*255);
}

function int2tri( col ) {
  return [ ((col >> 16) & 255) / 255.0, ((col >> 8) & 255)/ 255.0, (col & 255)/ 255.0 ];
}

function any2tri( col ) {
  if (Array.isArray(col))  // already arr
    return col;
  if (typeof(col) == "string") // hex
    return hex2tri( col );
    
  return int2tri( col );  // assume int
}

// hex запись в массив 3 чисел 0..1
function hex2tri(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16) / 255.0,
        parseInt(result[2], 16) / 255.0,
        parseInt(result[3], 16) / 255.0
    ] : [1,1,1];
}

  function isnan(v) {
    if (v === null) return true;
    if (v === "") return true;
    return isNaN(v);
  }


 ///////////////////////////// textarea
 export function create_textarea( vz, opts ) {
  var obj = G.create( vz, {...opts, tag:'textarea'} );
  //obj.dom.setAttribute("type",opts?.params?.type);
  //obj.dom.style.width = "60px";
    
  obj.addString( "value",opts?.params?.value || "",function(v) {
    obj.dom.textContent = v;
  });

  obj.dom.addEventListener( "change",function(event) {
    obj.setParam("value", obj.dom.textContent , true);
  })

  return obj;
}