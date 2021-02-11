// добавлятель нового объекта

Column {
  spacing: 2
  
  id: adder
    
  property var vzroot
  property var target // куды добавлять
  
  onVzrootChanged: setup()
  
  function setup() {
    // todo: chain once!
    // console.log("thus chaining...adder");
    vzroot.vz.chain("addItemType",function() {
      //console.log("addItemType chained call of Adder!");
      this.orig.apply(this,arguments);
      rescan();
    });
    rescan();
  }
    
  function rescan() {
    cbtypes.types = vzroot.vz.getTypeRecords();
    cbtypes.currentIndex = 0;
  }

  ComboBox {
    id: cbtypes
    property var types: []
    model: types.map( function(tr) { return tr[1]; } );
    width: 200
  }
    
  Button {
    text: "Добавить"
    onClicked: {
      var ct = cbtypes.types[ cbtypes.currentIndex ][0];
      vzroot.vz.create_obj_by_type( {type: ct, manual: true, parent: adder.target} ); // manual это флаг для setup_from_dump
    }
  }
  
} 
