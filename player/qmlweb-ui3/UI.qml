Item {
  id: ui
  property var vzroot
  property var adder_target     // an object where to add new objects
  property var special_objects  // a list of vzPlayer special objects required for some components
  property var stateobj         // a state where UI may save it's state
  
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

    
    Filter {
       id: tf
       onFilterfuncChanged: shower.filterfunc = filterfunc
       // MF-FILTER-FOCUS микрофишка - в фильтре хочется нажать enter и перейти к списку объектов
       onAccepted: {
         shower.focus();
       }
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
  
  
  /*

  */

      
      Button {
        text: "Ссылка"
        onClicked: {
          //if (enabled) shower.currentObj.clone();
          //shower.currentObj.createLinkTo( {param: Object.keys(shower.currentObj.params)[0], from:"", manual: true });
          // implementing R-LINKS-NO-DEFAULT-VALUE
          shower.currentObj.createLinkTo( {from:"", manual: true });
        }
        enabled: (shower.currentObj && (Object.keys(shower.currentObj.params).length > 0 || Object.keys(shower.currentObj.guis).length > 0))
      }

      Button {
        text: "Клон"
        onClicked: {
          if (enabled) shower.currentObj.clone();
        }
        enabled: (shower.currentObj && shower.currentObj != vzroot && shower.currentObj.ismanual())        
      }

      Button {
        text: "Редактор"
        onClicked: ote.perform( shower.currentObj );
        ObjectTextEdit3 {
          id: ote
        }
      }

      Button {
        text: ".."
        onClicked: extraObjActions.visible = !extraObjActions.visible;
      }
  
    }

    Row {
      spacing: 2
      id: extraObjActions
      visible: false
      // а что он тут делает?.. лучше сюда "убрать" вынести


      Button {
        //text: enabled ? "Убрать" : "-"
        text: "Убрать"
        onClicked: {
          if (enabled)  shower.currentObj.remove();
        }
        enabled: (shower.currentObj && shower.currentObj != vzroot && shower.currentObj.ismanual())
      }

      
      Button {
        text: "Имя"
        onClicked: {
          if (enabled) {
            var newname = window.prompt("Имя объекта",shower.currentObj.ns.name);
            if (newname)
                shower.currentObj.ns.parent.ns.renameChild( shower.currentObj.ns.name, newname );
          }
        }
        enabled: (shower.currentObj && shower.currentObj != vzroot && shower.currentObj.ismanual())
      }

      Button {
        text: "Отладка"
        onClicked: {
          var obj = shower.currentObj;
          console.log( obj );
          debugger;                                                                           
        } 
      }      

/*
      Button {
        text: "Выше"
      }
      Button {
        text: "Ниже"
      }
*/      
      /*
      Button {
        text: "Перенос"
      }
      */
    }
    
    // feature: R-GUI-TREE
    Row {
      Button {
        text: "Добавить элемент"
        width: 160
        visible: shower.currentObj && getto( shower.currentObj ).guiAddItems
        onClicked: {
          add_elem_dlg.cats_str = getto( shower.currentObj ).guiAddItemsCrit || ""
          add_elem_dlg.open();
        }
        function getto( obj ) {
          var t = vzroot.vz.getObjType( obj );
          var o = vzroot.vz.getTypeOptions( t );
          return o;
        }

      }
      AddItemDialog {
        id: add_elem_dlg
        target: shower.currentObj
        onAdded: {
          adder.added( obj );
          add_elem_dlg.close();
        }        
      }

    }

    } // column
    
    Text {
      text: "Параметры: " + pe.count
      //visible: pe.count >0
    }
  
    ParamEdit {
      vzroot: ui.vzroot
      id: pe
    }
  }
  // Component.onCompleted: .refineSelf();
  
  //////////////// state
  ViewzavrParam {
    id: vz1
    obj: stateobj
    name: "filter-text"
    onChanged: tf.text = value
    newValue: tf.text
  }
  
  ViewzavrParam {
    id: vz1
    obj: stateobj
    name: "current-obj"
    onChanged: {
      shower.newCurrentObjPath = value
    }
    newValue: shower.currentObjPath
  }  

}
