// можно сделать так что это универсальный вызыватель любово vz-диалога..

Item {
  property var dlg

  function init() {
    if (!dlg) {
      if (typeof(vzPlayer) !== "undefined") {
        dlg = vzPlayer.vz.createObjByType( { type: "edit-object"} );
      }
    }
  }

  property var targetobj

  function perform( obj ) {
    init();
    if (!dlg) return setTimeout( function() { perform(obj)},250 );
    dlg.perform( obj );
  }
}