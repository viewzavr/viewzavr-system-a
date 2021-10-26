export function setup( vz ) {
  vz.addType( "gui-dialog-add",create,"Gui: add object dialog");
  vz.addType( "find-by-criteria",create_find,"Gui: find types by criteria");
}

export function create_find( vz, opts ) {
  var obj = vz.createObj( opts );
  obj.addString( "criteria","",function(v) {
    var cats = (v || "").split(/\s+/);
    var res = {};
    for (let k of cats) {
      var types = gettypes( vz, c )
      res[k] = types;
    }
    obj.setParam("output",res);
  });
  return obj;
}

export function create( vz, opts ) {
  var obj = vz.createObj( opts );
  vz.feature("simple-denis-lang");

  var shadow;

  var tmrid;
  function onchange() {
      if (!tmrid) {
         tmrid = setTimeout( function() {
             obj.onchange2();
             tmrid = null;
         }, 50 );
      }
  }

  var assigned_t;
  obj.onchange2 = function() {
    shadow = vz.createFromText( {}, `
dlg Добавить_объект name=dlg content-padding=1em
      row gap=1em
        column gap=1em name=col1
          text Разновидность
          list name=a size=20
        column gap=1em
          text Тип
          list name=b size=20 style=width:200px;max-width:unset;
          btn Добавить! name=addbtn
    `);

    shadow.feature('tree-items');
    var q = shadow.tree_items();
    //obj.dlg = q.dlg;

    obj.addCmd("showModal",q.dlg.showModal);
    obj.addCmd("show",q.dlg.show);
    obj.addCmd("close",q.dlg.close);

    // TODO tree_items to shadow!
    

    ////////////////////////////////////////////
    
    q.dlg.setParam("title", obj.params.title );

    q.a.setParamOption("items","internal",true);
    q.a.setParamOption("current","internal",true);
    
    q.b.setParamOption("items","internal",true);
    q.b.setParamOption("current","internal",true);

    var cats = obj.getParam("input") || {};

    if (Object.keys(cats).length == 0) cats = obj.vz.getCatsDic();
    q.col1.visible = (Object.keys(cats).length >= 1);

    var cats_str = ["all",...Object.keys(cats)].join("\n");

    q.a.setParam("items", cats_str );

    // фича "все"
    var arr = [];
    for (let q of Object.keys(cats)) 
      if (q != "all") arr = arr.concat( cats[q] );
    cats["all"] = arr;
    //


    var current_types;
    q.a.trackParam("current",() => {
      var c = q.a.getParam("current");
      current_types = cats[c];
      var titles = gettitles( vz, current_types );
      q.b.setParam("items", titles );
    });

    q.a.setParam("current_index", 0 );
    q.a.signalTracked("current_index");

    q.addbtn.track("click",doadd);

    // фича "двойной клик по имени в списке"
    q.b.dom.addEventListener("dblclick", doadd)

    function doadd() {
      //var cur = q.b.getParam("current");
      //console.log("clicked",cur);
      var cur_i = q.b.getParam("current_index");
      var cur = current_types[ cur_i ];
      var title = gettitle( vz, cur );

      var parent = vz.find_by_path( obj, obj.params.target_parent );
      if (obj.params.target_parent === "") parent = undefined;
      parent  ||= obj.findRoot();
      var res = obj.vz.createObjByType( {type: cur, manual: true, parent:parent, name: title } );
      q.dlg.close();
    }
    
  }

  //  vz.tools.append( "addItemType",onchange );
  // надо же сделать un-append.. а я пока не могу
  
  obj.addString( "title","",function(v) {
    onchange()
  });

  
  obj.addObjRef("target_parent","" );
  
  obj.open = function() {
    obj.items.dlg.open();
  }

  ////////////////// фича "все"
  /*
  obj.patch( "assign_cats", () => {
    var cats_str = ["all",...cats].join("\n");
    q.a.setParam("items", cats_str );
  });
  */


  ////////////////// фича видимости
  obj.addCheckbox( "categories_visible",true,function(v) {
    onchange()
  });

  obj.setParam( "input",null );
  obj.trackParam( "input", onchange );

  obj.onchange2();

  return obj;
}


function gettypes( vz, cat ) {
  if (!vz) return [];
  var t = vz.getTypesByCat( cat );
  t = t.filter( function(code) { return !vz.getTypeOptions( code ).hidegui } );
  t = t.sort( function(a,b) { return gettitle(vz,a).localeCompare( gettitle(vz,b) ) }); // F-SORT-TYPES sort by name
  return t;
}

function gettitle( vz, code ) {
  var s = vz.getTypeOptions(code).title;
  return s;
}

function gettitles( vz, types ) {
  return types.map( function(code) { return gettitle( vz, code ) });
}