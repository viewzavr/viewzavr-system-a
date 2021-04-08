SimpleDialog {
  id: dlg

  /// auto size...
  property var c: dlg.contentArea.children[1]
  width: c ? c.width+20 : 600
  height: c ? c.height + 50 : 400

  // main

  title: "Добавить элемент"

  property var cats_str: ""
  
  property var target
   // куды добавлять
  property var vz: target ? target.vz : null
  
  // R-SEE-OBJECT-PARAMS-WHEN-ADDING
  signal added( object obj );

  Row {
    spacing: 10
    
    Column {
      spacing: 10
      
      Text { text: "Разновидность" }
      
      ComboBox {
        size: isMobile ? 1 : 10
        width: 220
        height: isMobile ? 25 : 250
        id: cb
      }
      
    }
    
    Column {
      spacing: 10

      Text { text: "Тип" }
      
      ComboBox {
        size: isMobile ? 1 : 10
        width: 220
        height: isMobile ? 25 : 250
        id: cb2
        model: vz ? vz.getTypesByCat( cb.currentText ) : []
      }
      
      Button {
        text: "Добавить!"
        onClicked: {
          var res = vz.createObjByType( {type: cb2.currentText, manual: true, parent: target } );
          dlg.added( res );
        }
      }
      
    } // 2nd col

   } // row
   
   onAfterOpen: {
     var cats = cats_str.split(/\s+/);
     if (cats.length == 0 || cats[0] == "") cats = vz.getCats();
     cb.model = cats;
   }

}