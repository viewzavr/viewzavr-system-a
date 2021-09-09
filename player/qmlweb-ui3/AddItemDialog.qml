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
        property var cats: []
        property var currentCat: cats[ currentIndex ]
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
        model: gettitles( vz, types );
        property var types: gettypes( vz,cb.currentCat )
        property var currentType: types[ currentIndex ]
        //vz ? vz.getTypesByCat( cb.currentText ) : []
        
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

        // feature: add object when it's name is clicked in a list
        Component.onCompleted: {
          cb2.dom.ondblclick = function(){ addbtn.clicked();};
        }
      }
      
      Button {
        id: addbtn
        text: "Добавить!"
        onClicked: {
          var res = vz.createObjByType( {type: cb2.currentType, manual: true, parent: target } );
          dlg.added( res );
        }
      }
      
    } // 2nd col

   } // row
   
   onAfterOpen: {
     var cats = cats_str.split(/\s+/);
     if (cats.length == 0 || cats[0] == "") cats = vz.getCats();
     function capitalize(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
     }
     cats = cats.sort(); // по алфавиту, такая фича
     cb.cats = cats;
     cb.model = cats.map( function(s) { return capitalize(s) } );
   }

}