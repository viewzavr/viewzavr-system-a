// показыватель списка объектов
// вход vzroot
// выход - визуальный образ - currentObj текущий выбранный объект

// местная фича - F-FILTER-FUNC - фильтр при отображении объектов
// если бы делать ее технически фичей (например как подобъект) то получилось бы, 
// кроме того что в qml-объект еще потребуется добавить свойство...

Column {
  id: sw
  
  property var vzroot

  property var currentObj: cb.objects[ cb.currentIndex ];
  
  // MF-FILTER-FOCUS причина
  function focus() { cb.dom.focus(); }

  ComboBox {
    size: isMobile ? 1 : 10
    width: 220
    height: isMobile ? 25 : 250
    id: cb
    property var objects: []
    
    ///////////////////////////////////////////////////////////
    // feature: keep currently selected object if model changes
    function setdata( objnames, objlist ) {
      var curobj = objects[ cb.currentIndex ];
      var curpath = curobj ? curobj.getPath() : null;
      model = objnames;
      objects = objlist;
      if (curpath) setbypath( curpath );
    }
    
    function setbypath( path ) {
      var cblist = objects;
      for (var i=0; i<cblist.length; i++) {
        var obj = cblist[i];
        if (obj.getPath() == path) {
          currentIndex = i;
          return;
        }
      }
    }
    ///////////////////////////////////////////////////////////    
  }

  Timer {
    id: rescantimer
    interval: 50
    repeat: false
    onTriggered: sw.rescan();
  }

  function setup() {
    console.log("shower chaining");
    
    // новая идея - trackOnce + имя фичи. Но этот once кстати нам заблокирует другие шоверы, формально..

    vzroot.track("appendChild",function() { rescantimer.start() } );
    vzroot.track("forgetChild",function() { rescantimer.start() } );
    
    rescan();
  }
  
  onVzrootChanged: {
//    console.log("Shower vzroot is",vzroot );
    setup();
  }

  function rescan() {
    // todo: track obj...
    // console.log("rescan");
    var objnames = [];
    var objlist = [];

    //var _filterfunc = filterfunc || function(obj) { return true }; // F-FILTER-FUNC

    traverse( vzroot, vzroot.ns.name || "scene", -1, function( obj, name, depth ) {

      //if (_filterfunc(name)) return; // F-FILTER-FUNC
    
      if (obj.historicalType == "link" && obj.getParam("tied_to_parent")) {
        //name = "formula_";
        name = "link@";
        var s = obj.getParam("to");
        if (s) {
          var arr = s.split ? s.split("->") : [];
          if (arr && arr[1]) name = name + arr[1];
        }
        obj.track("linksChanged",rescan ); // а untrack мы делаем?
      }

      objnames.push( "--".repeat( Math.max( 0,depth )) + name );
      objlist.push( obj );
    });
    
    cb.setdata( objnames, objlist );

    if (sw.afterRescan) sw.afterRescan();
  }

  // startobj, name, depth - текущий объект
  function traverse(startobj,name,depth, fn) {
    fn( startobj,name,depth );
    var cc = startobj.ns.getChildNames();
    for (var i=0; i<cc.length; i++) {
      var name = cc[i];
      var obj = startobj.ns.getChildByName( name );
      traverse( obj, name, depth+1, fn );
    }
  }
  
  // R-SEE-OBJECT-PARAMS-WHEN-ADDING
  function activateObj( obj ) {
    var newi = cb.objects.indexOf( obj );

    if (newi >= 0)
      cb.currentIndex = newi;
    else {
      // TODO: вот эта строчка зместо всей халабуды (ну т.е. паттерн использования такой мы видим..)
      // vz.tools.appendOnce( sw,"rescan","aob2",() => { sw.activateObj(obj) } );
      
      var f = function() {
        sw.activateObj( obj );
        
      }
      sw.afterRescan = function() { sw.activateObj( obj ); sw.afterRescan = null; }
    }
  }
  property var afterRescan
  // очень интре


  ////////////////////////////////////////////////
  // F-FILTER-FUNC
  property var filterfunc
  onFilterfuncChanged: {
    sw.das_filterfunc = filterfunc || function() { return true; };
    rescan()
  }

  Item { // попробуем.. это типа патч..

    Component.onCompleted: {
      //sw.createSimpleProperty("_")
      sw.das_filterfunc = filterfunc || function() { return true; };
    
    /*  
      var orig = sw.traverse;
      var newtraverse = function (startobj,name,depth, fn) {
        orig( startobj, name, depth, function(_obj,_name,_depth) {
          if (sw.das_filterfunc(_obj)) // thus we signal out only if obj matches
              fn( _obj,_name,_depth);
        })
      }
    */
      
      // update: решил еще передавать аргумент в функцию фильтра - тогда можно будет делать выбор поддеревьев например
      // ну и заодно этот аргумент будет результатом вызова у родителя
      var newtraverse = function traverse(startobj,name,depth, fn, filterarg) {
        var filterres = sw.das_filterfunc( startobj, filterarg );
        if (filterres)
            fn( startobj,name,depth );
        var cc = startobj.ns.getChildNames();
        for (var i=0; i<cc.length; i++) {
            var name = cc[i];
            var obj = startobj.ns.getChildByName( name );
            sw.traverse( obj, name, depth+1, fn, filterres );
        }
      }
      sw.traverse = newtraverse;
    }

  }
  
  ///////////////////////////////////////////
  // save restore current obj feature
  // API
  // output: currentObjPath property
  // input: newCurrentObjPath property
  property var currentObjPath: currentObj ? currentObj.getPath() : "";
  property var newCurrentObjPath
  onNewCurrentObjPathChanged: {
    var p = newCurrentObjPath;
    var co = currentObj;
    if (!co || co.getPath() != p) {

      // case to restore
      // this doesn't work if object is not added yet
      // cb.setbypath( p );
      var realtargetobj = vzroot.findByPath( p );
      if (realtargetobj)
        sw.activateObj( realtargetobj );
      else
        setTimeout( function() { // retry once..
          var realtargetobj = vzroot.findByPath( p );
          if (realtargetobj)
              sw.activateObj( realtargetobj );
        },250);
    }
  }  

}