// purpose: sync point between Qmlweb and Viewzavr
// thus things from Qml might be saved as object state, for example in player state.

QtObject {
  id: vzp
  // object to work with
  property var obj
  // param name to work with
  property var name
  
  ///////////////////// property interface
  // value coming from vz object
  property var value
  // value to write to vz object
  property var newValue
  
  //////////////////// signal/function interface
  
  signal changed(); // от вьюзавра
  
  function set( val ) {
    if (obj) {
        obj.setParam( name, newValue );
        value = newValue;
    }
  }
  
  /////////////////// implementation

  onNewValueChanged: {
    set( newValue );
  }

  onObjChanged: {
    if (vzp.untrack) { vzp.untrack(); vzp.untrack = null; }
    if (!obj) return;
    
    if (value) set( value );

    vzp.untrack = obj.trackParam( name, function() {
      var v = obj.getParam( name );
      value = v;
      changed();
    } );

  }

  Component.onDestruction: if (vzp.untrack) vzp.untrack();

}
