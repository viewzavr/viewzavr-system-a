Item {
  id: ui
  property var vzroot
  property var adder_target
  property var special_objects

  Packages {
    vzroot: ui.vzroot
    special_objects: ui.special_objects
  }
  
  Export {
    vzroot: ui.vzroot
    special_objects: ui.special_objects
  }

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
  
      Button {
        text: "Выше"
      }
      Button {
        text: "Ниже"
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
