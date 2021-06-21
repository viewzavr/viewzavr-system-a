// выбиратель объекта (gui.addObjRef)
// вход vzroot, crit_fn - функция критерия, value - имя объекта в дереве
// выход - value - имя объекта в дереве

Column {
  id: sw
  
  property var vzroot
  
  property var crit_fn
  property var value

  onVzrootChanged: setup();
  
  function setValue( nv ) {
    var arr = cb.objects_paths;
    if (nv && nv.getPath) nv = nv.getPath(); // R-SETREF-OBJ
    for (var i=0; i<arr.length; i++) {
      if (arr[i] == nv) {
        cb.currentIndex = i;
        return;
      }
    }

    cb.currentIndex = 0;
  }
  
  Text {
    text: sw.text
  }
  property var text

  ComboBox {
    width: 220
    id: cb
    property var objects_paths: []

    onCurrentIndexChanged: {
      sw.value = objects_paths[ currentIndex ];
    }
  }
  
  Timer {
    id: rescantimer
    interval: 50
    repeat: false
    onTriggered: sw.rescan();
  }

  function setup() {

    vzroot.track("appendChild",rescan_timer_start )
    vzroot.track("forgetChild",rescan_timer_start )

    rescan();
  }
  
  Component.onDestruction: {
    if (vzroot.untrack) {
      vzroot.untrack("appendChild",rescan_timer_start )
      vzroot.untrack("forgetChild",rescan_timer_start )    
    }
  }
  
  function rescan_timer_start() {
    rescantimer.start();
  }
  
  

  function rescan() {
    // todo: track obj...
    var objnames = [""];
    var objlist = [""];
    var crit_fn = sw.crit_fn || function(v) { return true; };
    traverse( vzroot, "", -1, function( obj, name, depth ) {
      if (!crit_fn( obj )) return;
      objnames.push( name );
      //objlist.push( obj );
      objlist.push( name );
    });
    
    var curpath = sw.value;
    cb.model = objnames;
    cb.objects_paths = objlist;
    sw.setValue( curpath );
  }

  function traverse(startobj,name,depth, fn) {
    fn( startobj,name,depth );
    var cc = startobj.ns.getChildNames();
    for (var i=0; i<cc.length; i++) {
      var cname = cc[i];
      var obj = startobj.ns.getChildByName( cname );
      traverse( obj, name + "/" + cname, depth+1, fn );
    }
  }

}