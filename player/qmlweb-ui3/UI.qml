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

    /*
    Filter {
       //target: shower
       onFilterFuncChanged: shower.filterFunc = filterFunc;
       // либо оно могло  бы выдавать вообще текст
    }*/


    TextField {
      placeholderText: "фильтр по имени"
      id: tf
      width: 136
      onTextChanged: {
        //console.log(text)
        var t = text;
        var f;
        if (t.length > 0)
          f = function(obj,arg) {
            return arg || obj.ns.name.match(t);
          }
        //console.log("setting ff",f)
        shower.filterfunc = f;
      }
      onAccepted: tf.text=""; // очистка по ентеру
      Button { // очистка по клику
        visible: tf.text && tf.text.length > 0
        anchors.left: parent.right+10
        text: "очистить"
        onClicked: tf.text="";
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

      /*
      Button {
        text: "Имя"
      }      
      Button {
        text: "Выше"
      }
      Button {
        text: "Ниже"
      }

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
  Component.onCompleted: qmlEngine.rootObject.refineSelf();
  
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
    onChanged: shower.newCurrentObjPath = value
    newValue: shower.currentObjPath
  }  

}
