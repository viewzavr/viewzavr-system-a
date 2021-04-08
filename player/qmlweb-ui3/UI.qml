Item {
  id: ui
  property var vzroot
  property var adder_target     // an object where to add new objects
  property var special_objects  // a list of vzPlayer special objects required for some components
  
//  onVzrootChanged: console.log("UI vzroot is",vzroot );

  Column {
    spacing: 5
    property var tag: "left"

    Adder {
      vzroot: ui.vzroot
      target: adder_target
      id: adder
      // R-SEE-OBJECT-PARAMS-WHEN-ADDING
      onAdded: shower.activateObj( obj );
    }

    Shower {
      vzroot: ui.vzroot
      id: shower
      onCurrentObjChanged: {
        pe.obj = currentObj;
      }
    }
    
    Column {
      spacing: 5
  
    Row {
    spacing: 2
  
    Button {
        //text: enabled ? "Убрать" : "-"
        text: "Убрать"
        onClicked: {
          if (enabled)  shower.currentObj.remove();
        }
        enabled: (shower.currentObj && shower.currentObj != vzroot && shower.currentObj.ismanual())
      }
  
  /*
      Button {
        text: "Выше"
      }
      Button {
        text: "Ниже"
      }
  */
      Button {
        text: "Клон"
        onClicked: {
          if (enabled) shower.currentObj.clone();
        }
        enabled: (shower.currentObj && shower.currentObj != vzroot && shower.currentObj.ismanual())        
      }
      
      Button {
        text: "Ссылка"
        onClicked: {
          //if (enabled) shower.currentObj.clone();
          shower.currentObj.createLinkTo( {param: Object.keys(shower.currentObj.params)[0], from:"", manual: true });
        }
        enabled: (shower.currentObj && (Object.keys(shower.currentObj.params).length > 0 || Object.keys(shower.currentObj.guis).length > 0))
      }      
  
    }
    
    // feature: R-GUI-TREE
    Row {
      Button {
        text: "Добавить элемент"
        width: 160
        visible: shower.currentObj && shower.currentObj.guiAddItems
        onClicked: {
          add_elem_dlg.crit_str = shower.currentObj.guiAddItemsCrit || ""
          add_elem_dlg.open();
        }
      }
      AddItemDialog {
        id: add_elem_dlg
        target: shower.currentObj
      }

    }
        
    } // column
    
    Text {
      text: "Параметры:"
    }
  
    ParamEdit {
      vzroot: ui.vzroot
      id: pe
    }
  }
  Component.onCompleted: qmlEngine.rootObject.refineSelf();
  


}
