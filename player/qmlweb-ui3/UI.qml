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
    }

    Shower {
      vzroot: ui.vzroot
      id: shower
      onCurrentObjChanged: {
        pe.obj = currentObj;
      }
    }
  
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
  
    }
    
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
