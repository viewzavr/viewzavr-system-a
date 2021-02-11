Button {
  property var vzroot
  property var special_objects

  text: "Пакеты.."
/*  
  anchors.right: parent.right
  anchors.top: parent.top
  anchors.margins: 5
*/  
//  property var tag: "bottom"
 property var tag: "top"

  onClicked: dlg.open();

  SimpleDialog {
    id: dlg
    title: "Подключите эти пакеты и получите новые возможности"
    
    TabView {
    width: parent.width
    
    Tab {
      title: "Выбор"
    
      ParamEdit {
        obj: special_objects ? special_objects.packages : undefined
      }
    
    }
    
    Tab {
      title: "По ссылке"
      
      ParamEdit {
        obj: special_objects ? special_objects.packages_by_url : undefined
      }      
    
    }
    }
  }

}
