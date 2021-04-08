// добавлятель нового объекта

Column {
  spacing: 2
  
  id: adder
    
  property var vzroot
  property var target // куды добавлять
  
  Button {
    text: "Добавить"
    width: 160
    //visible: shower.currentObj && shower.currentObj.mayHaveChildren
    onClicked: add_elem_dlg.open();
  }
  
  AddItemDialog {
    id: add_elem_dlg
    target: adder.target
    onAdded: {
      adder.added( obj );
      add_elem_dlg.close();
    }
  }
  
  // R-SEE-OBJECT-PARAMS-WHEN-ADDING
  signal added( object obj );

} 
